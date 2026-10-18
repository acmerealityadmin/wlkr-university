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
  avatarUrl?: string;
  locale?: string;
  role: UserRole;
  roleSubtype?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  hasPassword?: boolean;
  providers?: string[];
  schoolId?: string | null;
  districtId?: string | null;
  schoolIds?: string[];
  districtIds?: string[];
}

export type CourseTrack = '' | 'teacher' | 'admin' | 'first_30_days';

export interface PracticeLink {
  label: string;
  href: string;
}

export interface LessonAudio {
  id: string;
  url?: string;
  title?: string;
}

export interface LessonVariant {
  locale: string;
  title: string;
  body: string;
  practiceLinks?: PracticeLink[];
  mediaTitles?: { mediaId: string; title: string }[];
  audio?: LessonAudio | null;
}

export interface LessonMedia {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  mimeType?: string;
  originalFilename?: string;
  url?: string;
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
  track?: CourseTrack;
  hoursCredit?: number;
  competencyLine?: string;
  practiceLinks?: PracticeLink[];
  status: ContentStatus;
  authCategory?: 'WLKR_PRIVATE' | 'WLKR_PUBLIC';
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
  track?: CourseTrack;
  hoursCredit?: number;
  competencyLine?: string;
  practiceLinks?: PracticeLink[];
}

export interface LessonEdit {
  at: string;
  summary: string;
}

export interface LessonEditor {
  userId: string;
  name: string;
  edits: LessonEdit[];
}

export interface Lesson {
  id?: string;
  _id?: string;
  courseId: string;
  title: string;
  slug: string;
  body: string;
  order: number;
  approxMinutes?: number | null;
  mediaIds?: string[];
  media?: LessonMedia[];
  practiceLinks?: PracticeLink[];
  sourceLocale?: string;
  audio?: LessonAudio | null;
  variants?: LessonVariant[];
  editors?: LessonEditor[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuizStimulus {
  type: 'none' | 'image' | 'video' | 'text';
  mediaId: string | null;
  text: string;
}

export interface QuizQuestion {
  kind?: 'choice' | 'essay';
  prompt: string;
  stimulus?: QuizStimulus;
  choices: string[];
  points: number;
  allowText?: boolean;
  allowAudio?: boolean;
  correctAnswerIndex?: number; // only present for content authors
}

export interface QuizVariantQuestion {
  prompt: string;
  choices: string[];
  stimulusText: string;
}

export interface QuizVariant {
  locale: string;
  title: string;
  questions: QuizVariantQuestion[];
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string | null;
  placement?: 'start' | 'after_lesson' | 'end';
  title: string;
  passingScorePercent: number;
  questions: QuizQuestion[];
  variants?: QuizVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptAnswer {
  questionIndex: number;
  selectedIndex?: number | null;
  text?: string;
  audioMediaId?: string | null;
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
  courseId: {
    _id: string;
    title: string;
    slug: string;
    thumbnailMediaId: string | null;
    track?: CourseTrack;
    hoursCredit?: number;
  } | string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
  required?: boolean;
  dueAt?: string | null;
  assignmentId?: string | null;
}

export interface OwnerCertificate {
  id: string;
  courseId: string;
  enrollmentId: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: string;
  hoursCredit?: number;
  competencyLine?: string;
}

export interface CertificateListItem {
  _id: string;
  userId: string;
  courseId: { _id: string; title: string; slug: string; hoursCredit?: number; competencyLine?: string } | string;
  enrollmentId: string;
  certificateNumber: string;
  verificationCode: string;
  pdfStorageKey: string;
  issuedAt: string;
  hoursCredit?: number;
  competencyLine?: string;
}

export interface PublicCertificate {
  certificateNumber: string;
  verificationCode: string;
  courseId: string;
  courseTitle: string | null;
  recipientName: string | null;
  issuedAt: string;
  hoursCredit?: number;
  competencyLine?: string;
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

export type CalendarEventKind = 'personal' | 'session' | 'deadline' | 'course' | 'webinar' | 'office_hours';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  kind: CalendarEventKind;
  courseId: string | null;
  href?: string | null;
  readOnly?: boolean;
  source?: string;
  webinarId?: string;
  attendanceStatus?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WebinarKind = 'webinar' | 'office_hours';
export type WebinarAttendanceStatus = 'RSVP' | 'ATTENDED' | 'NO_SHOW';

export interface Webinar {
  id: string;
  title: string;
  slug: string;
  description: string;
  hostName: string;
  kind: WebinarKind;
  productTag: string;
  startsAt: string;
  endsAt: string;
  joinUrl: string;
  recordingUrl: string;
  slidesUrl: string;
  relatedCourseId: string | null;
  relatedArticleSlug: string;
  hoursCredit: number;
  locale?: string;
  tags: string[];
  status?: ContentStatus;
}

export interface WebinarAttendance {
  id?: string;
  webinarId?: string;
  status: WebinarAttendanceStatus;
  joinedAt?: string | null;
  minutesWatched?: number;
}

export interface PublicWebinar {
  title: string;
  slug: string;
  description: string;
  hostName: string;
  kind: WebinarKind;
  productTag: string;
  startsAt: string;
  endsAt: string;
  recordingUrl: string;
  slidesUrl: string;
  relatedArticleSlug: string;
  hoursCredit: number;
  tags: string[];
  upcoming: boolean;
}

export interface TrainingAssignment {
  id: string;
  courseId: string;
  course: { title: string; slug: string; hoursCredit: number } | null;
  districtId: string | null;
  schoolId: string | null;
  dueAt: string | null;
  status: string;
  createdAt: string;
}

export interface TrainingReportRow {
  userId: string;
  name: string;
  role: string;
  status: string;
  progressPercent: number;
  completedAt: string | null;
  dueAt: string | null;
}

export interface TrainingReport {
  assignment: {
    id: string;
    dueAt: string | null;
    course: { id: string; title: string; slug: string; hoursCredit: number } | null;
  };
  summary: { assigned: number; completed: number; percentComplete: number };
  rows: TrainingReportRow[];
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  allDay?: boolean;
  kind?: CalendarEventKind;
  courseId?: string | null;
}

export type UniversityTopicId =
  | 'music_education'
  | 'history_facts'
  | 'math'
  | 'language_arts'
  | 'science'
  | 'history'
  | 'technology';

export type UniversityFormatId = 'articles' | 'videos' | 'webinars' | 'conferences' | 'other';

export interface UniversityAdditionalEmail {
  email: string;
  label: string;
  notify: boolean;
}

export interface UniversityNotificationChannels {
  push: boolean;
  sms: boolean;
  email: boolean;
}

export interface UniversityProfile {
  phone: string;
  additionalEmails: UniversityAdditionalEmail[];
  topics: UniversityTopicId[];
  formats: UniversityFormatId[];
  notifyTopics: UniversityTopicId[];
  notifyFormats: UniversityFormatId[];
  channels: UniversityNotificationChannels;
  notifyPrimaryEmail: boolean;
  otherNotes: string;
  updatedAt: string | null;
}

export interface UniversityProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  locale?: string;
  currentPassword?: string;
  newPassword?: string;
  phone?: string;
  additionalEmails?: UniversityAdditionalEmail[];
  topics?: UniversityTopicId[];
  formats?: UniversityFormatId[];
  notifyTopics?: UniversityTopicId[];
  notifyFormats?: UniversityFormatId[];
  channels?: UniversityNotificationChannels;
  notifyPrimaryEmail?: boolean;
  otherNotes?: string;
}
