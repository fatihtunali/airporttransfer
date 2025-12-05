import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, execute } from '@/lib/db';

interface Review {
  id: number;
  booking_id: number;
  customer_name: string;
  supplier_id: number;
  supplier_name: string;
  rating_overall: number;
  rating_punctuality: number | null;
  rating_vehicle: number | null;
  rating_driver: number | null;
  review_text: string | null;
  supplier_response: string | null;
  response_at: string | null;
  created_at: string;
}

interface Booking {
  id: number;
  customer_id: number;
  supplier_id: number;
  status: string;
}

// GET /api/public/reviews - Get reviews for a supplier
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get('supplierId');
  // Ensure integers for MySQL prepared statements
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);

  if (!supplierId) {
    return NextResponse.json(
      { error: 'supplierId is required' },
      { status: 400 }
    );
  }

  const reviews = await query<Review>(
    `SELECT
       r.id,
       r.booking_id,
       CONCAT(LEFT(u.full_name, 1), '***') as customer_name,
       r.supplier_id,
       s.name as supplier_name,
       r.rating_overall,
       r.rating_punctuality,
       r.rating_vehicle,
       r.rating_driver,
       r.review_text,
       r.supplier_response,
       r.response_at,
       r.created_at
     FROM reviews r
     JOIN users u ON u.id = r.customer_id
     JOIN suppliers s ON s.id = r.supplier_id
     WHERE r.supplier_id = ? AND r.is_published = TRUE
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [supplierId, limit, offset]
  );

  // Get aggregate stats
  const stats = await queryOne<{
    total_reviews: number;
    avg_overall: number;
    avg_punctuality: number;
    avg_vehicle: number;
    avg_driver: number;
  }>(
    `SELECT
       COUNT(*) as total_reviews,
       AVG(rating_overall) as avg_overall,
       AVG(rating_punctuality) as avg_punctuality,
       AVG(rating_vehicle) as avg_vehicle,
       AVG(rating_driver) as avg_driver
     FROM reviews
     WHERE supplier_id = ? AND is_published = TRUE`,
    [supplierId]
  );

  return NextResponse.json({
    reviews,
    stats: {
      totalReviews: stats?.total_reviews || 0,
      avgOverall: stats?.avg_overall ? parseFloat(stats.avg_overall.toFixed(1)) : 0,
      avgPunctuality: stats?.avg_punctuality ? parseFloat(stats.avg_punctuality.toFixed(1)) : null,
      avgVehicle: stats?.avg_vehicle ? parseFloat(stats.avg_vehicle.toFixed(1)) : null,
      avgDriver: stats?.avg_driver ? parseFloat(stats.avg_driver.toFixed(1)) : null,
    },
    pagination: {
      limit,
      offset,
      hasMore: reviews.length === limit,
    },
  });
}

// POST /api/public/reviews - Submit a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingCode,
      customerEmail,
      ratingOverall,
      ratingPunctuality,
      ratingVehicle,
      ratingDriver,
      reviewText,
    } = body;

    // Validate required fields
    if (!bookingCode || !customerEmail || !ratingOverall) {
      return NextResponse.json(
        { error: 'bookingCode, customerEmail, and ratingOverall are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (ratingOverall < 1 || ratingOverall > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Find booking and verify customer
    const booking = await queryOne<Booking & { customer_email: string }>(
      `SELECT b.id, b.customer_id, b.supplier_id, b.status, u.email as customer_email
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.public_code = ?`,
      [bookingCode]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.customer_email.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match booking customer' },
        { status: 403 }
      );
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Reviews can only be submitted for completed bookings' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await queryOne(
      'SELECT id FROM reviews WHERE booking_id = ?',
      [booking.id]
    );

    if (existingReview) {
      return NextResponse.json(
        { error: 'A review has already been submitted for this booking' },
        { status: 400 }
      );
    }

    // Get driver ID if assigned
    const ride = await queryOne<{ driver_id: number }>(
      'SELECT driver_id FROM rides WHERE booking_id = ? AND driver_id IS NOT NULL',
      [booking.id]
    );

    // Insert review
    const reviewId = await insert(
      `INSERT INTO reviews (
         booking_id, customer_id, supplier_id, driver_id,
         rating_overall, rating_punctuality, rating_vehicle, rating_driver,
         review_text, is_published
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        booking.id,
        booking.customer_id,
        booking.supplier_id,
        ride?.driver_id || null,
        ratingOverall,
        ratingPunctuality || null,
        ratingVehicle || null,
        ratingDriver || null,
        reviewText || null,
      ]
    );

    // Update supplier rating
    await execute(
      `UPDATE suppliers s
       SET rating_avg = (
         SELECT AVG(rating_overall) FROM reviews WHERE supplier_id = s.id AND is_published = TRUE
       ),
       rating_count = (
         SELECT COUNT(*) FROM reviews WHERE supplier_id = s.id AND is_published = TRUE
       )
       WHERE s.id = ?`,
      [booking.supplier_id]
    );

    // Update driver rating if applicable
    if (ride?.driver_id && ratingDriver) {
      await execute(
        `UPDATE drivers d
         SET rating_avg = (
           SELECT AVG(rating_driver) FROM reviews WHERE driver_id = d.id AND is_published = TRUE AND rating_driver IS NOT NULL
         ),
         rating_count = (
           SELECT COUNT(*) FROM reviews WHERE driver_id = d.id AND is_published = TRUE AND rating_driver IS NOT NULL
         )
         WHERE d.id = ?`,
        [ride.driver_id]
      );
    }

    return NextResponse.json(
      {
        id: reviewId,
        message: 'Thank you for your review!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
