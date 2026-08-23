import { demoStore, INITIAL_SURVEYS, INITIAL_RECOMMENDATIONS } from './demoStore';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('mindtrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
  } catch (_e) {
    // Network or offline fallback
  }

  // Fallback to in-browser demo store for standalone Vercel preview
  return fallbackHandler<T>(endpoint, options);
}

function fallbackHandler<T>(endpoint: string, options: RequestInit): T {
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth endpoints
  if (endpoint.startsWith('/auth/login')) {
    const res = demoStore.login(body.email || 'alex.rivera@mindtrack.edu');
    return res as unknown as T;
  }
  if (endpoint.startsWith('/auth/signup')) {
    const res = demoStore.signup(body);
    return res as unknown as T;
  }
  if (endpoint.startsWith('/auth/me')) {
    return { user: demoStore.getCurrentUser() } as unknown as T;
  }
  if (endpoint.startsWith('/auth/consent')) {
    const user = demoStore.getCurrentUser();
    if (user.studentProfile) user.studentProfile.consentGiven = true;
    return { success: true, user } as unknown as T;
  }
  if (endpoint.startsWith('/auth/counselors')) {
    return {
      counselors: [
        { id: 'counselor-prof-1', title: 'Dr. Sarah Chen, Ph.D. - Clinical Director', user: { name: 'Dr. Sarah Chen, Ph.D.' } },
        { id: 'counselor-prof-2', title: 'Dr. Marcus Vance, LCSW - Senior Specialist', user: { name: 'Dr. Marcus Vance, LCSW' } },
      ],
    } as unknown as T;
  }

  // Mood endpoints
  if (endpoint === '/mood' && options.method === 'POST') {
    return demoStore.logMood(body) as unknown as T;
  }
  if (endpoint.startsWith('/mood/history')) {
    return demoStore.getMoodHistory() as unknown as T;
  }

  // Surveys endpoints
  if (endpoint === '/surveys') {
    return { surveys: INITIAL_SURVEYS } as unknown as T;
  }
  if (endpoint.startsWith('/surveys/') && endpoint.endsWith('/submit')) {
    const surveyId = endpoint.split('/')[2];
    return demoStore.submitSurvey(surveyId, body.answers) as unknown as T;
  }
  if (endpoint.startsWith('/surveys/') && endpoint.endsWith('/draft')) {
    return { success: true } as unknown as T;
  }
  if (endpoint.startsWith('/surveys/history')) {
    return { history: [
      {
        id: 'resp-1',
        survey: INITIAL_SURVEYS[1],
        score: 13,
        riskLevel: 'NEEDS_ATTENTION',
        summary: 'Elevated academic stress indicators detected.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] } as unknown as T;
  }
  if (endpoint.startsWith('/surveys/')) {
    const id = endpoint.replace('/surveys/', '');
    const survey = INITIAL_SURVEYS.find(s => s.id === id || s.slug === id) || INITIAL_SURVEYS[0];
    return { survey } as unknown as T;
  }

  // Recommendations
  if (endpoint.startsWith('/recommendations/personalized')) {
    return {
      primaryCategory: 'ACADEMIC',
      riskLevel: 'NEEDS_ATTENTION',
      recommendations: INITIAL_RECOMMENDATIONS,
    } as unknown as T;
  }
  if (endpoint.startsWith('/recommendations')) {
    return { recommendations: INITIAL_RECOMMENDATIONS } as unknown as T;
  }

  // Counselor endpoints
  if (endpoint.startsWith('/counselor/students/')) {
    const student = demoStore.getAssignedStudents()[0];
    return { student } as unknown as T;
  }
  if (endpoint.startsWith('/counselor/students')) {
    return { students: demoStore.getAssignedStudents() } as unknown as T;
  }
  if (endpoint.startsWith('/counselor/notes')) {
    return { success: true } as unknown as T;
  }
  if (endpoint.includes('/resolve')) {
    return { success: true } as unknown as T;
  }

  // Messages
  if (endpoint === '/messages' && options.method === 'POST') {
    return demoStore.sendMessage(body.receiverId, body.content) as unknown as T;
  }
  if (endpoint.startsWith('/messages/thread')) {
    return { messages: demoStore.getMessages() } as unknown as T;
  }
  if (endpoint.startsWith('/messages/conversations')) {
    return { conversations: [
      {
        partner: { id: 'user-counselor-1', name: 'Dr. Sarah Chen, Ph.D.', role: 'COUNSELOR', avatar: 'https://images.unsplash.com/photo-1594824813633-4f934273297a?w=150&auto=format&fit=crop&q=80' },
        lastMessage: { content: 'Thank you so much Dr. Chen! That really takes a weight off my chest.', sentAt: new Date().toISOString() },
        unreadCount: 0,
      }
    ] } as unknown as T;
  }

  // Appointments
  if (endpoint.startsWith('/appointments/request')) {
    return demoStore.requestAppointment(body) as unknown as T;
  }
  if (endpoint.startsWith('/appointments')) {
    return { appointments: demoStore.getAppointments() } as unknown as T;
  }

  // Admin
  if (endpoint.startsWith('/admin/analytics')) {
    return demoStore.getAdminAnalytics() as unknown as T;
  }
  if (endpoint.startsWith('/admin/surveys')) {
    return { surveys: INITIAL_SURVEYS } as unknown as T;
  }
  if (endpoint.startsWith('/admin/users')) {
    return { users: demoStore.getUsers() } as unknown as T;
  }

  // Feedback & Notifications
  if (endpoint.startsWith('/feedback/admin')) {
    return { stats: { averageRating: 4.8, totalCount: 42 }, feedbacks: [] } as unknown as T;
  }
  if (endpoint.startsWith('/feedback')) {
    return { feedbacks: [] } as unknown as T;
  }
  if (endpoint.startsWith('/notifications')) {
    return {
      notifications: [
        {
          id: 'notif-1',
          type: 'APPOINTMENT',
          title: 'Appointment Confirmed',
          message: 'Dr. Sarah Chen confirmed your check-in for tomorrow at 2:30 PM.',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
    } as unknown as T;
  }

  return {} as unknown as T;
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
