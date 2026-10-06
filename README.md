# Skill Bridge — Community Employment and Skill Matching Portal

A presentation-grade, full-stack academic employment platform developed for our college **Community Engagement Project (CEP)**.

Skill Bridge addresses critical campus placement challenges identified across **Computer Science (CS)**, **Information Technology (IT)**, and **Data Science (DS)** cohorts. It bridges empirical community research with a real-time, authenticated operational platform that separates **Student** and **Placement Coordinator** workspaces, featuring explainable skill matching, application tracking, practical workshop management with attendance auditing, anonymous grievance resolution, and individual placement guidance desks.

---

## 1. Quick Setup & Run Commands

### Prerequisites
- Node.js v22+ (native `node:sqlite` DatabaseSync)
- npm

### Installation & Development
```bash
# Navigate to project root
cd "d:/CEP website"

# Install dependencies
npm install

# Start development servers (Concurrent Express API on :3001 + Vite Client on :5173/:5174)
npm run dev

# Run full automated test suite (157 verified checks across 4 test suites)
npm test

# Run individual test suites:
npx tsx scripts/verify-acceptance.ts        # 37 research & calculation checks
npx tsx scripts/test-workflows.ts           # 97 isolated workflow & security checks
npx tsx scripts/test-production-startup.ts  # 14 production startup & security checks
npx tsx scripts/verify-production-serving.ts # 9 production Express serving & SPA checks

# Provision initial Administrator for production (rejects missing password; prevents accidental overwrite)
npx tsx scripts/provision-admin.ts <username> <password> [--reset]

# Trigger manual JSON database backup
npm run backup:db

# Reset or re-seed initial demonstration data in development (explicit transactional reset)
npm run seed:demo

# Production build, typecheck, lint, and run
npm run typecheck
npm run build
npm run lint
npm start                                   # Runs production Express server serving dist/ SPA
```

---

## 2. Demonstration Accounts & Access

For presentation, evaluation, and viva voce defense, the database is pre-seeded with 4 distinct accounts:

| Role | Username | Password | Purpose & Scope |
| :--- | :--- | :--- | :--- |
| **Placement Coordinator** | `coordinator` | `Coordinator@123` | Institutional command desk across CS, IT, and DS; application reviews, opportunity creation, workshop rosters, grievance resolution, guidance scheduling. |
| **Student (CS)** | `student.cs` | `Student@123` | Rahul Sharma (CS Year 3, 82% agg, 0 backlogs). Explores jobs, matches skills, submits single applications, enrolls in workshops, files grievances. |
| **Student (DS)** | `student.ds` | `Student@123` | Ananya Patel (DS Year 4, 88% agg, 0 backlogs). Isolated student workspace; verifies personal data confidentiality from other students. |
| **System Administrator** | `admin` | `Admin@123` | Diagnostic tools, database table inspect, sanitized backup/restore, tokenized safe SQL runner. |

*Note on Demo Shortcuts:* In production, credentials must be manually typed into the login form. Setting `VITE_ENABLE_DEMO_SHORTCUTS=true` in `.env` renders 1-click test credentials for evaluators.

---

## 3. System Architecture & Technology Stack

The project operates as a decoupled client-server architecture:

