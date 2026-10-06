'use client';

import { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isNative } from '@/lib/capacitor';

function ThemeStatusBar() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!isNative() || !resolvedTheme) return;
    const isDark = resolvedTheme === 'dark';
    void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => undefined);
    void StatusBar.setBackgroundColor({ color: isDark ? '#0b0914' : '#f7f5fb' }).catch(() => undefined);
  }, [resolvedTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ThemeStatusBar />
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'rounded-xl font-sans text-sm',
          },
        }}
      />
    </ThemeProvider>
  );
}
