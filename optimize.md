# VistaView Bundle Size Optimization Guide

This document outlines potential optimizations to reduce the bundle size of the VistaView library.

---

## Summary

| File | Current Issues | Potential Savings |
|------|---------------|-------------------|
| `vistaview.ts` | Duplicated mapping logic | ~40% |
| `vista-view.ts` | Verbose queries, repeated selectors | ~15-20% |
| `components.ts` | Large inline SVGs, repetitive HTML | ~25-30% |
| `utils.ts` | DOMPurify dependency (~15KB), verbose code | ~60-70% |
| `style.css` | Duplicate animation keyframes, verbose selectors | ~15-20% |

**Estimated total reduction: 30-40% of bundle size**

---

## 1. `vistaview.ts` - Entry Point

### Issue: Duplicated Element Mapping Logic
The element-to-`VistaViewImage` mapping is duplicated twice (lines 33-45 and 56-68).

**Current (~800 bytes duplicated):**
```typescript
elements = childElements.map( el => {
  return {
    src: el.dataset.vistaviewSrc || el.getAttribute('href') || '',
    width: el.dataset.vistaviewWidth ? parseInt(el.dataset.vistaviewWidth) : ( el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).naturalWidth : 0 ),
    // ... repeated
  }
})
```

**Optimized:**
```typescript
const toImage = (el: HTMLElement): VistaViewImage => {
  const img = el instanceof HTMLImageElement ? el : el.querySelector('img') as HTMLImageElement | null;
  return {
    src: el.dataset.vistaviewSrc || el.getAttribute('href') || '',
    width: +(el.dataset.vistaviewWidth || img?.naturalWidth || 0),
    height: +(el.dataset.vistaviewHeight || img?.naturalHeight || 0),
    smallSrc: img?.src || el.dataset.vistaviewSmallsrc || el.getAttribute('src') || '',
    alt: img?.alt || el.dataset.vistaviewAlt || el.getAttribute('alt') || '',
    anchor: el instanceof HTMLAnchorElement ? el : undefined,
    image: img || undefined
  };
};
```

### Issue: Repeated `el.querySelector('img')` Calls
Each property access calls `querySelector` separately (~6 calls per element).

**Savings:** Cache `querySelector` result once per element.

### Issue: Verbose Validation (lines 72-87)
Runtime validation adds ~500 bytes of error messages.

**Options:**
1. Remove runtime validation (rely on TypeScript)
2. Use shorter error messages
3. Make validation optional/dev-only

**Estimated savings: ~600-800 bytes**

---

## 2. `vista-view.ts` - Core Class

### Issue: Repeated DOM Queries
Same selectors queried multiple times:

```typescript
// Called in zoomIn, zoomOut, clearZoom (3x each)
this.containerElement?.querySelectorAll('.vistaview-image-highres')[this.currentIndex]
this.containerElement?.querySelector('button.vistaview-zoom-in-button')
this.containerElement?.querySelector('button.vistaview-zoom-out-button')
```

**Optimized:** Cache button references on initialization:
```typescript
private zoomInBtn: HTMLButtonElement | null = null;
private zoomOutBtn: HTMLButtonElement | null = null;

// In open():
this.zoomInBtn = this.containerElement.querySelector('.vistaview-zoom-in-button');
this.zoomOutBtn = this.containerElement.querySelector('.vistaview-zoom-out-button');
```

### Issue: Verbose Data Attribute Names
Long attribute names increase HTML size:
- `data-vistaview-initial-width` (27 chars)
- `data-vistaview-current-height` (28 chars)
- `data-vistaview-thumbnail-objectfit` (34 chars)

**Optimized:** Use shorter names:
- `data-vv-iw` (initial width)
- `data-vv-ch` (current height)
- `data-vv-of` (object fit)

### Issue: Method Arrow Functions in Event Listeners
```typescript
button.addEventListener('click', () => {
  this.zoomIn();
});
```

