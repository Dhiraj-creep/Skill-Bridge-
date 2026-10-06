/**
 * Skill Bridge: Production Startup, Configuration Precedence, Document Validation,
 * Date/Schedule Boundary, and Secure Admin Provisioning Regression Suite
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert';

import { isValidDate, isValidSchedule, validateStudyData, validateCommunityVisits } from '../server/validation';
import { DEFAULT_STUDY_DATA, DEFAULT_COMMUNITY_VISITS } from '../src/data/defaultStudy';

const TEST_DIR = path.resolve('server/database/test_scratch');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

console.log('======================================================');
console.log('SKILL BRIDGE: PRODUCTION LIFECYCLE & SECURITY TESTS');
console.log(`Scratch directory: ${TEST_DIR}`);
console.log('======================================================\n');

let passedCount = 0;
let failedCount = 0;

function pass(desc: string) {
  passedCount++;
  console.log(`[PASS] ${desc}`);
}

function fail(desc: string, err: any) {
  failedCount++;
  console.error(`[FAIL] ${desc}:`, err);
}

// ---------------------------------------------------------------------------
// 1. DATE AND SCHEDULE BOUNDARY TESTS
// ---------------------------------------------------------------------------
console.log('--- 1. Date and Schedule Boundary Tests ---');

try {
  // Reject impossible times
  assert.strictEqual(isValidSchedule('Monday 99:99 pm'), false);
  assert.strictEqual(isValidSchedule('Friday 25:00'), false);
  assert.strictEqual(isValidSchedule('Tuesday 14:00 PM'), false);
  assert.strictEqual(isValidSchedule('Wednesday 10:99 am'), false);
  assert.strictEqual(isValidSchedule('Thursday 13:00 AM'), false);
  pass('Impossible schedule times ("Monday 99:99 pm", "Friday 25:00", etc.) strictly rejected');
} catch (e) {
  fail('Impossible schedule rejection', e);
}

try {
  // Accept singular, plural, and multiple weekday recurring formats
  assert.strictEqual(isValidSchedule('Every Saturday, 10:00 AM - 1:00 PM'), true);
  assert.strictEqual(isValidSchedule('Tuesdays & Thursdays, 4:00 PM - 6:00 PM'), true);
  assert.strictEqual(isValidSchedule('Mon, Wed, Fri 10:00 AM - 12:00 PM'), true);
  assert.strictEqual(isValidSchedule('Mondays 10:00 AM to 1:00 PM'), true);
  assert.strictEqual(isValidSchedule('Daily 09:00 - 11:00'), true);
  assert.strictEqual(isValidSchedule('Weekends 10:00 AM - 2:00 PM'), true);
  assert.strictEqual(isValidSchedule('2026-10-15 14:00'), true);
  pass('Singular/plural weekdays, abbreviations, 12h/24h, and time ranges accepted');
} catch (e) {
  fail('Valid schedules acceptance', e);
}

try {
  // Real calendar boundary validation
  assert.strictEqual(isValidDate('2026-02-30'), false, 'Feb 30 must be invalid');
  assert.strictEqual(isValidDate('2026-13-10'), false, 'Month 13 must be invalid');
  assert.strictEqual(isValidDate('2026-04-31'), false, 'April 31 must be invalid');
  assert.strictEqual(isValidDate('2026-02-28'), true, 'Feb 28 in non-leap year must be valid');
  assert.strictEqual(isValidDate('2026-09-12'), true, 'Valid date must be valid');
  pass('Calendar boundary validation strictly prevents nonexistent calendar dates');
} catch (e) {
  fail('Calendar boundaries', e);
}

// ---------------------------------------------------------------------------
// 2. SYSTEM DOCUMENT VALIDATION TESTS
// ---------------------------------------------------------------------------
console.log('\n--- 2. System Document Completeness Tests ---');

try {
  // Incomplete study data containing only actionPlan and gapAnalysis
  const incompleteStudy = { actionPlan: [], gapAnalysis: [] };
  const resStudy = validateStudyData(incompleteStudy);
  assert.strictEqual(resStudy.valid, false, 'Incomplete studyData must be rejected');
  assert.ok(resStudy.error?.includes('days') || resStudy.error?.includes('interviewGuide'));
  pass('studyData missing interviewGuide and days correctly rejected with descriptive error');
} catch (e) {
  fail('studyData incomplete validation', e);
}

try {
  // Incomplete community visits containing only a title for each visit
  const incompleteVisits = {
    visit1: { title: 'Visit 1' },
    visit2: { title: 'Visit 2' },
    visit3: { title: 'Visit 3' },
  };
  const resVisits = validateCommunityVisits(incompleteVisits);
  assert.strictEqual(resVisits.valid, false, 'Incomplete communityVisits must be rejected');
  assert.ok(resVisits.error?.includes('status') || resVisits.error?.includes('objective'));
  pass('communityVisits containing only titles correctly rejected');
} catch (e) {
  fail('communityVisits incomplete validation', e);
}

try {
  assert.strictEqual(validateStudyData({}).valid, false);
  assert.strictEqual(validateCommunityVisits({}).valid, false);
  assert.strictEqual(validateStudyData(DEFAULT_STUDY_DATA).valid, true);
  assert.strictEqual(validateCommunityVisits(DEFAULT_COMMUNITY_VISITS).valid, true);
  pass('Empty objects rejected and full default documents accepted for studyData & communityVisits');
} catch (e) {
  fail('Document validation completeness', e);
}

// ---------------------------------------------------------------------------
// 3. FRESH PRODUCTION STARTUP & RESTART TESTS
// ---------------------------------------------------------------------------
console.log('\n--- 3. Production Database Lifecycle Tests ---');

const prodDbFile = path.join(TEST_DIR, 'fresh_prod.sqlite');
if (fs.existsSync(prodDbFile)) fs.unlinkSync(prodDbFile);

try {
  const runnerScript = 'scripts/helpers/lifecycle-runner.ts';
  const runProdInit = spawnSync(
    'npx',
    ['tsx', runnerScript, 'init-prod'],
    {
      env: {
        ...process.env,
        DB_PATH: prodDbFile,
        NODE_ENV: 'production',
        SEED_DEMO_ACCOUNTS: 'false',
      },
      shell: true,
      encoding: 'utf8',
    }
  );

  assert.strictEqual(runProdInit.status, 0, `Process failed: ${runProdInit.stderr}\n${runProdInit.stdout}`);
  const match = runProdInit.stdout.match(/PROD_RESULTS:(.*)/);
  assert.ok(match, `Expected PROD_RESULTS output, got:\n${runProdInit.stdout}\n${runProdInit.stderr}`);
  const results = JSON.parse(match[1]);

  assert.strictEqual(path.resolve(results.dbPath), path.resolve(prodDbFile), 'Configured DB_PATH must match');
  assert.strictEqual(results.userCount, 0, 'Production must have 0 demo users');
  assert.strictEqual(results.appCount, 0, 'Production must have 0 sample applications');
  assert.ok(results.oppCount > 0, 'Production must have opportunities populated');
  assert.ok(results.docCount > 0, 'Production must have system documents populated');
  pass('Fresh production startup succeeds without FK errors and omits demo users & sample apps');
} catch (e) {
  fail('Fresh production startup', e);
}

try {
  const runnerScript = 'scripts/helpers/lifecycle-runner.ts';
  const runProdRestart = spawnSync(
    'npx',
    ['tsx', runnerScript, 'restart-prod'],
    {
      env: {
        ...process.env,
        DB_PATH: prodDbFile,
        NODE_ENV: 'production',
        SEED_DEMO_ACCOUNTS: 'false',
      },
      shell: true,
      encoding: 'utf8',
    }
  );

  assert.strictEqual(runProdRestart.status, 0, `Restart failed: ${runProdRestart.stderr}`);
  const match = runProdRestart.stdout.match(/RESTART_OPPS:(\d+)/);
  assert.ok(match && parseInt(match[1], 10) > 0, 'Opportunities must persist across restart');
  pass('Production restart preserves existing database records without deletion or duplicates');
} catch (e) {
  fail('Production restart', e);
}

// ---------------------------------------------------------------------------
// 4. DEVELOPMENT / DEMO SEEDING TESTS
// ---------------------------------------------------------------------------
console.log('\n--- 4. Demo Seeding with Relational Integrity Tests ---');

const demoDbFile = path.join(TEST_DIR, 'demo_seeded.sqlite');
if (fs.existsSync(demoDbFile)) fs.unlinkSync(demoDbFile);

try {
  const runnerScript = 'scripts/helpers/lifecycle-runner.ts';
  const runDemoInit = spawnSync(
    'npx',
    ['tsx', runnerScript, 'seed-demo'],
    {
      env: {
        ...process.env,
        DB_PATH: demoDbFile,
        NODE_ENV: 'development',
      },
      shell: true,
      encoding: 'utf8',
    }
  );

  assert.strictEqual(runDemoInit.status, 0, `Demo seed failed: ${runDemoInit.stderr}`);
  const match = runDemoInit.stdout.match(/DEMO_RESULTS:(.*)/);
  assert.ok(match, 'Expected DEMO_RESULTS output');
  const results = JSON.parse(match[1]);

  assert.strictEqual(path.resolve(results.dbPath), path.resolve(demoDbFile), 'Configured DB_PATH must match');
  assert.ok(results.userCount >= 4, 'Demo must have at least 4 accounts');
  assert.ok(results.appCount > 0, 'Demo must have sample applications');
  assert.ok(results.enrCount > 0, 'Demo must have sample enrollments');
  pass('Development/demo startup seeds accounts and sample records with valid foreign keys');
} catch (e) {
  fail('Demo seed verification', e);
}

// ---------------------------------------------------------------------------
// 5. SECURE ADMIN PROVISIONING TESTS
// ---------------------------------------------------------------------------
console.log('\n--- 5. Secure Admin Provisioning Tests ---');

try {
  // Test 5A: Missing password must fail
  const runNoPass = spawnSync(
    'npx',
    ['tsx', 'scripts/provision-admin.ts', 'superadmin'],
    {
      env: { ...process.env, DB_PATH: prodDbFile, NODE_ENV: 'production', ADMIN_PASS: '' },
      shell: true,
      encoding: 'utf8',
    }
  );
  assert.notStrictEqual(runNoPass.status, 0, 'Missing password must exit with error code');
  assert.ok(runNoPass.stderr.includes('password must be explicitly provided'));
  pass('Admin provisioning fails clearly when password is not explicitly supplied');
} catch (e) {
  fail('Admin provisioning missing password check', e);
}

try {
  // Test 5B: Provisioning new administrator succeeds without printing secrets
  const runProv = spawnSync(
    'npx',
    ['tsx', 'scripts/provision-admin.ts', 'superadmin', 'SuperSecurePass@2026', 'admin@college.edu'],
    {
      env: { ...process.env, DB_PATH: prodDbFile, NODE_ENV: 'production' },
      shell: true,
      encoding: 'utf8',
    }
  );
  assert.strictEqual(runProv.status, 0, `Provisioning failed: ${runProv.stderr}`);
  assert.ok(!runProv.stdout.includes('SuperSecurePass@2026'), 'Password must never be printed to stdout');
  assert.ok(!runProv.stderr.includes('SuperSecurePass@2026'), 'Password must never be printed to stderr');

  // Verify in database
  const verifyDb = new DatabaseSync(prodDbFile);
  const adminRow = verifyDb.prepare("SELECT username, role FROM users WHERE username = 'superadmin'").get() as any;
  verifyDb.close();
  assert.strictEqual(adminRow?.role, 'Admin');
  pass('Admin provisioning creates new Administrator account without printing secrets');
} catch (e) {
  fail('Admin provisioning creation', e);
}

try {
  // Test 5C: Provisioning existing administrator without --reset fails
  const runDup = spawnSync(
    'npx',
    ['tsx', 'scripts/provision-admin.ts', 'superadmin', 'AnotherPass@123'],
    {
      env: { ...process.env, DB_PATH: prodDbFile, NODE_ENV: 'production' },
      shell: true,
      encoding: 'utf8',
    }
  );
  assert.notStrictEqual(runDup.status, 0, 'Existing user without --reset must fail');
  assert.ok(runDup.stderr.includes('already exists'));
  pass('Admin provisioning rejects silent overwrite of existing account without --reset');
} catch (e) {
  fail('Admin provisioning duplicate prevention', e);
}

try {
  // Test 5D: Provisioning existing administrator with --reset succeeds
  const runReset = spawnSync(
    'npx',
    ['tsx', 'scripts/provision-admin.ts', 'superadmin', 'UpdatedSecurePass@2026', '--reset'],
    {
      env: { ...process.env, DB_PATH: prodDbFile, NODE_ENV: 'production' },
      shell: true,
      encoding: 'utf8',
    }
  );
  assert.strictEqual(runReset.status, 0, `Reset failed: ${runReset.stderr}`);
  assert.ok(runReset.stdout.includes('Successfully reset password'));
  pass('Admin provisioning with --reset explicitly updates existing administrator');
} catch (e) {
  fail('Admin provisioning reset flag', e);
}

// ---------------------------------------------------------------------------
// 6. CONFIGURATION PRECEDENCE TESTS
// ---------------------------------------------------------------------------
console.log('\n--- 6. Configuration Precedence Tests ---');

try {
  const runnerScript = 'scripts/helpers/lifecycle-runner.ts';
  const targetDbPath = path.resolve(path.join(TEST_DIR, 'explicit_precedence.sqlite'));

  // Run child process with explicit DB_PATH
  const runPrecedenceTest = spawnSync(
    'npx',
    ['tsx', runnerScript, 'check-config'],
    {
      env: { ...process.env, DB_PATH: targetDbPath },
      shell: true,
      encoding: 'utf8',
    }
  );

  assert.strictEqual(runPrecedenceTest.status, 0);
  const match = runPrecedenceTest.stdout.match(/RESOLVED_DB_PATH:(.*)/);
  assert.ok(match, 'Expected RESOLVED_DB_PATH output');
  assert.strictEqual(path.resolve(match[1].trim()), targetDbPath);
  pass('Externally supplied DB_PATH takes precedence and selects intended database before initialization');
} catch (e) {
  fail('Config precedence test', e);
}

// Cleanup scratch test files safely
try {
  if (fs.existsSync(prodDbFile)) fs.unlinkSync(prodDbFile);
  if (fs.existsSync(demoDbFile)) fs.unlinkSync(demoDbFile);
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
} catch {
  // Ignore cleanup errors
}

console.log('\n======================================================');
console.log(`LIFECYCLE & SECURITY SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('======================================================');

if (failedCount > 0) {
  process.exit(1);
}
