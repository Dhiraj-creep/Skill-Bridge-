import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Department } from '../types/survey';
import { FeedbackCategory, GuidanceTopic } from '../types/feedback';
import {
  MessageSquare,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Shield,
  Search,
  Clock,
  UserCheck,
} from 'lucide-react';

import { PageId } from '../utils/permissions';

interface FeedbackGuidancePageProps {
  setCurrentPage?: (page: PageId) => void;
}

export const FeedbackGuidancePage: React.FC<FeedbackGuidancePageProps> = ({ setCurrentPage }) => {
  const {
    user,
    role,
    studentFeedbackList,
    coordinatorFeedbackList,
    submitFeedback,
    studentGuidanceList,
    coordinatorGuidanceList,
    submitGuidanceRequest,
    studentProfile,
  } = useApp();

  const isCoordinator = role === 'Placement Coordinator' || role === 'Admin';
  const feedbackList = isCoordinator ? coordinatorFeedbackList : studentFeedbackList;
  const guidanceList = isCoordinator ? coordinatorGuidanceList : studentGuidanceList;

  // Active form view
  const [activeForm, setActiveForm] = useState<'feedback' | 'guidance'>('feedback');

  // Feedback form state with safe fallbacks
  const [fbDept, setFbDept] = useState<Department>(
    studentProfile?.department || (user?.department as Department) || 'Computer Science (CS)'
  );
  const [fbCategory, setFbCategory] = useState<FeedbackCategory>('Opportunity Access');
  const [fbDescription, setFbDescription] = useState('');
  const [fbSuggestion, setFbSuggestion] = useState('');
  const [fbErrors, setFbErrors] = useState<Record<string, string>>({});
  const [fbSuccessId, setFbSuccessId] = useState<string | null>(null);

  // Guidance request state with safe fallbacks
  const [gdName, setGdName] = useState(studentProfile?.displayName || user?.fullName || 'Student');
  const [gdDept, setGdDept] = useState<Department>(
    studentProfile?.department || (user?.department as Department) || 'Computer Science (CS)'
  );
  const [gdRole, setGdRole] = useState(
    studentProfile?.preferredRoles?.[0] || 'Full-Stack Developer'
  );
  const [gdTopic, setGdTopic] = useState<GuidanceTopic>('Resume & Profile Review');
  const [gdSlot, setGdSlot] = useState('Tuesday 3:00 PM – 4:00 PM');
  const [gdNotes, setGdNotes] = useState('');
  const [gdErrors, setGdErrors] = useState<Record<string, string>>({});
  const [gdSuccessId, setGdSuccessId] = useState<string | null>(null);

  // Search track ID state
  const [searchTrackId, setSearchTrackId] = useState('');

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!fbDescription.trim()) {
      errors.description = 'Please describe the specific placement issue or barrier.';
    } else if (fbDescription.trim().length < 15) {
      errors.description = 'Please provide at least 15 characters to explain the issue.';
    }

    if (!fbSuggestion.trim()) {
      errors.suggestion = 'Please propose at least one suggestion for improvement.';
    }

    if (Object.keys(errors).length > 0) {
      setFbErrors(errors);
      return;
    }

    setFbErrors({});
    const res = await submitFeedback({
      category: fbCategory,
      description: fbDescription.trim(),
      suggestedImprovement: fbSuggestion.trim(),
    });

    if (res.success) {
      setFbSuccessId('FB-LOGGED');
      setFbDescription('');
      setFbSuggestion('');
    }
  };

  const handleGuidanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!gdName.trim()) {
      errors.name = 'Please provide a student name.';
    }
    if (!gdRole.trim()) {
      errors.role = 'Please specify your target role or domain.';
    }
    if (!gdSlot.trim()) {
      errors.slot = 'Please specify an available time slot.';
    }

    if (Object.keys(errors).length > 0) {
      setGdErrors(errors);
      return;
    }

    setGdErrors({});
    const res = await submitGuidanceRequest({
      preferredRole: gdRole.trim(),
      topic: gdTopic,
      preferredTimeSlot: gdSlot.trim(),
      additionalNotes: gdNotes.trim(),
    });

    if (res.success) {
      setGdSuccessId('GD-LOGGED');
      setGdNotes('');
    }
  };

  // Filtered tracking list based on search
  const filteredFeedback = feedbackList.filter((f) =>
    searchTrackId.trim() === ''
      ? true
      : f.id.toLowerCase().includes(searchTrackId.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTrackId.toLowerCase())
  );

  const filteredGuidance = guidanceList.filter((g) =>
    searchTrackId.trim() === ''
      ? true
      : g.id.toLowerCase().includes(searchTrackId.toLowerCase()) ||
        g.topic.toLowerCase().includes(searchTrackId.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-brand-pink uppercase tracking-wider">
            Student Support & Grievances
          </span>
          <span className="text-[11px] bg-pink-100 text-brand-pink px-2 py-0.5 rounded-full font-medium">
            Separate Operational Channel
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Feedback Management & Guidance Booking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Submit placement grievances or book one-on-one resume and technical counseling appointments.
          Track coordinator responses directly with generated ticket IDs.
        </p>

        {/* Institutional Privacy & Confidentiality Notice */}
        <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
          <span>
            <strong>Confidential & Tracked Resolution:</strong> Student grievances and guidance requests are logged anonymously with secure ticket IDs to ensure objective, tracked review by placement coordinators.
          </span>
        </div>

        {isCoordinator && (
          <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <strong className="block text-purple-950 font-bold">Placement Coordinator Administrative View</strong>
                <span>You can review, resolve, and respond to student grievances in the official coordinator queue.</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage && setCurrentPage('placement-dashboard')}
              className="px-4 py-2 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Open Placement Cell Desk →
            </button>
          </div>
        )}
      </div>

      {/* Form Selector Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 inline-flex flex-wrap items-center gap-1.5 text-xs font-semibold no-print">
        <button
          onClick={() => setActiveForm('feedback')}
          className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
            activeForm === 'feedback'
              ? 'bg-white text-pink-700 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Submit Placement Feedback</span>
        </button>

        <button
          onClick={() => setActiveForm('guidance')}
          className={`py-2 px-4 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
            activeForm === 'guidance'
              ? 'bg-white text-pink-700 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Book Guidance Session</span>
        </button>
      </div>

      {/* FORM 1: FEEDBACK */}
      {activeForm === 'feedback' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Submit Anonymous Operational Feedback</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Highlight notice delays, JD omissions, or branch opportunity gaps for coordinator review.
            </p>
          </div>

          {fbSuccessId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong>Feedback Ticket Logged Successfully!</strong>
                <p className="mt-0.5">
                  Your ticket reference ID is <strong className="font-mono text-emerald-800">{fbSuccessId}</strong>.
                  View status and coordinator remarks in the tracking section below.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={fbDept}
                  onChange={(e) => setFbDept(e.target.value as Department)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-pink focus:outline-none"
                >
                  <option value="Computer Science (CS)">Computer Science (CS)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="Data Science (DS)">Data Science (DS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Issue Category
                </label>
                <select
                  value={fbCategory}
                  onChange={(e) => setFbCategory(e.target.value as FeedbackCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-pink focus:outline-none"
                >
                  <option value="Opportunity Access">Opportunity Access (Scarcity of Core Drives)</option>
                  <option value="Notice Timeliness">Notice Timeliness (Late Announcements)</option>
                  <option value="Training Relevance">Training Relevance (Generic Syllabus)</option>
                  <option value="Eligibility Criteria">Eligibility Criteria (Rigid Cutoffs)</option>
                  <option value="Interview Preparation">Interview Preparation</option>
                  <option value="Portal Functionality">Portal Functionality</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Description of the Issue
              </label>
              <textarea
                rows={4}
                placeholder="Explain the specific situation or placement challenge you encountered..."
                value={fbDescription}
                onChange={(e) => setFbDescription(e.target.value)}
                className={`w-full text-xs p-3 rounded-xl border ${
                  fbErrors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:ring-2 focus:ring-brand-pink focus:outline-none`}
              />
              {fbErrors.description && (
                <p className="text-[11px] text-rose-600 mt-1">{fbErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Suggested Improvement
              </label>
              <textarea
                rows={3}
                placeholder="What action or change would help resolve this issue?"
                value={fbSuggestion}
                onChange={(e) => setFbSuggestion(e.target.value)}
                className={`w-full text-xs p-3 rounded-xl border ${
                  fbErrors.suggestion ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:ring-2 focus:ring-brand-pink focus:outline-none`}
              />
              {fbErrors.suggestion && (
                <p className="text-[11px] text-rose-600 mt-1">{fbErrors.suggestion}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-pink text-white font-semibold text-xs hover:bg-pink-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback Ticket (Demo)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM 2: GUIDANCE BOOKING */}
      {activeForm === 'guidance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Schedule One-on-One Placement Guidance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Book a slot with department placement mentors for resume review, technical interview drills, or career orientation.
            </p>
          </div>

          {gdSuccessId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong>Guidance Request Registered!</strong>
                <p className="mt-0.5">
                  Your appointment booking ID is <strong className="font-mono text-emerald-800">{gdSuccessId}</strong>.
                  Check the coordinator schedule and confirmation notes below.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleGuidanceSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={gdName}
                  onChange={(e) => setGdName(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border ${
                    gdErrors.name ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                {gdErrors.name && <p className="text-[11px] text-rose-600 mt-1">{gdErrors.name}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={gdDept}
                  onChange={(e) => setGdDept(e.target.value as Department)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="Computer Science (CS)">Computer Science (CS)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="Data Science (DS)">Data Science (DS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Job Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Engineer, Financial Analyst"
                  value={gdRole}
                  onChange={(e) => setGdRole(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border ${
                    gdErrors.role ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                {gdErrors.role && <p className="text-[11px] text-rose-600 mt-1">{gdErrors.role}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Counseling Topic
                </label>
                <select
                  value={gdTopic}
                  onChange={(e) => setGdTopic(e.target.value as GuidanceTopic)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="Resume & Profile Review">Resume & Profile Review</option>
                  <option value="Technical Guidance for Core Roles">Technical Guidance for Core Roles</option>
                  <option value="Aptitude & Coding Assessment Prep">Aptitude & Coding Assessment Prep</option>
                  <option value="Mock Interview & Feedback">Mock Interview & Feedback</option>
                  <option value="Non-IT Domain Placement Strategy">Non-IT Domain Placement Strategy</option>
                  <option value="Off-Campus & Internship Guidance">Off-Campus & Internship Guidance</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Preferred Available Window / Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tuesday 3:00 PM – 4:30 PM, or Friday morning"
                  value={gdSlot}
                  onChange={(e) => setGdSlot(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border ${
                    gdErrors.slot ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                {gdErrors.slot && <p className="text-[11px] text-rose-600 mt-1">{gdErrors.slot}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Specific Questions / Context for Mentor
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention what specific guidance you are seeking..."
                  value={gdNotes}
                  onChange={(e) => setGdNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-pink text-white font-semibold text-xs hover:bg-pink-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Guidance Request (Demo)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRACKING SECTION */}
      <section className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Track Submitted Requests & Coordinator Responses</h2>
            <p className="text-xs text-slate-500">
              Check live status, scheduled appointment timings, and coordinator resolution notes.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by ticket ID or text..."
              value={searchTrackId}
              onChange={(e) => setSearchTrackId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 pl-8 pr-3 p-2 focus:ring-2 focus:ring-brand-pink"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Tracking List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-navy text-sm">Feedback Tickets ({filteredFeedback.length})</h3>
              <span className="text-[11px] text-slate-400 font-mono">FB-series</span>
            </div>

            {filteredFeedback.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                No feedback tickets logged yet.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredFeedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-pink">{fb.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fb.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fb.status === 'Under review'
                            ? 'bg-blue-100 text-brand-blue'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fb.status}
                      </span>
                    </div>

                    <div className="text-slate-700">
                      <strong>{fb.category}</strong> ({fb.department})
                      <p className="text-slate-600 mt-0.5">{fb.description}</p>
                    </div>

                    {fb.coordinatorResponse && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-0.5">
                        <strong className="block text-[11px] text-emerald-800">
                          Coordinator Response:
                        </strong>
                        <p>{fb.coordinatorResponse}</p>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Submitted: {new Date(fb.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guidance Tracking List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-navy text-sm">Guidance Requests ({filteredGuidance.length})</h3>
              <span className="text-[11px] text-slate-400 font-mono">GD-series</span>
            </div>

            {filteredGuidance.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                No guidance requests submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredGuidance.map((g) => (
                  <div
                    key={g.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-teal">{g.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          g.status === 'Scheduled'
                            ? 'bg-blue-100 text-brand-blue'
                            : g.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>

                    <div className="text-slate-700">
                      <strong>{g.topic}</strong> — {g.studentName} ({g.department})
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Preferred Window: {g.preferredTimeSlot}
                      </p>
                    </div>

                    {g.scheduledTime && (
                      <div className="p-2 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 font-medium">
                        Confirmed Appointment: {g.scheduledTime}
                      </div>
                    )}

                    {g.coordinatorNote && (
                      <div className="text-[11px] text-slate-600 italic">
                        Coordinator Note: {g.coordinatorNote}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400">
                      Requested: {new Date(g.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
