import { CourseAppView } from './CourseAppView';

// Known launch slugs — see scripts/seedUniversity.js in wlkr-ecko-server.
// This is a client-rendered shell (auth + data fetched in the browser, same
// SPA-against-API pattern as wlkr-ed-portal), so static export only needs a
// stable shell per known slug, not build-time data.
const KNOWN_SLUGS = ['using-ai-in-k-8', 'teaching-ai-with-wlkrai'];

export function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
}

export default async function AppCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseAppView slug={slug} />;
}
