---
title: File Sizes
description: Bundle size information for VistaView core, framework bindings, and extensions
---

VistaView is designed to be lightweight. Below are the file sizes for the core library, framework bindings, and extensions.

## Core Library

The core library is available in two formats:

| Format | Raw Size | Gzip Size |
| ------ | -------- | --------- |
| UMD (full bundle) | 39.35 KB | 10.52 KB |
| ESM (tree-shakeable modules) | 73.30 KB | 17.44 KB |
| Styles | 7.52 KB | 1.76 KB |

The ESM format allows bundlers to tree-shake unused code, resulting in smaller final bundles depending on which features you use.

## Framework Bindings

Each framework binding is a thin wrapper around the core library:

| Framework | Raw Size | Gzip Size |
| --------- | -------- | --------- |
| React     | 1.60 KB  | 0.67 KB   |
| Vue       | 2.78 KB  | 1.08 KB   |
| Svelte    | 0.89 KB  | 0.43 KB   |
| Solid     | 2.51 KB  | 0.91 KB   |

## Extensions

Extension sizes are listed on the [Extensions Overview](/extensions/overview) page.

## Next Steps

- Browse individual [extension sizes](/extensions/overview#extension-sizes)
- Learn about [tree-shaking](/integrations/vanilla) with ESM imports
- See the [API Reference](/api-reference/main-function)
