#!/usr/bin/env node
// Bundles the MCP server (mcp/server.mjs) into a single self-contained file
// (mcp/timds-mcp.mjs) with @modelcontextprotocol/sdk and zod embedded. This way the
// consumer runs the server with only Node, without installing those dependencies —
// timds remains a UI lib with no extra runtime deps.
//
// The manifest (ai/manifest.json) is NOT embedded: it is still read at runtime
// so it can be regenerated without rebundling.

import { chmodSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outfile = join(root, 'mcp/timds-mcp.mjs')

await build({
  entryPoints: [join(root, 'mcp/server.mjs')],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  banner: { js: '#!/usr/bin/env node' },
  // Keep Node builtins external (they are resolved by the runtime).
  external: ['node:*'],
  legalComments: 'none',
  logLevel: 'warning',
})

chmodSync(outfile, 0o755)
console.log('[mcp] bundle self-contained → mcp/timds-mcp.mjs')
