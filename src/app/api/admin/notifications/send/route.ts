import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { sendBookingNotification, sendSms, sendWhatsApp } from '@/lib/notifications';

// POST /api/admin/notifications/send - Send notification for a booking
export async function POST(request: NextRequest) {
  try {
    const { bookingCode, notificationType, channel, customMessage } = await request.json();

    if (!bookingCode) {
      return NextResponse.json(
        { error: 'Booking code is required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await queryOne<{
      id: number;
      public_code: string;
      pickup_datetime: string;
      pickup_address: string;
      dropoff_address: string;
      vehicle_type: string;
      total_price: number;
      currency: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      driver_name: string | null;
      driver_phone: string | null;
      vehicle_plate: string | null;
    }>(
      `SELECT
        b.id,
        b.public_code,
        b.pickup_datetime,
        b.pickup_address,
        b.dropoff_address,
        b.vehicle_type,
        b.total_price,
        b.currency,
        bp.full_name as customer_name,
        bp.phone as customer_phone,
        bp.email as customer_email,
        d.full_name as driver_name,
        d.phone as driver_phone,
        d.vehicle_plate
      FROM bookings b
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
      LEFT JOIN rides r ON r.booking_id = b.id
      LEFT JOIN drivers d ON d.id = r.driver_id
      WHERE b.public_code = ?`,
      [bookingCode]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.customer_phone) {
      return NextResponse.json(
        { error: 'No customer phone number found' },
        { status: 400 }
      );
    }

    let result;
    const selectedChannel = channel || 'sms';

    if (customMessage) {
      // Send custom message
      if (selectedChannel === 'whatsapp') {
        result = await sendWhatsApp({
          to: booking.customer_phone,
          message: customMessage
        });
      } else {
        result = await sendSms({
          to: booking.customer_phone,
          message: customMessage
        });
      }
    } else if (notificationType) {
      // Send templated notification
      const templateData = {
        bookingConfirmed: {
          bookingCode: booking.public_code,
          pickupTime: new Date(booking.pickup_datetime).toLocaleString(),
          pickupLocation: booking.pickup_address || 'Airport',
          vehicleType: booking.vehicle_type
        },
        driverAssigned: {
          bookingCode: booking.public_code,
          driverName: booking.driver_name || 'Your Driver',
          driverPhone: booking.driver_phone || '',
          vehiclePlate: booking.vehicle_plate || ''
        },
        paymentReminder: {
          bookingCode: booking.public_code,
          amount: booking.total_price.toString(),
          currency: booking.currency,
          paymentLink: `https://airporttransferportal.com/pay/${booking.public_code}`
        }
      };

      const data = templateData[notificationType as keyof typeof templateData];

      if (!data) {
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
      }

      result = await sendBookingNotification(
        notificationType as keyof typeof templateData,
        data as Parameters<typeof sendBookingNotification>[1],
        {
          phone: booking.customer_phone,
          preferWhatsApp: selectedChannel === 'whatsapp'
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Either notificationType or customMessage is required' },
        { status: 400 }
      );
    }

    // Log notification
    await query(
      `INSERT INTO notifications (
        recipient_type, recipient_id, recipient_phone,
        type, title, message, booking_id, channel, status, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        'CUSTOMER',
        null,
        booking.customer_phone,
        notificationType || 'GENERAL',
        notificationType || 'Custom Message',
        customMessage || notificationType,
        booking.id,
        selectedChannel.toUpperCase(),
        result.success ? 'SENT' : 'FAILED'
      ]
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        channel: selectedChannel
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
