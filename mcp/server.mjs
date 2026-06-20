// Servidor MCP do timds (FONTE). É bundlado por scripts/build-mcp.mjs em
// mcp/timds-mcp.mjs (self-contained, com o shebang adicionado pelo esbuild).
// Para rodar a fonte em dev: `npm run mcp`.
// Expõe o design system (componentes, props/variantes,
// tokens e exemplos de página) como ferramentas para agentes de código (Claude
// Code, Cursor, etc.), evitando props/imports alucinados.
//
// Fonte de dados: ai/manifest.json (gerado por scripts/generate-ai-docs.mjs).
// Transporte: stdio. Uso: `node mcp/timds-mcp.mjs` ou via `claude mcp add`.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manifestPath =
  process.env.TIMDS_MANIFEST || join(__dirname, '..', 'ai', 'manifest.json')

let manifest
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
} catch (err) {
  console.error(
    `[timds-mcp] não foi possível ler o manifesto em ${manifestPath}. ` +
      `Rode \`npm run ai:docs\` na lib timds. (${err.message})`,
  )
  process.exit(1)
}

const text = (s) => ({ content: [{ type: 'text', text: s }] })
const norm = (s) => s.toLowerCase().replace(/[\s_-]/g, '')

function findComponent(query) {
  const q = norm(query)
  return (
    manifest.components.find((c) => norm(c.name) === q || norm(c.module) === q) ||
    manifest.components.find((c) => c.exports.some((e) => norm(e) === q)) ||
    manifest.components.find(
      (c) => norm(c.name).includes(q) || norm(c.module).includes(q),
    )
  )
}

function formatComponent(c) {
  let out = `# ${c.name} (${c.status}) — categoria: ${c.category}\n\n`
  if (c.description) out += `${c.description}\n\n`
  out += `## Import\n\`\`\`tsx\n${c.importStatement}\n\`\`\`\n\n`
  out += `## Exports\n${c.exports.map((e) => `- \`${e}\``).join('\n')}\n`
  if (c.typeExports?.length) {
    out += `${c.typeExports.map((e) => `- \`${e}\` (type)`).join('\n')}\n`
  }
  out += '\n'
  const vk = Object.keys(c.variants || {})
  if (vk.length) {
    out += `## Variants\n`
    for (const k of vk) {
      out += `- \`${k}\`: ${c.variants[k].map((v) => `\`${v}\``).join(', ')}\n`
    }
    out += '\n'
  }
  const props = (c.props || []).filter((p) => p.description)
  if (props.length) {
    out += `## Props\n`
    for (const p of props) {
      const def = p.default ? ` _(default: \`${p.default}\`)_` : ''
      out += `- \`${p.name}\`${def} — ${p.description}\n`
    }
    out += '\n'
  }
  if (c.example) out += `## Example\n\`\`\`tsx\n${c.example}\n\`\`\`\n`
  return out
}

const server = new McpServer({ name: 'timds', version: manifest.version || '0.0.0' })

server.registerTool(
  'list_components',
  {
    title: 'List timds components',
    description:
      'Lista todos os componentes do design system timds, agrupados por categoria, ' +
      'com a descrição curta e os símbolos exportados. Use para descobrir o que existe ' +
      'antes de montar uma tela.',
    inputSchema: {
      category: z
        .string()
        .optional()
        .describe('Filtra por categoria (ex.: "Data Display", "Layout").'),
    },
  },
  async ({ category }) => {
    let list = manifest.components
    if (category) {
      const q = norm(category)
      list = list.filter((c) => norm(c.category) === q || norm(c.category).includes(q))
    }
    const byCat = {}
    for (const c of list) {
      byCat[c.category] = byCat[c.category] || []
      byCat[c.category].push(c)
    }
    let out = `# timds — ${list.length} componentes\n\nCategorias: ${manifest.categories.join(', ')}\n\n`
    for (const cat of Object.keys(byCat).sort()) {
      out += `## ${cat}\n`
      for (const c of byCat[cat]) {
        const d = c.description
          ? ` — ${c.description.split('. ')[0].replace(/\.$/, '')}`
          : ''
        out += `- **${c.name}** (\`${c.exports.join(', ')}\`)${d}\n`
      }
      out += '\n'
    }
    return text(out)
  },
)

server.registerTool(
  'get_component',
  {
    title: 'Get a timds component',
    description:
      'Detalhes completos de um componente timds: import, exports, variantes, props ' +
      'documentadas e um exemplo de código. Aceita o nome do componente ou de qualquer ' +
      'export (ex.: "Button", "card", "AvatarFallback").',
    inputSchema: {
      name: z.string().describe('Nome do componente ou de um export.'),
    },
  },
  async ({ name }) => {
    const c = findComponent(name)
    if (!c) {
      return text(
        `Componente "${name}" não encontrado. Use \`list_components\` para ver os disponíveis.`,
      )
    }
    return text(formatComponent(c))
  },
)

