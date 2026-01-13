import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const integrationDocs = docs
    .filter((d) => d.id.startsWith('integrations/'))
    .sort((a, b) => a.id.localeCompare(b.id));

  let content = `# VistaView - Framework Integrations

> Generated: ${new Date().toISOString()}
> Section: Framework Integrations (React, Vue, Svelte, Solid, Vanilla)
> Full index: https://vistaview.jujiplay.com/llms.txt

This file contains integration guides for using VistaView with various JavaScript frameworks.

`;

  for (const doc of integrationDocs) {
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
