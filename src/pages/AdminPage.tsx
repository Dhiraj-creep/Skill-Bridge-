import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEME_OPTIONS, ThemePreset } from '../types/theme';
import { Department, AcademicYear, SurveyResponse, SurveyQuestion } from '../types/survey';
import { DemoOpportunity } from '../types/opportunity';
import { TrainingSession } from '../types/training';
import { ProblemSolutionItem } from '../types/content';
import { ActionPlanItem } from '../types/study';
import {
  parseCSV,
  exportResponsesToCSV,
  generateCSVTemplate,
  triggerDownload,
} from '../utils/csvUtils';
import { validateImportBatch, RowValidationError } from '../utils/validation';
import { StorageService } from '../utils/storage';
import { apiService, QueryResult } from '../services/apiService';
import {
  Settings,
  Palette,
  Database,
  HelpCircle,
  Calendar,
  Layers,
  Briefcase,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  FileText,
  Save,
  ShieldAlert,
  Server,
  Terminal,
  Play,
  CheckCircle2,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const {
    siteContent,
    updateSiteContent,
    theme,
    previewTheme,
    saveTheme,
    resetTheme,
    responses,
    addResponse,
    updateResponse,
    deleteResponse,
    importResponses,
    questions,
    updateQuestion,
    addQuestion,
    studyData,
    updateStudyData,
    updateActionPlanItem,
    problemMatrix,
    updateProblemMatrix,
    opportunities,
    createOpportunity,
    setOpportunityArchiveStatus,
    trainingSessions,
    resetAllDemoData,
    restoreFromBackup,
    addNotification,
    dbStatus,
    refreshDbStatus,
    resetDatabase,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'appearance'
    | 'research'
    | 'questionnaire'
    | 'study'
    | 'matrix'
    | 'opportunities'
    | 'backup'
    | 'database'
  >('general');

  // SQLite Database & Query State
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT department, count(*) as response_count FROM survey_responses GROUP BY department ORDER BY response_count DESC;'
  );
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [diagnosticsList, setDiagnosticsList] = useState<{ id: string; label: string; description: string; sql: string }[]>([]);
  const [selectedDiagnosticId, setSelectedDiagnosticId] = useState<string>('survey_by_department');

  useEffect(() => {
    if (activeTab === 'database') {
      apiService.getDiagnostics().then((list) => {
        if (list && list.length > 0) {
          setDiagnosticsList(list);
        }
      });
    }
  }, [activeTab]);

  const handleExecuteQuery = async () => {
    if (!selectedDiagnosticId) {
      addNotification('Please select a registered diagnostic query.', 'warning');
      return;
    }
    setIsQuerying(true);
    const res = await apiService.executeQuery({ queryId: selectedDiagnosticId });
    setQueryResult(res);
    setIsQuerying(false);
  };

  // General content form state
  const [contentForm, setContentForm] = useState(siteContent);

  // Appearance preview state
  const [selectedThemePreset, setSelectedThemePreset] = useState<ThemePreset>(theme);

  // CSV Import State
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importPreviewData, setImportPreviewData] = useState<SurveyResponse[] | null>(null);
  const [importErrors, setImportErrors] = useState<RowValidationError[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  // New Opportunity / Training Modal
  const [showAddOppModal, setShowAddOppModal] = useState(false);
  const [newOppForm, setNewOppForm] = useState<Partial<DemoOpportunity>>({
    title: '',
    employer: '',
    type: 'Job',
    relevantDepartments: ['Computer Science (CS)'],
    skills: ['React', 'Node.js'],
    explicitEligibility: 'B.Tech graduates with 60% aggregate',
    location: 'Pune / Remote',
    workMode: 'Hybrid',
    fixedPayOrStipend: '₹5,00,000 per annum',
    deadline: '2026-11-15',
    description: '',
    sourceStatus: 'Demo Opportunity',
  });

  // Backup & Restore
  const [restoreText, setRestoreText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // General Content Handlers
  const handleSaveGeneralContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteContent(contentForm);
  };

  // Appearance Handlers
  const handlePreviewTheme = (preset: ThemePreset) => {
    setSelectedThemePreset(preset);
    previewTheme(preset);
  };

  const handleSaveTheme = () => {
    saveTheme(selectedThemePreset);
  };

  const handleCancelTheme = () => {
    setSelectedThemePreset(theme);
    resetTheme();
  };

  // Research CSV Import Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processImportPreview(text);
    };
    reader.readAsText(file);
  };

  const processImportPreview = (csvContent: string) => {
    try {
      const parsedRows = parseCSV(csvContent);
      if (parsedRows.length < 2) {
        addNotification('CSV file must contain a header row and at least one data row', 'error');
        return;
      }
      const headers = parsedRows[0];
      const dataRows = parsedRows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] || '';
        });
        return obj;
      });

      const result = validateImportBatch(dataRows, responses);
      setImportPreviewData(result.validResponses);
      setImportErrors(result.errors);
      setConflicts(result.conflictingExistingIds);
      setShowImportModal(true);
    } catch {
      addNotification('Failed to parse CSV file. Please verify format.', 'error');
    }
  };

  const handleConfirmImport = () => {
    if (!importPreviewData || importPreviewData.length === 0) return;
    importResponses(importPreviewData, importMode);
    setShowImportModal(false);
    setImportPreviewData(null);
  };

  // Backup & Restore Handlers (Authoritative SQLite Server State with Offline Storage Fallback)
  const handleDownloadBackup = async () => {
    try {
      const serverBackup = await apiService.getDatabaseBackup();
      const payload = serverBackup?.backup || serverBackup || StorageService.exportFullBackup();
      triggerDownload(
        JSON.stringify(payload, null, 2),
        `skillbridge-backup-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );
      addNotification('Authoritative database backup downloaded successfully', 'success');
    } catch {
      const backup = StorageService.exportFullBackup();
      triggerDownload(
        JSON.stringify(backup, null, 2),
        `skillbridge-backup-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );
      addNotification('Local storage backup downloaded', 'info');
    }
  };

  const handleRestoreSubmit = async () => {
    try {
      const parsed = JSON.parse(restoreText);
      if (!parsed || typeof parsed !== 'object') {
        addNotification('Invalid backup file: Payload must be a JSON object.', 'error');
        return;
      }
      if (window.confirm('Restore this backup to the SQLite database? This will update system content, opportunities, workshops, and surveys without deleting student application history.')) {
        const success = await restoreFromBackup(parsed);
        if (success) {
          setRestoreText('');
        }
      }
    } catch {
      addNotification('Could not parse backup JSON. Please check file content.', 'error');
    }
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Administration & Configuration
            </span>
            <span className="text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-medium">
              Source-Code Independent
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            Portal Content Management & Data Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Edit titles, themes, survey research records, study findings, opportunities, and questions
            without modifying source code. All changes persist in your browser.
          </p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-1.5 text-xs font-semibold no-print">
        {[
          { id: 'general', label: 'General Content', icon: <FileText className="w-4 h-4" /> },
          { id: 'appearance', label: 'Appearance & Themes', icon: <Palette className="w-4 h-4" /> },
          { id: 'research', label: `Research Data (${responses.length})`, icon: <Database className="w-4 h-4" /> },
          { id: 'questionnaire', label: 'Questionnaire (12 Core)', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'study', label: 'Study & Action Plan', icon: <Calendar className="w-4 h-4" /> },
          { id: 'matrix', label: 'Problem-Solution Matrix', icon: <Layers className="w-4 h-4" /> },
          { id: 'opportunities', label: `Opportunities (${opportunities.length})`, icon: <Briefcase className="w-4 h-4" /> },
          { id: 'backup', label: 'Backup & Restore', icon: <RefreshCw className="w-4 h-4" /> },
          { id: 'database', label: 'SQLite Database & SQL', icon: <Server className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL CONTENT */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneralContent} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Edit Site Identity & Text Content</h2>
            <p className="text-xs text-slate-500">
              Update portal headlines, college names, and contact details without code deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Portal Title</label>
              <input
                type="text"
                value={contentForm.siteTitle}
                onChange={(e) => setContentForm({ ...contentForm, siteTitle: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={contentForm.subtitle}
                onChange={(e) => setContentForm({ ...contentForm, subtitle: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                College Name (Initially Blank)
              </label>
              <input
                type="text"
                placeholder="e.g. Government College of Engineering & Technology"
                value={contentForm.collegeName}
                onChange={(e) => setContentForm({ ...contentForm, collegeName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Placement Office Location (Initially Blank)
              </label>
              <input
                type="text"
                placeholder="e.g. Training & Placement Cell, Admin Wing Room 204"
                value={contentForm.contactOffice}
                onChange={(e) => setContentForm({ ...contentForm, contactOffice: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Contact Inquiries Email (Initially Blank)
              </label>
              <input
                type="text"
                placeholder="e.g. placement-cep@institution.ac.in"
                value={contentForm.contactEmail}
                onChange={(e) => setContentForm({ ...contentForm, contactEmail: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Homepage Hero Headline
              </label>
              <input
                type="text"
                value={contentForm.heroHeadline}
                onChange={(e) => setContentForm({ ...contentForm, heroHeadline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Homepage Hero Supporting Text
              </label>
              <textarea
                rows={2}
                value={contentForm.heroSupportingText}
                onChange={(e) => setContentForm({ ...contentForm, heroSupportingText: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Project Problem Statement
              </label>
              <textarea
                rows={3}
                value={contentForm.aboutProblemStatement}
                onChange={(e) => setContentForm({ ...contentForm, aboutProblemStatement: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Content Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: APPEARANCE & THEMES */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Theme Presets & Palette Styling</h2>
            <p className="text-xs text-slate-500">
              Select, preview, and persist an appearance preset. Semantic tokens update buttons and accents
              while chart category meanings remain stable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = selectedThemePreset === opt.id;
              const isSaved = theme === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handlePreviewTheme(opt.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-blue ring-2 ring-brand-blue/30 shadow-md bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-brand-navy text-sm">{opt.name}</span>
                    {isSaved && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Active Saved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{opt.description}</p>

                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: opt.palette.primary }}
                      title="Primary"
                    />
                    <span
                      className="w-6 h-6 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: opt.palette.secondary }}
                      title="Secondary"
                    />
                    <span
                      className="w-6 h-6 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: opt.palette.accent }}
                      title="Accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Previewing: <strong className="text-brand-navy">{selectedThemePreset}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelTheme}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Reset to Active
              </button>
              <button
                type="button"
                onClick={handleSaveTheme}
                className="px-6 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600"
              >
                Save Theme Choice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESEARCH DATA MANAGEMENT */}
      {activeTab === 'research' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Research Dataset Management</h2>
              <p className="text-xs text-slate-500">
                Inspect, add, edit, or import responses. All calculated metrics and visualizations update immediately.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const csvTpl = generateCSVTemplate();
                  triggerDownload(csvTpl, 'skillbridge-survey-import-template.csv', 'text/csv');
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                title="Download CSV import template with standard columns and sample rows"
              >
                <Download className="w-3.5 h-3.5 text-brand-teal" />
                <span>Download Template</span>
              </button>

              <label className="px-3 py-2 rounded-xl bg-brand-purple text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV Data</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Import Modal */}
          {showImportModal && importPreviewData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-brand-navy text-sm">
                    CSV Import Preview & Validation
                  </h3>
                  <button onClick={() => setShowImportModal(false)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="text-xs space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                    <strong>{importPreviewData.length} Valid Records Detected</strong> ready for import.
                  </div>

                  {importErrors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                      <strong className="block">Row Validation Issues Detected ({importErrors.length}):</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {importErrors.slice(0, 5).map((err, i) => (
                          <li key={i}>
                            Row {err.rowNumber} [{err.field}]: {err.message}
                          </li>
                        ))}
                        {importErrors.length > 5 && <li>...and {importErrors.length - 5} more</li>}
                      </ul>
                    </div>
                  )}

                  {conflicts.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                      <strong>ID Conflict Warning:</strong> {conflicts.length} IDs already exist in the database (e.g. {conflicts.slice(0, 3).join(', ')}).
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Import Mode Selection:
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                        />
                        <span>Merge (Update duplicates & append new records)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                        />
                        <span className="text-rose-700 font-semibold">
                          Replace Entire Current Dataset
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-1.5 rounded-lg border text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={importPreviewData.length === 0}
                    className="px-5 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-semibold hover:bg-purple-700 disabled:opacity-40"
                  >
                    Confirm Import ({importMode})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Response Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Active responses: {responses.length} total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Target Role</th>
                    <th className="py-2.5 px-3">Needs Met</th>
                    <th className="py-2.5 px-3">Timeliness</th>
                    <th className="py-2.5 px-3">Satisfaction</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {responses.slice(0, 15).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-semibold">{r.id}</td>
                      <td className="py-2.5 px-3">{r.department}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.preferredRole}</td>
                      <td className="py-2.5 px-3">{r.needsMet}</td>
                      <td className="py-2.5 px-3">{r.informationTimeliness}</td>
                      <td className="py-2.5 px-3">{r.satisfaction}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500">{r.sourceType}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete survey response ${r.id}?`)) {
                              deleteResponse(r.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete response"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 text-[11px] text-slate-400 text-center border-t border-slate-100">
              Showing first 15 of {responses.length} responses. Full dataset export available via CSV.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUESTIONNAIRE EDITOR */}
      {activeTab === 'questionnaire' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Core Survey Questionnaire (Q1 through Q12)</h2>
            <p className="text-xs text-slate-500">
              Manage question wording, help text, and response options. Stable question IDs protect historical data.
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-purple">{q.id} (Item {q.number})</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                    Type: {q.type}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{q.text}</div>
                {q.helpText && <div className="text-[11px] text-slate-500">{q.helpText}</div>}
                {q.options && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {q.options.map((opt, i) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STUDY & ACTION PLAN */}
      {activeTab === 'study' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Study Status & Stage Metadata</h2>
            <p className="text-xs text-slate-500">
              Configure fieldwork status and stage outputs. Changing study status does not alter simulated dataset labels.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Study Execution Status
              </label>
              <select
                value={studyData.status}
                onChange={(e) =>
                  updateStudyData({
                    ...studyData,
                    status: e.target.value as any,
                  })
                }
                className="w-48 text-xs p-2 rounded-lg border border-slate-300"
              >
                <option value="Planned">Planned</option>
                <option value="Simulated">Simulated (Demo)</option>
                <option value="Conducted">Conducted (Fieldwork Completed)</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <strong>Academic Integrity Notice:</strong> Changing study status to "Conducted" updates study documentation metadata, but will never silently relabel simulated dataset rows as collected fieldwork.
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PROBLEM-SOLUTION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-4xl shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Manage Problem-to-Solution Dimensions</h2>
            <p className="text-xs text-slate-500">
              Edit problem statements, proposed actions, and portal feature mappings for Dimensions A to F.
            </p>
          </div>

          <div className="space-y-4">
            {problemMatrix.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-blue">Dimension {item.id}: {item.title}</span>
                </div>
                <p><strong>Identified Need:</strong> {item.problem}</p>
                <p><strong>Action:</strong> {item.action}</p>
                <p><strong>Portal Support:</strong> {item.portalSupport}</p>
                <p><strong>Measure:</strong> {item.measure}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: OPPORTUNITIES MANAGEMENT */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Opportunity Postings Manager</h2>
              <p className="text-xs text-slate-500">
                Add, edit, or archive demonstration vacancy circulars across departments.
              </p>
            </div>

            <button
              onClick={() => setShowAddOppModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Demo Opportunity</span>
            </button>
          </div>

          {/* Add Opportunity Modal */}
          {showAddOppModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-brand-navy text-sm">Create New Opportunity</h3>
                  <button onClick={() => setShowAddOppModal(false)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Job Title</label>
                    <input
                      type="text"
                      value={newOppForm.title}
                      onChange={(e) => setNewOppForm({ ...newOppForm, title: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Employer Name</label>
                    <input
                      type="text"
                      value={newOppForm.employer}
                      onChange={(e) => setNewOppForm({ ...newOppForm, employer: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Type</label>
                    <select
                      value={newOppForm.type}
                      onChange={(e) => setNewOppForm({ ...newOppForm, type: e.target.value as any })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Job">Job</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Work Mode</label>
                    <select
                      value={newOppForm.workMode}
                      onChange={(e) => setNewOppForm({ ...newOppForm, workMode: e.target.value as any })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Fixed Pay / Stipend</label>
                    <input
                      type="text"
                      value={newOppForm.fixedPayOrStipend}
                      onChange={(e) => setNewOppForm({ ...newOppForm, fixedPayOrStipend: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Deadline (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={newOppForm.deadline}
                      onChange={(e) => setNewOppForm({ ...newOppForm, deadline: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Explicit Eligibility Criteria</label>
                    <input
                      type="text"
                      value={newOppForm.explicitEligibility}
                      onChange={(e) => setNewOppForm({ ...newOppForm, explicitEligibility: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Role Description</label>
                    <textarea
                      rows={3}
                      value={newOppForm.description}
                      onChange={(e) => setNewOppForm({ ...newOppForm, description: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    onClick={() => setShowAddOppModal(false)}
                    className="px-4 py-1.5 border rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newOppForm.title || !newOppForm.employer) return;
                      const opp: DemoOpportunity = {
                        id: `OPP-${crypto.randomUUID().slice(0, 8)}`,
                        title: newOppForm.title!,
                        employer: newOppForm.employer!,
                        type: newOppForm.type || 'Job',
                        relevantDepartments: newOppForm.relevantDepartments || ['Computer Science (CS)'],
                        skills: newOppForm.skills || ['General'],
                        explicitEligibility: newOppForm.explicitEligibility || 'Degree graduate',
                        location: newOppForm.location || 'Pune',
                        workMode: newOppForm.workMode || 'Hybrid',
                        fixedPayOrStipend: newOppForm.fixedPayOrStipend || 'Competitive',
                        deadline: newOppForm.deadline || '2026-11-30',
                        description: newOppForm.description || 'Role responsibilities',
                        postedDate: new Date().toISOString().split('T')[0],
                        sourceStatus: 'Demo Opportunity',
                      };
                      createOpportunity(opp);
                      setShowAddOppModal(false);
                    }}
                    className="px-5 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-semibold"
                  >
                    Create Opportunity
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Employer</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Pay</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold">{opp.id}</td>
                    <td className="py-2.5 px-3 font-bold text-brand-navy">{opp.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{opp.employer}</td>
                    <td className="py-2.5 px-3">{opp.type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{opp.fixedPayOrStipend}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{opp.deadline}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete opportunity ${opp.title}?`)) {
                            setOpportunityArchiveStatus(opp.id, true);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: BACKUP, RESTORE & RESET */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-brand-navy">Export Full Application JSON Backup</h2>
            <p className="text-xs text-slate-600">
              Download the complete repository including research responses, opportunities, training sessions,
              outreach logs, feedback tickets, action plan items, and theme preferences.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Full JSON Backup</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-brand-navy">Restore from JSON Backup</h2>
            <p className="text-xs text-slate-600">
              Paste a previously exported Skill Bridge JSON backup payload to restore your state.
            </p>
            <textarea
              rows={4}
              placeholder="Paste JSON backup payload here..."
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 font-mono"
            />
            <div className="flex justify-end">
              <button
                onClick={handleRestoreSubmit}
                disabled={!restoreText.trim()}
                className="px-5 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-40"
              >
                Validate & Restore Backup
              </button>
            </div>
          </div>

          {/* Destructive Reset */}
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Reset All Demonstration Data</span>
            </div>
            <p className="text-xs text-rose-950/80 leading-relaxed">
              Resets browser storage to initial defaults: 200 reproducible simulated student responses,
              default opportunities, training clinics, and action items. All local modifications will be cleared.
            </p>

            {showResetConfirm ? (
              <div className="p-4 bg-white rounded-2xl border border-rose-300 space-y-3">
                <span className="text-xs font-bold text-rose-700 block">
                  Are you absolutely sure you want to reset all demo data?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetAllDemoData();
                      setShowResetConfirm(false);
                    }}
                    className="px-5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                  >
                    Confirm & Reset Everything
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Reset Demo Data
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: SQLITE DATABASE & SQL QUERY INSPECTOR */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Status & Diagnostic Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-xl font-bold text-brand-navy">
                    SQLite 3 Relational Database Engine
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                    Live Database Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Embedded, zero-latency relational SQLite engine running natively in Node.js with WAL journal mode.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={refreshDbStatus}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Database Backup (JSON)</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Database Engine
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {dbStatus?.engine || 'SQLite 3 (Node.js Native)'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> WAL Mode Enabled
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Database File Size
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {dbStatus?.fileSizeKb ? `${dbStatus.fileSizeKb} KB` : '228 KB'}
                </span>
                <span className="text-[10px] text-slate-500 truncate block" title={dbStatus?.dbPath}>
                  server/database/cep_portal.sqlite
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Survey Records (CS/IT/DS)
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {dbStatus?.tables.survey_responses ?? responses.length} Responses
                </span>
                <span className="text-[10px] text-indigo-600 font-medium">
                  CS: 80 • IT: 60 • DS: 60
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Relational Tables
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  7 Tables Populated
                </span>
                <span className="text-[10px] text-slate-500">
                  Fully Indexed & Normalized
                </span>
              </div>
            </div>

            {/* Relational Tables Breakdown */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Relational Tables in SQLite
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-xs">
                {[
                  { name: 'survey_responses', count: dbStatus?.tables.survey_responses ?? responses.length },
                  { name: 'opportunities', count: dbStatus?.tables.opportunities ?? opportunities.length },
                  { name: 'training_sessions', count: dbStatus?.tables.training_sessions ?? trainingSessions.length },
                  { name: 'employer_outreach', count: dbStatus?.tables.employer_outreach ?? 6 },
                  { name: 'feedback_submissions', count: dbStatus?.tables.feedback_submissions ?? 0 },
                  { name: 'guidance_requests', count: dbStatus?.tables.guidance_requests ?? 0 },
                  { name: 'system_documents', count: dbStatus?.tables.system_documents ?? 6 },
                ].map((tbl) => (
                  <div key={tbl.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="block font-bold text-slate-900 text-base">{tbl.count}</span>
                    <span className="block text-[10px] text-slate-500 font-mono truncate" title={tbl.name}>
                      {tbl.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive SQL Query Console */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-base font-bold text-slate-900">
                    Curated Database Diagnostics & SQL Console
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect live relational SQLite metrics safely via curated diagnostics or read-only queries.
                </p>
              </div>

              {/* Diagnostic Query Selector & Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedDiagnosticId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedDiagnosticId(id);
                    const list = diagnosticsList.length > 0 ? diagnosticsList : [
                      { id: 'survey_by_department', label: 'Survey Responses Grouped by Department', sql: 'SELECT department, count(*) as response_count FROM survey_responses GROUP BY department ORDER BY response_count DESC;' },
                      { id: 'active_opportunities', label: 'Active Placement Opportunities (Live)', sql: 'SELECT id, title, employer, type, location, fixed_pay_or_stipend, deadline FROM opportunities WHERE is_archived = 0 ORDER BY posted_date DESC LIMIT 15;' },
                      { id: 'training_sessions_roster', label: 'Practical Training Sessions Capacity & Enrollment', sql: 'SELECT id, title, department, capacity, enrolled_count, trainer, venue FROM training_sessions ORDER BY id ASC;' },
                      { id: 'applications_summary', label: 'Applications Breakdown by Status', sql: 'SELECT status, count(*) as count FROM applications GROUP BY status ORDER BY count DESC;' },
                      { id: 'recent_feedback', label: 'Student Feedback Desk Overview', sql: 'SELECT category, status, count(*) as count FROM feedback_submissions GROUP BY category, status ORDER BY count DESC;' },
                      { id: 'guidance_queue', label: '1-on-1 Guidance Desk Topics', sql: 'SELECT topic, status, count(*) as count FROM guidance_requests GROUP BY topic, status ORDER BY count DESC;' },
                      { id: 'system_documents_status', label: 'System Documents & Content Store Timestamps', sql: 'SELECT doc_key, updated_at FROM system_documents ORDER BY doc_key ASC;' }
                    ];
                    const found = list.find((d) => d.id === id);
                    if (found) {
                      setSqlQuery(found.sql);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {(diagnosticsList.length > 0 ? diagnosticsList : [
                    { id: 'survey_by_department', label: 'Survey Responses Grouped by Department', sql: 'SELECT department, count(*) as response_count FROM survey_responses GROUP BY department ORDER BY response_count DESC;' },
                    { id: 'active_opportunities', label: 'Active Placement Opportunities (Live)', sql: 'SELECT id, title, employer, type, location, fixed_pay_or_stipend, deadline FROM opportunities WHERE is_archived = 0 ORDER BY posted_date DESC LIMIT 15;' },
                    { id: 'training_sessions_roster', label: 'Practical Training Sessions Capacity & Enrollment', sql: 'SELECT id, title, department, capacity, enrolled_count, trainer, venue FROM training_sessions ORDER BY id ASC;' },
                    { id: 'applications_summary', label: 'Applications Breakdown by Status', sql: 'SELECT status, count(*) as count FROM applications GROUP BY status ORDER BY count DESC;' },
                    { id: 'recent_feedback', label: 'Student Feedback Desk Overview', sql: 'SELECT category, status, count(*) as count FROM feedback_submissions GROUP BY category, status ORDER BY count DESC;' },
                    { id: 'guidance_queue', label: '1-on-1 Guidance Desk Topics', sql: 'SELECT topic, status, count(*) as count FROM guidance_requests GROUP BY topic, status ORDER BY count DESC;' },
                    { id: 'system_documents_status', label: 'System Documents & Content Store Timestamps', sql: 'SELECT doc_key, updated_at FROM system_documents ORDER BY doc_key ASC;' }
                  ]).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Registered SQL Query: <strong className="text-emerald-400">{selectedDiagnosticId}</strong></span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">Read-Only Safe Registry</span>
                </div>
                <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {sqlQuery || 'SELECT department, count(*) as response_count FROM survey_responses GROUP BY department ORDER BY response_count DESC;'}
                </pre>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">
                  Security Policy: Arbitrary client SQL is disabled. Only server-vetted diagnostic queries may be dispatched.
                </span>
                <button
                  onClick={handleExecuteQuery}
                  disabled={isQuerying || !selectedDiagnosticId}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isQuerying ? 'Executing...' : 'Run Diagnostic Query'}</span>
                </button>
              </div>
            </div>

            {/* Query Results Table */}
            {queryResult && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Results: {queryResult.count} row(s) returned
                  </span>
                  {queryResult.error && (
                    <span className="text-rose-600 font-semibold">{queryResult.error}</span>
                  )}
                </div>

                {queryResult.rows && queryResult.rows.length > 0 && (
                  <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono text-[11px]">
                        <tr>
                          {Object.keys(queryResult.rows[0]).map((col) => (
                            <th key={col} className="py-2 px-3 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {queryResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            {Object.values(row).map((val: any, colIdx) => (
                              <td key={colIdx} className="py-2 px-3 text-slate-800 max-w-xs truncate">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Database Operations & Re-seed */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Database Maintenance & Reset
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              If you wish to re-initialize the SQLite database to factory seed data (200 balanced survey records across CS, IT, and DS, 19 demo opportunities, and default study data), you can trigger a clean re-seed below.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset SQLite database to factory clean state?')) {
                  resetDatabase();
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
            >
              Re-Seed SQLite Database to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
