# VistaView Test Plan

## 1. Overview

VistaView is a monorepo (pnpm workspace) with a zero-dependency image lightbox core, 4 framework bindings (React, Vue, Svelte, Solid), and 14 extensions. Core library has 170 tests, extensions have 64 tests (across 10 extension packages). select-box and twitch-video are undocumented and excluded from tests.

## 2. Progress

> Mark completed items with `[x]`. When resuming, grep for `[ ]` to find what's left.

### Phase 1 — Foundation
- [x] Install vitest and happy-dom in `main/package.json`
- [x] Create `main/vitest.config.ts`
- [x] Add test scripts to root `package.json`
- [x] Run `pnpm install`
- [x] Write `utils/` tests: `clamp`, `limitPrecision`, `is-not-zero-css`
- [x] Write `get-full-size-dim.test.ts`
- [x] Write `get-fitted-size.test.ts`
- [x] Write `throttle.test.ts`
- [x] Write `vista-state.test.ts`
- [x] Write `vista-hires-transition.test.ts`

### Phase 2 — Core Classes
- [x] Write `parse-element.test.ts` (14 tests)
- [x] Write `get-style.test.ts` (4 tests)
- [x] Write `vista-box.test.ts` (14 tests)
- [x] Write `vista-pointers.test.ts` (13 tests)
- [x] Write `vista-image.test.ts` (12 tests)
- [x] Write `vista-image-event.test.ts` (13 tests)

### Phase 3 — Integration
- [x] Write `components.test.ts` (6 tests)
- [x] Write `main.test.ts` (covered by vista-view mock tests)
- [x] Write `defaults/options.test.ts` (8 tests)
- [x] Write `defaults/init.test.ts` (9 tests)
- [x] Write `defaults/open.test.ts` (2 tests)
- [x] Write `defaults/close.test.ts` (1 test)
- [x] Write `defaults/transition.test.ts` (7 tests)
- [x] Write `vista-view.test.ts` (17 tests covering constructor, open, close, destroy, navigation, zoom)

### Phase 4 — Extensions
- [x] Write youtube-video tests: `parseYouTubeVideoId`, `getYouTubeThumbnail` (13 tests)
- [x] Write vimeo-video tests: `parseVimeoVideoId`, `getVimeoThumbnail` (8 tests)
- [x] Write dailymotion-video tests: `parseDailymotionVideoId`, `getDailymotionThumbnail` (7 tests)
- [x] Write wistia-video tests: `parseWistiaVideoId` (5 tests)
- [x] Write vidyard-video tests: `parseVidyardVideoId`, `getVidyardThumbnail` (7 tests)
- [x] Write streamable-video tests: `parseStreamableVideoId`, `getStreamableThumbnail` (6 tests)
- [x] Write twitch-video tests (removed — undocumented extension)
- [x] Write google-maps tests: `parseGoogleMapsLocation` (3 tests)
- [x] Write mapbox tests: `parseMapboxLocation`, `getMapboxStaticImage` (5 tests)
- [x] Write openstreetmap tests: `parseOpenStreetMapLocation` (4 tests)
- [x] Write logger tests: lifecycle hook console.debug verification (6 tests)
- [ ] Write download tests (requires full integration or refactor)
- [ ] Write image-story tests (removeStory is pure but not exported)

### Phase 5 — Framework Bindings
- [ ] Set up testing for React binding
- [ ] Set up testing for Vue binding
- [ ] Set up testing for Svelte binding
- [ ] Expand Solid binding tests

### Phase 6 — E2E / Visual
- [ ] Install Playwright
- [ ] Write E2E tests against dev apps (smoke)
- [ ] Write visual regression tests

## 3. Testing Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Unit (pure logic) | `vitest` with `happy-dom` | Lightweight, fast for DOM-less tests. Already used in solid framework. |
| Unit (DOM-dependent) | `vitest` with `jsdom` or `happy-dom` | Need DOM environment for DOM manipulation tests. |
| Visual / Integration | Playwright | For E2E tests across dev apps and actual browser rendering. |

