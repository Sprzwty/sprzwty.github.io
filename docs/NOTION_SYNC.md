# Notion 创作工作流

本站完全由 Notion 驱动：日记和博客文章分别存放在两个 Notion 数据库，写作只在 Notion 里发生，网站本身没有任何编辑入口。GitHub Actions 定时把两个数据库同步成静态数据文件，Vite 构建后发布到 `gh-pages`。

## 两个数据库

| | 用途 | 对应脚本 | 生成文件 |
|---|---|---|---|
| **日记数据库** | `Life` 页面的时间线（只读） | `scripts/fetch-notion-diary.mjs` | `src/app/data/life-events.ts` |
| **博客数据库** | `Articles` 页面的文章列表 | `scripts/fetch-notion-posts.mjs` | `src/app/data/posts.ts` |

两个数据库都需要连接同一个 Notion 集成（Integration）：在数据库页面右上角 `···` → `Connections` → 添加你的集成。这一步必须在 Notion 里手动完成一次，API 无法代为授权。

## 字段说明

两个数据库使用相同的精简字段约定：

| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `Title` | Title | ✅ | 标题 |
| `Date` | Date | 否 | 不填则用页面创建时间 |
| `Category` | Select | 否 | 自由文本，不再是固定枚举；不填日记默认 `Diary`，文章默认 `Uncategorized` |
| `Tags` | Multi-select | 否 | 仅博客数据库使用（当前网站尚未展示，可先记录备用） |
| `Subtitle` | Text | 否 | 仅博客数据库；作为摘要，不填则自动取正文前 ~160 字 |
| `Pin` | Checkbox | 否 | 仅博客数据库；对应首页「精选文章」(`featured`) |
| `Publish` | Checkbox | 否 | 不勾选则跳过同步；不建这个属性等同于「全部发布」 |

**自动生成，无需手填：**

- **Slug**：由 `Title` 自动 slugify。
- **摘要（excerpt）**：`Subtitle` 留空时，自动取正文前 ~160 字（去除 Markdown 语法）。
- **封面图**：直接用 Notion 页面自带的 Cover（页面左上角「添加封面」），不需要额外的图片属性。
- **阅读时长**：按正文字数估算（中日文按字符、英文按单词）。
- **作者**：固定写死为 Wang Tongyu，不设 Author 属性。

正文支持 Notion 的全部常见格式——标题、列表、代码块（含语言高亮）、引用、表格、图片、行内/块级公式（`$...$` / `$$...$$`）——同步时通过 [`notion-to-md`](https://github.com/souvikinator/notion-to-md) 转成 Markdown，前端用 `<MarkdownContent>` 统一渲染成 HTML。

## 新建一篇文章 / 一条日记

1. 打开对应数据库，新建一行。
2. 填 `Title`，正常写正文（想怎么排版就怎么排版）。
3. 想立刻上线就勾上 `Publish`（如果这个属性存在）；否则等 6 小时定时同步，或者去 Actions 里手动跑一次 workflow。
4. 想置顶/加入首页精选，勾 `Pin`（仅博客数据库）。

## 同步频率

`.github/workflows/deploy.yml` 每 6 小时自动跑一次：拉取两个数据库 → 若数据文件有变化则提交 → `npm run build` → 部署到 `gh-pages`。也可以在 GitHub 的 Actions 标签页手动触发（`workflow_dispatch`），不用等 6 小时。

## 本地开发时手动同步

```powershell
$env:NOTION_TOKEN = "secret_xxx"
$env:NOTION_DIARY_DATABASE_ID = "..."
$env:NOTION_BLOG_DATABASE_ID = "..."

npm run sync          # 等价于 sync:diary + sync:posts
npm run dev
```

不设置这些环境变量也能跑 `npm run dev`——`src/app/data/*.ts` 里保留了占位内容，方便看界面效果。

## 已知的暂时限制

- 目前同步脚本只写入 `en`（英文）字段；`zh`/`ja` 版本界面会自动 fallback 显示英文内容，暂时需要在生成的 `.ts` 文件里手动补充多语言版本才会生效（下次同步会被覆盖）。
- 新界面还没有 RSS / Sitemap / 归档页 / 标签页 / 评论区，见迁移计划中的「已知限制」章节。