```
d:/CEP website/
├── server/
│   ├── index.ts             # Express 5 REST API, cookie session auth, rate limiting
│   ├── db.ts                # SQLite schema (native node:sqlite DatabaseSync) & seeders
│   └── auth.ts              # scrypt password hashing (16-byte salt), timing-safe verification
├── src/
│   ├── services/
│   │   └── apiService.ts    # Authoritative API client (credentials: include)
│   ├── context/
│   │   └── AppContext.tsx   # React 19 State, server session hydration, sync
│   ├── utils/
│   │   ├── permissions.ts   # Centralized route permissions & role matrix
│   │   ├── matching.ts      # Rule-based explainable skill matching engine
│   │   ├── calculations.ts  # Research statistics (N=200 survey responses)
│   │   ├── csvUtils.ts      # RFC 4180 CSV export & formula injection shielding
│   │   └── validation.ts    # Batch import row validators & conflict detection
│   ├── pages/
│   │   ├── HomePage.tsx               # Public landing page with portal overview
│   │   ├── OpportunitiesPage.tsx      # Verified listings, skill filter, application modal
│   │   ├── StudentDashboardPage.tsx   # Authenticated Student Workspace
│   │   ├── PlacementDashboardPage.tsx # Authenticated Coordinator Command Desk
│   │   ├── FeedbackGuidancePage.tsx   # Anonymous student feedback & guidance request
│   │   ├── ResearchPage.tsx           # Empirical research data (N=200), charts, CSV export
│   │   ├── ThreeDayStudyPage.tsx      # Community visits documentation (Visits 1-3)
│   │   ├── AboutPage.tsx              # CEP methodology, scope, and provenance
│   │   ├── AdminPage.tsx              # Maintenance desk, schema diagnostics, safe SQL runner
│   │   ├── LoginPage.tsx              # Authenticated sign-in
│   │   ├── RegisterPage.tsx           # Public student account registration
│   │   └── AccessDeniedPage.tsx       # 403 Forbidden boundary page
│   └── components/
│       ├── layout/          # Authenticated Navbar & Footer with role-based filtering
│       └── charts/          # Interactive Recharts & accessible tables
└── scripts/
    ├── verify-acceptance.ts         # 37-point research & calculation acceptance suite
    ├── test-workflows.ts            # 97-point isolated end-to-end integration & security test suite
    ├── test-production-startup.ts   # 14-point production lifecycle & security test suite
    ├── verify-production-serving.ts # 9-point production Express serving & SPA route fallback suite
    ├── provision-admin.ts           # Secure initial Administrator provisioning script
    └── backup-db.ts                 # Sanitized administrative database backup script
```

### Key Technical Specifications
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Express 5 on Node.js (v22).
- **Database**: SQLite using Node's native `node:sqlite` (`DatabaseSync`), storing authoritative data in `server/database/cep_portal.sqlite`. Startup preserves existing content via `app_metadata` tracking.
- **Security & Password Hashing**: Node crypto `scryptSync` with random 16-byte salts and `crypto.timingSafeEqual`.
- **Session Tokens**: 32-byte cryptographically secure hexadecimal tokens stored in `sessions` table and delivered via `httpOnly`, `sameSite: 'lax'` cookies (`sb_session`).
- **CSRF Defense**: Origin/Referer verification on state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) with cookie sessions.
- **Authorization**: Server-side middleware `requireAuth` and `requireRole` deriving identity strictly from authenticated sessions (never trusting client headers or request bodies).
- **SQL Runner Tokenizer**: Tokenized SQL AST inspection blocking access to sensitive tables (`users`, `sessions`) and system tables (`sqlite_master`), preventing quote/bracket bypasses.
- **Sanitized Backups**: Administrative backup export (`GET /api/database/backup`) strictly omits user accounts, password hashes, salts, and session tokens.
- **URL Navigation**: HTML5 History API (`window.history.pushState` and `popstate`) supporting bookmarking, browser refresh, and Back/Forward navigation with zero client-side routing library overhead.

---

## 4. Role Permission Matrix

| Module / URL Route | Public Visitor | Student | Placement Coordinator | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Home (`/`)** | Allowed | Allowed | Allowed | Allowed |
| **Opportunities (`/opportunities`)** | Browse only | Browse, Save, Apply | Manage in Cell link | Manage listings |
| **Research Findings (`/research`)** | Allowed | Allowed | Allowed | Allowed |
| **Three Community Visits (`/study`)** | Allowed | Allowed | Allowed | Allowed |
| **Feedback & Guidance (`/feedback`)** | View form | Submit & Track own | Review Desk link | Allowed |
| **Student Workspace (`/student-workspace`)** | Denied (403/Login) | **Full Access** | Denied (403) | Denied (403) |
| **Placement Cell (`/placement-cell`)** | Denied (403/Login) | Denied (403) | **Full Access** | Denied (403) |
| **Admin Panel (`/admin`)** | Denied (403/Login) | Denied (403) | Denied (403) | **Full Access** |
| **Student Registration (`/register`)** | Allowed (Student only) | Redirect to Work | Redirect to Work | Redirect to Work |

