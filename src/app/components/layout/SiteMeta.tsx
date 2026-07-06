import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useI18n } from '../../context/i18n';

const SITE_TITLES = {
  en: 'Tongyu Wang — Engineering · AI · Life',
  zh: '王童语 — 工程 · AI · 生活',
  ja: '王童語 — エンジニアリング · AI · 生活',
} as const;

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Keeps document title and OG/meta description in sync with locale. */
export function SiteMeta() {
  const { locale, t } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== '/') return;

    document.title = SITE_TITLES[locale];
    setMeta('description', t.hero.subtitle);
    setMeta('og:title', SITE_TITLES[locale], 'property');
    setMeta('og:description', t.hero.subtitle, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:image', `${window.location.origin}/assets/profile.webp`, 'property');
  }, [locale, t.hero.subtitle, pathname]);

  return null;
}
