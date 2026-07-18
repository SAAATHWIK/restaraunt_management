import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MapPin, Phone, User, CreditCard, ChevronLeft, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  setView: (view: string) => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
  setPendingOrder: (order: any) => void;
  setActiveOrder: (order: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  setView, 
  onNotify, 
  setPendingOrder,
  setActiveOrder
}) => {
  const { user, token } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      onNotify('Please complete all delivery details.', 'error');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      items: cartItems.map(item => ({
        menu_id: item.menuItem.id,
        quantity: item.quantity
      })),
      payment_method: paymentMethod === 'Card' ? 'Card' : 'Cash on Delivery',
      customer_name: name,
      customer_phone: phone,
      customer_address: address
    };

    if (paymentMethod === 'Card') {
      // Set the temporary order data so the Payment screen can finish placing it
      setPendingOrder(orderData);
      setIsSubmitting(false);
      setView('Payment');
    } else {
      // Place Cash on Delivery order immediately
      try {
        const res = await fetch('/api/order/place', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (res.ok) {
          clearCart();
          setActiveOrder(data);
          onNotify('Your order has been placed successfully!', 'success');
          setView('TrackOrder');
        } else {
          onNotify(data.error || 'Failed to place order', 'error');
        }
      } catch (err) {
        onNotify('Network error placing order', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      <button
        onClick={() => setView('Cart')}
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white mb-6 cursor-pointer"
        id="btn-checkout-back"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Cart
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Gourmet Checkout</h1>
      <p className="mt-1 text-sm text-slate-400">Complete your shipping and select payment to place your gourmet order.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Contact/Shipping Section */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-sm space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-400" />
            Delivery Details
          </h2>

          {/* Customer Name */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Recipient Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Full Name"
                id="input-chk-name"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="+91 98765 43210"
                id="input-chk-phone"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Delivery Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin className="h-4 w-4 text-slate-500" />
              </div>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Apartment, Street Address, City, Zip"
                id="input-chk-address"
              />
            </div>
          </div>
        </div>

        {/* Payment Selection Box */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-sm space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-amber-400" />
            Payment Method
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Card Payment Card Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Card')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'Card'
                  ? 'border-amber-400 bg-amber-400/5 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
              id="btn-chk-pay-card"
            >
              <CreditCard className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Credit / Debit Card</span>
              <span className="text-[10px] text-slate-500 mt-1">Instant online payment</span>
            </button>

            {/* Cash on Delivery Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Cash')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'Cash'
                  ? 'border-amber-400 bg-amber-400/5 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
              id="btn-chk-pay-cash"
            >
              <MapPin className="h-6 w-6 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</span>
              <span className="text-[10px] text-slate-500 mt-1">Pay when order arrives</span>
            </button>
          </div>
        </div>

        {/* Bottom confirmation box */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Amount</span>
            <span className="text-2xl font-bold text-amber-400 font-sans">₹{cartTotal.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
            id="btn-chk-confirm"
          >
            {paymentMethod === 'Card' ? 'Proceed to Payment' : 'Place Cash Order'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
