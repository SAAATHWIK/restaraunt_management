import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/db';
import { MenuItem, Order, OrderStatus, UserRole, FoodCategory, Review } from './src/types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // Simple Session Store helper (Simulating JWT verification)
  // In a real application, you would verify an actual JWT token.
  // Here, we look at the 'Authorization' header: 'Bearer <userId>'
  function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is missing' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Token is missing' });
      return;
    }

    const users = db.getUsers();
    // We can pass the userId as the token for a robust and elegant mock-session
    const user = users.find(u => u.id === token || `mock-token-${u.id}` === token);
    if (!user) {
      res.status(403).json({ error: 'Invalid or expired session token' });
      return;
    }

    req.user = user;
    next();
  }

  // ----------------------------------------------------
  // Authentication Routes
  // ----------------------------------------------------
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const users = db.getUsers();
    if (users.find(u => u.email === email)) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone: phone || '',
      address: address || '',
      role: UserRole.CUSTOMER,
      password // storing plain text for easy simulation
    };

    db.addUser(newUser);

    // Return user with simulated JWT token
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      user: userWithoutPassword,
      token: `mock-token-${newUser.id}`
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token: `mock-token-${user.id}`
    });
  });

  // Verify currently logged in user endpoint
  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // ----------------------------------------------------
  // Menu Item Routes
  // ----------------------------------------------------
  app.get('/api/menu', (req, res) => {
    res.json(db.getMenu());
  });

  app.get('/api/menu/:id', (req, res) => {
    const item = db.getMenu().find(m => m.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    res.json(item);
  });

  app.post('/api/menu', authenticateToken, (req, res) => {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can manage menu items' });
      return;
    }

    const { food_name, description, price, category, image, availability } = req.body;
    if (!food_name || !price || !category) {
      res.status(400).json({ error: 'Name, price, and category are required' });
      return;
    }

    const newItem: MenuItem = {
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      food_name,
      description: description || '',
      price: parseFloat(price),
      category: category as FoodCategory,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      availability: availability !== undefined ? availability : true,
      rating: 5.0
    };

    db.addMenuItem(newItem);
    res.status(201).json(newItem);
  });

  app.put('/api/menu/:id', authenticateToken, (req, res) => {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can manage menu items' });
      return;
    }

    const updated = db.updateMenuItem(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/menu/:id', authenticateToken, (req, res) => {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can manage menu items' });
      return;
    }

    db.deleteMenuItem(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  });

  // ----------------------------------------------------
  // Orders Routes
  // ----------------------------------------------------
  app.post('/api/order/place', authenticateToken, (req, res) => {
    const { items, payment_method, customer_name, customer_phone, customer_address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items list cannot be empty' });
      return;
    }

    // Calculate total
    let total = 0;
    const orderItems = items.map((item: any) => {
      const menuItem = db.getMenu().find(m => m.id === item.menu_id);
      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menu_id} not found`);
      }
      total += menuItem.price * item.quantity;
      return {
        menu_id: menuItem.id,
        food_name: menuItem.food_name,
        price: menuItem.price,
        quantity: item.quantity
      };
    });

    const newOrder: Order = {
      id: 'ord_' + Math.floor(100000 + Math.random() * 900000), // Nice readable 6-digit order code
      user_id: req.user.id,
      customer_name: customer_name || req.user.name,
      customer_phone: customer_phone || req.user.phone || '',
      customer_address: customer_address || req.user.address || '',
      items: orderItems,
      date: new Date().toISOString(),
      status: OrderStatus.PLACED,
      total: parseFloat(total.toFixed(2)),
      payment_method: payment_method || 'Cash on Delivery',
      payment_status: payment_method === 'Card' ? 'Completed' : 'Pending',
      transaction_id: payment_method === 'Card' ? 'tx_' + Math.random().toString(36).substr(2, 9) : undefined
    };

    db.addOrder(newOrder);
    res.status(201).json(newOrder);
  });

  app.get('/api/order/history', authenticateToken, (req, res) => {
    const orders = db.getOrders();
    // Admin and Kitchen see all orders; Customer sees only their own
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.KITCHEN) {
      res.json(orders);
    } else {
      res.json(orders.filter(o => o.user_id === req.user.id));
    }
  });

  app.get('/api/order/status/:id', authenticateToken, (req, res) => {
    const order = db.getOrders().find(o => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    // Prevent customers from viewing other people's order status
    if (req.user.role === UserRole.CUSTOMER && order.user_id !== req.user.id) {
      res.status(403).json({ error: 'Unauthorized to view this order' });
      return;
    }
    res.json(order);
  });

  app.put('/api/order/updateStatus', authenticateToken, (req, res) => {
    const { order_id, status } = req.body;
    if (!order_id || !status) {
      res.status(400).json({ error: 'order_id and status are required' });
      return;
    }

    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.KITCHEN) {
      res.status(403).json({ error: 'Only admins or kitchen staff can update order status' });
      return;
    }

    const updated = db.updateOrderStatus(order_id, status as OrderStatus);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(updated);
  });

  // ----------------------------------------------------
  // Payment Simulation Routes
  // ----------------------------------------------------
  app.post('/api/payment', authenticateToken, (req, res) => {
    const { order_id, payment_method } = req.body;
    if (!order_id) {
      res.status(400).json({ error: 'order_id is required' });
      return;
    }

    const txId = 'tx_' + Math.random().toString(36).substr(2, 9);
    const updated = db.updateOrderPaymentStatus(order_id, 'Completed', txId);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Payment completed successfully',
      transaction_id: txId,
      order: updated
    });
  });

  // ----------------------------------------------------
  // Reviews Routes
  // ----------------------------------------------------
  app.get('/api/reviews', (req, res) => {
    res.json(db.getReviews());
  });

  app.post('/api/review', authenticateToken, (req, res) => {
    const { rating, comment } = req.body;
    if (!rating) {
      res.status(400).json({ error: 'Rating is required' });
      return;
    }

    const newReview: Review = {
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      user_id: req.user.id,
      user_name: req.user.name,
      rating: parseInt(rating),
      comment: comment || '',
      date: new Date().toISOString()
    };

    db.addReview(newReview);
    res.status(201).json(newReview);
  });

  // ----------------------------------------------------
  // Admin Revenue and Analytics Dashboard Data
  // ----------------------------------------------------
  app.get('/api/admin/analytics', authenticateToken, (req, res) => {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const orders = db.getOrders();
    const users = db.getUsers();
    
    // Total Revenue (only from completed payments or delivered items)
    const completedOrders = orders.filter(o => o.status === OrderStatus.DELIVERED || o.payment_status === 'Completed');
    const totalRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);

    // Categories Breakdown
    const categorySales: Record<string, number> = {};
    const itemSalesCount: Record<string, { count: number; revenue: number }> = {};

    orders.forEach(o => {
      o.items.forEach(item => {
        // Find menuItem to get its category
        const menuItem = db.getMenu().find(m => m.id === item.menu_id);
        const category = menuItem ? menuItem.category : 'Other';
        
        categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
        
        if (!itemSalesCount[item.food_name]) {
          itemSalesCount[item.food_name] = { count: 0, revenue: 0 };
        }
        itemSalesCount[item.food_name].count += item.quantity;
        itemSalesCount[item.food_name].revenue += item.price * item.quantity;
      });
    });

    // Monthly stats placeholder/simulated
    const monthlyRevenue = [
      { month: 'Feb', amount: Math.max(0, totalRevenue * 0.15) },
      { month: 'Mar', amount: Math.max(0, totalRevenue * 0.20) },
      { month: 'Apr', amount: Math.max(0, totalRevenue * 0.25) },
      { month: 'May', amount: Math.max(0, totalRevenue * 0.35) },
      { month: 'Jun', amount: Math.max(0, totalRevenue * 0.45) },
      { month: 'Jul', amount: totalRevenue }
    ];

    // Popular Items List
    const popularItems = Object.entries(itemSalesCount).map(([name, data]) => ({
      name,
      sales: data.count,
      revenue: parseFloat(data.revenue.toFixed(2))
    })).sort((a, b) => b.sales - a.sales).slice(0, 5);

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      totalCustomers: users.filter(u => u.role === UserRole.CUSTOMER).length,
      categorySales,
      monthlyRevenue,
      popularItems
    });
  });

  // ----------------------------------------------------
  // Vite Integration (Serve React Frontend)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer();
