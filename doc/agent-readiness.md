# Agent Readiness Status — vistaview.jujiplay.com

## Done

| Area | File(s) | Notes |
|---|---|---|
| robots.txt | `public/robots.txt` | RFC 9309 valid. AI crawler entries + wildcard + Content-Signal. Allows all. |
| Link headers | `public/_headers` | `describedby` → `/llms.txt`, `service-doc` → `/robots.txt`, `api-catalog` → `/.well-known/api-catalog`. CORS + caching for `/.well-known/*`. |
| API Catalog | `public/.well-known/api-catalog` | RFC 9727 linkset+json. |
| Agent Skills Index | `public/.well-known/agent-skills/index.json` | v0.2.0 schema. Empty skills array. |
| MCP Server Card | `public/.well-known/mcp/server-card.json` | SEP-2127 format. `remotes` points to `POST /mcp` Streamable HTTP endpoint. |
| Content-Signal | in robots.txt | `ai-train=yes, search=yes, ai-input=yes` |
| Sitemap | `@astrojs/sitemap` + `astro.config.mjs` | `sitemap-0.xml` + `sitemap-index.xml`. Referenced in robots.txt. Sidebar-derived `customPages`. |
| Markdown for Agents | `functions/_middleware.js` (esbuild bundle) | Pages Function. `Accept: text/markdown` triggers extraction of `.sl-markdown-content` → `turndown` conversion. Returns `Content-Type: text/markdown`. Astro is static output — **Pagefind search works**. |
| MCP Server | `functions/mcp.ts` | `POST /mcp` — JSON-RPC 2.0. Tools: `get_package_info` (npm), `get_build_status` (GitHub Actions), `search_docs` (via llms-full.txt). No SDK, pure Workers `fetch()`. |
| AI Integration Page | `src/content/docs/ai-integration.mdx` | User-facing docs page explaining all 3 AI access mechanisms. Hero button + footer link. |

## Not Done

_none_

## Future

| Area | Notes |
|---|---|
| Auth for MCP | MCP spec now requires OAuth 2.1 (RFC 6749 + PKCE) for remote servers (2026-07-28 RC). Implement if non-public access is needed. |

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
