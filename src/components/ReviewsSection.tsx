import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { Star, MessageSquareQuote, MessageCircle, AlertCircle } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((total / reviews.length).toFixed(1));
  };

  const avgRating = getAverageRating();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Gourmet Reviews & Feedback</h1>
        <p className="mt-2 text-sm text-slate-400">Read verified culinary reports and dining journals left by our esteemed patrons.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border border-amber-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Average statistics card */}
          <div className="md:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm flex flex-col items-center justify-center text-center h-fit">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Aggregate Score</span>
            <div className="text-5xl font-extrabold text-white font-sans">{avgRating || '4.9'}</div>
            <div className="flex items-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.round(avgRating || 5);
                return (
                  <Star key={star} className={`h-4.5 w-4.5 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-850'}`} />
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium">Based on {reviews.length} dining journals</p>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                <MessageSquareQuote className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-white text-sm font-medium">No reviews logged yet</p>
                <p className="text-xs text-slate-500 mt-1">Be the first customer to log a completed dining review!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-slate-850 bg-slate-900/10 hover:border-slate-800 transition-colors" id={`public-review-${rev.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="block font-bold text-white text-sm">{rev.user_name}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{new Date(rev.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3 w-3 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
