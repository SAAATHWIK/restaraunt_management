import React, { useState, useEffect } from 'react';
import { MenuItem, FoodCategory } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, Star, Sparkles, Filter, Check, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuSectionProps {
  onNotify: (message: string, type: 'success' | 'error') => void;
  setView: (view: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onNotify, setView }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Added items visual states (map of itemId -> true/false)
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!item.availability) {
      onNotify('Sorry, this item is temporarily sold out.', 'error');
      return;
    }
    
    addToCart(item, 1);
    onNotify(`${item.food_name} added to your gourmet cart!`, 'success');
    
    // Animate item "Added" button state
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.food_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Object.values(FoodCategory)];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Category Tabs & Search Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-8 mb-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Explore Our Culinary Menu
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Freshly prepared authentic Indian dishes crafted by world-class chefs.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search samosas, butter chicken, lassi..."
            className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            id="input-menu-search"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              selectedCategory === category
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800/60'
            }`}
            id={`btn-cat-${category.toLowerCase().replace(' ', '-')}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
          <span className="mt-4 text-sm font-mono text-slate-400">Loading signature collection...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
          <Filter className="h-10 w-10 text-slate-600 mx-auto mb-4 stroke-[1.5]" />
          <p className="text-white font-medium">No gourmet dishes found</p>
          <p className="text-sm text-slate-500 mt-1">Try resetting your search query or choosing another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm transition-all hover:border-slate-700/60 hover:shadow-xl hover:shadow-slate-950/40"
                id={`menu-card-${item.id}`}
              >
                {/* Food Image Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-850">
                  <img
                    src={item.image}
                    alt={item.food_name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category overlay label */}
                  <span className="absolute top-3 left-3 rounded-md bg-slate-950/70 backdrop-blur-md px-2 py-1 text-[10px] font-bold tracking-widest text-amber-400 uppercase border border-slate-800/50">
                    {item.category}
                  </span>

                  {/* Sold out label */}
                  {!item.availability && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-[2px]">
                      <span className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold tracking-widest text-rose-400 uppercase">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Content info */}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {item.food_name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800/50">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-bold text-amber-400">{item.rating || '4.8'}</span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-slate-800/40">
                    <span className="text-lg font-bold text-white font-sans">
                      ₹{item.price.toFixed(2)}
                    </span>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.availability}
                      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        addedItems[item.id]
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[0.97]'
                      } disabled:opacity-45 disabled:cursor-not-allowed`}
                      id={`btn-add-cart-${item.id}`}
                    >
                      {addedItems[item.id] ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};