Add to root `package.json`:
```json
{
  "scripts": {
    "test": "pnpm --recursive --parallel test",
    "test:core": "pnpm --filter main test",
    "test:ci": "pnpm test"
  }
}
```

Add to `main/package.json`:
```json
{
  "devDependencies": {
    "vitest": "^1.6.0",
    "happy-dom": "^14.0.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 4. Test Structure

```
main/
├── src/
│   └── lib/
│       ├── __tests__/
│       │   ├── utils/
│       │   │   ├── get-full-size-dim.test.ts
│       │   │   ├── get-fitted-size.test.ts
│       │   │   ├── parse-element.test.ts
│       │   │   ├── get-style.test.ts
│       │   │   ├── is-not-zero-css.test.ts
│       │   │   └── index.test.ts
│       │   ├── throttle.test.ts
│       │   ├── vista-state.test.ts
│       │   ├── vista-pointers.test.ts
│       │   ├── vista-hires-transition.test.ts
│       │   ├── vista-image.test.ts
│       │   ├── vista-box.test.ts
│       │   ├── vista-view.test.ts
│       │   ├── vista-image-event.test.ts
│       │   ├── components.test.ts
│       │   ├── main.test.ts
│       │   ├── defaults/
│       │   │   ├── options.test.ts
│       │   │   ├── init.test.ts
│       │   │   ├── open.test.ts
│       │   │   ├── close.test.ts
│       │   │   └── transition.test.ts
│       │   └── integration/
│       │       ├── open-close.test.ts
│       │       ├── navigation.test.ts
│       │       └── zoom.test.ts
├── vitest.config.ts
```

## 5. Test Categories

### 5.1 Pure Utility Functions (no DOM needed)

| Module | What to test |
|--------|-------------|
| `utils/clamp` | Boundary values, normal values, NaN edge cases |
| `utils/limitPrecision` | Rounding behavior, default precision |
| `utils/is-not-zero-css` | Various CSS unit strings, zero values, undefined |
| `utils/get-full-size-dim` | Image smaller than viewport, wider than viewport, taller than viewport |
| `utils/get-fitted-size` | All `object-fit` values (fill, contain, cover, none, scale-down), missing natural dimensions |
| `utils/parse-element` | `<img>` parsing, `<a>` wrapper parsing, `dataset` attributes, srcSet parsing |
| `utils/get-style` | Border radius from anchor vs image, object-fit inheritance |
| `throttle.ts` | Basic throttling, first invocation immediate, throttle window |
| `vista-state.ts` | State initialization, mutations |
| `vista-hires-transition.ts` | Ease calculation, start/stop, completion detection |

### 5.2 DOM-Dependent Unit Tests

| Module | What to test |
|--------|-------------|
| `vista-box.ts` | State creation, setSizes, normalize, destroy (DOM cleanup), cloneStyleFrom, setFinalTransform, toObject |
| `vista-image.ts` | Image element creation, onLoad flow, srcSet resolution, scaleMove math, animateZoom bounds, momentumThrow, setFinalTransform close logic |
| `vista-pointers.ts` | Pointer down/move/up/cancel event handling, multi-touch, centroid calculation, distance calculation, listener lifecycle |
| `vista-image-event.ts` | Keyboard shortcuts, wheel zoom, resize handler, pointer event delegation, pinch gesture detection |
| `components.ts` | Trusted types handling, HTML structure generation, control layout, extension container population |
| `vista-view.ts` (partial) | Constructor, reset (event binding), lifecycle methods, navigation methods, zoom controls -- most require full integration |

### 5.3 Integration Tests

| Scenario | What to verify |
|----------|---------------|
| **Open/Close** | `vistaView()` returns interface, open renders DOM, close cleans up DOM and restores origin elements, destroy removes listeners |
| **Navigation** | next/prev wraps around, view(index) navigates correctly, rapid-swap throttling, single-image hides arrows |
| **Zoom** | zoomIn/zoomOut threshold boundaries, zoom button disabled state, pinch-zoom-to-close |
| **Swipe** | Horizontal swipe triggers prev/next, vertical swipe triggers close, threshold under/over |
| **Keyboard** | Arrow keys navigate, Escape closes, ArrowUp/ArrowDown zooms |
| **Options** | Custom controls layout, extension lifecycle hooks, custom override functions, reduced-motion |
| **Config arrays** | `VistaImgConfig[]` without DOM elements, string selector with `<img>` and `<a>` elements |
| **Error handling** | Invalid selector, invalid elements, already-open guard |
| **Resize** | Window resize recalculates image dimensions |

### 5.4 Extension Tests

| Extension | Test approach |
|-----------|--------------|
| youtube-video, vimeo-video, wistia-video, etc. | Mock embed creation, verify DOM structure, verify open/close lifecycle |
| download | Verify download link generation |
| logger | Verify log output |
| mapbox, google-maps, openstreetmap | Verify iframe/map element creation, verify lifecycle |
| image-story | Verify story layout, verify next/prev within story |
| select-box | Verify selection UI, lifecycle hooks |

### 5.5 Framework Binding Tests

| Framework | Approach |
|-----------|----------|
| React (`use-vistaview`) | Mount hook with `@testing-library/react`, verify open/close through hook |
| Vue (`use-vistaview`) | Mount composable with `@vue/test-utils` |
| Svelte (`use-vistaview`) | Run with `svelte-testing-library` |
| Solid (`use-vistaview`) | Already has vitest + jsdom tests, expand coverage |

## 6. Vitest Config (for `main/`)

```ts
// main/vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts', 'src/**/__tests__/**'],
    },
  },
})
```

## 7. Implementation Order

1. **Phase 1 -- Foundation** (day 1)
   - Install vitest, happy-dom in `main/`
   - Add test scripts to `main/package.json` and root `package.json`
   - Write tests for pure utilities: `clamp`, `limitPrecision`, `is-not-zero-css`, `get-full-size-dim`, `get-fitted-size`
   - Write tests for `throttle`, `vista-state`, `vista-hires-transition`

2. **Phase 2 -- Core Classes** (day 2-3)
   - `parse-element`, `get-style`
   - `vista-box` (state management, DOM manipulation, lifecycle)
   - `vista-pointers` (event simulation)
   - `vista-image-event` (keyboard, wheel, pointer event chains)

3. **Phase 3 -- Integration** (day 3-4)
   - `vista-view` constructor, lifecycle (open/close/destroy)
   - Navigation (next/prev/view/rapid-swap)
   - `components.ts` HTML generation
   - `main.ts` entry point

4. **Phase 4 -- Extensions** (day 4-5)
   - Test extension lifecycle hooks
   - Video player extensions with mocked embed APIs
   - Map extensions

5. **Phase 5 -- Framework bindings** (day 5-6)
   - Set up testing for React, Vue, Svelte bindings
   - Verify they correctly proxy the core API

6. **Phase 6 -- E2E / Visual** (day 6-7)
   - Playwright tests against dev apps
   - Visual regression on lightbox open/close animations

## 8. Key Edge Cases to Cover

- Zero-length element lists
- Wrapped `<a>` elements without `<img>` children
- Missing `src` in config arrays
- `prefers-reduced-motion: reduce`
- Multiple `VistaView` instances (the global singleton guard)
- Touch vs pointer input
- Image load failures
- CSS units in `is-not-zero-css` (px, %, rem, em, vw, vh, vmin, vmax, cm, mm, in, pt, pc, ex, ch)
- srcSet parsing with malformed entries
- Rapid navigation causing cancelled image loads
- Window resize during open lightbox

## 9. Prerequisites

Before writing tests, ensure:

- [ ] vitest and happy-dom added to `main/package.json`
- [ ] `vitest.config.ts` created in `main/`
- [ ] Root `package.json` test script updated
- [ ] `pnpm install` run
- [ ] CI workflow updated (if `.github/workflows` exists)
