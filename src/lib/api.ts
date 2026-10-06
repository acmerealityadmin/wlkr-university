import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '@/lib/runtime-config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/tokens';
import type {
  AuthTokens, User, Course, CourseListItem, PublicCourse, Lesson, Quiz, QuizAttemptAnswer,
  QuizAttemptResult, Enrollment, CertificateListItem, PublicCertificate, Article,
  PublicArticleListItem, PublicArticle, SearchResult, Pagination, CalendarEvent, CalendarEventInput,
  UniversityProfile, UniversityProfileInput, Webinar, WebinarAttendance, PublicWebinar,
  TrainingAssignment, TrainingReport,
} from '@/types/api';

// `api`  → walkr-ecko-server (auth)
// `univ` → walkr-ecko-server University routes (/v1/university/*)
// Base URL is resolved per request from runtime config (build-time
// NEXT_PUBLIC_API_URL, since this is a static export with no server runtime).
export const api = axios.create({ headers: { 'Content-Type': 'application/json' } });
export const univ = axios.create({ headers: { 'Content-Type': 'application/json' } });

// ── Shared token handling ────────────────────────────────────────────────
// Ported from wlkr-ed-portal/src/lib/api.ts — both instances attach the
// ecko-issued bearer token and silently refresh it on 401.

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

function installInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const base = getApiBaseUrl();
    config.baseURL = instance === univ ? `${base}/v1/university` : base;
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(instance(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${getApiBaseUrl()}/v1/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data;
        await setTokens(accessToken, newRefresh);
        drainQueue(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return instance(original);
      } catch {
        await clearTokens();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    },
  );
}

installInterceptors(api);
installInterceptors(univ);

// ════════════════════════════════════════════════════════════════════════
// walkr-ecko-server auth
// ════════════════════════════════════════════════════════════════════════

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>('/v1/auth/login', { email, password }).then((r) => r.data),
  logout: (refreshToken: string) =>
    api.post('/v1/auth/logout', { refreshToken }).then((r) => r.data),
  me: () => api.get<{ user: User }>('/v1/auth/me').then((r) => r.data),
  locales: () =>
    api.get<{ defaultLocale: string; locales: { code: string; name: string }[] }>('/v1/auth/locales').then((r) => r.data),
  samlExchange: (code: string) =>
    api.post<AuthTokens>('/v1/auth/saml/exchange', { code }).then((r) => r.data),
  cleverStatus: () =>
    api.get<{ enabled: boolean; districtId?: string }>('/v1/auth/clever/status').then((r) => r.data),
  cleverLoginUrl: (returnTo: string, districtId?: string) => {
    const base = getApiBaseUrl();
    const params = new URLSearchParams({ returnTo });
    if (districtId) params.set('district_id', districtId);
    return `${base}/v1/auth/clever/login?${params}`;
  },
};

// ════════════════════════════════════════════════════════════════════════
// WLKR University (/v1/university/*) — authenticated
// ════════════════════════════════════════════════════════════════════════

export const coursesApi = {
  list: (params?: Record<string, unknown>) =>
    univ.get<{ courses: CourseListItem[]; pagination: Pagination }>('/courses', { params }).then((r) => r.data),
  get: (id: string) => univ.get<{ course: Course }>(`/courses/${id}`).then((r) => r.data),
};

export const lessonsApi = {
  listForCourse: (courseId: string) =>
    univ.get<{ lessons: Lesson[] }>('/lessons', { params: { courseId } }).then((r) => r.data),
};

export const practiceApi = {
  get: (courseSlug: string) =>
    univ.get<{ title: string; opening: string }>(`/practice/${courseSlug}`).then((r) => r.data),
  send: (
    courseSlug: string,
    messages: { role: 'user' | 'assistant'; content: string; summary?: boolean }[],
    summarize = false,
  ) =>
    univ.post<{ message: string }>(`/practice/${courseSlug}`, { messages, summarize }).then((r) => r.data),
};

export const quizzesApi = {
  listForCourse: (courseId: string) =>
    univ.get<{ quizzes: Quiz[] }>('/quizzes', { params: { courseId } }).then((r) => r.data),
  submitAttempt: (quizId: string, answers: QuizAttemptAnswer[], responseTimeMs?: number) =>
    univ.post<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, { answers, responseTimeMs }).then((r) => r.data),
};

export const enrollmentsApi = {
  list: (params?: { status?: string }) =>
    univ.get<{ enrollments: Enrollment[] }>('/enrollments', { params }).then((r) => r.data),
  enroll: (courseId: string) =>
    univ.post<{ enrollment: Enrollment }>('/enrollments', { courseId }).then((r) => r.data),
};

