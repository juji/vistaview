---
title: Publishing Extensions
description: Package and publish your VistaView extensions
---

Learn how to package, document, and publish your extensions for others to use.

## Package Structure

```
my-extension/
├── package.json
├── README.md
├── tsconfig.json
├── src/
│   └── index.ts
└── dist/
    ├── index.js
    ├── index.d.ts
    └── index.css (optional)
```

## package.json Setup

```json
{
  "name": "vistaview-extension-example",
  "version": "1.0.0",
  "description": "Example extension for VistaView",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["vistaview", "vistaview-extension", "lightbox", "image-viewer"],
  "peerDependencies": {
    "vistaview": "^0.10.0"
  },
  "devDependencies": {
    "vistaview": "^0.10.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/vistaview-extension-example"
  },
  "author": "Your Name",
  "license": "MIT"
}
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Export Pattern

Export as a factory function:

````typescript
import type { VistaExtension } from 'vistaview';

export interface MyExtensionOptions {
  /** Enable feature X */
  featureX?: boolean;
  /** Callback function */
  onEvent?: (data: any) => void;
}

/**
 * My Extension for VistaView
 *
 * @param options - Configuration options
 * @returns VistaExtension instance
 *
 * @example
 * ```typescript
 * import { myExtension } from 'vistaview-extension-example';
 *
 * vistaView({
 *   elements: '#gallery a',
 *   extensions: [myExtension({ featureX: true })],
 * });
 * ```
 */
export function myExtension(options: MyExtensionOptions = {}): VistaExtension {
  const { featureX = false, onEvent } = options;

  return {
    name: 'myExtension',
    description: 'Does something useful',
    // Implementation
  };
}

// Also export types
export type { VistaExtension } from 'vistaview';
````

## README Documentation

Create comprehensive README:

```markdown
# VistaView Extension: My Extension

Brief description of what your extension does.

## Installation

\`\`\`bash
npm install vistaview-extension-example
\`\`\`

## Usage

\`\`\`typescript
import { vistaView } from 'vistaview';
import { myExtension } from 'vistaview-extension-example';
import 'vistaview/style.css';
import 'vistaview-extension-example/dist/style.css'; // If needed

vistaView({
elements: '#gallery a',
extensions: [myExtension()],
});
\`\`\`

## Options

### `featureX`

- Type: `boolean`
- Default: `false`
- Description: Enables feature X

### `onEvent`

- Type: `(data: any) => void`
- Optional
- Description: Callback when event occurs

## Examples

### Basic Usage

\`\`\`typescript
myExtension()
\`\`\`

### With Options

\`\`\`typescript
myExtension({
featureX: true,
onEvent: (data) => console.log(data),
})
\`\`\`

## CSS Customization

\`\`\`css
.vvw-my-extension {
/_ Your custom styles _/
}
\`\`\`

## License

MIT
```

## Publishing to npm

### 1. Build Your Extension

```bash
npm run build
```

### 2. Test Locally

```bash
# In your extension directory
npm link

# In your test project
npm link vistaview-extension-example
```

### 3. Publish

```bash
# First time
npm login
npm publish

# Updates
npm version patch  # or minor, major
npm publish
```

## Naming Convention

Follow this pattern:

- `vistaview-extension-[feature]` (e.g., `vistaview-extension-download`)
- `@yourscope/vistaview-[feature]` (e.g., `@acme/vistaview-share`)

## Version Management

Follow semantic versioning:

- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## CSS Distribution

If your extension includes CSS:

```typescript
// src/index.ts
export function myExtension(): VistaExtension {
  // Implementation
}

// Remind users to import CSS
export const CSS_REQUIRED = true;
```

```css
/* src/style.css */
.vvw-my-extension {
  /* Styles */
}
```

Build CSS separately or include instructions:

```markdown
## Installation

\`\`\`bash
npm install vistaview-extension-example
\`\`\`

Import the CSS:

\`\`\`typescript
import 'vistaview-extension-example/dist/style.css';
\`\`\`
```

## Testing

Provide test examples:

```typescript
// tests/extension.test.ts
import { myExtension } from '../src';

describe('myExtension', () => {
  it('should create extension with default options', () => {
    const ext = myExtension();
    expect(ext.name).toBe('myExtension');
  });

  it('should accept custom options', () => {
    const ext = myExtension({ featureX: true });
    // Test implementation
  });
});
```

## Examples Directory

Include working examples:

```
examples/
├── basic/
│   ├── index.html
│   └── main.ts
├── with-options/
│   ├── index.html
│   └── main.ts
└── advanced/
    ├── index.html
    └── main.ts
```

## Documentation Website

Consider creating a demo site:

```typescript
// docs/demo.ts
import { vistaView } from 'vistaview';
import { myExtension } from 'vistaview-extension-example';

vistaView({
  elements: '#demo a',
  extensions: [
    myExtension({
      featureX: true,
      onEvent: (data) => {
        document.getElementById('log')!.textContent = JSON.stringify(data, null, 2);
      },
    }),
  ],
});
```

## GitHub Repository

Include these files:

- **README.md** - Main documentation
- **LICENSE** - License file (MIT recommended)
- **CHANGELOG.md** - Version history
- **.gitignore** - Ignore node_modules, dist
- **examples/** - Working examples
- **.github/workflows/** - CI/CD (optional)

## Bundle Optimization

For smaller bundles:

```json
{
  "peerDependencies": {
    "vistaview": "^0.10.0"
  },
  "peerDependenciesMeta": {
    "vistaview": {
      "optional": false
    }
  }
}
```

Don't bundle VistaView - users already have it.

## TypeScript Declarations

Ensure proper type exports:

```typescript
// Export main function
export function myExtension(options?: MyExtensionOptions): VistaExtension;

// Export option types
export interface MyExtensionOptions {
  featureX?: boolean;
}

// Re-export useful VistaView types
export type { VistaExtension, VistaData, VistaView } from 'vistaview';
```

## License

Most extensions use MIT:

```
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

## Marketing

- Add `vistaview-extension` tag on npm
- Create demo on CodeSandbox/StackBlitz
- Share on social media
- List in VistaView discussions

## Maintenance

- Keep VistaView peer dependency updated
- Respond to issues promptly
- Accept pull requests
- Update documentation
- Publish security fixes quickly

## Next Steps

- [Extension Examples](https://github.com/juji/vistaview/tree/main/src/lib/extensions)
- [Best Practices](/extensions/authoring/best-practices)
- [VistaView GitHub](https://github.com/juji/vistaview)
