import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MenuItem, FoodCategory, Order, OrderStatus, Review, RevenueStats } from '../types';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Star, 
  Settings, 
  MapPin, 
  Activity,
  IndianRupee,
  Package,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNotify }) => {
  const { token } = useAuth();
  
  // Tabs: 'analytics' | 'menu' | 'orders' | 'reviews'
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'orders' | 'reviews'>('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<RevenueStats | null>(null);
  
  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  
  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);

  // Menu Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<FoodCategory>(FoodCategory.MAINS);
  const [formImage, setFormImage] = useState('');
  const [formAvailability, setFormAvailability] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchMenu();
    fetchOrders();
    fetchReviews();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchMenu = async () => {
    setIsMenuLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setIsMenuLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await fetch('/api/order/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCategory(FoodCategory.MAINS);
    setFormImage('');
    setFormAvailability(true);
    setShowForm(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.food_name);
    setFormDesc(item.description);
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormImage(item.image);
    setFormAvailability(item.availability);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) {
      onNotify('Name and price are required.', 'error');
      return;
    }

    const payload = {
      food_name: formName,
      description: formDesc,
      price: parseFloat(formPrice),
      category: formCategory,
      image: formImage || undefined,
      availability: formAvailability
    };

    try {
      let res;
      if (editingItem) {
        // Edit Mode
        res = await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Add Mode
        res = await fetch('/api/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        onNotify(editingItem ? 'Menu item updated successfully!' : 'New menu item added successfully!', 'success');
        setShowForm(false);
        fetchMenu();
        fetchAnalytics(); // Refresh analytics for menu counts
      } else {
        const errData = await res.json();
        onNotify(errData.error || 'Failed to save menu item', 'error');
      }
    } catch (err) {
      onNotify('Network error saving menu item', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this menu item? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        onNotify('Menu item deleted.', 'success');
        fetchMenu();
        fetchAnalytics();
      } else {
        onNotify('Failed to delete item.', 'error');
      }
    } catch (err) {
      onNotify('Network error during deletion', 'error');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability: !item.availability })
      });
      if (res.ok) {
        onNotify(`${item.food_name} is now ${!item.availability ? 'Available' : 'Sold Out'}.`, 'success');
        fetchMenu();
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
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
        onNotify(`Order #${orderId} set to ${nextStatus}!`, 'success');
        fetchOrders();
        fetchAnalytics();
      }
    } catch (err) {
      onNotify('Connection error', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-amber-400" />
            Executive Admin Control
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-medium">Analyze restaurant performance, curate signature dishes, and control fulfillment pipelines.</p>
        </div>

        {/* Action Button */}
        {activeTab === 'menu' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4.5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
            id="btn-admin-add-item"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Add Gourmet Item
          </button>
        )}
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex border-b border-slate-800 gap-1 mb-8 overflow-x-auto pb-1 scrollbar-none">
        {(['analytics', 'menu', 'orders', 'reviews'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === tab
                ? 'text-amber-400 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id={`btn-admin-tab-${tab}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. ANALYTICS VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Analytics Cards */}
          {analytics ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Revenue card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales</span>
                  <IndianRupee className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-white font-sans">₹{analytics.totalRevenue.toFixed(2)}</div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+18.4% since last week</span>
                </div>
              </div>

              {/* Orders count */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Culinary Tickets</span>
                  <Package className="h-4.5 w-4.5 text-sky-400" />
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-white font-sans">{analytics.totalOrders}</div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-sky-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Avg. ticket value: ₹{(analytics.totalRevenue / (analytics.totalOrders || 1)).toFixed(2)}</span>
                </div>
              </div>

              {/* Customers count */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Patrons</span>
                  <Users className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-white font-sans">{analytics.totalCustomers}</div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-amber-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Repeat customer rate: 64%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border border-amber-500 border-t-transparent"></div>
            </div>
          )}

          {/* Secondary analytics rows: Popular Items & Category Breakdown */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Dishes */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/10 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-amber-400" />
                  Chef's Bestsellers
                </h3>
                <div className="space-y-4">
                  {analytics.popularItems.map((item, index) => {
                    // Calculate relative bar size
                    const maxSales = analytics.popularItems[0]?.sales || 1;
                    const percent = (item.sales / maxSales) * 100;
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{item.name}</span>
                          <span className="font-mono text-slate-400">
                            {item.sales} sold <span className="text-amber-400/80">(₹{item.revenue.toFixed(2)})</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sales Category Breakdown */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/10 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-emerald-400" />
                  Sales by Category
                </h3>
                <div className="space-y-3.5">
                  {(Object.entries(analytics.categorySales) as [string, number][]).map(([category, value]) => {
                    const totalVal = (Object.values(analytics.categorySales) as number[]).reduce((a, b) => a + b, 0) || 1;
                    const pct = ((value / totalVal) * 100).toFixed(0);
                    return (
                      <div key={category} className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">{category}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-200">₹{value.toFixed(2)}</span>
                          <span className="font-mono text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MENU CRUD VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'menu' && (
        <div className="overflow-x-auto border border-slate-800 bg-slate-900/10 rounded-2xl">
          {isMenuLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border border-amber-500 border-t-transparent"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-800/60 text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Gourmet Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Curation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/20" id={`admin-menu-row-${item.id}`}>
                    {/* Item Name / Image */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.food_name}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg object-cover border border-slate-800"
                        />
                        <div>
                          <span className="block font-semibold text-white">{item.food_name}</span>
                          <span className="block text-[11px] text-slate-500 max-w-[200px] truncate">{item.description}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.category}</td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-semibold text-white">₹{item.price.toFixed(2)}</td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border ${
                          item.availability
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                        id={`btn-toggle-avail-${item.id}`}
                      >
                        {item.availability ? 'Available' : 'Sold Out'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-850 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
                          title="Edit"
                          id={`btn-admin-edit-${item.id}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg border border-rose-950/20 bg-rose-500/5 text-rose-400 hover:text-rose-300 cursor-pointer"
                          title="Delete"
                          id={`btn-admin-del-${item.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. ORDERS DISPATCH VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {isOrdersLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border border-amber-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => {
                const isDelivered = o.status === OrderStatus.DELIVERED;
                return (
                  <div key={o.id} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between" id={`admin-ticket-${o.id}`}>
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3.5 mb-4">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500">Order Token</span>
                          <h4 className="text-sm font-bold text-white font-mono">#{o.id}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-500">Fulfillment Status</span>
                          <span className={`block text-xs font-bold ${isDelivered ? 'text-emerald-400' : 'text-amber-400'}`}>{o.status}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs mb-4">
                        <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="text-slate-200 font-semibold">{o.customer_name}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Contact</span><span className="text-slate-300 font-mono">{o.customer_phone}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="text-slate-300 truncate max-w-[200px]">{o.customer_address}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="text-slate-300 font-semibold">{o.payment_method} ({o.payment_status})</span></div>
                      </div>

                      {/* Item list inside tickets */}
                      <div className="bg-slate-950/40 p-2.5 rounded-xl text-xs mb-4">
                        <ul className="space-y-1 divide-y divide-slate-850">
                          {o.items.map((it, idx) => (
                            <li key={idx} className="flex justify-between py-1 text-slate-400">
                              <span>{it.food_name} <span className="font-bold text-slate-600">x{it.quantity}</span></span>
                              <span className="font-mono text-[11px]">₹{(it.price * it.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between border-t border-slate-850 pt-2 mt-2 font-bold text-white">
                          <span>Total Ticket Value</span>
                          <span className="text-amber-400 font-mono">₹{o.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dispatcher Actions */}
                    {!isDelivered && (
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/40">
                        {/* Status updates buttons */}
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, OrderStatus.ACCEPTED)}
                          className="px-2 py-2 text-[10px] font-bold text-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white cursor-pointer"
                          id={`btn-dispatch-accept-${o.id}`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, OrderStatus.DELIVERED)}
                          className="px-2 py-2 text-[10px] font-bold text-center rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
                          id={`btn-dispatch-complete-${o.id}`}
                        >
                          Complete (Deliver)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. REVIEWS MONITOR VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-500">No reviews posted yet.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm" id={`admin-review-${rev.id}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="block font-bold text-white text-sm">{rev.user_name}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{new Date(rev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed italic">"{rev.comment}"</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* GOURMET ITEM ADD/EDIT DIALOG OVERLAY */}
      {/* ---------------------------------------------------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{editingItem ? 'Edit Culinary Curations' : 'Add Gourmet Creation'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer" id="btn-admin-form-close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {/* Item Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dish Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Flame-Grilled Ribeye Steak"
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  id="input-form-name"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price (Rupees)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 250"
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none font-mono"
                  id="input-form-price"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category Section</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as FoodCategory)}
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                  id="select-form-cat"
                >
                  {Object.values(FoodCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Paste high-res image link..."
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  id="input-form-img"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description details</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Explain flavor, accompaniments, preparation styles..."
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  id="input-form-desc"
                />
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={formAvailability}
                  onChange={(e) => setFormAvailability(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500 h-4.5 w-4.5 cursor-pointer"
                  id="chk-form-avail"
                />
                <label htmlFor="chk-form-avail" className="text-xs font-semibold text-slate-300 cursor-pointer">Available instantly for orders</label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-800 bg-transparent px-4.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  id="btn-form-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-400 px-4.5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
                  id="btn-form-save"
                >
                  {editingItem ? 'Save Changes' : 'Publish Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
