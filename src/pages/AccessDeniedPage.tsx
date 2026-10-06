import React from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../utils/permissions';
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogIn, Lock } from 'lucide-react';

interface AccessDeniedPageProps {
  setCurrentPage: (page: PageId) => void;
  targetPage?: PageId;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ setCurrentPage, targetPage }) => {
  const { user, role } = useApp();

  const getDashboardTarget = (): PageId => {
    if (role === 'Student') return 'student-dashboard';
    if (role === 'Placement Coordinator') return 'placement-dashboard';
    if (role === 'Admin') return 'admin';
    return 'home';
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-10 shadow-lg text-center space-y-6">
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <Lock className="w-3.5 h-3.5" /> 403 Forbidden Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans">
            Access Restricted to Authorized Role
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            The page you requested requires specific institutional privileges that are not assigned to your current account.
          </p>
        </div>

        {/* Current Identity Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500 font-medium">Signed In As:</span>
            <span className="font-bold text-slate-900">{user ? user.fullName : 'Guest Visitor'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500 font-medium">Assigned Role:</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
              {role}
            </span>
          </div>
          {targetPage && (
            <div className="flex items-center justify-between pt-0.5 text-rose-700">
              <span>Attempted Destination:</span>
              <span className="font-mono font-semibold">{targetPage}</span>
            </div>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {user ? (
            <button
              onClick={() => setCurrentPage(getDashboardTarget())}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to My Authorized Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Authorized Account</span>
            </button>
          )}

          <button
            onClick={() => setCurrentPage('home')}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
