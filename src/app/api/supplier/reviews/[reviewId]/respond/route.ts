import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier } from '@/lib/supplier-auth';
import { queryOne, execute } from '@/lib/db';

interface Review {
  id: number;
  supplier_id: number;
  supplier_response: string | null;
}

// POST /api/supplier/reviews/[reviewId]/respond - Respond to a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;
  const { reviewId } = await params;

  try {
    const body = await request.json();
    const { response } = body;

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'Response text is required' },
        { status: 400 }
      );
    }

    if (response.length > 1000) {
      return NextResponse.json(
        { error: 'Response must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Verify review belongs to supplier
    const review = await queryOne<Review>(
      'SELECT id, supplier_id, supplier_response FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.supplier_id !== supplierId) {
      return NextResponse.json(
        { error: 'Access denied. This review does not belong to your company.' },
        { status: 403 }
      );
    }

    if (review.supplier_response) {
      return NextResponse.json(
        { error: 'This review has already been responded to' },
        { status: 400 }
      );
    }

    // Update review with response
    await execute(
      `UPDATE reviews
       SET supplier_response = ?, response_at = NOW()
       WHERE id = ?`,
      [response.trim(), reviewId]
    );

    return NextResponse.json({
      success: true,
      reviewId: parseInt(reviewId),
      message: 'Response submitted successfully',
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}
