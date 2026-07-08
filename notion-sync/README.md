# notion-sync

本地 Markdown → Notion 博客数据库的同步源目录。

在 `notion-sync/` 下任意子目录新建 `.md` 文件，填写 YAML front matter 后 push 到 `master`，GitHub Actions 会自动同步到 Notion（也可本地 `npm run sync:to-notion`）。

## 新建一篇文章

1. 复制 `_template.md` 到任意子目录（如 `research/my-topic.md`）
2. 填写 front matter（`title_zh` 必填，或至少填 `title`）
3. 正文用 Markdown 书写
4. `publish: true` 才会在网站上显示；`publish: false` 仅写入 Notion 草稿

## Front matter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `title_zh` | ✅* | Notion `Title`（中文主标题） |
| `title` | 否 | 英文标题 → Notion `Title (ZH)`（双语时填写） |
| `title_ja` | 否 | Notion `Title (JA)` |
| `date` | 否 | `YYYY-MM-DD`，默认今天 |
| `category` | 否 | Notion `Category`，默认 `Uncategorized` |
| `tags` | 否 | 字符串数组 → Notion `Tags` |
| `subtitle` / `subtitle_zh` / `subtitle_ja` | 否 | 摘要 |
| `publish` | 否 | 默认 `true`；`false` = 不同步到网站 |
| `pin` | 否 | 首页精选 |
| `sync` | 否 | 默认 `true`；`false` = 跳过同步 |

\* `title_zh` 与 `title` 至少填一个；有中文时优先用 `title_zh` 作为 Notion 主标题。

完整字段说明见 [docs/NOTION_SYNC.md](../docs/NOTION_SYNC.md)。

## 目录建议

按主题分子目录即可，脚本会递归扫描所有 `.md`：

```
notion-sync/
├── research/          # 研究笔记
├── notes/             # 其他文章
└── _template.md       # 模板（不同步）
```

`kr-kb/` 可继续作为本地 Obsidian 知识库；需要发布到博客的文章复制或迁移到 `notion-sync/`。
