const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

/**
 * Validate file type by checking magic bytes (file signature)
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} True if valid image file
 */
async function validateFileType(filePath) {
  try {
    // Read first 12 bytes to check file signature
    const buffer = Buffer.alloc(12);
    const fileHandle = await fs.open(filePath, 'r');
    await fileHandle.read(buffer, 0, 12, 0);
    await fileHandle.close();

    // Check file signatures
    const signatures = {
      // JPEG
      jpeg1: [0xFF, 0xD8, 0xFF, 0xE0],
      jpeg2: [0xFF, 0xD8, 0xFF, 0xE1], 
      jpeg3: [0xFF, 0xD8, 0xFF, 0xE8],
      jpeg4: [0xFF, 0xD8, 0xFF, 0xDB],
      
      // PNG
      png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
      
      // GIF
      gif87a: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      gif89a: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
      
      // WebP
      webp: [0x52, 0x49, 0x46, 0x46] // RIFF (check bytes 8-11 for WEBP)
    };

    // Check signatures
    for (const [format, signature] of Object.entries(signatures)) {
      if (format === 'webp') {
        // Special check for WebP (RIFF + WEBP at offset 8)
        if (matchesSignature(buffer, signature, 0)) {
          const webpBuffer = Buffer.alloc(4);
          const fh = await fs.open(filePath, 'r');
          await fh.read(webpBuffer, 0, 4, 8);
          await fh.close();
          if (webpBuffer.toString() === 'WEBP') {
            return true;
          }
        }
      } else if (matchesSignature(buffer, signature, 0)) {
        return true;
      }
    }

    // Additional validation using Sharp
    try {
      const metadata = await sharp(filePath).metadata();
      return metadata.format && ['jpeg', 'png', 'gif', 'webp'].includes(metadata.format);
    } catch {
      return false;
    }

  } catch (error) {
    console.error('❌ File validation error:', error);
    return false;
  }
}

/**
 * Check if buffer matches signature at given offset
 * @param {Buffer} buffer - File buffer
 * @param {Array} signature - Signature bytes
 * @param {number} offset - Offset in buffer
 * @returns {boolean} True if matches
 */
function matchesSignature(buffer, signature, offset = 0) {
  for (let i = 0; i < signature.length; i++) {
    if (buffer[offset + i] !== signature[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Create upload directory if it doesn't exist
 * @param {string} uploadDir - Directory path
 * @returns {Promise<void>}
 */
async function createUploadDir(uploadDir) {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadDir}`);
  }
}

/**
 * Get file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .substring(0, 255);
}

/**
 * Validate image dimensions and file size
 * @param {string} filePath - Path to image file
 * @returns {Promise<Object>} Validation result
 */
async function validateImageConstraints(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    const stats = await fs.stat(filePath);
    
    const constraints = {
      maxWidth: 8000,
      maxHeight: 8000,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      minWidth: 50,
      minHeight: 50
    };

    const violations = [];

    if (metadata.width > constraints.maxWidth) {
      violations.push(`Width ${metadata.width}px exceeds maximum ${constraints.maxWidth}px`);
    }

    if (metadata.height > constraints.maxHeight) {
      violations.push(`Height ${metadata.height}px exceeds maximum ${constraints.maxHeight}px`);
    }

    if (metadata.width < constraints.minWidth) {
      violations.push(`Width ${metadata.width}px below minimum ${constraints.minWidth}px`);
    }

    if (metadata.height < constraints.minHeight) {
      violations.push(`Height ${metadata.height}px below minimum ${constraints.minHeight}px`);
    }

    if (stats.size > constraints.maxFileSize) {
      violations.push(`File size ${formatFileSize(stats.size)} exceeds maximum ${formatFileSize(constraints.maxFileSize)}`);
    }

    return {
      valid: violations.length === 0,
      violations,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        fileSize: stats.size,
        fileSizeFormatted: formatFileSize(stats.size)
      }
    };

  } catch (error) {
    return {
      valid: false,
      violations: [`Failed to validate image: ${error.message}`],
      metadata: null
    };
  }
}

/**
 * Compress image if it's too large
 * @param {string} inputPath - Input image path
 * @param {string} outputPath - Output image path
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} Compression result
 */
async function compressImage(inputPath, outputPath, options = {}) {
  try {
    const defaultOptions = {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 85,
      format: 'jpeg'
    };

    const config = { ...defaultOptions, ...options };

    const result = await sharp(inputPath)
      .resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: config.quality })
      .toFile(outputPath);

    return {
      success: true,
      originalSize: (await fs.stat(inputPath)).size,
      compressedSize: result.size,
      compressionRatio: ((await fs.stat(inputPath)).size - result.size) / (await fs.stat(inputPath)).size,
      outputPath
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clean up old files based on age
 * @param {string} directory - Directory to clean
 * @param {number} maxAgeHours - Maximum age in hours
 * @returns {Promise<number>} Number of files deleted
 */
async function cleanupOldFiles(directory, maxAgeHours = 24) {
  try {
    const files = await fs.readdir(directory);
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    console.log(`🧹 Cleaned up ${deletedCount} old files from ${directory}`);
    return deletedCount;

  } catch (error) {
    console.error('❌ Error during file cleanup:', error);
    return 0;
  }
}

module.exports = {
  validateFileType,
  createUploadDir,
  formatFileSize,
  sanitizeFilename,
  validateImageConstraints,
  compressImage,
  cleanupOldFiles
};