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
    
    console.log(`🌐 CORS 요청 origin: ${origin}`);
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://qr-upload-viewer.vercel.app',
          // More flexible Vercel patterns - allow all vercel.app subdomains temporarily
          /^https:\/\/.*\.vercel\.app$/,
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
        const match = origin === allowed;
        console.log(`🔍 String match "${allowed}": ${match}`);
        return match;
      } else if (allowed instanceof RegExp) {
        const match = allowed.test(origin);
        console.log(`🔍 Regex match "${allowed}": ${match}`);
        return match;
      }
      return false;
    });

    if (isAllowed) {
      console.log(`✅ CORS 허용: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS 차단: ${origin}`);
      console.warn(`허용된 origins:`, allowedOrigins);
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

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { performHealthCheck, quickHealthCheck } = require('./utils/healthCheck');
    
    // Use quick check for frequent monitoring, full check for detailed diagnostics
    const useQuickCheck = req.query.quick === 'true';
    const healthStatus = useQuickCheck ? 
      await quickHealthCheck() : 
      await performHealthCheck();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    console.error('❌ Health check endpoint error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// API routes
app.use('/api', uploadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server with enhanced error handling
async function startServer() {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 Starting server (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Test database connection first
      const { testDatabaseConnection } = require('./utils/healthCheck');
      await testDatabaseConnection(3);
      
      // Initialize database schema
      await initDatabase();
      console.log('✅ Database initialized successfully');
      
      // Apply database migrations if they exist
      try {
        const { applyMigrations } = require('./database/migrations');
        await applyMigrations();
        console.log('✅ Database migrations applied');
      } catch (migrationError) {
        console.warn('⚠️ Migration file not found or failed, continuing...');
      }
      
      // Start HTTP server
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 QR Upload Viewer API running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}`);
      });

      // Handle server errors
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use`);
          process.exit(1);
        } else {
          console.error('❌ Server error:', error);
        }
      });

      // Graceful shutdown handlers
      const gracefulShutdown = async () => {
        console.log('🛑 Received shutdown signal, shutting down gracefully...');
        
        server.close(async () => {
          console.log('✅ HTTP server closed');
          
          // Close database connections
          try {
            const { closeDatabase } = require('./database/init');
            await closeDatabase();
            console.log('✅ Database connections closed');
          } catch (error) {
            console.error('❌ Error closing database:', error);
          }
          
          process.exit(0);
        });

        // Force close after timeout
        setTimeout(() => {
          console.error('❌ Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      };

      process.on('SIGTERM', gracefulShutdown);
      process.on('SIGINT', gracefulShutdown);
      
      // Success - break out of retry loop
      break;
      
    } catch (error) {
      retryCount++;
      console.error(`❌ Server startup attempt ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error('❌ Max retries reached, server startup failed');
        process.exit(1);
      }
      
      // Wait before retry
      const waitTime = Math.pow(2, retryCount - 1) * 2000; // 2s, 4s, 8s
      console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Start the server
startServer();

module.exports = app;