import { Outlet } from 'react-router';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { SiteMeta } from './SiteMeta';
import { Toaster } from '../ui/sonner';
import { useI18n, localeFontFamily } from '../../context/i18n';

export function RootLayout() {
  const { locale } = useI18n();
  return (
    <div
      className="min-h-screen flex flex-col bg-background font-body"
      style={{ fontFamily: localeFontFamily[locale] }}
    >
      <SiteMeta />
      <ScrollToTop />
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
