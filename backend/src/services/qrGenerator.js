const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate QR code for uploaded image
 * @param {Object} uploadData - Upload information
 * @param {string} uploadData.uploadId - Upload ID
 * @param {string} uploadData.filename - File name
 * @param {string} uploadData.originalName - Original file name
 * @param {string} uploadData.uploadTime - Upload timestamp
 * @returns {Promise<Object>} QR generation result
 */
async function generateQRForUpload(uploadData) {
  try {
    const { uploadId, filename, originalName, uploadTime } = uploadData;
    
    console.log(`🎯 Generating QR code for upload: ${uploadId}`);
    
    // Create QR content with image information
    const qrContent = {
      type: "image_upload",
      uploadId,
      imageUrl: `https://qr-upload-viewer-backend.onrender.com/uploads/${filename}`,
      originalName,
      uploadTime,
      viewUrl: `https://qr-upload-viewer.vercel.app/view.html?id=${uploadId}`,
      generatedAt: new Date().toISOString()
    };
    
    // Convert to JSON string
    const qrText = JSON.stringify(qrContent);
    
    // Generate QR code image
    const qrImagePath = await generateQRCodeImage(qrText, uploadId);
    
    console.log(`✅ QR code generated successfully: ${qrImagePath}`);
    
    return {
      success: true,
      qrImagePath,
      qrContent,
      qrText
    };
    
  } catch (error) {
    console.error('❌ QR generation failed:', error);
    throw new Error(`QR generation failed: ${error.message}`);
  }
}

/**
 * Generate QR code image file
 * @param {string} text - Text to encode in QR code
 * @param {string} uploadId - Upload ID for filename
 * @returns {Promise<string>} Path to generated QR image
 */
async function generateQRCodeImage(text, uploadId) {
  try {
    // Create QR codes directory if it doesn't exist
    const qrDir = path.join(__dirname, '../../uploads/qr-codes');
    await fs.mkdir(qrDir, { recursive: true });
    
    // Generate filename
    const qrFileName = `qr-${uploadId}-${Date.now()}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    
    // QR code options
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256 // 256x256 pixels
    };
    
    // Generate and save QR code
    await QRCode.toFile(qrFilePath, text, qrOptions);
    
    return `qr-codes/${qrFileName}`;
    
  } catch (error) {
    console.error('❌ QR image generation failed:', error);
    throw error;
  }
}

/**
 * Generate simple URL QR code
 * @param {string} url - URL to encode
 * @param {string} filename - Output filename
 * @returns {Promise<string>} Path to generated QR image
 */
async function generateURLQRCode(url, filename = null) {
  try {
    const qrDir = path.join(__dirname, '../../uploads/qr-codes');
    await fs.mkdir(qrDir, { recursive: true });
    
    const qrFileName = filename || `qr-url-${Date.now()}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#667eea', // Theme primary color
        light: '#FFFFFF'
      },
      width: 200
    };
    
    await QRCode.toFile(qrFilePath, url, qrOptions);
    
    return `qr-codes/${qrFileName}`;
    
  } catch (error) {
    console.error('❌ URL QR generation failed:', error);
    throw error;
  }
}

/**
 * Generate QR code as base64 data URL
 * @param {string} text - Text to encode
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Base64 data URL
 */
async function generateQRCodeDataURL(text, options = {}) {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256,
      ...options
    };
    
    const dataURL = await QRCode.toDataURL(text, defaultOptions);
    return dataURL;
    
  } catch (error) {
    console.error('❌ QR data URL generation failed:', error);
    throw error;
  }
}

/**
 * Generate custom styled QR code
 * @param {string} text - Text to encode
 * @param {Object} style - Style options
 * @returns {Promise<string>} Base64 data URL
 */
async function generateStyledQRCode(text, style = {}) {
  try {
    const {
      size = 256,
      darkColor = '#000000',
      lightColor = '#FFFFFF',
      errorCorrectionLevel = 'M'
    } = style;
    
    const options = {
      errorCorrectionLevel,
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor
      },
      width: size
    };
    
    return await QRCode.toDataURL(text, options);
    
  } catch (error) {
    console.error('❌ Styled QR generation failed:', error);
    throw error;
  }
}

/**
 * Batch generate QR codes for multiple uploads
 * @param {Array} uploadsData - Array of upload data objects
 * @returns {Promise<Array>} Array of QR generation results
 */
async function batchGenerateQRCodes(uploadsData) {
  const results = [];
  
  for (const uploadData of uploadsData) {
    try {
      const qrResult = await generateQRForUpload(uploadData);
      results.push({
        uploadId: uploadData.uploadId,
        success: true,
        ...qrResult
      });
    } catch (error) {
      results.push({
        uploadId: uploadData.uploadId,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Validate and parse QR content
 * @param {string} qrText - QR code text content
 * @returns {Object} Parsed QR content
 */
function parseQRContent(qrText) {
  try {
    const content = JSON.parse(qrText);
    
    // Validate required fields
    if (!content.type || !content.uploadId) {
      throw new Error('Invalid QR content structure');
    }
    
    return {
      isValid: true,
      content,
      type: content.type
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      originalText: qrText
    };
  }
}

module.exports = {
  generateQRForUpload,
  generateQRCodeImage,
  generateURLQRCode,
  generateQRCodeDataURL,
  generateStyledQRCode,
  batchGenerateQRCodes,
  parseQRContent
};