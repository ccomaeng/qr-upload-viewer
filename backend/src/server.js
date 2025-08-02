const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const { initDatabase } = require('./database/init');
const { errorHandler, notFound } = require('./middleware/errorHandlers');

const app = express();
const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration with enhanced Vercel domain support
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://qr-upload-viewer.vercel.app',
          // Allow all Vercel deployment URLs
          /^https:\/\/frontend-[a-z0-9]+-ccomaengs-projects\.vercel\.app$/,
          /^https:\/\/qr-upload-viewer-[a-z0-9]+\.vercel\.app$/,
          process.env.FRONTEND_URL || 'https://qr-upload-viewer.vercel.app'
        ]
      : [
          'http://localhost:3000', 
          'http://127.0.0.1:3000', 
          'http://localhost:3002', 
          'http://127.0.0.1:3002',
          'http://192.168.25.54:3000',
          process.env.FRONTEND_URL || 'http://192.168.25.54:3000'
        ];

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Preflight cache for 24 hours
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', uploadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Apply database migrations
    const { applyMigrations } = require('./database/migrations');
    await applyMigrations();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 QR Upload Viewer API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;