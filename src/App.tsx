import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { MenuSection } from './components/MenuSection';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentScreen } from './components/PaymentScreen';
import { CustomerDashboard } from './components/CustomerDashboard';
import { KitchenDashboard } from './components/KitchenDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ReviewsSection } from './components/ReviewsSection';
import { 
  Utensils, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  Instagram,
  Facebook,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, FoodCategory } from './types';

// Main App component containing Providers
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <GourmetOrderingSystem />
      </CartProvider>
    </AuthProvider>
  );
}

// Internal component using Context APIs
function GourmetOrderingSystem() {
  const [currentView, setView] = useState<string>('Home');
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  // Temporary notifications state
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);
  
  // Storage for currently placed orders (during this login session) to support tracking flow
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Pre-configured "Today's Specials" for the Landing Page
  const specials: MenuItem[] = [
    {
      id: 'm3',
      food_name: 'Royal Butter Chicken (Murgh Makhani)',
      description: 'Tender tandoor-grilled chicken tikka simmered in a velvety, rich tomato cream gravy, loaded with butter and dried fenugreek leaves.',
      price: 380,
      category: FoodCategory.MAINS,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60',
      availability: true,
      rating: 4.9
    },
    {
      id: 'm10',
      food_name: 'Tandoori Feast Platter',
      description: 'An ultimate selection of succulent Malai Seekh Kebab, Tandoori Chicken, Fish Tikka, and Paneer Angare served with fresh mint yogurt.',
      price: 490,
      category: FoodCategory.SPECIALS,
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60',
      availability: true,
      rating: 4.9
    },
    {
      id: 'm7',
      food_name: 'Shahi Kesar Rasmalai',
      description: 'Soft, delicate cottage cheese discs poached in sweetened, saffron-infused milk, garnished with pistachios and almond slivers.',
      price: 120,
      category: FoodCategory.DESSERTS,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
      availability: true,
      rating: 4.9
    }
  ];

  const handleSpecialAdd = (item: MenuItem) => {
    addToCart(item, 1);
    addNotification(`${item.food_name} added to your gourmet cart!`, 'success');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification('Welcome to the Gourmet Club! Check your inbox for exclusive tasting invites.', 'success');
    const input = document.getElementById('input-newsletter') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Glsssmorphism Header */}
      <Navbar currentView={currentView} setView={setView} />

      {/* Primary Main Content View Controller */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
          >
            {/* ---------------------------------------------------- */}
            {/* 1. LANDING PAGE VIEW */}
            {/* ---------------------------------------------------- */}
            {currentView === 'Home' && (
              <div className="space-y-16 pb-16">
                
                {/* Hero Banner Section */}
                <div className="relative overflow-hidden bg-slate-900/40 border-b border-slate-900 py-20 sm:py-24 lg:py-32">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950"></div>
                  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="mx-auto max-w-2xl">
                      
                      {/* Premium Accent badge */}
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1.5 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-6 animate-pulse">
                        <Sparkles className="h-3.5 w-3.5" />
                        A Masterclass in Fine Dining
                      </div>

                      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-sans leading-tight">
                        Savor True <span className="text-amber-400 font-serif italic">Artisanal</span> Cuisine
                      </h1>
                      <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
                        Delicately prepared with premium seasonal ingredients, and delivered hot to your doorstep with meticulous tracking.
                      </p>

                      <div className="mt-8 flex items-center justify-center gap-4">
                        <button
                          onClick={() => setView('Menu')}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                          id="btn-hero-order"
                        >
                          Explore Menu
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setView('Reviews')}
                          className="rounded-xl border border-slate-800 bg-slate-950/60 px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                          id="btn-hero-reviews"
                        >
                          Read Journals
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Chef's Specials Showcase */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10">
                    <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">Chef's Signature Selections</h2>
                    <p className="mt-1.5 text-sm text-slate-400">Handcrafted seasonal highlights that define modern haute cuisine.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {specials.map((item) => (
                      <div key={item.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm transition-all hover:border-slate-800" id={`special-card-${item.id}`}>
                        <div className="relative aspect-video w-full overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.food_name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 rounded-md bg-slate-950/70 backdrop-blur-md px-2 py-1 text-[9px] font-bold tracking-widest text-amber-400 uppercase">
                            TODAY'S SPECIAL
                          </span>
                        </div>
                        <div className="p-5 flex flex-col flex-1 justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{item.food_name}</h3>
                              <div className="flex items-center gap-0.5 text-amber-400"><Star className="h-3 w-3 fill-amber-400" /><span className="text-[10px] font-bold font-mono">4.9</span></div>
                            </div>
                            <p className="mt-2 text-xs text-slate-400 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between">
                            <span className="text-base font-bold text-white font-sans">₹{item.price.toFixed(2)}</span>
                            <button
                              onClick={() => handleSpecialAdd(item)}
                              className="rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                              id={`btn-add-special-${item.id}`}
                            >
                              Add to Order
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Culinary Pillars benefits */}
                <div className="border-t border-b border-slate-900 py-16 bg-slate-900/10">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                      <div className="space-y-2">
                        <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-xl bg-amber-400/5 text-amber-400 border border-amber-400/10">
                          <Utensils className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Artisanal Chefs</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Dishes conceived and crafted by world-class chefs utilizing traditional tandoor clay-oven and slow-dum techniques.</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-xl bg-amber-400/5 text-amber-400 border border-amber-400/10">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Precision Logistics</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Orders tracked in real-time through meticulous prep, cooking, and express carriage timelines.</p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-xl bg-amber-400/5 text-amber-400 border border-amber-400/10">
                          <Clock className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Eco-Package Carriage</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Carried in biological thermal compartments to maintain pristine dining temperature.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Render Other Core Sub-Components */}
            {currentView === 'Menu' && (
              <MenuSection onNotify={addNotification} setView={setView} />
            )}

            {currentView === 'Cart' && (
              <CartSidebar setView={setView} />
            )}

            {currentView === 'Checkout' && (
              <CheckoutModal 
                setView={setView} 
                onNotify={addNotification} 
                setPendingOrder={setPendingOrder}
                setActiveOrder={setActiveOrder}
              />
            )}

            {currentView === 'Payment' && (
              <PaymentScreen 
                setView={setView} 
                onNotify={addNotification} 
                pendingOrder={pendingOrder}
                setActiveOrder={setActiveOrder}
              />
            )}

            {currentView === 'TrackOrder' && (
              <CustomerDashboard 
                onNotify={addNotification} 
                activeOrder={activeOrder}
                setActiveOrder={setActiveOrder}
              />
            )}

            {currentView === 'CustomerDashboard' && (
              <CustomerDashboard 
                onNotify={addNotification} 
                activeOrder={activeOrder}
                setActiveOrder={setActiveOrder}
              />
            )}

            {currentView === 'KitchenDashboard' && (
              <KitchenDashboard onNotify={addNotification} />
            )}

            {currentView === 'AdminDashboard' && (
              <AdminDashboard onNotify={addNotification} />
            )}

            {currentView === 'Reviews' && (
              <ReviewsSection />
            )}

            {currentView === 'Login' && (
              <Login setView={setView} onNotify={addNotification} />
            )}

            {currentView === 'Register' && (
              <Register setView={setView} onNotify={addNotification} />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Gourmet Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold font-sans">
                  G
                </div>
                <span className="text-sm font-extrabold tracking-tight text-white uppercase">Gourmet Club</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Est. 2026. A premier dining service designed for digital culinary tracking, signature food curations, and executive culinary art.
              </p>
            </div>

            {/* Open Hours */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Kitchen Hours</h5>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>Monday - Friday: 11:30 AM - 10:00 PM</li>
                <li>Saturday - Sunday: 10:00 AM - 11:30 PM</li>
                <li className="text-amber-500/80">Bar and Wine Deck open late</li>
              </ul>
            </div>

            {/* Contacts Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Gourmet Carriage</h5>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-600" /> +1 (555) 018-9221</li>
                <li className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-600" /> 742 Gourmet Pkwy, CA</li>
                <li className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-600" /> Avg. Prep time: 20 Mins</li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">The Tasting List</h5>
              <p className="text-xs text-slate-500 leading-relaxed">Subscribe to receive premier invitations to wine and seasonal tastings.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-xs pt-1">
                <input
                  type="email"
                  required
                  placeholder="Enter email..."
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  id="input-newsletter"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-amber-400 p-1.5 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                  id="btn-newsletter-submit"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <span className="text-[10px] text-slate-600 font-mono">
              &copy; 2026 Gourmet Studio Inc. Developed with Premium Full-Stack Architecture.
            </span>
            <div className="flex items-center gap-4 text-slate-600 hover:text-slate-500">
              <button className="hover:text-amber-400 transition-colors cursor-pointer"><Instagram className="h-4 w-4" /></button>
              <button className="hover:text-amber-400 transition-colors cursor-pointer"><Facebook className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* 5. GOURMET NOTIFICATION TOAST POPUP */}
      {/* ---------------------------------------------------- */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md pointer-events-auto ${
                notif.type === 'success'
                  ? 'border-emerald-500/20 bg-slate-900/90 text-slate-200'
                  : 'border-rose-500/20 bg-slate-900/90 text-slate-200'
              }`}
              id={`toast-notif-${notif.id}`}
            >
              {notif.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 stroke-[2.5]" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 stroke-[2.5]" />
              )}
              <p className="text-xs font-semibold leading-relaxed">{notif.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
