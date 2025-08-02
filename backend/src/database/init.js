const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

const DB_PATH = path.join(__dirname, '../../data/qr_viewer.db');

let db = null;

// Database connection with retry logic
async function getDatabase() {
  if (db) return db;
  
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          resolve(db);
        }
      });
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Initialize database schema
async function initDatabase() {
  const database = await getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Create uploads table
      database.run(`
        CREATE TABLE IF NOT EXISTS uploads (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          processing_status TEXT DEFAULT 'pending',
          processing_time INTEGER,
          error_message TEXT,
          qr_generated BOOLEAN DEFAULT FALSE,
          generated_qr_path TEXT,
          qr_generated_at DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating uploads table:', err);
          reject(err);
          return;
        }
      });

      // Create qr_results table
      database.run(`
        CREATE TABLE IF NOT EXISTS qr_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          upload_id TEXT NOT NULL,
          content TEXT NOT NULL,
          position_x INTEGER,
          position_y INTEGER,
          confidence REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating qr_results table:', err);
          reject(err);
          return;
        }
      });

      // Create indexes for better performance
      database.run(`
        CREATE INDEX IF NOT EXISTS idx_uploads_status 
        ON uploads(processing_status)
      `);

      database.run(`
        CREATE INDEX IF NOT EXISTS idx_uploads_time 
        ON uploads(upload_time)
      `);

      database.run(`
        CREATE INDEX IF NOT EXISTS idx_qr_results_upload 
        ON qr_results(upload_id)
      `, (err) => {
        if (err) {
          console.error('❌ Error creating indexes:', err);
          reject(err);
        } else {
          console.log('✅ Database schema initialized successfully');
          resolve();
        }
      });
    });
  });
}

// Database query helpers
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Cleanup old uploads (run this periodically)
async function cleanupOldUploads(daysOld = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldUploads = await allQuery(
      'SELECT id, filename FROM uploads WHERE upload_time < ?',
      [cutoffDate.toISOString()]
    );

    for (const upload of oldUploads) {
      // Delete file
      const filePath = path.join(__dirname, '../../uploads', upload.filename);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`⚠️ Could not delete file ${upload.filename}:`, err.message);
      }
    }

    // Delete database records
    const result = await runQuery(
      'DELETE FROM uploads WHERE upload_time < ?',
      [cutoffDate.toISOString()]
    );

    console.log(`🧹 Cleaned up ${result.changes} old uploads`);
    return result.changes;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Close database connection
function closeDatabase() {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('✅ Database connection closed');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  runQuery,
  getQuery,
  allQuery,
  cleanupOldUploads,
  closeDatabase
};