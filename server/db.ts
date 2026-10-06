import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Import existing seed datasets
import { generateSeedDataset, DEFAULT_QUESTIONS } from '../src/data/defaultSurveySeed';
import { DEFAULT_OPPORTUNITIES } from '../src/data/defaultOpportunities';
import { DEFAULT_TRAINING_SESSIONS } from '../src/data/defaultTraining';
import { DEFAULT_EMPLOYER_OUTREACH } from '../src/data/defaultEmployerOutreach';
import { DEFAULT_STUDY_DATA, DEFAULT_COMMUNITY_VISITS } from '../src/data/defaultStudy';
import { DEFAULT_PROBLEM_MATRIX } from '../src/data/defaultProblemMatrix';
import { DEFAULT_SITE_CONTENT, DEFAULT_STUDENT_PROFILE } from '../src/data/defaultContent';
import { hashPassword } from './auth';
import { populateRichDemoData } from '../scripts/populate-rich-demo-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { DB_PATH, isProduction, SEED_DEMO_ACCOUNTS } from './config';
export { DB_PATH };

// Initialize Native SQLite Database
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for high performance and integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

/**
 * Check if a column exists in a given table
 */
function columnExists(table: string, column: string): boolean {
  try {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    return columns.some((c) => c.name === column);
  } catch {
    return false;
  }
}

/**
 * Initialize all relational SQLite tables and run migrations
 */
