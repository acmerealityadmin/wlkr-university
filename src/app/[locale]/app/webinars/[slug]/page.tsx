import { WebinarAppView } from './WebinarAppView';
import { KNOWN_WEBINAR_SLUGS } from '@/lib/known-catalog';

export function generateStaticParams() {
  return KNOWN_WEBINAR_SLUGS.map((slug) => ({ slug }));
}

export default async function AppWebinarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WebinarAppView slug={slug} />;
}
