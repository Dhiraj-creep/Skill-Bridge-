import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../utils/permissions';
import { BrandLogoMark } from '../components/layout/Navbar';
import { Lock, User, ArrowRight, ShieldCheck, GraduationCap, Settings, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  setCurrentPage: (page: PageId) => void;
  redirectTarget?: PageId;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage, redirectTarget }) => {
  const { login, addNotification } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(username.trim(), password.trim());
    setIsLoading(false);

    if (res.success && res.user) {
      addNotification(`Welcome back, ${res.user.fullName}!`, 'success');
      if (redirectTarget && redirectTarget !== 'login' && redirectTarget !== 'access-denied') {
        setCurrentPage(redirectTarget);
      } else if (res.user.role === 'Student') {
        setCurrentPage('student-dashboard');
      } else if (res.user.role === 'Placement Coordinator') {
        setCurrentPage('placement-dashboard');
      } else if (res.user.role === 'Admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your username and password.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-2 text-white mx-auto shadow-md flex items-center justify-center">
            <BrandLogoMark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to Skill<span className="text-blue-600">Bridge</span>
          </h1>
          <p className="text-xs text-slate-500">
            Authenticated institutional access for Students and Placement Coordinators.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Username or ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. coordinator, student.cs, student.ds"
                autoComplete="username"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                autoComplete="current-password"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Section for Evaluators (Gated behind VITE_ENABLE_DEMO_SHORTCUTS) */}
        {import.meta.env.VITE_ENABLE_DEMO_SHORTCUTS === 'true' && (
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Evaluation Demo Accounts:
              </span>
              <span className="text-slate-400 text-[10px]">1-Click Credentials</span>
            </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('coordinator', 'Coordinator@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">Coordinator</div>
                <div className="text-[10px] text-slate-500">Placement Desk</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('student.cs', 'Student@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">Student (CS)</div>
                <div className="text-[10px] text-slate-500">Dhiraj Tendulkar</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('student.ds', 'Student@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">Student (DS)</div>
                <div className="text-[10px] text-slate-500">Vidhi Mahato</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'Admin@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-colors flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">Administrator</div>
                <div className="text-[10px] text-slate-500">System Root</div>
              </div>
            </button>
          </div>
        </div>
        )}

        {/* Registration Link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          <span>New student in CS, IT, or DS? </span>
          <button
            onClick={() => setCurrentPage('register')}
            className="font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
          >
            Create Student Account
          </button>
        </div>
      </div>
    </div>
  );
};
