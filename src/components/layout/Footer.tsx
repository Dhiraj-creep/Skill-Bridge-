import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageId, BrandLogoMark } from './Navbar';
import { hasPageAccess } from '../../utils/permissions';
import { Shield, BookOpen, HeartHandshake, CheckCircle } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: PageId) => void;
  currentPage?: PageId;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage, currentPage }) => {
  const { siteContent, role } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-12 pb-8 mt-16 text-sm">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-slate-800/80">
          {/* Column 1: Project Identity & Leadership (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 p-1.5 shadow-inner flex items-center justify-center flex-shrink-0">
                <BrandLogoMark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight font-sans">
                    Skill<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Bridge</span>
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 rounded border border-slate-700">
                    CEP
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Community Employment & Skill Matching Portal
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              An academic Community Engagement Project (CEP) developed to analyze student placement
              pathways, document department-specific barriers, and demonstrate a unified portal for
              opportunity discovery, role-specific practical preparation, and institutional feedback tracking.
            </p>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 max-w-md shadow-xs">
              <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>CEP Project Credential & Team</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-normal">
                Led by <strong>Dhiraj Tendulkar</strong> (Team Leader) with <strong>Vidhi Mahato</strong>, <strong>Gaurav Mhatre</strong>, and <strong>Varun Patil</strong>. Focused on Computer Science, IT, and Data Science cohorts.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Project Modules</h4>
            <ul className="space-y-1.5 text-xs">
              {[
                { id: 'home' as PageId, label: 'Home Overview' },
                { id: 'research' as PageId, label: 'Research & Findings (200 Records)' },
                { id: 'study' as PageId, label: 'Three Community Visits' },
                { id: 'opportunities' as PageId, label: 'Opportunities Directory' },
                { id: 'student-dashboard' as PageId, label: 'Student Workspace & Matching' },
                { id: 'placement-dashboard' as PageId, label: 'Placement Cell Dashboard' },
                { id: 'feedback' as PageId, label: 'Feedback & Guidance Requests' },
                { id: 'about' as PageId, label: 'About Methodology & Provenance' },
                { id: 'admin' as PageId, label: 'Admin & Content Management' },
              ]
                .filter((item) => hasPageAccess(item.id, role))
                .map((item) => {
                  const isCurrent = currentPage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setCurrentPage(item.id)}
                        className={`text-left py-0.5 transition-colors duration-150 rounded px-1 -mx-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 inline-flex items-center gap-1.5 ${
                          isCurrent
                            ? 'text-blue-400 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {isCurrent && <span className="w-1 h-1 rounded-full bg-blue-400" />}
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Column 3: Institutional Details (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Institution Info</h4>
            <div className="text-xs text-slate-400 space-y-2">
              <p>
                <strong className="text-slate-300 block">College:</strong>{' '}
                <span>{siteContent.collegeName ? siteContent.collegeName : 'College of Engineering & Technology (Demo)'}</span>
              </p>
              <p>
                <strong className="text-slate-300 block">Office:</strong>{' '}
                <span>{siteContent.contactOffice ? siteContent.contactOffice : 'Training & Placement Cell, Central Block'}</span>
              </p>
              <p>
                <strong className="text-slate-300 block">Inquiries:</strong>{' '}
                <span>{siteContent.contactEmail ? siteContent.contactEmail : 'placement-cep@institution.edu (Demo)'}</span>
              </p>
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-900 leading-normal">
                Edit college title and contact channels anytime from the Admin panel without modifying source code.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 Skill Bridge Community Engagement Project (CEP). Built for student welfare and placement transparency.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>WCAG AA Accessible</span>
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span>Local Browser Storage Repository</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
