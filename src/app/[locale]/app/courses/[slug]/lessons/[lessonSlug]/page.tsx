import { LessonView } from './LessonView';
import { KNOWN_LESSON_PAIRS } from '@/lib/known-catalog';

export function generateStaticParams() {
  return [...KNOWN_LESSON_PAIRS];
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  return <LessonView courseSlug={slug} lessonSlug={lessonSlug} />;
}
