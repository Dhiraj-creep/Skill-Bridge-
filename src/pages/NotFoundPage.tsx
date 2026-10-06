import React from 'react';
import { PageId } from '../utils/permissions';
import { Compass, Home, Briefcase } from 'lucide-react';

interface NotFoundPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 animate-in fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-brand-navy">
            Resource Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The destination URL does not exist or may have been relocated within the Skill Bridge portal.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Overview</span>
          </button>

          <button
            onClick={() => setCurrentPage('opportunities')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-slate-500" />
            <span>Explore Opportunities Directory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
