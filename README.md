# sprzwty.github.io

Personal blog of Wang Tongyu — a React SPA driven entirely by two Notion databases (diary + articles). There is no in-app editor; writing happens in Notion, and GitHub Actions syncs it to static data files and deploys the built site.

**Live site →** <https://sprzwty.github.io>

**Notion 创作工作流 →** [docs/NOTION_SYNC.md](docs/NOTION_SYNC.md)

---

## Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + Vite 6 + TypeScript |
| Routing | react-router (hash-based, GitHub Pages friendly) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Content source | Notion (2 databases) via `@notionhq/client` + `notion-to-md` |
| Markdown rendering | `react-markdown` + remark-gfm/math + rehype-katex/highlight |
| CI / Deploy | GitHub Actions → `gh-pages` branch |
| Node version | 20+ |

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

The repo ships with placeholder content in `src/app/data/posts.ts` / `life-events.ts`, so `npm run dev` works out of the box without any Notion credentials. To pull your real content:

```bash
$env:NOTION_TOKEN = "secret_xxx"
$env:NOTION_DIARY_DATABASE_ID = "..."
$env:NOTION_BLOG_DATABASE_ID = "..."
npm run sync
```

See [docs/NOTION_SYNC.md](docs/NOTION_SYNC.md) for the full authoring workflow and field reference.

## Build

```bash
npm run build         # outputs to dist/
npm run preview        # preview the production build locally
```

## Deployment

`.github/workflows/deploy.yml` runs on push to `master`, on a 6-hour schedule, and on demand (`workflow_dispatch`). Each run: syncs both Notion databases → commits changed data files → `npm run build` → publishes `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.

## License

Blog content is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). UI code adapted from a Figma Make export using [shadcn/ui](https://ui.shadcn.com/) components (MIT) — see [ATTRIBUTIONS.md](ATTRIBUTIONS.md).
