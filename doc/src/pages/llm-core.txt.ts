import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const coreDocs = docs
    .filter((d) => d.id.startsWith('core/') || d.id === 'index')
    .sort((a, b) => a.id.localeCompare(b.id));

  let content = `# VistaView - Core Documentation

> Generated: ${new Date().toISOString()}
> Section: Core Installation & Configuration
> Full index: https://vistaview.jujiplay.com/llm.txt

This file contains core VistaView documentation including installation, configuration options, and basic setup.

`;

  for (const doc of coreDocs) {
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

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