server.registerTool(
  'search_components',
  {
    title: 'Search timds components',
    description:
      'Busca componentes por palavra-chave no nome, descrição, categoria e exports. ' +
      'Use quando não souber o nome exato (ex.: "modal", "dropdown", "gráfico").',
    inputSchema: {
      query: z.string().describe('Termo de busca.'),
    },
  },
  async ({ query }) => {
    const q = norm(query)
    const hits = manifest.components.filter((c) => {
      const hay = norm(
        [c.name, c.module, c.category, c.description || '', c.exports.join(' ')].join(
          ' ',
        ),
      )
      return hay.includes(q)
    })
    if (!hits.length) return text(`Nenhum componente encontrado para "${query}".`)
    let out = `# Resultados para "${query}" (${hits.length})\n\n`
    for (const c of hits) {
      const d = c.description
        ? ` — ${c.description.split('. ')[0].replace(/\.$/, '')}`
        : ''
      out += `- **${c.name}** (\`${c.exports.join(', ')}\`)${d}\n`
    }
    return text(out)
  },
)

server.registerTool(
  'get_tokens',
  {
    title: 'Get timds design tokens',
    description:
      'Tokens de design do timds: utilitários de cor semânticos (resolvem light/dark ' +
      'automaticamente), radius e fonte, mais as regras de uso. Use para estilizar sem ' +
      'cores cruas.',
    inputSchema: {},
  },
  async () => {
    const t = manifest.tokens
    let out = `# timds design tokens\n\nRadius: \`${t.radius}\` · Font: \`${t.fontSans}\`\n\n`
    out += `## Regras\n${manifest.setup.rules.map((r) => `- ${r}`).join('\n')}\n\n`
    out += `## Cores (use como \`bg-*\`, \`text-*\`, \`border-*\`)\n`
    out += `| token | light | dark |\n|---|---|---|\n`
    for (const c of t.colors)
      out += `| \`${c.name}\` | ${c.light ?? '—'} | ${c.dark ?? '—'} |\n`
    return text(out)
  },
)

server.registerTool(
  'get_setup',
  {
    title: 'Get timds setup instructions',
    description:
      'Como instalar o timds, importar os estilos e ativar o dark mode num projeto novo. ' +
      'Chame isto primeiro ao iniciar um projeto do zero com o timds.',
    inputSchema: {},
  },
  async () => {
    const s = manifest.setup
    let out = `# Setup do timds\n\n`
    out += `1. Instale:\n\`\`\`bash\n${s.install}\n\`\`\`\n`
    out += `2. Importe os estilos no entrypoint (JS, ex.: main.tsx):\n\`\`\`tsx\n${s.importStyles}\n\`\`\`\n`
    out += `3. Importe componentes:\n\`\`\`tsx\n${s.importComponents}\n\`\`\`\n`
    if (s.font) out += `   - Fonte: ${s.font}\n`
    if (s.charts) out += `   - Gráficos: ${s.charts}\n`
    if (s.tailwindBridge) {
      out += `4. (Tailwind v4 no app) Para usar utilitários de token na sua marcação, adicione ao seu CSS global:\n\`\`\`css\n${s.tailwindBridge}\n\`\`\`\n`
    }
    out += `5. Dark mode: ${s.darkMode}\n\n`
    out += `## Regras\n${s.rules.map((r) => `- ${r}`).join('\n')}\n`
    return text(out)
  },
)

server.registerTool(
  'list_examples',
  {
    title: 'List timds page examples',
    description:
      'Lista as composições de página completas do timds (login, dashboard, settings, ' +
      'etc.) que servem de receita. Use get_example para o código de uma delas.',
    inputSchema: {},
  },
  async () => {
    let out = `# Exemplos de página timds\n\n`
    for (const e of manifest.examples) {
      out += `- **${e.id}** (${e.name})${e.description ? ` — ${e.description}` : ''}\n`
    }
    return text(out)
  },
)

server.registerTool(
  'get_example',
  {
    title: 'Get a timds page example',
    description:
      'Retorna o código-fonte completo de uma composição de página timds (ex.: ' +
      '"dashboard", "login"), pronta para adaptar. Use list_examples para ver os ids.',
    inputSchema: {
      id: z.string().describe('Id do exemplo (ex.: "dashboard").'),
    },
  },
  async ({ id }) => {
    const q = norm(id)
    const e =
      manifest.examples.find((x) => norm(x.id) === q || norm(x.name) === q) ||
      manifest.examples.find((x) => norm(x.id).includes(q))
    if (!e) {
      return text(
        `Exemplo "${id}" não encontrado. Use \`list_examples\` para ver os ids.`,
      )
    }
    let out = `# Exemplo: ${e.name}\n\n`
    if (e.description) out += `${e.description}\n\n`
    out += `> Importe os componentes de \`timds\` (no exemplo eles vêm de \`@/components/ui/*\` por ser interno à lib).\n\n`
    out += `\`\`\`tsx\n${e.source}\n\`\`\`\n`
    return text(out)
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
console.error('[timds-mcp] servidor pronto (stdio).')
