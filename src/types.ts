/**
 * Types and interfaces for the Restaurant Ordering System
 */

export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  CUSTOMER = 'ROLE_CUSTOMER',
  KITCHEN = 'ROLE_KITCHEN'
}

export enum OrderStatus {
  PLACED = 'Placed',
  ACCEPTED = 'Accepted',
  COOKING = 'Cooking',
  READY = 'Ready',
  DELIVERED = 'Delivered'
}

export enum FoodCategory {
  APPETIZERS = 'Appetizers',
  MAINS = 'Main Course',
  DESSERTS = 'Desserts',
  BEVERAGES = 'Beverages',
  SPECIALS = 'Chef Specials'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  password?: string; // Omitting password in API responses
}

export interface MenuItem {
  id: string;
  food_name: string;
  description: string;
  price: number;
  category: FoodCategory;
  image: string;
  availability: boolean;
  rating?: number;
}

export interface CartItem {
  id: string; // Unique cart item ID
  menu_id: string;
  quantity: number;
}

export interface Cart {
  user_id: string;
  items: CartItem[];
}

export interface OrderItem {
  menu_id: string;
  food_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  date: string;
  status: OrderStatus;
  total: number;
  payment_method: string;
  payment_status: 'Pending' | 'Completed';
  transaction_id?: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  categorySales: Record<string, number>;
  monthlyRevenue: { month: string; amount: number }[];
  popularItems: { name: string; sales: number; revenue: number }[];
}
