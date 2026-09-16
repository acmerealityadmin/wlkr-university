import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { publicCoursesApi } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'public.courses' });
  return { title: t('title'), description: t('description') };
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('public.courses');
  const courses = await publicCoursesApi.list({ locale }).then((d) => d.courses).catch(() => []);

  return (
    <div className="master-column py-16">
      <h1 className="font-heading text-3xl font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h1>
      <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">{t('description')}</p>

      {courses.length === 0 ? (
        <p className="mt-10 text-gray-500">{t('empty')}</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.slug} href={`/courses/${course.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-card-hover">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
