# 主题管理 / Theme Management

本博客使用 [jekyll-theme-h2o-ac](https://github.com/zhonger/jekyll-theme-H2O-ac) **gem 依赖**，而非在仓库内嵌整套主题代码。

---

## 1. 分层结构

```
┌─────────────────────────────────────────────────────────┐
│  本仓库（内容与定制）                                      │
│  _posts/  pages/  _config.yml  _data/cv.yml  …          │
│  _includes/head.html          ← 唯一保留的主题 override   │
│  dev/  webpack.config.js      ← 前端构建（gem 不含产物）   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  gem: jekyll-theme-h2o-ac @ 1.2.1                       │
│  _layouts/  _includes/  assets/icons/  …               │
└─────────────────────────────────────────────────────────┘
```

| 层级 | 位置 | 职责 |
|------|------|------|
| 主题 | `Gemfile` → gem | 布局、模板、默认静态资源 |
| 博客 | 本仓库 | 文章、页面、站点配置、CV 数据 |
| 覆盖 | `_includes/layouts/head.html` 或 `plugins/*` | 1.5.x 起 include 路径已重构，见升级 PR |
| 构建 | `dev/` + webpack | 编译 SCSS/JS → `assets/*.min.*`（gitignore） |

Jekyll 规则：**同路径文件以本仓库为准**，覆盖 gem 内对应文件。

---

## 2. 当前 pin 版本

```ruby
# Gemfile
gem "jekyll-theme-h2o-ac", "1.5.3"
```

```yaml
# _config.yml
theme: jekyll-theme-h2o-ac
```

上游最新版为 1.5.x；本 PR 测试升级至 **1.5.3**。合并前需在 CI 与本地预览通过。

---

## 3. 升级主题

1. 查看上游 [Release / Changelog](https://github.com/zhonger/jekyll-theme-H2O-ac/releases)
2. 修改 `Gemfile` 中的版本号，例如 `"1.3.0"`
3. 运行 `bundle update jekyll-theme-h2o-ac`
4. 本地 `npm run build && bundle exec jekyll build` 验证
5. 检查 `_includes/head.html` 是否仍与上游冲突（可用 `git diff` 对比上游同文件）
6. 提交 `Gemfile` + `Gemfile.lock`

---

## 4. 何时需要新增 override

仅当以下情况才在本仓库添加与 gem 同路径的文件：

- 修改 `_includes/*.html` 或 `_layouts/*.html`
- 替换 `assets/icons/` 中的图标

**不要**再把整套 `_layouts/`、`_includes/` 复制进仓库。

---

## 5. 与前端构建的关系

gem 内含预编译的 `assets/css/*.min.css`，但本仓库采用 **CI 单轨构建**：

- `dev/` 保留在本仓库（webpack 配置已定制）
- `assets/*.min.*` 由 `npm run build` 生成，gitignore
- 构建产物覆盖 gem 内同名文件

若未来不再定制 SCSS/JS，可删除 `dev/` 并直接使用 gem 自带 assets（同时去掉 CI 中的 npm build）。

---

## 6. 相关链接

- 上游仓库：<https://github.com/zhonger/jekyll-theme-H2O-ac>
- RubyGems：<https://rubygems.org/gems/jekyll-theme-h2o-ac>
- 操作说明：[OPERATIONS.md](./OPERATIONS.md)
