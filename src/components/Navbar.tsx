import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Utensils, 
  ChefHat, 
  User, 
  LogOut, 
  ClipboardList, 
  ShieldCheck, 
  Star,
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount, cartTotal } = useCart();

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case UserRole.KITCHEN:
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getRoleBadgeLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Admin';
      case UserRole.KITCHEN: return 'Kitchen Chef';
      default: return 'Customer';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <button 
          onClick={() => setView('Home')} 
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          id="btn-nav-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20">
            <Utensils className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="block font-sans text-lg font-bold tracking-tight text-white leading-tight">
              Masala Studio
            </span>
            <span className="block font-mono text-[10px] tracking-widest text-amber-400 uppercase leading-none">
              Indian Fine Dining
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => setView('Home')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'Home' 
                ? 'text-amber-400 bg-slate-900/50' 
                : 'text-slate-300 hover:text-white hover:bg-slate-900/30'
            }`}
            id="nav-link-home"
          >
            Home
          </button>
          <button
            onClick={() => setView('Menu')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'Menu' 
                ? 'text-amber-400 bg-slate-900/50' 
                : 'text-slate-300 hover:text-white hover:bg-slate-900/30'
            }`}
            id="nav-link-menu"
          >
            Menu
          </button>
          <button
            onClick={() => setView('Reviews')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'Reviews' 
                ? 'text-amber-400 bg-slate-900/50' 
                : 'text-slate-300 hover:text-white hover:bg-slate-900/30'
            }`}
            id="nav-link-reviews"
          >
            Reviews
          </button>

          {/* Role Based Navigation */}
          {isAuthenticated && user?.role === UserRole.ADMIN && (
            <button
              onClick={() => setView('AdminDashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-amber-500/20 transition-colors ${
                currentView === 'AdminDashboard' 
                  ? 'text-amber-400 bg-amber-500/5 border-amber-500/40' 
                  : 'text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/5'
              }`}
              id="nav-link-admin"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </button>
          )}

          {isAuthenticated && user?.role === UserRole.KITCHEN && (
            <button
              onClick={() => setView('KitchenDashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-emerald-500/20 transition-colors ${
                currentView === 'KitchenDashboard' 
                  ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/40' 
                  : 'text-emerald-500/80 hover:text-emerald-400 hover:bg-emerald-500/5'
              }`}
              id="nav-link-kitchen"
            >
              <ChefHat className="h-4 w-4" />
              Kitchen Console
            </button>
          )}

          {isAuthenticated && user?.role === UserRole.CUSTOMER && (
            <button
              onClick={() => setView('CustomerDashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-slate-700/50 transition-colors ${
                currentView === 'CustomerDashboard' 
                  ? 'text-white bg-slate-800' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/30'
              }`}
              id="nav-link-customer-dash"
            >
              <ClipboardList className="h-4 w-4" />
              My Orders
            </button>
          )}
        </nav>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-3">
          
          {/* Cart Icon Button (For non-kitchen, non-admin users or unauth) */}
          {(!isAuthenticated || user?.role === UserRole.CUSTOMER) && (
            <button
              onClick={() => setView('Cart')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition-all hover:border-slate-700 hover:text-white active:scale-95"
              id="btn-nav-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 font-mono text-[10px] font-bold text-slate-950 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-semibold text-white leading-tight">
                  {user?.name}
                </span>
                <span className={`inline-block px-1.5 py-0.5 mt-0.5 rounded font-mono text-[9px] font-semibold tracking-wider uppercase leading-none ${getRoleBadgeColor(user!.role)}`}>
                  {getRoleBadgeLabel(user!.role)}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  setView('Home');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-950/20 bg-rose-500/5 text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                title="Log Out"
                id="btn-nav-logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('Login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                id="btn-nav-login"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </button>
              <button
                onClick={() => setView('Register')}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 active:scale-95 transition-all"
                id="btn-nav-register"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
