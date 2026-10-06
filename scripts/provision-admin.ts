import { DatabaseSync } from 'node:sqlite';
import { DB_PATH, isProduction } from '../server/config';
import { hashPassword } from '../server/auth';
import { initSchema, db } from '../server/db';

console.log(`[Admin Provisioning] Target database: ${DB_PATH}`);

// Ensure database schema exists
initSchema();

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const isReset = process.argv.includes('--reset') || process.env.ADMIN_RESET === 'true';
const isDemo = process.argv.includes('--demo') || process.env.ADMIN_DEMO === 'true';

const username = args[0] || process.env.ADMIN_USER || (isDemo ? 'admin' : '');
let password = args[1] || process.env.ADMIN_PASS || '';
const email = args[2] || process.env.ADMIN_EMAIL || (username ? `${username}@skillbridge.edu` : 'admin@skillbridge.edu');
const fullName = args[3] || process.env.ADMIN_FULLNAME || 'System Administrator';

if (!password && isDemo && !isProduction) {
  password = 'Admin@123';
  console.log('[Admin Provisioning] Notice: Using development demo password for local testing.');
}

if (!username) {
  console.error('Error: Administrator username is required.');
  console.error('Usage: npx tsx scripts/provision-admin.ts <username> <password> [email] [fullName] [--reset] [--demo]');
  process.exit(1);
}

if (!password) {
  console.error('Error: Administrator password must be explicitly provided.');
  console.error('Provide the password as the second argument or set the ADMIN_PASS environment variable.');
  console.error('For non-production demo setups, pass the --demo flag.');
  process.exit(1);
}

const existing = db.prepare('SELECT id, role FROM users WHERE username = ?').get(username) as { id: string; role: string } | undefined;

const hashed = hashPassword(password);

if (existing) {
  if (!isReset) {
    console.error(`Error: User "${username}" already exists. To update this account's password, specify the --reset flag.`);
    process.exit(1);
  }

  db.prepare(`
    UPDATE users
    SET password_hash = ?, salt = ?, role = 'Admin', full_name = ?, email = ?
    WHERE username = ?
  `).run(hashed.hash, hashed.salt, fullName, email, username);

  console.log(`[Admin Provisioning] Successfully reset password and privileges for administrator "${username}".`);
} else {
  const id = `USR-ADMIN-${Date.now().toString().slice(-4)}`;
  db.prepare(`
    INSERT INTO users (id, username, password_hash, salt, role, full_name, department, email, created_at)
    VALUES (?, ?, ?, ?, 'Admin', ?, 'All Departments', ?, datetime('now'))
  `).run(id, username, hashed.hash, hashed.salt, fullName, email);

  console.log(`[Admin Provisioning] Successfully created new administrator account "${username}".`);
}
