import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const apiDocs = docs
    .filter((d) => d.id.startsWith('api-reference/'))
    .sort((a, b) => a.id.localeCompare(b.id));

  let content = `# VistaView - API Reference

> Generated: ${new Date().toISOString()}
> Section: Complete API Reference, Classes, Types, Events
> Full index: https://vistaview.jujiplay.com/llm.txt

This file contains the complete API reference for VistaView including all classes, types, events, and lifecycle functions.

`;

  for (const doc of apiDocs) {
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
