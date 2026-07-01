import { Link } from 'react-router';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CategoryBadge } from './CategoryBadge';
import { AuthorMeta } from './AuthorMeta';
import { useI18n } from '../../context/i18n';
import { pick } from '../../lib/localized';
import type { Post } from '../../data/posts';

interface FeaturedPostProps {
  post: Post;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const { t, locale } = useI18n();
  const title = pick(post.title, locale);

  return (
    <article className="border border-border rounded-xl overflow-hidden flex flex-col md:flex-row bg-card">
      <Link to={`/articles/${post.slug}`} className="md:w-1/2 aspect-video md:aspect-auto overflow-hidden block">
        <ImageWithFallback
          src={post.thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="md:w-1/2 p-6 sm:p-8 flex flex-col gap-4 justify-center">
        <CategoryBadge category={post.category} />
        <Link to={`/articles/${post.slug}`} className="group/title">
          <h2
            className="text-2xl sm:text-3xl"
            style={{ color: 'var(--foreground)', lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 'var(--font-weight-medium)' }}
          >
            {title}
          </h2>
        </Link>
        <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.75' }}>{pick(post.excerpt, locale)}</p>
        <AuthorMeta author={post.author} date={post.publishedAt} readTime={post.readTimeMin} />
        <div>
          <Button variant="outline" asChild>
            <Link to={`/articles/${post.slug}`}>{t.readMore}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
