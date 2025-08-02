// Simple API test without axios complications
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://qr-upload-viewer-backend.onrender.com';

export const uploadImageSimple = async (file) => {
  try {
    console.log('🚀 Starting upload with file:', file.name, file.type, file.size);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/upload`);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
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
    throw error;
  }
};

export const getResultsSimple = async (uploadId) => {
  try {
    console.log('Getting results for:', uploadId);
    
    const response = await fetch(`${API_BASE_URL}/api/results/${uploadId}`, {
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get results: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Results:', data);
    return { data };
    
  } catch (error) {
    console.error('Get results error:', error);
    throw error;
  }
};

export const generateQRCode = async (uploadId) => {
  try {
    console.log('🎯 Generating QR code for:', uploadId);
    
    const response = await fetch(`${API_BASE_URL}/api/generate-qr/${uploadId}`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/qr/${uploadId}`, {
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