---

## 5. Clearly Separated Workspaces: Student vs. Coordinator

### The Student Workspace (`/student-workspace`)
Dedicated to the individual candidate experience:
1. **Academic & Skill Profile Editor**: Live editing of branch (CS, IT, DS), year of study, active backlogs, aggregate percentage, technical skills, and preferred roles. Persisted in the `student_profiles` database table.
2. **Transparent, Rule-Based Matching**: Matches candidate's real profile against verified opportunities. Every match displays an explainable numeric percentage and human-readable reasons (e.g., *"Eligibility criteria met (70%+ required)"*, *"Matched 3 of 4 required skills"*), never making false claims of "AI prediction".
3. **Application Tracking Desk**: View personal application history with current statuses (`Submitted`, `Under Review`, `Shortlisted`, `Selected`, `Rejected`) and transparent coordinator feedback.
4. **Saved Opportunities**: Bookmark opportunities for rapid review and deadline tracking.
5. **Practical Workshop Enrollment**: Atomically enroll in or cancel hands-on training clinics. Enforces capacity limits and displays verified attendance marked by coordinators.
6. **Anonymous Grievance & Guidance Tracking**: Submit feedback anonymously (identity stripped before coordinator view) and track institutional resolutions; request 1-on-1 career guidance sessions.

### The Placement Coordinator Desk (`/placement-cell`)
A centralized command center designed for department coordinators:
1. **Live Operational KPI Cards**: Real-time metrics computed directly from SQLite tables:
   - *Registered Students*
   - *Applications Awaiting Review*
   - *Open Grievances Pending Action*
   - *Pending Guidance Appointments*
   - *Active Workshop Enrollments*
   *(Kept strictly separate from the 200 empirical research survey records)*.
2. **Student Application Review Queue**: Review incoming candidatures filtered by department or opportunity; inspect student academic credentials, backlogs, and skills; update application status (`Under Review`, `Shortlisted`, `Selected`, `Rejected`) and attach student-visible feedback.
3. **Opportunity Management**: Create new placement and internship vacancy circulars, edit criteria, or archive expired listings across CS, IT, and DS.
4. **Workshop Roster & Attendance Audit**: Inspect enrolled students per clinic and officially mark verified attendance (`Attended` or `Absent`).
5. **Anonymous Grievance Resolution Desk**: Review student-submitted feedback with guaranteed sender anonymity; assign institutional resolution statuses (`Under Review`, `Action Planned`, `Resolved`) and publish official coordinator responses.
6. **1-on-1 Guidance Appointment Desk**: Schedule counseling slots, assign time slots and venues, and attach advisory notes.
7. **Employer Outreach Log & Community Visits Action Plan**: Operational tracking of corporate partner engagements and the 6-dimension CEP action roadmap.

---

## 6. Database Defense Guide (Viva Voce & Judge Q&A)

When asked about the database architecture by evaluators or judges:

### Q1: What database is used, and why?
> **Answer**: We use **SQLite** integrated via Node.js v22's native `node:sqlite` (`DatabaseSync`). It provides a lightweight, zero-configuration relational database stored in a single binary file (`server/database/cep_portal.sqlite`). It guarantees ACID transactions, requires no external background daemon, and executes with sub-millisecond latencies for embedded academic and departmental deployments.

