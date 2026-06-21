# VistaView

A lightweight, zero-dependency image lightbox library with smooth animations and touch support.

## Packages

| Path | Description |
|------|-------------|
| `main/` | Core library |
| `frameworks/` | React, Vue, Svelte, Solid bindings |
| `extensions/` | Optional plugins (video, maps, UI) |
| `doc/` | Documentation site (Astro + Starlight) |

## Extensions

Public extensions are documented at [opencode.ai](https://opencode.ai). Some extensions exist in the repo but are **not publicly documented** — they are available for use but don't appear in the sidebar or have dedicated doc pages (`select-box`, `twitch-video`).

## Quick Start

```bash
pnpm install
pnpm dev
```

## Test

```bash
pnpm test:core      # Core library (170 tests)
pnpm test           # All workspace packages with test scripts
```

## License

MIT
