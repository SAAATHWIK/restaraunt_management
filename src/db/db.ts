import fs from 'fs';
import path from 'path';
import { User, MenuItem, Order, Review, UserRole, OrderStatus, FoodCategory } from '../types';

// Use a local JSON file path that is safe in the workspace
const DB_FILE = path.join(process.cwd(), 'src', 'db', 'database.json');

// Ensure the db directory exists
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

interface DatabaseSchema {
  users: User[];
  menu: MenuItem[];
  orders: Order[];
  reviews: Review[];
}

const defaultMenu: MenuItem[] = [
  {
    id: 'm1',
    food_name: 'Crispy Vegetable Samosas',
    description: 'Golden flaky pastry crusts stuffed with a savory spiced potato and pea filling, served with zesty mint-cilantro & sweet tamarind chutneys.',
    price: 120,
    category: FoodCategory.APPETIZERS,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.8
  },
  {
    id: 'm2',
    food_name: 'Paneer Tikka Angare',
    description: 'Clay-oven roasted cottage cheese cubes marinated in a robust tandoori spiced yogurt, charred with onions and bell peppers.',
    price: 250,
    category: FoodCategory.APPETIZERS,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.7
  },
  {
    id: 'm11',
    food_name: 'Onion Bhaji Fritters',
    description: 'Crispy thinly-sliced onion fritters infused with green chilies, coriander, and carom seeds, bound in chickpea flour batter.',
    price: 150,
    category: FoodCategory.APPETIZERS,
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.6
  },
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
    id: 'm4',
    food_name: 'Shahi Paneer Butter Masala',
    description: 'Fresh paneer chunks folded into a luscious cream-based gravy of tomatoes, cashew paste, ginger-garlic, and traditional garam masala.',
    price: 320,
    category: FoodCategory.MAINS,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.8
  },
  {
    id: 'm5',
    food_name: 'Fragrant Awadhi Chicken Biryani',
    description: 'Premium aged long-grain Basmati rice slow-cooked on dum with marinated chicken, infused with saffron, rose water, and caramelised onions.',
    price: 350,
    category: FoodCategory.MAINS,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.9
  },
  {
    id: 'm12',
    food_name: 'Slow-Cooked Dal Makhani',
    description: 'Creamy whole black lentils and red kidney beans slow-simmered overnight over charcoal, enriched with white butter and fresh cream.',
    price: 240,
    category: FoodCategory.MAINS,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.7
  },
  {
    id: 'm6',
    food_name: 'Warm Gulab Jamun',
    description: 'Delectable reduced milk solid dumplings, golden-fried and soaked in warm, fragrant sugar syrup infused with green cardamom and rose water.',
    price: 100,
    category: FoodCategory.DESSERTS,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.8
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
  },
  {
    id: 'm8',
    food_name: 'Sweet Mango Lassi',
    description: 'A cooling, creamy yogurt-based nectar whipped with sweet Alphonso mango pulp, a touch of cardamom, and pistachio dust.',
    price: 110,
    category: FoodCategory.BEVERAGES,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.7
  },
  {
    id: 'm9',
    food_name: 'Royal Masala Chai',
    description: 'Traditional slow-brewed strong milk tea infused with crushed green cardamom, cloves, ginger, cinnamon, and black pepper.',
    price: 60,
    category: FoodCategory.BEVERAGES,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.8
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
    id: 'm13',
    food_name: 'Clay-Oven Garlic Butter Naan',
    description: 'Hand-stretched leavened wheat flatbread slapped on the walls of a scorching tandoor clay-oven, brushed with garlic and butter.',
    price: 50,
    category: FoodCategory.SPECIALS,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=60',
    availability: true,
    rating: 4.9
  }
];

const defaultUsers: User[] = [
  {
    id: 'u1',
    name: 'Sathwik Kumar (Admin)',
    email: 'admin@restaurant.com',
    phone: '+91 98765 43210',
    address: '100 Royal Curry Lane, Taj Enclave, Mumbai',
    role: UserRole.ADMIN,
    password: 'admin123' // Simple password for simulation
  },
  {
    id: 'u2',
    name: 'Chef Marcus',
    email: 'kitchen@restaurant.com',
    phone: '+91 98765 43211',
    address: 'Main Tandoor Hub Station 1',
    role: UserRole.KITCHEN,
    password: 'kitchen123'
  },
  {
    id: 'u3',
    name: 'John Doe',
    email: 'customer@restaurant.com',
    phone: '+91 98765 43212',
    address: '742 Park Street, Connaught Place, New Delhi',
    role: UserRole.CUSTOMER,
    password: 'customer123'
  }
];

const defaultReviews: Review[] = [
  {
    id: 'r1',
    user_id: 'u3',
    user_name: 'John Doe',
    rating: 5,
    comment: 'The Royal Butter Chicken and Garlic Butter Naan are a match made in heaven! Absolutely phenomenal flavor and dum aroma.',
    date: '2026-07-16T18:30:00Z'
  },
  {
    id: 'r2',
    user_id: 'u2',
    user_name: 'Chef Marcus',
    rating: 4,
    comment: 'The saffron notes in the Awadhi Biryani are perfectly balanced. Extremely authentic tandoor preparation.',
    date: '2026-07-17T12:15:00Z'
  }
];

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading database file, resetting to default', error);
  }

  // If file doesn't exist, seed and save
  const initialDb: DatabaseSchema = {
    users: defaultUsers,
    menu: defaultMenu,
    orders: [],
    reviews: defaultReviews
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file', error);
  }
}

// Database Actions Interface
export const db = {
  getUsers: () => loadDatabase().users,
  addUser: (user: User) => {
    const data = loadDatabase();
    data.users.push(user);
    saveDatabase(data);
    return user;
  },
  getMenu: () => loadDatabase().menu,
  saveMenu: (menu: MenuItem[]) => {
    const data = loadDatabase();
    data.menu = menu;
    saveDatabase(data);
  },
  addMenuItem: (item: MenuItem) => {
    const data = loadDatabase();
    data.menu.push(item);
    saveDatabase(data);
    return item;
  },
  updateMenuItem: (id: string, updated: Partial<MenuItem>) => {
    const data = loadDatabase();
    const idx = data.menu.findIndex(m => m.id === id);
    if (idx !== -1) {
      data.menu[idx] = { ...data.menu[idx], ...updated };
      saveDatabase(data);
      return data.menu[idx];
    }
    return null;
  },
  deleteMenuItem: (id: string) => {
    const data = loadDatabase();
    data.menu = data.menu.filter(m => m.id !== id);
    saveDatabase(data);
  },
  getOrders: () => loadDatabase().orders,
  addOrder: (order: Order) => {
    const data = loadDatabase();
    data.orders.unshift(order); // Put new orders at the start
    saveDatabase(data);
    return order;
  },
  updateOrderStatus: (id: string, status: OrderStatus) => {
    const data = loadDatabase();
    const idx = data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      data.orders[idx].status = status;
      saveDatabase(data);
      return data.orders[idx];
    }
    return null;
  },
  updateOrderPaymentStatus: (id: string, payment_status: 'Pending' | 'Completed', transactionId?: string) => {
    const data = loadDatabase();
    const idx = data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      data.orders[idx].payment_status = payment_status;
      if (transactionId) {
        data.orders[idx].transaction_id = transactionId;
      }
      saveDatabase(data);
      return data.orders[idx];
    }
    return null;
  },
  getReviews: () => loadDatabase().reviews,
  addReview: (review: Review) => {
    const data = loadDatabase();
    data.reviews.unshift(review);
    saveDatabase(data);
    return review;
  }
};
