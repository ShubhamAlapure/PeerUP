import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';

import authRoutes from './routes/authRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import peerRoutes from './routes/peerRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'PeerUP Multi-Institution Learning Marketplace',
    timestamp: new Date().toISOString()
  });
});

// Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api', institutionRoutes);
app.use('/api', peerRoutes);
app.use('/api', contentRoutes);
app.use('/api', requestRoutes);
app.use('/api', paymentRoutes);
app.use('/api', ratingRoutes);
app.use('/api', reportRoutes);
app.use('/api', adminRoutes);
app.use('/api', resourceRoutes);

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error('PeerUP Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 PeerUP Backend REST API running on http://localhost:${PORT}`);
  console.log(`📚 Multi-Institution Academic Engine Ready`);
  console.log(`====================================================`);
});
