import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../utils/permissions';
import { BrandLogoMark } from '../components/layout/Navbar';
import { Department } from '../types/survey';
import { User, Lock, ArrowRight, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentPage }) => {
  const { register, addNotification } = useApp();

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science (CS)');
  const [year, setYear] = useState('Final Year (4th Year)');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack Developer');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await register({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      password,
      department,
      year,
      preferredRoles: [targetRole],
      skills: ['Git', 'Problem Solving'],
    });

    setIsLoading(false);

    if (res.success && res.user) {
      addNotification(`Account created successfully! Welcome, ${res.user.fullName}.`, 'success');
      setCurrentPage('student-dashboard');
    } else {
      setErrorMessage(res.error || 'Registration failed. Please choose another username.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-2 text-white mx-auto shadow-md flex items-center justify-center">
            <BrandLogoMark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-500">
            Open strictly to Computer Science, IT, and Data Science cohorts.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Varun Patil"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Department Domain
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Computer Science (CS)">Computer Science (CS)</option>
                <option value="Information Technology (IT)">Information Technology (IT)</option>
                <option value="Data Science (DS)">Data Science (DS)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Academic Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Final Year (4th Year)">Final Year (4th Year)</option>
                <option value="Third Year (3rd Year)">Third Year (3rd Year)</option>
                <option value="Second Year (2nd Year)">Second Year (2nd Year)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full-Stack Developer, Data Scientist, DevOps"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Choose Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. varun.cs"
              autoComplete="username"
              required
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  autoComplete="new-password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="******"
                  autoComplete="new-password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Registration grants immediate access to the Student Workspace with deterministic matching and workshop enrollments.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Creating Student Account...</span>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                <span>Register & Open Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing Account Link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <button
            onClick={() => setCurrentPage('login')}
            className="font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
