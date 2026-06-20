import * as React from 'react'

import { cn } from '@/lib/utils'

// Provides the table's column count to descendants that need to span the full
// width (e.g. `TableGroupRow`), avoiding manual counting. It stays `undefined`
// when the consumer doesn't provide `columnCount` — in that case the `colSpan`
// must come via prop (see `TableGroupRow`).
const TableColumnCountContext = React.createContext<number | undefined>(undefined)

function Table({
  className,
  containerClassName,
  columnCount,
  ...props
}: React.ComponentProps<'table'> & {
  /** Number of table columns; propagates the `colSpan` to `TableGroupRow`. */
  columnCount?: number
  /**
   * Classes for the scroll container (the `<div>` that wraps the `<table>`).
   * This is where the height is constrained to enable vertical scroll — required
   * for `TableGroupRow sticky`, whose `top-0` anchors to this container.
   */
  containerClassName?: string
}) {
  return (
    <TableColumnCountContext.Provider value={columnCount}>
      {/* tabIndex={0} makes the scroll region keyboard accessible: since the
          container is always `overflow-x-auto` (and may have vertical scroll via
          containerClassName), axe requires it to be focusable (scrollable-region-
          focusable). */}
      {/* biome-ignore-start lint/a11y/noNoninteractiveTabindex: the scroll region must be keyboard focusable (axe scrollable-region-focusable) */}
      <div
        data-slot="table-container"
        tabIndex={0}
        className={cn(
          'relative w-full overflow-x-auto rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          containerClassName,
        )}
      >
        <table
          data-slot="table"
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
      {/* biome-ignore-end lint/a11y/noNoninteractiveTabindex: end of the scroll container exception */}
    </TableColumnCountContext.Provider>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableGroupRow({
  className,
  children,
  count,
  colSpan: colSpanProp,
  sticky = false,
  ...props
}: React.ComponentProps<'th'> & {
  /** Group count, displayed as `(n)` next to the label. */
  count?: number
  /** Overrides the `colSpan`; defaults to the `Table`'s `columnCount`. */
  colSpan?: number
  /** Pins the group header to the top during scroll. */
  sticky?: boolean
}) {
  // Hybrid: uses the `colSpan` provided via prop; otherwise the Table's `columnCount`.
  const columnCount = React.useContext(TableColumnCountContext)
  const colSpan = colSpanProp ?? columnCount

  return (
    <tr data-slot="table-group-row">
      <th
        // `rowgroup` is the correct scope for a header that labels a group of
        // rows (not `colgroup`). Static table: no explicit ARIA.
        scope="rowgroup"
        colSpan={colSpan}
        data-sticky={sticky || undefined}
        className={cn(
          // `bg-muted` (solid) also ensures the opaque background required by sticky.
          'border-t border-b bg-muted px-2 py-1.5 text-left align-middle text-sm font-medium text-foreground',
          sticky && 'sticky top-0 z-10',
          className,
        )}
        {...props}
      >
        {children}
        {count != null && (
          <span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
            ({count})
          </span>
        )}
      </th>
    </tr>
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
}
