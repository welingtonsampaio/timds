import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import type * as React from 'react'

import { Button, type ButtonProps, buttonVariants } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/* ============================================================================
 * Primitives (compositional / "long" form)
 *
 * Build the pagination piece by piece. Use when you need full control over
 * which pages/items to render (e.g.: SSR with real links). For most cases,
 * prefer `PaginationShort` (further below).
 * ==========================================================================*/

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

// Page link: reuses the button visuals (outline when active, ghost otherwise)
// while keeping the anchor semantics for real navigation.
function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }),
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

/* ============================================================================
 * Page range computation (MUI usePagination style algorithm)
 * ==========================================================================*/

/** Range item: a page number or an ellipsis (`ellipsis`). */
export type PaginationRangeItem = number | 'ellipsis'

export interface PaginationRangeOptions {
  /** Current page (1-based). */
  page: number
  /** Total number of pages. */
  total: number
  /** How many sibling pages to show on each side of the current one. Default: 1. */
  siblingCount?: number
  /** How many fixed pages to show at each boundary. Default: 1. */
  boundaryCount?: number
}

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i)
}

/**
 * Computes the sequence of pages/ellipses to render. Useful for building the
 * pagination manually with the primitives, or for tests. `PaginationShort`
 * uses this function internally in the `full`/`numbers` modes.
 */
