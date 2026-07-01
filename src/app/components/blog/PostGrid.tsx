import { PostCard } from './PostCard';
import type { Post } from '../../data/posts';

interface PostGridProps {
  posts: Post[];
  title?: string;
}

export function PostGrid({ posts, title }: PostGridProps) {
  return (
    <section>
      {title && <h2 className="mb-6 sm:mb-8" style={{ color: 'var(--foreground)' }}>{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
