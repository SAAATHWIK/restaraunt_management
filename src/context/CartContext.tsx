import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types';

interface CartItemWithDetails {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItemWithDetails[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('restaurant_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Failed to parse cart items', err);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  const saveCart = (items: CartItemWithDetails[]) => {
    setCartItems(items);
    localStorage.setItem('restaurant_cart', JSON.stringify(items));
  };

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    const existing = cartItems.find(i => i.menuItem.id === item.id);
    if (existing) {
      const updated = cartItems.map(i =>
        i.menuItem.id === item.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
      saveCart(updated);
    } else {
      saveCart([...cartItems, { menuItem: item, quantity }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const updated = cartItems.map(i =>
      i.menuItem.id === itemId ? { ...i, quantity } : i
    );
    saveCart(updated);
  };

  const removeFromCart = (itemId: string) => {
    const updated = cartItems.filter(i => i.menuItem.id !== itemId);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = parseFloat(
    cartItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0).toFixed(2)
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
