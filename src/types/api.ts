// Shapes returned by walkr-ecko-server. University shapes are read directly
// off the real route/model files in wlkr-ecko-server/src/routes/university/*
// and src/models/*.js — keep in sync with those, not with this comment.

export type UserRole =
  | 'SUPER_ADMIN'
  | 'PORTAL_ADMIN'
  | 'ACME_CREATOR'
  | 'EXTERNAL_CONTRACTOR'
  | 'SALES'
  | 'SUPPORT'
  | 'SALES_SUPPORT'
  | 'DISTRICT_USER'
  | 'SCHOOL_USER'
  | 'TEACHER'
  | 'USER_GUARDIAN'
  | 'PARENT'
  | 'USER'
  | 'STUDENT'
  | 'VIEWER';

export interface User {
  _id: string;
  id?: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  roleSubtype?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailMediaId: string | null;
  locale: string;
  tags: string[];
  status: ContentStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Authenticated list endpoint returns lean Mongo docs (not toPublic()), so
 * `_id` is present here instead of `id`. */
export interface CourseListItem extends Omit<Course, 'id'> {
  _id: string;
}

export interface PublicCourse {
  title: string;
  slug: string;
  description: string;
  thumbnailMediaId: string | null;
  locale: string;
  tags: string[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  body: string;
  order: number;
  mediaIds: string[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  prompt: string;
  choices: string[];
  points: number;
  correctAnswerIndex?: number; // only present for writeGuard responses
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  passingScorePercent: number;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptAnswer {
  questionIndex: number;
  selectedIndex: number;
}

export interface QuizAttemptResult {
  attempt: {
    _id: string;
    userId: string;
    quizId: string;
    answers: QuizAttemptAnswer[];
    score: number;
    passed: boolean;
    attemptNumber: number;
  };
  courseCompleted: boolean;
  certificate: OwnerCertificate | null;
}

export type EnrollmentStatus = 'ACTIVE' | 'DROPPED' | 'COMPLETED';

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: { _id: string; title: string; slug: string; thumbnailMediaId: string | null } | string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
}

export interface OwnerCertificate {
  id: string;
  courseId: string;
  enrollmentId: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: string;
}

export interface CertificateListItem {
  _id: string;
  userId: string;
  courseId: { _id: string; title: string; slug: string } | string;
  enrollmentId: string;
  certificateNumber: string;
  verificationCode: string;
  pdfStorageKey: string;
  issuedAt: string;
}

export interface PublicCertificate {
  certificateNumber: string;
  verificationCode: string;
  courseId: string;
  courseTitle: string | null;
  recipientName: string | null;
  issuedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  locale: string;
  body: string;
  excerpt: string;
  coverMediaId: string | null;
  tags: string[];
  status: ContentStatus;
  publishedAt: string | null;
  isPublic: boolean;
  seo: { metaTitle: string; metaDescription: string };
  createdAt: string;
  updatedAt: string;
}

export interface PublicArticleListItem {
  title: string;
  slug: string;
  locale: string;
  excerpt: string;
  coverMediaId: string | null;
  tags: string[];
  publishedAt: string | null;
  seo: { metaTitle: string; metaDescription: string };
}

export interface PublicArticle {
  title: string;
  slug: string;
  locale: string;
  body: string;
  excerpt: string;
  coverMediaId: string | null;
  tags: string[];
  publishedAt: string | null;
  seo: { metaTitle: string; metaDescription: string };
}

export interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'article' | 'media';
  title: string;
  excerpt?: string;
  locale?: string;
  url: string;
}