**Optimized:** Use bound methods:
```typescript
// In constructor
this.zoomIn = this.zoomIn.bind(this);
// In open
button.addEventListener('click', this.zoomIn);
```

### Issue: `DefaultOptions` Object Structure
The nested structure adds overhead:

```typescript
const DefaultOptions = {
  detectReducedMotion: true,
  zoomStep: 300,
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', getDownloadButton(), 'close']
  }
}
```

**Consideration:** Keep as-is for readability, minifiers handle this well.

**Estimated savings: ~400-600 bytes**

---

## 3. `components.ts` - HTML Templates

### Issue: Large Inline SVG Icons (~2.5KB)
Each icon is a full SVG string with redundant attributes:

```typescript
const zoomIn = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in-icon lucide-zoom-in">...</svg>`
```

**Optimizations:**

1. **Use SVG symbols/sprite** (best: ~70% reduction):
```typescript
// Define once in template
<svg style="display:none"><symbol id="icon-zoom-in">...</symbol></svg>
// Use everywhere
<svg><use href="#icon-zoom-in"/></svg>
```

2. **Remove redundant attributes**:
```typescript
// Before: ~300 bytes per icon
const zoomIn = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in-icon lucide-zoom-in">...`

// After: ~150 bytes per icon (apply defaults via CSS)
const zoomIn = `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>`
```

3. **CSS for common SVG styles**:
```css
.vistaview-root svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

### Issue: Template String Indentation
Whitespace in template literals is included in output:

```typescript
return `<div class="vistaview-root">
    <div class="vistaview-container">
      ...
    </div>
  </div>`;
```

**Note:** Minifiers typically handle this, but for manual optimization, use concatenation or remove indentation.

**Estimated savings: ~800-1200 bytes**

---

## 4. `utils.ts` - Utilities

### Issue: DOMPurify Dependency (~15KB minified)
The largest dependency, used for HTML sanitization.

**Options:**

1. **Make it optional** (user provides their own sanitizer):
```typescript
export function createTrustedHtml(
  htmlString: string, 
  sanitizer?: (html: string) => string
): DocumentFragment {
  const clean = sanitizer ? sanitizer(htmlString) : htmlString;
  // ...
}
```

2. **Use native Sanitizer API** (where available):
```typescript
if ('Sanitizer' in window) {
  // Use native
} else {
  // Fallback or warn
}
```

3. **Remove sanitization** (if input is trusted):
Since VistaView generates its own HTML from user data (URLs, dimensions), you could:
- Validate/escape only user-provided strings
- Skip full HTML sanitization

### Issue: Trusted Types Polyfill Duplication
The polyfill check is duplicated:

```typescript
// In getPolicy()
if (!window.trustedTypes) {
  (window as any).trustedTypes = { ... };
}

// In createTrustedHtml()
if (!window.trustedTypes) {
  (window as any).trustedTypes = { ... };
}
```

**Fix:** Remove duplicate in `createTrustedHtml()` since `getPolicy()` handles it.

### Issue: Verbose `getElmProperties`
```typescript
export function getElmProperties(elm: HTMLElement): VistaViewElm {
  const objectFit = window.getComputedStyle(elm).getPropertyValue('object-fit');
  const borderRadius = window.getComputedStyle(elm).getPropertyValue('border-radius');
  // ... 4 separate getComputedStyle calls
}
```

**Optimized:**
```typescript
export function getElmProperties(elm: HTMLElement): VistaViewElm {
  const s = getComputedStyle(elm);
  return {
    objectFit: s.objectFit,
    borderRadius: s.borderRadius,
    objectPosition: s.objectPosition,
    overflow: s.overflow
  };
}
```

### Issue: `isNotZeroCssValue` Array
```typescript
const zeroValues = ['0', '0px', '0%', '0em', '0rem', '0vw', '0vh', '0vmin', '0vmax', '0cm', '0mm', '0in', '0pt', '0pc', '0ex', '0ch'];
```

