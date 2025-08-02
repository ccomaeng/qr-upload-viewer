// Cache Management Utility
class CacheManager {
  constructor() {
    this.swRegistration = null;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('🔧 Service Worker registered successfully');
        
        // Listen for SW updates
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found');
          const newWorker = this.swRegistration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ New Service Worker installed, prompting reload');
              this.promptForReload();
            }
          });
        });
        
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  // Clear all caches
  async clearAllCaches() {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        console.warn('⚠️ No active service worker, clearing caches manually');
        this.clearBrowserCaches().then(resolve).catch(reject);
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('✅ All caches cleared successfully');
          resolve();
        } else {
          console.error('❌ Cache clear failed:', event.data.error);
          reject(new Error(event.data.error));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  // Manual cache clearing fallback
  async clearBrowserCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map(cacheName => {
        console.log('🗑️ Deleting cache:', cacheName);
        return caches.delete(cacheName);
      });
      await Promise.all(deletePromises);
      console.log('✅ Browser caches cleared manually');
    }
  }

  // Clear specific cache by name
  async clearCache(cacheName) {
    if ('caches' in window) {
      const deleted = await caches.delete(cacheName);
      console.log(`🗑️ Cache "${cacheName}" ${deleted ? 'deleted' : 'not found'}`);
      return deleted;
    }
    return false;
  }

  // Force service worker update
  async forceUpdate() {
    if (this.swRegistration) {
      await this.swRegistration.update();
      console.log('🔄 Service Worker update triggered');
    }
  }

  // Prompt user for reload when SW updates
  promptForReload() {
    const shouldReload = window.confirm(
      '새로운 버전이 사용 가능합니다. 페이지를 새로고침하시겠습니까?'
    );
    if (shouldReload) {
      this.skipWaitingAndReload();
    }
  }

  // Skip waiting and reload
  skipWaitingAndReload() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }

  // Check if page was loaded from cache
  isLoadedFromCache() {
    return performance.getEntriesByType('navigation')[0]?.transferSize === 0;
  }

  // Handle cache-related errors
  async handleCacheError(error, context = 'general') {
    console.error(`❌ Cache error in ${context}:`, error);
    
    // Clear caches and reload on cache-related errors
    if (error.message.includes('cache') || error.message.includes('Failed to fetch')) {
      console.log('🔄 Attempting cache recovery...');
      try {
        await this.clearAllCaches();
        console.log('✅ Cache cleared, reloading page...');
        window.location.reload();
      } catch (clearError) {
        console.error('❌ Cache recovery failed:', clearError);
      }
    }
  }

  // Get cache status
  async getCacheStatus() {
    if (!('caches' in window)) {
      return { supported: false };
    }

    const cacheNames = await caches.keys();
    const cacheInfo = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      cacheInfo[cacheName] = {
        entryCount: keys.length,
        urls: keys.map(request => request.url).slice(0, 5) // First 5 URLs
      };
    }

    return {
      supported: true,
      caches: cacheInfo,
      totalCaches: cacheNames.length
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Export utility functions
export const clearAllCaches = () => cacheManager.clearAllCaches();
export const clearCache = (cacheName) => cacheManager.clearCache(cacheName);
export const forceUpdate = () => cacheManager.forceUpdate();
export const handleCacheError = (error, context) => cacheManager.handleCacheError(error, context);
export const getCacheStatus = () => cacheManager.getCacheStatus();
export const isLoadedFromCache = () => cacheManager.isLoadedFromCache();

export default cacheManager;