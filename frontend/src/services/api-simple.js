// Simple API test without axios complications
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://qr-upload-viewer-backend.onrender.com';

// Retry utility with exponential backoff
const retryFetch = async (url, options, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API 요청 시도 ${attempt}/${maxRetries}: ${url}`);
      
      const response = await fetch(url, options);
      
      // If successful, return the response
      if (response.ok) {
        console.log(`✅ API 요청 성공 (시도 ${attempt})`);
        return response;
      }
      
      // If it's a server error (5xx) or CORS error, retry
      if (response.status >= 500 || !response.ok) {
        console.warn(`⚠️ 서버 오류 ${response.status}, 재시도 중... (${attempt}/${maxRetries})`);
        if (attempt === maxRetries) {
          return response; // Return the failed response on last attempt
        }
        await sleep(Math.pow(2, attempt - 1) * 1000); // Exponential backoff: 1s, 2s, 4s
        continue;
      }
      
      return response;
      
    } catch (error) {
      console.warn(`⚠️ 네트워크 오류 (시도 ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries) {
        throw error; // Throw on last attempt
      }
      
      // Wait before retry with exponential backoff
      await sleep(Math.pow(2, attempt - 1) * 1000);
    }
  }
};

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadImageSimple = async (file) => {
  try {
    console.log('🚀 Starting upload with file:', file.name, file.type, file.size);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/upload`);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await retryFetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      // Don't set Content-Type header - let browser handle it
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Upload successful:', data);
    return { data };
    
  } catch (error) {
    console.error('Upload error:', error);
    
    // Improved error handling with retry-aware messages
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('서버 연결에 문제가 있습니다. 자동으로 재시도했지만 실패했습니다. 잠시 후 다시 시도해주세요.');
    } else if (error.message.includes('NetworkError')) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }
    
    throw error;
  }
};

export const getResultsSimple = async (uploadId) => {
  try {
    console.log('Getting results for:', uploadId);
    
    const response = await retryFetch(`${API_BASE_URL}/api/results/${uploadId}`, {
      mode: 'cors'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // Import cache manager dynamically to avoid circular dependencies
        const { clearAllCaches } = await import('../utils/cacheManager');
        console.log('🗑️ 404 detected, clearing caches...');
        
        try {
          await clearAllCaches();
          console.log('✅ Caches cleared after 404 error');
        } catch (cacheError) {
          console.warn('⚠️ Cache clear failed:', cacheError);
        }
        
        throw new Error('UPLOAD_NOT_FOUND');
      }
      throw new Error(`Failed to get results: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Results:', data);
    return { data };
    
  } catch (error) {
    console.error('Get results error:', error);
    
    // Enhanced error handling for different scenarios
    if (error.message === 'UPLOAD_NOT_FOUND') {
      const errorMsg = '업로드된 데이터를 찾을 수 없습니다.\n\n' +
                      '가능한 원인:\n' +
                      '• 시스템이 재시작되어 데이터가 초기화됨\n' +
                      '• 잘못된 QR 코드 스캔\n' +
                      '• 네트워크 연결 문제\n\n' +
                      '해결방법: 새로운 이미지를 업로드해주세요.';
      
      const userFriendlyError = new Error(errorMsg);
      userFriendlyError.code = 'UPLOAD_NOT_FOUND';
      userFriendlyError.recoverable = true;
      throw userFriendlyError;
    } else if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      const errorMsg = 'QR 결과를 가져오는 중 네트워크 오류가 발생했습니다.\n\n' +
                      '자동 재시도 후에도 실패했습니다.\n' +
                      '잠시 후 다시 시도하거나 새로고침해주세요.';
      
      const networkError = new Error(errorMsg);
      networkError.code = 'NETWORK_ERROR';
      networkError.recoverable = true;
      throw networkError;
    }
    
    throw error;
  }
};

export const generateQRCode = async (uploadId) => {
  try {
    console.log('🎯 Generating QR code for:', uploadId);
    
    const response = await retryFetch(`${API_BASE_URL}/api/generate-qr/${uploadId}`, {
      method: 'POST',
      mode: 'cors'
    });
    
    console.log('QR Generation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('QR generation failed:', errorText);
      throw new Error(`QR generation failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('QR code generated:', data);
    return { data };
    
  } catch (error) {
    console.error('QR generation error:', error);
    throw error;
  }
};

export const getQRCode = async (uploadId) => {
  try {
    console.log('📱 Getting QR code for:', uploadId);
    
    const response = await retryFetch(`${API_BASE_URL}/api/qr/${uploadId}`, {
      mode: 'cors'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { data: null }; // QR not found, but not an error
      }
      throw new Error(`Failed to get QR code: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('QR code info:', data);
    return { data };
    
  } catch (error) {
    console.error('Get QR code error:', error);
    throw error;
  }
};