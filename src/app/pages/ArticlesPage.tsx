import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { PostGrid } from '../components/blog/PostGrid';
import { posts } from '../data/posts';
import type { Category } from '../data/posts';
import { useI18n } from '../context/i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function ArticlesPage() {
  const { t } = useI18n();
  useDocumentTitle(t.nav.articles);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const allCategories = Array.from(new Set(posts.map((p) => p.category)));

  const filtered = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10 sm:mb-12">
        <h1 style={{ color: 'var(--foreground)' }}>{t.articles.title}</h1>
        <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
          {t.articles.subtitle(posts.length)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
        <button onClick={() => setActiveCategory(null)} className="rounded-md">
          <Badge variant={activeCategory === null ? 'default' : 'outline'} className="cursor-pointer px-3 py-1">
            {t.articles.all}
          </Badge>
        </button>
        {allCategories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? null : cat)} className="rounded-md">
            <Badge variant={activeCategory === cat ? 'default' : 'outline'} className="cursor-pointer px-3 py-1">
              {cat}
            </Badge>
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <PostGrid posts={filtered} />
      ) : (
        <p style={{ color: 'var(--muted-foreground)' }}>{t.articles.empty}</p>
      )}
    </div>
  );
}
