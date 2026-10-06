'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { useAuth } from '@/store/auth';
import { usePathname } from '@/i18n/navigation';

export function PortalShell({
  variant,
  locale,
  children,
}: {
  variant: 'public' | 'app';
  locale: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { initialize } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950">
      <Sidebar variant={variant} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col lg:ms-64">
        <PortalHeader locale={locale} onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="animate-fade-in flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
