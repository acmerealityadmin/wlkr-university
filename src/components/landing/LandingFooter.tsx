import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { UniversityCrest } from '@/components/landing/UniversityCrest';
import { EXPLORE_PAGES } from '@/lib/explore';

const SITE = 'https://wlkrlearning.com';

type FooterLink = { label: string; href: string; external?: boolean };

export async function LandingFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'public.landing.footer' });
  const nav = await getTranslations({ locale, namespace: 'common.nav' });
  const explore = await getTranslations({ locale, namespace: 'public.explore' });

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t('explore'),
      links: [
        ...EXPLORE_PAGES.map((page) => ({ label: explore(`names.${page.key}`), href: `/explore/${page.slug}` })),
        { label: t('blog'), href: '/articles' },
      ],
    },
    {
      title: t('educators'),
      links: [
        { label: nav('login'), href: '/login' },
        { label: nav('createAccount'), href: '/signup' },
        { label: t('verify'), href: '/certificates/verify' },
      ],
    },
    {
      title: t('wlkr'),
      links: [
        { label: t('about'), href: `${SITE}/educators`, external: true },
        { label: t('schools'), href: `${SITE}/schools`, external: true },
        { label: t('contact'), href: `${SITE}/#contact`, external: true },
      ],
    },
  ];

  return (
    <footer className="bg-brand-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-10">
        <div>
          <UniversityCrest size="sm" />
          <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-400">{t('tagline')}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="font-display text-sm font-bold tracking-[0.2em] text-[#e9d49a]">{column.title.toUpperCase()}</h2>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-base text-slate-300 hover:text-white">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-base text-slate-300 hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} ACME Reality · WLKR Learning. {t('rights')}
          </p>
          <div className="flex gap-6">
            <a href={`${SITE}/privacy`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              {t('privacy')}
            </a>
            <a href={`${SITE}/terms`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              {t('terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
