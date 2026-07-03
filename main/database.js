const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let db = null;
let dbPath = null;

/**
 * Initializes the SQLite database file and tables.
 */
async function initDatabase(appUserDataPath) {
  dbPath = path.join(appUserDataPath, 'typeflow.db');
  
  // Ensure application user data directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Load sql.js WebAssembly engine
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    // Execute SQL schema creation
    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          settings TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER NOT NULL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          wpm REAL NOT NULL,
          accuracy REAL NOT NULL,
          error_count INTEGER NOT NULL,
          duration INTEGER NOT NULL,
          session_type TEXT NOT NULL, -- 'placement' | 'lesson' | 'custom'
          source_name TEXT NOT NULL,
          problem_keys TEXT NOT NULL, -- JSON string
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_texts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS badges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER NOT NULL,
          badge_id TEXT NOT NULL,
          unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(profile_id, badge_id),
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );
    `);
    saveDb();
  }
}

/**
 * Saves database state to disk.
 */
function saveDb() {
  if (db && dbPath) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

/**
 * Helper to run a SELECT query returning multiple rows as standard JS objects.
 */
function query(sql, params = []) {
  if (!db) throw new Error("Database not initialized");
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Helper to run a SELECT query returning a single row.
 */
function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Helper to execute INSERT/UPDATE/DELETE statement. Saves db state to disk.
 * Returns the last insert row ID.
 */
function run(sql, params = []) {
  if (!db) throw new Error("Database not initialized");
  db.run(sql, params);
  saveDb();
  
  // Get last insert ID
  const res = db.exec("SELECT last_insert_rowid() AS id");
  if (res.length > 0 && res[0].values.length > 0) {
    return res[0].values[0][0];
  }
  return null;
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  run
};
