# sprzwty.github.io

Personal blog of Wang Tongyu, built with [Jekyll](https://jekyllrb.com/) and the
[H2O-ac](https://github.com/zhonger/jekyll-theme-H2O-ac) theme.

**Live site →** <https://sprzwty.github.io>

**操作说明 →** [docs/OPERATIONS.md](docs/OPERATIONS.md)（环境、代理、GitHub 认证、写作、发布流程）

---

## Stack

| Layer | Tool |
|-------|------|
| Static site generator | Jekyll 4.x |
| Theme | jekyll-theme-H2O-ac (inline) |
| CSS / JS build | Webpack 5 + Sass |
| CI / Deploy | GitHub Actions → GitHub Pages |
| Ruby version | 3.3 (see `.tool-versions`) |
| Node version | 20 (see `.tool-versions`) |

---

## Local Development

> 完整流程（含公司网络代理、双 GitHub 账号）见 **[docs/OPERATIONS.md](docs/OPERATIONS.md)**。

### Prerequisites

- [asdf](https://asdf-vm.com/) or rbenv/nvm matching `.tool-versions`
- Bundler: `gem install bundler`

### First-time setup

```bash
npm install          # install JS build dependencies → generates package-lock.json
bundle install       # install Ruby gems → generates Gemfile.lock
```

### Build frontend assets

Webpack compiles `dev/` → `assets/css/*.min.css` and `assets/js/*.min.js`.
These files are **gitignored**; CI builds them before Jekyll. Run locally after clone or when editing `dev/`:

```bash
npm run build        # one-shot production build
npm run watch        # rebuild on every SCSS/JS change
```

### Run the dev server

```bash
npm run build        # required once if assets/*.min.* are missing
bundle exec jekyll serve --livereload
# or: npm run serve
```

Browse to <http://localhost:4000>.

> **Tip:** You only need to restart the server when you change `_config.yml`.
> All other file changes are picked up automatically via `--livereload`.

---

## Writing a Post

1. Create `_posts/YYYY-MM-DD-slug.md`
2. Add front matter:

```yaml
---
layout: post
title: 'My Post Title'
tags: [tag1, tag2]
---
```

3. Write Markdown below the `---`.
4. Commit and push to `master` — CI builds and deploys automatically.

---

## Configuration

All site settings are in `_config.yml`. Key sections:

| Section | Purpose |
|---------|---------|
| `title` / `author` / `bio` | Site identity |
| `sns` | Social links shown in sidebar |
| `comments` | Enable Waline or Disqus (bring your own URL) |
| `nav` | Top navigation links |
| `pagination` | Posts per page |
| `prism` | Code highlight theme |

---

## Deployment

Pushing to `master` triggers `.github/workflows/jekyll.yml`, which:

1. Runs `npm ci && npm run build` (rebuilds CSS/JS)
2. Runs `bundle exec jekyll build`
3. Pushes `_site/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`

GitHub Pages serves the `gh-pages` branch.

---

## Custom Domain

If you add a custom domain later:

1. Add a `CNAME` file in the repo root containing your domain (e.g. `blog.example.com`)
2. Uncomment the `cname:` line in `.github/workflows/jekyll.yml`
3. Configure the DNS record with your registrar

---

## License

Blog content is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
Theme code is licensed under [MIT](https://github.com/zhonger/jekyll-theme-H2O-ac/blob/master/LICENSE).
