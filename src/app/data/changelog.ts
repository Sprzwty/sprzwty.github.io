import type { LocalizedText } from '../lib/localized';

export type ChangeType = 'added' | 'changed' | 'fixed' | 'removed';

export interface ChangelogChange {
  type: ChangeType;
  text: LocalizedText;
}

export interface ChangelogRelease {
  version: string;
  date: string;
  title: LocalizedText;
  summary?: LocalizedText;
  changes: ChangelogChange[];
}

/** Newest first. Append releases at the top when shipping updates. */
export const changelogReleases: ChangelogRelease[] = [
  {
    version: '2.1.0',
    date: '2026-07-03',
    title: {
      en: 'Changelog page',
      zh: '版本与更新说明页',
      ja: '更新履歴ページ',
    },
    summary: {
      en: 'A dedicated timeline for site versions and release notes.',
      zh: '新增版本时间轴页面，集中记录每次更新内容。',
      ja: 'サイトのバージョンと更新内容をタイムラインで公開。',
    },
    changes: [
      {
        type: 'added',
        text: {
          en: 'Changelog page with a vertical release timeline',
          zh: '新增「更新说明」页面，以时间轴展示版本记录',
          ja: '縦型タイムラインの更新履歴ページを追加',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Trilingual release notes (EN / ZH / JA)',
          zh: '版本说明支持中 / 英 / 日三语',
          ja: '更新内容の日英中三言語対応',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Footer entry for changelog (version badge + link); removed from top navigation',
          zh: '更新说明入口移至页脚（版本号徽章 + 链接），自顶栏导航移除',
          ja: '更新履歴への入口をフッターへ移動（バージョンバッジ + リンク）、トップナビから削除',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Historical v1.x release notes (Hexo → Jekyll → Notion bridge)',
          zh: '补充 v1.x 时代历史版本记录（Hexo → Jekyll → Notion 桥接）',
          ja: 'v1.x 時代の履歴を追記（Hexo → Jekyll → Notion ブリッジ）',
        },
      },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-07-01',
    title: {
      en: 'Site relaunch — Notion-driven v2',
      zh: '新站上线 — Notion 驱动 v2',
      ja: 'サイトリニューアル — Notion 駆動 v2',
    },
    summary: {
      en: 'Full redesign: React SPA, Notion authoring, GitHub Actions deploy.',
      zh: '全面重构：React 静态站、Notion 创作、GitHub Actions 自动发布。',
      ja: '全面刷新：React SPA、Notion 執筆、GitHub Actions 自動デプロイ。',
    },
    changes: [
      {
        type: 'added',
        text: {
          en: 'Notion-driven workflow — diary and blog databases sync every 6 hours via GitHub Actions',
          zh: 'Notion 创作工作流 — 日记与博客数据库每 6 小时经 GitHub Actions 自动同步',
          ja: 'Notion 駆動ワークフロー — 日記・ブログ DB を GitHub Actions で 6 時間ごとに同期',
        },
      },
      {
        type: 'added',
        text: {
          en: 'React 18 + Vite 6 + TypeScript frontend with Tailwind CSS v4 and shadcn/ui',
          zh: 'React 18 + Vite 6 + TypeScript 前端，Tailwind CSS v4 + shadcn/ui',
          ja: 'React 18 + Vite 6 + TypeScript フロントエンド、Tailwind CSS v4 + shadcn/ui',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Life timeline with Impact and Normal views',
          zh: '生活时间线页面，支持大图与时间轴两种视图',
          ja: 'ライフタイムライン（インパクト / 通常ビュー）',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Trilingual UI (EN / ZH / JA) and per-post body language segments',
          zh: '界面三语切换，正文支持按语言分段',
          ja: 'UI の日英中切り替えと本文の言語セグメント対応',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Markdown rendering with GFM, syntax highlighting, and KaTeX math',
          zh: 'Markdown 渲染：GFM、代码高亮、KaTeX 公式',
          ja: 'Markdown 描画（GFM、シンタックスハイライト、KaTeX 数式）',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Automatic Notion image re-hosting to prevent expired URLs',
          zh: 'Notion 图片自动落盘，避免临时链接过期裂图',
          ja: 'Notion 画像の自動再ホスト（期限切れ URL 対策）',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Light / dark theme toggle',
          zh: '明暗主题切换',
          ja: 'ライト / ダークテーマ切り替え',
        },
      },
      {
        type: 'changed',
        text: {
          en: 'Migrated from Hexo / Jekyll to a custom static SPA on GitHub Pages',
          zh: '从 Hexo / Jekyll 迁移至 GitHub Pages 上的自研静态 SPA',
          ja: 'Hexo / Jekyll から GitHub Pages 上の独自静的 SPA へ移行',
        },
      },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-06-30',
    title: {
      en: 'Notion bridge on Jekyll',
      zh: 'Jekyll 时代的 Notion 同步桥接',
      ja: 'Jekyll 時代の Notion 同期ブリッジ',
    },
    summary: {
      en: 'First step toward mobile-friendly authoring — Notion posts synced into Jekyll before the v2 rewrite.',
      zh: '迈向移动端创作的第一步：在 v2 重写前，先将 Notion 文章同步进 Jekyll。',
      ja: 'モバイル執筆への第一歩——v2 全面刷新前に Notion 記事を Jekyll へ同期。',
    },
    changes: [
      {
        type: 'added',
        text: {
          en: 'GitHub Actions workflow to sync a Notion blog database into `_posts/notion/`',
          zh: 'GitHub Actions 将 Notion 博客数据库同步至 `_posts/notion/`',
          ja: 'GitHub Actions で Notion ブログ DB を `_posts/notion/` に同期',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Blog and archives pages render Notion-synced posts alongside legacy Markdown',
          zh: '博客与归档页同时展示 Notion 同步文章与旧版 Markdown 文章',
          ja: 'ブログ・アーカイブで Notion 同期記事と従来の Markdown 記事を併記',
        },
      },
      {
        type: 'changed',
        text: {
          en: 'Refactored theme to `jekyll-theme-h2o-ac` gem (v1.5.3) instead of an inline fork',
          zh: '主题重构为 `jekyll-theme-h2o-ac` gem（v1.5.3），不再内联维护主题 fork',
          ja: 'テーマをインラインフォークから `jekyll-theme-h2o-ac` gem（v1.5.3）へ移行',
        },
      },
      {
        type: 'added',
        text: {
          en: 'One-off migration script to import legacy `_posts/` into Notion',
          zh: '一次性迁移脚本，将旧版 `_posts/` 文章导入 Notion',
          ja: 'レガシー `_posts/` を Notion へ移行するワンショットスクリプトを追加',
        },
      },
    ],
  },
  {
    version: '1.5.0',
    date: '2023-06-25',
    title: {
      en: 'Jekyll + h2o-ac theme',
      zh: '迁移至 Jekyll + h2o-ac 主题',
      ja: 'Jekyll + h2o-ac テーマへ移行',
    },
    summary: {
      en: 'Moved to a Markdown-on-Git workflow with the h2o-ac Jekyll theme on GitHub Pages.',
      zh: '改用 Markdown + Git 推送发布，基于 h2o-ac 主题的 GitHub Pages 站点。',
      ja: 'Markdown + Git push の執筆フローと、h2o-ac テーマの GitHub Pages サイトへ。',
    },
    changes: [
      {
        type: 'added',
        text: {
          en: 'Jekyll static site with the h2o-ac theme (bilingual UI, archives, tags, RSS)',
          zh: '基于 h2o-ac 主题的 Jekyll 静态站（双语界面、归档、标签、RSS）',
          ja: 'h2o-ac テーマの Jekyll 静的サイト（二言語 UI、アーカイブ、タグ、RSS）',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Markdown posts under `_posts/` — write locally, `git push` to publish',
          zh: '`_posts/` 目录 Markdown 写作，本地编写后 `git push` 发布',
          ja: '`_posts/` の Markdown 執筆——ローカルで書いて `git push` で公開',
        },
      },
      {
        type: 'added',
        text: {
          en: 'CV, links, and categories pages',
          zh: '简历、友链、分类等页面',
          ja: 'CV・リンク・カテゴリなどのページ',
        },
      },
      {
        type: 'changed',
        text: {
          en: 'Replaced the earlier Hexo setup with a more themeable Jekyll stack',
          zh: '替换此前的 Hexo 方案，转向可定制性更强的 Jekyll 技术栈',
          ja: '従来の Hexo 構成から、カスタマイズしやすい Jekyll スタックへ置き換え',
        },
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2022-10-01',
    title: {
      en: 'First site — Hexo',
      zh: '初代站点 — Hexo',
      ja: '初代サイト — Hexo',
    },
    summary: {
      en: 'A zero-cost personal page on GitHub, born during grad school — mostly just proof of existence.',
      zh: '研究生时期在 GitHub 上搭建的零成本个人页，很长一段时间只是「存在」的证明。',
      ja: '大学院時代に GitHub 上で立ち上げたゼロコストの個人ページ——長い間「存在」の証明に留まった。',
    },
    changes: [
      {
        type: 'added',
        text: {
          en: 'First personal website built with Hexo, hosted on GitHub Pages',
          zh: '首个基于 Hexo 的个人网站，托管于 GitHub Pages',
          ja: 'Hexo で構築した初の個人サイト、GitHub Pages でホスティング',
        },
      },
      {
        type: 'added',
        text: {
          en: 'Minimal layout — a simple “I exist” page while research output was still scarce',
          zh: '极简页面布局——科研产出尚少时，向世界介绍作者本人的存在',
          ja: '最小限のレイアウト——研究のアウトプットがまだ少ない頃、自分の存在を示すページ',
        },
      },
      {
        type: 'added',
        text: {
          en: 'No paid domain — entirely free hosting',
          zh: '无付费域名，完全免费托管',
          ja: '有料ドメインなし、完全無料ホスティング',
        },
      },
    ],
  },
];

export const CURRENT_VERSION = changelogReleases[0]?.version ?? '0.0.0';
