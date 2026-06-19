// pagination.stories.tsx — stories + testes de interação (regressão) via play.
// Idioma `canvasElement` + `within`, utilitários de `storybook/test`, prosa/labels
// em English, comentários em pt-BR. A página de docs é a MDX (sem `autodocs` aqui).

import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect, fn, screen, userEvent, within } from 'storybook/test'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationShort,
  type PaginationShortProps,
} from './pagination'

// Render controlado: mantém página e tamanho de página em estado local (como num
// app real) e ainda repassa as trocas para os spies, permitindo asserções.
function Controlled(args: PaginationShortProps) {
  const [page, setPage] = useState(args.page)
  const [pageSize, setPageSize] = useState(args.pageSize)
  // Mantém o estado em sincronia quando alterado pelos Controls.
  useEffect(() => setPage(args.page), [args.page])
  useEffect(() => setPageSize(args.pageSize), [args.pageSize])
  return (
    <PaginationShort
      {...args}
      page={page}
      pageSize={pageSize}
      onPageChange={(next) => {
        setPage(next)
        args.onPageChange?.(next)
      }}
      onPageSizeChange={(next) => {
        setPageSize(next)
        args.onPageSizeChange?.(next)
      }}
    />
  )
}

const meta = {
  title: 'UI/Pagination',
  component: PaginationShort,
  // Sem `autodocs`: a página de docs é a MDX customizada (pagination.mdx).
  parameters: {
    docs: {
      description: {
        component:
          'Page navigation. `PaginationShort` is the ready-made form: drive it with ' +
          '`page`/`total` and react via `onPageChange` (SPA) or `href` (real links). ' +
          'Its `mode` prop offers four shapes — **full** (prev/next + numbered pages ' +
          'with ellipses), **numbers** (numbers only), **simple** (prev/next only) and ' +
          '**compact** (arrows + "Page X of Y"). The low-level primitives ' +
          '(`Pagination`, `PaginationContent`, `PaginationLink`, …) remain available ' +
          'for fully manual composition.',
      },
    },
  },
  args: {
    total: 10,
    page: 1,
    onPageChange: fn(), // spies compartilhados; auto-reset entre stories
    onPageSizeChange: fn(),
  },
  argTypes: {
    page: {
      control: { type: 'number', min: 1 },
      description: 'Current page (1-based).',
    },
    total: {
      control: { type: 'number', min: 1 },
      description: 'Total number of pages.',
    },
    mode: {
      control: 'inline-radio',
      options: ['full', 'numbers', 'simple', 'compact'],
      description: 'Rendering shape.',
      table: { defaultValue: { summary: 'full' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Control size.',
      table: { defaultValue: { summary: 'default' } },
    },
    siblingCount: {
      control: { type: 'number', min: 0 },
      description: 'Sibling pages around the current one (full/numbers).',
      table: { defaultValue: { summary: '1' } },
    },
    boundaryCount: {
      control: { type: 'number', min: 0 },
      description: 'Fixed pages at each edge (full/numbers).',
      table: { defaultValue: { summary: '1' } },
    },
    pageSize: {
      control: { type: 'number', min: 1 },
      description: 'Current rows-per-page value (needs `pageSizeOptions`).',
    },
    pageSizeOptions: {
      control: 'object',
      description: 'Rows-per-page choices; renders the selector when provided.',
    },
    onPageChange: {
      description: 'Called with the chosen page (SPA mode).',
      table: { category: 'Events' },
    },
    onPageSizeChange: {
      description: 'Called with the chosen rows-per-page value.',
      table: { category: 'Events' },
    },
    href: {
      control: false,
      description: 'Builds each page href (real-links/SSR mode); wins over onPageChange.',
    },
  },
} satisfies Meta<typeof PaginationShort>

export default meta
type Story = StoryObj<typeof meta>

/* ----- Modos (render-tested + axe) ----- */

/** Fully interactive — tweak `mode`, `size`, `page`, `total` and the rows-per-page
 *  selector from **Controls**. */
export const Playground: Story = {
  args: {
    page: 3,
    total: 12,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  render: (args) => <Controlled {...args} />,
}

/** `full` (default): prev/next + numbered pages with ellipses. */
export const Full: Story = {
  args: { mode: 'full', page: 4, total: 12 },
  render: (args) => <Controlled {...args} />,
}

/** `numbers`: numbered pages only (no prev/next). */
export const Numbers: Story = {
  args: { mode: 'numbers', page: 4, total: 12 },
  render: (args) => <Controlled {...args} />,
}

/** `simple`: just the previous/next controls. */
export const Simple: Story = {
  args: { mode: 'simple', page: 3, total: 12 },
  render: (args) => <Controlled {...args} />,
}

/** `compact`: arrows around a "Page X of Y" status. */
export const Compact: Story = {
  args: { mode: 'compact', page: 3, total: 12 },
  render: (args) => <Controlled {...args} />,
}

/**
 * The four modes side by side — each shown twice: plain and with the
 * rows-per-page selector active.
 */
export const Variants: Story = {
  args: { total: 12 },
  // Cada instância recebe um aria-label único: vários landmarks <nav> com o mesmo
  // nome violariam a regra landmark-unique do axe (irrelevante num app real, onde
  // há uma só paginação por página).
  render: (args) => {
    const modes = [
      { mode: 'full' as const, page: 4 },
      { mode: 'numbers' as const, page: 4 },
      { mode: 'simple' as const, page: 3 },
      { mode: 'compact' as const, page: 3 },
    ]
    return (
      <div className="flex flex-col gap-8">
        {modes.map(({ mode, page }) => (
          <div key={mode} className="flex flex-col gap-3">
            <Controlled
              {...args}
              mode={mode}
              page={page}
              aria-label={`pagination ${mode}`}
            />
            <Controlled
              {...args}
              mode={mode}
              page={page}
              pageSize={25}
              pageSizeOptions={[10, 25, 50, 100]}
              aria-label={`pagination ${mode} with rows per page`}
            />
          </div>
        ))}
      </div>
    )
  },
}

/** Three sizes (`sm`, `default`, `lg`). */
export const Sizes: Story = {
  args: { total: 12, page: 3 },
  // aria-label único por instância (ver nota em Variants sobre landmark-unique).
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Controlled {...args} size="sm" aria-label="pagination sm" />
      <Controlled {...args} size="default" aria-label="pagination default" />
      <Controlled {...args} size="lg" aria-label="pagination lg" />
    </div>
  ),
}

/**
 * "Rows per page" selector alongside the controls. Pass `pageSizeOptions` to
 * render it; combine with any `mode` (here `simple`, as in a table footer).
 */
export const RowsPerPage: Story = {
  args: {
    mode: 'simple',
    page: 1,
    total: 12,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  render: (args) => <Controlled {...args} />,
}

/** Real links (SSR): pass `href` to render `<a>` anchors instead of buttons. */
export const WithLinks: Story = {
  args: { page: 3, total: 12, href: (page) => `?page=${page}` },
}

/** Manual composition with the low-level primitives (the "long" form). */
export const Composition: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

/* ----- Testes de interação (regressão) ----- */

/** Clicking a page number fires `onPageChange` and moves `aria-current`. */
export const ClicksPage: Story = {
  args: { page: 1, total: 12 },
  render: (args) => <Controlled {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Go to page 3' }))
    await expect(args.onPageChange).toHaveBeenCalledWith(3)
    // Após a troca de estado, a página 3 passa a ser a atual (aria-current).
    await expect(canvas.getByRole('button', { name: 'Go to page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/** On the first page, "Previous" is disabled (and ignores clicks) while "Next"
 *  stays enabled. */
export const PreviousDisabledOnFirstPage: Story = {
  args: { page: 1, total: 12 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const previous = canvas.getByRole('button', { name: 'Previous' })
    const next = canvas.getByRole('button', { name: 'Next' })
    await expect(previous).toBeDisabled()
    await expect(next).toBeEnabled()
    // Elemento desabilitado tem pointer-events:none; forçamos o clique para
    // provar que onPageChange não dispara mesmo assim.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(previous)
    await expect(args.onPageChange).not.toHaveBeenCalled()
  },
}

/** On the last page, "Next" is disabled (and ignores clicks) while "Previous"
 *  stays enabled. */
export const NextDisabledOnLastPage: Story = {
  args: { page: 12, total: 12 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const previous = canvas.getByRole('button', { name: 'Previous' })
    const next = canvas.getByRole('button', { name: 'Next' })
    await expect(next).toBeDisabled()
    await expect(previous).toBeEnabled()
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(next)
    await expect(args.onPageChange).not.toHaveBeenCalled()
  },
}

/** The previous/next arrows step one page at a time. */
export const ArrowsNavigate: Story = {
  args: { page: 3, total: 12 },
  render: (args) => <Controlled {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
    await expect(args.onPageChange).toHaveBeenCalledWith(4)
    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }))
    await expect(args.onPageChange).toHaveBeenLastCalledWith(3)
  },
}

/** Choosing a new rows-per-page value fires `onPageSizeChange`. */
export const ChangesRowsPerPage: Story = {
  args: {
    mode: 'simple',
    page: 1,
    total: 12,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    // Abre o seletor pelo nome acessível e escolhe a opção "50".
    await userEvent.click(canvas.getByRole('combobox', { name: 'Rows per page' }))
    // A listbox do Select é portada para o body → consulta via `screen`.
    await userEvent.click(await screen.findByRole('option', { name: '50' }))
    await expect(args.onPageSizeChange).toHaveBeenCalledWith(50)
  },
}

/** Every label is overridable via `labels` (i18n) — here in pt-BR. */
export const Localized: Story = {
  args: {
    total: 12,
    page: 3,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50],
    labels: {
      previous: 'Anterior',
      next: 'Próximo',
      page: 'Página',
      of: 'de',
      goToPage: (page) => `Ir para página ${page}`,
      rowsPerPage: 'Linhas por página',
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Controlled {...args} mode="full" aria-label="paginação completa" />
      <Controlled {...args} mode="compact" aria-label="paginação compacta" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Queries escopadas por landmark (há duas paginações com nomes distintos).
    const full = within(canvas.getByRole('navigation', { name: 'paginação completa' }))
    const compact = within(canvas.getByRole('navigation', { name: 'paginação compacta' }))
    // Modo full: prev/next, página numerada e o seletor de linhas por página.
    await expect(full.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    await expect(full.getByRole('button', { name: 'Próximo' })).toBeInTheDocument()
    await expect(
      full.getByRole('button', { name: 'Ir para página 1' }),
    ).toBeInTheDocument()
    await expect(
      full.getByRole('combobox', { name: 'Linhas por página' }),
    ).toBeInTheDocument()
    // Modo compact: o status "{page} {current} {of} {total}" também é traduzido.
    await expect(compact.getByText('Página 3 de 12')).toBeInTheDocument()
  },
}

/** A large total collapses middle pages into ellipses. */
export const EllipsisForLargeTotal: Story = {
  args: { page: 10, total: 20 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Reticências em ambos os lados (cada uma expõe "More pages" em sr-only).
    await expect(canvas.getAllByText('More pages')).toHaveLength(2)
    // As páginas das extremidades continuam acessíveis.
    await expect(canvas.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: 'Go to page 20' }),
    ).toBeInTheDocument()
  },
}
