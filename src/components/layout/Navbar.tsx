import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageId, hasPageAccess } from '../../utils/permissions';
import {
  Briefcase,
  BarChart2,
  Calendar,
  Layers,
  User,
  Shield,
  MessageSquare,
  Info,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  KeyRound,
} from 'lucide-react';

export type { PageId } from '../../utils/permissions';

interface NavbarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

interface NavItemConfig {
  id: PageId;
  label: string;
  fullLabel?: string;
  icon: React.ReactNode;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}

export const BrandLogoMark: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="sb-primary-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.5" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="sb-glow-grad" x1="16" y1="6" x2="16" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    {/* Foundation Roadway / Bridge Deck */}
    <path
      d="M4 22C10 19.5 22 19.5 28 22"
      stroke="url(#sb-primary-grad)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Graceful Bridge Arch */}
    <path
      d="M5 22C9.5 11.5 22.5 11.5 27 22"
      stroke="url(#sb-glow-grad)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Left Anchor Pillar */}
    <rect x="5.5" y="13.5" width="3" height="9.5" rx="1.5" fill="url(#sb-primary-grad)" />
    {/* Right Anchor Pillar */}
    <rect x="23.5" y="13.5" width="3" height="9.5" rx="1.5" fill="url(#sb-primary-grad)" />
    {/* Interlocking Apex Diamond Node (Skill Matching Core) */}
    <path
      d="M16 5.5L19.5 11L16 14.5L12.5 11Z"
      fill="#38BDF8"
    />
    <circle cx="16" cy="11" r="1.5" fill="#FFFFFF" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, role, logout, login, siteContent, addNotification } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const allNavLinks: NavItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Layers className="w-3.5 h-3.5" />,
      activeColor: 'text-blue-700',
      activeBg: 'bg-blue-50',
      activeBorder: 'border-blue-200',
    },
    {
      id: 'research',
      label: 'Research',
      fullLabel: 'Research & Findings',
      icon: <BarChart2 className="w-3.5 h-3.5" />,
      activeColor: 'text-purple-700',
      activeBg: 'bg-purple-50',
      activeBorder: 'border-purple-200',
    },
    {
      id: 'study',
      label: 'Visits',
      fullLabel: 'Three Community Visits',
      icon: <Calendar className="w-3.5 h-3.5" />,
      activeColor: 'text-teal-700',
      activeBg: 'bg-teal-50',
      activeBorder: 'border-teal-200',
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      activeColor: 'text-blue-700',
      activeBg: 'bg-blue-50',
      activeBorder: 'border-blue-200',
    },
    {
      id: 'student-dashboard',
      label: 'Workspace',
      fullLabel: 'Student Workspace',
      icon: <User className="w-3.5 h-3.5" />,
      activeColor: 'text-indigo-700',
      activeBg: 'bg-indigo-50',
      activeBorder: 'border-indigo-200',
    },
    {
      id: 'placement-dashboard',
      label: 'Placement Cell',
      fullLabel: 'Placement Cell',
      icon: <Shield className="w-3.5 h-3.5" />,
      activeColor: 'text-purple-800',
      activeBg: 'bg-purple-50',
      activeBorder: 'border-purple-300',
    },
    {
      id: 'feedback',
      label: 'Feedback Desk',
      fullLabel: 'Feedback & Guidance',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      activeColor: 'text-pink-700',
      activeBg: 'bg-pink-50',
      activeBorder: 'border-pink-200',
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="w-3.5 h-3.5" />,
      activeColor: 'text-teal-700',
      activeBg: 'bg-teal-50',
      activeBorder: 'border-teal-200',
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Settings className="w-3.5 h-3.5" />,
      activeColor: 'text-slate-800',
      activeBg: 'bg-slate-100',
      activeBorder: 'border-slate-300',
    },
  ];

  // Strictly filter navigation links based on user permissions
  const navLinks = allNavLinks.filter((link) => hasPageAccess(link.id, role));

  const handleNavClick = (id: PageId) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  const handleQuickLogin = async (username: string, pass: string, targetDashboard: PageId) => {
    const res = await login(username, pass);
    if (res.success && res.user) {
      addNotification(`Signed in as ${res.user.fullName} (${res.user.role})`, 'success');
      setCurrentPage(targetDashboard);
    } else {
      addNotification(res.error || 'Login failed', 'error');
    }
    setShowDemoAccounts(false);
  };

  const handleSignOut = async () => {
    await logout();
    addNotification('Signed out successfully.', 'info');
    setCurrentPage('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm transition-all w-full max-w-full overflow-hidden">
      {/* Top 2.5px Gradient Accent Bar */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-teal-500" />

      {/* Top Utility Context Bar with Real Auth Identity */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 border-b border-slate-800/80 w-full overflow-hidden">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 flex items-center justify-between gap-2 overflow-hidden">
          {/* Left Context & Project Badges */}
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live CEP Portal
            </span>
            <span className="hidden md:inline text-slate-700 flex-shrink-0">•</span>
            <span className="hidden md:inline text-[11px] text-slate-300 font-medium truncate">
              College Community Engagement Project (CEP)
            </span>
            <span className="hidden xl:inline text-slate-700 flex-shrink-0">•</span>
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-indigo-300 font-medium bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-400" /> CS • IT • DS Specializations
            </span>
          </div>

          {/* Right Authenticated Identity / Login Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Demo Switcher helper for Evaluators / Judges (Gated behind VITE_ENABLE_DEMO_SHORTCUTS) */}
            {import.meta.env.VITE_ENABLE_DEMO_SHORTCUTS === 'true' && (
              <div className="relative">
                <button
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-900/60 transition-colors"
                  title="Evaluator Fast-Login: Switch demo accounts with 1 click (executes real server authentication)"
                >
                  <KeyRound className="w-2.5 h-2.5 text-indigo-400" />
                  <span>Demo Accounts</span>
                </button>

                {showDemoAccounts && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-slate-800">
                      One-Click Evaluator Sign-In
                    </div>
                    <button
                      onClick={() => handleQuickLogin('student.cs', 'Student@123', 'student-dashboard')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-indigo-300"
                    >
                      <span>Dhiraj T. (CS Student)</span>
                      <span className="text-[10px] text-slate-400 font-mono">CS</span>
                    </button>
                    <button
                      onClick={() => handleQuickLogin('student.ds', 'Student@123', 'student-dashboard')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-teal-300"
                    >
                      <span>Vidhi M. (DS Student)</span>
                      <span className="text-[10px] text-slate-400 font-mono">DS</span>
                    </button>
                    <button
                      onClick={() => handleQuickLogin('coordinator', 'Coordinator@123', 'placement-dashboard')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-purple-300"
                    >
                      <span>Prof. Kulkarni (Coordinator)</span>
                      <span className="text-[10px] text-slate-400 font-mono">TPO</span>
                    </button>
                    <button
                      onClick={() => handleQuickLogin('admin', 'Admin@123', 'admin')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-300"
                    >
                      <span>System Administrator</span>
                      <span className="text-[10px] text-slate-400 font-mono">Root</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                {/* User Identity Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800">
                  <User className="w-3 h-3 text-blue-400" />
                  <span className="text-white font-medium text-[11px] max-w-[120px] sm:max-w-[180px] truncate">
                    {user.fullName}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      user.role === 'Student'
                        ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                        : user.role === 'Placement Coordinator'
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {user.role === 'Placement Coordinator' ? 'Coordinator' : user.role}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('login')}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Nav Bar */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 w-full">
          {/* Logo & Identity Lockup */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl group flex-shrink-0"
          >
            {/* Iconic Bespoke Geometric Emblem */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-slate-800/90 shadow-md shadow-indigo-950/30 flex items-center justify-center p-1.5 ring-1 ring-white/10 group-hover:ring-blue-500/30 group-hover:scale-105 group-hover:border-indigo-500/40 transition-all duration-200">
              <BrandLogoMark className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Wordmark & Hierarchy */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 font-sans">
                  Skill<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Bridge</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 rounded-md border border-slate-200/90 shadow-2xs">
                  CEP
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-1 tracking-tight">
                <span className="truncate max-w-[140px] sm:max-w-none">
                  {siteContent.collegeName ? siteContent.collegeName : 'Community Skill & Employment Hub'}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block flex-shrink-0" />
                <span className="text-slate-400 font-normal hidden sm:inline-block flex-shrink-0">
                  CS • IT • DS
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation (Filtered by Permissions) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-nowrap" aria-label="Desktop Navigation">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  title={link.fullLabel || link.label}
                  className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 xl:gap-1.5 transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                    isActive
                      ? `${link.activeBg} ${link.activeColor} ${link.activeBorder} font-semibold shadow-xs ring-1 ring-black/5`
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span className={isActive ? link.activeColor : 'text-slate-400'}>
                    {link.icon}
                  </span>
                  <span>
                    <span className="xl:hidden">{link.label}</span>
                    <span className="hidden xl:inline">{link.fullLabel || link.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Mobile & Tablet Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in fade-in duration-200 w-full overflow-hidden">
          {/* Mobile Auth Status */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{user.fullName}</div>
                  <div className="text-[10px] text-slate-500">{user.role} • {user.department || 'All Domains'}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 text-center"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Portal Navigation
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? `${link.activeBg} ${link.activeColor} ${link.activeBorder} font-semibold shadow-xs`
                      : 'border-slate-100 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={isActive ? link.activeColor : 'text-slate-400'}>
                      {link.icon}
                    </span>
                    <span>{link.fullLabel || link.label}</span>
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
              <Shield className="w-4 h-4 flex-shrink-0 text-brand-teal" />
              <span className="text-[11px] leading-tight">
                College Community Engagement Project (CEP) • Dedicated to CS, IT & DS Placement Support.
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

