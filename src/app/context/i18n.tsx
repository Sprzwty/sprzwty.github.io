import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'zh' | 'ja';

const LOCALE_STORAGE_KEY = 'locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === 'en' || stored === 'zh' || stored === 'ja' ? stored : 'en';
}

export interface Translations {
  nav: { home: string; articles: string; life: string; about: string; contact: string; changelog: string; search: string; searchPlaceholder: string };
  hero: { badge: string; title: string; subtitle: string; ctaFeatured: string; ctaAbout: string };
  home: {
    featured: string;
    latest: string;
    viewAll: string;
    lanes: {
      research: { title: string; description: string };
      engineering: { title: string; description: string };
      life: { title: string; description: string };
    };
  };
  articles: { title: string; subtitle: (count: number) => string; all: string; empty: string };
  postDetail: { back: string; notFound: string };
  about: { role: string; bio1: string; bio2: string; bio3: string; recentWriting: string; viewAll: string };
  contact: { title: string; subtitle: string; email: string; responseTime: string; responseTimeValue: string; openTo: string; openToValue: string; send: string; newsletterTitle: string; newsletterDesc: string; emailPlaceholder: string; subscribe: string; subscribed: string; invalidEmail: string };
  footer: { tagline: string; navigation: string; follow: string; copyright: string; nowLabel: string; nowText: string };
  notFound: { title: string; desc: string; goHome: string };
  search: { noResults: string };
  life: { title: string; subtitle: string; views: { impact: string; normal: string }; entryCount: (n: number) => string; expand: string; collapse: string };
  diary: { empty: string };
  changelog: {
    title: string;
    subtitle: string;
    latest: string;
    versionLabel: string;
    changeTypes: { added: string; changed: string; fixed: string; removed: string };
  };
  readMore: string;
  minRead: (n: number) => string;
  theme: { toggle: string };
}

const en: Translations = {
  nav: { home: 'Home', articles: 'Articles', life: 'Life', about: 'About', contact: 'Contact', changelog: 'Changelog', search: 'Search', searchPlaceholder: 'Search articles…' },
  hero: {
    badge: 'AI Research · Engineering · Life',
    title: 'Tongyu Wang',
    subtitle: 'Software engineer at ARKRAY. I write measurement algorithms for medical devices and build the GUIs around them. Blog covers engineering, AI experiments, and life.',
    ctaFeatured: 'Read featured',
    ctaAbout: 'About me',
  },
  home: {
    featured: 'Featured Post',
    latest: 'Latest Articles',
    viewAll: 'View All Articles',
    lanes: {
      research: { title: 'AI Research', description: 'Experiments, papers, and ideas on trustworthy AI.' },
      engineering: { title: 'Engineering', description: 'Measurement algorithms, GUI work, and notes from building medical device software.' },
      life: { title: 'Life', description: 'Moments, milestones, and everyday notes from Japan.' },
    },
  },
  articles: { title: 'All Articles', subtitle: (n) => `${n} articles across design, development, and beyond.`, all: 'All', empty: 'No articles in this category yet.' },
  postDetail: { back: '← Back to Articles', notFound: 'Post not found' },
  about: {
    role: 'Software Engineer · ARKRAY',
    bio1: "Wang Tongyu, software engineer at ARKRAY. Medical device software — measurement algorithms and the interfaces people actually use.",
    bio2: 'Posts here are mostly engineering notes, AI experiments I\'m trying, and occasional life updates.',
    bio3: 'Off hours: side projects and exploring new places.',
    recentWriting: 'My Recent Writing',
    viewAll: 'View All Articles →',
  },
  contact: { title: 'Get in Touch', subtitle: 'Have a question, a collaboration idea, or just want to say hello? I\'d love to hear from you.', email: 'Email', responseTime: 'Response Time', responseTimeValue: 'Usually within 2–3 business days', openTo: 'What I\'m open to', openToValue: 'Research discussions, collaboration ideas, and reader questions.', send: 'Send an Email', newsletterTitle: 'Subscribe to the newsletter', newsletterDesc: 'Get new articles delivered to your inbox. No spam, unsubscribe anytime.', emailPlaceholder: 'you@example.com', subscribe: 'Subscribe', subscribed: 'Thanks for subscribing!', invalidEmail: 'Please enter a valid email address.' },
  footer: {
    tagline: 'Notes on AI research, engineering, and everyday life.',
    navigation: 'Navigation',
    follow: 'Follow Along',
    copyright: '© 2026 Wang Tongyu. All rights reserved.',
    nowLabel: 'Now',
    nowText: 'Working on personal blog v2',
  },
  notFound: { title: 'Page not found', desc: 'The page you\'re looking for doesn\'t exist or has been moved.', goHome: 'Go Home' },
  search: { noResults: 'No results found.' },
  life: { title: 'My Life', subtitle: 'A timeline of moments, milestones, and memories.', views: { impact: 'Impact', normal: 'Normal' }, entryCount: (n) => `${n} ${n === 1 ? 'entry' : 'entries'}`, expand: 'Read more', collapse: 'Show less' },
  diary: { empty: 'No entries yet.' },
  changelog: {
    title: 'Changelog',
    subtitle: 'A timeline of site versions and what changed in each release.',
    latest: 'Latest',
    versionLabel: 'Version',
    changeTypes: { added: 'Added', changed: 'Changed', fixed: 'Fixed', removed: 'Removed' },
  },
  readMore: 'Read Article →',
  minRead: (n) => `${n} min read`,
  theme: { toggle: 'Toggle theme' },
};

