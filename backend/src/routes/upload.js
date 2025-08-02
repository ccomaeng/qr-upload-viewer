const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const { processQRImage } = require('../services/qrProcessor');
const { generateQRForUpload, generateQRCodeDataURL } = require('../services/qrGenerator');
const { runQuery, getQuery, allQuery } = require('../database/init');
const { validateFileType, createUploadDir } = require('../utils/fileUtils');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    await createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter with security validation
const fileFilter = (req, file, cb) => {
  try {
    // Validate MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }

    // Validate file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Invalid file extension.'));
    }

    cb(null, true);
  } catch (error) {
    cb(error);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024, // Use env var or 20MB default
    files: 1 // Single file upload
  }
});

// Input validation schemas
const uploadSchema = Joi.object({
  file: Joi.object().required()
});

// POST /api/upload - Upload and process image
router.post('/upload', upload.single('image'), async (req, res) => {
  let uploadId = null;
  
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        code: 'NO_FILE'
      });
    }

    // Additional file validation
    const isValidFile = await validateFileType(req.file.path);
    if (!isValidFile) {
      // Delete invalid file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        error: 'Invalid or corrupted image file',
        code: 'INVALID_FILE'
      });
    }

    // Generate upload ID and save to database
    uploadId = uuidv4();
    await runQuery(`
      INSERT INTO uploads (id, filename, original_name, file_size, mime_type, processing_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uploadId,
      req.file.filename,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      'processing'
    ]);

    // Return immediate response
    res.status(202).json({
      success: true,
      uploadId,
      status: 'processing',
      message: 'Image uploaded successfully, processing QR codes...',
      imageUrl: `/uploads/${req.file.filename}`
    });

    // Process QR codes asynchronously
    setImmediate(async () => {
      try {
        const startTime = Date.now();
        const qrResults = await processQRImage(req.file.path);
        const processingTime = Date.now() - startTime;

        // Save QR results to database
        for (const qr of qrResults) {
          await runQuery(`
            INSERT INTO qr_results (upload_id, content, position_x, position_y, confidence)
            VALUES (?, ?, ?, ?, ?)
          `, [uploadId, qr.content, qr.location?.topLeftCorner?.x || 0, qr.location?.topLeftCorner?.y || 0, qr.confidence || 1.0]);
        }

        // Update upload status
        await runQuery(`
          UPDATE uploads 
          SET processing_status = ?, processing_time = ?
          WHERE id = ?
        `, ['completed', processingTime, uploadId]);

        console.log(`✅ Processed ${qrResults.length} QR codes for upload ${uploadId} in ${processingTime}ms`);
      } catch (error) {
        console.error(`❌ Error processing QR codes for upload ${uploadId}:`, error);
        
        // Update upload status with error
        await runQuery(`
          UPDATE uploads 
          SET processing_status = ?, error_message = ?
          WHERE id = ?
        `, ['failed', error.message, uploadId]);
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up file if upload failed
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    // Update database if upload was created
    if (uploadId) {
      await runQuery(`
        UPDATE uploads 
        SET processing_status = ?, error_message = ?
        WHERE id = ?
      `, ['failed', error.message, uploadId]).catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error during upload',
      code: 'UPLOAD_ERROR'
    });
  }
});

// GET /api/results/:uploadId - Get processing results
router.get('/results/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;

    // Validate uploadId format
    if (!uploadId || typeof uploadId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid upload ID',
        code: 'INVALID_UPLOAD_ID'
      });
    }

    // Get upload info
    const upload = await getQuery(`
      SELECT id, original_name, processing_status, processing_time, error_message, upload_time
      FROM uploads 
      WHERE id = ?
    `, [uploadId]);

    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found',
        code: 'UPLOAD_NOT_FOUND'
      });
    }

    // Get QR results
    const qrResults = await allQuery(`
      SELECT content, position_x, position_y, confidence, created_at
      FROM qr_results 
      WHERE upload_id = ?
      ORDER BY created_at ASC
    `, [uploadId]);

    res.json({
      success: true,
      uploadId,
      status: upload.processing_status,
      processingTime: upload.processing_time,
      uploadTime: upload.upload_time,
      originalName: upload.original_name,
      qrCodes: qrResults.map(qr => ({
        content: qr.content,
        position: {
          x: qr.position_x,
          y: qr.position_y
        },
        confidence: qr.confidence
      })),
      error: upload.error_message || null
    });

  } catch (error) {
    console.error('❌ Error fetching results:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/uploads/:uploadId - Get single upload details
router.get('/uploads/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;

    // Get upload info
    const upload = await getQuery(`
      SELECT id, filename, original_name, file_size, mime_type, upload_time, processing_status, processing_time, error_message
      FROM uploads 
      WHERE id = ?
    `, [uploadId]);

    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found',
        code: 'UPLOAD_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      upload: {
        id: upload.id,
        filename: upload.filename,
        originalName: upload.original_name,
        fileSize: upload.file_size,
        mimeType: upload.mime_type,
        uploadTime: upload.upload_time,
        status: upload.processing_status,
        processingTime: upload.processing_time,
        error: upload.error_message
      }
    });

  } catch (error) {
    console.error('❌ Error fetching upload:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/uploads - Get upload history (optional)
router.get('/uploads', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const uploads = await allQuery(`
      SELECT 
        u.id,
        u.original_name,
        u.file_size,
        u.upload_time,
        u.processing_status,
        u.processing_time,
        COUNT(qr.id) as qr_count
      FROM uploads u
      LEFT JOIN qr_results qr ON u.id = qr.upload_id
      GROUP BY u.id
      ORDER BY u.upload_time DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalUploads = await getQuery('SELECT COUNT(*) as count FROM uploads');

    res.json({
      success: true,
      uploads: uploads.map(upload => ({
        id: upload.id,
        originalName: upload.original_name,
        fileSize: upload.file_size,
        uploadTime: upload.upload_time,
        status: upload.processing_status,
        processingTime: upload.processing_time,
        qrCount: upload.qr_count
      })),
      pagination: {
        total: totalUploads.count,
        limit,
        offset,
        hasMore: offset + limit < totalUploads.count
      }
    });

  } catch (error) {
    console.error('❌ Error fetching uploads:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// DELETE /api/uploads/:uploadId - Delete upload and associated files
router.delete('/uploads/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;

    // Get upload info first
    const upload = await getQuery(`
      SELECT filename FROM uploads WHERE id = ?
    `, [uploadId]);

    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found',
        code: 'UPLOAD_NOT_FOUND'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', upload.filename);
    await fs.unlink(filePath).catch(err => {
      console.warn(`⚠️ Could not delete file ${upload.filename}:`, err.message);
    });

    // Delete from database (CASCADE will handle qr_results)
    await runQuery('DELETE FROM uploads WHERE id = ?', [uploadId]);

    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting upload:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/generate-qr/:uploadId - Generate QR code for upload
router.post('/generate-qr/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // Validate uploadId format
    if (!uploadId || typeof uploadId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid upload ID',
        code: 'INVALID_UPLOAD_ID'
      });
    }
    
    // Get upload info
    const upload = await getQuery(`
      SELECT id, filename, original_name, upload_time, qr_generated, generated_qr_path
      FROM uploads 
      WHERE id = ?
    `, [uploadId]);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found',
        code: 'UPLOAD_NOT_FOUND'
      });
    }
    
    // Check if QR already generated
    if (upload.qr_generated && upload.generated_qr_path) {
      return res.json({
        success: true,
        message: 'QR code already exists',
        uploadId,
        qrImagePath: upload.generated_qr_path,
        qrImageUrl: `/uploads/${upload.generated_qr_path}`,
        generatedAt: upload.qr_generated_at
      });
    }
    
    // Generate new QR code
    const qrResult = await generateQRForUpload({
      uploadId: upload.id,
      filename: upload.filename,
      originalName: upload.original_name,
      uploadTime: upload.upload_time
    });
    
    if (!qrResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate QR code',
        code: 'QR_GENERATION_FAILED'
      });
    }
    
    // Update database with QR info
    await runQuery(`
      UPDATE uploads 
      SET qr_generated = TRUE, generated_qr_path = ?, qr_generated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [qrResult.qrImagePath, uploadId]);
    
    res.json({
      success: true,
      message: 'QR code generated successfully',
      uploadId,
      qrImagePath: qrResult.qrImagePath,
      qrImageUrl: `/uploads/${qrResult.qrImagePath}`,
      qrContent: qrResult.qrContent,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ QR generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during QR generation',
      code: 'QR_GENERATION_ERROR'
    });
  }
});

// GET /api/qr/:uploadId - Get QR code for upload
router.get('/qr/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // Get upload info with QR data
    const upload = await getQuery(`
      SELECT id, filename, original_name, upload_time, qr_generated, generated_qr_path, qr_generated_at
      FROM uploads 
      WHERE id = ?
    `, [uploadId]);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found',
        code: 'UPLOAD_NOT_FOUND'
      });
    }
    
    if (!upload.qr_generated || !upload.generated_qr_path) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found for this upload',
        code: 'QR_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      uploadId,
      qrImagePath: upload.generated_qr_path,
      qrImageUrl: `/uploads/${upload.generated_qr_path}`,
      generatedAt: upload.qr_generated_at
    });
    
  } catch (error) {
    console.error('❌ Error fetching QR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/generate-custom-qr - Generate custom QR code
router.post('/generate-custom-qr', async (req, res) => {
  try {
    const { text, style = {} } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
        code: 'MISSING_TEXT'
      });
    }
    
    // Generate QR as data URL
    const qrDataURL = await generateQRCodeDataURL(text, style);
    
    res.json({
      success: true,
      qrDataURL,
      text,
      style
    });
    
  } catch (error) {
    console.error('❌ Custom QR generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate custom QR code',
      code: 'CUSTOM_QR_ERROR'
    });
  }
});

module.exports = router;