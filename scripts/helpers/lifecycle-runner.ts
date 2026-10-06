import { DatabaseSync } from 'node:sqlite';
import { DB_PATH } from '../../server/config';
import { initDatabase, seedDatabase } from '../../server/db';

const command = process.argv[2];

try {
  if (command === 'init-prod') {
    initDatabase();
    const db = new DatabaseSync(DB_PATH);
    const userCount = (db.prepare('SELECT count(*) as c FROM users').get() as any).c;
    const appCount = (db.prepare('SELECT count(*) as c FROM applications').get() as any).c;
    const oppCount = (db.prepare('SELECT count(*) as c FROM opportunities').get() as any).c;
    const docCount = (db.prepare('SELECT count(*) as c FROM system_documents').get() as any).c;
    db.close();
    console.log(`PROD_RESULTS:${JSON.stringify({ dbPath: DB_PATH, userCount, appCount, oppCount, docCount })}`);
  } else if (command === 'restart-prod') {
    initDatabase();
    const db = new DatabaseSync(DB_PATH);
    const oppCount = (db.prepare('SELECT count(*) as c FROM opportunities').get() as any).c;
    db.close();
    console.log(`RESTART_OPPS:${oppCount}`);
  } else if (command === 'seed-demo') {
    seedDatabase(true);
    const db = new DatabaseSync(DB_PATH);
    const userCount = (db.prepare('SELECT count(*) as c FROM users').get() as any).c;
    const appCount = (db.prepare('SELECT count(*) as c FROM applications').get() as any).c;
    const enrCount = (db.prepare('SELECT count(*) as c FROM workshop_enrollments').get() as any).c;
    db.close();
    console.log(`DEMO_RESULTS:${JSON.stringify({ dbPath: DB_PATH, userCount, appCount, enrCount })}`);
  } else if (command === 'check-config') {
    console.log(`RESOLVED_DB_PATH:${DB_PATH}`);
  } else {
    console.error(`Unknown lifecycle command: ${command}`);
    process.exit(1);
  }
} catch (err: any) {
  console.error('LIFECYCLE_ERROR:', err?.message || err);
  process.exit(1);
}
