import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { ChefHat, Clock, Check, Utensils, AlertCircle, ShoppingBag, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KitchenDashboardProps {
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ onNotify }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'pending' | 'cooking' | 'ready'>('pending');

  useEffect(() => {
    fetchActiveOrders();

    // Poll kitchen orders every 5 seconds to load newly placed orders in real-time
    const interval = setInterval(fetchActiveOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch('/api/order/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Kitchen staff care about non-delivered items
        setOrders(data.filter((o: Order) => o.status !== OrderStatus.DELIVERED));
      }
    } catch (err) {
      console.error('Failed to load kitchen orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = OrderStatus.PLACED;

    if (currentStatus === OrderStatus.PLACED) {
      nextStatus = OrderStatus.ACCEPTED;
    } else if (currentStatus === OrderStatus.ACCEPTED) {
      nextStatus = OrderStatus.COOKING;
    } else if (currentStatus === OrderStatus.COOKING) {
      nextStatus = OrderStatus.READY;
    } else if (currentStatus === OrderStatus.READY) {
      nextStatus = OrderStatus.DELIVERED;
    }

    try {
      const res = await fetch('/api/order/updateStatus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderId,
          status: nextStatus
        })
      });
      if (res.ok) {
        onNotify(`Order #${orderId} status updated to ${nextStatus}!`, 'success');
        fetchActiveOrders();
      } else {
        const data = await res.json();
        onNotify(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      onNotify('Server connection error.', 'error');
    }
  };

  // Divide orders into filter blocks
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PLACED);
  const cookingOrders = orders.filter(o => o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.COOKING);
  const readyOrders = orders.filter(o => o.status === OrderStatus.READY);

  const getFilteredOrders = () => {
    switch (filterTab) {
      case 'cooking': return cookingOrders;
      case 'ready': return readyOrders;
      default: return pendingOrders;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <ChefHat className="h-7 w-7 text-amber-400 stroke-[2]" />
            Indian Kitchen Console
          </h1>
          <p className="mt-1 text-sm text-slate-400">Accept orders, schedule prep, and notify delivery drivers when ready.</p>
        </div>

        <button
          onClick={fetchActiveOrders}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-xl hover:text-white transition-all"
          id="btn-kitchen-refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Orders
        </button>
      </div>

      {/* Metric Counters tabs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Pending Tab */}
        <button
          onClick={() => setFilterTab('pending')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterTab === 'pending'
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700'
          }`}
          id="btn-tab-pending"
        >
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Incoming</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white font-sans">{pendingOrders.length}</span>
            <span className="text-xs font-semibold text-amber-400">New Placed</span>
          </div>
        </button>

        {/* Preparing Tab */}
        <button
          onClick={() => setFilterTab('cooking')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterTab === 'cooking'
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700'
          }`}
          id="btn-tab-cooking"
        >
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">In Prep</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white font-sans">{cookingOrders.length}</span>
            <span className="text-xs font-semibold text-sky-400">Cooking</span>
          </div>
        </button>

        {/* Ready Tab */}
        <button
          onClick={() => setFilterTab('ready')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterTab === 'ready'
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700'
          }`}
          id="btn-tab-ready"
        >
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Dispatch Queue</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white font-sans">{readyOrders.length}</span>
            <span className="text-xs font-semibold text-emerald-400">Ready</span>
          </div>
        </button>
      </div>

      {/* Grid of Kitchen Tickets */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border border-amber-500 border-t-transparent mx-auto"></div>
        </div>
      ) : getFilteredOrders().length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
          <Utensils className="h-10 w-10 text-slate-600 mx-auto mb-4 stroke-[1.5]" />
          <p className="text-white font-medium">No order tickets in this state</p>
          <p className="text-xs text-slate-500 mt-1">Gourmet operations are currently running fully up-to-date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {getFilteredOrders().map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 flex flex-col justify-between"
                id={`kitchen-ticket-${order.id}`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">Order Token</span>
                      <h3 className="text-base font-bold text-white font-mono">#{order.id}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500">Recieved</span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer details for delivery packaging */}
                  <div className="mb-4 text-xs">
                    <div className="text-slate-400 font-semibold">{order.customer_name}</div>
                    <div className="text-slate-500 truncate mt-0.5">{order.customer_phone}</div>
                    {order.customer_address && (
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{order.customer_address}</div>
                    )}
                  </div>

                  {/* Food Items Ticket list */}
                  <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 mb-5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">Item Checklist</div>
                    <ul className="space-y-2">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between text-xs">
                          <span className="text-slate-200">
                            <span className="font-mono font-extrabold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded mr-2">x{item.quantity}</span>
                            {item.food_name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Status Update Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id, order.status)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-slate-950 transition-colors cursor-pointer ${
                      order.status === OrderStatus.PLACED
                        ? 'bg-amber-400 hover:bg-amber-300'
                        : order.status === OrderStatus.ACCEPTED
                        ? 'bg-sky-400 hover:bg-sky-300'
                        : order.status === OrderStatus.COOKING
                        ? 'bg-emerald-400 hover:bg-emerald-300'
                        : 'bg-indigo-400 hover:bg-indigo-300 text-white'
                    }`}
                    id={`btn-kitchen-action-${order.id}`}
                  >
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    {order.status === OrderStatus.PLACED && 'Accept Order'}
                    {order.status === OrderStatus.ACCEPTED && 'Start Cooking'}
                    {order.status === OrderStatus.COOKING && 'Mark Prepared'}
                    {order.status === OrderStatus.READY && 'Ship / Dispatch'}
                  </button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