const zh: Translations = {
  nav: { home: '首页', articles: '文章', life: '生活', about: '关于', contact: '联系', changelog: '更新说明', search: '搜索', searchPlaceholder: '搜索文章…' },
  hero: {
    badge: 'AI 研究 · 工程 · 生活',
    title: '王童语',
    subtitle: 'ARKRAY 软件工程师。做医疗设备测量算法，也写界面。博客记工程、AI 尝试和生活。',
    ctaFeatured: '阅读精选',
    ctaAbout: '关于我',
  },
  home: {
    featured: '精选文章',
    latest: '最新文章',
    viewAll: '查看全部文章',
    lanes: {
      research: { title: 'AI 研究', description: '可信赖 AI 实验、论文阅读与思考笔记。' },
      engineering: { title: '工程实践', description: '医疗设备算法、界面开发，以及做这些时的记录。' },
      life: { title: '生活', description: '日常点滴、里程碑与在日本的见闻。' },
    },
  },
  articles: { title: '全部文章', subtitle: (n) => `共 ${n} 篇关于设计、开发等主题的文章。`, all: '全部', empty: '该分类暂无文章。' },
  postDetail: { back: '← 返回文章列表', notFound: '文章未找到' },
  about: {
    role: 'ARKRAY 软件工程师',
    bio1: '在 ARKRAY 做医疗设备软件——算法和界面都做。',
    bio2: '博客写在做的东西、折腾的 AI 和生活碎片。',
    bio3: '下班后会捣鼓个人项目，到处走走。',
    recentWriting: '我的近期文章',
    viewAll: '查看全部文章 →',
  },
  contact: { title: '联系我', subtitle: '有问题、合作想法，或者只是想打个招呼？我很乐意收到你的消息。', email: '邮件', responseTime: '回复时间', responseTimeValue: '通常在 2–3 个工作日内', openTo: '开放合作', openToValue: '研究交流、合作想法及读者问题。', send: '发送邮件', newsletterTitle: '订阅新闻邮件', newsletterDesc: '新文章将直接送达你的邮箱。绝无垃圾邮件，可随时退订。', emailPlaceholder: 'you@example.com', subscribe: '订阅', subscribed: '感谢订阅！', invalidEmail: '请输入有效的邮箱地址。' },
  footer: {
    tagline: '记录 AI 研究、工程实践与日常生活。',
    navigation: '导航',
    follow: '关注我',
    copyright: '© 2026 Wang Tongyu 版权所有。',
    nowLabel: '近况',
    nowText: '在折腾个人博客 v2',
  },
  notFound: { title: '页面未找到', desc: '您访问的页面不存在或已被移动。', goHome: '返回首页' },
  search: { noResults: '未找到相关结果。' },
  life: { title: '我的生活', subtitle: '记录时光里的每一个片刻与里程碑。', views: { impact: '大图', normal: '时间轴' }, entryCount: (n) => `${n} 篇`, expand: '展开全文', collapse: '收起' },
  diary: { empty: '暂无日记条目。' },
  changelog: {
    title: '更新说明',
    subtitle: '以时间轴记录网站各版本的更新内容。',
    latest: '最新',
    versionLabel: '版本',
    changeTypes: { added: '新增', changed: '变更', fixed: '修复', removed: '移除' },
  },
  readMore: '阅读全文 →',
  minRead: (n) => `${n} 分钟阅读`,
  theme: { toggle: '切换主题' },
};

