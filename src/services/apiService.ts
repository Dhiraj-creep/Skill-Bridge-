import { SurveyResponse, SurveyResponsesSummary } from '../types/survey';
import { DemoOpportunity } from '../types/opportunity';
import { TrainingSession } from '../types/training';
import { FeedbackSubmission, GuidanceRequest } from '../types/feedback';
import { EmployerOutreachRecord, StudentProfile } from '../types/content';

export interface UserSession {
  id: string;
  username: string;
  role: 'Student' | 'Placement Coordinator' | 'Admin';
  fullName: string;
  department: string;
  email: string | null;
}

export interface AuthResponse {
  success: boolean;
  user: UserSession | null;
  profile?: StudentProfile | null;
  error?: string;
}

export interface StudentApplicationItem {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  employer: string;
  type: string;
  appliedDate: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected' | 'Feedback Pending';
  studentNotes?: string;
  coordinatorFeedback?: string;
  fixedPayOrStipend?: string;
  deadline?: string;
  location?: string;
  reviewedBy?: string;
}

export interface CoordinatorApplicationItem extends StudentApplicationItem {
  studentName: string;
  department: string;
  studentDepartment?: string;
  studentEmail: string;
  year: string;
  studentYear?: string;
  academicPercentage?: number;
  activeBacklogs?: number;
  skills: string[];
  preferredRoles: string[];
  subdomain?: string;
  reviewedBy?: string;
}

export interface StudentEnrollmentItem {
  id: string;
  workshopId: string;
  title: string;
  department: string;
  mode: string;
  schedule: string;
  trainer: string;
  venue: string;
  enrolledAt: string;
  attendanceStatus: 'Enrolled' | 'Attended' | 'Absent' | 'Cancelled';
}

export interface WorkshopParticipantItem {
  enrollment_id: string;
  workshop_id: string;
  enrolled_at: string;
  attendance_status: 'Enrolled' | 'Attended' | 'Absent' | 'Cancelled';
  attendance_marked_at?: string;
  student_id: string;
  student_name: string;
  department: string;
  email?: string;
}

export interface CoordinatorMetrics {
  operationalMetrics: {
    registeredStudents: number;
    pendingApplications: number;
    totalApplications: number;
    openFeedback: number;
    pendingGuidance: number;
    totalEnrollments: number;
  };
  simulatedResearchCount: number;
  timestamp: string;
  registeredStudents?: number;
  applicationsAwaitingReview?: number;
  openFeedback?: number;
  pendingGuidance?: number;
  totalEnrollments?: number;
}

export interface RegisteredStudentOverview {
  id: string;
  username: string;
  fullName: string;
  department: string;
  email: string;
  createdAt: string;
  year: string;
  academicPercentage?: number;
  skills: string[];
  preferredRoles: string[];
  applicationsCount: number;
  enrollmentsCount: number;
}

export interface DatabaseStatus {
  status: 'online' | 'offline';
  engine: string;
  dbPath: string;
  fileSizeKb: number;
  tables: {
    users: number;
    sessions: number;
    student_profiles: number;
    applications: number;
    saved_opportunities: number;
    workshop_enrollments: number;
    survey_responses: number;
    opportunities: number;
    training_sessions: number;
    feedback_submissions: number;
    guidance_requests: number;
    employer_outreach: number;
    system_documents: number;
  };
  operationalMetrics: {
    registeredStudents: number;
    pendingApplications: number;
    totalApplications: number;
    openFeedback: number;
    pendingGuidance: number;
    totalEnrollments: number;
  };
  departmentCounts: Record<string, number>;
  timestamp: string;
}

export interface QueryResult {
  success: boolean;
  count: number;
  rows: any[];
  error?: string;
}

class ApiService {
  private baseUrl = '/api';

