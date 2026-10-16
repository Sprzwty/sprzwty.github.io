import { createHashRouter } from 'react-router';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { LifePage } from './pages/LifePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createHashRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'articles', Component: ArticlesPage },
      { path: 'articles/:slug', Component: PostDetailPage },
      { path: 'life', Component: LifePage },
      { path: 'about', Component: AboutPage },
      { path: 'contact', Component: ContactPage },
      // Unlisted and code-split: keeps the fitness bundle out of the public pages.
      { path: 'fitness', lazy: () => import('./pages/FitnessPage').then((m) => ({ Component: m.FitnessPage })) },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
