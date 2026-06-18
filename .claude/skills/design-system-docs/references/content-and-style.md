# Content & Style (timds)

How the prose should read, and the rules for microcopy inside components.

## Language policy (specific to this repo)

`timds` mixes languages deliberately — follow it exactly (see `CLAUDE.md` and the
existing files):

- **Docs prose is English** — the `meta.parameters.docs.description.component`, JSDoc
  story descriptions, and the `.mdx` page are all written in **English**. Every existing
  component does this.
- **In-code comments are Portuguese** — explanatory comments inside `.stories.tsx` /
  `.tsx` are written in **pt-BR** (e.g. `// Em loading o botão tem pointer-events:none`).
- **Code identifiers are English** — component names, prop names, story IDs (PascalCase:
  `Default`, `Loading`, `ClicksOnce`, `FocusesWithKeyboard`). Story names appear in the
  sidebar and CI output.
- **Visible content/labels** may be Portuguese where it reads naturally (the existing
  stories use `'Lançar'`, `'Avançar'`, `'Enviar'`). Keep accessible names consistent
  with the label you query in the play function.

Do not "translate" docs prose to match the chat language — in this repo docs are English
regardless of the conversation language.

## Voice & tone (documentation prose)

- Neutral, professional, developer-friendly — instructive, not chatty.
- Imperative for guidance ("Use the primary button for the main action"); plain present
  tense for descriptions ("The component renders a labelled control").
- Concise. Cut filler; every sentence earns its place.
- No marketing language, no hedging ("simply", "just", "obviously").

## Terminology

- One term per concept, used consistently. Match the names the component source already
  uses: `variant`, `size`, `shape`, `loading`, `block`, `asChild`, `data-slot`. Use
  `state` for interactive conditions and `prop` for API inputs.
- Reuse the same part names in Anatomy that the design source (Figma) uses, so design
  and code descriptions line up.

## Content & UX writing (text inside the component)

Document the rules for the component's own microcopy, so consumers write consistent UI:

- **Labels** — conventions (verb-first for actions: "Save", "Delete"), length limits,
  and capitalization (state sentence case vs title case).
- **Empty states** — tone and what to communicate.
- **Error messages** — specific, blame-free, actionable; and their structure.
- **Placeholders / helper text** — when to use, and what not to put there (don't replace
  a label with a placeholder).
- **What to avoid** — e.g. more than one primary action in a group; terminal punctuation
  in button labels.

## Length & formatting

- Sections are short; prefer scannable bullets for guidance and tables for structured
  data.
- Use blockquotes for warnings, fenced code blocks (with language tags) for code, and
  bold sparingly.
- Don't restate what a live Doc Block or a play-function test already conveys.

## Don't invent

Only describe props, defaults, and behaviors that exist in the supplied source. Read
`src/components/ui/<name>.tsx` (its `cva` variants, props/types, `data-slot`, callbacks)
first. Missing information is surfaced as a question to the user or a clearly marked
`<!-- TODO: confirmar -->` / `// TODO: confirmar`, never guessed. This applies to prose
and to test assertions alike — a confident-sounding but invented detail is a liability.
