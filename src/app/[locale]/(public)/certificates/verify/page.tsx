'use client';

// A static export (`output: 'export'`) cannot serve an arbitrary dynamic
// path segment per verification code — every dynamic route segment must be
// enumerable via generateStaticParams at build time, and certificate codes
// are minted at issuance, long after build. So this is a single static page
// reading ?code=... from the query string and resolving it client-side,
// rather than /certificates/verify/[code].

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PageSpinner } from '@/components/ui/spinner';
import { publicCertificatesApi } from '@/lib/api';
import type { PublicCertificate } from '@/types/api';

function VerifyContent() {
  const t = useTranslations('public.certificateVerify');
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<PublicCertificate | null>(null);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }
    publicCertificatesApi
      .verify(code)
      .then((d) => setCertificate(d.certificate))
      .catch(() => setCertificate(null))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="max-w-lg">
      <p className="text-sm text-gray-500">{t('description')}</p>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <PageSpinner />
        ) : certificate ? (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 font-medium text-emerald-700 dark:text-emerald-400">{t('valid')}</p>
            <dl className="mt-6 space-y-2 text-left text-sm">
              {certificate.recipientName && (
                <div className="flex justify-between border-b border-border py-2">
                  <dt className="text-muted-foreground">{t('recipient')}</dt>
                  <dd className="font-medium text-foreground">{certificate.recipientName}</dd>
                </div>
              )}
              {certificate.courseTitle && (
                <div className="flex justify-between border-b border-border py-2">
                  <dt className="text-muted-foreground">{t('course')}</dt>
                  <dd className="font-medium text-foreground">{certificate.courseTitle}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-muted-foreground">{t('issuedAt')}</dt>
                <dd className="font-medium text-foreground">{formatDate(certificate.issuedAt)}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">{t('number')}</dt>
                <dd className="font-mono text-xs text-foreground">{certificate.certificateNumber}</dd>
              </div>
              {!!certificate.hoursCredit && (
                <div className="flex justify-between border-t border-border py-2">
                  <dt className="text-muted-foreground">{t('hours')}</dt>
                  <dd className="font-medium text-foreground">
                    {certificate.hoursCredit === 1 ? '1' : String(certificate.hoursCredit)}
                  </dd>
                </div>
              )}
              {certificate.competencyLine && (
                <div className="flex justify-between border-t border-border py-2">
                  <dt className="text-muted-foreground">{t('competency')}</dt>
                  <dd className="max-w-[60%] text-right font-medium text-foreground">{certificate.competencyLine}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-10 w-10 text-rose-500" />
            <p className="mt-3 font-medium text-rose-700 dark:text-rose-400">{t('invalid')}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <VerifyContent />
    </Suspense>
  );
}
