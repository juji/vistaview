# Dev Apps Audit Report

## 1. Overview

Five dev apps exist across frameworks, each demonstrating VistaView on 3 routes:

| App | Framework | Runtime | Port | VistaView import |
|-----|-----------|---------|------|-----------------|
| `vanilla` | Vanilla TS | Vite (rolldown) | 3001 | `vistaview` |
| `next` | Next.js 16.1.3 / React 19 | Next.js | 3002 | `vistaview/react` |
| `nuxt` | Nuxt 4 / Vue 3 | Nuxt | 3003 | `vistaview/vue` |
| `svelte` | SvelteKit 2 / Svelte 5 | Vite | 3004 | `vistaview/svelte` |
| `solid` | SolidStart 1 / Solid 1.9 | Vinxi | 3005 | `vistaview/solid` |

---

## 2. Consistency Check

### 2.1 Routes (same pattern across all 5 apps)

| Route | Vanilla | Next | Nuxt | Svelte | Solid |
|-------|---------|------|------|--------|-------|
| `/` (Basic) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/hook` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/extension` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Extra pages | -- | -- | -- | -- | -- |

### 2.2 Image Sets (same across all apps)

All apps use identical images from picsum.photos:
- Primary set: IDs 1015, 1016, 1018, 1020, 1024, 1025
- Toggle set: IDs 0, 1031, 1032, 1033, 1, 1035

Vanilla also adds a 90-image "many" grid (IDs 0-89) plus a local thumbnail. All four framework apps use the same 6+6 pattern.

### 2.3 Extensions

| Extension | Vanilla | Next | Nuxt | Svelte | Solid |
|-----------|---------|------|------|--------|-------|
| download | ✅ | ✅ | ✅ | ✅ | ✅ |
| selectBox | ✅ | ✅ | ✅ | ✅ | ✅ |
| imageStory | ✅ | ✅ | ✅ | ✅ | ✅ |
| youtubeVideo | ✅ | ✅ | ✅ | ✅ | ✅ |
| dailymotionVideo | ✅ | ✅ | ✅ | ✅ | ✅ |
| vimeoVideo | ✅ | ✅ | ✅ | ✅ | ✅ |
| wistiaVideo | ✅ | ✅ | ✅ | ✅ | ✅ |
| vidyardVideo | ✅ | ✅ | ✅ | ✅ | ✅ |
| streamableVideo | ✅ | ✅ | ✅ | ✅ | ✅ |
| twitchVideo | ✅ | ✅ | ✅ | ✅ | ✅ |
| googleMaps | ✅ | ✅ | ❌ (commented) | ✅ | ✅ |
| mapbox | ✅ | ✅ | ❌ (commented) | ✅ | ✅ |
| openStreetMap | ✅ | ✅ | ❌ (commented) | ✅ | ✅ |

**Issue:** Nuxt extension page has all three map extensions commented out. Maps are never tested in the Vue/Nuxt integration path.

### 2.4 Control Layout

All apps use the same override:
```
topRight: ['zoomIn', 'zoomOut', 'download', 'close']
bottomCenter: ['imageStory']
```

Default controls (from `DefaultOptions`) are:
```
topLeft: ['indexDisplay']
topRight: ['zoomIn', 'zoomOut', 'close']
bottomLeft: ['description']
```

**Issue:** No dev app exercises the **default controls** or varies the layout. `indexDisplay`, `description`, `topLeft`/`bottomLeft`/`topCenter`/`bottomRight` slots are never tested.

### 2.5 Grid CSS

Nearly identical across all apps: `repeat(auto-fit, minmax(220px, 1fr))`, gap 32px, max-width 960px, anchors 200px height, border-radius 10px, hover outline.

**Issue:** Vanilla uses `repeat(3, 1fr)` instead of `auto-fit`.

### 2.6 Theme Switcher

Vanilla has a dedicated `/styles` route with a theme dropdown (16 themes) demonstrating `data-vistaview-srcset` and dynamic `import('vistaview/styles/${theme}.css')`. This is **not replicated** in any framework app.

---

## 3. Coverage Gaps

### 3.1 Features NOT covered by any dev app

| Feature | Why it matters |
|---------|---------------|
| **Rapid-swap navigation** | Code has explicit rapid-limit codepath (`isRapidSwap`, `333ms` cooldown) -- never exercised |
| **Custom callback events** | `onOpen`, `onClose`, `onImageView`, `onContentChange` -- primary extension hooks |
| **Lifecycle overrides** | Custom `transitionFunction`, `initFunction`, `closeFunction`, `imageSetupFunction` |
| **Programmatic destroy** | `destroy()` removes listeners and restores DOM |
| **Reduced motion** | `prefers-reduced-motion: reduce` skips transitions |
| **Config array (no DOM)** | `vistaView({ elements: [{ src: '...' }] })` -- only partially tested in vanilla |
| **Single image mode** | `elmLength < 2` hides prev/next arrows |
| **Keyboard disabled** | `keyboardListeners: false` |
| **Zoom boundaries** | `maxZoomLevel`, button disabled on max/min |
| **Image load failure** | `onerror` / `isLoadedRejected` path |
| **Error states** | Invalid selector, invalid elements, graceful degradation |
| **Default controls** | No app uses the default control layout |

### 3.2 Features covered by only ONE app

| Feature | App | Should be in others? |
|---------|-----|---------------------|
| `data-vistaview-srcset` / srcSet | Vanilla (`/styles`) | Yes |
| Theme switching (16 themes) | Vanilla (`/styles`) | Yes |
| Large gallery (90 images) | Vanilla (`/`) | Yes, stress-test |
| Programmatic inline array | Vanilla (`/` button) | Yes |

---

## 4. Structural Inconsistencies

### 4.1 Lifecycle pattern for hooks

| App | Hook invocation pattern |
|-----|----------------------|
| Vanilla | Top-level module call |
| Next | Inside `'use client'` component body |
| Nuxt | Inside `<script setup>` |
| Svelte | **Top-level** (not in `$effect`) |
| Solid | Inside component body |

**Issue:** Svelte's `hook` page calls `useVistaView()` at module top level instead of inside a `$effect` lifecycle. Inconsistent with framework best practice.

### 4.2 Dead Code

| App | File | Notes |
|-----|------|-------|
| Next | `page.module.css` | Default Next.js starter CSS, **unused** (uses `vistaview-demo.module.css` instead) |
| Svelte | `src/lib/index.ts` | Empty placeholder |

---

## 5. Summary

### What's good
- All 5 framework bindings covered with identical 3-route structure
- Extensions broadly consistent (10-13 each)
- Image sets and grid styling near-identical
- Import paths follow framework conventions

### What's inconsistent
- Nuxt extension page excludes maps (3 commented out)
- Vanilla grid uses fixed columns (`repeat(3, 1fr)`), others responsive
- Svelte hook calls `useVistaView()` at module top level

### What's MISSING from ALL dev apps
- Default controls, callback events, lifecycle overrides
- Reduced-motion, rapid-swap, image load failure
- Programmatic destroy, single-image mode, error states
- Zoom boundaries, resize behavior, keyboard toggle

### Recommendation
Dev apps are useful as **smoke/E2E targets** for Playwright but are not substitutes for unit tests. The gaps above should be covered by unit tests in the core library. The dev apps themselves should be cleaned up (fix Svelte hook pattern, uncomment Nuxt maps, add a `data-vistaview-srcset` demo to framework apps, and add a `/styles` route to each framework for theme testing).
