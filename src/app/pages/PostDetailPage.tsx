import { useParams, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CategoryBadge } from '../components/blog/CategoryBadge';
import { AuthorMeta } from '../components/blog/AuthorMeta';
import { MarkdownContent } from '../components/shared/MarkdownContent';
import { posts } from '../data/posts';
import { useI18n } from '../context/i18n';
import { pick } from '../lib/localized';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useI18n();
  const post = posts.find((p) => p.slug === slug);

  useDocumentTitle(post ? pick(post.title, locale) : t.postDetail.notFound);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32 text-center flex flex-col items-center gap-6">
        <h1 style={{ color: 'var(--foreground)' }}>{t.postDetail.notFound}</h1>
        <Button variant="outline" asChild>
          <Link to="/articles">{t.postDetail.back}</Link>
        </Button>
      </div>
    );
  }

  const title = pick(post.title, locale);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col gap-4 mb-8">
        <CategoryBadge category={post.category} />
        <h1 style={{ color: 'var(--foreground)', lineHeight: '1.25' }}>{title}</h1>
        <AuthorMeta author={post.author} date={post.publishedAt} readTime={post.readTimeMin} />
      </div>

      <Separator className="mb-8" />

      <div className="aspect-video rounded-xl overflow-hidden mb-10">
        <ImageWithFallback src={post.thumbnailUrl} alt={title} className="w-full h-full object-cover" />
      </div>

      <MarkdownContent content={pick(post.body, locale)} />

      <Separator className="my-10" />

      <Button variant="outline" asChild>
        <Link to="/articles">{t.postDetail.back}</Link>
      </Button>
    </article>
  );
}
