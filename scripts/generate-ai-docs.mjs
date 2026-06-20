#!/usr/bin/env node
// Gera os artefatos de IA do timds a partir das fontes do repositório:
//   - ai/manifest.json   → dados estruturados consumidos pelo servidor MCP
//   - ai/llms.txt        → índice compacto (padrão llms.txt)
//   - ai/llms-full.txt   → documento único com todos os componentes, tokens e exemplos
//
// Fontes: src/index.ts (API pública), src/components/ui/*.{tsx,stories.tsx,mdx}
// (variantes via cva, props via argTypes, prosa + exemplo via MDX), src/styles.css
// (tokens) e src/design-system/examples/*.stories.tsx (composições de página).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const uiDir = join(root, 'src/components/ui')
const examplesDir = join(root, 'src/design-system/examples')
const outDir = join(root, 'ai')

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)

/* -------------------------------------------------------------------------- */
/*  Helpers de parsing (sensíveis a chaves/aspas, sem AST)                      */
/* -------------------------------------------------------------------------- */

// Retorna o conteúdo entre `{` e o `}` correspondente, começando no índice da
// abertura. Respeita strings e chaves aninhadas.
function balanced(str, openIdx, open = '{', close = '}') {
  let depth = 0
  let quote = null
  for (let i = openIdx; i < str.length; i++) {
    const c = str[i]
    const prev = str[i - 1]
    if (quote) {
      if (c === quote && prev !== '\\') quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c
      continue
    }
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return str.slice(openIdx + 1, i)
    }
  }
  return ''
}

// Acha `label: {` (ou `label: [`) e devolve o conteúdo balanceado do valor.
function objectAfter(str, label, open = '{', close = '}') {
  const re = new RegExp(`${label}\\s*:\\s*\\${open}`)
  const m = re.exec(str)
  if (!m) return null
  return balanced(str, m.index + m[0].length - 1, open, close)
}

