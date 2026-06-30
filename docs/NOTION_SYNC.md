# Notion → Jekyll 同步

在 Notion 数据库里写作，由 GitHub Actions 自动同步到 `_posts/notion/`，再经现有 CI 部署到 GitHub Pages。

**不需要 Cursor MCP**，只用 Notion 官方 API + Integration Token。

---

## 1. 你的数据库

当前字段（可逐步扩展）：

| Notion 列 | Jekyll front matter |
|-----------|---------------------|
| Title | `title` |
| Date | `date` |
| Category | `categories` / `tags` |

建议以后新增：

| Notion 列 | 类型 | 作用 |
|-----------|------|------|
| Publish | Checkbox | 仅勾选时才同步到博客 |
| Tags | Multi-select | 文章标签 |
| Subtitle | Text | 副标题 |
| Pin | Checkbox | 是否置顶 |

新增列后，在 `scripts/notion-sync.config.json` 的 `properties` 里填 Notion 列名即可（已预留 `Publish`、`Tags` 等键）。

---

## 2. 创建 Notion Integration

1. 打开 <https://www.notion.so/my-integrations>
2. **New integration** → 名称如 `sprzwty-blog-sync`
3. 关联到你的 Workspace（Internal integration）
4. 复制 **Internal Integration Secret**（形如 `ntn_...` 或 `secret_...`）

---

## 3. 把 Integration 连到数据库

1. 打开 Notion：**个人知识库 → 中文写作能力复兴计划 → 数据库**
2. 点击右上角 **⋯** → **Connections** / **连接**
3. 选择刚创建的 `sprzwty-blog-sync`

未连接时 API 会返回 404。

---

## 4. 获取 Database ID

在浏览器打开该数据库（表格视图），URL 类似：

```
https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
```

或：

```
https://www.notion.so/workspace/中文写作能力复兴计划/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

其中 **32 位** 十六进制字符串（可含 `-`）即为 Database ID。  
也可在 **Copy link** 后从链接中提取。

---

## 5. 配置 GitHub Secrets

仓库 **Settings → Secrets and variables → Actions → New repository secret**：

| Secret | 值 |
|--------|-----|
| `NOTION_TOKEN` | Integration Secret |
| `NOTION_DATABASE_ID` | 上一步的 Database ID |

配置完成后，Actions 里的 **Sync Notion Posts** 才会运行（未配置时 workflow 自动跳过）。

---

## 6. 触发同步

- **手动**：GitHub → Actions → **Sync Notion Posts** → **Run workflow**
- **定时**：默认每 6 小时（见 `.github/workflows/notion-sync.yml`）

同步成功后会把 Markdown 写入 `_posts/notion/`，并自动 commit；随后 push 到 `master` 会触发站点部署。

---

## 7. 本地测试（可选）

```powershell
.\scripts\set-proxy-px.ps1   # 公司网络需要

$env:NOTION_TOKEN = "你的_integration_secret"
$env:NOTION_DATABASE_ID = "你的_database_id"

npm install
npm run notion:sync
```

生成文件在 `_posts/notion/`。确认无误后再 push；Secrets 只需配在 GitHub 上供 Action 使用。

---

## 8. 行为说明

- **只管理** `_posts/notion/` 下带 `notion_page_id` 的文件
- **`_posts/` 里其他文章**（手写、历史稿）不会被修改
- 尚无 **Publish** 列时：**数据库里所有条目都会同步**
- 加上 **Publish** 列后：仅 `Publish = true` 的条目会同步
- 不会自动删除 Notion 里已删的行（避免误删；后续可加归档策略）

---

## 9. 扩展字段

编辑 `scripts/notion-sync.config.json`：

```json
{
  "properties": {
    "title": "Title",
    "date": "Date",
    "categories": "Category",
    "publish": "Publish",
    "tags": "Tags",
    "subtitle": "Subtitle",
    "pin": "Pin"
  }
}
```

左侧为脚本内部键，右侧必须与 Notion **列名完全一致**（区分大小写）。

---

## 10. 故障排查

| 现象 | 处理 |
|------|------|
| `object_not_found` | Integration 未连接到该数据库 |
| `Missing NOTION_TOKEN` | 未配置 GitHub Secrets 或本地环境变量 |
| 中文标题 URL 较长 | 正常；permalink 使用 title 字段 |
| 图片不显示 | Notion 图片为临时 URL；后续可改为下载到 `assets/img/` |