export function initSchema() {
  db.exec(`
    -- 1. Authentication & Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Student', 'Placement Coordinator', 'Admin')),
      full_name TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2. Sessions Table
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 3. Student Profiles Table (Scoped per student)
    CREATE TABLE IF NOT EXISTS student_profiles (
      student_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      display_name TEXT NOT NULL,
      department TEXT NOT NULL,
      year TEXT NOT NULL,
      preferred_roles TEXT NOT NULL, -- JSON array
      skills TEXT NOT NULL, -- JSON array
      preferred_locations TEXT NOT NULL, -- JSON array
      training_interests TEXT NOT NULL, -- JSON array
      academic_percentage REAL DEFAULT 75.0,
      active_backlogs INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 4. Survey Responses (200 records across CS, IT, DS)
    CREATE TABLE IF NOT EXISTS survey_responses (
      id TEXT PRIMARY KEY,
      department TEXT NOT NULL,
      year TEXT NOT NULL,
      preferred_role TEXT NOT NULL,
      relevant_drives TEXT NOT NULL,
      needs_met TEXT NOT NULL,
      information_timeliness TEXT NOT NULL,
      training_usefulness INTEGER,
      biggest_barrier TEXT NOT NULL,
      urgent_support TEXT NOT NULL,
      satisfaction INTEGER NOT NULL,
      review TEXT NOT NULL,
      suggestion TEXT NOT NULL,
      source_type TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    -- 5. Opportunities (Jobs, Internships & Drives)
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      employer TEXT NOT NULL,
      type TEXT NOT NULL,
      relevant_departments TEXT NOT NULL, -- JSON array
      subdomain TEXT,
      skills TEXT NOT NULL, -- JSON array
      explicit_eligibility TEXT NOT NULL,
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      fixed_pay_or_stipend TEXT NOT NULL,
      incentives TEXT,
      deadline TEXT NOT NULL,
      description TEXT NOT NULL,
      posted_date TEXT NOT NULL,
      source_status TEXT NOT NULL,
      is_expired INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0
    );

    -- 6. Student Saved Opportunities
    CREATE TABLE IF NOT EXISTS saved_opportunities (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      saved_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(student_id, opportunity_id)
    );

    -- 7. Student Applications Table
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      applied_date TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Selected', 'Feedback Pending')),
      student_notes TEXT,
      coordinator_feedback TEXT,
      reviewed_by TEXT REFERENCES users(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(student_id, opportunity_id)
    );

    -- 8. Training Sessions (Hands-on Workshops)
    CREATE TABLE IF NOT EXISTS training_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT NOT NULL,
      target_skills TEXT NOT NULL, -- JSON array
      mode TEXT NOT NULL,
      schedule TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      enrolled_count INTEGER NOT NULL DEFAULT 0,
      trainer TEXT NOT NULL,
      venue TEXT NOT NULL,
      source_status TEXT NOT NULL
    );

    -- 9. Workshop Enrollments Table
    CREATE TABLE IF NOT EXISTS workshop_enrollments (
      id TEXT PRIMARY KEY,
      workshop_id TEXT NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
      attendance_status TEXT NOT NULL DEFAULT 'Enrolled' CHECK(attendance_status IN ('Enrolled', 'Attended', 'Absent', 'Cancelled')),
      attendance_marked_by TEXT REFERENCES users(id),
      attendance_marked_at TEXT,
      UNIQUE(student_id, workshop_id)
    );

    -- 10. Employer Outreach (Placement Cell CRM)
    CREATE TABLE IF NOT EXISTS employer_outreach (
      id TEXT PRIMARY KEY,
      employer TEXT NOT NULL,
      relevant_departments TEXT NOT NULL, -- JSON array
      intended_roles TEXT NOT NULL,
      contact_status TEXT NOT NULL,
      follow_up_date TEXT NOT NULL,
      notes TEXT NOT NULL,
      provenance TEXT NOT NULL
    );

    -- 11. Feedback Submissions (Student Desk)
    CREATE TABLE IF NOT EXISTS feedback_submissions (
      id TEXT PRIMARY KEY,
      department TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      suggested_improvement TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL,
      coordinator_response TEXT,
      resolution_date TEXT,
      is_demo_notice INTEGER NOT NULL DEFAULT 1,
      student_id TEXT REFERENCES users(id),
      is_anonymous INTEGER NOT NULL DEFAULT 1
    );

    -- 12. Guidance Requests (1-on-1 Mentorship)
    CREATE TABLE IF NOT EXISTS guidance_requests (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      department TEXT NOT NULL,
      preferred_role TEXT NOT NULL,
      topic TEXT NOT NULL,
      preferred_time_slot TEXT NOT NULL,
      additional_notes TEXT,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL,
      scheduled_time TEXT,
      coordinator_note TEXT,
      is_demo_notice INTEGER NOT NULL DEFAULT 1,
      student_id TEXT REFERENCES users(id)
    );

    -- 13. System Documents & Metadata Store
    CREATE TABLE IF NOT EXISTS system_documents (
      doc_key TEXT PRIMARY KEY,
      doc_data TEXT NOT NULL, -- JSON payload
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 14. Application Initialization & Metadata Store
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Run dynamic schema migrations on pre-existing tables if needed
  if (!columnExists('opportunities', 'is_archived')) {
    db.exec('ALTER TABLE opportunities ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0;');
  }
  if (!columnExists('feedback_submissions', 'student_id')) {
    db.exec('ALTER TABLE feedback_submissions ADD COLUMN student_id TEXT REFERENCES users(id);');
  }
  if (!columnExists('feedback_submissions', 'is_anonymous')) {
    db.exec('ALTER TABLE feedback_submissions ADD COLUMN is_anonymous INTEGER NOT NULL DEFAULT 1;');
  }
  if (!columnExists('guidance_requests', 'student_id')) {
    db.exec('ALTER TABLE guidance_requests ADD COLUMN student_id TEXT REFERENCES users(id);');
  }
}

/**
 * Seeds or verifies base production data:
 * - Default system documents (siteContent, studyData, communityVisits, problemMatrix, studentProfile, surveyQuestions)
 * - Research survey responses (200 records)
 * - Placement & internship circulars (opportunities)
 * - Practical training clinics (trainingSessions)
 * - Employer outreach pipeline records
 * - Optional initial administrator account if INITIAL_ADMIN_* environment variables are present
 * 
 * NOTE: Base production initialization strictly OMITS demo accounts and dependent operational records.
 */
export function initBaseProductionData(force = false) {
  // 1. System Documents (Study Data, Community Visits, Problem Matrix, Site Content, Questions)
  const docCount = (db.prepare('SELECT COUNT(*) as count FROM system_documents').get() as { count: number }).count;
  if (docCount === 0 || force) {
    const insertDoc = db.prepare(`
      INSERT OR REPLACE INTO system_documents (doc_key, doc_data, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    insertDoc.run('study_data', JSON.stringify(DEFAULT_STUDY_DATA));
    insertDoc.run('community_visits', JSON.stringify(DEFAULT_COMMUNITY_VISITS));
    insertDoc.run('problem_matrix', JSON.stringify(DEFAULT_PROBLEM_MATRIX));
    insertDoc.run('site_content', JSON.stringify(DEFAULT_SITE_CONTENT));
    insertDoc.run('student_profile', JSON.stringify(DEFAULT_STUDENT_PROFILE));
    insertDoc.run('survey_questions', JSON.stringify(DEFAULT_QUESTIONS));
  } else {
    const insertDocIgnore = db.prepare(`
      INSERT OR IGNORE INTO system_documents (doc_key, doc_data, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    insertDocIgnore.run('study_data', JSON.stringify(DEFAULT_STUDY_DATA));
    insertDocIgnore.run('community_visits', JSON.stringify(DEFAULT_COMMUNITY_VISITS));
    insertDocIgnore.run('problem_matrix', JSON.stringify(DEFAULT_PROBLEM_MATRIX));
    insertDocIgnore.run('site_content', JSON.stringify(DEFAULT_SITE_CONTENT));
    insertDocIgnore.run('student_profile', JSON.stringify(DEFAULT_STUDENT_PROFILE));
    insertDocIgnore.run('survey_questions', JSON.stringify(DEFAULT_QUESTIONS));
  }

  // 2. Survey Responses (200 records)
  const respCount = (db.prepare('SELECT COUNT(*) as count FROM survey_responses').get() as { count: number }).count;
  if (respCount === 0 || force) {
    db.exec('DELETE FROM survey_responses;');
    const insertResponse = db.prepare(`
      INSERT INTO survey_responses (
        id, department, year, preferred_role, relevant_drives, needs_met,
        information_timeliness, training_usefulness, biggest_barrier, urgent_support,
        satisfaction, review, suggestion, source_type, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const responses = generateSeedDataset();
    for (const r of responses) {
      insertResponse.run(
        r.id,
        r.department,
        r.year,
        r.preferredRole,
        r.relevantDrives,
        r.needsMet,
        r.informationTimeliness,
        r.trainingUsefulness !== null && r.trainingUsefulness !== undefined ? r.trainingUsefulness : null,
        r.biggestBarrier,
        r.urgentSupport,
        r.satisfaction,
        r.review ?? null,
        r.suggestion ?? null,
        r.sourceType ?? 'simulated',
        r.timestamp || r.collectionDate || new Date().toISOString()
      );
    }
  }

  // 3. Opportunities (12 listings)
  const oppCount = (db.prepare('SELECT COUNT(*) as count FROM opportunities').get() as { count: number }).count;
  if (oppCount === 0 || force) {
    db.exec('DELETE FROM opportunities;');
    const insertOpportunity = db.prepare(`
      INSERT INTO opportunities (
        id, title, employer, type, relevant_departments, subdomain,
        skills, explicit_eligibility, location, work_mode, fixed_pay_or_stipend,
        incentives, deadline, description, posted_date, source_status, is_expired, is_archived
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    for (const o of DEFAULT_OPPORTUNITIES) {
      insertOpportunity.run(
        o.id,
        o.title,
        o.employer,
        o.type,
        JSON.stringify(o.relevantDepartments || []),
        o.subdomain ?? null,
        JSON.stringify(o.skills || []),
        JSON.stringify(o.explicitEligibility || {}),
        o.location ?? null,
        o.workMode ?? null,
        o.fixedPayOrStipend ?? null,
        o.incentives ?? null,
        o.deadline,
        o.description ?? '',
        o.postedDate,
        o.sourceStatus ?? 'Verified',
        o.isExpired ? 1 : 0
      );
    }
  }

  // 4. Training Sessions (6 sessions)
  const trainCount = (db.prepare('SELECT COUNT(*) as count FROM training_sessions').get() as { count: number }).count;
  if (trainCount === 0 || force) {
    db.exec('DELETE FROM training_sessions;');
    const insertTraining = db.prepare(`
      INSERT INTO training_sessions (
        id, title, department, description, target_skills, mode,
        schedule, capacity, enrolled_count, trainer, venue, source_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of DEFAULT_TRAINING_SESSIONS) {
      insertTraining.run(
        t.id,
        t.title,
        t.department,
        t.description,
        JSON.stringify(t.targetSkills || []),
        t.mode ?? 'In-person',
        t.schedule,
        t.capacity ?? 30,
        0,
        t.trainer ?? '',
        t.venue ?? '',
        t.sourceStatus ?? 'Verified'
      );
    }
  }

  // 5. Employer Outreach (8 records)
  const outreachCount = (db.prepare('SELECT COUNT(*) as count FROM employer_outreach').get() as { count: number }).count;
  if (outreachCount === 0 || force) {
    db.exec('DELETE FROM employer_outreach;');
    const insertOutreach = db.prepare(`
      INSERT INTO employer_outreach (
        id, employer, relevant_departments, intended_roles,
        contact_status, follow_up_date, notes, provenance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const eo of DEFAULT_EMPLOYER_OUTREACH) {
      insertOutreach.run(
        eo.id,
        eo.employer,
        JSON.stringify(eo.relevantDepartments || []),
        eo.intendedRoles ?? '',
        eo.contactStatus ?? 'Initial Discussion',
        eo.followUpDate ?? null,
        eo.notes ?? null,
        eo.provenance ?? null
      );
    }
  }

  // 6. Production deployment initial admin provisioning from environment
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount === 0) {
    const initAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const initAdminPass = process.env.INITIAL_ADMIN_PASSWORD;
    const initAdminUser = process.env.INITIAL_ADMIN_USERNAME || 'admin';
    if (initAdminEmail && initAdminPass) {
      const insertUser = db.prepare(`
        INSERT OR REPLACE INTO users (
          id, username, password_hash, salt, role, full_name, department, email, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      const hashed = hashPassword(initAdminPass);
      insertUser.run(
        'USR-ADMIN-01',
        initAdminUser,
        hashed.hash,
        hashed.salt,
        'Admin',
        'System Administrator',
        'All Departments',
        initAdminEmail
      );
      console.log(`[Database] Provisioned initial administrator "${initAdminUser}" from environment.`);
    }
  }
}

/**
 * Seeds demonstration accounts and dependent sample operational records:
 * - 4 demo accounts: Coordinator, Student CS, Student DS, Admin
 * - Student academic & skill profiles
 * - Sample job applications
 * - Sample saved opportunities
 * - Sample practical workshop enrollments & verified attendance
 * - Sample student grievances with coordinator responses
 * - Sample 1-on-1 guidance appointments
 * 
 * Must ONLY be run when demo seeding is explicitly permitted.
 */
export function seedDemoData(force = false) {
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0 && !force) {
    return;
  }

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, username, password_hash, salt, role, full_name, department, email, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO student_profiles (
      student_id, display_name, department, year, preferred_roles,
      skills, preferred_locations, training_interests, academic_percentage, active_backlogs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Coordinator Account
  const coordPass = hashPassword('Coordinator@123');
  insertUser.run(
    'USR-COORD-01',
    'coordinator',
    coordPass.hash,
    coordPass.salt,
    'Placement Coordinator',
    'Dr. Rajesh Sharma',
    'All Departments',
    'rajesh.sharma@skillbridge.edu'
  );

  // Student 1 (CS)
  const stud1Pass = hashPassword('Student@123');
  insertUser.run(
    'USR-STUD-01',
    'student.cs',
    stud1Pass.hash,
    stud1Pass.salt,
    'Student',
    'Dhiraj Tendulkar',
    'Computer Science (CS)',
    'dhiraj.cs@skillbridge.edu'
  );
  insertProfile.run(
    'USR-STUD-01',
    'Dhiraj Tendulkar',
    'Computer Science (CS)',
    'Final Year (4th Year)',
    JSON.stringify(['Full-Stack Developer', 'Software Engineer']),
    JSON.stringify(['React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'REST APIs', 'Tailwind CSS']),
    JSON.stringify(['Pune', 'Mumbai', 'Bengaluru']),
    JSON.stringify(['Full Stack Web Development', 'Cloud & DevOps', 'System Design']),
    78.5,
    0
  );

  // Student 2 (DS)
  const stud2Pass = hashPassword('Student@123');
  insertUser.run(
    'USR-STUD-02',
    'student.ds',
    stud2Pass.hash,
    stud2Pass.salt,
    'Student',
    'Vidhi Mahato',
    'Data Science (DS)',
    'vidhi.ds@skillbridge.edu'
  );
  insertProfile.run(
    'USR-STUD-02',
    'Vidhi Mahato',
    'Data Science (DS)',
    'Final Year (4th Year)',
    JSON.stringify(['Data Scientist', 'Machine Learning Engineer', 'Data Analyst']),
    JSON.stringify(['Python', 'PyTorch', 'Pandas', 'NumPy', 'SQL', 'Data Modeling', 'Scikit-Learn']),
    JSON.stringify(['Bengaluru', 'Pune', 'Remote']),
    JSON.stringify(['Machine Learning & AI', 'Data Science & Analytics']),
    84.0,
    0
  );

  // Admin Account
  const adminPass = hashPassword('Admin@123');
  insertUser.run(
    'USR-ADMIN-01',
    'admin',
    adminPass.hash,
    adminPass.salt,
    'Admin',
    'System Administrator',
    'All Departments',
    'admin@skillbridge.edu'
  );

  console.log('[Database] Seeded 4 demo accounts (Coordinator, 2 Students, Admin).');

  // Sample Applications
  const insertApp = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, opportunity_id, student_id, applied_date, status, student_notes, coordinator_feedback, reviewed_by, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  insertApp.run(
    'APP-1001',
    'OPP-101',
    'USR-STUD-01',
    '2026-10-01 10:30:00',
    'Under Review',
    'Passionate about building scalable full-stack web platforms using React and TypeScript.',
    'Profile shortlisted for technical screening round scheduled next Tuesday.',
    'USR-COORD-01'
  );

  insertApp.run(
    'APP-1002',
    'OPP-301',
    'USR-STUD-02',
    '2026-10-02 11:15:00',
    'Shortlisted',
    'Proficient in Python data pipelines, PyTorch modeling, and statistical analysis.',
    'Excellent academic track record and portfolio. Recommended for final technical round.',
    'USR-COORD-01'
  );

  // Sample Saved Opportunities
  const insertSaved = db.prepare(`
    INSERT OR REPLACE INTO saved_opportunities (id, student_id, opportunity_id, saved_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  insertSaved.run('SAVE-101', 'USR-STUD-01', 'OPP-102');
  insertSaved.run('SAVE-102', 'USR-STUD-02', 'OPP-302');

  // Sample Workshop Enrollments
  const insertEnrollment = db.prepare(`
    INSERT OR REPLACE INTO workshop_enrollments (
      id, workshop_id, student_id, enrolled_at, attendance_status, attendance_marked_by, attendance_marked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertEnrollment.run(
    'ENR-101',
    'TRN-201',
    'USR-STUD-01',
    '2026-10-01 12:00:00',
    'Enrolled',
    null,
    null
  );

  insertEnrollment.run(
    'ENR-102',
    'TRN-301',
    'USR-STUD-02',
    '2026-10-01 13:00:00',
    'Attended',
    'USR-COORD-01',
    '2026-10-02 17:00:00'
  );

  // Update enrollment counts on workshops
  db.exec(`
    UPDATE training_sessions
    SET enrolled_count = (
      SELECT COUNT(*) FROM workshop_enrollments
      WHERE workshop_enrollments.workshop_id = training_sessions.id
      AND workshop_enrollments.attendance_status != 'Cancelled'
    );
  `);

  // Sample Feedback Submissions
  const insertFeedback = db.prepare(`
    INSERT OR REPLACE INTO feedback_submissions (
      id, department, category, description, suggested_improvement,
      submitted_at, status, coordinator_response, resolution_date, is_demo_notice, student_id, is_anonymous
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)
  `);

  insertFeedback.run(
    'FB-1001',
    'Computer Science (CS)',
    'Notice Timeliness',
    'Placement drive circulars for specialized engineering roles were received less than 24 hours before the registration deadline.',
    'Mandate an official 48-hour advance application notification protocol across all departments.',
    '2026-10-01 14:00:00',
    'Action planned',
    'Placement Coordinator has instituted a mandatory 48-hour advance broadcast rule for all verified corporate drives.',
    '2026-10-02 16:30:00',
    'USR-STUD-01'
  );

  // Sample Guidance Requests
  const insertGuidance = db.prepare(`
    INSERT OR REPLACE INTO guidance_requests (
      id, student_name, department, preferred_role, topic,
      preferred_time_slot, additional_notes, submitted_at, status,
      scheduled_time, coordinator_note, is_demo_notice, student_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  insertGuidance.run(
    'GD-1001',
    'Dhiraj Tendulkar',
    'Computer Science (CS)',
    'Full-Stack Developer',
    'Technical Guidance for Core Roles',
    'Friday Afternoon (3:00 PM - 4:00 PM)',
    'Requesting guidance on system design expectations for upcoming corporate campus assessments.',
    '2026-10-01 15:30:00',
    'Scheduled',
    '2026-10-10 15:30:00',
    'Appointment confirmed for Room 204, Placement Wing. Please bring updated portfolio and project repository links.',
    'USR-STUD-01'
  );

  populateRichDemoData(db);
  console.log('[Database] Seeded initial operational applications, enrollments, feedback, and guidance.');
}

/**
 * Initializes the SQLite database:
 * - Runs schema definition and migrations
 * - Preserves existing records across ordinary server restarts
 * - In fresh production: populates base production content without demo accounts
 * - In development or explicit demo seeding: populates demo accounts and sample workflows
 */
export function initDatabase(options: { force?: boolean } = {}) {
  const force = options.force ?? false;
  initSchema();

  const initMeta = db.prepare("SELECT value FROM app_metadata WHERE key = 'is_initialized'").get() as { value: string } | undefined;
  const oppCount = (db.prepare('SELECT COUNT(*) as count FROM opportunities').get() as { count: number }).count;
  const isAlreadyInitialized = initMeta?.value === 'true' || oppCount > 0;

  // Ordinary restart with existing database: preserve all records safely
  if (isAlreadyInitialized && !force) {
    console.log('[Database] Preserving existing records across all tables (ordinary startup).');
    initBaseProductionData(false);
    db.prepare("INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES ('is_initialized', 'true', datetime('now'))").run();
    return;
  }

  // Fresh initialization or explicit force reset
  console.log(`[Database] Executing ${force ? 'explicit demo reset' : 'fresh database initialization'}...`);
  db.exec('BEGIN TRANSACTION;');

  try {
    if (force) {
      db.exec(`
        DELETE FROM sessions;
        DELETE FROM applications;
        DELETE FROM saved_opportunities;
        DELETE FROM workshop_enrollments;
        DELETE FROM feedback_submissions;
        DELETE FROM guidance_requests;
        DELETE FROM student_profiles;
        DELETE FROM users;
        DELETE FROM opportunities;
        DELETE FROM training_sessions;
        DELETE FROM employer_outreach;
        DELETE FROM survey_responses;
        DELETE FROM system_documents;
      `);
    }

    // 1. Initialize base production data (system documents, survey responses, listings)
    initBaseProductionData(force);

    // 2. Decide whether demo accounts & dependent operational records should be seeded
    const shouldSeedDemo = force || (!isProduction && process.env.SEED_DEMO_ACCOUNTS !== 'false') || SEED_DEMO_ACCOUNTS;
    if (shouldSeedDemo) {
      seedDemoData(force);
    } else {
      console.log('[Database] Production mode active: demo accounts and sample operational records omitted.');
    }

    // 3. Mark database as initialized
    db.prepare("INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES ('is_initialized', 'true', datetime('now'))").run();

    db.exec('COMMIT;');
    console.log('[Database] Successfully initialized database.');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Database] Database initialization failed and was rolled back:', err);
    throw err;
  }
}

/**
 * Backward-compatible wrapper for database seeding scripts
 */
export function seedDatabase(force = false) {
  return initDatabase({ force });
}

/**
 * Get comprehensive database diagnostics and statistics
 */
export function getDatabaseStatus() {
  initSchema();

  let fileSizeKb = 0;
  if (fs.existsSync(DB_PATH)) {
    const stats = fs.statSync(DB_PATH);
    fileSizeKb = Math.round(stats.size / 1024);
  }

  const getCount = (table: string): number => {
    try {
      const res = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number };
      return res.c;
    } catch {
      return 0;
    }
  };

  // Department distribution in survey responses
  const deptDist: Record<string, number> = {};
  try {
    const rows = db.prepare(`
      SELECT department, COUNT(*) as c
      FROM survey_responses
      GROUP BY department
    `).all() as { department: string; c: number }[];
    rows.forEach((r) => {
      deptDist[r.department] = r.c;
    });
  } catch {
    // ignore
  }

  return {
    status: 'online',
    engine: 'SQLite 3 (Node.js Native DatabaseSync)',
    dbPath: DB_PATH,
    fileSizeKb,
    tables: {
      users: getCount('users'),
      sessions: getCount('sessions'),
      student_profiles: getCount('student_profiles'),
      applications: getCount('applications'),
      saved_opportunities: getCount('saved_opportunities'),
      workshop_enrollments: getCount('workshop_enrollments'),
      survey_responses: getCount('survey_responses'),
      opportunities: getCount('opportunities'),
      training_sessions: getCount('training_sessions'),
      feedback_submissions: getCount('feedback_submissions'),
      guidance_requests: getCount('guidance_requests'),
      employer_outreach: getCount('employer_outreach'),
      system_documents: getCount('system_documents'),
    },
    operationalMetrics: {
      registeredStudents: getCount("users WHERE role = 'Student'"),
      pendingApplications: getCount("applications WHERE status IN ('Submitted', 'Under Review')"),
      totalApplications: getCount('applications'),
      openFeedback: getCount("feedback_submissions WHERE status != 'Resolved'"),
      pendingGuidance: getCount("guidance_requests WHERE status IN ('Pending', 'Requested')"),
      totalEnrollments: getCount("workshop_enrollments WHERE attendance_status != 'Cancelled'"),
    },
    departmentCounts: deptDist,
    timestamp: new Date().toISOString(),
  };
}
