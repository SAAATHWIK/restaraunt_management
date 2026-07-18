import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  setView: (view: string) => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export const Login: React.FC<LoginProps> = ({ setView, onNotify }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both credentials.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      onNotify('Welcome back to Gourmet Studio!', 'success');
      setView('Home');
    } else {
      setErrorMsg(res.error || 'Invalid credentials');
      onNotify('Login failed', 'error');
    }
    setIsSubmitting(false);
  };

  // Quick Demo logins helpers
  const handleDemoLogin = async (demoEmail: string, demoPass: string, roleLabel: string) => {
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await login(demoEmail, demoPass);
    if (res.success) {
      onNotify(`Logged in as ${roleLabel}!`, 'success');
      setView('Home');
    } else {
      setErrorMsg(res.error || 'Demo session failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:py-16">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-4">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-white">Patron Authorization</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to Gourmet Studio to manage orders and billing.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/5 border border-rose-500/20 p-3.5 text-xs text-rose-400">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="patron@domain.com"
                className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-700 focus:border-amber-500 focus:outline-none"
                id="input-login-email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Secret Password</label>
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
                id="input-login-pass"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
            id="btn-login-submit"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick Logins panel */}
        <div className="mt-8 pt-6 border-t border-slate-800/60">
          <span className="block text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5">
            Role-based Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('customer@restaurant.com', 'customer123', 'Customer')}
              className="px-2 py-2 text-[10px] font-bold rounded-lg border border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
              id="btn-demo-customer"
            >
              Customer
            </button>
            <button
              onClick={() => handleDemoLogin('kitchen@restaurant.com', 'kitchen123', 'Kitchen Chef')}
              className="px-2 py-2 text-[10px] font-bold rounded-lg border border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
              id="btn-demo-kitchen"
            >
              Kitchen
            </button>
            <button
              onClick={() => handleDemoLogin('admin@restaurant.com', 'admin123', 'Executive Admin')}
              className="px-2 py-2 text-[10px] font-bold rounded-lg border border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
              id="btn-demo-admin"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Register switcher */}
        <div className="mt-6 text-center text-xs text-slate-400">
          New to Gourmet Studio?{' '}
          <button
            onClick={() => setView('Register')}
            className="font-bold text-amber-400 hover:underline cursor-pointer"
            id="btn-login-to-reg"
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  );
};
