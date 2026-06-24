# VistaView — AI Agent Rules

## What This Is

Zero-dependency TypeScript image lightbox library. Published to npm as `vistaview`. Touch/pinch, zoom, animations, extension system, 4 framework bindings.

## Stack

TypeScript (strict, noUnusedLocals, noUnusedParameters), Vite (rolldown-vite), Vitest + happy-dom, Playwright E2E, pnpm monorepo.

## Layout

```
main/              - Core library
frameworks/        - react/, vue/, svelte/, solid/
extensions/        - 14 extensions (video, maps, download, select-box, logger, etc.)
dev/               - Playgrounds (vanilla, next, nuxt, svelte, solid)
doc/               - VitePress docs
```

Each sub-package has its own `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`.

## Commands

| Command | What |
|---|---|
| `pnpm dev` | Build all + parallel dev servers |
| `pnpm build` | Build core + libs |
| `pnpm test` | All packages' unit tests |
| `pnpm test:core` | Core lib only |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm build:main` | Build core only |
| `pnpm build:libs` | Build frameworks + extensions |

- Never run the dev server (`pnpm dev`).

## Conventions

- **kebab-case filenames** (e.g. `vista-image.ts`, not `vistaImage.ts`)
- CSS classes prefixed with `vvw-`
- Tests co-located in `__tests__/` directories, Vitest with `happy-dom` environment
- TypeScript strict mode, no unused locals/params allowed
- Vite library mode with `preserveModules` for ES output
- `main/src/lib/types.ts` has all shared types
- `main/src/lib/defaults/` has default functions (init, open, close, transition, options)
- All classes exportable from `main/src/vistaview.ts`

## Architecture

- **`vistaView(elements, opts)`** — the public entry point, returns a `VistaInterface`
- **`VistaView` class** (`vista-view.ts`) — lifecycle, navigation, zoom state
- **Extensions** implement `VistaExtension` type: lifecycle hooks (`onInitializeImage`, `onImageView`, `onOpen`, `onClose`, `onDeactivateUi`, `onReactivateUi`) + optional `control()` for toolbar buttons
- **Framework bindings** wrap core. React uses `useVistaView` hook + `<VistaView>` component with forwarded ref. Vue/Svelte/Solid follow same component pattern.
- **Uses `AbortController`** for cancelable transitions during rapid navigation

## NPM Publishing

Root `package.json` is the published artifact. `pnpm publish --access public` on push to `main` (latest tag) or `dev` (next tag). CI in `.github/workflows/`.

## File Creation

- Create files with lowercase kebab casing (e.g., `utils-helper.ts`).
- Avoid uppercase letters, underscores, or camelCase in filenames.
- Organize files logically within the project structure.

## Committing

- Never push. Only stage and commit locally.
- Use conventional commit format: `type: description`
- Subject line, blank line, then bullet points for details
- Before committing, check `git status` and `git diff`
- Use real multi-line strings, not `\n` escapes
- On failure, check the error and fix the underlying issue

## Avoiding Untruthfulness

- Never state something as fact without verifying first. Read the file, check the config, trace the code.
- If unsure, say "let me check" and use the appropriate tool.
- Admit mistakes immediately and correct them.
