import './config'; // Pre-load environment before any other modules initialize
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { PORT, TRUST_PROXY, ALLOWED_ORIGINS, isProduction } from './config';
import { db, DB_PATH, getDatabaseStatus, seedDatabase, initSchema } from './db';
import { hashPassword, verifyPassword, generateSessionToken } from './auth';
import {
  isValidDate,
  isValidSchedule,
  parseSatisfaction,
  parseTrainingUsefulness,
  validateSiteContent,
  validateStudyData,
  validateCommunityVisits,
  validateProblemMatrix,
  validateSurveyQuestions,
  validateFullBackupPayload,
} from './validation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy (e.g. Nginx, Caddy, Cloudflare) when configured or in production
if (TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// CORS configuration allowing cookies strictly from permitted frontend origins
const allowedOrigins = ALLOWED_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like same-origin, curl, server-to-server)
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        // Disallow CORS headers without throwing unhandled error; allow CSRF middleware to reject
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Cross-site mutation check (CSRF defense) for cookie-authenticated operations
app.use((req: Request, res: Response, next: NextFunction) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (isMutation && req.cookies && req.cookies['sb_session']) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    let requestOrigin: string | null = null;
    if (origin) {
      requestOrigin = origin;
    } else if (referer) {
      try {
        requestOrigin = new URL(referer).origin;
      } catch {
        requestOrigin = null;
      }
    }

    if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
      res.status(403).json({ error: 'CSRF verification failed: Cross-site request blocked by security policy.' });
      return;
    }
  }
  next();
});

// Ensure database schema and demo accounts are ready
initSchema();
seedDatabase(false);

function toStr(val: unknown): string {
  if (Array.isArray(val)) return val[0] ? String(val[0]).trim() : '';
  return val !== undefined && val !== null ? String(val).trim() : '';
}

/* ========================================================================== */
/* AUTHENTICATION & RATE LIMITING HELPERS                                     */
/* ========================================================================== */

// In-memory rate limiting map for login attempts: IP -> { count, firstAttempt }
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  record.count += 1;
  return true;
}

function clearLoginRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: 'Student' | 'Placement Coordinator' | 'Admin';
  fullName: string;
  department: string;
  email: string | null;
}

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Middleware: Extracts session from cookie or Authorization header and attaches req.user
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.sb_session;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return next();
    }

    const sessionRow = db
      .prepare(`
        SELECT s.token, s.expires_at, u.id, u.username, u.role, u.full_name, u.department, u.email
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ?
      `)
      .get(token) as any;

    if (!sessionRow) {
      return next();
    }

    // Check expiry
    if (new Date(sessionRow.expires_at).getTime() < Date.now()) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return next();
    }

    req.user = {
      id: sessionRow.id,
      username: sessionRow.username,
      role: sessionRow.role,
      fullName: sessionRow.full_name,
      department: sessionRow.department,
      email: sessionRow.email,
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err);
    next();
  }
}

app.use(authenticate);

/**
 * Middleware: Requires an authenticated user session
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  next();
}

/**
 * Middleware: Requires specific role(s)
 */
export function requireRole(...allowedRoles: Array<'Student' | 'Placement Coordinator' | 'Admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Current role is ${req.user.role}.`,
      });
      return;
    }
    next();
  };
}

/* ========================================================================== */
/* 1. AUTHENTICATION ENDPOINTS                                                */
/* ========================================================================== */

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkLoginRateLimit(ip)) {
    res.status(429).json({ error: 'Too many failed login attempts. Please wait 5 minutes before trying again.' });
    return;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const userRow = db
    .prepare('SELECT id, username, password_hash, salt, role, full_name, department, email FROM users WHERE username = ?')
    .get(username.trim().toLowerCase()) as any;

  if (!userRow || !verifyPassword(password, userRow.salt, userRow.password_hash)) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  clearLoginRateLimit(ip);

  // Generate session token valid for 7 days
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userRow.id,
    expiresAt
  );

  // Set secure HTTP-only cookie
  res.cookie('sb_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Fetch student profile if user is a student
  let profile = null;
  if (userRow.role === 'Student') {
    const profRow = db.prepare('SELECT * FROM student_profiles WHERE student_id = ?').get(userRow.id) as any;
    if (profRow) {
      profile = {
        displayName: profRow.display_name,
        department: profRow.department,
        year: profRow.year,
        preferredRoles: JSON.parse(profRow.preferred_roles || '[]'),
        skills: JSON.parse(profRow.skills || '[]'),
        preferredLocations: JSON.parse(profRow.preferred_locations || '[]'),
        trainingInterests: JSON.parse(profRow.training_interests || '[]'),
        academicPercentage: profRow.academic_percentage,
        activeBacklogs: profRow.active_backlogs,
      };
    }
  }

  res.json({
    success: true,
    user: {
      id: userRow.id,
      username: userRow.username,
      role: userRow.role,
      fullName: userRow.full_name,
      department: userRow.department,
      email: userRow.email,
    },
    profile,
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.json({ user: null, profile: null });
    return;
  }

  let profile = null;
  if (req.user.role === 'Student') {
    const profRow = db.prepare('SELECT * FROM student_profiles WHERE student_id = ?').get(req.user.id) as any;
    if (profRow) {
      profile = {
        displayName: profRow.display_name,
        department: profRow.department,
        year: profRow.year,
        preferredRoles: JSON.parse(profRow.preferred_roles || '[]'),
        skills: JSON.parse(profRow.skills || '[]'),
        preferredLocations: JSON.parse(profRow.preferred_locations || '[]'),
        trainingInterests: JSON.parse(profRow.training_interests || '[]'),
        academicPercentage: profRow.academic_percentage,
        activeBacklogs: profRow.active_backlogs,
      };
    }
  }

  res.json({
    user: req.user,
    profile,
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: AuthRequest, res: Response) => {
  const token = req.cookies?.sb_session;
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.clearCookie('sb_session', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/register (STRICTLY FOR STUDENT ACCOUNTS ONLY)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, password, fullName, department, year, skills, preferredRoles } = req.body;

  if (!username || !password || !fullName || !department) {
    res.status(400).json({ error: 'Username, password, full name, and department are required.' });
    return;
  }

  const validDepts = ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'];
  if (!validDepts.includes(department)) {
    res.status(400).json({ error: `Department must be one of: ${validDepts.join(', ')}` });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const cleanUsername = username.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
  if (existing) {
    res.status(409).json({ error: 'Username is already registered. Please choose another.' });
    return;
  }

  const newId = `USR-STUD-${crypto.randomUUID().slice(0, 8)}`;
  const { salt, hash } = hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, username, password_hash, salt, role, full_name, department, email)
    VALUES (?, ?, ?, ?, 'Student', ?, ?, ?)
  `).run(newId, cleanUsername, hash, salt, fullName.trim(), department, `${cleanUsername}@skillbridge.edu`);

  const initialProfile = {
    displayName: fullName.trim(),
    department,
    year: year || 'Final Year (4th Year)',
    preferredRoles: Array.isArray(preferredRoles) ? preferredRoles : ['Graduate Trainee'],
    skills: Array.isArray(skills) ? skills : [],
    preferredLocations: ['Pune', 'Mumbai'],
    trainingInterests: [],
    academicPercentage: 75.0,
    activeBacklogs: 0,
  };

  db.prepare(`
    INSERT INTO student_profiles (
      student_id, display_name, department, year, preferred_roles,
      skills, preferred_locations, training_interests, academic_percentage, active_backlogs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId,
    initialProfile.displayName,
    initialProfile.department,
    initialProfile.year,
    JSON.stringify(initialProfile.preferredRoles),
    JSON.stringify(initialProfile.skills),
    JSON.stringify(initialProfile.preferredLocations),
    JSON.stringify(initialProfile.trainingInterests),
    initialProfile.academicPercentage,
    initialProfile.activeBacklogs
  );

  // Auto-login newly registered student
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    newId,
    expiresAt
  );

  res.cookie('sb_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    user: {
      id: newId,
      username: cleanUsername,
      role: 'Student' as const,
      fullName: fullName.trim(),
      department,
      email: `${cleanUsername}@skillbridge.edu`,
    },
    profile: initialProfile,
  });
});

/* ========================================================================== */
/* 2. STUDENT WORKSPACE ENDPOINTS (Scoped Strictly to Authenticated Student)  */
/* ========================================================================== */

// GET /api/student/profile
app.get('/api/student/profile', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const profRow = db.prepare('SELECT * FROM student_profiles WHERE student_id = ?').get(req.user!.id) as any;
  if (!profRow) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  const profile = {
    displayName: profRow.display_name,
    department: profRow.department,
    year: profRow.year,
    preferredRoles: JSON.parse(profRow.preferred_roles || '[]'),
    skills: JSON.parse(profRow.skills || '[]'),
    preferredLocations: JSON.parse(profRow.preferred_locations || '[]'),
    trainingInterests: JSON.parse(profRow.training_interests || '[]'),
    academicPercentage: profRow.academic_percentage,
    activeBacklogs: profRow.active_backlogs,
  };
  res.json({
    success: true,
    profile,
    ...profile,
  });
});

// PUT /api/student/profile
app.put('/api/student/profile', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const p = req.body || {};
  const existing = db.prepare('SELECT * FROM student_profiles WHERE student_id = ?').get(req.user!.id) as any;

  const displayName = p.displayName?.trim() || existing?.display_name || req.user!.fullName;
  const department = p.department || existing?.department || req.user!.department;
  const year = p.year || existing?.year || 'Final Year (4th Year)';
  const preferredRoles = p.preferredRoles || (existing ? JSON.parse(existing.preferred_roles || '[]') : ['Graduate Trainee']);
  const skills = p.skills || (existing ? JSON.parse(existing.skills || '[]') : []);
  const preferredLocations = p.preferredLocations || (existing ? JSON.parse(existing.preferred_locations || '[]') : ['Pune', 'Mumbai']);
  const trainingInterests = p.trainingInterests || (existing ? JSON.parse(existing.training_interests || '[]') : []);
  const academicPercentage = typeof p.academicPercentage === 'number' ? p.academicPercentage : (existing?.academic_percentage ?? 75.0);
  const activeBacklogs = typeof p.activeBacklogs === 'number' ? p.activeBacklogs : (existing?.active_backlogs ?? 0);

  db.prepare(`
    INSERT OR REPLACE INTO student_profiles (
      student_id, display_name, department, year, preferred_roles,
      skills, preferred_locations, training_interests, academic_percentage, active_backlogs, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    req.user!.id,
    displayName,
    department,
    year,
    JSON.stringify(preferredRoles),
    JSON.stringify(skills),
    JSON.stringify(preferredLocations),
    JSON.stringify(trainingInterests),
    academicPercentage,
    activeBacklogs
  );

  const updatedProfile = {
    displayName,
    department,
    year,
    preferredRoles,
    skills,
    preferredLocations,
    trainingInterests,
    academicPercentage,
    activeBacklogs,
  };

  res.json({ success: true, profile: updatedProfile, ...updatedProfile });
});

// GET /api/student/applications
app.get('/api/student/applications', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const rows = db
    .prepare(`
      SELECT a.id, a.opportunity_id, a.applied_date, a.status, a.student_notes, a.coordinator_feedback,
             o.title as opportunity_title, o.employer, o.type, o.fixed_pay_or_stipend, o.deadline, o.location
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.student_id = ?
      ORDER BY a.applied_date DESC
    `)
    .all(req.user!.id) as any[];

  res.json(
    rows.map((r) => ({
      id: r.id,
      opportunityId: r.opportunity_id,
      opportunityTitle: r.opportunity_title,
      employer: r.employer,
      type: r.type,
      appliedDate: r.applied_date,
      status: r.status,
      studentNotes: r.student_notes,
      coordinatorFeedback: r.coordinator_feedback,
      fixedPayOrStipend: r.fixed_pay_or_stipend,
      deadline: r.deadline,
      location: r.location,
    }))
  );
});

// POST /api/student/applications (Apply Once Per Opportunity)
app.post('/api/student/applications', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const { opportunityId, notes } = req.body;
  if (!opportunityId) {
    res.status(400).json({ error: 'Opportunity ID is required.' });
    return;
  }

  // Check opportunity exists and is not archived
  const opp = db.prepare('SELECT id, title, employer, deadline, is_expired, is_archived FROM opportunities WHERE id = ?').get(opportunityId) as any;
  if (!opp || opp.is_archived) {
    res.status(404).json({ error: 'Opportunity not found or is no longer accepting applications.' });
    return;
  }

  if (opp.is_expired || (opp.deadline && new Date(opp.deadline) < new Date(new Date().toISOString().split('T')[0]))) {
    res.status(400).json({ error: 'Application deadline for this listing has passed.' });
    return;
  }

  // Prevent duplicate applications
  const existing = db.prepare('SELECT id FROM applications WHERE student_id = ? AND opportunity_id = ?').get(req.user!.id, opportunityId);
  if (existing) {
    res.status(409).json({ error: 'Duplicate application prevented. You have already applied for this opportunity.' });
    return;
  }

  const appId = `APP-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO applications (id, opportunity_id, student_id, applied_date, status, student_notes)
    VALUES (?, ?, ?, datetime('now'), 'Submitted', ?)
  `).run(appId, opportunityId, req.user!.id, notes ? String(notes).trim() : null);

  res.status(201).json({
    success: true,
    application: {
      id: appId,
      opportunityId,
      opportunityTitle: opp.title,
      employer: opp.employer,
      status: 'Submitted',
      appliedDate: new Date().toISOString(),
    },
  });
});

// GET /api/student/saved-opportunities
app.get('/api/student/saved-opportunities', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT opportunity_id FROM saved_opportunities WHERE student_id = ?').all(req.user!.id) as { opportunity_id: string }[];
  res.json(rows.map((r) => r.opportunity_id));
});

// POST /api/student/saved-opportunities and /api/student/saved-opportunities/:opportunityId
app.post(['/api/student/saved-opportunities', '/api/student/saved-opportunities/:opportunityId'], requireRole('Student'), (req: AuthRequest, res: Response) => {
  const opportunityId = toStr(req.params.opportunityId || req.body?.opportunityId);
  if (!opportunityId) {
    res.status(400).json({ error: 'opportunityId is required.' });
    return;
  }
  const id = `SAVE-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT OR IGNORE INTO saved_opportunities (id, student_id, opportunity_id, saved_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(id, req.user!.id, opportunityId);

  res.status(200).json({ success: true, opportunityId });
});

// DELETE /api/student/saved-opportunities/:opportunityId
app.delete('/api/student/saved-opportunities/:opportunityId', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const opportunityId = toStr(req.params.opportunityId);
  db.prepare('DELETE FROM saved_opportunities WHERE student_id = ? AND opportunity_id = ?').run(req.user!.id, opportunityId);
  res.json({ success: true, removedId: opportunityId });
});

