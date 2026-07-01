import { Link } from 'react-router';
import { Card, CardContent, CardFooter } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CategoryBadge } from './CategoryBadge';
import { AuthorMeta } from './AuthorMeta';
import { useI18n } from '../../context/i18n';
import { pick } from '../../lib/localized';
import type { Post } from '../../data/posts';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { locale } = useI18n();
  const title = pick(post.title, locale);

  return (
    <Link to={`/articles/${post.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden gap-0 p-0 transition-shadow duration-200 hover:shadow-lg">
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={post.thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col flex-1 p-5">
          <CategoryBadge category={post.category} />

          <h3
            className="mt-3 mb-3 line-clamp-2 text-xl"
            style={{
              color: 'var(--card-foreground)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>

          <CardContent className="p-0 flex-1">
            <p
              className="text-sm line-clamp-3"
              style={{ color: 'var(--muted-foreground)', lineHeight: '1.65' }}
            >
              {pick(post.excerpt, locale)}
            </p>
          </CardContent>

          <CardFooter className="p-0 pt-4 mt-auto">
            <AuthorMeta author={post.author} date={post.publishedAt} readTime={post.readTimeMin} />
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
