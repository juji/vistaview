const TOOLS = [
  {
    name: 'get_package_info',
    description: 'Get npm package info for vistaview or any npm package',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Package name', default: 'vistaview' },
      },
    },
  },
  {
    name: 'get_build_status',
    description: 'Get latest GitHub Actions build status for the vistaview repo',
    inputSchema: {
      type: 'object',
      properties: {
        branch: { type: 'string', description: 'Branch (main/dev)', default: 'dev' },
      },
    },
  },
  {
    name: 'search_docs',
    description: 'Search VistaView documentation',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
  },
] as const;

async function getPackageInfo(name: string) {
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
  if (!res.ok) return { error: `npm registry returned ${res.status}` };
  const data = await res.json();
  return {
    name: data.name,
    version: data['dist-tags']?.latest,
    description: data.description,
    keywords: data.keywords,
    license: data.license,
    homepage: data.homepage,
    repository: data.repository?.url,
    modified: data.time?.modified,
  };
}

async function getBuildStatus(branch: string) {
  const res = await fetch(
    `https://api.github.com/repos/juji/vistaview/actions/runs?branch=${encodeURIComponent(branch)}&per_page=3&status=completed`,
    { headers: { 'User-Agent': 'vistaview-mcp' } },
  );
  if (!res.ok) return { error: `GitHub API returned ${res.status}` };
  const data: any = await res.json();
  return (data.workflow_runs ?? []).map((r: any) => ({
    workflow: r.name,
    branch: r.head_branch,
    commit: r.head_commit?.message?.split('\n')[0],
    conclusion: r.conclusion,
    created: r.created_at,
    url: r.html_url,
  }));
}

async function searchDocs(query: string, origin: string) {
  const res = await fetch(`${origin}/llms-full.txt`);
  if (!res.ok) return { error: 'Docs not available' };
  const text = await res.text();
  const lines = text.split('\n');
  const results: { title: string; excerpt: string }[] = [];
  const q = query.toLowerCase();

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(q)) {
      const title = lines.slice(Math.max(0, i - 5), i).find((l) => l.startsWith('# '))?.slice(2) ?? 'unknown';
      const excerpt = lines.slice(Math.max(0, i - 2), i + 3).join(' ').slice(0, 200);
      if (!results.some((r) => r.title === title)) {
        results.push({ title, excerpt });
      }
      if (results.length >= 10) break;
    }
  }
  return results;
}

function jsonRpc(id: string | number | null, result?: unknown, error?: { code: number; message: string }) {
  const body: Record<string, unknown> = { jsonrpc: '2.0', id };
  if (error) body.error = error;
  else body.result = result;
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
  });
}

export async function onRequest(context: { request: Request }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' },
    });
  }

  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return jsonRpc(null, undefined, { code: -32700, message: 'Parse error' });
  }

  if (body.jsonrpc !== '2.0' || !body.method) {
    return jsonRpc(body.id ?? null, undefined, { code: -32600, message: 'Invalid request' });
  }

  const { id, method, params } = body;

  if (method === 'initialize') {
    return jsonRpc(id, {
      protocolVersion: '2025-03-26',
      capabilities: { tools: {} },
      serverInfo: { name: 'vistaview-docs', version: '1.0.0' },
    });
  }

  if (method === 'tools/list') {
    return jsonRpc(id, { tools: TOOLS });
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params ?? {};
    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) {
      return jsonRpc(id, undefined, { code: -32602, message: `Unknown tool: ${name}` });
    }

    let result: unknown;
    const origin = new URL(context.request.url).origin;

    if (name === 'get_package_info') {
      result = await getPackageInfo(args?.name ?? 'vistaview');
    } else if (name === 'get_build_status') {
      result = await getBuildStatus(args?.branch ?? 'dev');
    } else if (name === 'search_docs') {
      if (!args?.query) return jsonRpc(id, undefined, { code: -32602, message: 'Missing query' });
      result = await searchDocs(args.query, origin);
    }

    return jsonRpc(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
  }

  return jsonRpc(id, undefined, { code: -32601, message: `Method not found: ${method}` });
}
