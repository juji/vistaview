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
| Sitemap | `@astrojs/sitemap` + `astro.config.mjs` | Generates `sitemap-0.xml` + `sitemap-index.xml`. Referenced in robots.txt. SSR-compatible via sidebar-derived `customPages`. |
| Markdown for Agents | `src/middleware.ts` + `astro.config.mjs` | SSR middleware. `Accept: text/markdown` triggers `jsdom` extraction of `.sl-markdown-content` → `turndown` conversion. Returns `Content-Type: text/markdown`. Tested working on all doc pages. **Tradeoff:** Requires `prerender: false` (SSR routes), which disables Pagefind search. |

## Not Done

_none_

## Future

| Area | Notes |
|---|---|
| MCP Server | Build an MCP server (`@modelcontextprotocol/sdk` or Workers `agents-sdk`) that exposes VistaView API as tools (create-gallery, get-config, generate-setup-code). Serve at `/mcp`, add `remotes` entry to `server-card.json`, and point `_mcp._agents` DNS-AID record at it. Would let AI agents generate gallery code dynamically. |

## Skip (Intentionally)

| Area | Reason |
|---|---|
| WebMCP | Static docs site — no dynamic app state for agents to act on. Agents can read HTML/markdown directly. |
| DNS-AID | No agent endpoints to advertise. Requires actual A2A or MCP server. |

## Verify

```bash
curl -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://vistaview.jujiplay.com"}'
```
