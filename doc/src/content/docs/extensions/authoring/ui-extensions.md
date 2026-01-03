---
title: UI Extensions
description: Create extensions that add visible controls to the lightbox
---

UI extensions add visible controls to the lightbox interface. They provide the `control` method that returns an HTML element to be added to the UI.

## Basic UI Extension

```typescript
import type { VistaExtension } from 'vistaview';

export function myButton(): VistaExtension {
  return {
    name: 'myButton',
    control: () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'My Button');
      button.textContent = '✨';

      button.addEventListener('click', () => {
        console.log('Button clicked!');
      });

      return button;
    },
  };
}
```

## Complete Example: Download Button

A fully-featured download button with state management:

```typescript
import type { VistaData, VistaExtension, VistaView } from 'vistaview';

const downloadIcon = `<svg viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`;

export function download(): VistaExtension {
  let currentImage: string | null = null;
  let currentAlt: string | null = null;
  let button: HTMLButtonElement | null = null;

  return {
    name: 'download',

    control: () => {
      button = document.createElement('button');
      button.setAttribute('aria-label', 'Download');
      button.innerHTML = downloadIcon;

      button.addEventListener('click', async () => {
        if (!currentImage) return;
        if (button?.classList.contains('vvw--pulsing')) return; // prevent multiple clicks
        button?.classList.add('vvw--pulsing');

        let response: Response | null = await fetch(currentImage);
        let blob: Blob | null = await response.blob();
        const finalUrl = response.url; // This is the redirected URL

        const alt = currentAlt;
        const extension = finalUrl.split('?')[0].split('#')[0].split('.').pop();
        const fileName = alt
          ? `${alt}.${extension}`
          : finalUrl.split('?')[0].split('#')[0].split('/').pop() || 'download.' + extension;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        blob = null;
        response = null;
        button?.classList.remove('vvw--pulsing');
      });

      return button;
    },

    onImageView: (vistaData: VistaData, _v: VistaView) => {
      const centerImage = vistaData.images.to
        ? vistaData.images.to[Math.floor(vistaData.images.to.length / 2)]
        : null;

      if (!centerImage) {
        currentImage = null;
        currentAlt = null;
        return;
      }

      const { parsedSrcSet, config } = centerImage;

      // get the biggest image || the current image
      currentImage =
        parsedSrcSet && parsedSrcSet.length > 0
          ? parsedSrcSet[parsedSrcSet.length - 1].src
          : config.src || null;

      currentAlt = config.alt || null;
      }
    },

    onDeactivateUi: (names: string[], _v: VistaView) => {
      if (names.includes('download') && button) {
        button.setAttribute('disabled', 'true');
      }
    },

    onReactivateUi: (names: string[], _v: VistaView) => {
      if (names.includes('download') && button) {
        button.removeAttribute('disabled');
      }
    },

    onClose: (_v: VistaView) => {
      button?.remove();
      button = null;
      currentImage = null;
      currentAlt = null;
    },
  };
}
```

## Adding the Control to UI

Specify where your control appears using the `controls` config:

```typescript
vistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download()],
});
```

Available positions:

- `topLeft`
- `topRight`
- `bottomLeft`
- `bottomRight`

## UI Extension with SVG Icons

```typescript
export function fullscreen(): VistaExtension {
  const enterIcon = `<svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>`;

  const exitIcon = `<svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
  </svg>`;

  let button: HTMLButtonElement | null = null;
  let isFullscreen = false;

  return {
    name: 'fullscreen',
    control: () => {
      button = document.createElement('button');
      button.setAttribute('aria-label', 'Toggle fullscreen');
      button.innerHTML = enterIcon;

      button.addEventListener('click', async () => {
        if (!isFullscreen) {
          await document.documentElement.requestFullscreen();
          button!.innerHTML = exitIcon;
        } else {
          await document.exitFullscreen();
          button!.innerHTML = enterIcon;
        }
        isFullscreen = !isFullscreen;
      });

      return button;
    },
    onClose: () => {
      if (isFullscreen) {
        document.exitFullscreen();
      }
      button?.remove();
      button = null;
      isFullscreen = false;
    },
  };
}
```

## Styling UI Extensions

Use CSS variables for consistent styling:

```css
.vvw-ui button[aria-label='Download'] {
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  border-radius: var(--vvw-ui-border-radius);
  padding: 8px;
  border: none;
  cursor: pointer;
}

.vvw-ui button[aria-label='Download']:hover {
  background: var(--vvw-ui-hover-bg-color);
}

.vvw-ui button[aria-label='Download']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Key Concepts

### State Management

Use closure variables to persist state:

```typescript
export function myExtension(): VistaExtension {
  let button: HTMLButtonElement | null = null;
  let currentState = 'idle';

  return {
    name: 'myExtension',
    control: () => {
      button = document.createElement('button');
      // Use button and currentState throughout lifecycle
      return button;
    },
  };
}
```

### Cleanup

Always clean up in `onClose`:

```typescript
onClose: () => {
  button?.removeEventListener('click', handleClick);
  button?.remove();
  button = null;
  currentImage = null;
};
```

### UI State

Handle disable/enable states. Your Extensions might not be known to other extensions.
If you want your extensions to have the same state as the zoomIn, zoomOut, and download extension, check for 'zoomIn', 'zoomOut', or 'download'.

For example, Video extensions disable the download button by default, so your extensions might want to listen to the download 'button' as well:

```typescript
onDeactivateUi: (names) => {
  if ((names.includes('myExtension') || names.includes('download')) && button) {
    button.setAttribute('disabled', 'true');
    button.classList.add('disabled');
  }
},
onReactivateUi: (names) => {
  if ((names.includes('myExtension') || names.includes('download')) && button) {
    button.removeAttribute('disabled');
    button.classList.remove('disabled');
  }
}
```

## Next Steps

- [Behavior Extensions](/extensions/authoring/behavior-extensions)
- [Best Practices](/extensions/authoring/best-practices)
- [Built-in Extensions](/extensions/overview)
