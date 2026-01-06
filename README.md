# VistaView

A lightweight, modern image lightbox library for the web. Zero dependencies, framework-agnostic, and highly customizable.

## Features

- 🪶 **Lightweight** — ~42KB ESM (~10KB gzip), minimal footprint
- 📱 **Touch-first** — Swipe gestures for navigation and closing, pinch-to-zoom support
- 🎨 **Customizable** — Configurable controls, animations, and styling via CSS variables
- ♿ **Accessible** — Keyboard navigation, ARIA labels, reduced motion support
- 🔧 **Framework-agnostic** — Works with vanilla JS, React, Vue, Svelte, Solid, or any framework
- 🖼️ **Progressive loading** — Low-res thumbnails → high-res images with smooth transitions
- 🔍 **Smart zoom** — Pan and zoom with momentum physics, respects actual image resolution
- 🎯 **Pointer-aware** — Advanced multi-touch tracking with context menu prevention
- 🎬 **Video embeds** — Support for YouTube, Vimeo, Dailymotion, Wistia, Vidyard, Streamable
- 🗺️ **Map embeds** — Support for Google Maps, Mapbox, OpenStreetMap with interactive controls

## Installation

```bash
npm install vistaview
```

### Using CDN (UMD)

For quick prototyping or non-bundler environments, use the UMD build via CDN:

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/vistaview/dist/style.css" />
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>

<!-- or jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vistaview/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/vistaview/dist/vistaview.umd.js"></script>

<script>
  // VistaView is available globally
  VistaView.vistaView({
    elements: '#gallery a',
  });
</script>
```

## Quick Start

### Using anchor elements (recommended)

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
  <a href="/images/photo2-full.jpg">
    <img src="/images/photo2-thumb.jpg" alt="Photo 2" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
  });
</script>
```

## Documentation

For full documentation, visit [https://vistaview.jujiplay.com/](https://vistaview.jujiplay.com/)

## License

MIT
