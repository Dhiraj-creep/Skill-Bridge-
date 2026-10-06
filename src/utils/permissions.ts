export type UserRole = 'Student' | 'Placement Coordinator' | 'Admin' | 'Public';

export type PageId =
  | 'home'
  | 'research'
  | 'study'
  | 'opportunities'
  | 'student-dashboard'
  | 'placement-dashboard'
  | 'feedback'
  | 'about'
  | 'admin'
  | 'login'
  | 'register'
  | 'access-denied'
  | 'not-found';

export interface RoutePermission {
  id: PageId;
  path: string;
  label: string;
  allowedRoles: UserRole[]; // 'Public' means unauthenticated visitors can access
  requiresAuth: boolean;
  category: 'public' | 'student' | 'coordinator' | 'admin' | 'auth';
  description: string;
}

export const ROUTE_PERMISSIONS: Record<PageId, RoutePermission> = {
  home: {
    id: 'home',
    path: '/',
    label: 'Home',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'public',
    description: 'Portal overview, domain introduction, and key placement pathways.',
  },
  about: {
    id: 'about',
    path: '/about',
    label: 'About',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'public',
    description: 'Project methodology, CEP objectives, and team credentials.',
  },
  research: {
    id: 'research',
    path: '/research',
    label: 'Research',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'public',
    description: 'Student placement fieldwork dataset (200 responses across CS, IT, and DS).',
  },
  study: {
    id: 'study',
    path: '/study',
    label: 'Visits',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'public',
    description: 'Three Community Visits documentation and traceability matrix.',
  },
  opportunities: {
    id: 'opportunities',
    path: '/opportunities',
    label: 'Opportunities',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'public',
    description: 'Domain-matched job, internship, and placement drive directory.',
  },
  'student-dashboard': {
    id: 'student-dashboard',
    path: '/student-dashboard',
    label: 'Student Workspace',
    allowedRoles: ['Student'],
    requiresAuth: true,
    category: 'student',
    description: 'Personalized matching, application tracking, workshop enrollments, and profile.',
  },
  'placement-dashboard': {
    id: 'placement-dashboard',
    path: '/placement-dashboard',
    label: 'Placement Cell',
    allowedRoles: ['Placement Coordinator', 'Admin'],
    requiresAuth: true,
    category: 'coordinator',
    description: 'Placement cell command center: applicant reviews, drives, outreach, and workshops.',
  },
  feedback: {
    id: 'feedback',
    path: '/feedback',
    label: 'Feedback Desk',
    allowedRoles: ['Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: true,
    category: 'student',
    description: 'Anonymous grievance submission and 1-on-1 guidance counseling desk.',
  },
  admin: {
    id: 'admin',
    path: '/admin',
    label: 'Admin',
    allowedRoles: ['Admin'],
    requiresAuth: true,
    category: 'admin',
    description: 'Site configuration, database management, and maintenance controls.',
  },
  login: {
    id: 'login',
    path: '/login',
    label: 'Sign In',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'auth',
    description: 'Sign into Student, Coordinator, or Administrator account.',
  },
  register: {
    id: 'register',
    path: '/register',
    label: 'Student Register',
    allowedRoles: ['Public'],
    requiresAuth: false,
    category: 'auth',
    description: 'Register a new Student account in Computer Science, IT, or Data Science.',
  },
  'access-denied': {
    id: 'access-denied',
    path: '/access-denied',
    label: 'Access Denied',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'public',
    description: 'Unauthorized access notice and redirection options.',
  },
  'not-found': {
    id: 'not-found',
    path: '/404',
    label: 'Page Not Found',
    allowedRoles: ['Public', 'Student', 'Placement Coordinator', 'Admin'],
    requiresAuth: false,
    category: 'public',
    description: 'The requested page could not be found.',
  },
};

/**
 * Check if a role has access to a given page
 */
export function hasPageAccess(pageId: PageId, currentRole: UserRole): boolean {
  const perm = ROUTE_PERMISSIONS[pageId];
  if (!perm) return false;
  if (!perm.requiresAuth) return true;
  return perm.allowedRoles.includes(currentRole);
}

/**
 * Map URL path to PageId with fallback
 */
export function getPageFromPath(pathname: string): PageId {
  const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';
  for (const [id, perm] of Object.entries(ROUTE_PERMISSIONS)) {
    if (perm.path === cleanPath) {
      return id as PageId;
    }
  }
  return 'not-found';
}
