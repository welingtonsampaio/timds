// pagination.stories.tsx — stories + interaction (regression) tests via play.
// `canvasElement` + `within`, `storybook/test` utilities, prose/labels
// in English. The docs page is the MDX (no `autodocs` here).

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

// Controlled render: keeps page and page size in local state (as in a real
// app) while still forwarding changes to the spies, enabling assertions.
function Controlled(args: PaginationShortProps) {
  const [page, setPage] = useState(args.page)
  const [pageSize, setPageSize] = useState(args.pageSize)
  // Keeps state in sync when changed via the Controls.
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
  title: 'Navigation/Pagination',
  component: PaginationShort,
  // No `autodocs`: the docs page is the custom MDX (pagination.mdx).
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
    onPageChange: fn(), // shared spies; auto-reset between stories
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

/* ----- Modes (render-tested + axe) ----- */

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
  // Each instance gets a unique aria-label: multiple <nav> landmarks with the same
  // name would violate axe's landmark-unique rule (irrelevant in a real app, where
  // there is a single pagination per page).
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
  // unique aria-label per instance (see the note in Variants about landmark-unique).
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

/* ----- Interaction (regression) tests ----- */

/** Clicking a page number fires `onPageChange` and moves `aria-current`. */
export const ClicksPage: Story = {
  args: { page: 1, total: 12 },
  render: (args) => <Controlled {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Go to page 3' }))
    await expect(args.onPageChange).toHaveBeenCalledWith(3)
    // After the state change, page 3 becomes the current one (aria-current).
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
    // A disabled element has pointer-events:none; we force the click to
    // prove that onPageChange does not fire anyway.
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
    // Open the selector by its accessible name and choose the "50" option.
    await userEvent.click(canvas.getByRole('combobox', { name: 'Rows per page' }))
    // The Select's listbox is portaled to the body → query via `screen`.
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
    // Queries scoped by landmark (there are two paginations with distinct names).
    const full = within(canvas.getByRole('navigation', { name: 'paginação completa' }))
    const compact = within(canvas.getByRole('navigation', { name: 'paginação compacta' }))
    // Full mode: prev/next, numbered page and the rows-per-page selector.
    await expect(full.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    await expect(full.getByRole('button', { name: 'Próximo' })).toBeInTheDocument()
    await expect(
      full.getByRole('button', { name: 'Ir para página 1' }),
    ).toBeInTheDocument()
    await expect(
      full.getByRole('combobox', { name: 'Linhas por página' }),
    ).toBeInTheDocument()
    // Compact mode: the "{page} {current} {of} {total}" status is also translated.
    await expect(compact.getByText('Página 3 de 12')).toBeInTheDocument()
  },
}

/** A large total collapses middle pages into ellipses. */
export const EllipsisForLargeTotal: Story = {
  args: { page: 10, total: 20 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Ellipses on both sides (each exposes "More pages" in sr-only).
    await expect(canvas.getAllByText('More pages')).toHaveLength(2)
    // The edge pages remain accessible.
    await expect(canvas.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: 'Go to page 20' }),
    ).toBeInTheDocument()
  },
}
