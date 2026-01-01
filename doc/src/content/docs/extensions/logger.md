---
title: Logger Extension
description: Debug extension that logs all lifecycle events
---

The Logger extension is a development tool that logs all lifecycle events to the browser console. It's useful for debugging and understanding the extension system.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { logger } from 'vistaview/extensions/logger';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [logger()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/logger.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.logger()],
  });
</script>
```

## Features

- **Lifecycle logging** - Logs all extension lifecycle events
- **Image initialization** - Logs when images are initialized
- **Navigation tracking** - Logs image view events
- **Open/close tracking** - Logs lightbox open and close events
- **Console output** - All logs use `console.debug()` for easy filtering

## What Gets Logged

The logger extension logs the following events:

### onInitializeImage

Logged when each image is initialized during setup:

```
Logger: Image initialized: {
  config: { src: "...", alt: "..." },
  origin: { ... },
  index: 0
}
```

### onOpen

Logged when the lightbox opens:

```
Logger: Opened VistaView { ... }
```

### onImageView

Logged when navigating to an image:

```
Logger: Image viewed {
  index: { from: 0, to: 1 },
  images: { ... },
  direction: "next"
}
```

### onClose

Logged when the lightbox closes:

```
Logger: Closed VistaView { ... }
```

## Usage Example

```javascript
import { vistaView } from 'vistaview';
import { logger } from 'vistaview/extensions/logger';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [logger()],
  onOpen: () => {
    console.log('App: Gallery opened');
  },
});
```

Open your browser's developer console and interact with the lightbox to see the logs.

## Filtering Logs

The logger uses `console.debug()`, so you can filter logs in your browser's developer console:

### Chrome/Edge

1. Open DevTools (F12)
2. Go to Console tab
3. Select log levels and choose "Verbose" or "Debug"

### Firefox

1. Open Developer Tools (F12)
2. Go to Console tab
3. Click the filter icon and enable "Debug"

### Safari

1. Open Web Inspector (Cmd+Option+I)
2. Go to Console tab
3. Click the filter icon and enable "Debug"

## Bundle Size

- **ESM:** 0.61 KB (0.23 KB gzip)
- **UMD:** 0.76 KB (0.37 KB gzip)

## Use Cases

### Debugging Custom Extensions

```javascript
import { logger } from 'vistaview/extensions/logger';
import { myCustomExtension } from './my-extension';

vistaView({
  elements: '#gallery a',
  extensions: [
    logger(), // Log all events
    myCustomExtension(), // Your extension
  ],
});
```

### Understanding Event Order

Use the logger to understand the order of lifecycle events:

```javascript
vistaView({
  elements: '#gallery a',
  extensions: [logger()],
});
```

Then interact with the lightbox and observe the console:

```
Logger: Opened ...
Logger: Image initialized ...
Logger: Image viewed ...
Logger: Image viewed ...
Logger: Closed ...
```

### Development vs Production

Only include the logger in development:

```javascript
const extensions = [];

if (process.env.NODE_ENV === 'development') {
  const { logger } = await import('vistaview/extensions/logger');
  extensions.push(logger());
}

vistaView({
  elements: '#gallery a',
  extensions,
});
```

## Next Steps

- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
- See [events and lifecycle](/core/events)
