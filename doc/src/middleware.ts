import { defineMiddleware } from 'astro:middleware';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndown.remove('script');
turndown.remove('style');

function extractContent(html: string): string {
  const idx = html.indexOf('class="sl-markdown-content"');
  if (idx === -1) return html;

  const tagEnd = html.indexOf('>', idx) + 1;
  let depth = 1;
  let i = tagEnd;

  while (i < html.length && depth) {
    if (html[i] === '<' && html[i + 1] === '/' && html[i + 2] === 'd' && html[i + 3] === 'i' && html[i + 4] === 'v' && html[i + 5] === '>') {
      depth--;
      i += 6;
    } else if (html[i] === '<' && html[i + 1] === 'd' && html[i + 2] === 'i' && html[i + 3] === 'v' && (html[i + 4] === '>' || html[i + 4] === ' ')) {
      depth++;
      i += 5;
    } else {
      i++;
    }
  }

  return html.slice(tagEnd, i - 6);
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