  private async request<T>(path: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null; status: number }> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) {
        return {
          data: null,
          error: data?.error || `HTTP error ${res.status}: ${res.statusText}`,
          status: res.status,
        };
      }

      return { data, error: null, status: res.status };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || 'Network connection failed.',
        status: 0,
      };
    }
  }

  /* ======================================================================== */
  /* AUTHENTICATION                                                           */
  /* ======================================================================== */

  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.error || !res.data) {
      return { success: false, user: null, error: res.error || 'Login failed.' };
    }

    return {
      success: true,
      user: res.data.user,
      profile: res.data.profile,
    };
  }

  async getCurrentSession(): Promise<{ user: UserSession | null; profile: StudentProfile | null }> {
    const res = await this.request<any>('/auth/me');
    if (res.data?.user) {
      return { user: res.data.user, profile: res.data.profile || null };
    }
    return { user: null, profile: null };
  }

  async logout(): Promise<boolean> {
    const res = await this.request<any>('/auth/logout', { method: 'POST' });
    return res.status === 200;
  }

  async registerStudent(params: {
    username: string;
    password: string;
    fullName: string;
    department: string;
    year?: string;
    skills?: string[];
    preferredRoles?: string[];
  }): Promise<AuthResponse> {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (res.error || !res.data) {
      return { success: false, user: null, error: res.error || 'Registration failed.' };
    }

    return {
      success: true,
      user: res.data.user,
      profile: res.data.profile,
    };
  }

  /* ======================================================================== */
  /* STUDENT WORKSPACE                                                        */
  /* ======================================================================== */

  async getStudentProfile(): Promise<StudentProfile | null> {
    const res = await this.request<StudentProfile>('/student/profile');
    return res.data;
  }

  async updateStudentProfile(profile: Partial<StudentProfile>): Promise<boolean> {
    const res = await this.request<any>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return res.status === 200;
  }

  async getStudentApplications(): Promise<StudentApplicationItem[]> {
    const res = await this.request<StudentApplicationItem[]>('/student/applications');
    return res.data || [];
  }

  async applyToOpportunity(opportunityId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/student/applications', {
      method: 'POST',
      body: JSON.stringify({ opportunityId, notes }),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  async getStudentSavedOpportunities(): Promise<string[]> {
    const res = await this.request<string[]>('/student/saved-opportunities');
    return res.data || [];
  }

  async saveOpportunity(opportunityId: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/student/saved-opportunities', {
      method: 'POST',
      body: JSON.stringify({ opportunityId }),
    });
    if (res.status === 200 || res.status === 201) {
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to bookmark opportunity.' };
  }

  async unsaveOpportunity(opportunityId: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>(`/student/saved-opportunities/${opportunityId}`, {
      method: 'DELETE',
    });
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to remove bookmark.' };
  }

  async getStudentEnrollments(): Promise<StudentEnrollmentItem[]> {
    const res = await this.request<StudentEnrollmentItem[]>('/student/enrollments');
    return res.data || [];
  }

  async enrollInWorkshop(workshopId: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/student/enrollments', {
      method: 'POST',
      body: JSON.stringify({ workshopId }),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  async cancelWorkshopEnrollment(workshopId: string): Promise<boolean> {
    const res = await this.request<any>(`/student/enrollments/${workshopId}`, {
      method: 'DELETE',
    });
    return res.status === 200;
  }

  async getStudentFeedback(): Promise<FeedbackSubmission[]> {
    const res = await this.request<FeedbackSubmission[]>('/student/feedback');
    return res.data || [];
  }

  async submitFeedback(data: { category: string; description: string; suggestedImprovement?: string }): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/student/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  async getStudentGuidance(): Promise<GuidanceRequest[]> {
    const res = await this.request<GuidanceRequest[]>('/student/guidance');
    return res.data || [];
  }

  async requestGuidance(data: { preferredRole?: string; topic: string; preferredTimeSlot: string; additionalNotes?: string }): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/student/guidance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  /* ======================================================================== */
  /* COORDINATOR WORKSPACE                                                    */
  /* ======================================================================== */

  async getCoordinatorMetrics(): Promise<CoordinatorMetrics | null> {
    const res = await this.request<CoordinatorMetrics>('/coordinator/metrics');
    return res.data;
  }

  async getCoordinatorApplications(filters?: { opportunityId?: string; department?: string; status?: string }): Promise<CoordinatorApplicationItem[]> {
    const params = new URLSearchParams();
    if (filters?.opportunityId) params.append('opportunityId', filters.opportunityId);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<CoordinatorApplicationItem[]>(`/coordinator/applications${queryStr}`);
    return res.data || [];
  }

  async updateApplicationStatus(id: string, status: string, coordinatorFeedback?: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>(`/coordinator/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, coordinatorFeedback }),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  async createOpportunity(opportunity: Partial<DemoOpportunity>): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/coordinator/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  async updateOpportunity(id: string, opportunity: Partial<DemoOpportunity>): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>(`/coordinator/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opportunity),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  async setOpportunityArchiveStatus(id: string, isArchived: boolean, isExpired?: boolean): Promise<boolean> {
    const res = await this.request<any>(`/coordinator/opportunities/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived, isExpired }),
    });
    return res.status === 200;
  }

  async getWorkshopParticipants(workshopId: string): Promise<WorkshopParticipantItem[]> {
    const res = await this.request<WorkshopParticipantItem[]>(`/coordinator/training/${workshopId}/enrollments`);
    return res.data || [];
  }

  async getWorkshopEnrollments(workshopId: string): Promise<WorkshopParticipantItem[]> {
    return this.getWorkshopParticipants(workshopId);
  }

  async markAttendance(enrollmentId: string, attendanceStatus: 'Attended' | 'Absent' | 'Enrolled'): Promise<boolean> {
    const res = await this.request<any>(`/coordinator/training/enrollments/${enrollmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ attendanceStatus }),
    });
    return res.status === 200;
  }

  async createWorkshop(workshop: Partial<TrainingSession>): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/coordinator/training', {
      method: 'POST',
      body: JSON.stringify(workshop),
    });
    if (res.error) {
      return { success: false, error: res.error };
    }
    return { success: true };
  }

  async getCoordinatorFeedback(): Promise<FeedbackSubmission[]> {
    const res = await this.request<FeedbackSubmission[]>('/coordinator/feedback');
    return res.data || [];
  }

  async respondToFeedback(id: string, status: string, coordinatorResponse: string): Promise<boolean> {
    const res = await this.request<any>(`/coordinator/feedback/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, coordinatorResponse }),
    });
    return res.status === 200;
  }

  async getCoordinatorGuidance(): Promise<GuidanceRequest[]> {
    const res = await this.request<GuidanceRequest[]>('/coordinator/guidance');
    return res.data || [];
  }

  async scheduleGuidance(id: string, status: string, scheduledTime?: string, coordinatorNote?: string): Promise<boolean> {
    const res = await this.request<any>(`/coordinator/guidance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, scheduledTime, coordinatorNote }),
    });
    return res.status === 200;
  }

  async getCoordinatorStudents(): Promise<RegisteredStudentOverview[]> {
    const res = await this.request<RegisteredStudentOverview[]>('/coordinator/students');
    return res.data || [];
  }

  async updateWorkshop(id: string, workshop: Partial<TrainingSession>): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>(`/coordinator/training/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workshop),
    });
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update workshop.' };
  }

  async getEmployerOutreach(): Promise<EmployerOutreachRecord[]> {
    const res = await this.request<EmployerOutreachRecord[]>('/employer-outreach');
    return res.data || [];
  }

  async saveEmployerOutreach(record: EmployerOutreachRecord): Promise<boolean> {
    const res = await this.request<any>('/coordinator/employer-outreach', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    return res.status === 201;
  }

  async updateEmployerOutreach(id: string, record: Partial<EmployerOutreachRecord>): Promise<boolean> {
    const res = await this.request<any>(`/coordinator/employer-outreach/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
    return res.status === 200;
  }

  async deleteEmployerOutreach(id: string): Promise<boolean> {
    const res = await this.request<any>(`/coordinator/employer-outreach/${id}`, {
      method: 'DELETE',
    });
    return res.status === 200;
  }

  /* ======================================================================== */
  /* SHARED / PUBLIC ENDPOINTS                                                */
  /* ======================================================================== */

  async getOpportunities(): Promise<DemoOpportunity[]> {
    const res = await this.request<DemoOpportunity[]>('/opportunities');
    return res.data || [];
  }

  async getTrainingSessions(): Promise<TrainingSession[]> {
    const res = await this.request<TrainingSession[]>('/training');
    return res.data || [];
  }

  async getResponses(): Promise<SurveyResponse[]> {
    const res = await this.request<SurveyResponse[]>('/responses');
    return res.data || [];
  }

  async getResponsesSummary(filters?: { department?: string; year?: string; sourceType?: string }): Promise<SurveyResponsesSummary | null> {
    const params = new URLSearchParams();
    if (filters?.department && filters.department !== 'All') params.append('department', filters.department);
    if (filters?.year && filters.year !== 'All') params.append('year', filters.year);
    if (filters?.sourceType && filters.sourceType !== 'All') params.append('sourceType', filters.sourceType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<any>(`/responses/summary${qs}`);
    return res.data || null;
  }

  async createResponse(response: Partial<SurveyResponse>): Promise<{ success: boolean; data?: SurveyResponse; error?: string }> {
    const res = await this.request<{ success: boolean; response: SurveyResponse }>('/responses', {
      method: 'POST',
      body: JSON.stringify(response),
    });
    if (res.status === 201 && res.data?.response) {
      return { success: true, data: res.data.response };
    }
    return { success: false, error: res.error || 'Failed to submit response.' };
  }

  async updateResponse(id: string, response: Partial<SurveyResponse>): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>(`/responses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(response),
    });
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update response.' };
  }

  async deleteResponse(id: string): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>(`/responses/${id}`, {
      method: 'DELETE',
    });
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to delete response.' };
  }

  async importResponsesBatch(responses: SurveyResponse[], mode: 'replace' | 'merge' = 'merge'): Promise<{ success: boolean; count?: number; error?: string }> {
    const res = await this.request<{ success: boolean; count: number }>('/responses/batch', {
      method: 'POST',
      body: JSON.stringify({ responses, mode }),
    });
    if (res.status === 200) {
      return { success: true, count: res.data?.count };
    }
    return { success: false, error: res.error || 'Failed to import responses.' };
  }

  async getSystemDocument<T>(key: string): Promise<T | null> {
    const res = await this.request<T>(`/system-documents/${key}`);
    return res.data;
  }

  async updateSystemDocument(key: string, data: any): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>(`/system-documents/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: res.error || `Failed to update system document "${key}".` };
  }

  /* ======================================================================== */
  /* ADMIN & DATABASE DIAGNOSTICS                                             */
  /* ======================================================================== */

  async getDatabaseStatus(): Promise<DatabaseStatus | null> {
    const res = await this.request<DatabaseStatus>('/database/status');
    return res.data;
  }

  async getDatabaseBackup(): Promise<any | null> {
    const res = await this.request<any>('/database/backup');
    return res.data;
  }

  async getDiagnostics(): Promise<{ id: string; label: string; description: string; sql: string }[]> {
    const res = await this.request<{ diagnostics: { id: string; label: string; description: string; sql: string }[] }>('/database/diagnostics');
    return res.data?.diagnostics || [];
  }

  async restoreDatabaseBackup(payload: any): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<any>('/database/restore', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.status === 200) {
      return { success: true };
    }
    return { success: false, error: res.error || 'Database restore failed.' };
  }

  async executeQuery(params: { queryId?: string; sql?: string } | string): Promise<QueryResult> {
    const queryId = typeof params === 'string' ? params : (params.queryId || '');
    const res = await this.request<QueryResult>('/database/query', {
      method: 'POST',
      body: JSON.stringify({ queryId }),
    });
    if (res.error) {
      return { success: false, count: 0, rows: [], error: res.error };
    }
    return res.data || { success: false, count: 0, rows: [] };
  }

  async resetDatabase(): Promise<boolean> {
    const res = await this.request<any>('/database/reset', { method: 'POST' });
    return res.status === 200;
  }
}

export const apiService = new ApiService();