// GET /api/student/enrollments
app.get('/api/student/enrollments', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const rows = db
    .prepare(`
      SELECT e.id, e.workshop_id, e.enrolled_at, e.attendance_status,
             t.title, t.department, t.mode, t.schedule, t.trainer, t.venue
      FROM workshop_enrollments e
      JOIN training_sessions t ON e.workshop_id = t.id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `)
    .all(req.user!.id) as any[];

  res.json(
    rows.map((r) => ({
      id: r.id,
      workshopId: r.workshop_id,
      title: r.title,
      department: r.department,
      mode: r.mode,
      schedule: r.schedule,
      trainer: r.trainer,
      venue: r.venue,
      enrolledAt: r.enrolled_at,
      attendanceStatus: r.attendance_status,
    }))
  );
});

// POST /api/student/enrollments (Atomic Enrollment with Capacity & Duplicate Checks)
app.post(['/api/student/enrollments', '/api/student/enrollments/:workshopId'], requireRole('Student'), (req: AuthRequest, res: Response) => {
  const workshopId = toStr(req.params.workshopId || req.body?.workshopId);
  if (!workshopId) {
    res.status(400).json({ error: 'workshopId is required.' });
    return;
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    // Check workshop exists and capacity
    const session = db.prepare('SELECT id, title, capacity, enrolled_count FROM training_sessions WHERE id = ?').get(workshopId) as any;
    if (!session) {
      db.exec('ROLLBACK;');
      res.status(404).json({ error: 'Workshop session not found.' });
      return;
    }

    // Check duplicate enrollment
    const existing = db.prepare('SELECT id, attendance_status FROM workshop_enrollments WHERE student_id = ? AND workshop_id = ?').get(req.user!.id, workshopId) as any;
    if (existing && existing.attendance_status !== 'Cancelled') {
      db.exec('ROLLBACK;');
      res.status(409).json({ error: 'You are already enrolled in this workshop session.' });
      return;
    }

    // Check capacity
    const currentCount = (db.prepare("SELECT COUNT(*) as c FROM workshop_enrollments WHERE workshop_id = ? AND attendance_status != 'Cancelled'").get(workshopId) as any).c;
    if (currentCount >= session.capacity) {
      db.exec('ROLLBACK;');
      res.status(400).json({ error: 'This training workshop has reached maximum student capacity.' });
      return;
    }

    const enrId = `ENR-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT OR REPLACE INTO workshop_enrollments (id, workshop_id, student_id, enrolled_at, attendance_status)
      VALUES (?, ?, ?, datetime('now'), 'Enrolled')
    `).run(enrId, workshopId, req.user!.id);

    // Update counter atomically
    db.prepare("UPDATE training_sessions SET enrolled_count = (SELECT COUNT(*) FROM workshop_enrollments WHERE workshop_id = ? AND attendance_status != 'Cancelled') WHERE id = ?").run(workshopId, workshopId);

    db.exec('COMMIT;');

    res.status(201).json({
      success: true,
      enrollment: {
        id: enrId,
        workshopId,
        title: session.title,
        enrolledAt: new Date().toISOString(),
        attendanceStatus: 'Enrolled',
      },
    });
  } catch (err: any) {
    db.exec('ROLLBACK;');
    res.status(500).json({ error: `Enrollment transaction failed: ${err.message}` });
  }
});

// DELETE /api/student/enrollments/:workshopId (Cancel Own Enrollment)
app.delete('/api/student/enrollments/:workshopId', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const workshopId = toStr(req.params.workshopId);
  const enrollment = db.prepare('SELECT id, attendance_status FROM workshop_enrollments WHERE student_id = ? AND workshop_id = ?').get(req.user!.id, workshopId) as any;
  if (!enrollment) {
    res.status(404).json({ error: 'Enrollment record not found.' });
    return;
  }

  // Repeat-safe cancellation
  if (enrollment.attendance_status === 'Cancelled') {
    res.json({ success: true, message: 'Workshop enrollment is already cancelled.' });
    return;
  }

  db.prepare("UPDATE workshop_enrollments SET attendance_status = 'Cancelled' WHERE student_id = ? AND workshop_id = ?").run(req.user!.id, workshopId);

  // Update counter
  db.prepare("UPDATE training_sessions SET enrolled_count = (SELECT COUNT(*) FROM workshop_enrollments WHERE workshop_id = ? AND attendance_status != 'Cancelled') WHERE id = ?").run(workshopId, workshopId);

  res.json({ success: true, message: 'Workshop enrollment cancelled.' });
});

// GET /api/student/feedback (Own Feedback Only)
app.get('/api/student/feedback', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM feedback_submissions WHERE student_id = ? ORDER BY submitted_at DESC').all(req.user!.id) as any[];
  res.json(
    rows.map((f) => ({
      id: f.id,
      department: f.department,
      category: f.category,
      description: f.description,
      suggestedImprovement: f.suggested_improvement,
      submittedAt: f.submitted_at,
      status: f.status,
      coordinatorResponse: f.coordinator_response || undefined,
      resolutionDate: f.resolution_date || undefined,
      isDemoNotice: Boolean(f.is_demo_notice),
    }))
  );
});

// POST /api/student/feedback (Submits feedback under student_id, status forced to 'Received')
app.post('/api/student/feedback', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const { category, description, suggestedImprovement } = req.body;
  if (!category || !description) {
    res.status(400).json({ error: 'Category and description are required.' });
    return;
  }

  const id = `FB-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO feedback_submissions (
      id, department, category, description, suggested_improvement,
      submitted_at, status, is_demo_notice, student_id, is_anonymous
    ) VALUES (?, ?, ?, ?, ?, datetime('now'), 'Received', 1, ?, 1)
  `).run(id, req.user!.department, category, description.trim(), suggestedImprovement ? suggestedImprovement.trim() : '', req.user!.id);

  res.status(201).json({
    success: true,
    id,
    message: 'Feedback submitted successfully. Kept anonymous to placement coordinators.',
  });
});

// GET /api/student/guidance (Own Guidance Requests Only)
app.get('/api/student/guidance', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM guidance_requests WHERE student_id = ? ORDER BY submitted_at DESC').all(req.user!.id) as any[];
  res.json(
    rows.map((g) => ({
      id: g.id,
      studentName: g.student_name,
      department: g.department,
      preferredRole: g.preferred_role,
      topic: g.topic,
      preferredTimeSlot: g.preferred_time_slot,
      additionalNotes: g.additional_notes || undefined,
      submittedAt: g.submitted_at,
      status: g.status,
      scheduledTime: g.scheduled_time || undefined,
      coordinatorNote: g.coordinator_note || undefined,
      isDemoNotice: Boolean(g.is_demo_notice),
    }))
  );
});

// POST /api/student/guidance
app.post('/api/student/guidance', requireRole('Student'), (req: AuthRequest, res: Response) => {
  const { preferredRole, topic, preferredTimeSlot, additionalNotes } = req.body;
  if (!topic || !preferredTimeSlot) {
    res.status(400).json({ error: 'Guidance topic and preferred time slot are required.' });
    return;
  }

  const id = `GD-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO guidance_requests (
      id, student_name, department, preferred_role, topic,
      preferred_time_slot, additional_notes, submitted_at, status, is_demo_notice, student_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'Pending', 1, ?)
  `).run(
    id,
    req.user!.fullName,
    req.user!.department,
    preferredRole ? preferredRole.trim() : 'General Guidance',
    topic,
    preferredTimeSlot,
    additionalNotes ? additionalNotes.trim() : null,
    req.user!.id
  );

  res.status(201).json({ success: true, id, message: 'Guidance appointment requested successfully.' });
});

/* ========================================================================== */
/* 3. COORDINATOR WORKSPACE ENDPOINTS (Placement Coordinator & Admin Only)     */
/* ========================================================================== */

