import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  CommunityVisit1Data,
  CommunityVisit2Data,
  CommunityVisit3Data,
  TraceabilityItem,
  EvidencePhoto,
  AnonymizedFeedbackItem,
  PrototypeTestTask,
  VisitStatus,
  CommunityVisitsDocument,
} from '../types/study';
import { DEFAULT_COMMUNITY_VISITS, EMPTY_COMMUNITY_VISITS, ILLUSTRATIVE_VISIT_GUIDANCE } from '../data/defaultStudy';
import { triggerDownload } from '../utils/csvUtils';
import { generateId } from '../utils/id';
import {
  Users,
  FileText,
  Camera,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  X,
  Printer,
  Download,
  Upload,
  ShieldCheck,
  HelpCircle,
  Check,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export const ThreeDayStudyPage: React.FC = () => {
  const {
    user,
    communityVisits,
    updateCommunityVisits,
    updateVisit1,
    updateVisit2,
    updateVisit3,
    updateTraceability,
    studyData,
    addNotification,
  } = useApp();

  const canEdit = user?.role === 'Placement Coordinator' || user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState<'visit1' | 'visit2' | 'visit3' | 'traceability' | 'report' | 'illustrative'>('visit1');

  // Edit mode toggle per visit
  const [editingVisit, setEditingVisit] = useState<number | null>(null);

  // Local draft states for editing with defensive fallbacks
  const safeVisits = communityVisits && communityVisits.visit1 ? communityVisits : DEFAULT_COMMUNITY_VISITS;
  const [draftV1, setDraftV1] = useState<CommunityVisit1Data>(safeVisits.visit1 || DEFAULT_COMMUNITY_VISITS.visit1);
  const [draftV2, setDraftV2] = useState<CommunityVisit2Data>(safeVisits.visit2 || DEFAULT_COMMUNITY_VISITS.visit2);
  const [draftV3, setDraftV3] = useState<CommunityVisit3Data>(safeVisits.visit3 || DEFAULT_COMMUNITY_VISITS.visit3);

  // New photo upload modal state
  const [photoTargetVisit, setPhotoTargetVisit] = useState<1 | 2 | 3 | null>(null);
  const [newPhotoDataUrl, setNewPhotoDataUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoConsent, setNewPhotoConsent] = useState(false);
  const [newPhotoConsentNotes, setNewPhotoConsentNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New feedback modal state
  const [feedbackTargetVisit, setFeedbackTargetVisit] = useState<1 | 2 | 3 | null>(null);
  const [newFbTag, setNewFbTag] = useState('');
  const [newFbCategory, setNewFbCategory] = useState('');
  const [newFbText, setNewFbText] = useState('');
  const [newFbContext, setNewFbContext] = useState('');

  // New Task for Visit 2 state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskTarget, setNewTaskTarget] = useState('');
  const [newTaskAttempted, setNewTaskAttempted] = useState(1);
  const [newTaskCompleted, setNewTaskCompleted] = useState(1);
  const [newTaskDifficulties, setNewTaskDifficulties] = useState('');
  const [newTaskFeedback, setNewTaskFeedback] = useState('');

  // Traceability add state
  const [newTraceNeed, setNewTraceNeed] = useState('');
  const [newTraceFeature, setNewTraceFeature] = useState('');
  const [newTraceFeedback, setNewTraceFeedback] = useState('');
  const [newTraceEvidence, setNewTraceEvidence] = useState('');
  const [newTraceAction, setNewTraceAction] = useState('');
  const [showAddTraceRow, setShowAddTraceRow] = useState(false);

  // Hidden import file input
  const importFileRef = useRef<HTMLInputElement>(null);

  // Handlers for Visit Editing
  const startEditVisit = (vNum: 1 | 2 | 3) => {
    if (vNum === 1) setDraftV1(JSON.parse(JSON.stringify(communityVisits.visit1)));
    if (vNum === 2) setDraftV2(JSON.parse(JSON.stringify(communityVisits.visit2)));
    if (vNum === 3) setDraftV3(JSON.parse(JSON.stringify(communityVisits.visit3)));
    setEditingVisit(vNum);
  };

  const saveVisit = (vNum: 1 | 2 | 3) => {
    if (vNum === 1) {
      updateVisit1(draftV1);
    } else if (vNum === 2) {
      updateVisit2(draftV2);
    } else if (vNum === 3) {
      updateVisit3(draftV3);
    }
    setEditingVisit(null);
  };

  const cancelEditVisit = () => {
    setEditingVisit(null);
  };

  // Status Updater
  const handleQuickStatusChange = (vNum: 1 | 2 | 3, newStatus: VisitStatus) => {
    if (vNum === 1) {
      updateVisit1({ ...communityVisits.visit1, status: newStatus });
    } else if (vNum === 2) {
      updateVisit2({ ...communityVisits.visit2, status: newStatus });
    } else if (vNum === 3) {
      updateVisit3({ ...communityVisits.visit3, status: newStatus });
    }
  };

  // Photo Upload Handler (FileReader -> base64)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 4MB for localStorage safety
    if (file.size > 4 * 1024 * 1024) {
      addNotification('Image file is larger than 4MB. Please use a compressed photo for browser storage.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setNewPhotoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!newPhotoDataUrl) {
      addNotification('Please choose an image file first.', 'warning');
      return;
    }
    if (!newPhotoCaption.trim()) {
      addNotification('Please enter a descriptive caption for the photo.', 'warning');
      return;
    }

    const photoObj: EvidencePhoto = {
      id: generateId('PHT'),
      caption: newPhotoCaption.trim(),
      dataUrl: newPhotoDataUrl,
      hasConsent: newPhotoConsent,
      consentNotes: newPhotoConsentNotes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    if (photoTargetVisit === 1) {
      const updated = { ...communityVisits.visit1, photos: [...communityVisits.visit1.photos, photoObj] };
      await updateVisit1(updated);
    } else if (photoTargetVisit === 2) {
      const updated = { ...communityVisits.visit2, photos: [...communityVisits.visit2.photos, photoObj] };
      await updateVisit2(updated);
    } else if (photoTargetVisit === 3) {
      const updated = { ...communityVisits.visit3, photos: [...communityVisits.visit3.photos, photoObj] };
      await updateVisit3(updated);
    }

    setPhotoTargetVisit(null);
    setNewPhotoDataUrl('');
    setNewPhotoCaption('');
    setNewPhotoConsent(false);
    setNewPhotoConsentNotes('');
  };

  const handleDeletePhoto = async (vNum: 1 | 2 | 3, photoId: string) => {
    if (!window.confirm('Remove this evidence photograph?')) return;
    if (vNum === 1) {
      await updateVisit1({ ...communityVisits.visit1, photos: communityVisits.visit1.photos.filter((p) => p.id !== photoId) });
    } else if (vNum === 2) {
      await updateVisit2({ ...communityVisits.visit2, photos: communityVisits.visit2.photos.filter((p) => p.id !== photoId) });
    } else if (vNum === 3) {
      await updateVisit3({ ...communityVisits.visit3, photos: communityVisits.visit3.photos.filter((p) => p.id !== photoId) });
    }
  };

  // Feedback Handlers
  const handleSaveFeedback = async () => {
    if (!newFbText.trim()) {
      addNotification('Please enter feedback text.', 'warning');
      return;
    }

    const fbObj: AnonymizedFeedbackItem = {
      id: generateId('AFB'),
      participantTag: newFbTag.trim() || `Participant ${generateId()}`,
      category: newFbCategory.trim() || 'General Observation',
      feedbackText: newFbText.trim(),
      contextOrRole: newFbContext.trim() || undefined,
    };

    if (feedbackTargetVisit === 1) {
      await updateVisit1({ ...communityVisits.visit1, anonymizedFeedback: [...communityVisits.visit1.anonymizedFeedback, fbObj] });
    } else if (feedbackTargetVisit === 2) {
      await updateVisit2({ ...communityVisits.visit2, anonymizedFeedback: [...communityVisits.visit2.anonymizedFeedback, fbObj] });
    } else if (feedbackTargetVisit === 3) {
      await updateVisit3({ ...communityVisits.visit3, anonymizedFeedback: [...communityVisits.visit3.anonymizedFeedback, fbObj] });
    }

    setFeedbackTargetVisit(null);
    setNewFbTag('');
    setNewFbCategory('');
    setNewFbText('');
    setNewFbContext('');
  };

  const handleDeleteFeedback = async (vNum: 1 | 2 | 3, fbId: string) => {
    if (vNum === 1) {
      await updateVisit1({ ...communityVisits.visit1, anonymizedFeedback: communityVisits.visit1.anonymizedFeedback.filter((f) => f.id !== fbId) });
    } else if (vNum === 2) {
      await updateVisit2({ ...communityVisits.visit2, anonymizedFeedback: communityVisits.visit2.anonymizedFeedback.filter((f) => f.id !== fbId) });
    } else if (vNum === 3) {
      await updateVisit3({ ...communityVisits.visit3, anonymizedFeedback: communityVisits.visit3.anonymizedFeedback.filter((f) => f.id !== fbId) });
    }
  };

  // Task Handlers for Visit 2
  const handleSaveTask = () => {
    if (!newTaskName.trim()) {
      addNotification('Please provide a task name.', 'warning');
      return;
    }

    const taskObj: PrototypeTestTask = {
      id: generateId('TSK'),
      taskName: newTaskName.trim(),
      targetRoleOrNeed: newTaskTarget.trim() || 'General usability',
      attemptedCount: Number(newTaskAttempted) || 0,
      completedCount: Number(newTaskCompleted) || 0,
      difficultiesObserved: newTaskDifficulties.trim() || 'None observed',
      participantFeedback: newTaskFeedback.trim() || 'No explicit comment recorded',
    };

    updateVisit2({
      ...communityVisits.visit2,
      prototypeTasks: [...communityVisits.visit2.prototypeTasks, taskObj],
    });

    setShowAddTaskModal(false);
    setNewTaskName('');
    setNewTaskTarget('');
    setNewTaskAttempted(1);
    setNewTaskCompleted(1);
    setNewTaskDifficulties('');
    setNewTaskFeedback('');
    addNotification('Prototype testing task recorded.', 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    updateVisit2({
      ...communityVisits.visit2,
      prototypeTasks: communityVisits.visit2.prototypeTasks.filter((t) => t.id !== taskId),
    });
  };

  // Traceability Matrix Handlers
  const handleAddTraceRow = async () => {
    if (!newTraceNeed.trim() || !newTraceFeature.trim()) {
      addNotification('Please enter both the Community Need and Feature / Change.', 'warning');
      return;
    }

    const row: TraceabilityItem = {
      id: generateId('TRC'),
      communityNeed: newTraceNeed.trim(),
      featureOrChange: newTraceFeature.trim(),
      participantFeedback: newTraceFeedback.trim() || 'Not recorded',
      evidenceReference: newTraceEvidence.trim() || 'Not recorded',
      nextAction: newTraceAction.trim() || 'Not recorded',
    };

    await updateTraceability([...communityVisits.traceability, row]);
    setShowAddTraceRow(false);
    setNewTraceNeed('');
    setNewTraceFeature('');
    setNewTraceFeedback('');
    setNewTraceEvidence('');
    setNewTraceAction('');
  };

  const handleDeleteTraceRow = async (id: string) => {
    await updateTraceability(communityVisits.traceability.filter((t) => t.id !== id));
  };

  const handleLoadSampleTraceability = async () => {
    if (communityVisits.traceability.length > 0) {
      if (!window.confirm('Append illustrative template traceability items to your table?')) return;
    }
    await updateTraceability([
      ...communityVisits.traceability,
      ...ILLUSTRATIVE_VISIT_GUIDANCE.sampleTraceabilityRows,
    ]);
  };

  // Export / Import
  const handleExportVisitsJSON = () => {
    const jsonStr = JSON.stringify(communityVisits, null, 2);
    triggerDownload(
      jsonStr,
      `skillbridge-community-visits-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    addNotification('Three Community Visits documentation exported as JSON.', 'success');
  };

  const handleImportVisitsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text) as CommunityVisitsDocument;
        if (!parsed.visit1 || !parsed.visit2 || !parsed.visit3) {
          addNotification('Invalid format: Missing visit1, visit2, or visit3 records.', 'error');
          return;
        }
        if (window.confirm('Restore Community Visits documentation from this file? Current visit edits will be replaced.')) {
          await updateCommunityVisits(parsed);
        }
      } catch {
        addNotification('Failed to read JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
    if (importFileRef.current) importFileRef.current.value = '';
  };

  // Helper renderer for missing/empty fields
  const renderField = (value: string | number | null | undefined, fallbackLabel = 'Not recorded') => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-400 italic">
          <AlertCircle className="w-3 h-3 text-slate-300" />
          <span>{fallbackLabel}</span>
        </span>
      );
    }
    return <span className="text-slate-700 whitespace-pre-wrap">{value}</span>;
  };

  const v1 = communityVisits.visit1;
  const v2 = communityVisits.visit2;
  const v3 = communityVisits.visit3;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
              Community Engagement Project (CEP)
            </span>
            <span className="text-[11px] bg-teal-100 text-brand-teal px-2 py-0.5 rounded-full font-medium">
              Three Community Visits Documentation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Three Community Visits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Record, evaluate, and trace real fieldwork across three community visits:
            <strong> Visit 1 Needs Assessment</strong>, <strong>Visit 2 Prototype Testing</strong>, and
            <strong> Visit 3 Improved Prototype Evaluation</strong>. Features consent-aware photo attachments,
            anonymized participant quotes, and an end-to-end traceability matrix.
          </p>
        </div>

        {/* Global Action Controls: Export, Import, Print */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {canEdit && (
            <>
              <button
                onClick={() => {
                  if (window.confirm('Reset all visit documentation to demonstration data? Any unsaved edits will be replaced.')) {
                    updateCommunityVisits(DEFAULT_COMMUNITY_VISITS);
                    addNotification('Demonstration visit records loaded successfully.', 'success');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-semibold shadow-xs"
                title="Load illustrative demonstration data into all three visits"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                <span>Load Demo Data</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Clear all visit records to a blank template for recording your actual fieldwork?')) {
                    updateCommunityVisits(EMPTY_COMMUNITY_VISITS);
                    addNotification('Visits reset to blank template for fieldwork.', 'info');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs"
                title="Reset all visit fields to empty for real fieldwork"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear to Blank</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportVisitsJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            title="Download complete visits document and photos as JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-brand-teal" />
            <span>Export Backup</span>
          </button>

          {canEdit && (
            <label
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs cursor-pointer"
              title="Restore visits document and uploaded evidence from JSON"
            >
              <Upload className="w-3.5 h-3.5 text-brand-blue" />
              <span>Import Backup</span>
              <input
                ref={importFileRef}
                type="file"
                accept=".json"
                onChange={handleImportVisitsFile}
                className="hidden"
              />
            </label>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-navy text-white hover:bg-slate-800 text-xs font-semibold shadow-xs"
            title="Print comprehensive fieldwork report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Fieldwork Integrity Banner */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-950">
        <ShieldCheck className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-teal-900 font-semibold">
            Fieldwork Integrity & Ethical Standards:
          </strong>
          <p className="leading-relaxed">
            Real visit records start unpopulated so you can enter verified dates, participant numbers,
            and fieldwork findings. All photos require explicit informed consent declarations.
            Fields without evidence are displayed honestly as <em>"Not recorded"</em> rather than populated with fabricated outcomes.
          </p>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs font-semibold no-print">
        <button
          onClick={() => setActiveTab('visit1')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === 'visit1'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
            1
          </span>
          <span>Visit 1: Needs Assessment</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
            v1.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {v1.status}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('visit2')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
            activeTab === 'visit2'
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
            2
          </span>
          <span>Visit 2: Prototype Testing</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
            v2.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {v2.status}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('visit3')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
            activeTab === 'visit3'
              ? 'bg-white text-teal-700 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
            3
          </span>
          <span>Visit 3: Improved Evaluation</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
            v3.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {v3.status}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('traceability')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === 'traceability'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4 text-slate-700" />
          <span>Traceability Table ({communityVisits.traceability.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
            activeTab === 'report'
              ? 'bg-white text-teal-700 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Full Printable Report</span>
        </button>

        <button
          onClick={() => setActiveTab('illustrative')}
          className={`py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
            activeTab === 'illustrative'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/90 font-bold'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
          title="Placement coordinator interview guide and institutional dialogue questions"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Coordinator Interview Guide (15 Qs)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VISIT 1: NEEDS ASSESSMENT TAB */}
      {/* ============================================================== */}
      {activeTab === 'visit1' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">
                  Stage 1 Fieldwork
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
                  {v1.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{v1.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Switcher or Badge */}
                {canEdit ? (
                  <select
                    value={v1.status}
                    onChange={(e) => handleQuickStatusChange(1, e.target.value as VisitStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                      v1.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : v1.status === 'In Progress'
                        ? 'bg-blue-50 text-brand-blue border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="Planned">Status: Planned</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Completed">Status: Completed</option>
                  </select>
                ) : (
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      v1.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : v1.status === 'In Progress'
                        ? 'bg-blue-50 text-brand-blue border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    Status: {v1.status}
                  </span>
                )}

                {canEdit && (
                  <>
                    <button
                      onClick={() => (editingVisit === 1 ? saveVisit(1) : startEditVisit(1))}
                      className="px-4 py-1.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {editingVisit === 1 ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      <span>{editingVisit === 1 ? 'Save Visit 1' : 'Edit Details'}</span>
                    </button>
                    {editingVisit === 1 && (
                      <button
                        onClick={cancelEditVisit}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Core Metadata Grid: Date, Location, Team, Participants */}
            {editingVisit === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={draftV1.date}
                    onChange={(e) => setDraftV1({ ...draftV1, date: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location / Community Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Community Center, Seminar Block 2"
                    value={draftV1.location}
                    onChange={(e) => setDraftV1({ ...draftV1, location: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Team Members Present</label>
                  <input
                    type="text"
                    placeholder="e.g. Aditya Sharma, Rohan V."
                    value={draftV1.teamMembers}
                    onChange={(e) => setDraftV1({ ...draftV1, teamMembers: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Participant Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 24"
                    value={draftV1.participantCount ?? ''}
                    onChange={(e) =>
                      setDraftV1({
                        ...draftV1,
                        participantCount: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">Date of Visit:</span>
                  <strong className="text-slate-800">{renderField(v1.date)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Location / Venue:</span>
                  <strong className="text-slate-800">{renderField(v1.location)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Team Members:</span>
                  <strong className="text-slate-800">{renderField(v1.teamMembers)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Participants Engaged:</span>
                  <strong className="text-slate-800">
                    {v1.participantCount !== null ? `${v1.participantCount} persons` : renderField(null)}
                  </strong>
                </div>
              </div>
            )}

            {/* Visit Objective & General Narrative Fields */}
            {editingVisit === 1 ? (
              <div className="space-y-4 text-xs pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Visit Objective</label>
                  <textarea
                    rows={2}
                    value={draftV1.objective}
                    onChange={(e) => setDraftV1({ ...draftV1, objective: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Activities Conducted</label>
                    <textarea
                      rows={3}
                      placeholder="Outline questionnaire administration, interviews, focus discussions..."
                      value={draftV1.activities}
                      onChange={(e) => setDraftV1({ ...draftV1, activities: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">General Findings & Takeaways</label>
                    <textarea
                      rows={3}
                      placeholder="Key conclusions reached during this visit..."
                      value={draftV1.findings}
                      onChange={(e) => setDraftV1({ ...draftV1, findings: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs pt-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Visit Objective:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{renderField(v1.objective)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Activities Conducted:
                    </span>
                    <p className="text-slate-700">{renderField(v1.activities)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      General Findings:
                    </span>
                    <p className="text-slate-700">{renderField(v1.findings)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visit 1 Core Sections: Survey Responses, Skills, Barriers, Employer Needs, Observations */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wider">
                Visit 1 Specific Documentation Areas
              </h3>
              <span className="text-[11px] text-slate-400">Needs Assessment Evidence</span>
            </div>

            {editingVisit === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    1. Survey Responses Summary & Data Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document survey counts, question patterns, or distribution details..."
                    value={draftV1.surveyResponsesNotes}
                    onChange={(e) => setDraftV1({ ...draftV1, surveyResponsesNotes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    2. Existing Skills & Proficiencies Observed
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Technical tools, certifications, languages, or practical skills already possessed by participants..."
                    value={draftV1.existingSkills}
                    onChange={(e) => setDraftV1({ ...draftV1, existingSkills: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    3. Employment & Placement Barriers Identified
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Notice delays, rigid percentage criteria, lack of core drives, transport/location challenges..."
                    value={draftV1.employmentBarriers}
                    onChange={(e) => setDraftV1({ ...draftV1, employmentBarriers: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    4. Local Employer & Industry Needs
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Required CAD tooling, PLC hardware standards, practical interview tasks, local SME demands..."
                    value={draftV1.employerNeeds}
                    onChange={(e) => setDraftV1({ ...draftV1, employerNeeds: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    5. Key Qualitative Observations & Community Context
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Nuanced observations about participant attitudes, unstated needs, or institutional constraints..."
                    value={draftV1.keyObservations}
                    onChange={(e) => setDraftV1({ ...draftV1, keyObservations: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Evidence References (Notebook IDs, Audio Logs, Sheets)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Field Notebook Vol 1 pg 12; Audio Log V1-02"
                    value={draftV1.evidenceReferences}
                    onChange={(e) => setDraftV1({ ...draftV1, evidenceReferences: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Follow-Up Actions (Pre-Visit 2 Tasks)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Draft prototype task scenarios based on identified barriers"
                    value={draftV1.followUpActions}
                    onChange={(e) => setDraftV1({ ...draftV1, followUpActions: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                  <strong className="text-brand-blue font-semibold block text-[11px]">
                    1. Survey Responses Summary:
                  </strong>
                  {renderField(v1.surveyResponsesNotes)}
                </div>

                <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-1">
                  <strong className="text-brand-teal font-semibold block text-[11px]">
                    2. Existing Skills Observed:
                  </strong>
                  {renderField(v1.existingSkills)}
                </div>

                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
                  <strong className="text-rose-800 font-semibold block text-[11px]">
                    3. Employment Barriers Identified:
                  </strong>
                  {renderField(v1.employmentBarriers)}
                </div>

                <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
                  <strong className="text-brand-purple font-semibold block text-[11px]">
                    4. Employer & Industry Needs:
                  </strong>
                  {renderField(v1.employerNeeds)}
                </div>

                <div className="md:col-span-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 font-semibold block text-[11px]">
                    5. Key Qualitative Observations:
                  </strong>
                  {renderField(v1.keyObservations)}
                </div>

                <div className="text-slate-600">
                  <strong className="text-slate-700 block text-[11px]">Evidence References:</strong>
                  {renderField(v1.evidenceReferences)}
                </div>

                <div className="text-slate-600">
                  <strong className="text-slate-700 block text-[11px]">Follow-Up Actions Planned:</strong>
                  {renderField(v1.followUpActions)}
                </div>
              </div>
            )}
          </div>

          {/* Consent-Aware Photographs Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-blue" />
                  <span>Consent-Aware Evidence Photographs ({v1.photos.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Upload verified fieldwork photos with captions and confirmed participant consent. Never upload unconsented imagery.
                </p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setPhotoTargetVisit(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Photo</span>
                </button>
              )}
            </div>

            {v1.photos.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                <span>No evidence photos uploaded for Visit 1 yet. Click "Attach Photo" to upload real consent-verified imagery.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {v1.photos.map((photo) => (
                  <div key={photo.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-2 p-2">
                    <img
                      src={photo.dataUrl}
                      alt={photo.caption}
                      className="w-full h-40 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="p-1 space-y-1 text-xs">
                      <p className="font-semibold text-slate-800 text-[11px] leading-snug">{photo.caption}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            photo.hasConsent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {photo.hasConsent ? 'Consent Confirmed' : 'Consent Pending'}
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => handleDeletePhoto(1, photo.id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {photo.consentNotes && (
                        <p className="text-[10px] text-slate-400 italic">{photo.consentNotes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anonymized Participant Feedback */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-blue" />
                  <span>Anonymized Participant Feedback & Quotes ({v1.anonymizedFeedback.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Direct quotes recorded during interviews. Names are anonymized (e.g. "Participant P1").
                </p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setFeedbackTargetVisit(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Quote</span>
                </button>
              )}
            </div>

            {v1.anonymizedFeedback.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                <span>No participant feedback recorded for Visit 1 yet. Click "Log Quote" to add verified statements.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {v1.anonymizedFeedback.map((fb) => (
                  <div key={fb.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-brand-navy">{fb.participantTag}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                          {fb.category}
                        </span>
                      </div>
                      <p className="text-slate-700 italic pt-1">"{fb.feedbackText}"</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400">
                      <span>{fb.contextOrRole || 'Context not specified'}</span>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteFeedback(1, fb.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISIT 2: PROTOTYPE TESTING TAB */}
      {/* ============================================================== */}
      {activeTab === 'visit2' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-purple uppercase tracking-wider block">
                  Stage 2 Fieldwork
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
                  {v2.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{v2.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Switcher or Badge */}
                {canEdit ? (
                  <select
                    value={v2.status}
                    onChange={(e) => handleQuickStatusChange(2, e.target.value as VisitStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                      v2.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : v2.status === 'In Progress'
                        ? 'bg-purple-50 text-brand-purple border-purple-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="Planned">Status: Planned</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Completed">Status: Completed</option>
                  </select>
                ) : (
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      v2.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : v2.status === 'In Progress'
                        ? 'bg-purple-50 text-brand-purple border-purple-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    Status: {v2.status}
                  </span>
                )}

                {canEdit && (
                  <>
                    <button
                      onClick={() => (editingVisit === 2 ? saveVisit(2) : startEditVisit(2))}
                      className="px-4 py-1.5 rounded-xl bg-brand-purple text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {editingVisit === 2 ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      <span>{editingVisit === 2 ? 'Save Visit 2' : 'Edit Details'}</span>
                    </button>
                    {editingVisit === 2 && (
                      <button
                        onClick={cancelEditVisit}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Core Metadata */}
            {editingVisit === 2 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={draftV2.date}
                    onChange={(e) => setDraftV2({ ...draftV2, date: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Testing Location / Lab</label>
                  <input
                    type="text"
                    placeholder="e.g. Computing Lab 3 / Community Center"
                    value={draftV2.location}
                    onChange={(e) => setDraftV2({ ...draftV2, location: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Test Facilitators</label>
                  <input
                    type="text"
                    placeholder="e.g. Student Research Team"
                    value={draftV2.teamMembers}
                    onChange={(e) => setDraftV2({ ...draftV2, teamMembers: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Testers Engaged</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 18"
                    value={draftV2.participantCount ?? ''}
                    onChange={(e) =>
                      setDraftV2({
                        ...draftV2,
                        participantCount: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">Date of Testing:</span>
                  <strong className="text-slate-800">{renderField(v2.date)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Location / Lab:</span>
                  <strong className="text-slate-800">{renderField(v2.location)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Facilitator Team:</span>
                  <strong className="text-slate-800">{renderField(v2.teamMembers)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Student Testers:</span>
                  <strong className="text-slate-800">
                    {v2.participantCount !== null ? `${v2.participantCount} persons` : renderField(null)}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Participant Tasks Attempted & Completion Status Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wider">
                  Participant Usability Tasks ({v2.prototypeTasks.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tasks attempted by participants, completion success, observed difficulties, and user feedback.
                </p>
              </div>

              {canEdit && (
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-purple text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Usability Task</span>
                </button>
              )}
            </div>

            {v2.prototypeTasks.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400 space-y-2">
                <p>No prototype testing tasks logged yet.</p>
                <p className="text-[11px] text-slate-400">
                  Click "Log Usability Task" to record real participant tasks (e.g., searching vacancies, checking match criteria, enrolling in workshops).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                      <th className="py-2.5 px-3">Task Name</th>
                      <th className="py-2.5 px-3">Target Need</th>
                      <th className="py-2.5 px-3">Attempted</th>
                      <th className="py-2.5 px-3">Completed</th>
                      <th className="py-2.5 px-3">Difficulties Observed</th>
                      <th className="py-2.5 px-3">Participant Comment</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {v2.prototypeTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{t.taskName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{t.targetRoleOrNeed}</td>
                        <td className="py-2.5 px-3 font-semibold">{t.attemptedCount}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.completedCount === t.attemptedCount
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.completedCount} / {t.attemptedCount} ({Math.round((t.completedCount / (t.attemptedCount || 1)) * 100)}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-amber-900">{t.difficultiesObserved}</td>
                        <td className="py-2.5 px-3 text-slate-600 italic">"{t.participantFeedback}"</td>
                        <td className="py-2.5 px-3 text-right">
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Difficulties Observed, Suggestions & Planned Changes */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wider">
              Qualitative Feedback & Iteration Roadmap
            </h3>

            {editingVisit === 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Difficulties Observed Across Tasks
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Confusion over eligibility terms, missing deadline filters, registration flow friction..."
                    value={draftV2.generalDifficultiesObserved}
                    onChange={(e) => setDraftV2({ ...draftV2, generalDifficultiesObserved: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Direct Suggestions Received
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Requested countdown badges, branch matching notes, one-click counseling booking..."
                    value={draftV2.suggestionsReceived}
                    onChange={(e) => setDraftV2({ ...draftV2, suggestionsReceived: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Planned Prototype Changes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Specific design and feature changes to implement prior to Visit 3 evaluation..."
                    value={draftV2.plannedChanges}
                    onChange={(e) => setDraftV2({ ...draftV2, plannedChanges: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1">
                  <strong className="text-rose-800 font-semibold block text-[11px]">
                    Difficulties Observed:
                  </strong>
                  {renderField(v2.generalDifficultiesObserved)}
                </div>

                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                  <strong className="text-brand-blue font-semibold block text-[11px]">
                    Suggestions Received:
                  </strong>
                  {renderField(v2.suggestionsReceived)}
                </div>

                <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
                  <strong className="text-brand-purple font-semibold block text-[11px]">
                    Planned Prototype Changes:
                  </strong>
                  {renderField(v2.plannedChanges)}
                </div>
              </div>
            )}
          </div>

          {/* Consent-Aware Photos & Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photos */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Visit 2 Photographs ({v2.photos.length})</span>
                </h4>
                {canEdit && (
                  <button
                    onClick={() => setPhotoTargetVisit(2)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200 text-slate-700"
                  >
                    Attach
                  </button>
                )}
              </div>

              {v2.photos.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No testing photos uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {v2.photos.map((p) => (
                    <div key={p.id} className="relative group">
                      <img src={p.dataUrl} alt={p.caption} className="w-full h-24 object-cover rounded-xl border" />
                      <div className="text-[10px] text-slate-600 truncate mt-1">{p.caption}</div>
                      {canEdit && (
                        <button
                          onClick={() => handleDeletePhoto(2, p.id)}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md hover:bg-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Visit 2 Quotes ({v2.anonymizedFeedback.length})</span>
                </h4>
                {canEdit && (
                  <button
                    onClick={() => setFeedbackTargetVisit(2)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200 text-slate-700"
                  >
                    Log Quote
                  </button>
                )}
              </div>

              {v2.anonymizedFeedback.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No participant quotes logged for Visit 2.
                </div>
              ) : (
                <div className="space-y-2">
                  {v2.anonymizedFeedback.map((fb) => (
                    <div key={fb.id} className="p-2.5 bg-slate-50 rounded-xl border text-xs">
                      <div className="flex justify-between text-[11px] font-bold text-slate-800">
                        <span>{fb.participantTag}</span>
                        {canEdit && (
                          <button onClick={() => handleDeleteFeedback(2, fb.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 italic">"{fb.feedbackText}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISIT 3: IMPROVED PROTOTYPE EVALUATION TAB */}
      {/* ============================================================== */}
      {activeTab === 'visit3' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-teal uppercase tracking-wider block">
                  Stage 3 Fieldwork
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
                  {v3.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{v3.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Switcher or Badge */}
                {canEdit ? (
                  <select
                    value={v3.status}
                    onChange={(e) => handleQuickStatusChange(3, e.target.value as VisitStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                      v3.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : v3.status === 'In Progress'
                        ? 'bg-teal-50 text-brand-teal border-teal-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="Planned">Status: Planned</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Completed">Status: Completed</option>
                  </select>
                ) : (
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      v3.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : v3.status === 'In Progress'
                        ? 'bg-teal-50 text-brand-teal border-teal-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    Status: {v3.status}
                  </span>
                )}

                {canEdit && (
                  <>
                    <button
                      onClick={() => (editingVisit === 3 ? saveVisit(3) : startEditVisit(3))}
                      className="px-4 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {editingVisit === 3 ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      <span>{editingVisit === 3 ? 'Save Visit 3' : 'Edit Details'}</span>
                    </button>
                    {editingVisit === 3 && (
                      <button
                        onClick={cancelEditVisit}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Core Metadata */}
            {editingVisit === 3 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Evaluation Date</label>
                  <input
                    type="date"
                    value={draftV3.date}
                    onChange={(e) => setDraftV3({ ...draftV3, date: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Evaluation Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Placement Presentation Hall"
                    value={draftV3.location}
                    onChange={(e) => setDraftV3({ ...draftV3, location: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Evaluating Team</label>
                  <input
                    type="text"
                    placeholder="e.g. Student CEP Team & Faculty Mentor"
                    value={draftV3.teamMembers}
                    onChange={(e) => setDraftV3({ ...draftV3, teamMembers: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Participants Re-tested</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20"
                    value={draftV3.participantCount ?? ''}
                    onChange={(e) =>
                      setDraftV3({
                        ...draftV3,
                        participantCount: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">Date of Evaluation:</span>
                  <strong className="text-slate-800">{renderField(v3.date)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Venue:</span>
                  <strong className="text-slate-800">{renderField(v3.location)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Team:</span>
                  <strong className="text-slate-800">{renderField(v3.teamMembers)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Participants Re-tested:</span>
                  <strong className="text-slate-800">
                    {v3.participantCount !== null ? `${v3.participantCount} persons` : renderField(null)}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Visit 3 Specific Fields: Changes Demonstrated, Task Results, Final Feedback, Remaining Issues, Next Steps */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wider">
              Visit 3 Improved Evaluation & Long-Term Outcomes
            </h3>

            {editingVisit === 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    1. Changes Demonstrated to Participants
                  </label>
                  <textarea
                    rows={3}
                    placeholder="List specific interface or workflow enhancements demonstrated based on Visit 2 feedback..."
                    value={draftV3.changesDemonstrated}
                    onChange={(e) => setDraftV3({ ...draftV3, changesDemonstrated: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    2. Participant Task Results Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document completion rate improvement, time-to-task reduction, or errors avoided..."
                    value={draftV3.taskResultsSummary}
                    onChange={(e) => setDraftV3({ ...draftV3, taskResultsSummary: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    3. Final Participant Feedback
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Student reactions to demonstrated changes, perceived usefulness, and overall reaction..."
                    value={draftV3.finalFeedback}
                    onChange={(e) => setDraftV3({ ...draftV3, finalFeedback: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    4. Remaining Issues & Constraints Identified
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Unresolved constraints requiring college policy changes, external employer participation, or staffing..."
                    value={draftV3.remainingIssues}
                    onChange={(e) => setDraftV3({ ...draftV3, remainingIssues: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    5. Next Steps & Long-term Institutional Roadmap
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Subsequent steps, multi-semester evaluation plans, or administrative handoff tasks..."
                    value={draftV3.nextSteps}
                    onChange={(e) => setDraftV3({ ...draftV3, nextSteps: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2 p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-1">
                  <strong className="text-brand-teal font-semibold block text-[11px]">
                    1. Changes Demonstrated:
                  </strong>
                  {renderField(v3.changesDemonstrated)}
                </div>

                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                  <strong className="text-brand-blue font-semibold block text-[11px]">
                    2. Participant Task Results:
                  </strong>
                  {renderField(v3.taskResultsSummary)}
                </div>

                <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
                  <strong className="text-brand-purple font-semibold block text-[11px]">
                    3. Final Feedback:
                  </strong>
                  {renderField(v3.finalFeedback)}
                </div>

                <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1">
                  <strong className="text-amber-800 font-semibold block text-[11px]">
                    4. Remaining Issues & Constraints:
                  </strong>
                  {renderField(v3.remainingIssues)}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <strong className="text-slate-800 font-semibold block text-[11px]">
                    5. Next Steps:
                  </strong>
                  {renderField(v3.nextSteps)}
                </div>
              </div>
            )}
          </div>

          {/* Consent-Aware Photos & Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photos */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Visit 3 Photographs ({v3.photos.length})</span>
                </h4>
                {canEdit && (
                  <button
                    onClick={() => setPhotoTargetVisit(3)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200 text-slate-700"
                  >
                    Attach
                  </button>
                )}
              </div>

              {v3.photos.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No evaluation photos uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {v3.photos.map((p) => (
                    <div key={p.id} className="relative group">
                      <img src={p.dataUrl} alt={p.caption} className="w-full h-24 object-cover rounded-xl border" />
                      <div className="text-[10px] text-slate-600 truncate mt-1">{p.caption}</div>
                      {canEdit && (
                        <button
                          onClick={() => handleDeletePhoto(3, p.id)}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md hover:bg-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Visit 3 Quotes ({v3.anonymizedFeedback.length})</span>
                </h4>
                {canEdit && (
                  <button
                    onClick={() => setFeedbackTargetVisit(3)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200 text-slate-700"
                  >
                    Log Quote
                  </button>
                )}
              </div>

              {v3.anonymizedFeedback.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No participant quotes logged for Visit 3.
                </div>
              ) : (
                <div className="space-y-2">
                  {v3.anonymizedFeedback.map((fb) => (
                    <div key={fb.id} className="p-2.5 bg-slate-50 rounded-xl border text-xs">
                      <div className="flex justify-between text-[11px] font-bold text-slate-800">
                        <span>{fb.participantTag}</span>
                        {canEdit && (
                          <button onClick={() => handleDeleteFeedback(3, fb.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 italic">"{fb.feedbackText}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TRACEABILITY TABLE TAB */}
      {/* ============================================================== */}
      {activeTab === 'traceability' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-brand-navy uppercase tracking-wider block">
                  Design Traceability
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
                  Community Need → Feature → Feedback → Evidence → Action
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  Establishes bidirectional accountability linking community-identified hurdles to concrete portal features,
                  participant verification feedback, audit references, and planned next steps.
                </p>
              </div>

              {canEdit && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleLoadSampleTraceability}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    title="Load illustrative template rows for reference"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                    <span>Load Sample Guidance</span>
                  </button>

                  <button
                    onClick={() => setShowAddTraceRow(true)}
                    className="px-4 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Traceability Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add Row Modal / Drawer */}
            {showAddTraceRow && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Add New Traceability Link
                  </h4>
                  <button onClick={() => setShowAddTraceRow(false)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      1. Community Need / Hurdle Identified
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lack of hands-on Docker & Kubernetes testing drives for CS/IT"
                      value={newTraceNeed}
                      onChange={(e) => setNewTraceNeed(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      2. Portal Feature / Prototype Change
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dedicated employer outreach pipeline & CAD clinic module"
                      value={newTraceFeature}
                      onChange={(e) => setNewTraceFeature(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      3. Participant Verification Feedback
                    </label>
                    <input
                      type="text"
                      placeholder='e.g. "Practical workshop gave hands-on SolidWorks practice"'
                      value={newTraceFeedback}
                      onChange={(e) => setNewTraceFeedback(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      4. Evidence Reference (Visit #, Log, Photo ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Visit 1 Survey Item 8; Visit 2 Task Log T-03"
                      value={newTraceEvidence}
                      onChange={(e) => setNewTraceEvidence(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      5. Next Action Planned
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Institutionalize bi-weekly lab workshops with external design mentor"
                      value={newTraceAction}
                      onChange={(e) => setNewTraceAction(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAddTraceRow(false)}
                    className="px-3 py-1 rounded text-xs text-slate-600 border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTraceRow}
                    className="px-4 py-1 rounded bg-brand-navy text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Save Link
                  </button>
                </div>
              </div>
            )}

            {/* Traceability Table */}
            {communityVisits.traceability.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400 space-y-2">
                <p>No traceability records entered yet.</p>
                <p className="text-[11px] text-slate-400">
                  Click "Add Traceability Link" to document verified links, or click "Load Sample Guidance" to inspect reference examples.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Community Need</th>
                      <th className="py-2.5 px-3">Feature / Change</th>
                      <th className="py-2.5 px-3">Participant Feedback</th>
                      <th className="py-2.5 px-3">Evidence Reference</th>
                      <th className="py-2.5 px-3">Next Action</th>
                      {canEdit && <th className="py-2.5 px-3 text-right">Delete</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {communityVisits.traceability.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-brand-navy">{item.id}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[180px]">{item.communityNeed}</td>
                        <td className="py-2.5 px-3 text-brand-teal max-w-[180px]">{item.featureOrChange}</td>
                        <td className="py-2.5 px-3 text-slate-600 italic max-w-[200px]">{item.participantFeedback}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.evidenceReference}</td>
                        <td className="py-2.5 px-3 text-slate-800 max-w-[180px]">{item.nextAction}</td>
                        {canEdit && (
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteTraceRow(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Delete link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FULL PRINTABLE REPORT TAB */}
      {/* ============================================================== */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
            <div>
              <span className="text-xs font-bold text-brand-teal uppercase tracking-wider block">
                Official Project Record
              </span>
              <h2 className="text-2xl font-bold text-brand-navy">
                Community Engagement Project — Three Community Visits Documentation Report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Generated from verified local browser repository records.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-2 self-start no-print"
            >
              <Printer className="w-4 h-4" />
              <span>Print Clean Report</span>
            </button>
          </div>

          {/* Visit 1 Section in Report */}
          <section className="space-y-3 border-b pb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-brand-navy">
                1. Visit 1 — Needs Assessment ({v1.status})
              </h3>
              <span className="text-xs text-slate-500">Date: {v1.date || 'Not recorded'} | Venue: {v1.location || 'Not recorded'}</span>
            </div>
            <div className="text-xs space-y-2 text-slate-700">
              <p><strong>Objective:</strong> {renderField(v1.objective)}</p>
              <p><strong>Team & Attendees:</strong> {renderField(v1.teamMembers)} | Participant Count: {v1.participantCount !== null ? v1.participantCount : 'Not recorded'}</p>
              <p><strong>Activities:</strong> {renderField(v1.activities)}</p>
              <p><strong>Survey Responses:</strong> {renderField(v1.surveyResponsesNotes)}</p>
              <p><strong>Existing Skills:</strong> {renderField(v1.existingSkills)}</p>
              <p><strong>Employment Barriers:</strong> {renderField(v1.employmentBarriers)}</p>
              <p><strong>Employer Needs:</strong> {renderField(v1.employerNeeds)}</p>
              <p><strong>Key Observations:</strong> {renderField(v1.keyObservations)}</p>
              <p><strong>Evidence References:</strong> {renderField(v1.evidenceReferences)}</p>
              <p><strong>Follow-Up Actions:</strong> {renderField(v1.followUpActions)}</p>
            </div>
          </section>

          {/* Visit 2 Section in Report */}
          <section className="space-y-3 border-b pb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-brand-navy">
                2. Visit 2 — Prototype Testing ({v2.status})
              </h3>
              <span className="text-xs text-slate-500">Date: {v2.date || 'Not recorded'} | Lab: {v2.location || 'Not recorded'}</span>
            </div>
            <div className="text-xs space-y-2 text-slate-700">
              <p><strong>Objective:</strong> {renderField(v2.objective)}</p>
              <p><strong>Participant Count:</strong> {v2.participantCount !== null ? v2.participantCount : 'Not recorded'}</p>
              <p><strong>Difficulties Observed:</strong> {renderField(v2.generalDifficultiesObserved)}</p>
              <p><strong>Suggestions Received:</strong> {renderField(v2.suggestionsReceived)}</p>
              <p><strong>Planned Changes:</strong> {renderField(v2.plannedChanges)}</p>
              {v2.prototypeTasks.length > 0 && (
                <div className="pt-2">
                  <strong className="block mb-1">Usability Task Results:</strong>
                  <ul className="list-disc pl-5 space-y-1">
                    {v2.prototypeTasks.map((t) => (
                      <li key={t.id}>
                        <strong>{t.taskName}:</strong> {t.completedCount} of {t.attemptedCount} completed. Difficulties: {t.difficultiesObserved}.
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Visit 3 Section in Report */}
          <section className="space-y-3 border-b pb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-brand-navy">
                3. Visit 3 — Improved Prototype Evaluation ({v3.status})
              </h3>
              <span className="text-xs text-slate-500">Date: {v3.date || 'Not recorded'} | Location: {v3.location || 'Not recorded'}</span>
            </div>
            <div className="text-xs space-y-2 text-slate-700">
              <p><strong>Changes Demonstrated:</strong> {renderField(v3.changesDemonstrated)}</p>
              <p><strong>Participant Task Results:</strong> {renderField(v3.taskResultsSummary)}</p>
              <p><strong>Final Feedback:</strong> {renderField(v3.finalFeedback)}</p>
              <p><strong>Remaining Issues:</strong> {renderField(v3.remainingIssues)}</p>
              <p><strong>Next Steps:</strong> {renderField(v3.nextSteps)}</p>
            </div>
          </section>

          {/* Traceability Table in Report */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-brand-navy">
              4. Bidirectional Traceability Matrix
            </h3>
            {communityVisits.traceability.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No traceability links entered.</p>
            ) : (
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="p-2 border-r">Need</th>
                    <th className="p-2 border-r">Feature / Change</th>
                    <th className="p-2 border-r">Feedback</th>
                    <th className="p-2 border-r">Evidence</th>
                    <th className="p-2">Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {communityVisits.traceability.map((tr) => (
                    <tr key={tr.id} className="border-b border-slate-200">
                      <td className="p-2 border-r">{tr.communityNeed}</td>
                      <td className="p-2 border-r">{tr.featureOrChange}</td>
                      <td className="p-2 border-r italic">"{tr.participantFeedback}"</td>
                      <td className="p-2 border-r">{tr.evidenceReference}</td>
                      <td className="p-2">{tr.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {/* ============================================================== */}
      {/* ILLUSTRATIVE INTERVIEW GUIDE (15 Qs) */}
      {/* ============================================================== */}
      {activeTab === 'illustrative' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3 text-xs text-purple-950">
            <Info className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Placement Coordinator Interview Protocol:</strong>
              <p className="leading-relaxed">
                Structured 15-question qualitative dialogue conducted with departmental placement coordinators, examining operational constraints, notice latency, employer outreach mechanisms, and student skill readiness.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {studyData.interviewGuide.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-brand-purple font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {item.id}
                  </span>
                  <h4 className="font-bold text-brand-navy">{item.question}</h4>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider block">
                    Illustrative interview response:
                  </span>
                  <p className="text-slate-700">{item.illustrativeAnswer}</p>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  Evidence note: {item.evidenceNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PHOTO UPLOAD WITH INFORMED CONSENT */}
      {/* ============================================================== */}
      {photoTargetVisit !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-blue" />
                <span>Attach Evidence Photograph to Visit {photoTargetVisit}</span>
              </h3>
              <button onClick={() => setPhotoTargetVisit(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Image File (PNG, JPG, max 4MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="w-full text-xs p-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              {newPhotoDataUrl && (
                <div className="relative">
                  <img
                    src={newPhotoDataUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl border"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                    Photo Preview
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Descriptive Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Student participants reviewing job search interface during testing"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Explicit Informed Consent Checkbox */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                <label className="flex items-start gap-2 cursor-pointer text-teal-950 font-medium text-xs">
                  <input
                    type="checkbox"
                    checked={newPhotoConsent}
                    onChange={(e) => setNewPhotoConsent(e.target.checked)}
                    className="mt-0.5 rounded border-teal-400 text-brand-teal focus:ring-brand-teal"
                  />
                  <span>
                    <strong>Informed Consent Confirmed:</strong> Participants depicted have explicitly consented to photography for academic project reporting.
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Optional consent reference (e.g. Written form #14 on file)"
                  value={newPhotoConsentNotes}
                  onChange={(e) => setNewPhotoConsentNotes(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-teal-300 bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setPhotoTargetVisit(null)}
                className="px-4 py-1.5 rounded-lg border text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePhoto}
                className="px-5 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600"
              >
                Attach Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: LOG ANONYMIZED PARTICIPANT FEEDBACK */}
      {/* ============================================================== */}
      {feedbackTargetVisit !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-blue" />
                <span>Log Anonymized Participant Quote — Visit {feedbackTargetVisit}</span>
              </h3>
              <button onClick={() => setFeedbackTargetVisit(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Participant Anonymized Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Participant P1, Community Youth A"
                    value={newFbTag}
                    onChange={(e) => setNewFbTag(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Feedback Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Navigation, Eligibility, Training"
                    value={newFbCategory}
                    onChange={(e) => setNewFbCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Participant Quote / Feedback Statement
                </label>
                <textarea
                  rows={3}
                  placeholder="Record direct verbal feedback without personal identifiers..."
                  value={newFbText}
                  onChange={(e) => setNewFbText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Context / Participant Discipline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Final year Data Science (DS) student seeking Machine Learning & AI internships"
                  value={newFbContext}
                  onChange={(e) => setNewFbContext(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setFeedbackTargetVisit(null)}
                className="px-4 py-1.5 rounded-lg border text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeedback}
                className="px-5 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600"
              >
                Save Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: LOG PROTOTYPE USABILITY TASK (VISIT 2) */}
      {/* ============================================================== */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-brand-navy text-sm">
                Log Prototype Usability Task (Visit 2)
              </h3>
              <button onClick={() => setShowAddTaskModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Task Name / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Filter vacancies by branch and check eligibility terms"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Need / User Journey
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discovery of core engineering roles"
                  value={newTaskTarget}
                  onChange={(e) => setNewTaskTarget(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Participants Attempted
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTaskAttempted}
                    onChange={(e) => setNewTaskAttempted(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Participants Completed
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={newTaskAttempted}
                    value={newTaskCompleted}
                    onChange={(e) => setNewTaskCompleted(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Difficulties Observed
                </label>
                <input
                  type="text"
                  placeholder="e.g. Participants overlooked the work-mode filter"
                  value={newTaskDifficulties}
                  onChange={(e) => setNewTaskDifficulties(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Participant Verbal Feedback
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Wanted to see the registration deadline highlighted in red"'
                  value={newTaskFeedback}
                  onChange={(e) => setNewTaskFeedback(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-1.5 rounded-lg border text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTask}
                className="px-5 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-semibold hover:bg-purple-700"
              >
                Save Task Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
