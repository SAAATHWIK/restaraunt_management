import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, MapPin, AlertCircle } from 'lucide-react';

interface RegisterProps {
  setView: (view: string) => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export const Register: React.FC<RegisterProps> = ({ setView, onNotify }) => {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const res = await register(name, email, password, phone, address);
    if (res.success) {
      onNotify('Your gourmet profile has been created successfully!', 'success');
      setView('Home');
    } else {
      setErrorMsg(res.error || 'Registration failed');
      onNotify('Registration failed', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:py-16">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-white">Create Patron Account</h1>
          <p className="text-xs text-slate-400 mt-1">Register today to enjoy premium food tracking and delivery.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/5 border border-rose-500/20 p-3.5 text-xs text-rose-400">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none"
                id="input-reg-name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-600" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none"
                id="input-reg-email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-600" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none"
                id="input-reg-pass"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone (Optional)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-slate-600" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none"
                id="input-reg-phone"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Delivery Address (Optional)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin className="h-4 w-4 text-slate-600" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street Address, Suite, Zip Code"
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none"
                id="input-reg-address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
            id="btn-reg-submit"
          >
            {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => setView('Login')}
            className="font-bold text-amber-400 hover:underline cursor-pointer"
            id="btn-reg-to-login"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