export function getPaginationRange({
  page,
  total,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationRangeItem[] {
  const startPages = range(1, Math.min(boundaryCount, total))
  const endPages = range(Math.max(total - boundaryCount + 1, boundaryCount + 1), total)

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : total - 1,
  )

  return [
    ...startPages,
    // Leading ellipsis (or the lone page it would replace).
    ...(siblingsStart > boundaryCount + 2
      ? (['ellipsis'] as const)
      : boundaryCount + 1 < total - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    // Trailing ellipsis (or the lone page it would replace).
    ...(siblingsEnd < total - boundaryCount - 1
      ? (['ellipsis'] as const)
      : total - boundaryCount > boundaryCount
        ? [total - boundaryCount]
        : []),
    ...endPages,
  ]
}

/* ============================================================================
 * PaginationShort (ready-to-use form / multiple modes)
 * ==========================================================================*/

/** Rendering modes of `PaginationShort`. */
export type PaginationMode = 'full' | 'numbers' | 'simple' | 'compact'

type PaginationShortSize = 'sm' | 'default' | 'lg'

// Square size of the numbered buttons by `size` (overrides the Button's `size-9`
// from `size="icon"` via tailwind-merge).
const SQUARE_SIZE: Record<PaginationShortSize, string> = {
  sm: 'size-8',
  default: 'size-9',
  lg: 'size-10',
}

/** Customizable labels (i18n) of `PaginationShort`. */
export interface PaginationShortLabels {
  /** Text of the "previous" control (also becomes `aria-label` in compact mode). */
  previous?: React.ReactNode
  /** Text of the "next" control (also becomes `aria-label` in compact mode). */
  next?: React.ReactNode
  /** Status prefix in compact mode: "{page} {current} {of} {total}". */
  page?: string
  /** Status connector in compact mode. */
  of?: string
  /** Generates the `aria-label` of each numbered page. */
  goToPage?: (page: number) => string
  /** Label of the page size selector (`pageSizeOptions`). */
  rowsPerPage?: string
}

const DEFAULT_LABELS: Required<PaginationShortLabels> = {
  previous: 'Previous',
  next: 'Next',
  page: 'Page',
  of: 'of',
  goToPage: (page) => `Go to page ${page}`,
  rowsPerPage: 'Rows per page',
}

export interface PaginationShortProps
  extends Omit<React.ComponentProps<'nav'>, 'onChange'> {
  /** Current page (1-based). */
  page: number
  /** Total number of pages. */
  total: number
  /** Fired when choosing a page (state-controlled/SPA mode). */
  onPageChange?: (page: number) => void
  /** Generates the `href` of each page (real-links/SSR mode). Takes priority
   *  over `onPageChange` for navigation. */
  href?: (page: number) => string
  /**
   * Display form:
   * - `full` (default): previous/next + numbers with ellipses.
   * - `numbers`: only the numbers (no previous/next).
   * - `simple`: only the previous/next buttons.
   * - `compact`: arrows + "Page X of Y" status.
   */
  mode?: PaginationMode
  /** Size of the controls. Default: `default`. */
  size?: PaginationShortSize
  /** Sibling pages around the current one (`full`/`numbers` modes). Default: 1. */
  siblingCount?: number
  /** Fixed pages at the boundaries (`full`/`numbers` modes). Default: 1. */
  boundaryCount?: number
  /** Current page size ("rows per page"). Use together with `pageSizeOptions`. */
  pageSize?: number
  /** Page size options; when provided, shows the selector on the left. */
  pageSizeOptions?: number[]
  /** Fired when changing the page size. */
  onPageSizeChange?: (pageSize: number) => void
  /** Customizable labels (i18n). */
  labels?: PaginationShortLabels
}

// Internal button: becomes `<a href>` when `href` is provided (real navigation)
// or `<button onClick>` otherwise (state/SPA). Reuses the DS Button, which
// already handles disabled/aria-disabled/focus for both elements.
function PaginationShortButton({
  targetPage,
  isActive,
  disabled,
  square,
  size,
  onPageChange,
  href,
  className,
  children,
  ...props
}: {
  targetPage: number
  isActive?: boolean
  disabled?: boolean
  square?: boolean
  size: PaginationShortSize
  onPageChange?: (page: number) => void
  href?: (page: number) => string
  className?: string
  children: React.ReactNode
} & Omit<React.ComponentProps<'button'>, 'onClick' | 'type'>) {
  const shared = {
    variant: (isActive ? 'outline' : 'ghost') as ButtonProps['variant'],
    size: (square ? 'icon' : size) as ButtonProps['size'],
    disabled,
    'aria-current': isActive ? ('page' as const) : undefined,
    'data-slot': 'pagination-link',
    'data-active': isActive || undefined,
    className: cn(square && SQUARE_SIZE[size], className),
    ...props,
  }

  if (href) {
    return (
      <Button href={href(targetPage)} {...shared}>
        {children}
      </Button>
    )
  }

  return (
    <Button onClick={() => onPageChange?.(targetPage)} {...shared}>
      {children}
    </Button>
  )
}

/**
 * Ready-to-use pagination. Control `page`/`total` and react via `onPageChange`
 * (SPA) or `href` (real links). Choose the appearance via `mode`.
 *
 * @example
 * // SPA, full
 * <PaginationShort page={p} total={20} onPageChange={setP} />
 * // Only previous/next
 * <PaginationShort mode="simple" page={p} total={20} onPageChange={setP} />
 * // Arrows + "Page X of Y"
 * <PaginationShort mode="compact" page={p} total={20} onPageChange={setP} />
 * // Real links (SSR)
 * <PaginationShort page={p} total={20} href={(n) => `/itens?page=${n}`} />
 */
function PaginationShort({
  page,
  total,
  onPageChange,
  href,
  mode = 'full',
  size = 'default',
  siblingCount = 1,
  boundaryCount = 1,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  labels,
  className,
  ...props
}: PaginationShortProps) {
  if (total < 1) return null

  const current = Math.min(Math.max(page, 1), total)
  const l = { ...DEFAULT_LABELS, ...labels }
  const isFirst = current <= 1
  const isLast = current >= total
  const prevAria = typeof l.previous === 'string' ? l.previous : 'Previous page'
  const nextAria = typeof l.next === 'string' ? l.next : 'Next page'

  let content: React.ReactNode

  if (mode === 'simple') {
    content = (
      <>
        <PaginationItem>
          <PaginationShortButton
            targetPage={current - 1}
            disabled={isFirst}
            size={size}
            onPageChange={onPageChange}
            href={href}
            aria-label={prevAria}
            className="gap-1 px-2.5"
          >
            <ChevronLeftIcon />
            <span>{l.previous}</span>
          </PaginationShortButton>
        </PaginationItem>
        <PaginationItem>
          <PaginationShortButton
            targetPage={current + 1}
            disabled={isLast}
            size={size}
            onPageChange={onPageChange}
            href={href}
            aria-label={nextAria}
            className="gap-1 px-2.5"
          >
            <span>{l.next}</span>
            <ChevronRightIcon />
          </PaginationShortButton>
        </PaginationItem>
      </>
    )
  } else if (mode === 'compact') {
    content = (
      <>
        <PaginationItem>
          <PaginationShortButton
            targetPage={current - 1}
            disabled={isFirst}
            square
            size={size}
            onPageChange={onPageChange}
            href={href}
            aria-label={prevAria}
          >
            <ChevronLeftIcon />
          </PaginationShortButton>
        </PaginationItem>
        <PaginationItem>
          <span
            data-slot="pagination-status"
            aria-live="polite"
            className="px-3 text-sm tabular-nums"
          >
            {l.page} {current} {l.of} {total}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationShortButton
            targetPage={current + 1}
            disabled={isLast}
            square
            size={size}
            onPageChange={onPageChange}
            href={href}
            aria-label={nextAria}
          >
            <ChevronRightIcon />
          </PaginationShortButton>
        </PaginationItem>
      </>
    )
  } else {
    // full | numbers
    const numbers = getPaginationRange({
      page: current,
      total,
      siblingCount,
      boundaryCount,
    }).map((item, index) =>
      item === 'ellipsis' ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: the ellipsis position is stable enough
        <PaginationItem key={`ellipsis-${index}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={item}>
          <PaginationShortButton
            targetPage={item}
            isActive={item === current}
            square
            size={size}
            onPageChange={onPageChange}
            href={href}
            aria-label={l.goToPage(item)}
          >
            {item}
          </PaginationShortButton>
        </PaginationItem>
      ),
    )

    content = (
      <>
        {mode === 'full' && (
          <PaginationItem>
            <PaginationShortButton
              targetPage={current - 1}
              disabled={isFirst}
              size={size}
              onPageChange={onPageChange}
              href={href}
              aria-label={prevAria}
              className="gap-1 px-2.5"
            >
              <ChevronLeftIcon />
              <span className="hidden sm:block">{l.previous}</span>
            </PaginationShortButton>
          </PaginationItem>
        )}
        {numbers}
        {mode === 'full' && (
          <PaginationItem>
            <PaginationShortButton
              targetPage={current + 1}
              disabled={isLast}
              size={size}
              onPageChange={onPageChange}
              href={href}
              aria-label={nextAria}
              className="gap-1 px-2.5"
            >
              <span className="hidden sm:block">{l.next}</span>
              <ChevronRightIcon />
            </PaginationShortButton>
          </PaginationItem>
        )}
      </>
    )
  }

  // "rows per page" selector: only appears when there are options; sits on the
  // left and pushes the page controls to the right (justify-between layout).
  const showPageSize = pageSizeOptions !== undefined && pageSizeOptions.length > 0
  const rowsPerPageLabel =
    typeof l.rowsPerPage === 'string' ? l.rowsPerPage : 'Rows per page'

  return (
    <Pagination
      className={cn(showPageSize && 'justify-between gap-4', className)}
      {...props}
    >
      {showPageSize && (
        <div data-slot="pagination-page-size" className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{l.rowsPerPage}</span>
          <Select
            aria-label={rowsPerPageLabel}
            size={size}
            value={pageSize !== undefined ? String(pageSize) : undefined}
            options={pageSizeOptions.map((n) => ({
              value: String(n),
              label: String(n),
            }))}
            onValueChange={(value) => onPageSizeChange?.(Number(value))}
            triggerClassName="w-auto min-w-[4.5rem]"
          />
        </div>
      )}
      <PaginationContent>{content}</PaginationContent>
    </Pagination>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationShort,
}
