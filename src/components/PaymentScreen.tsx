import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, ChevronLeft, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentScreenProps {
  setView: (view: string) => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
  pendingOrder: any;
  setActiveOrder: (order: any) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  setView,
  onNotify,
  pendingOrder,
  setActiveOrder
}) => {
  const { token } = useAuth();
  const { cartTotal, clearCart } = useCart();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [payStep, setPayStep] = useState<'idle' | 'processing' | 'authorizing' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto formats card number: 4-4-4-4
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  // Auto formats expiry: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      setCardExpiry(val.substring(0, 2) + '/' + val.substring(2));
    } else {
      setCardExpiry(val);
    }
  };

  // Auto formats CVV: 3 digits max
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    setCardCvv(val);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
      setErrorMsg('Please enter complete valid card details.');
      return;
    }

    setErrorMsg('');
    setPayStep('processing');

    // Simulate connecting & authorizing
    setTimeout(() => {
      setPayStep('authorizing');
    }, 1500);

    setTimeout(async () => {
      try {
        // Place the completed Card order on the backend
        const res = await fetch('/api/order/place', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(pendingOrder)
        });
        const data = await res.json();
        if (res.ok) {
          clearCart();
          setActiveOrder(data);
          setPayStep('success');
          onNotify('Card payment authorization completed successfully!', 'success');
          
          setTimeout(() => {
            setView('TrackOrder');
          }, 1800);
        } else {
          setPayStep('idle');
          setErrorMsg(data.error || 'Card authorization declined by gateway.');
          onNotify('Card authorization declined.', 'error');
        }
      } catch (err) {
        setPayStep('idle');
        setErrorMsg('Secure network error. Please try again.');
        onNotify('Gateway network failure.', 'error');
      }
    }, 3200);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6 lg:py-12">
      {payStep === 'idle' && (
        <button
          onClick={() => setView('Checkout')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white mb-6 cursor-pointer"
          id="btn-pay-back"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Details
        </button>
      )}

      {/* Gateway Terminal Box */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/35 p-6 backdrop-blur-md shadow-2xl">
        <AnimatePresence mode="wait">
          {payStep === 'idle' ? (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-white">Payment Terminal</h1>
                  <p className="text-xs text-slate-400">Merchant: Masala Indian Bistro</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              {/* Styled Mock Debit Card Front */}
              <div className="relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-5 border border-slate-700/50 shadow-lg mb-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl"></div>
                <div className="flex items-start justify-between">
                  <div className="font-mono text-[10px] tracking-widest text-slate-400 uppercase font-semibold">Masala Platinum</div>
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <div className="space-y-4">
                  {/* Card number mock projection */}
                  <div className="font-mono text-base sm:text-lg tracking-widest text-white font-medium">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[8px] uppercase font-bold text-slate-500">Cardholder</div>
                      <div className="font-sans text-xs font-semibold text-slate-200 truncate max-w-[150px]">
                        {cardName.toUpperCase() || 'YOUR NAME'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase font-bold text-slate-500">Expires</div>
                      <div className="font-mono text-xs font-semibold text-slate-200">
                        {cardExpiry || 'MM/YY'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/5 border border-rose-500/20 p-3.5 text-xs text-rose-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Billing Form inputs */}
              <form onSubmit={handlePay} className="space-y-4">
                {/* Holder Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none"
                    id="input-card-name"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none font-mono"
                    id="input-card-num"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none font-mono"
                      id="input-card-exp"
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">CVV Code</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={handleCvvChange}
                      placeholder="•••"
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none font-mono"
                      id="input-card-cvv"
                    />
                  </div>
                </div>

                {/* Payment summary button */}
                <button
                  type="submit"
                  className="w-full mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                  id="btn-card-pay-submit"
                >
                  Pay Security ₹{cartTotal.toFixed(2)}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-500">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                PCI-DSS Complaint AES-256 Gateways
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="payment-gateway-animation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              {/* Spinner & Steps */}
              {payStep === 'processing' && (
                <>
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-6"></div>
                  <h3 className="text-lg font-bold text-white font-mono">Securing Line...</h3>
                  <p className="text-xs text-slate-400 mt-1.5">Connecting to secure banking endpoints.</p>
                </>
              )}

              {payStep === 'authorizing' && (
                <>
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-amber-400 border-t-transparent mb-6"></div>
                  <h3 className="text-lg font-bold text-white font-mono">Authorizing Card...</h3>
                  <p className="text-xs text-slate-400 mt-1.5">Checking ledger balances and merchant credentials.</p>
                </>
              )}

              {payStep === 'success' && (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 scale-up animate-pulse">
                    <ShieldCheck className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wide">Approved!</h3>
                  <p className="text-xs text-emerald-400 mt-1.5">Trans. completed successfully. Clearing cart...</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
