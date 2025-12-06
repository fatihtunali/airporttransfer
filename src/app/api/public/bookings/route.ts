import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, transaction } from '@/lib/db';
import { sendBookingConfirmationEmail, sendSupplierNewBookingEmail } from '@/lib/email';
import { generateBookingCode } from '@/lib/booking-codes';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';
import { BookingWebhooks } from '@/lib/webhooks';

// Minimum hours before pickup for booking (in GMT)
const MIN_BOOKING_HOURS = 8;

type BookingChannel = 'B2C' | 'B2B' | 'AGENCY_API';
type VehicleType = 'SEDAN' | 'VAN' | 'MINIBUS' | 'BUS' | 'VIP';

interface LeadPassengerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CreateBookingRequest {
  // Option from search
  optionCode?: string;

  // Route details
  airportId: number;
  zoneId: number;
  direction?: string;
  pickupTime: string;
  paxAdults: number;
  vehicleType: VehicleType;
  currency: string;

  // Passenger details
  leadPassenger: LeadPassengerInput;

  // Additional details
  flightNumber?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  specialRequests?: string;

  // Payment method
  paymentMethod?: 'PAY_LATER' | 'CARD' | 'BANK_TRANSFER';

  // Promo code
  promoCode?: string;

  // Legacy support
  channel?: BookingChannel;
  mainPassenger?: {
    fullName: string;
    phone: string;
    email?: string;
  };
}

interface PromoCodeRow {
  id: number;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  currency: string;
  min_booking_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
}

// Note: Using generateBookingCode from @/lib/booking-codes for collision-safe codes