// GET /api/coordinator/metrics
app.get('/api/coordinator/metrics', requireRole('Placement Coordinator', 'Admin'), (_req: AuthRequest, res: Response) => {
  const getCount = (query: string): number => {
    try {
      return (db.prepare(query).get() as any).c;
    } catch {
      return 0;
    }
  };

  const regStudents = getCount("SELECT COUNT(*) as c FROM users WHERE role = 'Student'");
  const pendingApps = getCount("SELECT COUNT(*) as c FROM applications WHERE status IN ('Submitted', 'Under Review')");
  const totApps = getCount("SELECT COUNT(*) as c FROM applications");
  const openFb = getCount("SELECT COUNT(*) as c FROM feedback_submissions WHERE status != 'Resolved'");
  const pendGd = getCount("SELECT COUNT(*) as c FROM guidance_requests WHERE status IN ('Pending', 'Requested')");
  const totEnr = getCount("SELECT COUNT(*) as c FROM workshop_enrollments WHERE attendance_status != 'Cancelled'");
  const simCount = getCount("SELECT COUNT(*) as c FROM survey_responses");

  res.json({
    operationalMetrics: {
      registeredStudents: regStudents,
      pendingApplications: pendingApps,
      totalApplications: totApps,
      openFeedback: openFb,
      pendingGuidance: pendGd,
      totalEnrollments: totEnr,
    },
    metrics: {
      registeredStudents: regStudents,
      applicationsAwaitingReview: pendingApps,
      openFeedback: openFb,
      pendingGuidance: pendGd,
      totalEnrollments: totEnr,
    },
    registeredStudents: regStudents,
    applicationsAwaitingReview: pendingApps,
    openFeedback: openFb,
    pendingGuidance: pendGd,
    totalEnrollments: totEnr,
    simulatedResearchCount: simCount,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/coordinator/applications (All Applications with Applicant Profile)
app.get('/api/coordinator/applications', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const { opportunityId, department, status } = req.query;

  let sql = `
    SELECT a.id, a.opportunity_id, a.applied_date, a.status, a.student_notes, a.coordinator_feedback, a.reviewed_by,
           o.title as opportunity_title, o.employer, o.type, o.subdomain,
           u.full_name as student_name, u.department as student_department, u.email as student_email,
           p.year, p.academic_percentage, p.skills, p.preferred_roles
    FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    JOIN users u ON a.student_id = u.id
    LEFT JOIN student_profiles p ON a.student_id = p.student_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (opportunityId) {
    sql += ' AND a.opportunity_id = ?';
    params.push(opportunityId);
  }
  if (department && department !== 'All Departments') {
    sql += ' AND u.department = ?';
    params.push(department);
  }
  if (status && status !== 'All Statuses') {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.applied_date DESC';

  const rows = db.prepare(sql).all(...params) as any[];

  res.json(
    rows.map((r) => ({
      id: r.id,
      opportunityId: r.opportunity_id,
      opportunityTitle: r.opportunity_title,
      employer: r.employer,
      type: r.type,
      subdomain: r.subdomain,
      studentName: r.student_name,
      department: r.student_department,
      studentEmail: r.student_email,
      year: r.year,
      academicPercentage: r.academic_percentage,
      skills: JSON.parse(r.skills || '[]'),
      preferredRoles: JSON.parse(r.preferred_roles || '[]'),
      appliedDate: r.applied_date,
      status: r.status,
      studentNotes: r.student_notes,
      coordinatorFeedback: r.coordinator_feedback,
      reviewedBy: r.reviewed_by,
    }))
  );
});

// PATCH /api/coordinator/applications/:id (Update Application Status & Feedback)
app.patch('/api/coordinator/applications/:id', requireRole('Placement Coordinator', 'Admin'), (req: AuthRequest, res: Response) => {
  const id = toStr(req.params.id);
  const { status, coordinatorFeedback } = req.body;

  const validStatuses = ['Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Selected', 'Feedback Pending'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const existing = db.prepare('SELECT id FROM applications WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Application record not found.' });
    return;
  }

  db.prepare(`
    UPDATE applications
    SET status = COALESCE(?, status),
        coordinator_feedback = COALESCE(?, coordinator_feedback),
        reviewed_by = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(status || null, coordinatorFeedback !== undefined ? coordinatorFeedback : null, req.user!.id, id);

  res.json({ success: true, message: `Application ${id} status updated to ${status}.` });
});

// POST /api/coordinator/opportunities (Create Opportunity)
app.post('/api/coordinator/opportunities', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const o = req.body;
  if (!o.title || !o.employer || !o.type || !o.deadline) {
    res.status(400).json({ error: 'Title, employer, type, and deadline are required.' });
    return;
  }

  if (!isValidDate(o.deadline)) {
    res.status(400).json({ error: 'Opportunity deadline must be a valid date string (e.g. YYYY-MM-DD).' });
    return;
  }

  const validDepts = ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'];
  if (o.relevantDepartments) {
    if (!Array.isArray(o.relevantDepartments) || o.relevantDepartments.some((d: any) => !validDepts.includes(d))) {
      res.status(400).json({ error: `relevantDepartments must be an array of: ${validDepts.join(', ')}` });
      return;
    }
  }

  const id = o.id || `OPP-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO opportunities (
      id, title, employer, type, relevant_departments, subdomain,
      skills, explicit_eligibility, location, work_mode, fixed_pay_or_stipend,
      incentives, deadline, description, posted_date, source_status, is_expired, is_archived
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    o.title.trim(),
    o.employer.trim(),
    o.type,
    JSON.stringify(o.relevantDepartments || ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)']),
    o.subdomain || null,
    JSON.stringify(o.skills || []),
    o.explicitEligibility || 'Eligible across CS, IT, and DS domains.',
    o.location || 'Pune / Hybrid',
    o.workMode || 'Hybrid',
    o.fixedPayOrStipend || 'Competitive Salary',
    o.incentives || null,
    o.deadline,
    o.description || '',
    o.postedDate || new Date().toISOString().split('T')[0],
    o.sourceStatus || 'Verified Live Vacancy',
    o.isExpired ? 1 : 0,
    0
  );

  res.status(201).json({ success: true, id, message: `Opportunity "${o.title}" posted successfully.` });
});

// PUT /api/coordinator/opportunities/:id
app.put('/api/coordinator/opportunities/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const id = toStr(req.params.id);
  const existing = db.prepare('SELECT id FROM opportunities WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Opportunity record not found.' });
    return;
  }
  const o = req.body;

  if (o.deadline !== undefined && !isValidDate(o.deadline)) {
    res.status(400).json({ error: 'Opportunity deadline must be a valid date string (e.g. YYYY-MM-DD).' });
    return;
  }

  const validDepts = ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'];
  if (o.relevantDepartments !== undefined) {
    if (!Array.isArray(o.relevantDepartments) || o.relevantDepartments.some((d: any) => !validDepts.includes(d))) {
      res.status(400).json({ error: `relevantDepartments must be an array of: ${validDepts.join(', ')}` });
      return;
    }
  }

  db.prepare(`
    UPDATE opportunities
    SET title = COALESCE(?, title),
        employer = COALESCE(?, employer),
        type = COALESCE(?, type),
        relevant_departments = COALESCE(?, relevant_departments),
        subdomain = COALESCE(?, subdomain),
        skills = COALESCE(?, skills),
        explicit_eligibility = COALESCE(?, explicit_eligibility),
        location = COALESCE(?, location),
        work_mode = COALESCE(?, work_mode),
        fixed_pay_or_stipend = COALESCE(?, fixed_pay_or_stipend),
        incentives = COALESCE(?, incentives),
        deadline = COALESCE(?, deadline),
        description = COALESCE(?, description),
        is_expired = COALESCE(?, is_expired),
        is_archived = COALESCE(?, is_archived)
    WHERE id = ?
  `).run(
    o.title || null,
    o.employer || null,
    o.type || null,
    o.relevantDepartments ? JSON.stringify(o.relevantDepartments) : null,
    o.subdomain || null,
    o.skills ? JSON.stringify(o.skills) : null,
    o.explicitEligibility || null,
    o.location || null,
    o.workMode || null,
    o.fixedPayOrStipend || null,
    o.incentives !== undefined ? o.incentives : null,
    o.deadline || null,
    o.description !== undefined ? o.description : null,
    o.isExpired !== undefined ? (o.isExpired ? 1 : 0) : null,
    o.isArchived !== undefined ? (o.isArchived ? 1 : 0) : null,
    id
  );

  res.json({ success: true, message: `Opportunity ${id} updated.` });
});

// PATCH /api/coordinator/opportunities/:id/archive (Archive/Close listing while preserving applications)
app.patch('/api/coordinator/opportunities/:id/archive', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const id = toStr(req.params.id);
  const { isArchived, isExpired } = req.body;

  db.prepare(`
    UPDATE opportunities
    SET is_archived = COALESCE(?, is_archived),
        is_expired = COALESCE(?, is_expired)
    WHERE id = ?
  `).run(isArchived !== undefined ? (isArchived ? 1 : 0) : null, isExpired !== undefined ? (isExpired ? 1 : 0) : null, id);

  res.json({ success: true, message: `Opportunity ${id} status updated.` });
});

// GET /api/coordinator/training/:workshopId/enrollments (View Enrolled Students & Attendance)
app.get('/api/coordinator/training/:workshopId/enrollments', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const workshopId = toStr(req.params.workshopId);
  const rows = db
    .prepare(`
      SELECT e.id as id, e.id as enrollment_id, e.workshop_id, e.enrolled_at, e.attendance_status, e.attendance_marked_at,
             u.id as student_id, u.full_name as student_name, u.department, u.email
      FROM workshop_enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.workshop_id = ?
      ORDER BY e.enrolled_at ASC
    `)
    .all(workshopId) as any[];

  res.json(rows);
});

// PATCH /api/coordinator/training/enrollments/:enrollmentId (Mark Attendance)
app.patch('/api/coordinator/training/enrollments/:enrollmentId', requireRole('Placement Coordinator', 'Admin'), (req: AuthRequest, res: Response) => {
  const enrollmentId = toStr(req.params.enrollmentId);
  const existing = db.prepare('SELECT id, workshop_id FROM workshop_enrollments WHERE id = ?').get(enrollmentId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Workshop enrollment record not found.' });
    return;
  }

  const attendanceStatus = req.body.attendanceStatus || req.body.status;
  const valid = ['Enrolled', 'Attended', 'Absent', 'Cancelled'];
  if (!valid.includes(attendanceStatus)) {
    res.status(400).json({ error: `Attendance status must be one of: ${valid.join(', ')}` });
    return;
  }

  db.prepare(`
    UPDATE workshop_enrollments
    SET attendance_status = ?,
        attendance_marked_by = ?,
        attendance_marked_at = datetime('now')
    WHERE id = ?
  `).run(attendanceStatus, req.user!.id, enrollmentId);

  // Synchronize enrolled_count on parent training session
  db.prepare("UPDATE training_sessions SET enrolled_count = (SELECT COUNT(*) FROM workshop_enrollments WHERE workshop_id = ? AND attendance_status != 'Cancelled') WHERE id = ?").run(existing.workshop_id, existing.workshop_id);

  res.json({ success: true, message: `Attendance updated to ${attendanceStatus}.` });
});

// POST /api/coordinator/training (Create Workshop)
app.post('/api/coordinator/training', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const t = req.body;
  if (!t.title || !t.department || !t.schedule || t.capacity === undefined) {
    res.status(400).json({ error: 'Title, department, schedule, and capacity are required.' });
    return;
  }

  const validDepts = ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)', 'All Departments'];
  if (!validDepts.includes(t.department)) {
    res.status(400).json({ error: `Department must be one of: ${validDepts.join(', ')}` });
    return;
  }

  const cap = Number(t.capacity);
  if (isNaN(cap) || !Number.isInteger(cap) || cap <= 0) {
    res.status(400).json({ error: 'Workshop capacity must be a positive integer.' });
    return;
  }

  if (!isValidSchedule(t.schedule)) {
    res.status(400).json({ error: 'Workshop schedule must be a valid date, time, or recurring schedule pattern.' });
    return;
  }

  if (t.targetSkills !== undefined && !Array.isArray(t.targetSkills)) {
    res.status(400).json({ error: 'targetSkills must be an array of skill strings.' });
    return;
  }

  const id = t.id || `TRN-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO training_sessions (
      id, title, department, description, target_skills, mode,
      schedule, capacity, enrolled_count, trainer, venue, source_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).run(
    id,
    t.title.trim(),
    t.department,
    t.description || '',
    JSON.stringify(t.targetSkills || []),
    t.mode || 'Hands-on Workshop',
    t.schedule.trim(),
    cap,
    t.trainer || 'Faculty Trainer',
    t.venue || 'Computing Lab 3',
    t.sourceStatus || 'Official Schedule'
  );

  res.status(201).json({ success: true, id, message: `Workshop "${t.title}" created successfully.` });
});

// PUT /api/coordinator/training/:id (Update Workshop with capacity validation)
app.put('/api/coordinator/training/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const id = toStr(req.params.id);
  const existing = db.prepare('SELECT * FROM training_sessions WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Workshop session not found.' });
    return;
  }

  const t = req.body;
  const newCapacity = t.capacity !== undefined ? Number(t.capacity) : existing.capacity;

  if (isNaN(newCapacity) || !Number.isInteger(newCapacity) || newCapacity <= 0) {
    res.status(400).json({ error: 'Workshop capacity must be a positive integer.' });
    return;
  }

  if (t.department) {
    const validDepts = ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)', 'All Departments'];
    if (!validDepts.includes(t.department)) {
      res.status(400).json({ error: `Department must be one of: ${validDepts.join(', ')}` });
      return;
    }
  }

  if (t.schedule !== undefined && !isValidSchedule(t.schedule)) {
    res.status(400).json({ error: 'Workshop schedule must be a valid date, time, or recurring schedule pattern.' });
    return;
  }

  if (t.targetSkills !== undefined && !Array.isArray(t.targetSkills)) {
    res.status(400).json({ error: 'targetSkills must be an array of skill strings.' });
    return;
  }

  const enrCount = (
    db.prepare("SELECT COUNT(*) as c FROM workshop_enrollments WHERE workshop_id = ? AND attendance_status != 'Cancelled'").get(id) as any
  ).c;

  if (newCapacity < enrCount) {
    res.status(400).json({ error: `Capacity cannot be reduced below current enrollment count (${enrCount}).` });
    return;
  }

  db.prepare(`
    UPDATE training_sessions
    SET title = COALESCE(?, title),
        department = COALESCE(?, department),
        description = COALESCE(?, description),
        target_skills = COALESCE(?, target_skills),
        mode = COALESCE(?, mode),
        schedule = COALESCE(?, schedule),
        capacity = ?,
        trainer = COALESCE(?, trainer),
        venue = COALESCE(?, venue),
        source_status = COALESCE(?, source_status)
    WHERE id = ?
  `).run(
    t.title || null,
    t.department || null,
    t.description !== undefined ? t.description : null,
    t.targetSkills ? JSON.stringify(t.targetSkills) : null,
    t.mode || null,
    t.schedule || null,
    newCapacity,
    t.trainer || null,
    t.venue || null,
    t.sourceStatus || null,
    id
  );

  res.json({ success: true, message: `Workshop ${id} updated.` });
});

