import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { DB_PATH } from '../server/config';

const dbPath = DB_PATH;
const backupDir = path.join(path.dirname(dbPath), 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `cep_portal_backup_${timestamp}.sqlite`);

console.log(`[Backup] Opening database at: ${dbPath}`);
const db = new DatabaseSync(dbPath);

console.log('[Backup] Executing WAL checkpoint (TRUNCATE)...');
const checkpoint = db.prepare('PRAGMA wal_checkpoint(TRUNCATE);').all();
console.log('[Backup] Checkpoint result:', checkpoint);

console.log(`[Backup] Executing VACUUM INTO '${backupPath}'...`);
// Format path with forward slashes for SQLite string literal
const sqliteTarget = backupPath.replace(/\\/g, '/');
db.exec(`VACUUM INTO '${sqliteTarget}';`);

db.close();

const stats = fs.statSync(backupPath);
console.log(`[Backup] Successfully created WAL-safe backup at: ${backupPath} (${Math.round(stats.size / 1024)} KB)`);
