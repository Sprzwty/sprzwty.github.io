import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { HeroSection } from '../components/blog/HeroSection';
import { FeaturedPost } from '../components/blog/FeaturedPost';
import { PostGrid } from '../components/blog/PostGrid';
import { posts, featuredPost, recentPosts } from '../data/posts';
import { useI18n } from '../context/i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function HomePage() {
  const { t } = useI18n();
  useDocumentTitle();

  const hasPosts = posts.length > 0;

  return (
    <div>
      <HeroSection />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col gap-12 sm:gap-16">
        {!hasPosts ? (
          <p className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            {t.articles.empty}
          </p>
        ) : (
          <>
            {featuredPost && (
              <section>
                <h2 className="mb-6 sm:mb-8" style={{ color: 'var(--foreground)' }}>{t.home.featured}</h2>
                <FeaturedPost post={featuredPost} />
              </section>
            )}
            <section>
              <PostGrid posts={recentPosts.slice(0, 6)} title={t.home.latest} />
              <div className="text-center mt-8 sm:mt-10">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/articles">{t.home.viewAll}</Link>
                </Button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
