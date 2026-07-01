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

## 图片怎么嵌入

两种方式都会被**自动识别**，不需要额外配置：

1. **页面封面**（Cover）→ 自动映射成文章缩略图 / 日记配图。
2. **正文里插入图片块**（`/image`，直接粘贴或拖拽上传，也支持粘贴外部图片链接）→ 自动转成 Markdown 图片、随正文一起渲染。

背后有个坑已经处理掉了：如果你是**直接把图片文件拖进 Notion**（而不是粘贴一个外部链接），Notion API 返回的是一个大约 1 小时后就会失效的临时签名 URL。因为同步是每 6 小时跑一次，这类图片如果直接原样写进生成的 `.ts` 文件，过一会儿就会在网站上裂图。

同步脚本（`scripts/lib/notion-helpers.mjs` 里的 `rehostNotionFile`）会自动检测这种情况：只要发现是 Notion 直接托管的文件（封面或正文图片），就会在同步时把图片下载下来，存进仓库的 `public/notion-images/` 目录，并把链接替换成永久的本地路径。如果你插入图片时用的是**外部链接**（比如已经传到别处的图床/CDN），则不受影响，直接原样使用那个永久链接。

也就是说：**怎么方便就怎么插入图片，拖拽上传或粘贴链接都行，不用自己操心链接会不会失效**。唯一的例外是——如果你把同一个图片块里的图片换掉（同一个块，换了张图），脚本会因为按块 ID 缓存而认为本地已经有文件、不会重新下载；这种情况需要手动去 `public/notion-images/` 里删掉对应文件，触发下次同步重新拉取。

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