// GET /api/coordinator/feedback (Feedback Queue — OMITTING student identity to preserve anonymity)
app.get('/api/coordinator/feedback', requireRole('Placement Coordinator', 'Admin'), (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT id, department, category, description, suggested_improvement, submitted_at, status, coordinator_response, resolution_date, is_demo_notice FROM feedback_submissions ORDER BY submitted_at DESC').all() as any[];
  res.json(
    rows.map((f) => ({
      id: f.id,
      department: f.department,
      category: f.category,
      description: f.description,
      suggestedImprovement: f.suggested_improvement,
      submittedAt: f.submitted_at,
      status: f.status,
      coordinatorResponse: f.coordinator_response || undefined,
      resolutionDate: f.resolution_date || undefined,
      isDemoNotice: Boolean(f.is_demo_notice),
      // Student identity is intentionally omitted here for privacy!
    }))
  );
});

// PATCH /api/coordinator/feedback/:id (Respond and Update Status)
app.patch('/api/coordinator/feedback/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const id = toStr(req.params.id);
  const existing = db.prepare('SELECT id FROM feedback_submissions WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Feedback record not found.' });
    return;
  }

  const { status, coordinatorResponse } = req.body;
  const validStatuses = ['Received', 'Under review', 'Action planned', 'Resolved', 'Addressed', 'Archived', 'Under Review'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  db.prepare(`
    UPDATE feedback_submissions
    SET status = COALESCE(?, status),
        coordinator_response = COALESCE(?, coordinator_response),
        resolution_date = CASE WHEN ? IN ('Resolved', 'Addressed') THEN datetime('now') ELSE resolution_date END
    WHERE id = ?
  `).run(status || null, coordinatorResponse || null, status || null, id);

  res.json({ success: true, message: `Feedback ${id} updated.` });
});

// GET /api/coordinator/guidance (All Guidance Requests with Student Name)
app.get('/api/coordinator/guidance', requireRole('Placement Coordinator', 'Admin'), (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM guidance_requests ORDER BY submitted_at DESC').all() as any[];
  res.json(
    rows.map((g) => ({
      id: g.id,
      studentName: g.student_name,
      department: g.department,
      preferredRole: g.preferred_role,
      topic: g.topic,
      preferredTimeSlot: g.preferred_time_slot,
      additionalNotes: g.additional_notes || undefined,
      submittedAt: g.submitted_at,
      status: g.status,
      scheduledTime: g.scheduled_time || undefined,
      coordinatorNote: g.coordinator_note || undefined,
      isDemoNotice: Boolean(g.is_demo_notice),
    }))
  );
});

// PATCH /api/coordinator/guidance/:id (Schedule / Complete Guidance)
app.patch('/api/coordinator/guidance/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const id = toStr(req.params.id);
  const existing = db.prepare('SELECT id FROM guidance_requests WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Guidance request not found.' });
    return;
  }

  const { status, scheduledTime, coordinatorNote } = req.body;
  const validStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  db.prepare(`
    UPDATE guidance_requests
    SET status = COALESCE(?, status),
        scheduled_time = COALESCE(?, scheduled_time),
        coordinator_note = COALESCE(?, coordinator_note)
    WHERE id = ?
  `).run(status || null, scheduledTime || null, coordinatorNote || null, id);

  res.json({ success: true, message: `Guidance request ${id} updated.` });
});

// GET /api/coordinator/students (List of Registered Students across CS, IT, DS)
app.get('/api/coordinator/students', requireRole('Placement Coordinator', 'Admin'), (_req: Request, res: Response) => {
  const rows = db
    .prepare(`
      SELECT u.id, u.username, u.full_name, u.department, u.email, u.created_at,
             p.year, p.academic_percentage, p.skills, p.preferred_roles,
             (SELECT COUNT(*) FROM applications WHERE student_id = u.id) as applications_count,
             (SELECT COUNT(*) FROM workshop_enrollments WHERE student_id = u.id AND attendance_status != 'Cancelled') as enrollments_count
      FROM users u
      LEFT JOIN student_profiles p ON u.id = p.student_id
      WHERE u.role = 'Student'
      ORDER BY u.full_name ASC
    `)
    .all() as any[];

  res.json(
    rows.map((r) => ({
      id: r.id,
      username: r.username,
      fullName: r.full_name,
      department: r.department,
      email: r.email,
      createdAt: r.created_at,
      year: r.year,
      academicPercentage: r.academic_percentage,
      skills: JSON.parse(r.skills || '[]'),
      preferredRoles: JSON.parse(r.preferred_roles || '[]'),
      applicationsCount: r.applications_count,
      enrollmentsCount: r.enrollments_count,
    }))
  );
});

