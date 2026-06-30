# 操作说明 / Operations Guide

本仓库是个人博客 [sprzwty.github.io](https://sprzwty.github.io)，基于 Jekyll + H2O-ac 主题。
本文说明日常维护、写作、构建与发布流程。

---

## 1. 项目结构

```
sprzwty.github.io/
├── _posts/              # 博客文章（你主要写这里）
├── pages/               # 独立页面（首页、CV、归档入口等）
├── _data/               # 结构化数据（CV、友链、多语言文案）
├── _includes/head.html  # 唯一主题 override（其余来自 gem）
├── _config.yml          # 站点全局配置（改后需重启 Jekyll）
├── dev/                 # 前端源码（SCSS / JS）— 唯一真相来源
├── assets/img/          # 站点图片；icons 与 layouts 来自 gem
├── scripts/             # 本地辅助脚本（代理、GitHub 认证）
├── docs/THEME.md        # 主题 gem 管理与升级
└── .github/workflows/   # CI/CD
```

**维护原则**

| 类型 | 目录 | 何时修改 |
|------|------|----------|
| 内容 | `_posts/`, `pages/`, `_data/cv.yml`, `_data/links.yml` | 写文章、改首页/CV/友链 |
| 配置 | `_config.yml` | 改导航、作者信息、功能开关 |
| 主题 override | `_includes/head.html` | 改 CDN、Prism、Waline 等 head 资源 |
| 样式构建 | `dev/`, `webpack.config.js` | 改 SCSS/JS（详见 [THEME.md](./THEME.md)） |
| 主题升级 | `Gemfile` | bump `jekyll-theme-h2o-ac` 版本 |

---

## 2. 环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 20 | 见 `.tool-versions` |
| Ruby | 3.3 | Jekyll 运行环境 |
| Bundler | 最新 | `gem install bundler` |
| px 代理 | 127.0.0.1:3128 | 公司网络下访问 GitHub 时需要 |

---

## 3. 首次安装

```powershell
cd C:\Users\2737\Desktop\IK\sprzwty.github.io

npm install
bundle install
npm run build
```

---

## 4. 本地开发

> **构建产物策略**：`dev/` 是源码，`assets/css/*.min.css` 和 `assets/js/*.min.js` 由 webpack 生成，**不提交 Git**。CI 在部署前自动 `npm run build`；本地首次克隆或改 `dev/` 后需先构建。

### 4.1 修改样式 / JS

终端 1：

```powershell
npm run watch          # 监听 dev/，自动编译到 assets/
```

终端 2：

```powershell
bundle exec jekyll serve --livereload
```

浏览器打开 <http://localhost:4000>。

> 修改 `_config.yml` 后必须**重启** Jekyll；其他 Markdown / 样式文件会自动刷新。

### 4.2 只改文章或页面

首次克隆或 `assets/` 下没有 `*.min.*` 时，先执行一次：

```powershell
npm run build
```

然后：

```powershell
bundle exec jekyll serve --livereload
```

或一条命令（构建 + 启动）：

```powershell
npm run serve
```

---

## 5. 网络与代理（公司环境）

公司网络会拦截直连 GitHub。需先启动 **px**，再加载代理：

```powershell
.\scripts\set-proxy-px.ps1
```

脚本会：

- 将 `HTTP_PROXY` / `HTTPS_PROXY` 设为 `http://127.0.0.1:3128`
- 加载 `GH_TOKEN`（若已配置）
- 检测 GitHub API 是否可达

**每个新开的终端都要先运行一次**（或重启 Cursor 后运行）。

切回公司代理（一般不需要）：

```powershell
.\scripts\set-proxy-corp.ps1
```

---

## 6. GitHub 账号（Sprzwty / twkirity）

本仓库使用 **Sprzwty** 账号；另一账号 **twkirity** 用于其他项目。

### 6.1 配置 Sprzwty（首次或换 token 时）

1. 用 Sprzwty 登录 GitHub
2. 创建 **Classic PAT**：<https://github.com/settings/tokens>
3. 至少勾选 **`repo`**
4. 运行：

```powershell
.\scripts\gh-auth-sprzwty.ps1
```

验证：

```powershell
.\scripts\set-proxy-px.ps1
gh api user --jq .login    # 应输出 Sprzwty
```

### 6.2 切回 twkirity

```powershell
.\scripts\gh-auth-twkirity.ps1
```

---

## 7. 分支与发布流程

| 分支 | 用途 |
|------|------|
| `master` | 稳定分支；push 后自动部署到 GitHub Pages |
| `feat/*` | 功能开发；完成后开 PR 合并到 `master` |
| `gh-pages` | CI 生成的静态站点（勿手动改） |

### 日常发布（小改动）

```powershell
git checkout master
git pull origin master
# 修改内容...
git add .
git commit -m "docs: update homepage"
git push origin master
```

### 功能开发（推荐）

```powershell
git checkout master
git pull origin master
git checkout -b feat/my-feature

# 开发、提交...
git push -u origin feat/my-feature

gh pr create --base master --head feat/my-feature
```

合并 PR 后 CI 会自动部署。

### 版本标签

```powershell
git tag -a 0.2.0 -m "v0.2.0: description"
git push origin 0.2.0
```

当前基线标签：`0.1.0`（仓库重构后的稳定点）。

---

## 8. CI/CD

工作流：`.github/workflows/jekyll.yml`

触发：`push` 到 `master`

步骤：

1. `npm ci && npm run build` — 编译前端
2. `bundle exec jekyll build` — 生成 `_site/`
3. 推送到 `gh-pages` 分支

线上地址：<https://sprzwty.github.io>

---

## 9. 写作：`_posts/`

### 9.1 在 Notion 写作（推荐）

若已配置 Notion 同步（见 [NOTION_SYNC.md](./NOTION_SYNC.md)），在 **个人知识库 → 中文写作能力复兴计划** 数据库里编辑即可；GitHub Actions 会同步到 `_posts/notion/`。

### 9.2 本地手写

在 `_posts/` 新建文件，命名格式：

```
YYYY-MM-DD-slug.md
```

示例 front matter：

```yaml
---
layout: post
title: 文章标题
subtitle: 副标题（可选）
date: 2026-06-30
categories: Experience
tags: [Experience, Mac]
author: Wang Tongyu
cover: https://images.unsplash.com/photo-xxx   # 可选，头图
pin: false                                      # true = 置顶
lang: zh-Hans                                   # 可选，默认 zh-Hans
---
```

正文用 Markdown 编写。支持 MathJax、Mermaid、代码高亮、提示框（premonition）等，由 `_config.yml` 控制。

---

## 10. 独立页面：`pages/`

`pages/` 下的文件通过 front matter 选择布局：

| 文件 | layout | 说明 |
|------|--------|------|
| `index.md` | `page` | 学术首页 |
| `blog.html` | `blog` | 博客列表 |
| `cv.md` | 见文件 | CV 页（数据来自 `_data/cv.yml`） |
| `archives.md` | 见文件 | 归档 |
| `tags.md` / `categories.md` | 见文件 | 标签 / 分类 |
| `links.md` | 见文件 | 友链（数据来自 `_data/links.yml`） |
| `logs.md` | `page` | 更新日志 |
| `tos.md` | `page` | 使用条款 |

`page` 布局常用 front matter：

```yaml
---
layout: page
home-title: 页面标题
description: 页面描述
permalink: /my-page.html
header-img: https://...        # 可选
lang: zh-Hans
---
```

---

## 11. 布局模板

布局文件（`_layouts/`）来自 gem `jekyll-theme-h2o-ac`，不在本仓库维护。完整列表与升级方式见 [THEME.md](./THEME.md)。

| layout | 用途 |
|--------|------|
| `default.html` | 基础 HTML 壳（脚本、PWA、评论） |
| `page.html` | 通用单页（首页、logs、tos） |
| `post.html` | 博客文章页 |
| `blog.html` | 文章列表 + 分页 |
| `archives.html` | 按时间归档 |
| `tags.html` / `categories.html` | 标签 / 分类索引 |
| `cv.html` | 简历页 |
| `links.html` | 友链页 |
| `search.html` | 搜索页 |

写文章用 `layout: post`；新建独立页面一般用 `layout: page`。若要改布局，在本仓库添加同名 `_layouts/xxx.html` 即可覆盖 gem。

---

## 12. 配置：`_config.yml`

常用项：

| 配置 | 说明 |
|------|------|
| `title`, `author`, `bio`, `avatar` | 站点与作者信息 |
| `nav` | 顶部导航 |
| `sns` | 侧边栏社交链接 |
| `comments` | Waline / Disqus（需自建服务 URL） |
| `pagination` | 博客每页文章数 |
| `languages`, `default_lang` | 多语言 |
| `theme-color`, `nightMode` | 主题色 / 深色模式 |

修改后执行 `bundle exec jekyll serve` 需重启。

---

## 13. 常见问题

### `bundle` 找不到

安装 Ruby 和 Bundler，并将 Ruby 加入 PATH。

### `git push` / `gh` 报 Proxy Authentication Required

1. 启动 px  
2. 运行 `.\scripts\set-proxy-px.ps1`  
3. 再 push / gh

### 改了 SCSS 线上样式没变

CI 在 Jekyll 构建前自动执行 `npm run build`。本地改 `dev/` 后只需 commit 源码，**不必** commit `assets/*.min.*`。

### push 用了错误账号

运行 `.\scripts\gh-auth-sprzwty.ps1`，并确认 `gh api user --jq .login` 为 `Sprzwty`。

---

## 14. 相关链接

- 线上站点：<https://sprzwty.github.io>
- 主题管理：[docs/THEME.md](./THEME.md)
- Notion 同步：[docs/NOTION_SYNC.md](./NOTION_SYNC.md)
- 主题上游：<https://github.com/zhonger/jekyll-theme-H2O-ac>
- Issue 跟踪：<https://github.com/Sprzwty/sprzwty.github.io/issues>