### Q2: How is security, authentication, and session management handled?
> **Answer**: 
> 1. Passwords are never stored in plaintext. They are salted with a 16-byte cryptographically secure random salt and hashed using Node's native `scryptSync` algorithm. Password verification uses `crypto.timingSafeEqual` to prevent timing attacks.
> 2. Authenticated sessions generate 32-byte hexadecimal random tokens stored in the `sessions` table with an expiration timestamp.
> 3. Tokens are transmitted via an `httpOnly`, `SameSite=Lax` cookie (`sb_session`), preventing cross-site scripting (XSS) token theft.
> 4. All API mutations rely strictly on server-validated session credentials (`req.user`), rejecting client-supplied IDs or forged roles.
> 5. Reverse proxy (`trust proxy`) and production cookie security (`COOKIE_SECURE=true`) flags are configurable via environment variables.

### Q3: How is student and participant research privacy guaranteed?
> **Answer**: 
> 1. In feedback and grievances, the coordinator API endpoint (`/api/coordinator/feedback`) executes a projection query that omits `student_id`, student name, and email. The coordinator only sees the department, category, and issue description.
> 2. In empirical research survey data, individual participant microdata records (`GET /api/responses`) are strictly restricted to Coordinator and Administrator roles. Public visitors and students query the aggregated statistics endpoint (`GET /api/responses/summary`), preventing deanonymization or microdata leakage while delivering 100% chart and metric parity.

### Q4: How are race conditions prevented during workshop enrollments and job applications?
> **Answer**:
> 1. The `applications` table enforces a `UNIQUE(student_id, opportunity_id)` constraint, preventing duplicate submissions.
> 2. Workshop enrollment utilizes SQLite transactions: checking `capacity > enrolled_count` before inserting into `workshop_enrollments` (which enforces `UNIQUE(student_id, workshop_id)`) and atomically incrementing `enrolled_count`.

### Q5: How is the database protected against unauthorized administrative SQL execution?
> **Answer**: The administrative diagnostics query endpoint (`/api/database/diagnostics-query`) accepts only registered query identifiers (`registeredQueryId`), rejecting arbitrary or client-supplied raw SQL strings. Legacy direct SQL endpoints strictly block sensitive tables (`users`, `sessions`) using tokenized AST inspection.

### Q6: How is data integrity guaranteed during backup restoration?
> **Answer**: Restores are validated pre-flight via `server/validation.ts`. The complete JSON payload must satisfy strict schema shapes, field types, and referential constraints (e.g. applications must reference existing opportunities, workshop enrollments must reference existing training sessions). Restores are executed inside a single SQLite transaction with automatic rollback upon any validation failure, preserving linked operational records without destructive cascading deletes.

---

## 7. Verification Test Results

Four automated test suites guarantee platform reliability, data integrity, and production readiness (**157 verified automated checks**):

### 1. Research & Functional Acceptance Suite (`verify-acceptance.ts`)
```
RESULTS: 37 of 37 checks PASSED!
- Dataset contains exactly 200 responses (80 CS, 60 IT, 60 DS)
- Seeded PRNG generates 100% reproducible dataset
- Partly/Unmet needs percentage calculated correctly (72.5%)
- CSV formula injection protection safely escaped (=, +, -, @)
- Verified opportunities, 3-day study data, and Dimension A-F problem matrix
```

