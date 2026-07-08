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
| `Title` | Title | ✅ | **中文主标题**（Notion 列表默认显示） |
| `Title (EN)` | Text | 否 | **英文标题**（双语文章时填写） |
| `Title (JA)` | Text | 否 | 日文标题 |
| `Date` | Date | 否 | 不填则用页面创建时间 |
| `Category` | Select | 否 | 自由文本，不再是固定枚举；不填日记默认 `Diary`，文章默认 `Uncategorized` |
| `Tags` | Multi-select | 否 | 仅博客数据库使用（当前网站尚未展示，可先记录备用） |
| `Subtitle` | Text | 否 | 仅博客数据库；**中文摘要**，不填则自动取正文前 ~160 字 |
| `Subtitle (EN)` / `Subtitle (JA)` | Text | 否 | 仅博客数据库；英文/日文摘要，不填则自动取对应语言正文前 ~160 字 |
| `Pin` | Checkbox | 否 | 仅博客数据库；对应首页「精选文章」(`featured`) |
| `Publish` | Checkbox | 否 | 不勾选则跳过同步；不建这个属性等同于「全部发布」 |

**自动生成，无需手填：**

- **Slug**：由 `Title (EN)`（或 `Title`）自动 slugify。
- **摘要（excerpt）**：`Subtitle` 留空时，自动取正文前 ~160 字（去除 Markdown 语法）。
- **封面图**：直接用 Notion 页面自带的 Cover（页面左上角「添加封面」），不需要额外的图片属性。
- **阅读时长**：按正文字数估算（中日文按字符、英文按单词）。
- **作者**：固定写死为 Wang Tongyu，不设 Author 属性。

正文支持 Notion 的全部常见格式——标题、列表、代码块（含语言高亮）、引用、表格、图片、行内/块级公式（`$...$` / `$$...$$`）——同步时通过 [`notion-to-md`](https://github.com/souvikinator/notion-to-md) 转成 Markdown，前端用 `<MarkdownContent>` 统一渲染成 HTML。

## 正文怎么写三语（可选）

标题/摘要可以用上面表格里的 `(EN)` / `(JA)` 属性直接填；但正文（日记内容 / 文章正文）是页面里的普通 Notion 块，没法用「属性」拆成三份，所以用一个**页面里的分隔标记**来做：

在正文里另起一段，段落文字**逐字**写成下面几种（前后不要有别的字符）：

```
---LANG:EN---
---LANG:ZH---
---LANG:JA---
```

标记之后、下一个标记之前的所有内容，都会被同步脚本归到对应语言。例如一篇文章可以这样组织：

```
---LANG:EN---
This is the English version of the post.

---LANG:ZH---
这是这篇文章的中文版本。

---LANG:JA---
これはこの記事の日本語版です。
```

网站会根据当前界面语言自动显示对应的段落。**不想做三语的页面完全不用管这件事**——不加任何标记，正文会被当作单一语言整体处理，效果和现在完全一样（不分语言，任何界面语言下都显示同一份内容）。也可以只写两种、跳过第三种：没写的语言会自动 fallback 显示 `Title`/正文 `en` 分段（如果 `en` 段也没写，则用其中任意一个已写的语言垫底，保证不会空白）。

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

## 反向同步：本地 Markdown → Notion 博客

除了直接在 Notion 里写文章，你也可以在仓库的 `notion-sync/` 目录用 Markdown 写作，再同步到博客数据库：

| | 方向 | 脚本 | Workflow |
|---|---|---|---|
| **Notion → 网站** | 拉取 | `npm run sync:posts` | `deploy.yml` |
| **notion-sync → Notion** | 推送 | `npm run sync:to-notion` | `sync-to-notion.yml` |

### 怎么用

1. 在 `notion-sync/` 下任意子目录新建 `.md`（可复制 `notion-sync/_template.md`）
2. 在 YAML front matter 里填写 `title_zh`（及可选的 `title` 英文）和 `category`、`tags`、`publish` 等
3. 正文用 Markdown 书写
4. Push 到 `master` 后，`sync-to-notion.yml` 自动运行；也可在 Actions 里手动触发 **Sync to Notion**

按 `Title` 匹配：已存在则更新正文和属性，不存在则新建。`publish: false` 的页面会写入 Notion 但不会出现在网站上（等 `deploy.yml` 下次拉取时仍会被跳过）。

详见 `notion-sync/README.md`。

## 本地开发时手动同步

```powershell
$env:NOTION_TOKEN = "secret_xxx"
$env:NOTION_DIARY_DATABASE_ID = "..."
$env:NOTION_BLOG_DATABASE_ID = "..."

npm run sync          # 等价于 sync:diary + sync:posts
npm run sync:to-notion  # notion-sync/ → Notion 博客数据库
npm run dev
```

不设置这些环境变量也能跑 `npm run dev`——`src/app/data/*.ts` 里保留了占位内容，方便看界面效果。

## 已知的暂时限制

- 多语言是**手动**的（见上面「正文怎么写三语」）——没有自动翻译，标题/摘要/正文各语言都需要你自己在 Notion 里准备好。不补充的语言会 fallback 显示 `en`（或已经写了的语言），不会报错也不会空白。
- 新界面还没有 RSS / Sitemap / 归档页 / 标签页 / 评论区，见迁移计划中的「已知限制」章节。
