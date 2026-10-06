import { CourseAppView } from './CourseAppView';
import { KNOWN_COURSE_SLUGS } from '@/lib/known-catalog';

export function generateStaticParams() {
  return KNOWN_COURSE_SLUGS.map((slug) => ({ slug }));
}

export default async function AppCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseAppView slug={slug} />;
}