// Divide o conteúdo de um objeto em entradas de topo `chave: valor`, respeitando
// aninhamento e strings. Devolve [{ key, value }].
function topLevelEntries(content) {
  const entries = []
  let depth = 0
  let quote = null
  let start = 0
  const parts = []
  for (let i = 0; i < content.length; i++) {
    const c = content[i]
    const prev = content[i - 1]
    if (quote) {
      if (c === quote && prev !== '\\') quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') quote = c
    else if (c === '{' || c === '[' || c === '(') depth++
    else if (c === '}' || c === ']' || c === ')') depth--
    else if (c === ',' && depth === 0) {
      parts.push(content.slice(start, i))
      start = i + 1
    }
  }
  parts.push(content.slice(start))
  for (const part of parts) {
    const m = /^\s*([A-Za-z_$][\w$]*)\s*:/.exec(part)
    if (!m) continue
    entries.push({ key: m[1], value: part.slice(m.index + m[0].length).trim() })
  }
  return entries
}

// Extrai um array de strings literais (['a', 'b']) de um trecho.
function parseStringArray(arrText) {
  if (!arrText) return []
  return [...arrText.matchAll(/['"`]([^'"`]+)['"`]/g)].map((m) => m[1])
}

/* -------------------------------------------------------------------------- */
/*  1. API pública: módulo → exports                                           */
/* -------------------------------------------------------------------------- */

function parsePublicApi() {
  const src = read(join(root, 'src/index.ts')) || ''
  const map = {} // moduleName -> { values: [], types: [] }
  const re = /export\s*\{([\s\S]*?)\}\s*from\s*'@\/(?:components\/ui|lib)\/([\w-]+)'/g
  for (let m = re.exec(src); m; m = re.exec(src)) {
    const body = m[1]
    const mod = m[2]
    const entry = map[mod] || { values: [], types: [] }
    for (let raw of body.split(',')) {
      raw = raw.trim()
      if (!raw) continue
      const isType = raw.startsWith('type ')
      let name = raw.replace(/^type\s+/, '')
      // `X as Y` → exporta como Y
      const asM = /\bas\s+([\w$]+)$/.exec(name)
      if (asM) name = asM[1]
      else name = name.split(/\s+/)[0]
      if (!name) continue
      ;(isType ? entry.types : entry.values).push(name)
    }
    map[mod] = entry
  }
  return map
}

/* -------------------------------------------------------------------------- */
/*  2. Variantes (cva) a partir do .tsx                                         */
/* -------------------------------------------------------------------------- */

function parseCvaVariants(tsx) {
  if (!tsx) return {}
  const out = {}
  // pode haver mais de um cva por arquivo; concatenamos os grupos
  const re = /cva\s*\(/g
  for (let m = re.exec(tsx); m; m = re.exec(tsx)) {
    const callBody = balanced(tsx, m.index + m[0].length - 1, '(', ')')
    const variants = objectAfter(callBody, 'variants')
    if (!variants) continue
    for (const group of topLevelEntries(variants)) {
      if (!group.value.startsWith('{')) continue
      const inner = balanced(group.value, 0)
      const opts = topLevelEntries(inner).map((e) => e.key)
      if (opts.length) out[group.key] = [...new Set([...(out[group.key] || []), ...opts])]
    }
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*  3. Stories: categoria, descrição, argTypes                                  */
/* -------------------------------------------------------------------------- */

function parseStories(stories) {
  const result = { category: null, title: null, description: null, argTypes: [] }
  if (!stories) return result
  const titleM = /title:\s*['"`]([^'"`]+)['"`]/.exec(stories)
  if (titleM) {
    result.title = titleM[1]
    result.category = titleM[1].includes('/') ? titleM[1].split('/')[0] : null
  }
  const argTypesBody = objectAfter(stories, 'argTypes')
  if (argTypesBody) {
    for (const arg of topLevelEntries(argTypesBody)) {
      if (!arg.value.startsWith('{')) continue
      const inner = balanced(arg.value, 0)
      const descM = /description:\s*['"`]([^'"`]*)['"`]/.exec(inner)
      const optsArr = objectAfter(inner, 'options', '[', ']')
      const defM = /defaultValue:\s*\{\s*summary:\s*['"`]([^'"`]*)['"`]/.exec(inner)
      result.argTypes.push({
        name: arg.key,
        description: descM ? descM[1] : undefined,
        options: optsArr ? parseStringArray(optsArr) : undefined,
        default: defM ? defM[1] : undefined,
      })
    }
  }
  return result
}

/* -------------------------------------------------------------------------- */
/*  4. MDX: status, descrição, exemplo de código                               */
/* -------------------------------------------------------------------------- */

function parseMdx(mdx) {
  const result = { displayName: null, status: null, description: null, example: null }
  if (!mdx) return result
  const h1 = /^#\s+(.+)$/m.exec(mdx)
  if (h1) {
    const raw = h1[1].trim()
    const stM = /·\s*`([^`]+)`/.exec(raw)
    result.status = stM ? stM[1] : null
    result.displayName = raw.replace(/·.*$/, '').replace(/`/g, '').trim()
    // primeiro parágrafo após o H1
    const after = mdx.slice(h1.index + h1[0].length)
    const para = after
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .find(
        (s) => s && !s.startsWith('<') && !s.startsWith('#') && !s.startsWith('import'),
      )
    if (para) result.description = para.replace(/\s+/g, ' ').trim()
  }
  // primeiro bloco ```tsx (preferindo o que está sob "## Code examples")
  const codeIdx = mdx.indexOf('## Code examples')
  const region = codeIdx >= 0 ? mdx.slice(codeIdx) : mdx
  const codeM = /```(?:tsx|jsx)\n([\s\S]*?)```/.exec(region)
  if (codeM) result.example = codeM[1].trim()
  return result
}

/* -------------------------------------------------------------------------- */
/*  5. Tokens (styles.css)                                                      */
/* -------------------------------------------------------------------------- */

function parseTokens() {
  const css = read(join(root, 'src/styles.css')) || ''
  // Localiza `<selector> {` (exige a chave de abertura para não casar com usos
  // do seletor dentro de outras regras, ex.: `@custom-variant dark (&:is(.dark *))`).
  const block = (selectorRe) => {
    const m = selectorRe.exec(css)
    if (!m) return {}
    const body = balanced(css, css.indexOf('{', m.index))
    const vars = {}
    for (const v of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[v[1]] = v[2].trim()
    return vars
  }
  const lightRoot = block(/:root\s*\{/)
  const darkRoot = block(/\.dark\s*\{/)
  // utilitários de cor expostos via @theme (--color-x → utilitário `x`)
  const themeBody = (() => {
    const idx = css.indexOf('@theme')
    return idx < 0 ? '' : balanced(css, css.indexOf('{', idx))
  })()
  const utilities = [...themeBody.matchAll(/--color-([\w-]+):/g)].map((m) => m[1])
  const tokens = utilities.map((name) => ({
    name,
    light: lightRoot[`--${name}`] || null,
    dark: darkRoot[`--${name}`] || null,
    utilities: [`bg-${name}`, `text-${name}`, `border-${name}`],
  }))
  return {
    radius: lightRoot['--radius'] || null,
    fontSans: (lightRoot['--font-sans'] || '').split(',')[0].replace(/['"]/g, '').trim(),
    colors: tokens,
  }
}

/* -------------------------------------------------------------------------- */
/*  6. Exemplos de página                                                       */
/* -------------------------------------------------------------------------- */

function parseExamples() {
  if (!existsSync(examplesDir)) return []
  const files = readdirSync(examplesDir).filter((f) => f.endsWith('.stories.tsx'))
  const out = []
  for (const file of files) {
    const src = read(join(examplesDir, file)) || ''
    const titleM = /title:\s*['"`]([^'"`]+)['"`]/.exec(src)
    const name = titleM
      ? titleM[1].replace(/^Examples\//, '')
      : file.replace('.stories.tsx', '')
    // descrição: docs.description.component (string possivelmente concatenada com +)
    const descBody = objectAfter(src, 'description')
    let description = null
    if (descBody) {
      const compM = /component:\s*([\s\S]*)/.exec(descBody)
      if (compM) {
        // strings JS (aspas) concatenadas com `+`; backticks aqui são markdown
        // dentro do texto e devem ser preservados.
        description = [...compM[1].matchAll(/'([^']*)'|"([^"]*)"/g)]
          .map((m) => m[1] ?? m[2])
          .join('')
          .replace(/\s+/g, ' ')
          .trim()
      }
    }
    out.push({ id: file.replace('.stories.tsx', ''), name, description, source: src })
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*  Montagem do manifesto                                                       */
/* -------------------------------------------------------------------------- */

const api = parsePublicApi()
const moduleFiles = readdirSync(uiDir)
  .filter(
    (f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx') && !f.endsWith('.test.tsx'),
  )
  .map((f) => f.replace('.tsx', ''))

const components = []
for (const mod of moduleFiles) {
  const exportsEntry = api[mod]
  if (!exportsEntry) continue // só o que é público
  const tsx = read(join(uiDir, `${mod}.tsx`))
  const stories = read(join(uiDir, `${mod}.stories.tsx`))
  const mdx = read(join(uiDir, `${mod}.mdx`))

  const cva = parseCvaVariants(tsx)
  const story = parseStories(stories)
  const doc = parseMdx(mdx)

  // variantes: cva + options de argTypes (merge por chave)
  const variants = { ...cva }
  for (const at of story.argTypes) {
    if (at.options?.length) {
      variants[at.name] = [...new Set([...(variants[at.name] || []), ...at.options])]
    }
  }

  const allExports = [...exportsEntry.values, ...exportsEntry.types]
  components.push({
    module: mod,
    name: doc.displayName || story.title?.split('/').pop() || mod,
    category: story.category || 'Other',
    status: doc.status || 'Stable',
    description: doc.description || null,
    exports: exportsEntry.values,
    typeExports: exportsEntry.types,
    importStatement: `import { ${allExports.join(', ')} } from 'timds'`,
    variants,
    props: story.argTypes,
    example: doc.example || null,
  })
}

components.sort((a, b) => a.name.localeCompare(b.name))

const manifest = {
  name: 'timds',
  description:
    'React component library with a built-in design system (shadcn/ui new-york + Tailwind v4). ' +
    'Consumed as a compiled package: import components from `timds` and styles from `timds/styles.css`.',
  version: JSON.parse(read(join(root, 'package.json'))).version,
  setup: {
    install: 'npm install github:welington-sampaio/timds',
    importStyles: "import 'timds/styles.css' // uma vez, no entrypoint do app",
    importComponents: "import { Button, Card } from 'timds'",
    darkMode:
      'Adicione a classe `dark` em um ancestral (ex.: <html class="dark">). Opt-in.',
    rules: [
      'Importe TODOS os componentes de `timds` — nunca de subcaminhos.',
      'Importe `timds/styles.css` uma única vez no entrypoint.',
      'Use apenas utilitários de cor semânticos (bg-primary, text-muted-foreground, etc.); nunca cores cruas (bg-blue-500).',
      'Cores vívidas têm token de fill (bg-success) e token de texto (text-success-text). Para texto/ícone use o `-text`.',
      'Ícones via lucide-react. Botões só com ícone precisam de aria-label.',
    ],
  },
  categories: [...new Set(components.map((c) => c.category))].sort(),
  components,
  tokens: parseTokens(),
  examples: parseExamples(),
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

/* -------------------------------------------------------------------------- */
/*  llms.txt (índice compacto)                                                  */
/* -------------------------------------------------------------------------- */

const byCategory = {}
for (const c of components) {
  byCategory[c.category] = byCategory[c.category] || []
  byCategory[c.category].push(c)
}

let llms = `# timds\n\n> ${manifest.description}\n\n`
llms += `## Setup\n\n`
llms += `- Install: \`${manifest.setup.install}\`\n`
llms += `- Styles: \`${manifest.setup.importStyles}\`\n`
llms += `- Import: \`${manifest.setup.importComponents}\`\n`
llms += `- Dark mode: ${manifest.setup.darkMode}\n\n`
llms += `## Components\n\n`
for (const cat of Object.keys(byCategory).sort()) {
  llms += `### ${cat}\n\n`
  for (const c of byCategory[cat]) {
    const desc = c.description
      ? ` — ${c.description.split('. ')[0].replace(/\.$/, '')}.`
      : ''
    llms += `- **${c.name}**: \`${c.exports.join(', ')}\`${desc}\n`
  }
  llms += `\n`
}
llms += `## Page examples\n\n`
for (const e of manifest.examples) {
  llms += `- **${e.name}**${e.description ? ` — ${e.description}` : ''}\n`
}
llms += `\n## Design tokens\n\nSemantic color utilities (light/dark auto): `
llms += `${manifest.tokens.colors.map((t) => t.name).join(', ')}.\n`
writeFileSync(join(outDir, 'llms.txt'), llms)

/* -------------------------------------------------------------------------- */
/*  llms-full.txt (documento completo)                                          */
/* -------------------------------------------------------------------------- */

let full = `# timds — full reference for AI agents\n\n${manifest.description}\n\n`
full += `## Setup & rules\n\n`
full += `\`\`\`bash\n${manifest.setup.install}\n\`\`\`\n\n`
full += `\`\`\`tsx\n${manifest.setup.importStyles}\n${manifest.setup.importComponents}\n\`\`\`\n\n`
for (const r of manifest.setup.rules) full += `- ${r}\n`
full += `\n## Design tokens\n\n`
full += `Radius base: \`${manifest.tokens.radius}\`. Font: \`${manifest.tokens.fontSans}\`.\n\n`
full += `Use these as Tailwind utilities (\`bg-*\`, \`text-*\`, \`border-*\`). Light/dark resolve automatically.\n\n`
for (const t of manifest.tokens.colors) {
  full += `- \`${t.name}\` — light \`${t.light ?? '—'}\`, dark \`${t.dark ?? '—'}\`\n`
}
full += `\n## Components\n\n`
for (const cat of Object.keys(byCategory).sort()) {
  full += `### ${cat}\n\n`
  for (const c of byCategory[cat]) {
    full += `#### ${c.name} \`${c.status}\`\n\n`
    if (c.description) full += `${c.description}\n\n`
    full += `Import: \`${c.importStatement}\`\n\n`
    const vk = Object.keys(c.variants)
    if (vk.length) {
      full += `Variants:\n`
      for (const k of vk)
        full += `- \`${k}\`: ${c.variants[k].map((v) => `\`${v}\``).join(', ')}\n`
      full += `\n`
    }
    if (c.props.length) {
      const props = c.props.filter((p) => p.description)
      if (props.length) {
        full += `Props:\n`
        for (const p of props) {
          const def = p.default ? ` (default: \`${p.default}\`)` : ''
          full += `- \`${p.name}\`${def} — ${p.description}\n`
        }
        full += `\n`
      }
    }
    if (c.example) full += `Example:\n\n\`\`\`tsx\n${c.example}\n\`\`\`\n\n`
  }
}
full += `## Page examples\n\n`
for (const e of manifest.examples) {
  full += `### ${e.name}\n\n`
  if (e.description) full += `${e.description}\n\n`
  full += `\`\`\`tsx\n${e.source}\n\`\`\`\n\n`
}
writeFileSync(join(outDir, 'llms-full.txt'), full)

/* -------------------------------------------------------------------------- */

console.log(
  `[ai-docs] ${components.length} componentes, ${manifest.examples.length} exemplos, ` +
    `${manifest.tokens.colors.length} tokens de cor → ai/manifest.json, ai/llms.txt, ai/llms-full.txt`,
)
