'use client';

import { useState, useEffect } from 'react';
import {
  FaStar,
  FaReply,
  FaSpinner,
  FaTimes,
  FaRegStar,
} from 'react-icons/fa';

interface Review {
  id: number;
  bookingCode: string;
  customerName: string;
  ratingOverall: number;
  ratingPunctuality: number | null;
  ratingVehicle: number | null;
  ratingDriver: number | null;
  reviewText: string | null;
  supplierResponse: string | null;
  responseAt: string | null;
  createdAt: string;
}

interface ReviewStats {
  totalReviews: number;
  pendingResponse: number;
  avgRating: number;
}

export default function SupplierReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'pending') params.set('responded', 'false');

      const res = await fetch(`/api/supplier/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reviewId: number) => {
    if (!responseText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/supplier/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText }),
      });

      if (res.ok) {
        setRespondingTo(null);
        setResponseText('');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <FaStar className="w-4 h-4 text-yellow-400" />
            ) : (
              <FaRegStar className="w-4 h-4 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">Customer feedback and ratings</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalReviews}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold text-gray-900">
                {stats.avgRating.toFixed(1)}
              </span>
              <FaStar className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Awaiting Response</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.pendingResponse}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-sky-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-sky-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Response {stats?.pendingResponse ? `(${stats.pendingResponse})` : ''}
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'pending' ? 'No reviews pending response' : 'No reviews yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">
                        {review.customerName}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{review.bookingCode}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Ratings */}
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Overall:</span>
                        {renderStars(review.ratingOverall)}
                      </div>
                      {review.ratingPunctuality && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Punctuality:</span>
                          {renderStars(review.ratingPunctuality)}
                        </div>
                      )}
                      {review.ratingVehicle && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Vehicle:</span>
                          {renderStars(review.ratingVehicle)}
                        </div>
                      )}
                      {review.ratingDriver && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Driver:</span>
                          {renderStars(review.ratingDriver)}
                        </div>
                      )}
                    </div>

                    {/* Review Text */}
                    {review.reviewText && (
                      <p className="text-gray-700 mb-4">"{review.reviewText}"</p>
                    )}

                    {/* Supplier Response */}
                    {review.supplierResponse ? (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Your Response ({formatDate(review.responseAt!)}):
                        </p>
                        <p className="text-gray-600">{review.supplierResponse}</p>
                      </div>
                    ) : respondingTo === review.id ? (
                      <div className="mt-4">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your response..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                          maxLength={1000}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {responseText.length}/1000
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRespond(review.id)}
                              disabled={submitting || !responseText.trim()}
                              className="px-4 py-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {submitting ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                'Submit'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(review.id)}
                        className="flex items-center gap-2 text-sky-600 hover:text-sky-700 mt-2"
                      >
                        <FaReply /> Respond to Review
                      </button>
                    )}
                  </div>

                  {/* Large Rating Display */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-sky-100 rounded-xl flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-sky-600">
                        {review.ratingOverall}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">out of 5</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
