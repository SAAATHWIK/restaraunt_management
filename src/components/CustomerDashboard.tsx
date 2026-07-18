import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus, Review } from '../types';
import { 
  ClipboardList, 
  Clock, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  MessageSquare, 
  Star,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerDashboardProps {
  onNotify: (msg: string, type: 'success' | 'error') => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNotify,
  activeOrder,
  setActiveOrder
}) => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review states for completed orders
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedOrderId, setReviewedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    // Set up active order updates polling (every 6 seconds) to observe changes from Kitchen or Admin
    const interval = setInterval(() => {
      if (activeOrder) {
        pollActiveOrderStatus();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/order/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        
        // If there is an active order in our history but not in global React state, let's load the latest incomplete one
        if (!activeOrder && data.length > 0) {
          const latestActive = data.find((o: Order) => o.status !== OrderStatus.DELIVERED);
          if (latestActive) {
            setActiveOrder(latestActive);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const pollActiveOrderStatus = async () => {
    if (!activeOrder) return;
    try {
      const res = await fetch(`/api/order/status/${activeOrder.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated.status !== activeOrder.status) {
          setActiveOrder(updated);
          onNotify(`Your order status is now: ${updated.status}!`, 'success');
          // Refresh overall history list too
          fetchOrders();
        }
      }
    } catch (err) {
      console.error('Failed to poll order status', err);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment
        })
      });
      if (res.ok) {
        onNotify('Thank you for your rating and gourmet feedback!', 'success');
        setReviewComment('');
        setReviewRating(5);
        setReviewedOrderId(null);
      } else {
        onNotify('Failed to post review.', 'error');
      }
    } catch (err) {
      onNotify('Network error posting review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper to resolve order status indexing
  const getStatusIndex = (status: OrderStatus) => {
    const statuses = [
      OrderStatus.PLACED,
      OrderStatus.ACCEPTED,
      OrderStatus.COOKING,
      OrderStatus.READY,
      OrderStatus.DELIVERED
    ];
    return statuses.indexOf(status);
  };

  const trackerStages = [
    { label: 'Placed', desc: 'Awaiting restaurant approval' },
    { label: 'Accepted', desc: 'Order approved by chef' },
    { label: 'Cooking', desc: 'Being prepared with premium ingredients' },
    { label: 'Ready', desc: 'Packaged and waiting for pickup/courier' },
    { label: 'Delivered', desc: 'Arrived safely. Bon Appétit!' }
  ];

  const activeIndex = activeOrder ? getStatusIndex(activeOrder.status) : -1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Customer Order Room</h1>
          <p className="mt-1 text-sm text-slate-400">Track current preparations or review previous culinary experiences.</p>
        </div>

        <button
          onClick={() => {
            fetchOrders();
            if (activeOrder) pollActiveOrderStatus();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="Manual Sync State"
          id="btn-customer-sync"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Active Order Tracking Stage (Left & Middle Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeOrder ? (
              <motion.div
                key={activeOrder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm shadow-xl"
                id={`active-tracker-${activeOrder.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-5 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase bg-amber-400/5 border border-amber-400/10 px-2 py-0.5 rounded">Active Preparation</span>
                    <h2 className="text-lg font-bold text-white mt-1.5 font-mono">Order #{activeOrder.id}</h2>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-slate-500">Estimate Delivery</span>
                    <span className="text-sm font-semibold text-white">25–35 Mins</span>
                  </div>
                </div>

                {/* Timeline Tracking Stage */}
                <div className="relative py-4">
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-800"></div>

                  <div className="space-y-8">
                    {trackerStages.map((stage, idx) => {
                      const isCompleted = idx <= activeIndex;
                      const isActive = idx === activeIndex;

                      return (
                        <div key={stage.label} className="relative flex items-start pl-10" id={`tracker-step-${stage.label.toLowerCase()}`}>
                          {/* Circle node pointer */}
                          <div className={`absolute left-2 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                            isActive 
                              ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-400/40 ring-4 ring-amber-500/10 scale-110' 
                              : isCompleted 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : 'bg-slate-950 border-slate-800'
                          }`}>
                            {isCompleted && !isActive && <div className="h-1 w-1 rounded-full bg-slate-950"></div>}
                          </div>

                          <div className="flex-1">
                            <h3 className={`text-sm font-bold transition-colors ${
                              isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                            }`}>
                              {stage.label}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                              {stage.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking item details */}
                <div className="mt-8 border-t border-slate-800/60 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Items Summary</h4>
                  <ul className="divide-y divide-slate-800/40">
                    {activeOrder.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between py-2 text-sm">
                        <span className="text-slate-300">
                          {item.food_name} <span className="font-mono text-slate-500 text-xs">x{item.quantity}</span>
                        </span>
                        <span className="font-mono text-slate-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between border-t border-slate-800/60 pt-4 mt-4">
                    <span className="text-sm font-semibold text-slate-300">Total Paid via {activeOrder.payment_method}</span>
                    <span className="font-mono text-base font-bold text-amber-400">₹{activeOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
                <Clock className="h-10 w-10 text-slate-600 mx-auto mb-4 stroke-[1.5]" />
                <p className="text-white font-medium">No active gourmet orders</p>
                <p className="text-xs text-slate-500 mt-1">You do not have any active preparations right now.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* History & Review Sidebar (Right Column) */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <ClipboardList className="h-4.5 w-4.5 text-amber-400" />
              Order History
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border border-amber-500 border-t-transparent"></div>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No previous logs found.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {orders.map((o) => {
                  const isDelivered = o.status === OrderStatus.DELIVERED;
                  return (
                    <div 
                      key={o.id}
                      onClick={() => !isDelivered && setActiveOrder(o)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        activeOrder?.id === o.id
                          ? 'border-amber-400 bg-amber-400/5'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700/60 cursor-pointer'
                      }`}
                      id={`hist-order-${o.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">#{o.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                          isDelivered 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span>{new Date(o.date).toLocaleDateString()}</span>
                        <span className="font-mono font-bold text-white">₹{o.total.toFixed(2)}</span>
                      </div>

                      {isDelivered && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewedOrderId(o.id);
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                            id={`btn-review-trigger-${o.id}`}
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                            Leave Review
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal Dialog Overlay */}
      {reviewedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-400" />
              Write Gourmet Review
            </h3>
            <p className="text-xs text-slate-400 mt-1">Rate your experience for Order #{reviewedOrderId}.</p>

            <form onSubmit={handlePostReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rating (1-5 Stars)</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      id={`star-btn-${star}`}
                    >
                      <Star className={`h-6 w-6 ${
                        star <= reviewRating 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-slate-700'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gourmet Comment</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about the flavor, preparation, and presentation..."
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                  id="input-review-comment"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewedOrderId(null)}
                  className="rounded-xl border border-slate-800 bg-transparent px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  id="btn-review-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
                  id="btn-review-submit"
                >
                  {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
