import { Suspense } from 'react';
import { QuizPlay } from './QuizPlay';
import { KNOWN_COURSE_SLUGS } from '@/lib/known-catalog';

export function generateStaticParams() {
  return KNOWN_COURSE_SLUGS.map((slug) => ({ slug }));
}

export default async function QuizzesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <QuizPlay courseSlug={slug} />
    </Suspense>
  );
}
