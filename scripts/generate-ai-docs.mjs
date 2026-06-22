#!/usr/bin/env node
// Generates timds' AI artifacts from the repository sources:
//   - ai/manifest.json   → structured data consumed by the MCP server
//   - ai/llms.txt        → compact index (llms.txt standard)
//   - ai/llms-full.txt   → single document with all components, tokens and examples
//
// Sources: src/index.ts (public API), src/components/ui/*.{tsx,stories.tsx,mdx}
// (variants via cva, props via argTypes, prose + example via MDX), src/styles.css
// (tokens) and src/design-system/examples/*.stories.tsx (page compositions).

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
/*  Parsing helpers (brace/quote-aware, no AST)                                 */
/* -------------------------------------------------------------------------- */

// Returns the content between `{` and its matching `}`, starting at the opening
// index. Respects strings and nested braces.
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

// Finds `label: {` (or `label: [`) and returns the balanced content of the value.
function objectAfter(str, label, open = '{', close = '}') {
  const re = new RegExp(`${label}\\s*:\\s*\\${open}`)
  const m = re.exec(str)
  if (!m) return null
  return balanced(str, m.index + m[0].length - 1, open, close)
}

// Splits an object's content into top-level `key: value` entries, respecting
// nesting and strings. Returns [{ key, value }].
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

