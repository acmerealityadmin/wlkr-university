/** Static-export slug lists. Keep in sync with ecko seed scripts. */

export const KNOWN_COURSE_SLUGS = [
  'using-ai-in-k-8',
  'teaching-ai-with-wlkrai',
  'wlkr-in-30-minutes',
  'first-week-in-the-classroom',
  'district-admin-roster-and-clever',
] as const;

export const KNOWN_LESSON_PAIRS = [
  { slug: 'using-ai-in-k-8', lessonSlug: 'useful-terms' },
  { slug: 'using-ai-in-k-8', lessonSlug: 'what-generative-ai-actually-is' },
  { slug: 'using-ai-in-k-8', lessonSlug: 'low-risk-ways-to-use-ai-for-planning' },
  { slug: 'using-ai-in-k-8', lessonSlug: 'age-appropriate-guardrails' },
  { slug: 'using-ai-in-k-8', lessonSlug: 'academic-integrity-considerations' },
  { slug: 'using-ai-in-k-8', lessonSlug: 'responsible-use-wrap-up' },
  { slug: 'teaching-ai-with-wlkrai', lessonSlug: 'onboarding-your-class-into-wlkrai' },
  { slug: 'teaching-ai-with-wlkrai', lessonSlug: 'monitoring-ai-tutor-interactions' },
  { slug: 'teaching-ai-with-wlkrai', lessonSlug: 'using-wlkr-progress-data' },
  { slug: 'teaching-ai-with-wlkrai', lessonSlug: 'troubleshooting-and-escalation' },
  { slug: 'wlkr-in-30-minutes', lessonSlug: 'what-students-see' },
  { slug: 'wlkr-in-30-minutes', lessonSlug: 'start-the-first-lesson' },
  { slug: 'first-week-in-the-classroom', lessonSlug: 'login-options' },
  { slug: 'first-week-in-the-classroom', lessonSlug: 'a-lesson-block' },
  { slug: 'district-admin-roster-and-clever', lessonSlug: 'confirm-the-roster' },
  { slug: 'district-admin-roster-and-clever', lessonSlug: 'clever-instant-login' },
] as const;

export const KNOWN_WEBINAR_SLUGS = [
  'ecko-office-hours',
  'clever-go-live-clinic',
  'infinity-and-school-hub-recording',
] as const;

export const KNOWN_ARTICLE_SLUGS = [
  'anatomy-of-a-prompt',
  'ai-basics-for-teachers',
  'using-technology-in-the-classroom',
] as const;
