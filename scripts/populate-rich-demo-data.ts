import { DatabaseSync } from 'node:sqlite';
import { hashPassword } from '../server/auth.js';

export function populateRichDemoData(db: DatabaseSync) {
  console.log('[Populate] Starting rich operational data population...');

  // Default password hash for all student accounts
  const defaultPass = hashPassword('Student@123');

  // 1. Prepare statements
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, username, password_hash, salt, role, full_name, department, email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  // Ensure Coordinator and Admin accounts exist
  const coordPass = hashPassword('Coordinator@123');
  insertUser.run(
    'USR-COORD-01',
    'coordinator',
    coordPass.hash,
    coordPass.salt,
    'Placement Coordinator',
    'Dr. Arishta Saxena',
    'All Departments',
    'coordinator@skillbridge.edu',
    '-30 days'
  );

  const adminPass = hashPassword('Admin@123');
  insertUser.run(
    'USR-ADMIN-01',
    'admin',
    adminPass.hash,
    adminPass.salt,
    'Admin',
    'System Administrator',
    'All Departments',
    'admin@skillbridge.edu',
    '-30 days'
  );

  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO student_profiles (
      student_id, display_name, department, year, preferred_roles, skills, preferred_locations, training_interests, academic_percentage, active_backlogs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertApp = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, opportunity_id, student_id, applied_date, status, student_notes, coordinator_feedback, reviewed_by, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFeedback = db.prepare(`
    INSERT OR REPLACE INTO feedback_submissions (
      id, department, category, description, suggested_improvement,
      submitted_at, status, coordinator_response, resolution_date, is_demo_notice, student_id, is_anonymous
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1)
  `);

  const insertGuidance = db.prepare(`
    INSERT OR REPLACE INTO guidance_requests (
      id, student_name, department, preferred_role, topic,
      preferred_time_slot, additional_notes, submitted_at, status,
      scheduled_time, coordinator_note, is_demo_notice, student_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const insertEnrollment = db.prepare(`
    INSERT OR REPLACE INTO workshop_enrollments (
      id, workshop_id, student_id, enrolled_at, attendance_status, attendance_marked_by, attendance_marked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // 2. Cohort of 45 Students (CS, IT, DS)
  const students = [
    // Existing key demo accounts (preserved)
    { id: 'USR-STUD-01', user: 'student.cs', name: 'Rahul Sharma', dept: 'Computer Science (CS)', year: 'Year 4', pct: 82.5, backlogs: 0,
      roles: ['Full-Stack Developer', 'Software Engineer'], skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'REST APIs', 'Tailwind CSS'] },
    { id: 'USR-STUD-02', user: 'student.ds', name: 'Ananya Patel', dept: 'Data Science (DS)', year: 'Year 4', pct: 88.0, backlogs: 0,
      roles: ['Data Scientist', 'Machine Learning Engineer', 'Data Analyst'], skills: ['Python', 'PyTorch', 'Pandas', 'NumPy', 'SQL', 'Data Modeling', 'Scikit-Learn'] },

    // Additional Computer Science (CS) Cohort
    { id: 'USR-STUD-03', user: 'aditya.kulkarni', name: 'Aditya Kulkarni', dept: 'Computer Science (CS)', year: 'Year 4', pct: 79.2, backlogs: 0,
      roles: ['Software Engineer', 'Backend Developer'], skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'REST APIs', 'Git'] },
    { id: 'USR-STUD-04', user: 'sneha.iyer', name: 'Sneha Iyer', dept: 'Computer Science (CS)', year: 'Year 3', pct: 85.0, backlogs: 0,
      roles: ['Frontend Developer', 'UI/UX Engineer'], skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Figma'] },
    { id: 'USR-STUD-05', user: 'rohan.nair', name: 'Rohan Nair', dept: 'Computer Science (CS)', year: 'Year 4', pct: 73.4, backlogs: 0,
      roles: ['Full-Stack Developer', 'DevOps Engineer'], skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS', 'Git'] },
    { id: 'USR-STUD-06', user: 'tanvi.joshi', name: 'Tanvi Joshi', dept: 'Computer Science (CS)', year: 'Year 4', pct: 81.6, backlogs: 0,
      roles: ['Systems Software Engineer', 'Algorithms Specialist'], skills: ['C++', 'Data Structures', 'Algorithms', 'Linux', 'SQL'] },
    { id: 'USR-STUD-07', user: 'kunal.deshmukh', name: 'Kunal Deshmukh', dept: 'Computer Science (CS)', year: 'Year 3', pct: 76.8, backlogs: 0,
      roles: ['Web Developer', 'Backend Engineer'], skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Git'] },
    { id: 'USR-STUD-08', user: 'pooja.mehta', name: 'Pooja Mehta', dept: 'Computer Science (CS)', year: 'Year 4', pct: 83.1, backlogs: 0,
      roles: ['Cloud Applications Developer', 'Full-Stack Developer'], skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker'] },
    { id: 'USR-STUD-09', user: 'saurabh.shinde', name: 'Saurabh Shinde', dept: 'Computer Science (CS)', year: 'Year 3', pct: 69.5, backlogs: 1,
      roles: ['Junior Software Engineer', 'QA Automation Engineer'], skills: ['Java', 'Selenium', 'SQL', 'Git', 'JUnit'] },
    { id: 'USR-STUD-10', user: 'neha.chawla', name: 'Neha Chawla', dept: 'Computer Science (CS)', year: 'Year 4', pct: 87.4, backlogs: 0,
      roles: ['Full-Stack Engineer', 'Mobile App Developer'], skills: ['React Native', 'React', 'Node.js', 'TypeScript', 'Firebase'] },
    { id: 'USR-STUD-11', user: 'amit.verma', name: 'Amit Verma', dept: 'Computer Science (CS)', year: 'Year 4', pct: 74.0, backlogs: 0,
      roles: ['Backend Engineer', 'Microservices Developer'], skills: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'gRPC'] },
    { id: 'USR-STUD-12', user: 'ritu.gupta', name: 'Ritu Gupta', dept: 'Computer Science (CS)', year: 'Year 3', pct: 80.5, backlogs: 0,
      roles: ['Web Developer', 'Frontend Engineer'], skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Redux'] },
    { id: 'USR-STUD-13', user: 'vikram.more', name: 'Vikram More', dept: 'Computer Science (CS)', year: 'Year 4', pct: 72.0, backlogs: 0,
      roles: ['Software Engineer', 'API Developer'], skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Postman'] },
    { id: 'USR-STUD-14', user: 'anjali.singh', name: 'Anjali Singh', dept: 'Computer Science (CS)', year: 'Year 3', pct: 84.2, backlogs: 0,
      roles: ['Full-Stack Developer'], skills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker'] },
    { id: 'USR-STUD-15', user: 'pranav.bhat', name: 'Pranav Bhat', dept: 'Computer Science (CS)', year: 'Year 4', pct: 77.8, backlogs: 0,
      roles: ['Systems Programmer', 'C++ Developer'], skills: ['C++', 'Multithreading', 'Linux', 'Network Programming'] },

    // Information Technology (IT) Cohort
    { id: 'USR-STUD-16', user: 'nikhil.jadhav', name: 'Nikhil Jadhav', dept: 'Information Technology (IT)', year: 'Year 4', pct: 78.0, backlogs: 0,
      roles: ['Cloud Infrastructure Engineer', 'DevOps Specialist'], skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Linux', 'Bash', 'Git'] },
    { id: 'USR-STUD-17', user: 'shreya.rao', name: 'Shreya Rao', dept: 'Information Technology (IT)', year: 'Year 3', pct: 83.5, backlogs: 0,
      roles: ['Enterprise IT Solutions Architect', 'Cloud Analyst'], skills: ['Azure', 'PowerShell', 'Python', 'Networking', 'SQL'] },
    { id: 'USR-STUD-18', user: 'harsh.shah', name: 'Harsh Shah', dept: 'Information Technology (IT)', year: 'Year 4', pct: 75.2, backlogs: 0,
      roles: ['Cybersecurity Analyst', 'Network Security Engineer'], skills: ['Wireshark', 'Linux', 'Penetration Testing', 'Python', 'Network Security'] },
    { id: 'USR-STUD-19', user: 'divya.menon', name: 'Divya Menon', dept: 'Information Technology (IT)', year: 'Year 4', pct: 86.0, backlogs: 0,
      roles: ['Mobile Application Developer (Flutter)', 'Frontend Engineer'], skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'Git'] },
    { id: 'USR-STUD-20', user: 'akash.patil', name: 'Akash Patil', dept: 'Information Technology (IT)', year: 'Year 3', pct: 71.5, backlogs: 1,
      roles: ['Systems Administrator', 'IT Support Specialist'], skills: ['Linux Administration', 'Shell Scripting', 'Virtualization', 'Active Directory'] },
    { id: 'USR-STUD-21', user: 'meera.kamath', name: 'Meera Kamath', dept: 'Information Technology (IT)', year: 'Year 4', pct: 82.7, backlogs: 0,
      roles: ['DevOps Engineer', 'Site Reliability Engineer'], skills: ['Docker', 'Jenkins', 'Kubernetes', 'Prometheus', 'Python', 'GitLab CI'] },
    { id: 'USR-STUD-22', user: 'tejas.gawde', name: 'Tejas Gawde', dept: 'Information Technology (IT)', year: 'Year 3', pct: 77.0, backlogs: 0,
      roles: ['Database Administrator', 'Data Pipeline Associate'], skills: ['MySQL', 'PostgreSQL', 'Oracle DB', 'PL/SQL', 'Database Tuning'] },
    { id: 'USR-STUD-23', user: 'aishwarya.shetty', name: 'Aishwarya Shetty', dept: 'Information Technology (IT)', year: 'Year 4', pct: 84.8, backlogs: 0,
      roles: ['Full-Stack Web Developer', 'IT Consultant'], skills: ['Angular', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Git'] },
    { id: 'USR-STUD-24', user: 'varun.reddy', name: 'Varun Reddy', dept: 'Information Technology (IT)', year: 'Year 4', pct: 79.5, backlogs: 0,
      roles: ['Cloud Engineer', 'Backend Developer'], skills: ['AWS', 'Java', 'Spring Boot', 'Microservices', 'Docker'] },
    { id: 'USR-STUD-25', user: 'swati.desai', name: 'Swati Desai', dept: 'Information Technology (IT)', year: 'Year 3', pct: 80.0, backlogs: 0,
      roles: ['Frontend Developer', 'UI Engineer'], skills: ['React', 'JavaScript', 'CSS3', 'Tailwind', 'REST APIs'] },
    { id: 'USR-STUD-26', user: 'sameer.kazi', name: 'Sameer Kazi', dept: 'Information Technology (IT)', year: 'Year 4', pct: 73.8, backlogs: 0,
      roles: ['IT Infrastructure Specialist', 'Cloud Support'], skills: ['Linux', 'AWS', 'Python', 'Networking', 'Troubleshooting'] },
    { id: 'USR-STUD-27', user: 'kavita.pawar', name: 'Kavita Pawar', dept: 'Information Technology (IT)', year: 'Year 4', pct: 85.3, backlogs: 0,
      roles: ['Information Security Specialist'], skills: ['OWASP', 'Vulnerability Assessment', 'Burp Suite', 'Python', 'Network Protocols'] },
    { id: 'USR-STUD-28', user: 'omkar.salvi', name: 'Omkar Salvi', dept: 'Information Technology (IT)', year: 'Year 3', pct: 76.4, backlogs: 0,
      roles: ['Mobile Developer', 'Full-Stack Developer'], skills: ['Flutter', 'Node.js', 'MongoDB', 'Git', 'REST APIs'] },
    { id: 'USR-STUD-29', user: 'pallavi.chaudhary', name: 'Pallavi Chaudhary', dept: 'Information Technology (IT)', year: 'Year 4', pct: 81.2, backlogs: 0,
      roles: ['Quality Assurance Engineer', 'Test Automation'], skills: ['Selenium', 'Cypress', 'JavaScript', 'Postman', 'Jira'] },
    { id: 'USR-STUD-30', user: 'darshan.solanki', name: 'Darshan Solanki', dept: 'Information Technology (IT)', year: 'Year 3', pct: 74.6, backlogs: 0,
      roles: ['Cloud Solutions Associate'], skills: ['Azure', 'Linux', 'Terraform', 'Git', 'Docker'] },

    // Data Science (DS) Cohort
    { id: 'USR-STUD-31', user: 'arjun.saxena', name: 'Arjun Saxena', dept: 'Data Science (DS)', year: 'Year 4', pct: 86.4, backlogs: 0,
      roles: ['Data Scientist', 'Machine Learning Engineer'], skills: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'Scikit-Learn', 'SQL'] },
    { id: 'USR-STUD-32', user: 'riya.kapoor', name: 'Riya Kapoor', dept: 'Data Science (DS)', year: 'Year 3', pct: 89.2, backlogs: 0,
      roles: ['Business Intelligence Analyst', 'Data Analyst'], skills: ['Power BI', 'SQL', 'Tableau', 'Excel', 'Python', 'Statistics'] },
    { id: 'USR-STUD-33', user: 'manish.trivedi', name: 'Manish Trivedi', dept: 'Data Science (DS)', year: 'Year 4', pct: 80.1, backlogs: 0,
      roles: ['Big Data Engineer', 'ETL Pipeline Developer'], skills: ['Apache Spark', 'Python', 'Hadoop', 'SQL', 'Kafka', 'Docker'] },
    { id: 'USR-STUD-34', user: 'geeta.sharma', name: 'Geeta Sharma', dept: 'Data Science (DS)', year: 'Year 4', pct: 83.7, backlogs: 0,
      roles: ['NLP Specialist', 'AI Research Intern'], skills: ['HuggingFace', 'PyTorch', 'Transformers', 'Python', 'Spacy', 'NLTK'] },
    { id: 'USR-STUD-35', user: 'siddharth.bose', name: 'Siddharth Bose', dept: 'Data Science (DS)', year: 'Year 3', pct: 78.5, backlogs: 0,
      roles: ['Data Analyst', 'Statistical Modeler'], skills: ['R', 'Python', 'Pandas', 'SQL', 'Data Visualization', 'Hypothesis Testing'] },
    { id: 'USR-STUD-36', user: 'priyanka.tiwari', name: 'Priyanka Tiwari', dept: 'Data Science (DS)', year: 'Year 4', pct: 87.0, backlogs: 0,
      roles: ['Computer Vision Engineer', 'Deep Learning Specialist'], skills: ['OpenCV', 'PyTorch', 'CNNs', 'YOLO', 'Python', 'Image Processing'] },
    { id: 'USR-STUD-37', user: 'chetan.sawant', name: 'Chetan Sawant', dept: 'Data Science (DS)', year: 'Year 3', pct: 75.0, backlogs: 0,
      roles: ['Data Analytics Intern', 'SQL Developer'], skills: ['SQL', 'PostgreSQL', 'Python', 'Power BI', 'Matplotlib'] },
    { id: 'USR-STUD-38', user: 'isha.khanna', name: 'Isha Khanna', dept: 'Data Science (DS)', year: 'Year 4', pct: 84.3, backlogs: 0,
      roles: ['Data Scientist', 'Predictive Modeler'], skills: ['Python', 'XGBoost', 'LightGBM', 'Pandas', 'SQL', 'Feature Engineering'] },
    { id: 'USR-STUD-39', user: 'mayur.kadam', name: 'Mayur Kadam', dept: 'Data Science (DS)', year: 'Year 4', pct: 76.8, backlogs: 0,
      roles: ['Data Pipeline Engineer', 'Analytics Associate'], skills: ['Python', 'SQL', 'Airflow', 'Snowflake', 'dbt'] },
    { id: 'USR-STUD-40', user: 'tanmay.gokhale', name: 'Tanmay Gokhale', dept: 'Data Science (DS)', year: 'Year 3', pct: 82.0, backlogs: 0,
      roles: ['Quantitative Analyst', 'Data Analyst'], skills: ['Python', 'Statsmodels', 'Time Series Analysis', 'SQL', 'Excel'] },
    { id: 'USR-STUD-41', user: 'simran.kaur', name: 'Simran Kaur', dept: 'Data Science (DS)', year: 'Year 4', pct: 88.5, backlogs: 0,
      roles: ['Machine Learning Engineer', 'MLOps Specialist'], skills: ['MLflow', 'Docker', 'Kubeflow', 'PyTorch', 'Python', 'CI/CD'] },
    { id: 'USR-STUD-42', user: 'yogesh.chavan', name: 'Yogesh Chavan', dept: 'Data Science (DS)', year: 'Year 3', pct: 73.2, backlogs: 1,
      roles: ['Junior Data Analyst'], skills: ['Python', 'Pandas', 'SQL', 'Tableau', 'Data Cleaning'] },
    { id: 'USR-STUD-43', user: 'aditi.mishra', name: 'Aditi Mishra', dept: 'Data Science (DS)', year: 'Year 4', pct: 85.9, backlogs: 0,
      roles: ['Data Scientist', 'AI Ethics Researcher'], skills: ['Python', 'Scikit-Learn', 'PyTorch', 'Data Governance', 'SQL'] },
    { id: 'USR-STUD-44', user: 'rohit.singh', name: 'Rohit Singh', dept: 'Computer Science (CS)', year: 'Year 3', pct: 79.0, backlogs: 0,
      roles: ['Full-Stack Developer'], skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Git'] },
    { id: 'USR-STUD-45', user: 'rashmi.hegde', name: 'Rashmi Hegde', dept: 'Information Technology (IT)', year: 'Year 4', pct: 83.0, backlogs: 0,
      roles: ['Cloud Solutions Associate'], skills: ['AWS', 'Linux', 'Python', 'Docker', 'REST APIs'] },
  ];

  for (const s of students) {
    insertUser.run(
      s.id,
      s.user,
      defaultPass.hash,
      defaultPass.salt,
      'Student',
      s.name,
      s.dept,
      `${s.user}@khalsa.edu`,
      '-10 days'
    );
    insertProfile.run(
      s.id,
      s.name,
      s.dept,
      s.year,
      JSON.stringify(s.roles),
      JSON.stringify(s.skills),
      JSON.stringify(['Mumbai', 'Pune', 'Bengaluru']),
      JSON.stringify(['Software Engineering', 'Cloud Solutions', 'Data Analytics']),
      s.pct,
      s.backlogs
    );
  }
  console.log(`[Populate] Seeded ${students.length} student user profiles.`);

  // 3. Applications Queue (24 Applications across CS, IT, DS)
  // Ensures Pending Review (Submitted + Under Review) = 14!
  const apps = [
    // 8 SUBMITTED (Awaiting Coordinator First Pass)
    { id: 'APP-2001', opp: 'OPP-101', stud: 'USR-STUD-04', date: '2026-10-03 09:30:00', status: 'Submitted',
      note: 'Applied with active React and Tailwind frontend project links.', feedback: null, revBy: null },
    { id: 'APP-2002', opp: 'OPP-102', stud: 'USR-STUD-07', date: '2026-10-03 10:15:00', status: 'Submitted',
      note: 'Keen on software internship. Proficient in Python, Django and REST APIs.', feedback: null, revBy: null },
    { id: 'APP-2003', opp: 'OPP-201', stud: 'USR-STUD-16', date: '2026-10-03 11:00:00', status: 'Submitted',
      note: 'AWS Certified Cloud Practitioner with Docker hands-on lab experience.', feedback: null, revBy: null },
    { id: 'APP-2004', opp: 'OPP-202', stud: 'USR-STUD-19', date: '2026-10-03 11:45:00', status: 'Submitted',
      note: 'Published 2 Flutter apps on Google Play Store with clean architecture.', feedback: null, revBy: null },
    { id: 'APP-2005', opp: 'OPP-301', stud: 'USR-STUD-31', date: '2026-10-03 14:20:00', status: 'Submitted',
      note: 'Strong mathematical foundation in deep learning, PyTorch and transformers.', feedback: null, revBy: null },
    { id: 'APP-2006', opp: 'OPP-302', stud: 'USR-STUD-32', date: '2026-10-03 15:00:00', status: 'Submitted',
      note: 'Power BI and SQL portfolio with live business dashboard demonstrations.', feedback: null, revBy: null },
    { id: 'APP-2007', opp: 'OPP-103', stud: 'USR-STUD-11', date: '2026-10-04 08:30:00', status: 'Submitted',
      note: 'Developed microservices backend using Go, PostgreSQL, and Docker.', feedback: null, revBy: null },
    { id: 'APP-2008', opp: 'OPP-401', stud: 'USR-STUD-18', date: '2026-10-04 09:10:00', status: 'Submitted',
      note: 'Completed cybersecurity certifications, Wireshark packet analysis, and OWASP testing.', feedback: null, revBy: null },

    // 6 UNDER REVIEW (Coordinator Actively Evaluating)
    { id: 'APP-2009', opp: 'OPP-101', stud: 'USR-STUD-01', date: '2026-10-02 10:30:00', status: 'Under Review',
      note: 'Full-stack developer with MERN stack open-source contributions.',
      feedback: 'Initial eligibility verified (82.5% agg). Reviewing GitHub project repositories.', revBy: 'USR-COORD-01' },
    { id: 'APP-2010', opp: 'OPP-201', stud: 'USR-STUD-21', date: '2026-10-02 11:20:00', status: 'Under Review',
      note: 'Experience configuring Jenkins CI/CD pipelines and Prometheus monitoring.',
      feedback: 'DevOps credentials match job description. Scheduling initial screening interview.', revBy: 'USR-COORD-01' },
    { id: 'APP-2011', opp: 'OPP-301', stud: 'USR-STUD-34', date: '2026-10-02 14:00:00', status: 'Under Review',
      note: 'Published research paper on NLP Transformers and HuggingFace pipelines.',
      feedback: 'Research portfolio under evaluation by Technical Head.', revBy: 'USR-COORD-01' },
    { id: 'APP-2012', opp: 'OPP-102', stud: 'USR-STUD-12', date: '2026-10-02 15:15:00', status: 'Under Review',
      note: 'Next.js and TypeScript developer with high responsive design skills.',
      feedback: 'Frontend portfolio looks promising. Verifying college attendance criteria.', revBy: 'USR-COORD-01' },
    { id: 'APP-2013', opp: 'OPP-303', stud: 'USR-STUD-33', date: '2026-10-02 16:30:00', status: 'Under Review',
      note: 'Big Data specialist with Spark, Kafka, and distributed data modeling.',
      feedback: 'Cross-checking big data prerequisites against recruiter expectations.', revBy: 'USR-COORD-01' },
    { id: 'APP-2014', opp: 'OPP-203', stud: 'USR-STUD-17', date: '2026-10-03 09:00:00', status: 'Under Review',
      note: 'Enterprise IT associate with Azure and PowerShell automation experience.',
      feedback: 'Candidate meets all departmental criteria. Shortlist preparation in progress.', revBy: 'USR-COORD-01' },

    // 5 SHORTLISTED (Cleared Initial Screening)
    { id: 'APP-2015', opp: 'OPP-301', stud: 'USR-STUD-02', date: '2026-10-01 11:15:00', status: 'Shortlisted',
      note: 'Proficient in Python data pipelines, PyTorch modeling, and statistical analysis.',
      feedback: 'Excellent academic track record (88%). Shortlisted for round 1 technical coding assessment.', revBy: 'USR-COORD-01' },
    { id: 'APP-2016', opp: 'OPP-101', stud: 'USR-STUD-08', date: '2026-10-01 13:45:00', status: 'Shortlisted',
      note: 'Full-stack cloud developer with GraphQL and Docker expertise.',
      feedback: 'Shortlisted for online coding assessment. Test link dispatched to registered email.', revBy: 'USR-COORD-01' },
    { id: 'APP-2017', opp: 'OPP-201', stud: 'USR-STUD-24', date: '2026-10-01 14:30:00', status: 'Shortlisted',
      note: 'Java Spring Boot and AWS cloud backend engineer.',
      feedback: 'Credentials verified. Shortlisted for corporate recruiter interview next Monday.', revBy: 'USR-COORD-01' },
    { id: 'APP-2018', opp: 'OPP-302', stud: 'USR-STUD-38', date: '2026-10-01 16:00:00', status: 'Shortlisted',
      note: 'Predictive modeler with XGBoost and feature engineering capabilities.',
      feedback: 'Shortlisted for technical round. Presentation of case study scheduled.', revBy: 'USR-COORD-01' },
    { id: 'APP-2019', opp: 'OPP-103', stud: 'USR-STUD-03', date: '2026-10-01 17:00:00', status: 'Shortlisted',
      note: 'Backend developer with Spring Boot and MySQL microservices experience.',
      feedback: 'Profile shortlisted. HackerRank test link scheduled for Thursday 2 PM.', revBy: 'USR-COORD-01' },

    // 3 SELECTED (Offer Released)
    { id: 'APP-2020', opp: 'OPP-101', stud: 'USR-STUD-10', date: '2026-09-28 10:00:00', status: 'Selected',
      note: 'React Native and TypeScript mobile full-stack developer.',
      feedback: 'Congratulations! Selected after final technical & HR interview rounds. Formal offer letter issued.', revBy: 'USR-COORD-01' },
    { id: 'APP-2021', opp: 'OPP-301', stud: 'USR-STUD-41', date: '2026-09-28 11:30:00', status: 'Selected',
      note: 'MLOps and deep learning engineer with Kubeflow and Docker skills.',
      feedback: 'Selected for ML Engineer Trainee role. Package: 8.5 LPA. Onboarding instructions sent.', revBy: 'USR-COORD-01' },
    { id: 'APP-2022', opp: 'OPP-201', stud: 'USR-STUD-27', date: '2026-09-29 14:00:00', status: 'Selected',
      note: 'Information security and vulnerability assessment analyst.',
      feedback: 'Selected as Cybersecurity Associate. Outstanding technical assessment score (96%).', revBy: 'USR-COORD-01' },

    // 2 REJECTED (Constructive Feedback Attached)
    { id: 'APP-2023', opp: 'OPP-101', stud: 'USR-STUD-09', date: '2026-09-30 10:15:00', status: 'Rejected',
      note: 'Selenium automation tester applying for core development role.',
      feedback: 'Skill gap identified in dynamic programming and full-stack frameworks. Strongly advised to enroll in DSA Clinic TRN-101.', revBy: 'USR-COORD-01' },
    { id: 'APP-2024', opp: 'OPP-301', stud: 'USR-STUD-42', date: '2026-09-30 12:45:00', status: 'Rejected',
      note: 'Junior data analyst applying for senior machine learning trainee.',
      feedback: 'Role requires advanced PyTorch and neural networks. Recommended to attend ML Masterclass TRN-301 first.', revBy: 'USR-COORD-01' },
  ];

  for (const a of apps) {
    insertApp.run(
      a.id,
      a.opp,
      a.stud,
      a.date,
      a.status,
      a.note,
      a.feedback,
      a.revBy,
      a.date
    );
  }
  console.log(`[Populate] Seeded ${apps.length} applications (14 pending review, 5 shortlisted, 3 selected, 2 rejected).`);

  // 4. Feedback Submissions / Grievances (14 Total)
  // Ensures Open Feedback (status != 'Resolved') = 11!
  const feedbacks = [
    // 4 RECEIVED (Fresh Unread Tickets)
    { id: 'FB-2001', dept: 'Computer Science (CS)', cat: 'Notice Timeliness',
      desc: 'Hackathon and product company coding test links were shared at 11:30 PM with assessment window starting at 8 AM next morning.',
      sugg: 'Implement mandatory 36-hour lead time notification rule so commuting students can prepare properly.',
      date: '2026-10-04 10:30:00', status: 'Received', resp: null, resDate: null, stud: 'USR-STUD-03' },
    { id: 'FB-2002', dept: 'Information Technology (IT)', cat: 'Assessment Windows',
      desc: 'Online aptitude test platform server crashed during question 24 due to sudden traffic overload, locking out 18 IT students.',
      sugg: 'Request recruiter to provision a re-test window or staggered testing slots across divisions.',
      date: '2026-10-04 11:15:00', status: 'Received', resp: null, resDate: null, stud: 'USR-STUD-16' },
    { id: 'FB-2003', dept: 'Data Science (DS)', cat: 'Curriculum Relevance',
      desc: 'Campus recruitment aptitude classes are entirely focused on high school arithmetic rather than data modeling, SQL, or algorithmic logic.',
      sugg: 'Replace generic vendor math aptitude with specialized SQL query and Python data structure training.',
      date: '2026-10-04 14:00:00', status: 'Received', resp: null, resDate: null, stud: 'USR-STUD-31' },
    { id: 'FB-2004', dept: 'Computer Science (CS)', cat: 'Eligibility Cutoffs',
      desc: 'A rigid 75% cutoff was applied to a product development role, instantly disqualifying open-source contributors with active GitHub profiles.',
      sugg: 'Introduce a holistic portfolio exemption rule allowing verified top-tier GitHub projects to bypass minor CGPA deficits.',
      date: '2026-10-04 15:20:00', status: 'Received', resp: null, resDate: null, stud: 'USR-STUD-06' },

    // 4 UNDER REVIEW (Coordinator Actively Addressing)
    { id: 'FB-2005', dept: 'Information Technology (IT)', cat: 'Interview Scheduling',
      desc: 'Technical interview slots clashed directly with Semester V End-Semester Practical Examinations in Computer Center Lab 3.',
      sugg: 'Coordinate placement schedule with academic examination controller to avoid exam-day interviews.',
      date: '2026-10-03 09:40:00', status: 'Under review',
      resp: 'Placement cell is conferring with the Department Head to reschedule interviews for the afternoon session.', resDate: null, stud: 'USR-STUD-21' },
    { id: 'FB-2006', dept: 'Data Science (DS)', cat: 'Domain Opportunity Shortage',
      desc: 'Most visiting companies offer generic web development roles; very few opportunities cater specifically to Data Science and BI analysts.',
      sugg: 'Reach out to analytics consultancies and fintech product companies in BKC / Navi Mumbai tech parks.',
      date: '2026-10-03 12:10:00', status: 'Under review',
      resp: 'Employer Outreach team is currently in active discussions with three analytics firms (Fractal, MuSigma, Tiger Analytics).', resDate: null, stud: 'USR-STUD-33' },
    { id: 'FB-2007', dept: 'Computer Science (CS)', cat: 'Laboratory Software',
      desc: 'Lab computers have outdated Java 8 installed, which broke compatibility with recruiter assessment software requiring modern runtime.',
      sugg: 'Upgrade all CCF laboratory terminal images to OpenJDK 17 LTS and Node.js v20+.',
      date: '2026-10-03 14:30:00', status: 'Under review',
      resp: 'Lab administrator has received ticket. Terminal disk image upgrade scheduled for this Saturday.', resDate: null, stud: 'USR-STUD-13' },
    { id: 'FB-2008', dept: 'Information Technology (IT)', cat: 'Notice Timeliness',
      desc: 'WhatsApp forwarded circular had broken registration link; working link was updated only 15 minutes before cutoff.',
      sugg: 'Centralize all circular links inside the authenticated portal instead of relying on third-party messaging forwards.',
      date: '2026-10-02 16:50:00', status: 'Under review',
      resp: 'Under review. All official application links are now enforced to route through Skill Bridge portal exclusively.', resDate: null, stud: 'USR-STUD-26' },

    // 3 ACTION PLANNED (Resolution Strategy Established)
    { id: 'FB-2009', dept: 'Computer Science (CS)', cat: 'Training Preparation',
      desc: 'Students requested specialized guidance on live machine coding and LeetCode Medium problem solving.',
      sugg: 'Conduct 4-week weekend competitive programming bootcamp led by senior alumni.',
      date: '2026-10-01 10:00:00', status: 'Action planned',
      resp: 'Action planned: Advanced DSA Clinic TRN-101 has been expanded to 45 seats and alumni mentor sessions scheduled for Sundays.', resDate: null, stud: 'USR-STUD-01' },
    { id: 'FB-2010', dept: 'Information Technology (IT)', cat: 'Cloud Lab Access',
      desc: 'Cloud DevOps workshop students have no AWS sandbox accounts to practice deployment pipelines.',
      sugg: 'Provide sponsored AWS Educate or GitHub Student Developer pack cloud credits.',
      date: '2026-10-01 11:30:00', status: 'Action planned',
      resp: 'College has registered institutional account with AWS Academy. Cloud vouchers will be distributed to enrolled students in TRN-201.', resDate: null, stud: 'USR-STUD-17' },
    { id: 'FB-2011', dept: 'Data Science (DS)', cat: 'Interview Feedback Transparency',
      desc: 'Students rejected in company interview rounds receive zero feedback on whether failure was in Python coding or statistics.',
      sugg: 'Request recruiter HRs to provide a 1-line competency scorecard for each rejected candidate.',
      date: '2026-10-01 15:00:00', status: 'Action planned',
      resp: 'Placement cell has instituted a candidate feedback protocol with visiting recruiting partners starting this drive.', resDate: null, stud: 'USR-STUD-36' },

    // 3 RESOLVED (Completed with Official Coordinator Response)
    { id: 'FB-2012', dept: 'Computer Science (CS)', cat: 'Notice Timeliness',
      desc: 'Short test notice caused commuting suburban students to miss 8 AM online assessment windows.',
      sugg: 'Institute an official 48-hour advance notification rule.',
      date: '2026-09-28 09:00:00', status: 'Resolved',
      resp: 'Resolved: Placement cell enacted mandatory 48-hour advance notice protocol across all engineering branches.', resDate: '2026-09-30 17:00:00', stud: 'USR-STUD-05' },
    { id: 'FB-2013', dept: 'Information Technology (IT)', cat: 'Interview Venue Clashes',
      desc: 'Two visiting recruiters conducted simultaneous in-person GDs in the same seminar hall, causing severe acoustic disruption.',
      sugg: 'Allocate separate conference rooms for individual company recruitment processes.',
      date: '2026-09-27 11:00:00', status: 'Resolved',
      resp: 'Resolved: Group discussions relocated to Seminar Hall 1 and Placement Interview Room 204.', resDate: '2026-09-29 16:30:00', stud: 'USR-STUD-23' },
    { id: 'FB-2014', dept: 'Data Science (DS)', cat: 'Assessment Access',
      desc: 'Machine learning screening required Jupyter Notebook environment but college proxy blocked external package installations.',
      sugg: 'Whitelist Anaconda package repository and PyPI mirrors on campus network.',
      date: '2026-09-26 14:00:00', status: 'Resolved',
      resp: 'Resolved: Network administrator has whitelisted PyPI and Conda channels in Data Science Lab 5.', resDate: '2026-09-28 15:00:00', stud: 'USR-STUD-02' },
  ];

  for (const f of feedbacks) {
    insertFeedback.run(
      f.id,
      f.dept,
      f.cat,
      f.desc,
      f.sugg,
      f.date,
      f.status,
      f.resp,
      f.resDate,
      f.stud
    );
  }
  console.log(`[Populate] Seeded ${feedbacks.length} feedback grievances (11 open tickets, 3 resolved).`);

  // 5. Guidance Slots / Requests (10 Total)
  // Ensures Guidance Slots Awaiting Schedule (status IN ('Pending', 'Requested')) = 4!
  const guidances = [
    // 4 PENDING / REQUESTED (Awaiting Coordinator Scheduling)
    { id: 'GD-2001', name: 'Rahul Sharma', dept: 'Computer Science (CS)', role: 'Full-Stack Developer',
      topic: 'System Design & Scalability Expectations for Corporate Assessments', slot: 'Thursday Afternoon (2:00 PM - 3:00 PM)',
      notes: 'Need guidance on microservices decomposition and caching strategies.', date: '2026-10-04 10:00:00', status: 'Pending',
      sched: null, coordNote: null, stud: 'USR-STUD-01' },
    { id: 'GD-2002', name: 'Nikhil Jadhav', dept: 'Information Technology (IT)', role: 'DevOps Engineer',
      topic: 'Docker & Kubernetes Portfolio Review', slot: 'Friday Morning (11:00 AM - 12:00 PM)',
      notes: 'Requesting review of GitHub CI/CD pipeline repository before cloud recruiter interview.', date: '2026-10-04 11:30:00', status: 'Pending',
      sched: null, coordNote: null, stud: 'USR-STUD-16' },
    { id: 'GD-2003', name: 'Riya Kapoor', dept: 'Data Science (DS)', role: 'Business Intelligence Analyst',
      topic: 'Power BI Dashboard Presentation & Case Study Preparation', slot: 'Monday Afternoon (3:00 PM - 4:00 PM)',
      notes: 'Seeking advice on presenting telecom churn business case study in technical round.', date: '2026-10-04 13:45:00', status: 'Pending',
      sched: null, coordNote: null, stud: 'USR-STUD-32' },
    { id: 'GD-2004', name: 'Sneha Iyer', dept: 'Computer Science (CS)', role: 'Frontend Developer',
      topic: 'React Codebase Architecture & State Management Review', slot: 'Tuesday Afternoon (2:30 PM - 3:30 PM)',
      notes: 'Have deployed e-commerce project; want coordinator feedback on resume project bullets.', date: '2026-10-04 15:10:00', status: 'Pending',
      sched: null, coordNote: null, stud: 'USR-STUD-04' },

    // 5 SCHEDULED (With Date, Room, and Coordinator Advisory Note)
    { id: 'GD-2005', name: 'Ananya Patel', dept: 'Data Science (DS)', role: 'Machine Learning Engineer',
      topic: 'PyTorch Model Optimization & Feature Engineering Strategy', slot: 'Friday Afternoon (3:00 PM - 4:00 PM)',
      notes: 'Preparing for technical round with AI product company.', date: '2026-10-02 10:15:00', status: 'Scheduled',
      sched: '2026-10-09 15:00:00', coordNote: 'Confirmed for Room 204, Placement Wing. Please bring laptop with running Jupyter model demo.', stud: 'USR-STUD-02' },
    { id: 'GD-2006', name: 'Harsh Shah', dept: 'Information Technology (IT)', role: 'Cybersecurity Analyst',
      topic: 'Penetration Testing Certifications & Industry Profile Alignment', slot: 'Thursday Morning (10:30 AM - 11:30 AM)',
      notes: 'Want guidance on presenting bug bounty achievements to banking recruiters.', date: '2026-10-02 11:00:00', status: 'Scheduled',
      sched: '2026-10-08 10:30:00', coordNote: 'Confirmed for Placement Conference Room. Mentor: Prof. Kulkarni (Security in-charge).', stud: 'USR-STUD-18' },
    { id: 'GD-2007', name: 'Aditya Kulkarni', dept: 'Computer Science (CS)', role: 'Backend Microservices Engineer',
      topic: 'Spring Boot Architecture & Java Memory Tuning for Interviews', slot: 'Wednesday Afternoon (2:00 PM - 3:00 PM)',
      notes: 'Cleared initial screening; preparing for live code pairing interview.', date: '2026-10-02 14:30:00', status: 'Scheduled',
      sched: '2026-10-07 14:00:00', coordNote: 'Confirmed for Room 204. Review Java 17 record types and Spring Boot 3 migration.', stud: 'USR-STUD-03' },
    { id: 'GD-2008', name: 'Manish Trivedi', dept: 'Data Science (DS)', role: 'Big Data Pipeline Engineer',
      topic: 'Apache Spark Distributed Compute & Cloud Data Warehousing', slot: 'Monday Morning (11:00 AM - 12:00 PM)',
      notes: 'Need guidance on explaining PySpark cluster configurations.', date: '2026-10-01 16:00:00', status: 'Scheduled',
      sched: '2026-10-05 11:00:00', coordNote: 'Confirmed for Placement Wing. Bring architecture diagrams of your ETL project.', stud: 'USR-STUD-33' },
    { id: 'GD-2009', name: 'Divya Menon', dept: 'Information Technology (IT)', role: 'Mobile App Developer',
      topic: 'Flutter State Management (Bloc vs Riverpod) for Product Companies', slot: 'Wednesday Morning (10:00 AM - 11:00 AM)',
      notes: 'Recruiter asked for Riverpod state management in code round.', date: '2026-10-01 16:45:00', status: 'Scheduled',
      sched: '2026-10-07 10:00:00', coordNote: 'Confirmed. Coordinator will connect candidate with 2025 alumni Flutter developer.', stud: 'USR-STUD-19' },

    // 1 COMPLETED
    { id: 'GD-2010', name: 'Dhiraj Tendulkar', dept: 'Computer Science (CS)', role: 'Full-Stack Developer',
      topic: 'Technical Portfolio Strategy & Mock Interview Debrief', slot: 'Friday Afternoon (3:00 PM - 4:00 PM)',
      notes: 'Initial mock interview feedback discussion.', date: '2026-09-25 15:30:00', status: 'Completed',
      sched: '2026-09-28 15:30:00', coordNote: 'Session completed. Candidate demonstrated strong full-stack skills; advised to focus on dynamic programming.', stud: 'USR-STUD-01' },
  ];

  for (const g of guidances) {
    insertGuidance.run(
      g.id,
      g.name,
      g.dept,
      g.role,
      g.topic,
      g.slot,
      g.notes,
      g.date,
      g.status,
      g.sched,
      g.coordNote,
      g.stud
    );
  }
  console.log(`[Populate] Seeded ${guidances.length} guidance requests (4 awaiting schedule, 5 scheduled, 1 completed).`);

  // 6. Workshop Rosters (28 Total Enrollments across 6 Workshops)
  // Ensures Workshop Rosters = 28 allocated seats!
  const enrollments = [
    // TRN-101: Advanced DSA & LeetCode (Capacity 45) -> 8 enrolled
    { id: 'ENR-201', ws: 'TRN-101', stud: 'USR-STUD-01', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-202', ws: 'TRN-101', stud: 'USR-STUD-03', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-203', ws: 'TRN-101', stud: 'USR-STUD-06', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-204', ws: 'TRN-101', stud: 'USR-STUD-07', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-205', ws: 'TRN-101', stud: 'USR-STUD-09', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-206', ws: 'TRN-101', stud: 'USR-STUD-11', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-207', ws: 'TRN-101', stud: 'USR-STUD-13', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-208', ws: 'TRN-101', stud: 'USR-STUD-15', status: 'Enrolled', markedBy: null, markedAt: null },

    // TRN-201: Cloud DevOps & Docker/K8s (Capacity 35) -> 6 enrolled
    { id: 'ENR-209', ws: 'TRN-201', stud: 'USR-STUD-16', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-01 17:00:00' },
    { id: 'ENR-210', ws: 'TRN-201', stud: 'USR-STUD-17', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-01 17:00:00' },
    { id: 'ENR-211', ws: 'TRN-201', stud: 'USR-STUD-21', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-01 17:00:00' },
    { id: 'ENR-212', ws: 'TRN-201', stud: 'USR-STUD-24', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-01 17:00:00' },
    { id: 'ENR-213', ws: 'TRN-201', stud: 'USR-STUD-05', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-214', ws: 'TRN-201', stud: 'USR-STUD-30', status: 'Enrolled', markedBy: null, markedAt: null },

    // TRN-301: Machine Learning & Predictive Modeling (Capacity 30) -> 5 enrolled
    { id: 'ENR-215', ws: 'TRN-301', stud: 'USR-STUD-02', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-216', ws: 'TRN-301', stud: 'USR-STUD-31', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-217', ws: 'TRN-301', stud: 'USR-STUD-34', status: 'Attended', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },
    { id: 'ENR-218', ws: 'TRN-301', stud: 'USR-STUD-36', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-219', ws: 'TRN-301', stud: 'USR-STUD-38', status: 'Enrolled', markedBy: null, markedAt: null },

    // TRN-401: Full-Stack MERN Microservices (Capacity 35) -> 4 enrolled
    { id: 'ENR-220', ws: 'TRN-401', stud: 'USR-STUD-04', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-221', ws: 'TRN-401', stud: 'USR-STUD-08', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-222', ws: 'TRN-401', stud: 'USR-STUD-12', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-223', ws: 'TRN-401', stud: 'USR-STUD-44', status: 'Absent', markedBy: 'USR-COORD-01', markedAt: '2026-10-02 17:00:00' },

    // TRN-501: Big Data, SQL & Power BI (Capacity 40) -> 3 enrolled
    { id: 'ENR-224', ws: 'TRN-501', stud: 'USR-STUD-32', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-225', ws: 'TRN-501', stud: 'USR-STUD-33', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-226', ws: 'TRN-501', stud: 'USR-STUD-37', status: 'Enrolled', markedBy: null, markedAt: null },

    // TRN-601: Web App Security & Penetration Testing (Capacity 35) -> 2 enrolled
    { id: 'ENR-227', ws: 'TRN-601', stud: 'USR-STUD-18', status: 'Enrolled', markedBy: null, markedAt: null },
    { id: 'ENR-228', ws: 'TRN-601', stud: 'USR-STUD-27', status: 'Enrolled', markedBy: null, markedAt: null },
  ];

  for (const e of enrollments) {
    insertEnrollment.run(
      e.id,
      e.ws,
      e.stud,
      '2026-10-01 10:00:00',
      e.status,
      e.markedBy,
      e.markedAt
    );
  }
  console.log(`[Populate] Seeded ${enrollments.length} workshop enrollments across all 6 clinics.`);

  // Synchronize enrolled_count on training_sessions table
  db.exec(`
    UPDATE training_sessions
    SET enrolled_count = (
      SELECT COUNT(*) FROM workshop_enrollments
      WHERE workshop_enrollments.workshop_id = training_sessions.id
      AND workshop_enrollments.attendance_status != 'Cancelled'
    );
  `);

  console.log('[Populate] Synchronized enrolled_count across training_sessions.');
  console.log('[Populate] SUCCESS! Rich operational data successfully populated.');
}

if (process.argv[1]?.endsWith('populate-rich-demo-data.ts')) {
  const dbPath = process.env.DB_PATH || 'server/database/cep_portal.sqlite';
  const db = new DatabaseSync(dbPath);
  populateRichDemoData(db);
}
