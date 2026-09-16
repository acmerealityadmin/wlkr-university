import { LessonView } from './LessonView';

// Known launch (course slug, lesson slug) pairs — see scripts/seedUniversity.js.
const KNOWN_PAIRS = [
  { slug: 'using-ai-in-k-8', lessonSlug: 'introduction' },
  { slug: 'teaching-ai-with-wlkrai', lessonSlug: 'introduction' },
];

export function generateStaticParams() {
  return KNOWN_PAIRS;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  return <LessonView courseSlug={slug} lessonSlug={lessonSlug} />;
}
