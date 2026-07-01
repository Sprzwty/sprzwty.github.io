// Seed content — overwritten by `npm run sync:posts` (scripts/fetch-notion-posts.mjs)
// once the blog Notion database is connected. Kept here so `npm run dev` has
// something to render before the first sync.
import type { LocalizedText } from '../lib/localized';

/** Free-form — comes from whatever value you use in the Notion "Category" select. */
export type Category = string;

export interface Author {
  name: string;
  avatarUrl: string;
  initials: string;
  bio: LocalizedText;
}

export interface Post {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  /** Markdown source (from Notion, via notion-to-md). Rendered with <MarkdownContent>. */
  body: LocalizedText;
  category: Category;
  thumbnailUrl: string;
  author: Author;
  publishedAt: string;
  readTimeMin: number;
  featured: boolean;
}

const wang: Author = {
  name: 'Wang Tongyu',
  avatarUrl: '/assets/profile.webp',
  initials: 'WT',
  bio: {
    en: 'JAIST master\'s student researching trustworthy AI and knowledge representation.',
    zh: 'JAIST 硕士研究生，研究方向为可信赖人工智能与知识表示。',
    ja: 'JAIST の修士課程学生。信頼できる AI と知識表現を研究。',
  },
};

export const posts: Post[] = [
  {
    id: '1',
    slug: 'welcome-to-the-new-site',
    title: {
      en: 'Welcome to the new site',
      zh: '欢迎来到新站点',
      ja: '新しいサイトへようこそ',
    },
    excerpt: {
      en: 'This blog now runs on a Notion-driven React app — write in Notion, publish automatically.',
      zh: '博客现在由 Notion 驱动的 React 应用支撑——在 Notion 里写作，自动发布。',
      ja: 'このブログは Notion 駆動の React アプリで動いています——Notion で書けば自動的に公開されます。',
    },
    body: {
      en: '## A new foundation\n\nArticles here are authored in Notion and synced automatically. Once the blog database is connected, this seed post will be replaced by real content.',
      zh: '## 全新的基础架构\n\n这里的文章都在 Notion 中撰写并自动同步。等博客数据库连接完成后，这篇占位文章会被真实内容替换。',
      ja: '## 新しい基盤\n\nここの記事は Notion で執筆され、自動的に同期されます。ブログ用データベースが接続されると、この仮の記事は実際のコンテンツに置き換わります。',
    },
    category: 'Meta',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    author: wang,
    publishedAt: '2026-07-01',
    readTimeMin: 2,
    featured: true,
  },
];

export const featuredPost = posts.find((p) => p.featured) ?? posts[0];
export const recentPosts = posts.filter((p) => !p.featured);
