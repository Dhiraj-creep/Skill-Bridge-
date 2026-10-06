import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { populateRichDemoData } from './populate-rich-demo-data.js';

const TEST_DIR = path.resolve('server/database/test_scratch');
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });

const testDbPath = path.join(TEST_DIR, 'test_rich_demo.sqlite');
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

// Copy existing schema and opportunities from cep_portal.sqlite into testDbPath
const sourceDb = new DatabaseSync('server/database/cep_portal.sqlite');
const testDb = new DatabaseSync(testDbPath);
testDb.exec('PRAGMA foreign_keys = OFF;');

// Replicate schema
const tables = sourceDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { sql: string }[];
for (const t of tables) {
  if (t.sql) testDb.exec(t.sql);
}

// Copy opportunities & training sessions
const opps = sourceDb.prepare('SELECT * FROM opportunities').all() as any[];
for (const o of opps) {
  testDb.prepare(`
    INSERT INTO opportunities (
      id, title, employer, type, relevant_departments, subdomain,
      skills, explicit_eligibility, location, work_mode, fixed_pay_or_stipend,
      incentives, deadline, description, posted_date, source_status, is_expired, is_archived
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    o.id, o.title, o.employer, o.type, o.relevant_departments, o.subdomain,
    o.skills, o.explicit_eligibility, o.location, o.work_mode, o.fixed_pay_or_stipend,
    o.incentives, o.deadline, o.description, o.posted_date, o.source_status, o.is_expired, o.is_archived
  );
}

const wss = sourceDb.prepare('SELECT * FROM training_sessions').all() as any[];
for (const w of wss) {
  testDb.prepare(`
    INSERT INTO training_sessions (
      id, title, department, description, target_skills, mode, schedule, capacity, enrolled_count, trainer, venue, source_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    w.id, w.title, w.department, w.description, w.target_skills, w.mode, w.schedule, w.capacity, w.enrolled_count, w.trainer, w.venue, w.source_status
  );
}

testDb.exec('PRAGMA foreign_keys = ON;');

// Run population
populateRichDemoData(testDb);

// Verify metrics
const regStudents = (testDb.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'Student'").get() as any).c;
const pendingApps = (testDb.prepare("SELECT COUNT(*) as c FROM applications WHERE status IN ('Submitted', 'Under Review')").get() as any).c;
const openFb = (testDb.prepare("SELECT COUNT(*) as c FROM feedback_submissions WHERE status != 'Resolved'").get() as any).c;
const pendGd = (testDb.prepare("SELECT COUNT(*) as c FROM guidance_requests WHERE status IN ('Pending', 'Requested')").get() as any).c;
const totEnr = (testDb.prepare("SELECT COUNT(*) as c FROM workshop_enrollments WHERE attendance_status != 'Cancelled'").get() as any).c;

console.log('\n--- VERIFICATION METRICS ---');
console.log('Registered Cohort:', regStudents);
console.log('Pending Review:', pendingApps);
console.log('Open Grievances:', openFb);
console.log('Guidance Slots Awaiting Schedule:', pendGd);
console.log('Workshop Rosters (Seats Allocated):', totEnr);

// Cleanup
testDb.close();
sourceDb.close();
fs.unlinkSync(testDbPath);
console.log('\nIsolated test passed and cleaned up!');
