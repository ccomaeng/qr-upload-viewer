const { runQuery } = require('./init');

/**
 * Apply database migrations
 */
async function applyMigrations() {
  try {
    console.log('🔄 Applying database migrations...');
    
    // Migration 1: Add QR generation columns to uploads table
    await addQRColumns();
    
    console.log('✅ All migrations applied successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Add QR generation columns to uploads table
 */
async function addQRColumns() {
  try {
    // Check if columns already exist using the actual database instance
    const { getDatabase, allQuery } = require('./init');
    const db = await getDatabase();
    
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(uploads)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const existingColumns = tableInfo.map(col => col.name);
    
    // Add qr_generated column if it doesn't exist
    if (!existingColumns.includes('qr_generated')) {
      await runQuery(`
        ALTER TABLE uploads 
        ADD COLUMN qr_generated BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added qr_generated column');
    } else {
      console.log('ℹ️ qr_generated column already exists');
    }
    
    // Add generated_qr_path column if it doesn't exist
    if (!existingColumns.includes('generated_qr_path')) {
      await runQuery(`
        ALTER TABLE uploads 
        ADD COLUMN generated_qr_path TEXT
      `);
      console.log('✅ Added generated_qr_path column');
    } else {
      console.log('ℹ️ generated_qr_path column already exists');
    }
    
    // Add qr_generated_at column if it doesn't exist
    if (!existingColumns.includes('qr_generated_at')) {
      await runQuery(`
        ALTER TABLE uploads 
        ADD COLUMN qr_generated_at DATETIME
      `);
      console.log('✅ Added qr_generated_at column');
    } else {
      console.log('ℹ️ qr_generated_at column already exists');
    }
    
  } catch (error) {
    console.error('❌ Failed to add QR columns:', error);
    // Don't throw error if columns already exist - this is expected
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }
}

/**
 * Check migration status
 */
async function checkMigrationStatus() {
  try {
    const { getDatabase } = require('./init');
    const db = await getDatabase();
    
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(uploads)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const columns = tableInfo.map(col => col.name);
    
    return {
      hasQRGenerated: columns.includes('qr_generated'),
      hasGeneratedQRPath: columns.includes('generated_qr_path'),
      hasQRGeneratedAt: columns.includes('qr_generated_at')
    };
    
  } catch (error) {
    console.error('❌ Failed to check migration status:', error);
    return null;
  }
}

module.exports = {
  applyMigrations,
  addQRColumns,
  checkMigrationStatus
};