# Scripts — proxy & Cursor / Figma MCP

Corporate network tools for ARKRAY PCs. **PX** (`127.0.0.1:3128`) bypasses the corp proxy for git/gh/curl. Cursor’s Figma remote MCP needs a separate setting because Streamable HTTP MCP breaks when `http.proxySupport` is `override`.

## Prerequisites

- [PX](https://github.com/genotrance/px) (or your local PX build) listening on `127.0.0.1:3128`
- Cursor Figma plugin installed (`/add-plugin figma`)
- Figma account that can use the **remote** MCP server

## Quick: Figma MCP on this PC (verified 2026-07-31)

### Symptom

- Cursor MCP `figma` shows green but **0 tools enabled**
- Log: `error=fetch failed` / `Transient error connecting to streamableHttp server: fetch failed`
- Figma Dev Mode Inspect → MCP only shows **Connect to AI agent** (remote). There is **no** “Enable desktop MCP server” toggle on current builds for this account.

### Root cause

1. Cursor `settings.json` had `http.proxy` → corporate authenticated proxy (`proxy01…`) with `http.proxySupport: "override"`.
2. MCP `McpProxyFetch` uses that setting. Streamable HTTP to `https://mcp.figma.com/mcp` then fails (`fetch failed`).
3. Desktop local MCP (`127.0.0.1:3845`) was not available (UI is remote-only here).

### Fix (do this before Figma MCP work)

```powershell
# 1) Start PX, then optional env/git helper
.\scripts\set-proxy-px.ps1

# 2) Disable Cursor http.proxySupport so remote Figma MCP can fetch
.\scripts\cursor-proxy-for-figma.ps1 off
```

Then in Cursor:

1. `Ctrl+Shift+P` → **Developer: Reload Window**
2. Settings → MCP → **figma** → **Authenticate / Connect** (or Figma’s **Get Figma integration**)
3. Confirm tools are listed (not “0 tools enabled”)

After Figma work, if you need Cursor traffic via PX again:

```powershell
.\scripts\cursor-proxy-for-figma.ps1 on
# Reload Window again
```

### Do not

- Rely only on User `HTTP_PROXY` env — Cursor MCP does **not** use it the same way as git/curl.
- Expect a Desktop “Enable MCP” switch when Inspect MCP text says **via the remote MCP server**.
- Leave `http.proxySupport: "override"` on corporate `proxy01` while using Figma remote MCP.

## Script index

| Script | Purpose |
|--------|---------|
| `set-proxy-px.ps1` | User `HTTP_PROXY`/`HTTPS_PROXY` → PX; git proxy; WinINET → `127.0.0.1:3128` + Figma ProxyOverride; patches Cursor `http.proxy` URL to PX |
| `set-proxy-corp.ps1` | Restore User env + git proxy to corporate `lb01` |
| `cursor-proxy-for-figma.ps1` | Toggle Cursor `http.proxySupport`: `off` (Figma MCP) / `on` (PX override) / `corp` (restore corp URL from backup) |
| `restore-proxy-corp-wininet.ps1` | Restore WinINET `ProxyServer` from `~/.cursor/proxy-backup-before-px.json`, keep Figma in ProxyOverride |
| `gh-auth-sprzwty.ps1` / `gh-auth-twkirity.ps1` | GitHub auth helpers |
| `sync-to-notion.mjs` / `fetch-notion-*.mjs` | Notion content tooling |

## `cursor-proxy-for-figma.ps1`

```powershell
# Recommended while using Figma remote MCP
.\scripts\cursor-proxy-for-figma.ps1 off

# Route Cursor editor HTTP via local PX (may break Streamable HTTP MCP again)
.\scripts\cursor-proxy-for-figma.ps1 on

# Restore corporate proxy URL from ~/.cursor/settings-http-proxy-corp-url.txt if present
.\scripts\cursor-proxy-for-figma.ps1 corp
```

Always **Reload Window** after changing modes.

## Network checklist

| Path | Expected |
|------|----------|
| `curl --proxy http://127.0.0.1:3128 https://mcp.figma.com/mcp` | HTTP 405 (reachable) |
| Direct `https://mcp.figma.com/mcp` (no corp proxy) | HTTP 405 on this LAN |
| Corp `lb01` / `proxy01` without auth to Figma MCP | Often 407 / fetch failed |

## Related migration work

LVGL → Figma reconstruction docs live in the product repo:

`tadasunomori/docs/figma-migration/`
