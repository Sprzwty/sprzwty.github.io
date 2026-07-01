import { Link } from 'react-router';
import { Github } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { PostGrid } from '../components/blog/PostGrid';
import { posts } from '../data/posts';
import { useI18n } from '../context/i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function AboutPage() {
  const { t } = useI18n();
  useDocumentTitle(t.nav.about);
  const recent = posts.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 items-center sm:items-start">
        <Avatar className="size-20 sm:size-24 shrink-0">
          <AvatarImage src="/assets/profile.webp" alt="Wang Tongyu" />
          <AvatarFallback className="text-xl">WT</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <div>
            <h1 style={{ color: 'var(--foreground)' }}>Wang Tongyu</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>{t.about.role}</p>
          </div>
          <p style={{ color: 'var(--foreground)', lineHeight: '1.75' }}>{t.about.bio1}</p>
          <p style={{ color: 'var(--foreground)', lineHeight: '1.75' }}>{t.about.bio2}</p>
          <p style={{ color: 'var(--foreground)', lineHeight: '1.75' }}>{t.about.bio3}</p>
          <div className="flex gap-3 justify-center sm:justify-start mt-1">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/sprzwty" target="_blank" rel="noreferrer"><Github className="size-4" />GitHub</a>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-10 sm:my-12" />

      <section>
        <h2 className="mb-6 sm:mb-8" style={{ color: 'var(--foreground)' }}>{t.about.recentWriting}</h2>
        <PostGrid posts={recent} />
        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/articles">{t.about.viewAll}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
