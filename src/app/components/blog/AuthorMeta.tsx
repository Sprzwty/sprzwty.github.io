import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useI18n } from '../../context/i18n';
import type { Author } from '../../data/posts';

interface AuthorMetaProps {
  author: Author;
  date: string;
  readTime: number;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(
    locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );
}

export function AuthorMeta({ author, date, readTime }: AuthorMetaProps) {
  const { locale, t } = useI18n();
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Avatar className="size-6 sm:size-7 shrink-0">
        <AvatarImage src={author.avatarUrl} alt={author.name} />
        <AvatarFallback className="text-xs">{author.initials}</AvatarFallback>
      </Avatar>
      <span style={{ color: 'var(--foreground)' }} className="text-sm">
        {author.name}
      </span>
      <span style={{ color: 'var(--muted-foreground)' }} className="text-sm">·</span>
      <span style={{ color: 'var(--muted-foreground)' }} className="text-sm">
        {formatDate(date, locale)}
      </span>
      <span style={{ color: 'var(--muted-foreground)' }} className="text-sm">·</span>
      <span style={{ color: 'var(--muted-foreground)' }} className="text-sm">
        {t.minRead(readTime)}
      </span>
    </div>
  );
}