export const certificatesApi = {
  list: () => univ.get<{ certificates: CertificateListItem[] }>('/certificates').then((r) => r.data),
  /** Fetches the PDF as a blob (must go through the axios instance for the
   * bearer token — a plain <a href> can't carry Authorization). */
  downloadFile: (id: string) =>
    univ.get<Blob>(`/certificates/${id}/file`, { responseType: 'blob' }).then((r) => r.data),
};

/** Public — no auth. Called from server components at build time and from
 * the client on the public marketing pages. */
export const publicCertificatesApi = {
  verify: (code: string) =>
    univ.get<{ certificate: PublicCertificate }>(`/certificates/verify/${code}`).then((r) => r.data),
};

export const mediaApi = {
  list: (params?: Record<string, unknown>) =>
    univ.get('/media', { params }).then((r) => r.data),
};

export const searchApi = {
  query: (q: string, limit = 10) =>
    univ.get<{ results: SearchResult[] }>('/search', { params: { q, limit } }).then((r) => r.data),
};

export const voiceApi = {
  transcribe: (blob: Blob, locale?: string) => {
    const form = new FormData();
    form.append('file', blob, 'recording.webm');
    if (locale) form.append('locale', locale);
    return univ
      .post<{ text: string }>('/voice/transcribe', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};

export const calendarApi = {
  list: (from: string, to: string) =>
    univ
      .get<{ from: string; to: string; events: CalendarEvent[] }>('/calendar', { params: { from, to } })
      .then((r) => r.data),
  create: (body: CalendarEventInput) =>
    univ.post<{ event: CalendarEvent }>('/calendar', body).then((r) => r.data),
  update: (id: string, body: Partial<CalendarEventInput>) =>
    univ.patch<{ event: CalendarEvent }>(`/calendar/${id}`, body).then((r) => r.data),
  remove: (id: string) => univ.delete<{ ok: true }>(`/calendar/${id}`).then((r) => r.data),
};

export const universityProfileApi = {
  get: () => univ.get<{ user: User; profile: UniversityProfile }>('/profile').then((r) => r.data),
  update: (body: UniversityProfileInput) =>
    univ.patch<{ user: User; profile: UniversityProfile }>('/profile', body).then((r) => r.data),
};

export const webinarsApi = {
  list: (params?: { kind?: string }) =>
    univ.get<{ webinars: Array<Webinar & { attendance: Pick<WebinarAttendance, 'status' | 'minutesWatched'> | null }> }>(
      '/webinars',
      { params },
    ).then((r) => r.data),
  get: (idOrSlug: string) =>
    univ.get<{ webinar: Webinar; attendance: WebinarAttendance | null }>(`/webinars/${idOrSlug}`).then((r) => r.data),
  rsvp: (idOrSlug: string) =>
    univ.post<{ webinar: Webinar; attendance: WebinarAttendance }>(`/webinars/${idOrSlug}/rsvp`).then((r) => r.data),
  attend: (idOrSlug: string, minutesWatched?: number) =>
    univ.post<{ webinar: Webinar; attendance: WebinarAttendance }>(`/webinars/${idOrSlug}/attend`, { minutesWatched }).then((r) => r.data),
  downloadIcs: (idOrSlug: string) =>
    univ.get<Blob>(`/webinars/${idOrSlug}/ics`, { responseType: 'blob' }).then((r) => r.data),
};

export const publicWebinarsApi = {
  list: () => univ.get<{ webinars: PublicWebinar[] }>('/public/webinars').then((r) => r.data),
};

export const assignmentsApi = {
  list: () =>
    univ.get<{ assignments: TrainingAssignment[]; canAssign: boolean }>('/assignments').then((r) => r.data),
  create: (body: { courseId: string; dueAt?: string | null; districtId?: string | null; schoolId?: string | null }) =>
    univ.post<{ assignment: TrainingAssignment; enrolled: { created: number; reactivated: number; skipped: number } }>(
      '/assignments',
      body,
    ).then((r) => r.data),
  report: (id: string) => univ.get<TrainingReport>(`/assignments/${id}/report`).then((r) => r.data),
};

// ════════════════════════════════════════════════════════════════════════
// WLKR University — public (no auth), used for SEO pages
// ════════════════════════════════════════════════════════════════════════

export const publicCoursesApi = {
  list: (params?: { locale?: string }) =>
    univ.get<{ courses: PublicCourse[]; pagination: Pagination }>('/public/courses', { params }).then((r) => r.data),
};

export const publicArticlesApi = {
  list: (params?: { locale?: string }) =>
    univ.get<{ articles: PublicArticleListItem[]; pagination: Pagination }>('/public/articles', { params }).then((r) => r.data),
  get: (slug: string, locale?: string) =>
    univ.get<{ article: PublicArticle }>(`/public/articles/${slug}`, { params: locale ? { locale } : undefined }).then((r) => r.data),
};

// Re-export authenticated Article CRUD types for completeness even though
// the public frontend only reads via publicArticlesApi today.
export type { Article };
