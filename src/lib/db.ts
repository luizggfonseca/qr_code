import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');

const db = new Database(DB_PATH);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS qr_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_path TEXT,
    color TEXT DEFAULT '#000000',
    bgcolor TEXT DEFAULT '#ffffff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
