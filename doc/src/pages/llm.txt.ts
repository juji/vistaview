import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Helper function to build doc content
function buildDocContent(docs: any[], category: string) {
  let content = '';

  for (const doc of docs) {
    const title = doc.data.title || doc.id;
    const description = doc.data.description || '';

    content += `\n---\n\n`;
    content += `# ${title}\n\n`;

    if (description) {
      content += `${description}\n\n`;
    }

    content += `Path: /${doc.id}\n\n`;

    // Add the raw markdown body
    if (doc.body) {
      content += doc.body + '\n';
    }
  }

  return content;
}

export const GET: APIRoute = async () => {
  // Get all documentation entries
  const docs = await getCollection('docs');

  // Categorize docs
  const categories = {
    core: docs.filter((d) => d.id.startsWith('core/')),
    integrations: docs.filter((d) => d.id.startsWith('integrations/')),
    extensions: docs.filter((d) => d.id.startsWith('extensions/')),
    styling: docs.filter((d) => d.id.startsWith('styling/')),
    'api-reference': docs.filter((d) => d.id.startsWith('api-reference/')),
    index: docs.filter((d) => d.id === 'index'),
  };

  // Build index file with links
  let content = `# VistaView Documentation - Index

> Generated: ${new Date().toISOString()}
> This file contains the VistaView documentation index with links to categorized sections.
> Website: https://vistaview.jujiplay.com
> GitHub: https://github.com/juji/vistaview
> npm: https://www.npmjs.com/package/vistaview

## About VistaView

VistaView is a lightweight, modern image lightbox library for the web. Zero dependencies, and highly customizable.

## Documentation Sections

For AI consumption, the documentation is split into manageable sections:

- **[llm-core.txt](./llm-core.txt)** - Core installation and configuration (${categories.core.length} docs)
- **[llm-integrations.txt](./llm-integrations.txt)** - Framework integrations: React, Vue, Svelte, Solid (${categories.integrations.length} docs)
- **[llm-extensions.txt](./llm-extensions.txt)** - Extensions for videos, maps, and more (${categories.extensions.length} docs)
- **[llm-styling.txt](./llm-styling.txt)** - CSS theming and customization (${categories.styling.length} docs)
- **[llm-api.txt](./llm-api.txt)** - Complete API reference and types (${categories['api-reference'].length} docs)

## Quick Stats

- Total documentation pages: ${docs.length}
- Extensions available: ${categories.extensions.length}
- Framework integrations: ${categories.integrations.length}

## Installation

\`\`\`bash
npm install vistaview
\`\`\`

## Quick Start

\`\`\`javascript
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
});
\`\`\`

---

For complete documentation, visit https://vistaview.jujiplay.com or read the individual llm-*.txt files.
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
