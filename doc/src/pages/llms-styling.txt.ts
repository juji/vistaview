import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const stylingDocs = docs
    .filter((d) => d.id.startsWith('styling/'))
    .sort((a, b) => a.id.localeCompare(b.id));

  let content = `# VistaView - Styling & Theming

> Generated: ${new Date().toISOString()}
> Section: CSS Variables, Themes, and Custom Styling
> Full index: https://vistaview.jujiplay.com/llms.txt

This file contains documentation for styling VistaView including CSS variables, pre-built themes, and custom styling guides.

`;

  for (const doc of stylingDocs) {
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
