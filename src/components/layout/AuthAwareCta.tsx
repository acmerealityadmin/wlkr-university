'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';

/** Public-page CTA that keeps signed-in educators in /app instead of /login. */
export function AuthAwareCta({
  guestHref = '/login',
  guestLabel,
  signedInHref,
  signedInLabel,
  className,
  variant = 'button',
}: {
  guestHref?: string;
  guestLabel: string;
  signedInHref: string;
  signedInLabel: string;
  className?: string;
  variant?: 'button' | 'link';
}) {
  const { user, isInitialized, initialize } = useAuth();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!isInitialized) return null;

  const href = user ? signedInHref : guestHref;
  const label = user ? signedInLabel : guestLabel;

  if (variant === 'link') {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <Button asChild className={className}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
