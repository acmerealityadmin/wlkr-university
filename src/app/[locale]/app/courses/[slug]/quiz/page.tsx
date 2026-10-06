import { PracticeChat } from '../practice/PracticeChat';
import { KNOWN_COURSE_SLUGS } from '@/lib/known-catalog';

export function generateStaticParams() {
  return KNOWN_COURSE_SLUGS.map((slug) => ({ slug }));
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PracticeChat courseSlug={slug} />;
}
