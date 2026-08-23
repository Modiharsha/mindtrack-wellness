const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('mindtrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'An unexpected request error occurred');
  }

  return data as T;
}

export const api = {
  // Auth
  signup: (payload: any) => request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request<{ user: any }>('/auth/me'),
  submitConsent: () => request<any>('/auth/consent', { method: 'POST' }),
  getCounselors: () => request<{ counselors: any[] }>('/auth/counselors'),

  // Mood
  logMood: (payload: { moodValue: number; emotionTags?: string[]; note?: string; entryDate?: string }) =>
    request<any>('/mood', { method: 'POST', body: JSON.stringify(payload) }),
  getMoodHistory: (studentId?: string, days: number = 30) =>
    request<{ entries: any[]; stats: any }>(`/mood/history?${studentId ? `studentId=${studentId}&` : ''}days=${days}`),

  // Surveys
  getSurveys: () => request<{ surveys: any[] }>('/surveys'),
  getSurveyById: (id: string) => request<{ survey: any }>(`/surveys/${id}`),
  saveSurveyDraft: (id: string, answers: any) =>
    request<any>(`/surveys/${id}/draft`, { method: 'POST', body: JSON.stringify({ answers }) }),
  submitSurvey: (id: string, answers: any) =>
    request<any>(`/surveys/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  getSurveyHistory: (studentId?: string) =>
    request<{ history: any[] }>(`/surveys/history/my${studentId ? `?studentId=${studentId}` : ''}`),

  // Recommendations
  getRecommendations: (category?: string) =>
    request<{ recommendations: any[] }>(`/recommendations${category ? `?category=${category}` : ''}`),
  getPersonalizedRecommendations: () =>
    request<{ primaryCategory: string; riskLevel: string; recommendations: any[] }>('/recommendations/personalized'),
  createRecommendation: (payload: any) =>
    request<any>('/recommendations', { method: 'POST', body: JSON.stringify(payload) }),
  deleteRecommendation: (id: string) =>
    request<any>(`/recommendations/${id}`, { method: 'DELETE' }),

  // Counselor
  getAssignedStudents: () => request<{ students: any[] }>('/counselor/students'),
  getStudentDetail: (studentId: string) => request<{ student: any }>(`/counselor/students/${studentId}`),
  addCounselorNote: (payload: { studentId: string; noteContent: string; isPrivate?: boolean }) =>
    request<any>('/counselor/notes', { method: 'POST', body: JSON.stringify(payload) }),
  resolveRiskAssessment: (riskId: string) =>
    request<any>(`/counselor/risk/${riskId}/resolve`, { method: 'PUT' }),

  // Messages
  sendMessage: (receiverId: string, content: string) =>
    request<any>('/messages', { method: 'POST', body: JSON.stringify({ receiverId, content }) }),
  getMessageThread: (partnerId: string) =>
    request<{ messages: any[] }>(`/messages/thread/${partnerId}`),
  getConversations: () =>
    request<{ conversations: any[] }>('/messages/conversations'),

  // Appointments
  requestAppointment: (payload: { counselorId?: string; requestedSlot: string; studentNotes?: string }) =>
    request<any>('/appointments/request', { method: 'POST', body: JSON.stringify(payload) }),
  getAppointments: () => request<{ appointments: any[] }>('/appointments'),
  updateAppointmentStatus: (id: string, payload: any) =>
    request<any>(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Admin
  getAdminAnalytics: () => request<any>('/admin/analytics/aggregate'),
  getAdminSurveys: () => request<{ surveys: any[] }>('/admin/surveys'),
  createSurveyTemplate: (payload: any) =>
    request<any>('/admin/surveys', { method: 'POST', body: JSON.stringify(payload) }),
  updateSurveyTemplate: (id: string, payload: any) =>
    request<any>(`/admin/surveys/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getAdminUsers: () => request<{ users: any[] }>('/admin/users'),
  toggleUserApproval: (id: string, isApproved: boolean) =>
    request<any>(`/admin/users/${id}/approve`, { method: 'PUT', body: JSON.stringify({ isApproved }) }),
  assignCounselorToStudent: (studentId: string, counselorProfileId: string) =>
    request<any>(`/admin/students/${studentId}/assign-counselor`, { method: 'PUT', body: JSON.stringify({ counselorProfileId }) }),

  // Feedback
  submitFeedback: (payload: { rating: number; category: string; comment: string; isAnonymous?: boolean }) =>
    request<any>('/feedback', { method: 'POST', body: JSON.stringify(payload) }),
  getMyFeedback: () => request<{ feedbacks: any[] }>('/feedback/my'),
  getAdminFeedback: () => request<{ stats: any; feedbacks: any[] }>('/feedback/admin'),
  updateFeedbackStatus: (id: string, status: string) =>
    request<any>(`/feedback/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Notifications
  getNotifications: () => request<{ notifications: any[]; unreadCount: number }>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PUT' }),
};