// Extracts an array of string literals (['a', 'b']) from a snippet.
function parseStringArray(arrText) {
  if (!arrText) return []
  return [...arrText.matchAll(/['"`]([^'"`]+)['"`]/g)].map((m) => m[1])
}

/* -------------------------------------------------------------------------- */
/*  1. Public API: module → exports                                            */
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
      // `X as Y` → exported as Y
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
/*  2. Variants (cva) from the .tsx                                             */
/* -------------------------------------------------------------------------- */

function parseCvaVariants(tsx) {
  if (!tsx) return {}
  const out = {}
  // there may be more than one cva per file; we concatenate the groups
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
/*  3. Stories: category, description, argTypes                                 */
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
/*  4. MDX: status, description, code example                                   */
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
    // first paragraph after the H1
    const after = mdx.slice(h1.index + h1[0].length)
    const para = after
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .find(
        (s) => s && !s.startsWith('<') && !s.startsWith('#') && !s.startsWith('import'),
      )
    if (para) result.description = para.replace(/\s+/g, ' ').trim()
  }
  // first ```tsx block (preferring the one under "## Code examples")
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
  // Locates `<selector> {` (requires the opening brace so it doesn't match uses
  // of the selector inside other rules, e.g.: `@custom-variant dark (&:is(.dark *))`).
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
  // color utilities exposed via @theme (--color-x → `x` utility)
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
/*  6. Page examples                                                            */
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
    // description: docs.description.component (string possibly concatenated with +)
    const descBody = objectAfter(src, 'description')
    let description = null
    if (descBody) {
      const compM = /component:\s*([\s\S]*)/.exec(descBody)
      if (compM) {
        // JS strings (quotes) concatenated with `+`; backticks here are markdown
        // within the text and must be preserved.
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
/*  Manifest assembly                                                           */
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
  if (!exportsEntry) continue // public only
  const tsx = read(join(uiDir, `${mod}.tsx`))
  const stories = read(join(uiDir, `${mod}.stories.tsx`))
  const mdx = read(join(uiDir, `${mod}.mdx`))

  const cva = parseCvaVariants(tsx)
  const story = parseStories(stories)
  const doc = parseMdx(mdx)

  // variants: cva + argTypes options (merged by key)
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

const tokens = parseTokens()

// Bridge for the app's Tailwind: maps the timds tokens (--primary, …) to
// utilities (bg-primary, text-muted-foreground, …) usable in the consumer's own
// markup. Without it, the components still work (CSS already compiled), but
// token classes hand-written by the app don't get generated.
const tailwindBridge = [
  '@import "tailwindcss";',
  '@import "timds/styles.css";',
  '',
  '@theme inline {',
  '  --radius-lg: var(--radius);',
  '  --font-sans: var(--font-sans);',
  ...tokens.colors.map((t) => `  --color-${t.name}: var(--${t.name});`),
  '}',
].join('\n')

const manifest = {
  name: 'timds',
  description:
    'React component library with a built-in design system (shadcn/ui new-york + Tailwind v4). ' +
    'Consumed as a compiled package: import components from `timds` and styles from `timds/styles.css`.',
  version: JSON.parse(read(join(root, 'package.json'))).version,
  setup: {
    install: 'npm install github:welingtonsampaio/timds',
    // Import inside a CSS file, right AFTER the Tailwind import. The compiled CSS
    // carries no remote `@import` (the font is loaded by the app), so it composes
    // cleanly with Tailwind v4 — the only rule is ordering: `timds/styles.css`
    // must come after `@import "tailwindcss"` and before your own rules.
    // In your global CSS, the `timds/styles.css` import must come AFTER `tailwindcss`.
    importStyles: '@import "tailwindcss";\n@import "timds/styles.css";',
    importComponents: "import { Button, Card } from 'timds'",
    darkMode: 'Add the `dark` class to an ancestor (e.g.: <html class="dark">). Opt-in.',
    font: 'The DS uses the Inter family (`--font-sans`), but does NOT load the font. Load Inter in your app (e.g.: a Google Fonts <link> or @font-face in index.html); without it, it falls back to system-ui.',
    charts:
      'To use Chart/ChartContainer, install `recharts` (>=3) in the app: `npm i recharts`. It is a peerDependency (a single instance shared between the app and the DS); the chart primitives (AreaChart, Pie, …) come from `recharts`, and ChartContainer/ChartTooltip… from `timds`.',
    tailwindBridge,
    rules: [
      'Import ALL components from `timds` — never from subpaths.',
      'Import `timds/styles.css` from a CSS file, right AFTER `@import "tailwindcss"` (not via JS) — see `setup.importStyles`.',
      'Load the Inter font in your app (the DS does not load it) — see `setup.font`.',
      'For charts, install `recharts` (peerDependency) — see `setup.charts`.',
      'To also use token utilities (bg-primary, etc.) in your own markup, add the full `@theme` bridge from the `setup.tailwindBridge` field (it already includes the Tailwind + `timds/styles.css` imports; requires Tailwind v4 in the app).',
      'Use only semantic color utilities (bg-primary, text-muted-foreground, etc.); never raw colors (bg-blue-500).',
      'Vivid colors have a fill token (bg-success) and a text token (text-success-text). For text/icons use the `-text` one.',
      'Icons via lucide-react. Icon-only buttons need an aria-label.',
    ],
  },
  // Curated guidance surfaced by the MCP `search_components` when a query matches
  // a concept that has no dedicated component but maps to an existing pattern.
  searchGuidance: [
    {
      keywords: [
        'tag',
        'tags',
        'chip',
        'chips',
        'token',
        'tokens',
        'pill',
        'pills',
        'multiselect',
        'multi-select',
        'multi select',
        'multiedit',
        'multi-edit',
        'multivalue',
        'multi-value',
      ],
      message:
        'For tags / chips / multi-value selection, use **Select** in multi-edit mode (`multiple`). ' +
        'timds has no dedicated Tag/Chip input — the multiple Select renders the chosen values as removable chips ' +
        '(`SelectChipsValue`). Get details with `get_component` → "Select".',
    },
  ],
  categories: [...new Set(components.map((c) => c.category))].sort(),
  components,
  tokens,
  examples: parseExamples(),
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

/* -------------------------------------------------------------------------- */
/*  llms.txt (compact index)                                                    */
/* -------------------------------------------------------------------------- */

const byCategory = {}
for (const c of components) {
  byCategory[c.category] = byCategory[c.category] || []
  byCategory[c.category].push(c)
}

let llms = `# timds\n\n> ${manifest.description}\n\n`
llms += `## Setup\n\n`
llms += `- Install: \`${manifest.setup.install}\`\n`
llms += `- Styles (in your global CSS, after the Tailwind import):\n\`\`\`css\n${manifest.setup.importStyles}\n\`\`\`\n`
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
/*  llms-full.txt (full document)                                               */
/* -------------------------------------------------------------------------- */

let full = `# timds — full reference for AI agents\n\n${manifest.description}\n\n`
full += `## Setup & rules\n\n`
full += `\`\`\`bash\n${manifest.setup.install}\n\`\`\`\n\n`
full += `In your global CSS (the \`timds/styles.css\` import must come after \`tailwindcss\`):\n\n`
full += `\`\`\`css\n${manifest.setup.importStyles}\n\`\`\`\n\n`
full += `Then import components from \`timds\`:\n\n`
full += `\`\`\`tsx\n${manifest.setup.importComponents}\n\`\`\`\n\n`
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
  `[ai-docs] ${components.length} components, ${manifest.examples.length} examples, ` +
    `${manifest.tokens.colors.length} color tokens → ai/manifest.json, ai/llms.txt, ai/llms-full.txt`,
)
