import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const extensionDocs = docs
    .filter((d) => d.id.startsWith('extensions/'))
    .sort((a, b) => a.id.localeCompare(b.id));

  let content = `# VistaView - Extensions

> Generated: ${new Date().toISOString()}
> Section: Extensions (Video, Maps, and Custom Extensions)
> Full index: https://vistaview.jujiplay.com/llm.txt

This file contains documentation for all VistaView extensions including video players, map integrations, and guides for creating custom extensions.

`;

  for (const doc of extensionDocs) {
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