**Optimized:**
```typescript
const isNotZeroCssValue = (v?: string) => 
  v && !/^0(px|%|em|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|ex|ch)?$/i.test(v.trim()) && v;
```

**Estimated savings: ~15KB+ (with DOMPurify removal/replacement)**

---

## 5. `style.css` - Styles

### Issue: Duplicate Keyframe Properties
`vistaview-anim-in` and `vistaview-anim-out` share similar structure but are defined separately (~100 lines).

**Consider:** Using CSS custom properties or animation-direction for reversal.

### Issue: Verbose CSS Variable Names
```css
--vistaview-container-initial-width
--vistaview-container-initial-height
--vistaview-container-initial-top
--vistaview-container-initial-left
```

**Optimized:**
```css
--vv-w   /* initial width */
--vv-h   /* initial height */
--vv-t   /* initial top */
--vv-l   /* initial left */
```

### Issue: Repeated Selectors
```css
.vistaview-root .vistaview-container .vistaview-image-container .vistaview-item img.vistaview-image-highres
```

**Consider:** Using CSS nesting (already done) or shorter class names for internal elements.

### Issue: Unused/Redundant Rules
```css
/* Duplicate z-index declaration */
.vistaview-top-bar, .vistaview-bottom-bar {
  z-index: 2;
  /* ... */
  z-index: 2;  /* declared twice */
}
```

**Estimated savings: ~500-800 bytes (CSS)**

---

## 6. Build-Time Optimizations

### Recommended Vite/Rollup Config:

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      mangle: {
        properties: {
          regex: /^_/ // Mangle private properties starting with _
        }
      }
    },
    rollupOptions: {
      output: {
        manualChunks: undefined // Single bundle
      }
    }
  }
}
```

### Consider Tree-Shaking Improvements:

```typescript
// Export individual functions for better tree-shaking
export { vistaView } from './vistaview';
export { VistaView } from './lib/vista-view';
export type { VistaViewOptions, VistaViewImage } from './lib/vista-view';
```

---

## 7. Priority Recommendations

### High Impact (Do First):
1. **Remove/replace DOMPurify** - Saves ~15KB
2. **Extract `toImage` helper** - Removes code duplication
3. **Optimize SVG icons** - Saves ~1KB+

### Medium Impact:
4. **Cache DOM queries** - Better performance + smaller code
5. **Shorten data attributes** - Reduces HTML size
6. **Fix utils.ts duplication** - Cleaner code

### Low Impact (Nice to Have):
7. **Shorter CSS variable names** - Minor savings
8. **Remove verbose error messages** - ~500 bytes
9. **Optimize keyframe animations** - Minor savings

---

## 8. Alternative: Minimal Build

For users who want the smallest possible bundle:

```typescript
// vistaview.min.ts - No validation, no sanitization
export function vistaViewMin(opts: { parent: HTMLElement }) {
  const els = Array.from(opts.parent.querySelectorAll('img[data-vistaview-src]'));
  const imgs = els.map(el => ({
    src: el.dataset.vistaviewSrc!,
    width: +el.dataset.vistaviewWidth! || el.naturalWidth,
    height: +el.dataset.vistaviewHeight! || el.naturalHeight,
    image: el
  }));
  return new VistaView(imgs, {});
}
```

---

## Estimated Final Bundle Size

| Component | Current (est.) | Optimized (est.) |
|-----------|---------------|------------------|
| vistaview.ts | ~2.5KB | ~1.5KB |
| vista-view.ts | ~8KB | ~6.5KB |
| components.ts | ~4KB | ~2.5KB |
| utils.ts | ~17KB (with DOMPurify) | ~2KB (without) |
| style.css | ~4KB | ~3KB |
| **Total** | **~35KB** | **~15KB** |

*Note: Sizes are approximate and depend on minification settings.*