### 2. End-to-End Workflow & Security Integration Suite (`test-workflows.ts`)
```
WORKFLOW SUITE SUMMARY: 97 PASSED, 0 FAILED!
- Section 1: Authentication, invalid credentials rejection, cookie issuance, 401/403 route protection, and cross-site mutation CSRF defense.
- Section 2: Student profile update, saved listings, application creation, duplicate rejection, idempotent workshop enrollment/cancellation, and cross-student data isolation.
- Section 3: Coordinator metrics calculation, application review with feedback dispatch, anonymous grievance response, guidance scheduling, attendance audit, workshop capacity enforcement, opportunity/outreach CRUD, and employer outreach role restriction (403 for students and unauthenticated users).
- Section 4: Research responses CRUD with validation, department rules, qualitative ratings support ("Have not attended", "Not enough experience to judge"), and normalized provenance. Participant microdata protection: anonymous (401) and student (403) blocked from raw responses; public summary endpoint provides aggregated stats with query filtering.
- Section 5: System documents key-level authorization (Coordinator permitted for study data; Admin required for site content and survey questions) and payload schema shape validation (rejection of empty {} payloads).
- Section 6: Administrative security enforcement, sanitized JSON backup export (strictly omitting user accounts, password hashes, salts, and session tokens), pre-flight validated non-destructive restore preventing cascade deletion of applications/enrollments with legacy alias mapping, referential integrity enforcement, curated diagnostic queries registry, and blocked raw SQLite downloads (403 Forbidden).
- Section 7: Student registration restriction (prevents forged role escalation).
- Section 8: Workshop, research privacy, and validation regressions (schedule format validation, deadline validation, survey aggregates).
```

### 3. Production Lifecycle & Security Suite (`test-production-startup.ts`)
```
LIFECYCLE & SECURITY SUMMARY: 14 PASSED, 0 FAILED!
- Section 1: Date and schedule boundary tests (impossible times like "Monday 99:99 pm" strictly rejected; plural weekdays, abbreviations, 12h/24h formats, and valid dates accepted).
- Section 2: System document completeness tests (studyData missing interviewGuide/days rejected; communityVisits containing only titles rejected; full documents accepted).
- Section 3: Production database lifecycle tests (fresh production startup with empty database succeeds without FK errors and omits demo users/sample apps; restarts preserve existing records without duplicates).
- Section 4: Development/demo seeding tests (seeds 4 accounts and operational records with valid relational integrity).
- Section 5: Secure admin provisioning tests (requires password; creates Admin account without leaking secrets; rejects silent overwrites unless --reset specified).
- Section 6: Configuration precedence tests (external DB_PATH takes precedence and selects intended database before initialization).
```

### 4. Production Serving & SPA Route Fallback Suite (`verify-production-serving.ts`)
```
ALL PRODUCTION SERVING CHECKS PASSED: 9 PASSED, 0 FAILED!
- Production Express server starts and responds on /api/health.
- Serves compiled production index.html on root /.
- Correctly falls back to SPA index.html on direct client-side routes (/opportunities, /student-workspace).
- Serves static JavaScript and CSS assets with proper MIME types.
- Verifies demo student accounts are omitted in fresh production (401 Unauthorized).
- Verifies provisioned admin can log in, receive session cookie, perform authorized mutations, and log out cleanly.
```

---

## 8. Deployment & Operational Readiness Matrix

| Lifecycle Stage | Status | Verification Evidence & Deployment Instructions |
| :--- | :---: | :--- |
| **Ready for Demonstration** | **VERIFIED** | Run `npm run dev`. Pre-seeded accounts (`coordinator`, `student.cs`, `student.ds`, `admin`) are active. All student, coordinator, and admin workflows verified end-to-end. Real database `server/database/cep_portal.sqlite` is intact and preserved. |
| **Ready for Deployment** | **VERIFIED** | Run `npm run build && npm start`. In production (`NODE_ENV=production`), fresh startup succeeds without foreign key errors, omitting demo users and operational samples. Reconnection to an existing database safely preserves all data without reseeding. All 157 automated checks pass. |
| **Deployed in Target Infrastructure** | **READY TO PROVISION** | Checklist for server administrators hosting on VM / container:<br>1. Set environment variables in `.env`: `PORT`, `NODE_ENV=production`, `DB_PATH=/var/data/cep_portal.sqlite`, `COOKIE_SECURE=true`, `TRUST_PROXY=true`.<br>2. Ensure the SQLite database directory exists on persistent, non-ephemeral storage.<br>3. Run `npm run admin:provision <username> <secure_password>` to create the production administrative account.<br>4. Configure HTTPS reverse proxy (Nginx / Caddy / Cloudflare) forwarding to the configured `PORT`. |


