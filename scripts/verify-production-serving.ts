import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert';

const PORT = 3098;
const TEST_DIR = path.resolve('server/database/test_scratch');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

const dbPath = path.join(TEST_DIR, 'prod_serving_test.sqlite');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

console.log('======================================================');
console.log('VERIFYING PRODUCTION SERVER & SPA SERVING');
console.log(`Port: ${PORT} | Database: ${dbPath}`);
console.log('======================================================\n');

function request(urlPath: string, options: http.RequestOptions = {}, body?: any): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${PORT}${urlPath}`,
      { ...options, headers: { ...options.headers } },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, data: raw }));
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runVerification() {
  // Start server process in production mode
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    env: {
      ...process.env,
      PORT: String(PORT),
      DB_PATH: dbPath,
      NODE_ENV: 'production',
      SEED_DEMO_ACCOUNTS: 'false',
      TRUST_PROXY: 'true',
      COOKIE_SECURE: 'false', // set to false for localhost testing over HTTP
    },
    shell: true,
  });

  let serverOutput = '';
  serverProcess.stdout.on('data', (d) => (serverOutput += d.toString()));
  serverProcess.stderr.on('data', (d) => (serverOutput += d.toString()));

  // Wait for server to become responsive
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await request('/api/health');
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!ready) {
    console.error('Server failed to start. Output:\n', serverOutput);
    serverProcess.kill();
    process.exit(1);
  }

  console.log('[PASS] Production server started and responsive on /api/health');

  // 1. Verify Homepage serving (dist/index.html)
  const homeRes = await request('/');
  assert.strictEqual(homeRes.status, 200);
  assert.ok(homeRes.data.includes('Skill Bridge') || homeRes.data.includes('<!DOCTYPE html>'));
  console.log('[PASS] Homepage serves production index.html (200 OK)');

  // 2. Verify Direct Route SPA refresh (e.g. /opportunities, /research)
  const directRouteRes = await request('/opportunities');
  assert.strictEqual(directRouteRes.status, 200);
  assert.ok(directRouteRes.data.toLowerCase().includes('<!doctype html>'));
  console.log('[PASS] Direct frontend route /opportunities correctly falls back to SPA index.html (200 OK)');

  const directStudentRes = await request('/student-workspace');
  assert.strictEqual(directStudentRes.status, 200);
  assert.ok(directStudentRes.data.toLowerCase().includes('<!doctype html>'));
  console.log('[PASS] Direct frontend route /student-workspace correctly falls back to SPA index.html (200 OK)');

  // 3. Verify static asset serving
  // Read index.html to find built asset url
  const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
  const assetMatch = indexHtml.match(/src="([^"]+\.js)"/);
  if (assetMatch) {
    const assetUrl = assetMatch[1];
    const assetRes = await request(assetUrl);
    assert.strictEqual(assetRes.status, 200);
    assert.ok(assetRes.headers['content-type']?.includes('javascript'));
    console.log(`[PASS] Static bundle ${assetUrl} served successfully with correct MIME type (200 OK)`);
  }

  // 4. Verify that demo accounts do not exist in fresh production
  const loginDemoRes = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { username: 'student.cs', password: 'Student@123' });
  assert.strictEqual(loginDemoRes.status, 401);
  console.log('[PASS] Demo student account correctly omitted in fresh production (401 Unauthorized)');

  // 5. Provision an admin into this production database
  const provScript = spawn('npx', ['tsx', 'scripts/provision-admin.ts', 'prodadmin', 'AdminSecurePass!123', 'admin@college.edu'], {
    env: { ...process.env, DB_PATH: dbPath, NODE_ENV: 'production' },
    shell: true,
  });
  await new Promise((resolve) => provScript.on('close', resolve));

  // 6. Login with provisioned admin
  const loginAdminRes = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { username: 'prodadmin', password: 'AdminSecurePass!123' });

  assert.strictEqual(loginAdminRes.status, 200);
  const cookie = loginAdminRes.headers['set-cookie']?.[0]?.split(';')[0] || '';
  assert.ok(cookie.includes('sb_session='));
  console.log('[PASS] Provisioned admin authenticated successfully and received sb_session cookie (200 OK)');

  // 7. Perform authorized administrative mutation
  const docMutation = await request('/api/system-documents/site_content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
      'Origin': 'http://localhost:5173',
    },
  }, { heroHeadline: 'Updated Production Headline For CEP' });

  assert.strictEqual(docMutation.status, 200);
  console.log('[PASS] Authenticated admin performed authorized system document mutation (200 OK)');

  // 8. Logout
  const logoutRes = await request('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Origin': 'http://localhost:5173',
    },
  });
  assert.strictEqual(logoutRes.status, 200);
  console.log('[PASS] Logout successfully cleared session (200 OK)');

  // Clean shutdown
  try {
    if (process.platform === 'win32' && serverProcess.pid) {
      execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
    } else {
      serverProcess.kill('SIGTERM');
    }
  } catch {}

  try {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  } catch {}

  console.log('\n======================================================');
  console.log('ALL PRODUCTION SERVING CHECKS PASSED SUCCESSFULLY!');
  console.log('======================================================');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