// POST /api/public/bookings - Create a new booking
export async function POST(request: NextRequest) {
  // Apply rate limiting (stricter for booking creation)
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.BOOKING);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body: CreateBookingRequest = await request.json();

    // Support both new and legacy formats
    const leadPassenger = body.leadPassenger || (body.mainPassenger ? {
      firstName: body.mainPassenger.fullName.split(' ')[0],
      lastName: body.mainPassenger.fullName.split(' ').slice(1).join(' ') || '',
      email: body.mainPassenger.email || '',
      phone: body.mainPassenger.phone,
    } : null);

    // Validate required fields
    if (!leadPassenger?.firstName || !leadPassenger?.lastName || !leadPassenger?.phone) {
      return NextResponse.json(
        { error: 'Missing required passenger details: firstName, lastName, phone' },
        { status: 400 }
      );
    }

    if (!body.airportId || !body.zoneId || !body.pickupTime || !body.vehicleType) {
      return NextResponse.json(
        { error: 'Missing required booking details: airportId, zoneId, pickupTime, vehicleType' },
        { status: 400 }
      );
    }

    // Validate minimum booking time (8 hours in advance, GMT)
    const pickupDateTime = new Date(body.pickupTime);
    const nowGMT = new Date();
    const minBookingTime = new Date(nowGMT.getTime() + MIN_BOOKING_HOURS * 60 * 60 * 1000);

    if (pickupDateTime < minBookingTime) {
      return NextResponse.json(
        {
          error: `Bookings must be made at least ${MIN_BOOKING_HOURS} hours in advance. The earliest available pickup time is ${minBookingTime.toISOString()}.`
        },
        { status: 400 }
      );
    }

    // Find a matching tariff for this route and vehicle type
    const tariff = await queryOne<{
      id: number;
      supplier_id: number;
      route_id: number;
      vehicle_type: VehicleType;
      base_price: number;
      price_per_pax: number | null;
      currency: string;
      commission_rate: number;
    }>(
      `SELECT t.id, t.supplier_id, t.route_id, t.vehicle_type,
              t.base_price, t.price_per_pax, t.currency,
              s.commission_rate
       FROM tariffs t
       INNER JOIN routes r ON r.id = t.route_id
       INNER JOIN suppliers s ON s.id = t.supplier_id
       WHERE r.airport_id = ?
         AND r.zone_id = ?
         AND t.vehicle_type = ?
         AND t.is_active = TRUE
         AND r.is_active = TRUE
         AND s.is_active = TRUE
       LIMIT 1`,
      [body.airportId, body.zoneId, body.vehicleType]
    );

    if (!tariff) {
      return NextResponse.json(
        { error: 'No available tariff for this route and vehicle type' },
        { status: 400 }
      );
    }

    // Calculate total price
    const paxAdults = body.paxAdults || 1;
    let totalPrice = Number(tariff.base_price);
    if (tariff.price_per_pax && paxAdults > 1) {
      totalPrice += Number(tariff.price_per_pax) * (paxAdults - 1);
    }

    const originalPrice = totalPrice;
    let discountAmount = 0;
    let appliedPromoCode: PromoCodeRow | null = null;

    // Validate and apply promo code
    if (body.promoCode) {
      const promoCode = await queryOne<PromoCodeRow>(
        `SELECT id, code, discount_type, discount_value, currency, min_booking_amount,
                max_discount_amount, usage_limit, usage_count, per_user_limit
         FROM promo_codes
         WHERE code = ?
         AND is_active = TRUE
         AND (valid_from IS NULL OR valid_from <= NOW())
         AND (valid_until IS NULL OR valid_until >= NOW())`,
        [body.promoCode.toUpperCase()]
      );

      if (promoCode) {
        // Check usage limits
        const withinUsageLimit = promoCode.usage_limit === null || promoCode.usage_count < promoCode.usage_limit;
        const withinMinAmount = totalPrice >= Number(promoCode.min_booking_amount);

        // Check per-user limit
        let withinUserLimit = true;
        if (leadPassenger.email && promoCode.per_user_limit > 0) {
          const userUsage = await queryOne<{ count: number }>(
            `SELECT COUNT(*) as count FROM promo_code_usage
             WHERE promo_code_id = ? AND customer_email = ?`,
            [promoCode.id, leadPassenger.email.toLowerCase()]
          );
          withinUserLimit = !userUsage || userUsage.count < promoCode.per_user_limit;
        }

        if (withinUsageLimit && withinMinAmount && withinUserLimit) {
          // Calculate discount
          if (promoCode.discount_type === 'PERCENTAGE') {
            discountAmount = (totalPrice * Number(promoCode.discount_value)) / 100;
          } else {
            discountAmount = Number(promoCode.discount_value);
          }

          // Apply max discount cap
          if (promoCode.max_discount_amount && discountAmount > Number(promoCode.max_discount_amount)) {
            discountAmount = Number(promoCode.max_discount_amount);
          }

          // Don't exceed total price
          if (discountAmount > totalPrice) {
            discountAmount = totalPrice;
          }

          discountAmount = Math.round(discountAmount * 100) / 100;
          totalPrice = Math.round((totalPrice - discountAmount) * 100) / 100;
          appliedPromoCode = promoCode;
        }
      }
    }

    // Calculate commission (on discounted price)
    const commission = totalPrice * (Number(tariff.commission_rate) / 100);
    const supplierPayout = totalPrice - commission;

    // Generate unique public code (collision-safe)
    const publicCode = await generateBookingCode();

    const direction = body.direction || 'FROM_AIRPORT';
    const currency = body.currency || tariff.currency || 'EUR';
    const channel = body.channel || 'B2C';

    // Create booking with transaction
    const bookingId = await transaction(async (conn) => {
      // Insert booking
      const paymentMethod = body.paymentMethod || 'PAY_LATER';
      const [bookingResult] = await conn.execute(
        `INSERT INTO bookings (
          public_code, supplier_id, channel,
          airport_id, zone_id, direction,
          pickup_address, dropoff_address,
          flight_number,
          pickup_datetime, pax_adults, pax_children,
          vehicle_type, currency, base_price,
          total_price, commission, supplier_payout,
          promo_code_id, discount_amount, original_price,
          status, payment_status, payment_method, customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 'UNPAID', ?, ?)`,
        [
          publicCode,
          tariff.supplier_id,
          channel,
          body.airportId,
          body.zoneId,
          direction,
          body.pickupAddress || null,
          body.dropoffAddress || null,
          body.flightNumber || null,
          body.pickupTime,
          paxAdults,
          0, // pax_children
          body.vehicleType,
          currency,
          tariff.base_price,
          totalPrice,
          commission,
          supplierPayout,
          appliedPromoCode?.id || null,
          discountAmount,
          originalPrice,
          paymentMethod,
          body.specialRequests || null,
        ]
      );

      const newBookingId = (bookingResult as unknown as { insertId: number }).insertId;

      // Insert main passenger
      const fullName = `${leadPassenger.firstName} ${leadPassenger.lastName}`.trim();
      await conn.execute(
        `INSERT INTO booking_passengers (booking_id, full_name, phone, email, is_lead)
         VALUES (?, ?, ?, ?, TRUE)`,
        [newBookingId, fullName, leadPassenger.phone, leadPassenger.email || null]
      );

      // Create ride record (pending assignment)
      await conn.execute(
        `INSERT INTO rides (booking_id, supplier_id, status)
         VALUES (?, ?, 'PENDING_ASSIGN')`,
        [newBookingId, tariff.supplier_id]
      );

      // Create supplier payout record (pending)
      await conn.execute(
        `INSERT INTO supplier_payouts (supplier_id, booking_id, amount, currency, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [tariff.supplier_id, newBookingId, supplierPayout, currency]
      );

      // Track promo code usage
      if (appliedPromoCode) {
        await conn.execute(
          `INSERT INTO promo_code_usage (promo_code_id, booking_id, customer_email, discount_amount)
           VALUES (?, ?, ?, ?)`,
          [appliedPromoCode.id, newBookingId, leadPassenger.email?.toLowerCase() || '', discountAmount]
        );

        // Increment usage count
        await conn.execute(
          `UPDATE promo_codes SET usage_count = usage_count + 1 WHERE id = ?`,
          [appliedPromoCode.id]
        );
      }

      return newBookingId;
    });

    // Fetch created booking with location details for email
    const booking = await queryOne<{
      id: number;
      public_code: string;
      status: string;
      payment_status: string;
      total_price: number;
      currency: string;
      pickup_datetime: string;
      pickup_address: string;
      dropoff_address: string;
      vehicle_type: string;
      pax_adults: number;
      flight_number: string | null;
      customer_notes: string | null;
      airport_name: string;
      zone_name: string;
      direction: string;
    }>(
      `SELECT b.id, b.public_code, b.status, b.payment_status, b.total_price, b.currency,
              b.pickup_datetime, b.pickup_address, b.dropoff_address, b.vehicle_type,
              b.pax_adults, b.flight_number, b.customer_notes, b.direction,
              a.name as airport_name, z.name as zone_name
       FROM bookings b
       LEFT JOIN airports a ON a.id = b.airport_id
       LEFT JOIN zones z ON z.id = b.zone_id
       WHERE b.id = ?`,
      [bookingId]
    );

    // Get supplier details for notification
    const supplier = await queryOne<{
      id: number;
      name: string;
      contact_email: string;
    }>(
      'SELECT id, name, contact_email FROM suppliers WHERE id = ?',
      [tariff.supplier_id]
    );

    const fullName = `${leadPassenger.firstName} ${leadPassenger.lastName}`.trim();
    const pickupLocation = booking!.direction === 'FROM_AIRPORT'
      ? booking!.airport_name
      : (booking!.pickup_address || booking!.zone_name);
    const dropoffLocation = booking!.direction === 'FROM_AIRPORT'
      ? (booking!.dropoff_address || booking!.zone_name)
      : booking!.airport_name;

    // Send booking confirmation email to customer (async, don't block response)
    if (leadPassenger.email) {
      sendBookingConfirmationEmail({
        publicCode: booking!.public_code,
        customerName: fullName,
        customerEmail: leadPassenger.email,
        pickupDatetime: booking!.pickup_datetime,
        pickupAddress: pickupLocation,
        dropoffAddress: dropoffLocation,
        vehicleType: booking!.vehicle_type,
        passengers: booking!.pax_adults,
        flightNumber: booking!.flight_number || undefined,
        totalPrice: Number(booking!.total_price),
        currency: booking!.currency,
        paymentStatus: booking!.payment_status,
        specialRequests: booking!.customer_notes || undefined,
      }).catch((err) => {
        console.error('Failed to send booking confirmation email:', err);
      });
    }

    // Send new booking notification to supplier (async, don't block response)
    if (supplier?.contact_email) {
      sendSupplierNewBookingEmail({
        publicCode: booking!.public_code,
        supplierName: supplier.name,
        supplierEmail: supplier.contact_email,
        customerName: fullName,
        customerPhone: leadPassenger.phone,
        pickupDatetime: booking!.pickup_datetime,
        pickupAddress: pickupLocation,
        dropoffAddress: dropoffLocation,
        vehicleType: booking!.vehicle_type,
        passengers: booking!.pax_adults,
        flightNumber: booking!.flight_number || undefined,
        totalPrice: Number(booking!.total_price),
        supplierPayout: supplierPayout,
        currency: booking!.currency,
        specialRequests: booking!.customer_notes || undefined,
      }).catch((err) => {
        console.error('Failed to send supplier notification email:', err);
      });
    }

    // Emit webhook event for booking creation
    BookingWebhooks.created({
      publicCode: booking!.public_code,
      status: booking!.status,
      customerName: fullName,
      customerEmail: leadPassenger.email,
      customerPhone: leadPassenger.phone,
      pickupDatetime: booking!.pickup_datetime,
      pickupAddress: pickupLocation,
      dropoffAddress: dropoffLocation,
      vehicleType: booking!.vehicle_type,
      passengers: booking!.pax_adults,
      flightNumber: booking!.flight_number,
      totalPrice: Number(booking!.total_price),
      currency: booking!.currency,
    }, tariff.supplier_id).catch((err) => {
      console.error('Failed to emit booking webhook:', err);
    });

    return NextResponse.json(
      {
        bookingId: booking!.id,
        publicCode: booking!.public_code,
        status: booking!.status,
        paymentStatus: booking!.payment_status,
        totalPrice: Number(booking!.total_price),
        currency: booking!.currency,
        message: 'Booking created successfully',
      },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    );
  }
}
