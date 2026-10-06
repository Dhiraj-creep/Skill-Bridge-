/**
 * Comprehensive Integration & Workflow Test Suite
 * Tests authentication, authorization, student/coordinator role separation,
 * account isolation, atomic workshops, feedback, guidance, content preservation,
 * CORS, CSRF, and full lifecycle using an isolated SQLite database on port 3099.
 */

import { spawn, spawnSync, ChildProcess } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = process.env.TEST_PORT || '3099';
const API_BASE = `http://localhost:${PORT}/api`;
const TEST_DB = path.resolve('server/database/test_isolated.sqlite');

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  cookie?: string;
}

interface ResponseResult {
  status: number;
  data: any;
  cookie?: string;
}

async function apiRequest(endpoint: string, opts: RequestOptions = {}): Promise<ResponseResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  if (opts.cookie) {
    headers['Cookie'] = opts.cookie;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch (err: any) {
    return { status: 0, data: { error: err.message } };
  }

  const cookieHeader = res.headers.get('set-cookie');
  let cookie: string | undefined = undefined;
  if (cookieHeader) {
    const match = cookieHeader.match(/sb_session=[^;]+/);
    if (match) cookie = match[0];
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, data, cookie };
}

function cleanTestDb() {
  const files = [
    TEST_DB,
    `${TEST_DB}-wal`,
    `${TEST_DB}-shm`,
  ];
  for (const f of files) {
    try {
      if (fs.existsSync(f)) {
        fs.unlinkSync(f);
      }
    } catch {
      // Ignore if locked briefly
    }
  }
}

