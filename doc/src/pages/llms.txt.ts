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
  let content = `# VistaView v2 Documentation - Index

> Generated: ${new Date().toISOString()}
> This file contains the VistaView documentation index with links to categorized sections.
> Website: https://vistaview.jujiplay.com
> GitHub: https://github.com/juji/vistaview
> npm: https://www.npmjs.com/package/vistaview

## About VistaView

VistaView is a lightweight, modern image lightbox library for the web. Zero dependencies, and highly customizable.

## Documentation Sections

For AI consumption, the documentation is split into manageable sections:

- **[llms-core.txt](./llms-core.txt)** - Core installation and configuration (${categories.core.length} docs)
- **[llms-integrations.txt](./llms-integrations.txt)** - Framework integrations: React, Vue, Svelte, Solid, Vanilla JS (${categories.integrations.length} docs)
- **[llms-extensions.txt](./llms-extensions.txt)** - Extensions for videos, maps, and more (${categories.extensions.length} docs)
- **[llms-styling.txt](./llms-styling.txt)** - CSS theming and customization (${categories.styling.length} docs)
- **[llms-api.txt](./llms-api.txt)** - Complete API reference and types (${categories['api-reference'].length} docs)
- **[AI Integration](./ai-integration)** - MCP Server, Markdown for Agents, LLMs.txt setup

## AI Integration

VistaView provides agent-ready documentation:

- **MCP Server**: JSON-RPC endpoint at \`POST /api/mcp\` with tools: \`get_package_info\`, \`get_build_status\`, \`search_docs\`
- **Markdown for Agents**: Set \`Accept: text/markdown\` on any doc URL for clean Markdown
- **LLMs.txt**: This index plus categorized full-text files below
- **Setup guides**: [AI Integration page](./ai-integration) includes Claude Desktop config

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
  elements: '#gallery > a',
});
\`\`\`

---

For complete documentation, visit https://vistaview.jujiplay.com or read the individual llms-*.txt files.
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