// POST /api/coordinator/employer-outreach
app.post('/api/coordinator/employer-outreach', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const eo = req.body;
  const id = eo.id || `OUT-${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT OR REPLACE INTO employer_outreach (
      id, employer, relevant_departments, intended_roles,
      contact_status, follow_up_date, notes, provenance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    eo.employer,
    JSON.stringify(eo.relevantDepartments || []),
    eo.intendedRoles,
    eo.contactStatus,
    eo.followUpDate,
    eo.notes,
    eo.provenance || 'Actual College Contact'
  );
  res.status(201).json({ success: true, id });
});

// PUT /api/coordinator/employer-outreach/:id
app.put('/api/coordinator/employer-outreach/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const id = toStr(req.params.id);
  const existing = db.prepare('SELECT id FROM employer_outreach WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Outreach record not found.' });
    return;
  }
  const eo = req.body;
  db.prepare(`
    UPDATE employer_outreach
    SET employer = COALESCE(?, employer),
        relevant_departments = COALESCE(?, relevant_departments),
        intended_roles = COALESCE(?, intended_roles),
        contact_status = COALESCE(?, contact_status),
        follow_up_date = COALESCE(?, follow_up_date),
        notes = COALESCE(?, notes),
        provenance = COALESCE(?, provenance)
    WHERE id = ?
  `).run(
    eo.employer || null,
    eo.relevantDepartments ? JSON.stringify(eo.relevantDepartments) : null,
    eo.intendedRoles || null,
    eo.contactStatus || null,
    eo.followUpDate || null,
    eo.notes !== undefined ? eo.notes : null,
    eo.provenance || null,
    id
  );
  res.json({ success: true, message: `Outreach record ${id} updated.` });
});

// DELETE /api/coordinator/employer-outreach/:id
app.delete('/api/coordinator/employer-outreach/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  const id = toStr(req.params.id);
  const existing = db.prepare('SELECT id FROM employer_outreach WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Outreach record not found.' });
    return;
  }
  db.prepare('DELETE FROM employer_outreach WHERE id = ?').run(id);
  res.json({ success: true, message: `Outreach record ${id} removed.` });
});

/* ========================================================================== */
/* 4. PUBLIC & SHARED READ-ONLY ENDPOINTS                                     */
/* ========================================================================== */

// GET /api/opportunities (Public Listing, omits archived for general students)
app.get('/api/opportunities', (req: AuthRequest, res: Response) => {
  try {
    const isStaff = req.user?.role === 'Placement Coordinator' || req.user?.role === 'Admin';
    const sql = isStaff
      ? 'SELECT * FROM opportunities ORDER BY posted_date DESC'
      : 'SELECT * FROM opportunities WHERE is_archived = 0 ORDER BY posted_date DESC';

    const rows = db.prepare(sql).all() as any[];
    const opportunities = rows.map((o) => ({
      id: o.id,
      title: o.title,
      employer: o.employer,
      type: o.type,
      relevantDepartments: JSON.parse(o.relevant_departments || '[]'),
      subdomain: o.subdomain || undefined,
      skills: JSON.parse(o.skills || '[]'),
      explicitEligibility: o.explicit_eligibility,
      location: o.location,
      workMode: o.work_mode,
      fixedPayOrStipend: o.fixed_pay_or_stipend,
      incentives: o.incentives || undefined,
      deadline: o.deadline,
      description: o.description,
      postedDate: o.posted_date,
      sourceStatus: o.source_status,
      isExpired: Boolean(o.is_expired),
      isArchived: Boolean(o.is_archived),
    }));
    res.json(opportunities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/training (Public Workshop Catalog)
app.get('/api/training', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM training_sessions ORDER BY id ASC').all() as any[];
    const sessions = rows.map((t) => ({
      id: t.id,
      title: t.title,
      department: t.department,
      description: t.description,
      targetSkills: JSON.parse(t.target_skills || '[]'),
      mode: t.mode,
      schedule: t.schedule,
      capacity: t.capacity,
      enrolledCount: t.enrolled_count,
      trainer: t.trainer,
      venue: t.venue,
      sourceStatus: t.source_status,
    }));
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employer-outreach (Protected CRM Overview: Placement Coordinator & Admin only)
app.get('/api/employer-outreach', requireRole('Placement Coordinator', 'Admin'), (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM employer_outreach ORDER BY id ASC').all() as any[];
    res.json(
      rows.map((eo) => ({
        id: eo.id,
        employer: eo.employer,
        relevantDepartments: JSON.parse(eo.relevant_departments || '[]'),
        intendedRoles: eo.intended_roles,
        contactStatus: eo.contact_status,
        followUpDate: eo.follow_up_date,
        notes: eo.notes,
        provenance: eo.provenance,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function parseSourceType(val: any): 'collected' | 'simulated' {
  if (!val) return 'collected';
  const str = String(val).trim().toLowerCase();
  if (str.includes('simulat')) return 'simulated';
  return 'collected';
}

// GET /api/responses/summary (Public Aggregated Research Analytics with Dynamic Filters)
app.get('/api/responses/summary', (req: Request, res: Response) => {
  try {
    const { department, year, sourceType } = req.query;
    let sql = 'SELECT * FROM survey_responses WHERE 1=1';
    const params: any[] = [];

    if (department && department !== 'All') {
      sql += ' AND department = ?';
      params.push(String(department).trim());
    }
    if (year && year !== 'All') {
      sql += ' AND year = ?';
      params.push(String(year).trim());
    }
    if (sourceType && sourceType !== 'All') {
      if (sourceType === 'simulated') {
        sql += " AND LOWER(source_type) LIKE '%simulat%'";
      } else if (sourceType === 'collected') {
        sql += " AND (source_type IS NULL OR LOWER(source_type) NOT LIKE '%simulat%')";
      }
    }

    sql += ' ORDER BY id ASC';
    const rows = db.prepare(sql).all(...params) as any[];
    const totalResponses = rows.length;

    if (totalResponses === 0) {
      res.json({
        totalResponses: 0,
        simulatedCount: 0,
        collectedCount: 0,
        departmentsRepresented: 0,
        partlyOrUnmetPercentage: 0,
        partlyOrUnmetCount: 0,
        partlyOrUnmetDenominator: 0,
        lateOrRareInfoPercentage: 0,
        lateOrRareInfoCount: 0,
        lateOrRareInfoDenominator: 0,
        averageSatisfaction: null,
        validSatisfactionCount: 0,
        averageTrainingUsefulness: null,
        validTrainingCount: 0,
        departmentDistribution: [],
        needsMetDistribution: [],
        relevantDrivesDistribution: [],
        timelinessDistribution: [],
        barriersDistribution: [],
        urgentSupportDistribution: [],
      });
      return;
    }

    let simulatedCount = 0;
    let collectedCount = 0;
    const deptCounts: Record<string, number> = {
      'Computer Science (CS)': 0,
      'Information Technology (IT)': 0,
      'Data Science (DS)': 0,
    };
    const needsCounts: Record<string, number> = {
      'Yes': 0,
      'Partly': 0,
      'No': 0,
      'Not enough experience to judge': 0,
    };
    const driveCounts: Record<string, number> = {
      '0': 0,
      '1–2': 0,
      '3 or more': 0,
      'Not sure': 0,
    };
    const timelinessCounts: Record<string, number> = {
      'Always': 0,
      'Sometimes': 0,
      'Rarely': 0,
      'Never': 0,
      'Not applicable': 0,
    };
    const barrierCounts: Record<string, number> = {};
    const urgentCounts: Record<string, number> = {};

    let validNeedsCount = 0;
    let partlyOrUnmetCount = 0;
    let validTimeCount = 0;
    let lateOrRareCount = 0;

    let satSum = 0;
    let satCount = 0;
    let trainSum = 0;
    let trainCount = 0;
    const satDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const trainDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const r of rows) {
      const isSim = (r.source_type && String(r.source_type).toLowerCase().includes('simulat'));
      if (isSim) simulatedCount++;
      else collectedCount++;

      if (r.department) {
        deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
      }
      if (r.needs_met) {
        needsCounts[r.needs_met] = (needsCounts[r.needs_met] || 0) + 1;
      }
      if (r.relevant_drives) {
        const driveKey = r.relevant_drives === '1-2' ? '1–2' : r.relevant_drives;
        driveCounts[driveKey] = (driveCounts[driveKey] || 0) + 1;
      }
      if (r.information_timeliness) {
        timelinessCounts[r.information_timeliness] = (timelinessCounts[r.information_timeliness] || 0) + 1;
      }
      if (r.biggest_barrier) {
        barrierCounts[r.biggest_barrier] = (barrierCounts[r.biggest_barrier] || 0) + 1;
      }
      if (r.urgent_support) {
        urgentCounts[r.urgent_support] = (urgentCounts[r.urgent_support] || 0) + 1;
      }

      if (['Yes', 'Partly', 'No'].includes(r.needs_met)) {
        validNeedsCount++;
        if (['Partly', 'No'].includes(r.needs_met)) {
          partlyOrUnmetCount++;
        }
      }

      if (r.information_timeliness && r.information_timeliness !== 'Not applicable') {
        validTimeCount++;
        if (['Sometimes', 'Rarely', 'Never'].includes(r.information_timeliness)) {
          lateOrRareCount++;
        }
      }

      let sat: any = r.satisfaction;
      if (typeof sat === 'string' && ['1', '2', '3', '4', '5'].includes(sat.trim())) {
        sat = parseInt(sat.trim(), 10);
      }
      if (typeof sat === 'number' && [1, 2, 3, 4, 5].includes(sat)) {
        satSum += sat;
        satCount++;
        satDist[sat] = (satDist[sat] || 0) + 1;
      }

      let train: any = r.training_usefulness;
      if (typeof train === 'string' && ['1', '2', '3', '4', '5'].includes(train.trim())) {
        train = parseInt(train.trim(), 10);
      }
      if (typeof train === 'number' && [1, 2, 3, 4, 5].includes(train)) {
        trainSum += train;
        trainCount++;
        trainDist[train] = (trainDist[train] || 0) + 1;
      }
    }

    const deptColors: Record<string, string> = {
      'Computer Science (CS)': '#2563EB',
      'Information Technology (IT)': '#7C3AED',
      'Data Science (DS)': '#0F766E',
    };
    const departmentDistribution = Object.keys(deptCounts).map((d) => ({
      name: d,
      count: deptCounts[d] || 0,
      percentage: totalResponses > 0 ? Math.round(((deptCounts[d] || 0) / totalResponses) * 1000) / 10 : 0,
      color: deptColors[d] || '#2563EB',
    }));

    const needsColors: Record<string, string> = {
      'Yes': '#15803D',
      'Partly': '#B45309',
      'No': '#B91C1C',
      'Not enough experience to judge': '#64748B',
    };
    const needsMetDistribution = Object.keys(needsCounts).map((opt) => ({
      name: opt,
      count: needsCounts[opt] || 0,
      percentage: totalResponses > 0 ? Math.round(((needsCounts[opt] || 0) / totalResponses) * 1000) / 10 : 0,
      color: needsColors[opt] || '#64748B',
    }));

    const driveColors = ['#B91C1C', '#D97706', '#2563EB', '#64748B'];
    const driveLabels: Record<string, string> = {
      '0': '0 drives',
      '1–2': '1–2 drives',
      '3 or more': '3+ drives reported',
      'Not sure': 'Not sure',
    };
    const relevantDrivesDistribution = Object.keys(driveCounts).map((opt, i) => ({
      name: driveLabels[opt] || opt,
      count: driveCounts[opt] || 0,
      percentage: totalResponses > 0 ? Math.round(((driveCounts[opt] || 0) / totalResponses) * 1000) / 10 : 0,
      color: driveColors[i % driveColors.length],
    }));

    const timeColors = ['#15803D', '#D97706', '#EA580C', '#B91C1C', '#64748B'];
    const timelinessDistribution = Object.keys(timelinessCounts).map((opt, i) => ({
      name: opt,
      count: timelinessCounts[opt] || 0,
      percentage: totalResponses > 0 ? Math.round(((timelinessCounts[opt] || 0) / totalResponses) * 1000) / 10 : 0,
      color: timeColors[i % timeColors.length],
    }));

    const barriersDistribution = Object.entries(barrierCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 1000) / 10 : 0,
        color: '#7C3AED',
      }));

    const urgentSupportDistribution = Object.entries(urgentCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 1000) / 10 : 0,
        color: '#0F766E',
      }));

    const satisfactionDistribution = [1, 2, 3, 4, 5].map((star) => ({
      rating: star,
      count: satDist[star] || 0,
      percentage: satCount > 0 ? Math.round(((satDist[star] || 0) / satCount) * 1000) / 10 : 0,
    }));

    const trainingDistribution = [1, 2, 3, 4, 5].map((star) => ({
      rating: star,
      count: trainDist[star] || 0,
      percentage: trainCount > 0 ? Math.round(((trainDist[star] || 0) / trainCount) * 1000) / 10 : 0,
    }));

    const uniqueDeptsCount = Object.values(deptCounts).filter((c) => c > 0).length;

    res.json({
      totalResponses,
      simulatedCount,
      collectedCount,
      departmentsRepresented: uniqueDeptsCount,
      partlyOrUnmetPercentage: validNeedsCount > 0 ? Math.round((partlyOrUnmetCount / validNeedsCount) * 1000) / 10 : 0,
      partlyOrUnmetCount,
      partlyOrUnmetDenominator: validNeedsCount,
      lateOrRareInfoPercentage: validTimeCount > 0 ? Math.round((lateOrRareCount / validTimeCount) * 1000) / 10 : 0,
      lateOrRareInfoCount: lateOrRareCount,
      lateOrRareInfoDenominator: validTimeCount,
      averageSatisfaction: satCount > 0 ? Math.round((satSum / satCount) * 100) / 100 : null,
      validSatisfactionCount: satCount,
      satisfactionExcludedCount: totalResponses - satCount,
      averageTrainingUsefulness: trainCount > 0 ? Math.round((trainSum / trainCount) * 100) / 100 : null,
      validTrainingCount: trainCount,
      trainingExcludedCount: totalResponses - trainCount,
      departmentDistribution,
      needsMetDistribution,
      relevantDrivesDistribution,
      timelinessDistribution,
      barriersDistribution,
      urgentSupportDistribution,
      satisfactionDistribution,
      trainingDistribution,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/responses (Restricted: Placement Coordinator & Admin Only)
app.get('/api/responses', requireRole('Placement Coordinator', 'Admin'), (_req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM survey_responses ORDER BY id ASC').all() as any[];
    res.json(
      rows.map((r) => {
        let satisfaction: any = r.satisfaction;
        if (typeof satisfaction === 'string' && ['1', '2', '3', '4', '5'].includes(satisfaction.trim())) {
          satisfaction = parseInt(satisfaction.trim(), 10);
        } else if (typeof satisfaction === 'number' && [1, 2, 3, 4, 5].includes(satisfaction)) {
          // numeric rating
        } else if (satisfaction && String(satisfaction).toLowerCase().includes('not')) {
          satisfaction = 'Not enough experience to judge';
        }

        let trainingUsefulness: any = r.training_usefulness;
        if (typeof trainingUsefulness === 'string' && ['1', '2', '3', '4', '5'].includes(trainingUsefulness.trim())) {
          trainingUsefulness = parseInt(trainingUsefulness.trim(), 10);
        } else if (trainingUsefulness && String(trainingUsefulness).toLowerCase().includes('not')) {
          trainingUsefulness = 'Have not attended';
        }

        const sourceType = (r.source_type && String(r.source_type).toLowerCase().includes('simulat')) ? 'simulated' : 'collected';

        return {
          id: r.id,
          department: r.department,
          year: r.year,
          preferredRole: r.preferred_role,
          relevantDrives: r.relevant_drives,
          needsMet: r.needs_met,
          informationTimeliness: r.information_timeliness,
          trainingUsefulness,
          biggestBarrier: r.biggest_barrier,
          urgentSupport: r.urgent_support,
          satisfaction,
          review: r.review,
          suggestion: r.suggestion,
          sourceType,
          timestamp: r.timestamp,
        };
      })
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/responses (Submit Survey Response)
app.post('/api/responses', (req: Request, res: Response) => {
  try {
    const r = req.body;
    if (!r || typeof r !== 'object') {
      res.status(400).json({ error: 'Response data payload is required.' });
      return;
    }

    const validDepts = ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'];
    if (r.department && !validDepts.includes(r.department)) {
      res.status(400).json({ error: `Department must be one of: ${validDepts.join(', ')}` });
      return;
    }

    if (!r.preferredRole || typeof r.preferredRole !== 'string' || !r.preferredRole.trim()) {
      res.status(400).json({ error: 'Preferred role is required.' });
      return;
    }

    const satParsed = parseSatisfaction(r.satisfaction);
    if (!satParsed.valid) {
      res.status(400).json({ error: String(satParsed.value) });
      return;
    }

    const trainParsed = parseTrainingUsefulness(r.trainingUsefulness);
    if (!trainParsed.valid) {
      res.status(400).json({ error: String(trainParsed.value) });
      return;
    }

    const id = r.id && typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `RES-${crypto.randomUUID().slice(0, 8)}`;
    const newRecord = {
      id,
      department: r.department || 'Computer Science (CS)',
      year: r.year || 'Final Year (4th Year)',
      preferredRole: r.preferredRole.trim(),
      relevantDrives: r.relevantDrives || '1–2',
      needsMet: r.needsMet || 'Partly',
      informationTimeliness: r.informationTimeliness || 'Sometimes',
      trainingUsefulness: trainParsed.value,
      biggestBarrier: r.biggestBarrier || 'Interview Preparation',
      urgentSupport: r.urgentSupport || 'Technical training',
      satisfaction: satParsed.value,
      review: r.review || '',
      suggestion: r.suggestion || '',
      sourceType: parseSourceType(r.sourceType),
      timestamp: r.timestamp || new Date().toISOString(),
    };

    db.prepare(`
      INSERT INTO survey_responses (
        id, department, year, preferred_role, relevant_drives, needs_met,
        information_timeliness, training_usefulness, biggest_barrier, urgent_support,
        satisfaction, review, suggestion, source_type, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newRecord.id,
      newRecord.department,
      newRecord.year,
      newRecord.preferredRole,
      newRecord.relevantDrives,
      newRecord.needsMet,
      newRecord.informationTimeliness,
      newRecord.trainingUsefulness,
      newRecord.biggestBarrier,
      newRecord.urgentSupport,
      newRecord.satisfaction,
      newRecord.review,
      newRecord.suggestion,
      newRecord.sourceType,
      newRecord.timestamp
    );

    res.status(201).json({ success: true, data: newRecord, response: newRecord, message: 'Survey response saved.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/responses/:id (Update Survey Response - Coordinator/Admin)
app.put('/api/responses/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const existing = db.prepare('SELECT id FROM survey_responses WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ error: 'Survey response not found.' });
      return;
    }

    const r = req.body;
    const validDepts = ['Computer Science (CS)', 'Information Technology (IT)', 'Data Science (DS)'];
    if (r.department && !validDepts.includes(r.department)) {
      res.status(400).json({ error: `Department must be one of: ${validDepts.join(', ')}` });
      return;
    }

    let parsedSat: any = null;
    if (r.satisfaction !== undefined) {
      const satRes = parseSatisfaction(r.satisfaction);
      if (!satRes.valid) {
        res.status(400).json({ error: String(satRes.value) });
        return;
      }
      parsedSat = satRes.value;
    }

    let parsedTrain: any = null;
    if (r.trainingUsefulness !== undefined) {
      const trainRes = parseTrainingUsefulness(r.trainingUsefulness);
      if (!trainRes.valid) {
        res.status(400).json({ error: String(trainRes.value) });
        return;
      }
      parsedTrain = trainRes.value;
    }

    const parsedSource = r.sourceType !== undefined ? parseSourceType(r.sourceType) : null;

    db.prepare(`
      UPDATE survey_responses
      SET department = COALESCE(?, department),
          year = COALESCE(?, year),
          preferred_role = COALESCE(?, preferred_role),
          relevant_drives = COALESCE(?, relevant_drives),
          needs_met = COALESCE(?, needs_met),
          information_timeliness = COALESCE(?, information_timeliness),
          training_usefulness = COALESCE(?, training_usefulness),
          biggest_barrier = COALESCE(?, biggest_barrier),
          urgent_support = COALESCE(?, urgent_support),
          satisfaction = COALESCE(?, satisfaction),
          review = COALESCE(?, review),
          suggestion = COALESCE(?, suggestion),
          source_type = COALESCE(?, source_type)
      WHERE id = ?
    `).run(
      r.department || null,
      r.year || null,
      r.preferredRole || null,
      r.relevantDrives || null,
      r.needsMet || null,
      r.informationTimeliness || null,
      parsedTrain,
      r.biggestBarrier || null,
      r.urgentSupport || null,
      parsedSat,
      r.review !== undefined ? r.review : null,
      r.suggestion !== undefined ? r.suggestion : null,
      parsedSource,
      id
    );

    res.json({ success: true, message: `Survey response ${id} updated.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/responses/:id (Delete Survey Response - Coordinator/Admin)
app.delete('/api/responses/:id', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const existing = db.prepare('SELECT id FROM survey_responses WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({ error: 'Survey response not found.' });
      return;
    }

    db.prepare('DELETE FROM survey_responses WHERE id = ?').run(id);
    res.json({ success: true, message: `Survey response ${id} deleted.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/responses/batch (Batch Import Survey Responses - Coordinator/Admin)
app.post('/api/responses/batch', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  try {
    const { responses: rawResponses, mode = 'merge' } = req.body;
    if (!Array.isArray(rawResponses)) {
      res.status(400).json({ error: 'Payload must contain a "responses" array.' });
      return;
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      if (mode === 'replace') {
        db.exec('DELETE FROM survey_responses;');
      }

      const insertStmt = db.prepare(`
        INSERT INTO survey_responses (
          id, department, year, preferred_role, relevant_drives, needs_met,
          information_timeliness, training_usefulness, biggest_barrier, urgent_support,
          satisfaction, review, suggestion, source_type, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          department = excluded.department,
          year = excluded.year,
          preferred_role = excluded.preferred_role,
          relevant_drives = excluded.relevant_drives,
          needs_met = excluded.needs_met,
          information_timeliness = excluded.information_timeliness,
          training_usefulness = excluded.training_usefulness,
          biggest_barrier = excluded.biggest_barrier,
          urgent_support = excluded.urgent_support,
          satisfaction = excluded.satisfaction,
          review = excluded.review,
          suggestion = excluded.suggestion,
          source_type = excluded.source_type,
          timestamp = excluded.timestamp
      `);

      let processed = 0;
      for (const r of rawResponses) {
        if (!r || typeof r !== 'object') continue;
        const id = r.id && typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `RES-${crypto.randomUUID().slice(0, 8)}`;
        const satVal = parseSatisfaction(r.satisfaction).valid ? parseSatisfaction(r.satisfaction).value : 3;
        const trainVal = parseTrainingUsefulness(r.trainingUsefulness).value;
        const srcVal = parseSourceType(r.sourceType);

        insertStmt.run(
          id,
          r.department || 'Computer Science (CS)',
          r.year || 'Final Year (4th Year)',
          r.preferredRole || 'Software Engineer',
          r.relevantDrives || '1–2',
          r.needsMet || 'Partly',
          r.informationTimeliness || 'Sometimes',
          trainVal,
          r.biggestBarrier || 'Interview Preparation',
          r.urgentSupport || 'Technical training',
          satVal,
          r.review || '',
          r.suggestion || '',
          srcVal,
          r.timestamp || new Date().toISOString()
        );
        processed++;
      }

      db.exec('COMMIT;');
      res.json({ success: true, count: processed, mode, message: `Successfully processed ${processed} responses in ${mode} mode.` });
    } catch (err: any) {
      db.exec('ROLLBACK;');
      res.status(500).json({ error: `Batch import failed: ${err.message}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/system-documents/:key
app.get('/api/system-documents/:key', (req: Request, res: Response) => {
  try {
    const key = toStr(req.params.key);
    const allowed = ['study_data', 'community_visits', 'problem_matrix', 'site_content', 'survey_questions'];
    if (!allowed.includes(key)) {
      res.status(403).json({ error: 'Access to document key is restricted.' });
      return;
    }
    const row = db.prepare('SELECT doc_data FROM system_documents WHERE doc_key = ?').get(key) as any;
    if (!row) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.json(JSON.parse(row.doc_data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ========================================================================== */
/* 5. PROTECTED ADMIN & MAINTENANCE ENDPOINTS (Admin Only)                    */
/* ========================================================================== */

// PUT /api/system-documents/:key (Role-scoped Document Persistence with Key-Level Schema Validation)
app.put('/api/system-documents/:key', requireRole('Placement Coordinator', 'Admin'), (req: Request, res: Response) => {
  try {
    const key = toStr(req.params.key);
    const allowed = ['study_data', 'community_visits', 'problem_matrix', 'site_content', 'survey_questions'];
    if (!allowed.includes(key)) {
      res.status(400).json({ error: 'Invalid document key.' });
      return;
    }

    // Role-specific key restrictions
    const userRole = (req as AuthRequest).user?.role;
    if (['site_content', 'survey_questions'].includes(key) && userRole !== 'Admin') {
      res.status(403).json({ error: `Security Policy: Modifying "${key}" requires Administrator privileges.` });
      return;
    }

    if (!req.body || (typeof req.body !== 'object' && !Array.isArray(req.body))) {
      res.status(400).json({ error: 'Document payload must be a valid JSON object or array.' });
      return;
    }

    // Reject completely empty payload objects
    if (typeof req.body === 'object' && !Array.isArray(req.body) && Object.keys(req.body).length === 0) {
      res.status(400).json({ error: `${key === 'site_content' ? 'siteContent' : key} cannot be an empty object; required fields are missing.` });
      return;
    }

    // Retrieve existing document for defensive partial update merging
    const existingRow = db.prepare('SELECT doc_data FROM system_documents WHERE doc_key = ?').get(key) as any;
    let existingObj: Record<string, any> = {};
    if (existingRow?.doc_data) {
      try { existingObj = JSON.parse(existingRow.doc_data); } catch {}
    }

    let mergedPayload = req.body;
    if (typeof existingObj === 'object' && !Array.isArray(existingObj) &&
        typeof req.body === 'object' && !Array.isArray(req.body)) {
      mergedPayload = { ...existingObj, ...req.body };
      if (key === 'site_content' && mergedPayload.portalTitle && !mergedPayload.siteTitle) {
        mergedPayload.siteTitle = mergedPayload.portalTitle;
      }
    }

    // Key-level schema structure validation on merged document
    let v: { valid: boolean; error?: string } = { valid: true };
    if (key === 'site_content') {
      v = validateSiteContent(mergedPayload);
    } else if (key === 'study_data') {
      v = validateStudyData(mergedPayload);
    } else if (key === 'community_visits') {
      v = validateCommunityVisits(mergedPayload);
    } else if (key === 'problem_matrix') {
      v = validateProblemMatrix(mergedPayload);
    } else if (key === 'survey_questions') {
      v = validateSurveyQuestions(mergedPayload);
    }

    if (!v.valid) {
      res.status(400).json({ error: v.error });
      return;
    }

    const docData = JSON.stringify(mergedPayload);
    db.prepare(`
      INSERT OR REPLACE INTO system_documents (doc_key, doc_data, updated_at)
      VALUES (?, ?, datetime('now'))
    `).run(key, docData);

    res.json({ success: true, key, message: `System document "${key}" persisted to SQLite.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/database/status (Restricted to Admin)
app.get('/api/database/status', requireRole('Admin'), (_req: Request, res: Response) => {
  try {
    const status = getDatabaseStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/database/schema (Restricted to Admin)
app.get('/api/database/schema', requireRole('Admin'), (_req: Request, res: Response) => {
  try {
    const tables = db
      .prepare(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      .all();
    res.json({ tables });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/database/backup (Sanitized Comprehensive JSON export - Strictly excludes passwords, salts, and session tokens)
app.get('/api/database/backup', requireRole('Admin'), (_req: Request, res: Response) => {
  try {
    const opportunities = db.prepare('SELECT * FROM opportunities').all();
    const trainingSessions = db.prepare('SELECT * FROM training_sessions').all();
    const employerOutreach = db.prepare('SELECT * FROM employer_outreach').all();
    const surveyResponses = db.prepare('SELECT * FROM survey_responses').all();
    const applications = db.prepare('SELECT * FROM applications').all();
    const workshopEnrollments = db.prepare('SELECT * FROM workshop_enrollments').all();
    const savedOpportunities = db.prepare('SELECT * FROM saved_opportunities').all();
    const feedbackSubmissions = db.prepare('SELECT * FROM feedback_submissions').all();
    const guidanceRequests = db.prepare('SELECT * FROM guidance_requests').all();
    const studentProfiles = db.prepare('SELECT * FROM student_profiles').all();
    const users = db.prepare('SELECT id, username, role, full_name as fullName, department, email, created_at as createdAt FROM users').all();
    const systemDocs = db.prepare('SELECT doc_key, doc_data FROM system_documents').all() as { doc_key: string; doc_data: string }[];

    const docsObj: Record<string, any> = {};
    for (const d of systemDocs) {
      try {
        docsObj[d.doc_key] = JSON.parse(d.doc_data);
      } catch {
        docsObj[d.doc_key] = d.doc_data;
      }
    }

    const backupPayload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      datasetInfo: 'Skill Bridge Comprehensive Portal Backup (Sanitized: credentials and tokens excluded)',
      opportunities: opportunities.map((o: any) => ({
        ...o,
        relevantDepartments: JSON.parse(o.relevant_departments || '[]'),
        skills: JSON.parse(o.skills || '[]'),
      })),
      trainingSessions: trainingSessions.map((t: any) => ({
        ...t,
        targetSkills: JSON.parse(t.target_skills || '[]'),
      })),
      employerOutreach: employerOutreach.map((eo: any) => ({
        ...eo,
        relevantDepartments: JSON.parse(eo.relevant_departments || '[]'),
      })),
      surveyResponses: surveyResponses.map((r: any) => {
        let satisfaction: any = r.satisfaction;
        if (typeof satisfaction === 'string' && ['1', '2', '3', '4', '5'].includes(satisfaction.trim())) {
          satisfaction = parseInt(satisfaction.trim(), 10);
        } else if (satisfaction && String(satisfaction).toLowerCase().includes('not')) {
          satisfaction = 'Not enough experience to judge';
        }

        let trainingUsefulness: any = r.training_usefulness;
        if (typeof trainingUsefulness === 'string' && ['1', '2', '3', '4', '5'].includes(trainingUsefulness.trim())) {
          trainingUsefulness = parseInt(trainingUsefulness.trim(), 10);
        } else if (trainingUsefulness && String(trainingUsefulness).toLowerCase().includes('not')) {
          trainingUsefulness = 'Have not attended';
        }

        return {
          id: r.id,
          department: r.department,
          year: r.year,
          preferredRole: r.preferred_role,
          relevantDrives: r.relevant_drives,
          needsMet: r.needs_met,
          informationTimeliness: r.information_timeliness,
          trainingUsefulness,
          biggestBarrier: r.biggest_barrier,
          urgentSupport: r.urgent_support,
          satisfaction,
          review: r.review,
          suggestion: r.suggestion,
          sourceType: (r.source_type && String(r.source_type).toLowerCase().includes('simulat')) ? 'simulated' : 'collected',
          timestamp: r.timestamp,
        };
      }),
      applications: applications.map((a: any) => ({
        id: a.id,
        opportunityId: a.opportunity_id,
        studentId: a.student_id,
        appliedDate: a.applied_date,
        status: a.status,
        studentNotes: a.student_notes,
        coordinatorFeedback: a.coordinator_feedback,
        reviewedBy: a.reviewed_by,
        updatedAt: a.updated_at,
      })),
      workshopEnrollments: workshopEnrollments.map((w: any) => ({
        id: w.id,
        workshopId: w.workshop_id,
        studentId: w.student_id,
        enrolledAt: w.enrolled_at,
        attendanceStatus: w.attendance_status,
        attendanceMarkedBy: w.attendance_marked_by,
        attendanceMarkedAt: w.attendance_marked_at,
      })),
      savedOpportunities: savedOpportunities.map((s: any) => ({
        id: s.id,
        studentId: s.student_id,
        opportunityId: s.opportunity_id,
        savedAt: s.saved_at,
      })),
      feedbackSubmissions: feedbackSubmissions.map((f: any) => ({
        id: f.id,
        department: f.department,
        category: f.category,
        description: f.description,
        suggestedImprovement: f.suggested_improvement,
        submittedAt: f.submitted_at,
        status: f.status,
        coordinatorResponse: f.coordinator_response,
        resolutionDate: f.resolution_date,
        isDemoNotice: Boolean(f.is_demo_notice),
        studentId: f.student_id,
        isAnonymous: Boolean(f.is_anonymous),
      })),
      guidanceRequests: guidanceRequests.map((g: any) => ({
        id: g.id,
        studentName: g.student_name,
        department: g.department,
        preferredRole: g.preferred_role,
        topic: g.topic,
        preferredTimeSlot: g.preferred_time_slot,
        additionalNotes: g.additional_notes,
        submittedAt: g.submitted_at,
        status: g.status,
        scheduledTime: g.scheduled_time,
        coordinatorNote: g.coordinator_note,
        isDemoNotice: Boolean(g.is_demo_notice),
        studentId: g.student_id,
      })),
      studentProfiles: studentProfiles.map((p: any) => ({
        studentId: p.student_id,
        displayName: p.display_name,
        department: p.department,
        year: p.year,
        preferredRoles: JSON.parse(p.preferred_roles || '[]'),
        skills: JSON.parse(p.skills || '[]'),
        preferredLocations: JSON.parse(p.preferred_locations || '[]'),
        trainingInterests: JSON.parse(p.training_interests || '[]'),
        academicPercentage: p.academic_percentage,
        activeBacklogs: p.active_backlogs,
      })),
      studyData: docsObj['study_data'],
      communityVisits: docsObj['community_visits'],
      problemMatrix: docsObj['problem_matrix'],
      siteContent: docsObj['site_content'],
      surveyQuestions: docsObj['survey_questions'],
    };

    res.json({
      success: true,
      backup: backupPayload,
      ...backupPayload,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/database/restore (Non-Destructive Safe Upsert Restore - Admin Only)
app.post('/api/database/restore', requireRole('Admin'), (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const validation = validateFullBackupPayload(payload, {
      getOpportunityIds: () => (db.prepare('SELECT id FROM opportunities').all() as any[]).map((r) => r.id),
      getWorkshopIds: () => (db.prepare('SELECT id FROM training_sessions').all() as any[]).map((r) => r.id),
      getUserIds: () => (db.prepare('SELECT id FROM users').all() as any[]).map((r) => r.id),
    });
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // Support legacy and modern property names
    const studyData = payload.studyData || payload.study;
    const communityVisits = payload.communityVisits;
    const problemMatrix = payload.problemMatrix || payload.matrix;
    const siteContent = payload.siteContent || payload.content;
    const surveyQuestions = payload.surveyQuestions || payload.questions;
    const opportunities = payload.opportunities;
    const trainingSessions = payload.trainingSessions || payload.training;
    const surveyResponses = payload.surveyResponses || payload.responses;
    const employerOutreach = payload.employerOutreach || payload.outreach;
    const applications = payload.applications;
    const workshopEnrollments = payload.workshopEnrollments;
    const savedOpportunities = payload.savedOpportunities;
    const feedbackSubmissions = payload.feedbackSubmissions;
    const guidanceRequests = payload.guidanceRequests;
    const studentProfiles = payload.studentProfiles;

    db.exec('BEGIN TRANSACTION;');
    try {
      const insertDoc = db.prepare("INSERT OR REPLACE INTO system_documents (doc_key, doc_data, updated_at) VALUES (?, ?, datetime('now'))");
      if (studyData) insertDoc.run('study_data', JSON.stringify(studyData));
      if (communityVisits) insertDoc.run('community_visits', JSON.stringify(communityVisits));
      if (problemMatrix) insertDoc.run('problem_matrix', JSON.stringify(problemMatrix));
      if (siteContent) insertDoc.run('site_content', JSON.stringify(siteContent));
      if (surveyQuestions) insertDoc.run('survey_questions', JSON.stringify(surveyQuestions));

      // Safe Upsert for Opportunities (NEVER DELETE FROM opportunities - avoids cascading delete of applications!)
      if (Array.isArray(opportunities)) {
        const upsertOpp = db.prepare(`
          INSERT INTO opportunities (
            id, title, employer, type, relevant_departments, subdomain,
            skills, explicit_eligibility, location, work_mode, fixed_pay_or_stipend,
            incentives, deadline, description, posted_date, source_status, is_expired, is_archived
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            employer = excluded.employer,
            type = excluded.type,
            relevant_departments = excluded.relevant_departments,
            subdomain = excluded.subdomain,
            skills = excluded.skills,
            explicit_eligibility = excluded.explicit_eligibility,
            location = excluded.location,
            work_mode = excluded.work_mode,
            fixed_pay_or_stipend = excluded.fixed_pay_or_stipend,
            incentives = excluded.incentives,
            deadline = excluded.deadline,
            description = excluded.description,
            posted_date = excluded.posted_date,
            source_status = excluded.source_status,
            is_expired = excluded.is_expired,
            is_archived = excluded.is_archived
        `);
        for (const o of opportunities) {
          upsertOpp.run(
            o.id,
            o.title,
            o.employer,
            o.type,
            JSON.stringify(o.relevantDepartments || o.relevant_departments || []),
            o.subdomain || null,
            JSON.stringify(o.skills || []),
            o.explicitEligibility || o.explicit_eligibility || '',
            o.location || '',
            o.workMode || o.work_mode || '',
            o.fixedPayOrStipend || o.fixed_pay_or_stipend || '',
            o.incentives || null,
            o.deadline || '',
            o.description || '',
            o.postedDate || o.posted_date || new Date().toISOString().split('T')[0],
            o.sourceStatus || o.source_status || 'Verified',
            o.isExpired || o.is_expired ? 1 : 0,
            o.isArchived || o.is_archived ? 1 : 0
          );
        }
      }

      // Safe Upsert for Training Sessions (NEVER DELETE FROM training_sessions - avoids cascading delete of enrollments!)
      if (Array.isArray(trainingSessions)) {
        const upsertTrain = db.prepare(`
          INSERT INTO training_sessions (
            id, title, department, description, target_skills, mode,
            schedule, capacity, enrolled_count, trainer, venue, source_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            department = excluded.department,
            description = excluded.description,
            target_skills = excluded.target_skills,
            mode = excluded.mode,
            schedule = excluded.schedule,
            capacity = excluded.capacity,
            trainer = excluded.trainer,
            venue = excluded.venue,
            source_status = excluded.source_status
        `);
        for (const t of trainingSessions) {
          upsertTrain.run(
            t.id,
            t.title,
            t.department || t.targetDepartment || 'All Departments',
            t.description || '',
            JSON.stringify(t.targetSkills || t.target_skills || []),
            t.mode || 'In-person',
            t.schedule || t.scheduledAt || '',
            Number(t.capacity) || 30,
            Number(t.enrolledCount || t.enrolled_count || 0),
            t.trainer || t.trainerName || '',
            t.venue || t.location || '',
            t.sourceStatus || t.source_status || 'Official Schedule'
          );
        }
      }

      // Safe Upsert for Survey Responses
      if (Array.isArray(surveyResponses)) {
        const upsertResp = db.prepare(`
          INSERT INTO survey_responses (
            id, department, year, preferred_role, relevant_drives, needs_met,
            information_timeliness, training_usefulness, biggest_barrier, urgent_support,
            satisfaction, review, suggestion, source_type, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            department = excluded.department,
            year = excluded.year,
            preferred_role = excluded.preferred_role,
            relevant_drives = excluded.relevant_drives,
            needs_met = excluded.needs_met,
            information_timeliness = excluded.information_timeliness,
            training_usefulness = excluded.training_usefulness,
            biggest_barrier = excluded.biggest_barrier,
            urgent_support = excluded.urgent_support,
            satisfaction = excluded.satisfaction,
            review = excluded.review,
            suggestion = excluded.suggestion,
            source_type = excluded.source_type,
            timestamp = excluded.timestamp
        `);
        for (const r of surveyResponses) {
          const satVal = parseSatisfaction(r.satisfaction).valid ? parseSatisfaction(r.satisfaction).value : (r.satisfaction ?? 3);
          const trainVal = parseTrainingUsefulness(r.trainingUsefulness ?? r.training_usefulness).value;
          const srcVal = parseSourceType(r.sourceType ?? r.source_type);

          upsertResp.run(
            r.id,
            r.department || 'Computer Science (CS)',
            r.year || 'Final Year (4th Year)',
            r.preferredRole || r.preferred_role || 'Software Engineer',
            r.relevantDrives || r.relevant_drives || '1–2',
            r.needsMet || r.needs_met || 'Partly',
            r.informationTimeliness || r.information_timeliness || 'Sometimes',
            trainVal,
            r.biggestBarrier || r.biggest_barrier || 'Interview Preparation',
            r.urgentSupport || r.urgent_support || 'Technical training',
            satVal,
            r.review || '',
            r.suggestion || '',
            srcVal,
            r.timestamp || new Date().toISOString()
          );
        }
      }

      // Safe Upsert for Employer Outreach
      if (Array.isArray(employerOutreach)) {
        const upsertOut = db.prepare(`
          INSERT INTO employer_outreach (
            id, employer, relevant_departments, intended_roles,
            contact_status, follow_up_date, notes, provenance
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            employer = excluded.employer,
            relevant_departments = excluded.relevant_departments,
            intended_roles = excluded.intended_roles,
            contact_status = excluded.contact_status,
            follow_up_date = excluded.follow_up_date,
            notes = excluded.notes,
            provenance = excluded.provenance
        `);
        for (const eo of employerOutreach) {
          upsertOut.run(
            eo.id,
            eo.employer,
            JSON.stringify(eo.relevantDepartments || eo.relevant_departments || []),
            eo.intendedRoles || eo.intended_roles || 'Software Engineer',
            eo.contactStatus || eo.contact_status || 'Identified',
            eo.followUpDate || eo.follow_up_date || '2026-10-15',
            eo.notes || '',
            eo.provenance || 'Demonstration Record'
          );
        }
      }

      // Safe Upsert for Applications (if included in backup)
      if (Array.isArray(applications)) {
        const upsertApp = db.prepare(`
          INSERT INTO applications (
            id, opportunity_id, student_id, applied_date, status, student_notes, coordinator_feedback, reviewed_by, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            student_notes = excluded.student_notes,
            coordinator_feedback = excluded.coordinator_feedback,
            reviewed_by = excluded.reviewed_by,
            updated_at = excluded.updated_at
        `);
        for (const a of applications) {
          upsertApp.run(
            a.id,
            a.opportunityId || a.opportunity_id,
            a.studentId || a.student_id,
            a.appliedDate || a.applied_date || new Date().toISOString(),
            a.status || 'Submitted',
            a.studentNotes || a.student_notes || null,
            a.coordinatorFeedback || a.coordinator_feedback || null,
            a.reviewedBy || a.reviewed_by || null,
            a.updatedAt || a.updated_at || new Date().toISOString()
          );
        }
      }

      // Safe Upsert for Workshop Enrollments (if included in backup)
      if (Array.isArray(workshopEnrollments)) {
        const upsertEnr = db.prepare(`
          INSERT INTO workshop_enrollments (
            id, workshop_id, student_id, enrolled_at, attendance_status, attendance_marked_by, attendance_marked_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            attendance_status = excluded.attendance_status,
            attendance_marked_by = excluded.attendance_marked_by,
            attendance_marked_at = excluded.attendance_marked_at
        `);
        for (const w of workshopEnrollments) {
          upsertEnr.run(
            w.id,
            w.workshopId || w.workshop_id,
            w.studentId || w.student_id,
            w.enrolledAt || w.enrolled_at || new Date().toISOString(),
            w.attendanceStatus || w.attendance_status || 'Enrolled',
            w.attendanceMarkedBy || w.attendance_marked_by || null,
            w.attendanceMarkedAt || w.attendance_marked_at || null
          );
        }
      }

      // Safe Insert for Saved Opportunities (if included in backup)
      if (Array.isArray(savedOpportunities)) {
        const insertSave = db.prepare(`
          INSERT OR IGNORE INTO saved_opportunities (id, student_id, opportunity_id, saved_at)
          VALUES (?, ?, ?, ?)
        `);
        for (const s of savedOpportunities) {
          insertSave.run(
            s.id,
            s.studentId || s.student_id,
            s.opportunityId || s.opportunity_id,
            s.savedAt || s.saved_at || new Date().toISOString()
          );
        }
      }

      // Safe Upsert for Feedback Submissions (if included in backup)
      if (Array.isArray(feedbackSubmissions)) {
        const upsertFb = db.prepare(`
          INSERT INTO feedback_submissions (
            id, department, category, description, suggested_improvement, submitted_at, status, coordinator_response, resolution_date, is_demo_notice, student_id, is_anonymous
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            coordinator_response = excluded.coordinator_response,
            resolution_date = excluded.resolution_date
        `);
        for (const f of feedbackSubmissions) {
          upsertFb.run(
            f.id,
            f.department,
            f.category,
            f.description,
            f.suggestedImprovement || f.suggested_improvement || '',
            f.submittedAt || f.submitted_at || new Date().toISOString(),
            f.status || 'Received',
            f.coordinatorResponse || f.coordinator_response || null,
            f.resolutionDate || f.resolution_date || null,
            f.isDemoNotice !== undefined ? (f.isDemoNotice ? 1 : 0) : 1,
            f.studentId || f.student_id || null,
            f.isAnonymous !== undefined ? (f.isAnonymous ? 1 : 0) : 1
          );
        }
      }

      // Safe Upsert for Guidance Requests (if included in backup)
      if (Array.isArray(guidanceRequests)) {
        const upsertGd = db.prepare(`
          INSERT INTO guidance_requests (
            id, student_name, department, preferred_role, topic, preferred_time_slot, additional_notes, submitted_at, status, scheduled_time, coordinator_note, is_demo_notice, student_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            scheduled_time = excluded.scheduled_time,
            coordinator_note = excluded.coordinator_note
        `);
        for (const g of guidanceRequests) {
          upsertGd.run(
            g.id,
            g.studentName || g.student_name,
            g.department,
            g.preferredRole || g.preferred_role || 'General Guidance',
            g.topic,
            g.preferredTimeSlot || g.preferred_time_slot,
            g.additionalNotes || g.additional_notes || null,
            g.submittedAt || g.submitted_at || new Date().toISOString(),
            g.status || 'Pending',
            g.scheduledTime || g.scheduled_time || null,
            g.coordinatorNote || g.coordinator_note || null,
            g.isDemoNotice !== undefined ? (g.isDemoNotice ? 1 : 0) : 1,
            g.studentId || g.student_id || null
          );
        }
      }

      // Safe Upsert for Student Profiles (if included in backup)
      if (Array.isArray(studentProfiles)) {
        const upsertProf = db.prepare(`
          INSERT INTO student_profiles (
            student_id, display_name, department, year, preferred_roles, skills, preferred_locations, training_interests, academic_percentage, active_backlogs, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(student_id) DO UPDATE SET
            display_name = excluded.display_name,
            department = excluded.department,
            year = excluded.year,
            preferred_roles = excluded.preferred_roles,
            skills = excluded.skills,
            preferred_locations = excluded.preferred_locations,
            training_interests = excluded.training_interests,
            academic_percentage = excluded.academic_percentage,
            active_backlogs = excluded.active_backlogs,
            updated_at = excluded.updated_at
        `);
        for (const p of studentProfiles) {
          upsertProf.run(
            p.studentId || p.student_id,
            p.displayName || p.display_name,
            p.department,
            p.year || 'Final Year (4th Year)',
            JSON.stringify(p.preferredRoles || p.preferred_roles || []),
            JSON.stringify(p.skills || []),
            JSON.stringify(p.preferredLocations || p.preferred_locations || []),
            JSON.stringify(p.trainingInterests || p.training_interests || []),
            p.academicPercentage ?? p.academic_percentage ?? 75.0,
            p.activeBacklogs ?? p.active_backlogs ?? 0
          );
        }
      }

      db.exec('COMMIT;');
      res.json({ success: true, message: 'Database backup successfully restored to SQLite without data loss.' });
    } catch (err: any) {
      db.exec('ROLLBACK;');
      res.status(500).json({ error: `Restore failed: ${err.message}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Curated Diagnostic Queries Registry for Safe Database Inspection
export const DIAGNOSTIC_QUERIES = [
  {
    id: 'survey_by_department',
    label: 'Survey Responses Grouped by Department',
    description: 'Counts valid survey responses across CS, IT, and DS cohorts.',
    sql: 'SELECT department, count(*) as response_count FROM survey_responses GROUP BY department ORDER BY response_count DESC;'
  },
  {
    id: 'satisfaction_ratings',
    label: 'Satisfaction Distribution across CS, IT, and DS',
    description: 'Distribution of satisfaction ratings 1 through 5.',
    sql: 'SELECT department, satisfaction, count(*) as count FROM survey_responses GROUP BY department, satisfaction ORDER BY department, satisfaction DESC;'
  },
  {
    id: 'active_opportunities',
    label: 'Active Placement Opportunities (Live)',
    description: 'List active, non-archived job and internship postings.',
    sql: 'SELECT id, title, employer, type, location, fixed_pay_or_stipend, deadline FROM opportunities WHERE is_archived = 0 ORDER BY posted_date DESC LIMIT 15;'
  },
  {
    id: 'training_sessions_roster',
    label: 'Practical Training Sessions Capacity & Enrollment',
    description: 'Capacities and current enrollments for student technical workshops.',
    sql: 'SELECT id, title, department, capacity, enrolled_count, trainer, venue FROM training_sessions ORDER BY id ASC;'
  },
  {
    id: 'applications_summary',
    label: 'Applications Breakdown by Status',
    description: 'Summary of student placement applications by status.',
    sql: 'SELECT status, count(*) as count FROM applications GROUP BY status ORDER BY count DESC;'
  },
  {
    id: 'recent_feedback',
    label: 'Student Feedback Desk Overview',
    description: 'Anonymous grievance and feedback status breakdown.',
    sql: 'SELECT category, status, count(*) as count FROM feedback_submissions GROUP BY category, status ORDER BY count DESC;'
  },
  {
    id: 'guidance_queue',
    label: '1-on-1 Guidance Desk Topics',
    description: 'Mentorship request topics and scheduling status.',
    sql: 'SELECT topic, status, count(*) as count FROM guidance_requests GROUP BY topic, status ORDER BY count DESC;'
  },
  {
    id: 'system_documents_status',
    label: 'System Documents & Content Store Timestamps',
    description: 'Last updated timestamps for persistent site configuration documents.',
    sql: 'SELECT doc_key, updated_at FROM system_documents ORDER BY doc_key ASC;'
  }
];

// GET /api/database/diagnostics (Restricted to Admin)
app.get('/api/database/diagnostics', requireRole('Admin'), (_req: Request, res: Response) => {
  res.json({ diagnostics: DIAGNOSTIC_QUERIES, queries: DIAGNOSTIC_QUERIES });
});

// POST /api/database/query (Strict Registered Diagnostic Query Runner - Admin Only)
app.post('/api/database/query', requireRole('Admin'), (req: Request, res: Response) => {
  try {
    const { sql, queryId } = req.body || {};

    if (sql) {
      res.status(400).json({
        error: 'Security Policy: Arbitrary client-supplied SQL execution is disabled. Only vetted diagnostic queryId parameters are permitted.',
      });
      return;
    }

    if (!queryId || typeof queryId !== 'string' || queryId.trim().length === 0) {
      res.status(400).json({ error: 'A valid queryId from the diagnostic registry is required.' });
      return;
    }

    const found = DIAGNOSTIC_QUERIES.find((q) => q.id === queryId.trim());
    if (!found) {
      res.status(400).json({ error: `Diagnostic query "${queryId}" not found in registry.` });
      return;
    }

    const rows = db.prepare(found.sql).all();
    res.json({ success: true, count: rows.length, queryId: found.id, label: found.label, rows });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/database/reset (Restricted to Admin)
app.post('/api/database/reset', requireRole('Admin'), (_req: Request, res: Response) => {
  try {
    seedDatabase(true);
    res.json({ success: true, message: 'Database reset to clean factory seed state.', status: getDatabaseStatus() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/database/download (Safely disabled: direct raw database file download prohibited)
app.get('/api/database/download', requireRole('Admin'), (_req: Request, res: Response) => {
  res.status(403).json({
    error: 'Direct raw SQLite database file download is disabled for credential security. Please export the sanitized JSON database backup via /api/database/backup.',
  });
});

/* ========================================================================== */
/* HEALTH CHECK                                                               */
/* ========================================================================== */

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Skill Bridge Authenticated API is active',
    timestamp: new Date().toISOString(),
  });
});

/* ========================================================================== */
/* PRODUCTION STATIC ASSET SERVING & CLIENT-SIDE SPA ROUTING                  */
/* ========================================================================== */

const DIST_PATH = path.resolve(__dirname, '../dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
    next();
  });
}

/* ========================================================================== */
/* SERVER STARTUP                                                             */
/* ========================================================================== */

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Skill Bridge Authenticated Server is running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`💾 Database file: ${DB_PATH}`);
  console.log(`=======================================================`);
});
