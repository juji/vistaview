import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function buildDocContent(docs: any[]) {
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

    if (doc.body) {
      content += doc.body + '\n';
    }
  }

  return content;
}

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');

  const categories = {
    core: docs.filter((d) => d.id.startsWith('core/')),
    integrations: docs.filter((d) => d.id.startsWith('integrations/')),
    extensions: docs.filter((d) => d.id.startsWith('extensions/')),
    styling: docs.filter((d) => d.id.startsWith('styling/')),
    'api-reference': docs.filter((d) => d.id.startsWith('api-reference/')),
    index: docs.filter((d) => d.id === 'index'),
  };

  let content = `# VistaView v2 Documentation - Full

> Generated: ${new Date().toISOString()}
> This file contains the complete VistaView documentation in a single document.
> Website: https://vistaview.jujiplay.com
> GitHub: https://github.com/juji/vistaview
> npm: https://www.npmjs.com/package/vistaview

## About VistaView

VistaView is a lightweight, modern image lightbox library for the web. Zero dependencies, and highly customizable.

## Table of Contents

1. [Index](#index)
2. [Core](#core)
3. [Framework Integrations](#framework-integrations)
4. [Extensions](#extensions)
5. [Styling & Theming](#styling--theming)
6. [API Reference](#api-reference)

---

## Index

`;

  content += buildDocContent(categories.index);

  content += `\n\n---\n\n## Core\n\n`;
  content += buildDocContent(categories.core);

  content += `\n\n---\n\n## Framework Integrations\n\n`;
  content += buildDocContent(categories.integrations);

  content += `\n\n---\n\n## Extensions\n\n`;
  content += buildDocContent(categories.extensions);

  content += `\n\n---\n\n## Styling & Theming\n\n`;
  content += buildDocContent(categories.styling);

  content += `\n\n---\n\n## API Reference\n\n`;
  content += buildDocContent(categories['api-reference']);

  const aiDocs = docs.filter((d) => d.id.startsWith('ai-'));
  content += `\n\n---\n\n## AI Integration\n\n`;
  content += buildDocContent(aiDocs);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
