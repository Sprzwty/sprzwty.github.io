import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { CategoryBadge } from '../blog/CategoryBadge';
import { useI18n } from '../../context/i18n';
import { pick } from '../../lib/localized';
import { posts } from '../../data/posts';

/** Split text into segments, marking the case-insensitive matches of `query`. */
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(lowerQ, i);
    if (idx === -1) {
      parts.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) parts.push({ text: text.slice(i, idx), match: false });
    parts.push({ text: text.slice(idx, idx + q.length), match: true });
    i = idx + q.length;
  }
  return parts;
}

export function SearchBar() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (q.length < 2) return [];
    return posts.filter((p) => {
      const haystack = [
        pick(p.title, locale),
        pick(p.excerpt, locale),
        pick(p.body, locale),
        p.category,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [debounced, locale]);

  useEffect(() => setActiveIndex(0), [debounced]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    setQuery('');
    setDebounced('');
    triggerRef.current?.focus();
  }, [open]);

  const handleSelect = (slug: string) => {
    navigate(`/articles/${slug}`);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      handleSelect(results[activeIndex].slug);
    }
  };

  return (
    <>
      <Button ref={triggerRef} variant="ghost" size="icon" aria-label={t.nav.search} onClick={() => setOpen(true)}>
        <Search className="size-4" />
      </Button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex flex-col px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
          onKeyDown={onKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.search}
        >
          <div
            className="w-full max-w-xl mx-auto mt-20 rounded-xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <Search className="size-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--foreground)' }}
              />
              <button onClick={() => setOpen(false)} aria-label="Close search">
                <X className="size-4" style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {debounced.trim().length >= 2 && results.length === 0 && (
                <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
                  {t.search.noResults}
                </p>
              )}
              {results.map((post, i) => {
                const title = pick(post.title, locale);
                return (
                  <button
                    key={post.id}
                    onClick={() => handleSelect(post.slug)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors"
                    style={{ background: i === activeIndex ? 'var(--accent)' : 'transparent' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryBadge category={post.category} />
                      </div>
                      <p className="text-sm truncate" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                        {highlight(title, debounced).map((seg, k) => (
                          <span key={k} style={seg.match ? { background: 'var(--chart-4)', color: '#000', borderRadius: '2px' } : undefined}>
                            {seg.text}
                          </span>
                        ))}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--muted-foreground)' }}>
                        {pick(post.excerpt, locale)}
                      </p>
                    </div>
                  </button>
                );
              })}
              {debounced.trim().length < 2 && (
                <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
                  {t.nav.searchPlaceholder}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
