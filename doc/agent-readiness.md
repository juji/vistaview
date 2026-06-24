# Agent Readiness Status — vistaview.jujiplay.com

## Done

| Area | File(s) | Notes |
|---|---|---|
| robots.txt | `public/robots.txt` | RFC 9309 valid. AI crawler entries + wildcard + Content-Signal. Allows all. |
| Link headers | `public/_headers` | `describedby` → `/llms.txt`, `service-doc` → `/robots.txt`, `api-catalog` → `/.well-known/api-catalog`. CORS + caching for `/.well-known/*`. |
| API Catalog | `public/.well-known/api-catalog` | RFC 9727 linkset+json. No OpenAPI spec or health endpoint (this is a JS library, not a web API — llms.txt serves as service-desc). |
| Agent Skills Index | `public/.well-known/agent-skills/index.json` | v0.2.0 schema. Empty skills array — no agent skills published yet. |
| MCP Server Card | `public/.well-known/mcp/server-card.json` | SEP-2127 format. Identifies project. No remotes (no MCP server exists). |
| Content-Signal | in robots.txt | `ai-train=yes, search=yes, ai-input=yes` |

## Not Done / Blocked

| Area | Why | Path to fix |
|---|---|---|
| Markdown for Agents | Cloudflare platform feature, requires Pro/Business plan | Toggle on in Cloudflare dashboard → AI Crawl Control → Markdown for Agents. Or implement via Worker/API. |
| Sitemap | `@astrojs/sitemap` not installed | `pnpm add @astrojs/sitemap` in `doc/`, add to `astro.config.mjs`, update `robots.txt` with `Sitemap:` line. |

## Skip (Intentionally)

| Area | Reason |
|---|---|
| WebMCP | Static docs site — no dynamic app state for agents to act on. Agents can read HTML/markdown directly. |

## Verify

```bash
curl -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://vistaview.jujiplay.com"}'
```
