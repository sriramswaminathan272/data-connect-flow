/**
 * HTTP client for the Clarity MCP Server (Dynamo V2 backend).
 * Wraps JSON-RPC calls over HTTP/SSE. Falls back silently so Artisan
 * degrades to mock data when Clarity is not reachable.
 *
 * Clarity endpoint pattern:
 *   POST http://<host>:<port>/<mcp-name>/mcp
 *   Headers: Content-Type: application/json, Accept: application/json, text/event-stream
 *   Body: JSON-RPC 2.0 payload
 */

const CLARITY_BASE_URL =
  (import.meta.env.VITE_CLARITY_BACKEND_URL as string | undefined) ?? 'http://localhost:8081';

const CLARITY_API_KEY =
  (import.meta.env.VITE_CLARITY_API_KEY as string | undefined) ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MCPContent {
  type: 'text' | 'image' | 'resource';
  text: string;
}

export interface MCPToolResult {
  content: MCPContent[];
  isError?: boolean;
}

export interface MCPToolMeta {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

// ─── SSE Response Parser ───────────────────────────────────────────────────────

function parseSSEBody(raw: string): MCPToolResult {
  // SSE lines: "data: <json>\n\n"
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    try {
      const payload = JSON.parse(line.slice(6));
      if (payload?.result) return payload.result as MCPToolResult;
      if (payload?.error) throw new Error(payload.error.message ?? 'MCP error');
    } catch (e) {
      if (e instanceof Error && e.message !== 'Unexpected token') throw e;
    }
  }
  // Some Clarity tools return plain JSON (non-SSE path)
  try {
    const payload = JSON.parse(raw);
    if (payload?.result) return payload.result as MCPToolResult;
  } catch { /* fall through */ }
  throw new Error('No valid JSON-RPC result in Clarity response');
}

// ─── Core request ──────────────────────────────────────────────────────────────

async function clarityRequest(
  mcp: string,
  method: 'tools/list' | 'tools/call',
  params: Record<string, unknown> = {},
  opts: { timeoutMs?: number } = {}
): Promise<MCPToolResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    if (CLARITY_API_KEY) headers['X-API-Key'] = CLARITY_API_KEY;

    const res = await fetch(`${CLARITY_BASE_URL}/${mcp}/mcp`, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    });

    if (!res.ok) {
      console.warn(`[clarity] ${mcp} returned ${res.status}`);
      return null;
    }

    const text = await res.text();
    return parseSSEBody(text);
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.warn(`[clarity] ${mcp}/${method} failed:`, (err as Error).message);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Call a specific tool on a Clarity MCP server.
 * Returns null if Clarity is unreachable — callers should fall back to mocks.
 */
export async function callTool(
  mcp: string,
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<MCPToolResult | null> {
  return clarityRequest(mcp, 'tools/call', { name: toolName, arguments: args });
}

/**
 * List all tools registered on a Clarity MCP server.
 */
export async function listTools(mcp: string): Promise<MCPToolMeta[]> {
  const result = await clarityRequest(mcp, 'tools/list', {}, { timeoutMs: 3000 });
  if (!result?.content?.[0]?.text) return [];
  try {
    const parsed = JSON.parse(result.content[0].text);
    return Array.isArray(parsed?.tools) ? parsed.tools : [];
  } catch {
    return [];
  }
}

/**
 * Convenience: extract the first text content from a tool result, parsed as JSON.
 * Returns null if the result is missing or unparseable.
 */
export function parseToolJSON<T>(result: MCPToolResult | null): T | null {
  const text = result?.content?.[0]?.text;
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Convenience: extract first text content as a raw string.
 */
export function parseToolText(result: MCPToolResult | null): string | null {
  return result?.content?.[0]?.text ?? null;
}

/**
 * Health-check: returns true if the Clarity server is reachable.
 * Fast timeout (2 s) — used to decide mock vs. live mode.
 */
export async function isClarityReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${CLARITY_BASE_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
