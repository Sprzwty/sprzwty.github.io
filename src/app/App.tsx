import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from './context/i18n';
import { DiaryProvider } from './context/diary';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <DiaryProvider>
          <RouterProvider router={router} />
        </DiaryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
