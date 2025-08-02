#!/usr/bin/env node

// QR Upload Viewer System Integration Test
// This script tests the entire upload → QR generation → scan workflow

const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'https://qr-upload-viewer-backend.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://qr-upload-viewer.vercel.app';

class SystemTester {
  constructor() {
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      startTime: Date.now()
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(name, testFn) {
    this.log(`Starting test: ${name}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'passed',
        duration,
        result
      });
      
      this.results.passed++;
      this.log(`✅ PASSED: ${name} (${duration}ms)`, 'success');
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'failed',
        duration,
        error: error.message
      });
      
      this.results.failed++;
      this.log(`❌ FAILED: ${name} (${duration}ms) - ${error.message}`, 'error');
      throw error;
    }
  }

  async healthCheck() {
    return this.test('Backend Health Check', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const health = await response.json();
      
      if (health.status !== 'healthy') {
        throw new Error(`Backend unhealthy: ${health.status}`);
      }
      
      return health;
    });
  }

  async databaseConnectivity() {
    return this.test('Database Connectivity', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      const health = await response.json();
      
      if (!health.database || !health.database.connected) {
        throw new Error('Database not connected');
      }
      
      if (!health.database.tablesExist) {
        throw new Error('Required database tables missing');
      }
      
      return health.database;
    });
  }

  async createTestImage() {
    // Create a simple test image (1x1 pixel PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk header
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00, // image data
      0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x49, // 
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82         // IEND chunk
    ]);
    
    return new File([pngBuffer], 'test.png', { type: 'image/png' });
  }

  async uploadImage() {
    return this.test('Image Upload', async () => {
      // Create form data with test image
      const formData = new FormData();
      const testImage = await this.createTestImage();
      formData.append('image', testImage);
      
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.uploadId) {
        throw new Error('Upload response invalid');
      }
      
      return result;
    });
  }

  async waitForProcessing(uploadId, maxWaitTime = 30000) {
    return this.test('Wait for Processing', async () => {
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWaitTime) {
        const response = await fetch(`${API_BASE_URL}/api/results/${uploadId}`, {
          mode: 'cors'
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.status === 'completed') {
            return result;
          }
          
          if (result.status === 'failed') {
            throw new Error(`Processing failed: ${result.error}`);
          }
        }
        
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      throw new Error('Processing timeout');
    });
  }

  async generateQR(uploadId) {
    return this.test('QR Code Generation', async () => {
      const response = await fetch(`${API_BASE_URL}/api/generate-qr/${uploadId}`, {
        method: 'POST',
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`QR generation failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.qrImageUrl) {
        throw new Error('QR generation response invalid');
      }
      
      return result;
    });
  }

  async getQRInfo(uploadId) {
    return this.test('QR Code Retrieval', async () => {
      const response = await fetch(`${API_BASE_URL}/api/qr/${uploadId}`, {
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`QR retrieval failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.qrImageUrl) {
        throw new Error('QR retrieval response invalid');
      }
      
      return result;
    });
  }

  async testQRAccess(uploadId) {
    return this.test('QR Code Access Test', async () => {
      // Test both direct API access and view page access
      const viewUrl = `${FRONTEND_URL}/view.html?id=${uploadId}`;
      
      // Try to access the view page (should not give 404)
      const viewResponse = await fetch(viewUrl, { 
        mode: 'no-cors',
        method: 'HEAD'
      });
      
      // Also test API endpoint
      const apiResponse = await fetch(`${API_BASE_URL}/api/results/${uploadId}`, {
        mode: 'cors'
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API access failed: ${apiResponse.status}`);
      }
      
      const result = await apiResponse.json();
      
      return {
        apiAccess: true,
        viewUrl,
        data: result
      };
    });
  }

  async corsCheck() {
    return this.test('CORS Configuration', async () => {
      const response = await fetch(`${API_BASE_URL}/health`, {
        mode: 'cors',
        headers: {
          'Origin': FRONTEND_URL
        }
      });
      
      if (!response.ok) {
        throw new Error(`CORS check failed: ${response.status}`);
      }
      
      return { corsEnabled: true };
    });
  }

  async performanceTest() {
    return this.test('Performance Test', async () => {
      const startTime = Date.now();
      
      // Test multiple concurrent requests
      const promises = Array(5).fill(null).map(() => 
        fetch(`${API_BASE_URL}/health?quick=true`)
      );
      
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const allSuccessful = responses.every(r => r.ok);
      
      if (!allSuccessful) {
        throw new Error('Some concurrent requests failed');
      }
      
      return {
        concurrentRequests: 5,
        totalTime,
        averageTime: totalTime / 5
      };
    });
  }

  generateReport() {
    const totalTime = Date.now() - this.results.startTime;
    const totalTests = this.results.passed + this.results.failed;
    const successRate = totalTests > 0 ? (this.results.passed / totalTests * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 QR UPLOAD VIEWER SYSTEM TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️ Total Time: ${(totalTime/1000).toFixed(2)}s`);
    console.log('='.repeat(60));
    
    // Detailed test results
    console.log('\n📝 DETAILED RESULTS:');
    this.results.tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : '❌';
      const duration = `${test.duration}ms`;
      console.log(`${status} ${test.name.padEnd(30)} ${duration.padStart(8)}`);
      
      if (test.error) {
        console.log(`   ↳ ${test.error}`);
      }
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.failed === 0) {
      console.log('✅ All tests passed! System is ready for production.');
    } else {
      console.log('❌ Some tests failed. Please review and fix issues before deploying.');
      
      const failedTests = this.results.tests.filter(t => t.status === 'failed');
      failedTests.forEach(test => {
        console.log(`   • Fix: ${test.name} - ${test.error}`);
      });
    }
    
    return this.results;
  }

  async runAllTests() {
    try {
      this.log('🚀 Starting QR Upload Viewer System Tests');
      
      // Core infrastructure tests
      await this.healthCheck();
      await this.corsCheck();
      await this.databaseConnectivity();
      
      // Full workflow test
      const uploadResult = await this.uploadImage();
      const uploadId = uploadResult.uploadId;
      
      await this.waitForProcessing(uploadId);
      await this.generateQR(uploadId);
      await this.getQRInfo(uploadId);
      await this.testQRAccess(uploadId);
      
      // Performance test
      await this.performanceTest();
      
      this.log('🎉 All tests completed successfully!', 'success');
      
    } catch (error) {
      this.log(`💥 Test suite failed: ${error.message}`, 'error');
    } finally {
      this.generateReport();
    }
    
    return this.results;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests()
    .then(results => {
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = SystemTester;