function killProcess(child: ChildProcess) {
  if (child.pid) {
    if (process.platform === 'win32') {
      try {
        spawnSync('taskkill', ['/pid', child.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
      } catch {
        child.kill();
      }
    } else {
      child.kill('SIGTERM');
    }
  }
}

async function startServer(): Promise<ChildProcess> {
  const tsxCli = path.resolve('node_modules/tsx/dist/cli.mjs');
  const serverScript = path.resolve('server/index.ts');

  const child = spawn(process.execPath, [tsxCli, serverScript], {
    env: {
      ...process.env,
      PORT,
      DB_PATH: TEST_DB,
    },
    stdio: 'pipe',
  });

  // Wait for health endpoint
  const startTime = Date.now();
  while (Date.now() - startTime < 15000) {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/health`);
      if (res.status === 200) {
        return child;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  killProcess(child);
  throw new Error(`Test server failed to start on port ${PORT} within 15 seconds.`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('SKILL BRIDGE: ISOLATED WORKFLOW & SECURITY TEST SUITE');
  console.log(`Port: ${PORT} | Database: ${TEST_DB}`);
  console.log('======================================================\n');

  cleanTestDb();

  let serverProcess: ChildProcess | null = null;
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    console.log('Starting isolated test server process...');
    serverProcess = await startServer();
    console.log('Isolated test server is active and responding on /api/health.\n');

    /* ---------------------------------------------------------------------- */
    /* 1. AUTHENTICATION & SECURITY ENFORCEMENT                                */
    /* ---------------------------------------------------------------------- */
    console.log('--- 1. Authentication & Security Enforcement ---');

    // 1.1 Invalid login rejected
    const invalidLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username: 'student.cs', password: 'WrongPassword!999' },
    });
    assert(invalidLogin.status === 401, 'Invalid password correctly rejected with 401 Unauthorized');

    // 1.2 Unauthenticated access to protected routes rejected
    const unauthStudent = await apiRequest('/student/applications');
    assert(unauthStudent.status === 401, 'Unauthenticated /student/applications rejected with 401');

    const unauthCoordinator = await apiRequest('/coordinator/applications');
    assert(unauthCoordinator.status === 401, 'Unauthenticated /coordinator/applications rejected with 401');

    const unauthAdmin = await apiRequest('/database/status');
    assert(unauthAdmin.status === 401, 'Unauthenticated /database/status rejected with 401');

    // 1.3 Successful login as Student CS
    const csLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username: 'student.cs', password: 'Student@123' },
    });
    assert(csLogin.status === 200 && csLogin.data.success, 'Login as Student CS succeeded with 200');
    assert(Boolean(csLogin.cookie), 'Login returned valid sb_session cookie');
    const csCookie = csLogin.cookie!;

    // 1.4 Student accessing coordinator or admin endpoints receives 403 Forbidden
    const studentBlockedCoord = await apiRequest('/coordinator/applications', { cookie: csCookie });
    assert(studentBlockedCoord.status === 403, 'Student blocked from /coordinator/applications with 403 Forbidden');

    const studentBlockedAdmin = await apiRequest('/database/status', { cookie: csCookie });
    assert(studentBlockedAdmin.status === 403, 'Student blocked from /database/status with 403 Forbidden');

    // 1.5 CSRF Defense for cookie-authenticated state mutation from untrusted Origin
    const csrfBlocked = await apiRequest('/student/profile', {
      method: 'PUT',
      cookie: csCookie,
      headers: { Origin: 'http://malicious-site.com' },
      body: { skills: ['Hacked'] },
    });
    assert(
      csrfBlocked.status === 403 && csrfBlocked.data?.error?.includes('CSRF verification failed'),
      'CSRF defense: Mutation request with unapproved Origin rejected with 403'
    );

    /* ---------------------------------------------------------------------- */
    /* 2. STUDENT WORKSPACE OPERATIONS & DATA ISOLATION                       */
    /* ---------------------------------------------------------------------- */
    console.log('\n--- 2. Student Workspace Operations & Isolation ---');

    // 2.1 Update profile
    const updateProf = await apiRequest('/student/profile', {
      method: 'PUT',
      cookie: csCookie,
      body: {
        skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        preferredRoles: ['Full-Stack Developer', 'DevOps Trainee'],
        academicPercentage: 81.5,
        activeBacklogs: 0,
      },
    });
    assert(updateProf.status === 200 && updateProf.data.success, 'Student updated profile in database');

    // 2.2 Verify profile persisted
    const getProf = await apiRequest('/student/profile', { cookie: csCookie });
    assert(
      getProf.status === 200 && getProf.data.profile.academicPercentage === 81.5,
      'Student profile aggregate percentage accurately retrieved'
    );

    // 2.3 Save opportunity
    const saveOpp = await apiRequest('/student/saved-opportunities/OPP-102', {
      method: 'POST',
      cookie: csCookie,
    });
    assert(
      (saveOpp.status === 200 || saveOpp.status === 201) && saveOpp.data.success,
      'Student saved opportunity OPP-102'
    );

    const getSaved = await apiRequest('/student/saved-opportunities', { cookie: csCookie });
    const savedList = Array.isArray(getSaved.data) ? getSaved.data : getSaved.data?.savedOpportunityIds || [];
    assert(
      getSaved.status === 200 && savedList.includes('OPP-102'),
      'Saved opportunities contains OPP-102'
    );

    // 2.4 Apply to opportunity with notes
    const applyOpp = await apiRequest('/student/applications', {
      method: 'POST',
      cookie: csCookie,
      body: {
        opportunityId: 'OPP-102',
        studentNotes: 'Built multiple production apps with React & Node.',
      },
    });
    assert(
      applyOpp.status === 200 ||
        applyOpp.status === 201 ||
        ((applyOpp.status === 400 || applyOpp.status === 409) && applyOpp.data?.error?.toLowerCase().includes('already applied')),
      'Student submitted application for OPP-102'
    );

    // 2.5 Duplicate application rejected
    const dupApply = await apiRequest('/student/applications', {
      method: 'POST',
      cookie: csCookie,
      body: {
        opportunityId: 'OPP-102',
        studentNotes: 'Duplicate attempt',
      },
    });
    assert(
      (dupApply.status === 400 || dupApply.status === 409) &&
        dupApply.data?.error?.toLowerCase().includes('already applied'),
      'Duplicate application correctly rejected with 409 Conflict / 400 Bad Request'
    );

    // 2.6 Workshop enrollment
    const enrollWs = await apiRequest('/student/enrollments/TRN-101', {
      method: 'POST',
      cookie: csCookie,
    });
    assert(
      enrollWs.status === 200 ||
        enrollWs.status === 201 ||
        ((enrollWs.status === 400 || enrollWs.status === 409) && enrollWs.data?.error?.toLowerCase().includes('already enrolled')),
      'Student enrolled in practical workshop TRN-101'
    );

    // 2.7 Duplicate enrollment rejected
    const dupEnroll = await apiRequest('/student/enrollments/TRN-101', {
      method: 'POST',
      cookie: csCookie,
    });
    assert(
      (dupEnroll.status === 400 || dupEnroll.status === 409) &&
        dupEnroll.data?.error?.toLowerCase().includes('already enrolled'),
      'Duplicate workshop enrollment correctly rejected'
    );

    // 2.8 Repeat-safe unenrollment (idempotent cancellation)
    const cancelWs1 = await apiRequest('/student/enrollments/TRN-101', {
      method: 'DELETE',
      cookie: csCookie,
    });
    assert(cancelWs1.status === 200 && cancelWs1.data.success, 'Student cancelled enrollment in TRN-101');

    const cancelWs2 = await apiRequest('/student/enrollments/TRN-101', {
      method: 'DELETE',
      cookie: csCookie,
    });
    assert(cancelWs2.status === 200 && cancelWs2.data.success, 'Repeat cancellation in TRN-101 is idempotent');

    // Re-enroll for subsequent coordinator attendance test
    await apiRequest('/student/enrollments/TRN-101', {
      method: 'POST',
      cookie: csCookie,
    });

    // 2.9 Submit anonymous feedback
    const fbRes = await apiRequest('/student/feedback', {
      method: 'POST',
      cookie: csCookie,
      body: {
        category: 'Technical Preparation',
        description: 'Need more hands-on system design mock rounds for technical placements.',
        suggestedImprovement: 'Organize 2 weekend system design bootcamps.',
      },
    });
    assert(
      (fbRes.status === 200 || fbRes.status === 201) && fbRes.data.success,
      'Student submitted anonymous feedback ticket'
    );

    // 2.10 Request 1-on-1 guidance appointment
    const gdRes = await apiRequest('/student/guidance', {
      method: 'POST',
      cookie: csCookie,
      body: {
        preferredRole: 'Full-Stack Developer',
        topic: 'Technical Interview Preparation',
        preferredTimeSlot: 'Thursday 3:00 PM – 4:00 PM',
        additionalNotes: 'Want to review microservices portfolio and resume structure.',
      },
    });
    assert(
      (gdRes.status === 200 || gdRes.status === 201) && gdRes.data.success,
      'Student requested 1-on-1 guidance appointment'
    );

    // 2.11 Verify Account Isolation: Student DS cannot see Student CS's records
    const dsLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username: 'student.ds', password: 'Student@123' },
    });
    assert(dsLogin.status === 200 && dsLogin.data.success, 'Login as Student DS succeeded');
    const dsCookie = dsLogin.cookie!;

    const dsApps = await apiRequest('/student/applications', { cookie: dsCookie });
    const dsAppList = Array.isArray(dsApps.data) ? dsApps.data : dsApps.data?.applications || [];
    const dsSeesCsApp = dsAppList.some(
      (a: any) => a.opportunityId === 'OPP-102' && a.studentNotes?.includes('Built multiple production apps')
    );
    assert(!dsSeesCsApp, 'Account Isolation: Student DS CANNOT see Student CS private applications');

    /* ---------------------------------------------------------------------- */
    /* 3. COORDINATOR OPERATIONS & ADMINISTRATIVE AUDITING                   */
    /* ---------------------------------------------------------------------- */
    console.log('\n--- 3. Coordinator Operations & Auditing ---');

    // 3.1 Coordinator Login
    const coordLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username: 'coordinator', password: 'Coordinator@123' },
    });
    assert(coordLogin.status === 200 && coordLogin.data.success, 'Coordinator authenticated successfully');
    const coordCookie = coordLogin.cookie!;

    // 3.2 Coordinator Metrics
    const metricsRes = await apiRequest('/coordinator/metrics', { cookie: coordCookie });
    assert(
      metricsRes.status === 200 && typeof metricsRes.data.metrics.registeredStudents === 'number',
      `Coordinator operational metrics retrieved (${metricsRes.data.metrics.registeredStudents} registered students)`
    );

    // 3.3 Coordinator reviews Student CS application and leaves feedback
    const coordApps = await apiRequest('/coordinator/applications', { cookie: coordCookie });
    assert(coordApps.status === 200, 'Coordinator retrieved student applications queue');

    const appList = Array.isArray(coordApps.data) ? coordApps.data : coordApps.data?.applications || [];
    const targetApp = appList.find((a: any) => a.opportunityId === 'OPP-102');
    assert(Boolean(targetApp), 'Coordinator located Student application for OPP-102 in queue');

    if (targetApp) {
      const updateStatus = await apiRequest(`/coordinator/applications/${targetApp.id}`, {
        method: 'PATCH',
        cookie: coordCookie,
        body: {
          status: 'Shortlisted',
          coordinatorFeedback: 'Verified full-stack portfolio on GitHub; shortlisted for Technical Interview Round 1.',
        },
      });
      assert(updateStatus.status === 200 && updateStatus.data.success, 'Coordinator updated status to Shortlisted and saved feedback');
    }

    // 3.4 Coordinator responds to anonymous student feedback
    const coordFb = await apiRequest('/coordinator/feedback', { cookie: coordCookie });
    assert(coordFb.status === 200, 'Coordinator retrieved feedback queue');
    const fbList = Array.isArray(coordFb.data) ? coordFb.data : coordFb.data?.feedback || [];
    assert(
      fbList.every((f: any) => f.studentId === undefined),
      'Coordinator feedback queue preserves true anonymity (studentId not exposed)'
    );

    const targetFb = fbList[0];
    if (targetFb) {
      const respondFb = await apiRequest(`/coordinator/feedback/${targetFb.id}`, {
        method: 'PATCH',
        cookie: coordCookie,
        body: {
          status: 'Addressed',
          coordinatorResponse: 'Scheduled weekend System Design clinic with industry guest mentor.',
        },
      });
      assert(respondFb.status === 200 && respondFb.data.success, 'Coordinator officially responded to student grievance');
    }

    // 3.5 Coordinator schedules guidance appointment
    const coordGd = await apiRequest('/coordinator/guidance', { cookie: coordCookie });
    assert(coordGd.status === 200, 'Coordinator retrieved guidance desk queue');

    const gdList = Array.isArray(coordGd.data) ? coordGd.data : coordGd.data?.guidance || [];
    const targetGd = gdList[0];
    if (targetGd) {
      const schedRes = await apiRequest(`/coordinator/guidance/${targetGd.id}`, {
        method: 'PATCH',
        cookie: coordCookie,
        body: {
          status: 'Scheduled',
          scheduledTime: 'Thursday 3:30 PM, TPO Office Room 102',
          coordinatorNote: 'Confirmed. Please bring printouts of your project architecture diagram.',
        },
      });
      assert(schedRes.status === 200 && schedRes.data.success, 'Coordinator scheduled guidance appointment with room & note');
    }

    // 3.6 Coordinator marks workshop attendance
    const wsEnrollments = await apiRequest('/coordinator/training/TRN-101/enrollments', { cookie: coordCookie });
    assert(wsEnrollments.status === 200, 'Coordinator retrieved workshop roster for TRN-101');

    const enrollmentList = Array.isArray(wsEnrollments.data) ? wsEnrollments.data : wsEnrollments.data?.enrollments || [];
    const studentEnrollment = enrollmentList.find(
      (e: any) =>
        e.studentName?.includes('Dhiraj') ||
        e.student_name?.includes('Dhiraj') ||
        e.studentName?.includes('Student') ||
        e.student_name?.includes('Student') ||
        Boolean(e.student_id)
    );
    if (studentEnrollment) {
      const enrId = studentEnrollment.id || studentEnrollment.enrollment_id;
      const markAtt = await apiRequest(`/coordinator/training/enrollments/${enrId}`, {
        method: 'PATCH',
        cookie: coordCookie,
        body: { status: 'Attended' },
      });
      assert(markAtt.status === 200 && markAtt.data.success, 'Coordinator marked verified student attendance as Attended');
    }

    // 3.7 Coordinator workshop capacity validation
    const reduceCapFail = await apiRequest('/coordinator/training/TRN-101', {
      method: 'PUT',
      cookie: coordCookie,
      body: { capacity: 0 },
    });
    assert(
      reduceCapFail.status === 400 && reduceCapFail.data?.error?.includes('capacity'),
      'Workshop capacity reduction below active enrollments rejected with 400'
    );

    const updateWsValid = await apiRequest('/coordinator/training/TRN-101', {
      method: 'PUT',
      cookie: coordCookie,
      body: {
        capacity: 45,
        venue: 'Computer Center Main Hall',
        schedule: 'Thursday 2:00 PM – 5:00 PM',
      },
    });
    assert(updateWsValid.status === 200 && updateWsValid.data.success, 'Coordinator updated workshop capacity and venue');

    // 3.8 Coordinator creates new opportunity drive
    const newDriveRes = await apiRequest('/coordinator/opportunities', {
      method: 'POST',
      cookie: coordCookie,
      body: {
        title: 'Cloud DevOps Associate',
        employer: 'Persistent Systems',
        type: 'Full-time Placement',
        workMode: 'Hybrid',
        location: 'Pune, Maharashtra',
        fixedPayOrStipend: '₹7.2 LPA Base CTC',
        relevantDepartments: ['Computer Science (CS)', 'Information Technology (IT)'],
        skills: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
        deadline: '2026-11-28',
        explicitEligibility: '65% throughout, <= 1 active backlog',
        description: 'Cloud deployment automation and containerization infrastructure placement drive.',
      },
    });
    assert(
      (newDriveRes.status === 200 || newDriveRes.status === 201) && newDriveRes.data.success,
      'Coordinator published new campus placement opportunity'
    );
    const createdOppId = newDriveRes.data.opportunity?.id || 'OPP-101';

    // 3.9 Coordinator edits existing opportunity
    const editOppRes = await apiRequest(`/coordinator/opportunities/${createdOppId}`, {
      method: 'PUT',
      cookie: coordCookie,
      body: {
        title: 'Senior Cloud DevOps Associate',
        fixedPayOrStipend: '₹8.0 LPA Base CTC',
      },
    });
    assert(editOppRes.status === 200 && editOppRes.data.success, 'Coordinator updated existing opportunity via PUT endpoint');

    // 3.10 Coordinator Employer Outreach CRUD
    const createOutreach = await apiRequest('/coordinator/employer-outreach', {
      method: 'POST',
      cookie: coordCookie,
      body: {
        id: 'OUT-TEST',
        employer: 'Tech Innovations Ltd',
        relevantDepartments: ['Computer Science (CS)'],
        intendedRoles: 'AI Research Engineer',
        contactStatus: 'Initial Inquiry',
        followUpDate: '2026-11-20',
        notes: 'Discussion with HR lead.',
        provenance: 'Test Record',
      },
    });
    assert(
      (createOutreach.status === 200 || createOutreach.status === 201) && createOutreach.data.success,
      'Coordinator added employer outreach record'
    );

    const updateOutreach = await apiRequest('/coordinator/employer-outreach/OUT-TEST', {
      method: 'PUT',
      cookie: coordCookie,
      body: {
        contactStatus: 'Discussion Scheduled',
        notes: 'Campus drive slot confirmed.',
      },
    });
    assert(updateOutreach.status === 200 && updateOutreach.data.success, 'Coordinator updated employer outreach status to Discussion Scheduled');

    const deleteOutreach = await apiRequest('/coordinator/employer-outreach/OUT-TEST', {
      method: 'DELETE',
      cookie: coordCookie,
    });
    assert(deleteOutreach.status === 200 && deleteOutreach.data.success, 'Coordinator deleted employer outreach record');

    // 3.11 Employer Outreach Public Access Restriction
    const publicOutreach = await apiRequest('/employer-outreach');
    assert(publicOutreach.status === 401 || publicOutreach.status === 403, 'Unauthenticated access to /employer-outreach blocked with 401/403');

    const studentOutreach = await apiRequest('/employer-outreach', { cookie: csCookie });
    assert(studentOutreach.status === 403, 'Student access to /employer-outreach blocked with 403 Forbidden');

    const coordOutreach = await apiRequest('/employer-outreach', { cookie: coordCookie });
    assert(coordOutreach.status === 200 && Array.isArray(coordOutreach.data), 'Coordinator access to /employer-outreach succeeds with 200 OK');

    /* ---------------------------------------------------------------------- */
    /* 4. RESEARCH RESPONSES CRUD                                            */
    /* ---------------------------------------------------------------------- */
    console.log('\n--- 4. Research Responses CRUD ---');

    // 4.1 Valid response creation
    const createResp = await apiRequest('/responses', {
      method: 'POST',
      body: {
        department: 'Computer Science (CS)',
        year: 'Final Year (4th Year)',
        preferredRole: 'Software Engineer',
        relevantDrives: 'Sometimes',
        needsMet: 'Partially met',
        informationTimeliness: 'Usually timely',
        trainingUsefulness: 4,
        biggestBarrier: 'Interview preparation',
        urgentSupport: 'Technical training',
        satisfaction: 4,
        review: 'Good portal experience.',
        suggestion: 'Keep adding practical workshops.',
        sourceType: 'collected',
        questionnaireVersion: '1.0',
      },
    });
    assert(
      (createResp.status === 200 || createResp.status === 201) && createResp.data.success,
      'Survey response created successfully'
    );
    const newRespId = createResp.data.data?.id;
    assert(Boolean(newRespId), `Generated survey response ID: ${newRespId}`);

    // 4.2 Invalid response rejected
    const invalidResp = await apiRequest('/responses', {
      method: 'POST',
      body: {
        department: 'Invalid Department Name',
        satisfaction: 99,
      },
    });
    assert(invalidResp.status === 400, 'Invalid survey response rejected with 400 Bad Request');

    // 4.3 Update response
    if (newRespId) {
      const updateResp = await apiRequest(`/responses/${newRespId}`, {
        method: 'PUT',
        cookie: coordCookie,
        body: {
          department: 'Computer Science (CS)',
          satisfaction: 5,
        },
      });
      assert(updateResp.status === 200 && updateResp.data.success, 'Survey response updated via PUT /responses/:id');

      // 4.4 Delete response
      const deleteResp = await apiRequest(`/responses/${newRespId}`, {
        method: 'DELETE',
        cookie: coordCookie,
      });
      assert(deleteResp.status === 200 && deleteResp.data.success, 'Survey response deleted via DELETE /responses/:id');
    }

    // 4.5 Qualitative / Non-numeric survey ratings support
    const nonNumericResp = await apiRequest('/responses', {
      method: 'POST',
      body: {
        department: 'Information Technology (IT)',
        year: 'Third Year (3rd Year)',
        preferredRole: 'DevOps Engineer',
        relevantDrives: 'Often',
        needsMet: 'Mostly met',
        informationTimeliness: 'Usually timely',
        trainingUsefulness: 'Have not attended',
        biggestBarrier: 'Lack of opportunities',
        urgentSupport: 'Practical workshops',
        satisfaction: 'Not enough experience to judge',
        review: 'New student on campus.',
        sourceType: 'collected',
        questionnaireVersion: '1.0',
      },
    });
    assert(
      (nonNumericResp.status === 200 || nonNumericResp.status === 201) && nonNumericResp.data.success,
      'Survey response with qualitative values ("Have not attended", "Not enough experience to judge") accepted'
    );
    const nonNumId = nonNumericResp.data.data?.id;
    if (nonNumId) {
      const getRespList = await apiRequest('/responses', { cookie: coordCookie });
      const respList = Array.isArray(getRespList.data) ? getRespList.data : getRespList.data?.responses || [];
      const found = respList.find((r: any) => r.id === nonNumId);
      assert(
        found &&
          found.trainingUsefulness === 'Have not attended' &&
          found.satisfaction === 'Not enough experience to judge',
        'Non-numeric survey values stored and retrieved accurately without coercion'
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 5. SYSTEM DOCUMENTS KEY-LEVEL AUTHORIZATION                           */
    /* ---------------------------------------------------------------------- */
    console.log('\n--- 5. System Documents Key-Level Authorization ---');

    // 5.1 Coordinator mutating site_content rejected (Admin only)
    const coordSiteBlock = await apiRequest('/system-documents/site_content', {
      method: 'PUT',
      cookie: coordCookie,
      body: { portalTitle: 'Defaced Title' },
    });
    assert(coordSiteBlock.status === 403, 'Coordinator blocked from mutating site_content with 403 Forbidden');

    // 5.2 Coordinator mutating survey_questions rejected (Admin only)
    const coordQuesBlock = await apiRequest('/system-documents/survey_questions', {
      method: 'PUT',
      cookie: coordCookie,
      body: [{ id: 'Q1', text: 'Tampered Question' }],
    });
    assert(coordQuesBlock.status === 403, 'Coordinator blocked from mutating survey_questions with 403 Forbidden');

    // 5.3 Coordinator mutating study_data allowed
    const coordStudyOk = await apiRequest('/system-documents/study_data', {
      method: 'PUT',
      cookie: coordCookie,
      body: { status: 'Conducted', actionPlan: [], gapAnalysis: [], days: [], interviewGuide: [] },
    });
    assert(coordStudyOk.status === 200 && coordStudyOk.data.success, 'Coordinator authorized to update study_data with 200 OK');

    // 5.4 System document schema validation rejects invalid document shapes
    const malformedDoc = await apiRequest('/system-documents/study_data', {
      method: 'PUT',
      cookie: coordCookie,
      body: { status: 'UnknownStatus', actionPlan: 'not-an-array' },
    });
    assert(malformedDoc.status === 400, 'Malformed system document rejected with 400 Bad Request');

    const invalidDocKey = await apiRequest('/system-documents/unauthorized_key', {
      method: 'PUT',
      cookie: coordCookie,
      body: { key: 'value' },
    });
    assert(invalidDocKey.status === 400, 'Unrecognized system document key rejected with 400 Bad Request');

    /* ---------------------------------------------------------------------- */
    /* 6. ADMIN SECURITY ENFORCEMENT & BLOCKED SENSITIVE TABLES              */
    /* ---------------------------------------------------------------------- */
    console.log('\n--- 6. Admin Security & SQL Protection ---');

    const adminLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'Admin@123' },
    });
    assert(adminLogin.status === 200 && adminLogin.data.success, 'Admin authenticated successfully');
    const adminCookie = adminLogin.cookie!;

    // 6.1 Admin can update site_content
    const adminSiteOk = await apiRequest('/system-documents/site_content', {
      method: 'PUT',
      cookie: adminCookie,
      body: { portalTitle: 'Skill Bridge Admin Configured' },
    });
    assert(adminSiteOk.status === 200 && adminSiteOk.data.success, 'Admin successfully updated site_content');

    // 6.2 Sanitized Database Backup Export: Must NOT dump users or sessions
    const backupRes = await apiRequest('/database/backup', { cookie: adminCookie });
    assert(backupRes.status === 200 && backupRes.data.success, 'Admin retrieved sanitized database backup');
    const backupData = backupRes.data.backup;
    assert(
      backupData &&
        !backupData.users &&
        !backupData.sessions &&
        !JSON.stringify(backupData).includes('password_hash') &&
        !JSON.stringify(backupData).includes('salt'),
      'Sanitized backup strictly omits users, sessions, password_hash, and salt'
    );

    // 6.3 Secure Diagnostic Queries: Client-supplied raw SQL requests strictly rejected
    const sqlTableAttacks = [
      'SELECT * FROM users',
      'SELECT * FROM "users"',
      'SELECT * FROM [users]',
      'SELECT * FROM `users`',
      'SELECT * FROM sqlite_master',
      'SELECT * FROM sessions',
      'SELECT count(*) as total FROM opportunities',
    ];

    for (const sql of sqlTableAttacks) {
      const sqlRes = await apiRequest('/database/query', {
        method: 'POST',
        cookie: adminCookie,
        body: { sql },
      });
      assert(
        sqlRes.status === 400 && sqlRes.data?.error?.includes('queryId'),
        `SQL Runner strictly rejects raw client SQL "${sql}" with 400 Bad Request`
      );
    }

    // 6.4 Unknown queryId rejected
    const unknownQueryRes = await apiRequest('/database/query', {
      method: 'POST',
      cookie: adminCookie,
      body: { queryId: 'unregistered_exploit_query' },
    });
    assert(
      unknownQueryRes.status === 400,
      'Unregistered queryId correctly rejected with 400 Bad Request'
    );

    // 6.5 Diagnostic Queries Registry & Curated Queries
    const diagListRes = await apiRequest('/database/diagnostics', { cookie: adminCookie });
    assert(
      diagListRes.status === 200 && Array.isArray(diagListRes.data.queries) && diagListRes.data.queries.length >= 4,
      'Curated diagnostic queries registry available via GET /database/diagnostics'
    );

    const diagExecRes = await apiRequest('/database/query', {
      method: 'POST',
      cookie: adminCookie,
      body: { queryId: 'survey_by_department' },
    });
    assert(
      diagExecRes.status === 200 && Array.isArray(diagExecRes.data.rows),
      'Diagnostic query "survey_by_department" executes successfully by queryId'
    );

    // 6.6 Block raw database download endpoint
    const rawDownloadRes = await apiRequest('/database/download', { cookie: adminCookie });
    assert(
      rawDownloadRes.status === 403,
      'Raw database file download endpoint blocked with 403 Forbidden'
    );

    // 6.6.1 Malformed restore payloads rejected before database mutations
    const malformedRestoreRes = await apiRequest('/database/restore', {
      method: 'POST',
      cookie: adminCookie,
      body: { siteContent: [] }, // Array instead of object
    });
    assert(
      malformedRestoreRes.status === 400 && malformedRestoreRes.data?.error?.includes('siteContent'),
      'Malformed restore payload (siteContent: []) rejected with 400 Bad Request prior to DB mutation'
    );

    const emptySiteContentRestore = await apiRequest('/database/restore', {
      method: 'POST',
      cookie: adminCookie,
      body: { siteContent: {} }, // Empty object missing required fields
    });
    assert(
      emptySiteContentRestore.status === 400 && emptySiteContentRestore.data?.error?.includes('siteContent'),
      'Empty siteContent ({}) restore payload rejected with 400 Bad Request prior to DB mutation'
    );

    const emptySiteContentDocPut = await apiRequest('/system-documents/site_content', {
      method: 'PUT',
      cookie: adminCookie,
      body: {}, // Empty document missing required fields
    });
    assert(
      emptySiteContentDocPut.status === 400 && emptySiteContentDocPut.data?.error?.includes('siteContent'),
      'PUT /system-documents/site_content with empty object rejected with 400 Bad Request'
    );

    const refIntegrityAppRestore = await apiRequest('/database/restore', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        applications: [
          {
            id: 'APP-NONEXISTENT',
            opportunityId: 'OPP-NONEXISTENT-999',
            studentId: 'STU-CS-01',
          },
        ],
      },
    });
    assert(
      refIntegrityAppRestore.status === 400 && refIntegrityAppRestore.data?.error?.includes('nonexistent opportunity'),
      'Restore with application referencing nonexistent opportunity rejected with 400 referential integrity error'
    );

    const refIntegrityEnrRestore = await apiRequest('/database/restore', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        workshopEnrollments: [
          {
            id: 'ENR-NONEXISTENT',
            workshopId: 'TRN-NONEXISTENT-999',
            studentId: 'STU-CS-01',
          },
        ],
      },
    });
    assert(
      refIntegrityEnrRestore.status === 400 && refIntegrityEnrRestore.data?.error?.includes('nonexistent workshop'),
      'Restore with enrollment referencing nonexistent workshop rejected with 400 referential integrity error'
    );

    // 6.7 Non-Destructive Restore preserves linked applications and enrollments
    // Check student's current applications and enrollments prior to restore
    const studentAppsBefore = await apiRequest('/student/applications', { cookie: csCookie });
    const studentEnrollsBefore = await apiRequest('/student/enrollments', { cookie: csCookie });
    const appsBefore = Array.isArray(studentAppsBefore.data) ? studentAppsBefore.data : studentAppsBefore.data?.applications || [];
    const enrollsBefore = Array.isArray(studentEnrollsBefore.data) ? studentEnrollsBefore.data : studentEnrollsBefore.data?.enrollments || [];
    assert(
      appsBefore.some((a: any) => a.opportunityId === 'OPP-102'),
      'Student has verified existing application for OPP-102 prior to restore'
    );
    assert(
      enrollsBefore.some((e: any) => e.workshopId === 'TRN-101' || e.sessionId === 'TRN-101'),
      'Student has verified existing enrollment for TRN-101 prior to restore'
    );

    // Execute restore with legacy alias keys and existing opportunities/sessions
    const restoreRes = await apiRequest('/database/restore', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        opportunities: [
          {
            id: 'OPP-102',
            title: 'Full Stack Engineer (Updated via Non-destructive Restore)',
            employer: 'CloudScale Technologies',
            type: 'Job',
            workMode: 'On-site',
            location: 'Bangalore, Karnataka',
            fixedPayOrStipend: '₹8.5 LPA Base CTC',
            relevantDepartments: ['Computer Science (CS)', 'Information Technology (IT)'],
            skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
            deadline: '2026-11-15',
            explicitEligibility: '60% throughout, no active backlogs',
            description: 'Updated opportunity details.',
            sourceProvenance: 'Demonstration Record',
          },
        ],
        trainingSessions: [
          {
            id: 'TRN-101',
            title: 'Full-Stack Practical Workshop (Updated via Restore)',
            type: 'Technical Workshop',
            targetDepartment: 'All Departments',
            targetYear: 'All Years',
            scheduledAt: '2026-10-18T10:00:00Z',
            durationMinutes: 120,
            location: 'Computer Lab 3 & Online Hybrid',
            trainerName: 'Prof. Ramesh K. & Industry Guest',
            trainerRole: 'Senior Staff Architect',
            capacity: 60,
            description: 'Updated workshop description.',
            prerequisites: ['Basic JavaScript / Web Fundamentals'],
            tags: ['React', 'Node.js', 'SQL'],
            attendanceCount: 1,
            isCompleted: false,
          },
        ],
        // Test legacy key aliases
        responses: [
          {
            id: 'RES-LEGACY-01',
            department: 'Computer Science (CS)',
            year: 'Final Year (4th Year)',
            preferredRole: 'Software Engineer',
            relevantDrives: 'Always',
            needsMet: 'Fully met',
            informationTimeliness: 'Always on time',
            trainingUsefulness: 'Very useful',
            biggestBarrier: 'None',
            urgentSupport: 'Mock interviews',
            satisfaction: 5,
            review: 'Legacy backup format compatibility check.',
            sourceType: 'collected',
            questionnaireVersion: '1.0',
          },
        ],
      },
    });
    assert(restoreRes.status === 200 && restoreRes.data.success, 'Database restore executed with 200 OK');

    // Confirm that student application and enrollment were NOT deleted by cascade!
    const studentAppsAfter = await apiRequest('/student/applications', { cookie: csCookie });
    const studentEnrollsAfter = await apiRequest('/student/enrollments', { cookie: csCookie });
    const appsAfter = Array.isArray(studentAppsAfter.data) ? studentAppsAfter.data : studentAppsAfter.data?.applications || [];
    const enrollsAfter = Array.isArray(studentEnrollsAfter.data) ? studentEnrollsAfter.data : studentEnrollsAfter.data?.enrollments || [];

    assert(
      appsAfter.some((a: any) => a.opportunityId === 'OPP-102'),
      'CRITICAL: Student application for OPP-102 SURVIVED restore without cascade deletion'
    );
    assert(
      enrollsAfter.some((e: any) => e.workshopId === 'TRN-101' || e.sessionId === 'TRN-101'),
      'CRITICAL: Student workshop enrollment for TRN-101 SURVIVED restore without cascade deletion'
    );

    // Verify opportunity was updated
    const getOppAfter = await apiRequest('/opportunities');
    const oppList = Array.isArray(getOppAfter.data) ? getOppAfter.data : getOppAfter.data?.opportunities || [];
    const updatedOpp = oppList.find((o: any) => o.id === 'OPP-102');
    assert(
      updatedOpp && updatedOpp.title.includes('Updated via Non-destructive Restore'),
      'Opportunity record upserted correctly during non-destructive restore'
    );

    // 6.8 Valid database round trip export & restore
    const exportBackupRes = await apiRequest('/database/backup', { cookie: adminCookie });
    assert(
      exportBackupRes.status === 200 && exportBackupRes.data?.backup,
      'Admin exported full sanitized backup payload successfully'
    );
    const roundTripRestoreRes = await apiRequest('/database/restore', {
      method: 'POST',
      cookie: adminCookie,
      body: exportBackupRes.data.backup,
    });
    assert(
      roundTripRestoreRes.status === 200 && roundTripRestoreRes.data?.success,
      'Valid application backup restored successfully in full round-trip transaction'
    );

    /* ---------------------------------------------------------------------- */
    /* 7. STUDENT REGISTRATION RESTRICTION                                    */
    /* ---------------------------------------------------------------------- */
    console.log('\n--- 7. Student Registration Restriction ---');

    const testRegUsername = `test.student.${Date.now()}`;
    const regRes = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        username: testRegUsername,
        password: 'Student@123',
        fullName: 'Test Candidate',
        department: 'Information Technology (IT)',
        year: 'Final Year (4th Year)',
        skills: ['Python', 'SQL'],
        preferredRoles: ['Data Analyst'],
      },
    });
    assert(
      (regRes.status === 200 || regRes.status === 201) && regRes.data.success,
      'Public visitor registered as Student'
    );
    assert(regRes.data.user.role === 'Student', 'Newly registered account strictly assigned role "Student"');

    // Registration cannot assign coordinator role
    const forgedReg = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        username: `forged.${Date.now()}`,
        password: 'Password@123',
        fullName: 'Malicious Attempter',
        department: 'Computer Science (CS)',
        role: 'Placement Coordinator',
      },
    });
    if (forgedReg.status === 200 || forgedReg.status === 201) {
      assert(
        forgedReg.data.user.role === 'Student',
        'Server ignores forged role payload and enforces "Student" role'
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 8. WORKSHOP, RESEARCH PRIVACY & VALIDATION REGRESSION TESTS            */
    /* ---------------------------------------------------------------------- */
    console.log('\n--- 8. Workshop, Research Privacy & Validation Regressions ---');

    // 8.1 Workshop invalid schedule rejection on create
    const badWorkshopCreate = await apiRequest('/coordinator/training', {
      method: 'POST',
      cookie: coordCookie,
      body: {
        title: 'Broken Workshop',
        department: 'Computer Science (CS)',
        schedule: 'invalid-schedule-string',
        capacity: 30,
      },
    });
    assert(
      badWorkshopCreate.status === 400 && badWorkshopCreate.data?.error?.includes('schedule'),
      'Workshop creation with invalid schedule pattern rejected with 400 Bad Request'
    );

    // 8.2 Workshop invalid schedule rejection on update
    const badWorkshopUpdate = await apiRequest('/coordinator/training/TRN-101', {
      method: 'PUT',
      cookie: coordCookie,
      body: {
        schedule: 'bad',
      },
    });
    assert(
      badWorkshopUpdate.status === 400 && badWorkshopUpdate.data?.error?.includes('schedule'),
      'Workshop update with invalid schedule pattern rejected with 400 Bad Request'
    );

    // 8.3 Opportunity invalid deadline rejection on create
    const badOppCreate = await apiRequest('/coordinator/opportunities', {
      method: 'POST',
      cookie: coordCookie,
      body: {
        title: 'Broken Opp',
        employer: 'Test Employer',
        type: 'Job',
        deadline: 'not-a-valid-date',
      },
    });
    assert(
      badOppCreate.status === 400 && badOppCreate.data?.error?.includes('deadline'),
      'Opportunity creation with invalid deadline date rejected with 400 Bad Request'
    );

    // 8.4 Survey Responses Role-Scoping (Privacy Protection)
    const publicResponses = await apiRequest('/responses');
    assert(
      publicResponses.status === 401,
      'Public / anonymous visitor to GET /api/responses rejected with 401 Unauthorized'
    );

    const studentResponses = await apiRequest('/responses', { cookie: csCookie });
    assert(
      studentResponses.status === 403,
      'Student viewer to GET /api/responses rejected with 403 Forbidden to protect participant microdata'
    );

    const coordResponses = await apiRequest('/responses', { cookie: coordCookie });
    const coordList: any[] = coordResponses.data || [];
    const hasUnredacted = coordList.some(
      (r) => r.review && !r.review.includes('[Qualitative feedback confidential')
    );
    assert(
      coordResponses.status === 200 && Array.isArray(coordResponses.data) && hasUnredacted,
      'Coordinator retrieves full, authentic qualitative student review text'
    );

    // 8.5 Aggregated Research Summary Endpoint with Dynamic Query Filters
    const summaryRes = await apiRequest('/responses/summary');
    assert(
      summaryRes.status === 200 &&
      summaryRes.data.totalResponses > 0 &&
      typeof summaryRes.data.partlyOrUnmetPercentage === 'number' &&
      typeof summaryRes.data.lateOrRareInfoPercentage === 'number' &&
      Boolean(summaryRes.data.departmentDistribution),
      'GET /api/responses/summary returns computed research aggregates without row PII'
    );

    const csFilteredSummary = await apiRequest('/responses/summary?department=Computer%20Science%20(CS)');
    assert(
      csFilteredSummary.status === 200 &&
      csFilteredSummary.data.totalResponses > 0 &&
      csFilteredSummary.data.departmentDistribution.find((d: any) => d.name === 'Computer Science (CS)')?.count === csFilteredSummary.data.totalResponses,
      'GET /api/responses/summary?department=Computer Science (CS) accurately filters aggregate metrics'
    );

    const simFilteredSummary = await apiRequest('/responses/summary?sourceType=simulated');
    assert(
      simFilteredSummary.status === 200 &&
      simFilteredSummary.data.totalResponses === simFilteredSummary.data.simulatedCount,
      'GET /api/responses/summary?sourceType=simulated accurately filters by provenance'
    );

    console.log('\n======================================================');
    console.log(`WORKFLOW SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (serverProcess) {
      console.log('Shutting down isolated test server process...');
      killProcess(serverProcess);
    }
    cleanTestDb();
    console.log('Cleaned up isolated test database files.');
  }
}

runTests();
