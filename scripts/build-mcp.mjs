#!/usr/bin/env node
// Bundla o servidor MCP (mcp/server.mjs) num único arquivo self-contained
// (mcp/timds-mcp.mjs) com @modelcontextprotocol/sdk e zod embutidos. Assim o
// consumidor roda o servidor só com Node, sem instalar essas dependências —
// timds permanece uma lib de UI sem deps de runtime extras.
//
// O manifesto (ai/manifest.json) NÃO é embutido: continua sendo lido em runtime
// para poder ser regenerado sem rebundlar.

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
  // Mantém os builtins do Node externos (são resolvidos pelo runtime).
  external: ['node:*'],
  legalComments: 'none',
  logLevel: 'warning',
})

chmodSync(outfile, 0o755)
console.log('[mcp] bundle self-contained → mcp/timds-mcp.mjs')
