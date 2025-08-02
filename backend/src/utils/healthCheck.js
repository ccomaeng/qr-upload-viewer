const { getDatabase, runQuery } = require('../database/init');

// Enhanced health check utility
class HealthChecker {
  constructor() {
    this.status = {
      healthy: false,
      database: false,
      lastCheck: null,
      errors: []
    };
  }

  async checkDatabase() {
    try {
      // Simple database connectivity test
      await runQuery('SELECT 1 as test');
      
      // Check if tables exist
      const tableCheck = await runQuery(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('uploads', 'qr_results')
      `);
      
      const hasRequiredTables = tableCheck.rows && tableCheck.rows.length >= 2;
      
      this.status.database = hasRequiredTables;
      
      return {
        connected: true,
        tablesExist: hasRequiredTables,
        tableCount: tableCheck.rows ? tableCheck.rows.length : 0
      };
      
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      this.status.database = false;
      this.status.errors.push({
        type: 'database',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      return {
        connected: false,
        error: error.message
      };
    }
  }

  async checkDiskSpace() {
    try {
      const fs = require('fs').promises;
      const stats = await fs.stat(process.cwd());
      
      return {
        available: true,
        path: process.cwd()
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  async checkMemoryUsage() {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const freeMB = totalMB - usedMB;
    
    return {
      totalMB,
      usedMB,
      freeMB,
      percentage: Math.round((usedMB / totalMB) * 100),
      healthy: usedMB < 500 // Consider healthy if under 500MB
    };
  }

  async performFullHealthCheck() {
    const startTime = Date.now();
    
    try {
      const [databaseStatus, diskStatus, memoryStatus] = await Promise.all([
        this.checkDatabase(),
        this.checkDiskSpace(),
        this.checkMemoryUsage()
      ]);
      
      const responseTime = Date.now() - startTime;
      const isHealthy = databaseStatus.connected && diskStatus.available && memoryStatus.healthy;
      
      this.status.healthy = isHealthy;
      this.status.lastCheck = new Date().toISOString();
      
      // Clean old errors (keep only last 10)
      if (this.status.errors.length > 10) {
        this.status.errors = this.status.errors.slice(-10);
      }
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: this.status.lastCheck,
        uptime: Math.floor(process.uptime()),
        responseTimeMs: responseTime,
        environment: process.env.NODE_ENV || 'development',
        database: databaseStatus,
        disk: diskStatus,
        memory: memoryStatus,
        version: process.env.npm_package_version || '1.0.0',
        node: process.version,
        errors: this.status.errors.slice(-3) // Last 3 errors only
      };
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      
      this.status.healthy = false;
      this.status.errors.push({
        type: 'healthcheck',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development'
      };
    }
  }

  // Quick health check for frequent monitoring
  async quickHealthCheck() {
    try {
      const databaseOk = await runQuery('SELECT 1 as test');
      const memoryUsage = process.memoryUsage();
      const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: !!databaseOk,
        memoryMB: usedMB
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Database connection test with retry
  async testDatabaseConnection(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Testing database connection (attempt ${attempt}/${maxRetries})`);
        
        const result = await runQuery('SELECT NOW() as current_time, version() as db_version');
        
        console.log('✅ Database connection successful');
        return {
          success: true,
          attempt,
          result: result.rows ? result.rows[0] : result
        };
        
      } catch (error) {
        console.warn(`⚠️ Database connection attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error('❌ All database connection attempts failed');
          throw new Error(`Database connection failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

// Create singleton instance
const healthChecker = new HealthChecker();

module.exports = {
  healthChecker,
  performHealthCheck: () => healthChecker.performFullHealthCheck(),
  quickHealthCheck: () => healthChecker.quickHealthCheck(),
  testDatabaseConnection: (retries) => healthChecker.testDatabaseConnection(retries)
};