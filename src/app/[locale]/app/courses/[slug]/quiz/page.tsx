import { QuizView } from './QuizView';

// Known launch slugs — see scripts/seedUniversity.js.
const KNOWN_SLUGS = ['using-ai-in-k-8', 'teaching-ai-with-wlkrai'];

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuizView courseSlug={slug} />;
}
