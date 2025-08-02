const Jimp = require('jimp');
const QrCode = require('qrcode-reader');

/**
 * Process an image file to extract QR codes
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Array>} Array of QR code results
 */
async function processQRImage(imagePath) {
  try {
    console.log(`🔍 Processing image: ${imagePath}`);
    
    // Read image with Jimp
    const image = await Jimp.read(imagePath);
    const { width, height } = image.bitmap;
    
    console.log(`📐 Image dimensions: ${width}x${height}`);
    
    // Convert to grayscale for better QR detection
    image.greyscale();
    
    // Try multiple processing approaches for better detection
    const results = [];
    
    // Approach 1: Original image
    const qrCodes1 = await extractQRFromImage(image);
    results.push(...qrCodes1);
    
    // Approach 2: Enhanced contrast
    const enhancedImage = image.clone().contrast(0.5);
    const qrCodes2 = await extractQRFromImage(enhancedImage);
    results.push(...qrCodes2);
    
    // Approach 3: Different threshold
    const thresholdImage = image.clone().contrast(1.0);
    const qrCodes3 = await extractQRFromImage(thresholdImage);
    results.push(...qrCodes3);
    
    // Remove duplicates based on content
    const uniqueResults = removeDuplicateQRCodes(results);
    
    console.log(`✅ Found ${uniqueResults.length} unique QR codes`);
    return uniqueResults;
    
  } catch (error) {
    console.error('❌ Error processing QR image:', error);
    throw new Error(`QR processing failed: ${error.message}`);
  }
}

/**
 * Extract QR codes from a Jimp image object
 * @param {Jimp} image - Jimp image object
 * @returns {Promise<Array>} Array of QR code results
 */
function extractQRFromImage(image) {
  return new Promise((resolve) => {
    try {
      const qr = new QrCode();
      const results = [];
      
      // Set up QR code callback
      qr.callback = function(err, value) {
        if (err) {
          // QR not found is not an error, just means no QR code in this image
          resolve([]);
          return;
        }
        
        if (value && value.result) {
          results.push({
            content: value.result,
            location: value.location || null,
            confidence: 1.0 // qrcode-reader doesn't provide confidence, so we use 1.0
          });
        }
        
        resolve(results);
      };
      
      // Decode the image
      qr.decode(image.bitmap);
      
    } catch (error) {
      console.warn('⚠️ QR extraction error:', error.message);
      resolve([]);
    }
  });
}

/**
 * Remove duplicate QR codes based on content
 * @param {Array} qrCodes - Array of QR code results
 * @returns {Array} Array of unique QR codes
 */
function removeDuplicateQRCodes(qrCodes) {
  const seen = new Set();
  const unique = [];
  
  for (const qr of qrCodes) {
    if (!seen.has(qr.content)) {
      seen.add(qr.content);
      unique.push(qr);
    }
  }
  
  return unique;
}

/**
 * Validate QR code content and classify type
 * @param {string} content - QR code content
 * @returns {Object} Classification result
 */
function classifyQRContent(content) {
  const classifications = {
    url: /^https?:\/\/.+/i,
    email: /^mailto:.+|^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
    phone: /^tel:|^\+?[\d\s\-\(\)]+$/,
    wifi: /^WIFI:/i,
    vcard: /^BEGIN:VCARD/i,
    geo: /^geo:/i,
    sms: /^sms:/i
  };
  
  for (const [type, pattern] of Object.entries(classifications)) {
    if (pattern.test(content)) {
      return { type, isStructured: true };
    }
  }
  
  return { type: 'text', isStructured: false };
}

/**
 * Enhanced QR processing with multiple detection strategies
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Array>} Enhanced QR results
 */
async function processQRImageEnhanced(imagePath) {
  try {
    const baseResults = await processQRImage(imagePath);
    
    // Enhance results with classification and validation
    const enhancedResults = baseResults.map(qr => {
      const classification = classifyQRContent(qr.content);
      
      return {
        ...qr,
        classification,
        length: qr.content.length,
        processedAt: new Date().toISOString()
      };
    });
    
    return enhancedResults;
    
  } catch (error) {
    console.error('❌ Enhanced QR processing failed:', error);
    throw error;
  }
}

/**
 * Batch process multiple images
 * @param {Array<string>} imagePaths - Array of image file paths
 * @returns {Promise<Array>} Array of processing results
 */
async function batchProcessQRImages(imagePaths) {
  const results = [];
  
  for (const imagePath of imagePaths) {
    try {
      const qrCodes = await processQRImageEnhanced(imagePath);
      results.push({
        imagePath,
        success: true,
        qrCodes,
        processedAt: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        imagePath,
        success: false,
        error: error.message,
        processedAt: new Date().toISOString()
      });
    }
  }
  
  return results;
}

module.exports = {
  processQRImage,
  processQRImageEnhanced,
  batchProcessQRImages,
  classifyQRContent
};