import { defineMiddleware } from 'astro:middleware';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

function extractContent(html: string): string {
  const cleaned = html.replace(/<style[\s\S]*?<\/style>/g, '');
  const dom = new JSDOM(cleaned);
  const doc = dom.window.document;

  const el =
    doc.querySelector('.sl-markdown-content') ??
    doc.querySelector('article') ??
    doc.querySelector('main') ??
    doc.body;

  for (const s of el.querySelectorAll('script')) s.remove();
  return el.innerHTML;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const accept = context.request.headers.get('accept') ?? '';
  if (!accept.includes('text/markdown')) {
    return next();
  }

  const response = await next();
  const ct = response.headers.get('content-type') ?? '';
  if (!ct.includes('text/html')) {
    return response;
  }

  const html = await response.text();
  const bodyHtml = extractContent(html);
  const markdown = turndown.turndown(bodyHtml);

  return new Response(markdown, {
    status: response.status,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
    },
  });
});
