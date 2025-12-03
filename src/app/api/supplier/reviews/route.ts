import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier } from '@/lib/supplier-auth';
import { query } from '@/lib/db';

interface SupplierReview {
  id: number;
  booking_id: number;
  public_code: string;
  customer_name: string;
  rating_overall: number;
  rating_punctuality: number | null;
  rating_vehicle: number | null;
  rating_driver: number | null;
  review_text: string | null;
  supplier_response: string | null;
  response_at: string | null;
  is_published: boolean;
  created_at: string;
}

// GET /api/supplier/reviews - List reviews for supplier
export async function GET(request: NextRequest) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;
  const { searchParams } = new URL(request.url);
  const responded = searchParams.get('responded'); // 'true', 'false', or null for all

  let responseFilter = '';
  if (responded === 'true') {
    responseFilter = 'AND r.supplier_response IS NOT NULL';
  } else if (responded === 'false') {
    responseFilter = 'AND r.supplier_response IS NULL';
  }

  const reviews = await query<SupplierReview>(
    `SELECT
       r.id,
       r.booking_id,
       b.public_code,
       CONCAT(LEFT(u.full_name, 1), '***') as customer_name,
       r.rating_overall,
       r.rating_punctuality,
       r.rating_vehicle,
       r.rating_driver,
       r.review_text,
       r.supplier_response,
       r.response_at,
       r.is_published,
       r.created_at
     FROM reviews r
     JOIN bookings b ON b.id = r.booking_id
     JOIN users u ON u.id = r.customer_id
     WHERE r.supplier_id = ? ${responseFilter}
     ORDER BY r.created_at DESC`,
    [supplierId]
  );

  // Get stats
  const pendingResponse = reviews.filter(r => !r.supplier_response).length;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating_overall, 0) / reviews.length
    : 0;

  return NextResponse.json({
    reviews,
    stats: {
      totalReviews: reviews.length,
      pendingResponse,
      avgRating: parseFloat(avgRating.toFixed(1)),
    },
  });
}
