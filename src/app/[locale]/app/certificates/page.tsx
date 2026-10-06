'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils';
import { certificatesApi } from '@/lib/api';
import { hoursLabel } from '@/components/learning/TrackBadge';
import type { CertificateListItem } from '@/types/api';

export default function CertificatesPage() {
  const t = useTranslations('app.certificates');
  const [certificates, setCertificates] = useState<CertificateListItem[] | null>(null);

  useEffect(() => {
    certificatesApi.list().then((d) => setCertificates(d.certificates)).catch(() => setCertificates([]));
  }, []);

  const onDownload = async (cert: CertificateListItem) => {
    const blob = await certificatesApi.downloadFile(cert._id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.certificateNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {certificates === null ? (
        <PageSpinner />
      ) : certificates.length === 0 ? (
        <p className="text-sm text-gray-500">{t('empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {certificates.map((cert) => {
            const course = typeof cert.courseId === 'string' ? null : cert.courseId;
            const hours = hoursLabel(cert.hoursCredit || course?.hoursCredit);
            const competency = cert.competencyLine || course?.competencyLine;
            return (
              <Card key={cert._id}>
                <CardHeader>
                  <CardTitle>{course?.title ?? 'Course'}</CardTitle>
                  <CardDescription>
                    {t('issuedOn')}: {formatDate(cert.issuedAt)}
                    {hours ? ` · ${hours}` : ''}
                  </CardDescription>
                  {competency && <p className="pt-1 text-sm text-gray-600 dark:text-gray-300">{competency}</p>}
                </CardHeader>
                <div className="px-5 pb-5">
                  <Button size="sm" variant="outline" onClick={() => onDownload(cert)}>
                    <Download className="h-4 w-4" />
                    {t('download')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
