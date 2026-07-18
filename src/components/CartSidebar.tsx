import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartSidebarProps {
  setView: (view: string) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ setView }) => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      setView('Login');
    } else {
      setView('Checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500 mx-auto mb-6">
          <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
        </div>
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-400">
          Browse our signature menu to add delicious, chef-crafted food to your order.
        </p>
        <button
          onClick={() => setView('Menu')}
          className="mt-8 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-slate-950 bg-amber-400 rounded-xl hover:bg-amber-300 transition-colors cursor-pointer"
          id="btn-cart-browse"
        >
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Indian Gourmet Shopping Cart</h1>
      <p className="mt-1 text-sm text-slate-400">Manage your selected food items and proceed to secure checkout.</p>

      <div className="mt-8 grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
        
        {/* Cart items list */}
        <div className="lg:col-span-7">
          <ul role="list" className="divide-y divide-slate-800/60 border-t border-b border-slate-800/60">
            {cartItems.map((item) => (
              <li key={item.menuItem.id} className="flex py-6" id={`cart-item-${item.menuItem.id}`}>
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-800/60">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.food_name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-white">
                      <h3>{item.menuItem.food_name}</h3>
                      <p className="ml-4 font-mono">₹{(item.menuItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.menuItem.category}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800/80 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        id={`btn-cart-dec-${item.menuItem.id}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        id={`btn-cart-inc-${item.menuItem.id}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-400/80 hover:text-rose-400 transition-colors"
                      id={`btn-cart-del-${item.menuItem.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary sidebar box */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-sm">
            <h2 className="text-base font-bold text-white">Order Summary</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-400">Total Items</dt>
                <dd className="text-sm font-semibold text-white font-mono">{cartCount}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
                <dt className="text-sm text-slate-400">Subtotal</dt>
                <dd className="text-sm font-semibold text-white font-mono">₹{cartTotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-400">Delivery Fee</dt>
                <dd className="text-xs font-semibold text-emerald-400">FREE</dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <dt className="text-base font-bold text-white">Estimated Total</dt>
                <dd className="text-base font-bold text-amber-400 font-mono">₹{cartTotal.toFixed(2)}</dd>
              </div>
            </dl>

            <button
              onClick={handleCheckoutClick}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/10 hover:bg-amber-300 transition-colors cursor-pointer"
              id="btn-cart-checkout"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Secure 256-bit SSL encrypted connection
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
