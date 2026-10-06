import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Notifications } from './components/common/Notifications';
import { PageId, getPageFromPath, ROUTE_PERMISSIONS, hasPageAccess } from './utils/permissions';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy-load complex dashboards and analytical views for optimal bundle splitting
const ResearchPage = React.lazy(() => import('./pages/ResearchPage').then(m => ({ default: m.ResearchPage })));
const ThreeDayStudyPage = React.lazy(() => import('./pages/ThreeDayStudyPage').then(m => ({ default: m.ThreeDayStudyPage })));
const OpportunitiesPage = React.lazy(() => import('./pages/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const StudentDashboardPage = React.lazy(() => import('./pages/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const PlacementDashboardPage = React.lazy(() => import('./pages/PlacementDashboardPage').then(m => ({ default: m.PlacementDashboardPage })));
const FeedbackGuidancePage = React.lazy(() => import('./pages/FeedbackGuidancePage').then(m => ({ default: m.FeedbackGuidancePage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

import { ChevronRight, Home, Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, role, authLoading } = useApp();

  // Initialize from current URL pathname
  const [currentPage, setCurrentPageState] = useState<PageId>(() => {
    if (typeof window !== 'undefined') {
      return getPageFromPath(window.location.pathname);
    }
    return 'home';
  });

  const [attemptedPage, setAttemptedPage] = useState<PageId | undefined>(undefined);

  // Navigate function that synchronizes with the browser's history
  const setCurrentPage = useCallback((page: PageId, options?: { replace?: boolean }) => {
    const route = ROUTE_PERMISSIONS[page];
    const targetPath = route ? route.path : '/';

    if (typeof window !== 'undefined') {
      if (options?.replace) {
        window.history.replaceState(null, '', targetPath);
      } else {
        window.history.pushState(null, '', targetPath);
      }
    }
    setCurrentPageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromPath(window.location.pathname);
      setCurrentPageState(page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route protection enforcement when auth state or current page changes
  useEffect(() => {
    if (authLoading) return;

    const route = ROUTE_PERMISSIONS[currentPage];

    // If user is already logged in and visits login or register, redirect to appropriate workspace
    if (user && (currentPage === 'login' || currentPage === 'register')) {
      if (user.role === 'Student') {
        setCurrentPage('student-dashboard', { replace: true });
      } else if (user.role === 'Placement Coordinator') {
        setCurrentPage('placement-dashboard', { replace: true });
      } else if (user.role === 'Admin') {
        setCurrentPage('admin', { replace: true });
      } else {
        setCurrentPage('home', { replace: true });
      }
      return;
    }

    // If page requires auth and visitor is not logged in
    if (route && route.requiresAuth && !user) {
      setAttemptedPage(currentPage);
      setCurrentPage('login', { replace: true });
      return;
    }

    // If logged in, check role permission
    if (user && !hasPageAccess(currentPage, user.role)) {
      setAttemptedPage(currentPage);
      setCurrentPage('access-denied', { replace: true });
      return;
    }
  }, [authLoading, user, currentPage, setCurrentPage]);

  const pageTitles: Record<PageId, string> = {
    home: 'Home Overview',
    research: 'Research & Findings',
    study: 'Three Community Visits',
    opportunities: 'Opportunities Directory',
    'student-dashboard': 'Student Workspace',
    'placement-dashboard': 'Placement Cell Dashboard',
    feedback: 'Feedback & Guidance',
    about: 'About Project & Methodology',
    admin: 'Admin & Maintenance',
    login: 'Account Sign In',
    register: 'Student Registration',
    'access-denied': 'Access Restricted',
    'not-found': 'Page Not Found',
  };

  const renderPage = () => {
    if (authLoading) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs font-medium">Verifying institutional credentials...</span>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'research':
        return <ResearchPage />;
      case 'study':
        return <ThreeDayStudyPage />;
      case 'opportunities':
        return <OpportunitiesPage setCurrentPage={setCurrentPage} />;
      case 'student-dashboard':
        return <StudentDashboardPage />;
      case 'placement-dashboard':
        return <PlacementDashboardPage />;
      case 'feedback':
        return <FeedbackGuidancePage setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'admin':
        return <AdminPage />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} redirectTarget={attemptedPage} />;
      case 'register':
        return <RegisterPage setCurrentPage={setCurrentPage} />;
      case 'access-denied':
        return <AccessDeniedPage setCurrentPage={setCurrentPage} targetPage={attemptedPage} />;
      case 'not-found':
        return <NotFoundPage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-offwhite text-slate-800 antialiased selection:bg-brand-blue selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Global Sticky Navigation */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Breadcrumb Bar (when not on home) */}
      {currentPage !== 'home' && (
        <div className="bg-slate-100/70 border-b border-slate-200/80 no-print">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-2">
            <nav className="flex items-center space-x-2 text-xs text-slate-500" aria-label="Breadcrumb">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-1 hover:text-brand-blue transition-colors font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Skill Bridge</span>
              </button>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-800">{pageTitles[currentPage] || 'Skill Bridge'}</span>
            </nav>
          </div>
        </div>
      )}

      {/* Main Page Area */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6">
        <React.Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
              <span className="text-xs font-semibold">Loading module...</span>
            </div>
          }
        >
          {renderPage()}
        </React.Suspense>
      </main>

      {/* Global Footer */}
      <Footer setCurrentPage={setCurrentPage} currentPage={currentPage} />

      {/* Global Notification Toast Container */}
      <Notifications />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;

