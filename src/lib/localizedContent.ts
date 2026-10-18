import type { Lesson, LessonMedia, Quiz, QuizQuestion } from '@/types/api';

export function localizeLesson(lesson: Lesson, locale: string): Lesson {
  const source = lesson.sourceLocale || 'en';
  if (!locale || locale === source) return lesson;
  const variant = (lesson.variants || []).find((row) => row.locale === locale);
  if (!variant) return lesson;
  const titles = new Map((variant.mediaTitles || []).map((row) => [row.mediaId, row.title]));
  const links = lesson.practiceLinks || [];
  return {
    ...lesson,
    title: variant.title || lesson.title,
    body: variant.body || lesson.body,
    practiceLinks: links.map((link, index) => ({
      href: link.href,
      label: variant.practiceLinks?.[index]?.label || link.label,
    })),
    media: (lesson.media || []).map((item) => ({
      ...item,
      title: titles.get(item.id) || item.title,
    })) as LessonMedia[],
    audio: variant.audio?.url ? variant.audio : null,
  };
}

export function localizeQuiz(quiz: Quiz, locale: string): Quiz {
  const variant = (quiz.variants || []).find((row) => row.locale === locale);
  if (!variant) return quiz;
  return {
    ...quiz,
    title: variant.title || quiz.title,
    questions: quiz.questions.map((question, index) => {
      const translated = variant.questions?.[index];
      if (!translated) return question;
      const next: QuizQuestion = {
        ...question,
        prompt: translated.prompt || question.prompt,
      };
      if (question.kind !== 'essay' && translated.choices?.length) next.choices = translated.choices;
      if (question.stimulus?.type === 'text' && translated.stimulusText) {
        next.stimulus = { ...question.stimulus, text: translated.stimulusText };
      }
      return next;
    }),
  };
}
