#!/usr/bin/env node

/**
 * Health check script for Docker container
 * Tests server responsiveness and database connectivity
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const HEALTH_CHECK_TIMEOUT = 5000;

// Health check function
async function healthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/health',
      method: 'GET',
      timeout: HEALTH_CHECK_TIMEOUT
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.status === 'healthy') {
              resolve({ success: true, response });
            } else {
              reject(new Error(`Unhealthy status: ${response.status}`));
            }
          } catch (error) {
            reject(new Error(`Invalid health response: ${error.message}`));
          }
        });
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });

    req.setTimeout(HEALTH_CHECK_TIMEOUT);
    req.end();
  });
}

// Additional checks
async function checkFileSystem() {
  try {
    const uploadsDir = process.env.UPLOAD_DIR || './uploads';
    const dataDir = path.dirname(process.env.DATABASE_PATH || './data/qr_viewer.db');
    
    // Check if directories exist and are writable
    await fs.promises.access(uploadsDir, fs.constants.W_OK);
    await fs.promises.access(dataDir, fs.constants.W_OK);
    
    return true;
  } catch (error) {
    throw new Error(`File system check failed: ${error.message}`);
  }
}

// Main health check execution
async function main() {
  try {
    console.log('🔍 Running health check...');
    
    // Check HTTP endpoint
    const healthResult = await healthCheck();
    console.log('✅ HTTP health check passed');
    
    // Check file system
    await checkFileSystem();
    console.log('✅ File system check passed');
    
    console.log('🎉 All health checks passed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Run health check
if (require.main === module) {
  main();
}

module.exports = { healthCheck, checkFileSystem };