const ja: Translations = {
  nav: { home: 'ホーム', articles: '記事', life: '人生', about: 'について', contact: 'お問い合わせ', changelog: '更新履歴', search: '検索', searchPlaceholder: '記事を検索…' },
  hero: {
    badge: 'AI研究 · エンジニアリング · 生活',
    title: '王童語',
    subtitle: 'ARKRAYのソフトウェアエンジニアです。医療機器の測定アルゴリズムとGUIを書いています。エンジニアリング、AI、日常のメモを残しています。',
    ctaFeatured: '注目記事を読む',
    ctaAbout: 'プロフィール',
  },
  home: {
    featured: '注目の記事',
    latest: '最新の記事',
    viewAll: 'すべての記事を見る',
    lanes: {
      research: { title: 'AI 研究', description: '信頼できる AI の実験、論文、考察メモ。' },
      engineering: { title: 'エンジニアリング', description: '医療機器のアルゴリズム、GUI開発、仕事の記録。' },
      life: { title: '生活', description: '日常の記録、節目、日本での出来事。' },
    },
  },
  articles: { title: 'すべての記事', subtitle: (n) => `デザイン、開発などを横断する ${n} 本の記事。`, all: 'すべて', empty: 'このカテゴリにはまだ記事がありません。' },
  postDetail: { back: '← 記事一覧に戻る', notFound: '記事が見つかりません' },
  about: {
    role: 'ソフトウェアエンジニア · ARKRAY',
    bio1: '王童語です。ARKRAYで医療機器の測定アルゴリズムとGUI開発をしています。',
    bio2: 'つくっていることやAIの試行錯誤、たまに日常のことを書いています。',
    bio3: '仕事以外は個人プロジェクトや新しい場所を巡るのが好きです。',
    recentWriting: '最近の記事',
    viewAll: 'すべての記事を見る →',
  },
  contact: { title: 'お問い合わせ', subtitle: '質問、コラボレーションのアイデア、またはただのご挨拶でも、ぜひご連絡ください。', email: 'メール', responseTime: '返信時間', responseTimeValue: '通常 2〜3 営業日以内', openTo: '受け付けていること', openToValue: '研究に関する議論、共同研究のご相談、読者からの質問。', send: 'メールを送る', newsletterTitle: 'ニュースレターを購読', newsletterDesc: '新着記事をメールでお届けします。スパムなし、いつでも解除できます。', emailPlaceholder: 'you@example.com', subscribe: '購読する', subscribed: 'ご購読ありがとうございます！', invalidEmail: '有効なメールアドレスを入力してください。' },
  footer: {
    tagline: 'AI 研究、エンジニアリング、日々の生活についての記録。',
    navigation: 'ナビゲーション',
    follow: 'フォロー',
    copyright: '© 2026 Wang Tongyu. All rights reserved.',
    nowLabel: 'いま',
    nowText: '個人ブログ v2 をいじってる',
  },
  notFound: { title: 'ページが見つかりません', desc: 'お探しのページは存在しないか、移動されました。', goHome: 'ホームへ戻る' },
  search: { noResults: '結果が見つかりませんでした。' },
  life: { title: '私の人生', subtitle: '瞬間、マイルストーン、思い出のタイムライン。', views: { impact: 'インパクト', normal: '通常' }, entryCount: (n) => `${n} 件`, expand: '続きを読む', collapse: '閉じる' },
  diary: { empty: 'まだエントリがありません。' },
  changelog: {
    title: '更新履歴',
    subtitle: 'サイトのバージョンと各リリースの変更内容をタイムラインで記録しています。',
    latest: '最新',
    versionLabel: 'バージョン',
    changeTypes: { added: '追加', changed: '変更', fixed: '修正', removed: '削除' },
  },
  readMore: '記事を読む →',
  minRead: (n) => `${n} 分で読めます`,
  theme: { toggle: 'テーマを切り替え' },
};

export const localeTranslations: Record<Locale, Translations> = { en, zh, ja };

export const localeFontFamily: Record<Locale, string> = {
  en: 'var(--font-body), system-ui, sans-serif',
  zh: 'var(--font-body), "Noto Sans SC", system-ui, sans-serif',
  ja: 'var(--font-body), "Noto Sans JP", system-ui, sans-serif',
};

/** Reading typeface for long-form content (see <MarkdownContent>): Source Serif 4 (Latin) paired
 * with Source Han Serif's SC/JP cuts — Google Fonts hosts the exact same Source Han Serif glyphs
 * under the "Noto Serif SC/JP" name (Adobe and Google co-developed and dual-published this CJK
 * family), so this is the real Source Han Serif, not a reskin. Source Serif 4 is loaded eagerly in
 * index.html; the SC/JP cuts are lazy-loaded per-locale so we don't ship CJK glyph tables to
 * readers who never see CJK content. */
export const localeSerifFontFamily: Record<Locale, string> = {
  en: '"Source Serif 4", Georgia, "Times New Roman", serif',
  zh: '"Noto Serif SC", "Source Serif 4", serif',
  ja: '"Noto Serif JP", "Source Serif 4", serif',
};

/** Extra tracking for CJK reading copy. CJK glyphs sit in a fixed-width em-box, so unlike Latin
 * text, "cramped" CJK body copy is a spacing problem you fix by hand — this isn't an official
 * Apple HIG value (their published tracking specs are for Latin SF Pro and are actually negative),
 * it matches the small positive tracking (~0.05em) commonly used on Apple's own zh/ja marketing
 * pages and in Chinese web-typography conventions for a more open, less crowded feel. */
export const localeReadingLetterSpacing: Record<Locale, string> = {
  en: 'normal',
  zh: '0.05em',
  ja: '0.05em',
};

const LOCALE_HTML_LANG: Record<Locale, string> = { en: 'en', zh: 'zh-CN', ja: 'ja' };

const CJK_FONT_HREF: Record<Locale, string | null> = {
  en: null,
  zh: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap',
  ja: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;600;700&display=swap',
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    }
  };

  // Keep <html lang> in sync for a11y / SEO / correct CJK line-breaking
  useEffect(() => {
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [locale]);

  // Lazily load the heavy CJK webfont only when a CJK locale is selected
  useEffect(() => {
    const href = CJK_FONT_HREF[locale];
    if (!href) return;
    const id = `cjk-font-${locale}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: localeTranslations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
