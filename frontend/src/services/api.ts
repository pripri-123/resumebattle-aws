const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('rb_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isFormData = false): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getHeaders(isFormData);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          localStorage.removeItem('rb_token');
          window.dispatchEvent(new Event('rb_unauthorized'));
        }
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the backend server. Ensure Flask backend is running on port 5000.');
      }
      throw err;
    }
  }

  // Auth
  async register(data: any) { return this.request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  async login(data: any) { return this.request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  async demoLogin() { return this.request<{ token: string; user: any }>('/auth/demo', { method: 'POST' }); }
  async getMe() { return this.request<{ user: any; profile: any }>('/auth/me'); }
  async logout() { return this.request<{ message: string }>('/auth/logout', { method: 'POST' }); }

  // Resumes
  async getResumes() { return this.request<{ resumes: any[] }>('/resumes'); }
  async getResume(id: string) { return this.request<{ resume: any }>(`/resumes/${id}`); }
  async uploadResume(formData: FormData) { return this.request<{ resume: any }>('/resumes/upload', { method: 'POST', body: formData }, true); }
  async deleteResume(id: string) { return this.request<{ message: string }>(`/resumes/${id}`, { method: 'DELETE' }); }
  async createResumeVersion(resumeId: string, data: any) { return this.request<{ version: any }>(`/resumes/${resumeId}/versions`, { method: 'POST', body: JSON.stringify(data) }); }

  // Analyses & Jobs
  async evaluateResume(data: any) { return this.request<{ analysis: any }>('/analyses/evaluate', { method: 'POST', body: JSON.stringify(data) }); }
  async getAnalysis(id: string) { return this.request<{ analysis: any }>(`/analyses/${id}`); }
  async getAnalysisHistory() { return this.request<{ history: any[] }>('/analyses/history'); }
  async getJobs() { return this.request<{ jobs: any[] }>('/analyses/jobs'); }
  async createJob(data: any) { return this.request<{ job: any }>('/analyses/jobs', { method: 'POST', body: JSON.stringify(data) }); }

  // Battles
  async compareResumes(data: any) { return this.request<any>('/battles/compare', { method: 'POST', body: JSON.stringify(data) }); }
  async getBattles() { return this.request<{ battles: any[] }>('/battles'); }

  // Career DNA
  async getCareerDna() { return this.request<any>('/career/dna'); }
  async addSkill(data: any) { return this.request<any>('/career/skills', { method: 'POST', body: JSON.stringify(data) }); }
  async updateSkill(id: string, data: any) { return this.request<any>(`/career/skills/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteSkill(id: string) { return this.request<any>(`/career/skills/${id}`, { method: 'DELETE' }); }
  async addEvidence(skillId: string, data: any) { return this.request<any>(`/career/skills/${skillId}/evidence`, { method: 'POST', body: JSON.stringify(data) }); }

  // Career Quest (Missions)
  async getMissions(status?: string) { return this.request<any>(`/missions${status ? `?status=${status}` : ''}`); }
  async startMission(id: string) { return this.request<any>(`/missions/${id}/start`, { method: 'POST' }); }
  async updateMissionProgress(id: string, data: any) { return this.request<any>(`/missions/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }); }
  async completeMission(id: string, data?: any) { return this.request<any>(`/missions/${id}/complete`, { method: 'POST', body: JSON.stringify(data || {}) }); }

  // Application Simulator (Interviews)
  async getInterviewSessions() { return this.request<{ sessions: any[] }>('/interviews'); }
  async startInterview(data: any) { return this.request<any>('/interviews/start', { method: 'POST', body: JSON.stringify(data) }); }
  async getInterviewSession(id: string) { return this.request<any>(`/interviews/${id}`); }
  async submitAnswer(sessionId: string, data: any) { return this.request<any>(`/interviews/${sessionId}/answer`, { method: 'POST', body: JSON.stringify(data) }); }
  async completeInterviewSession(sessionId: string) { return this.request<any>(`/interviews/${sessionId}/complete`, { method: 'POST' }); }

  // Project Proof
  async getProjects() { return this.request<{ projects: any[] }>('/projects'); }
  async createProject(data: any) { return this.request<{ project: any }>('/projects', { method: 'POST', body: JSON.stringify(data) }); }
  async updateProject(id: string, data: any) { return this.request<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteProject(id: string) { return this.request<any>(`/projects/${id}`, { method: 'DELETE' }); }

  // Battle League (Community)
  async getChallenges() { return this.request<{ challenges: any[] }>('/community/challenges'); }
  async submitToChallenge(id: string, data: any) { return this.request<any>(`/community/challenges/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }); }
  async getLeaderboard() { return this.request<any>('/community/leaderboard'); }

  // Career Insights / Analytics
  async getInsights() { return this.request<{ insights: any }>('/analytics/overview'); }

  // Documents
  async getDocuments() { return this.request<{ documents: any[] }>('/documents'); }
  async renameDocument(id: string, title: string) { return this.request<any>(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }); }
  async deleteDocument(id: string) { return this.request<any>(`/documents/${id}`, { method: 'DELETE' }); }

  // Settings
  async getProfile() { return this.request<any>('/settings/profile'); }
  async updateProfile(data: any) { return this.request<any>('/settings/profile', { method: 'PATCH', body: JSON.stringify(data) }); }
  async changePassword(data: any) { return this.request<any>('/settings/change-password', { method: 'POST', body: JSON.stringify(data) }); }
  async exportData() { return this.request<any>('/settings/export-data'); }
  async deleteAccount() { return this.request<any>('/settings/delete-account', { method: 'DELETE' }); }
}

export const api = new ApiClient();
