const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

// Database configuration
const isProduction = process.env.NODE_ENV === 'production';
const usePostgreSQL = process.env.DATABASE_URL || isProduction;

let pool = null;
let sqliteDb = null;

// PostgreSQL connection
async function getPostgreSQLPool() {
  if (pool) return pool;

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
}

// SQLite connection (fallback for development)
async function getSQLiteDatabase() {
  if (sqliteDb) return sqliteDb;

  try {
    const DB_PATH = path.join(__dirname, '../../data/qr_viewer.db');
    const dataDir = path.dirname(DB_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    return new Promise((resolve, reject) => {
      sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Error opening SQLite database:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          resolve(sqliteDb);
        }
      });
    });
  } catch (error) {
    console.error('❌ SQLite connection failed:', error);
    throw error;
  }
}

// Get appropriate database connection
async function getDatabase() {
  if (usePostgreSQL) {
    return await getPostgreSQLPool();
  } else {
    return await getSQLiteDatabase();
  }
}

// Initialize database schema
async function initDatabase() {
  console.log(`🔧 Initializing database (${usePostgreSQL ? 'PostgreSQL' : 'SQLite'})`);
  
  if (usePostgreSQL) {
    await initPostgreSQLSchema();
  } else {
    await initSQLiteSchema();
  }
}

// PostgreSQL schema initialization
async function initPostgreSQLSchema() {
  const db = await getPostgreSQLPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Create uploads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS uploads (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_status TEXT DEFAULT 'pending',
        processing_time INTEGER,
        error_message TEXT,
        qr_generated BOOLEAN DEFAULT FALSE,
        generated_qr_path TEXT,
        qr_generated_at TIMESTAMP
      )
    `);

    // Create qr_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS qr_results (
        id SERIAL PRIMARY KEY,
        upload_id TEXT NOT NULL,
        content TEXT NOT NULL,
        position_x INTEGER,
        position_y INTEGER,
        confidence REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_status 
      ON uploads(processing_status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_time 
      ON uploads(upload_time)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_qr_results_upload 
      ON qr_results(upload_id)
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL schema initialized successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing PostgreSQL schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// SQLite schema initialization (fallback)
async function initSQLiteSchema() {
  const database = await getSQLiteDatabase();
  
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

      // Create indexes
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
          console.log('✅ SQLite schema initialized successfully');
          resolve();
        }
      });
    });
  });
}

// Database query helpers
async function runQuery(sql, params = []) {
  if (usePostgreSQL) {
    const db = await getPostgreSQLPool();
    const client = await db.connect();
    try {
      const result = await client.query(sql, params);
      return { 
        id: result.rows[0]?.id, 
        changes: result.rowCount,
        rows: result.rows 
      };
    } finally {
      client.release();
    }
  } else {
    const db = await getSQLiteDatabase();
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
}

async function getQuery(sql, params = []) {
  if (usePostgreSQL) {
    const db = await getPostgreSQLPool();
    const client = await db.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  } else {
    const db = await getSQLiteDatabase();
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
}

async function allQuery(sql, params = []) {
  if (usePostgreSQL) {
    const db = await getPostgreSQLPool();
    const client = await db.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  } else {
    const db = await getSQLiteDatabase();
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
}

// Cleanup old uploads
async function cleanupOldUploads(daysOld = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldUploads = await allQuery(
      'SELECT id, filename FROM uploads WHERE upload_time < $1',
      [cutoffDate.toISOString()]
    );

    for (const upload of oldUploads) {
      const filePath = path.join(__dirname, '../../uploads', upload.filename);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`⚠️ Could not delete file ${upload.filename}:`, err.message);
      }
    }

    const result = await runQuery(
      'DELETE FROM uploads WHERE upload_time < $1',
      [cutoffDate.toISOString()]
    );

    console.log(`🧹 Cleaned up ${result.changes} old uploads`);
    return result.changes;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Close database connections
async function closeDatabase() {
  try {
    if (pool) {
      await pool.end();
      console.log('✅ PostgreSQL connection pool closed');
    }
    
    if (sqliteDb) {
      return new Promise((resolve) => {
        sqliteDb.close((err) => {
          if (err) {
            console.error('❌ Error closing SQLite database:', err);
          } else {
            console.log('✅ SQLite database connection closed');
          }
          resolve();
        });
      });
    }
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
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