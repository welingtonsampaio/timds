import * as React from 'react'

import { cn } from '@/lib/utils'

// Fornece a quantidade de colunas da tabela para descendentes que precisam
// ocupar a largura inteira (ex.: `TableGroupRow`), evitando contar à mão. Fica
// `undefined` quando o consumidor não informa `columnCount` — nesse caso o
// `colSpan` deve vir por prop (ver `TableGroupRow`).
const TableColumnCountContext = React.createContext<number | undefined>(undefined)

function Table({
  className,
  containerClassName,
  columnCount,
  ...props
}: React.ComponentProps<'table'> & {
  /** Número de colunas da tabela; propaga o `colSpan` para `TableGroupRow`. */
  columnCount?: number
  /**
   * Classes para o container de scroll (o `<div>` que envolve a `<table>`).
   * É aqui que se limita a altura para habilitar scroll vertical — necessário
   * para `TableGroupRow sticky`, cujo `top-0` se ancora neste container.
   */
  containerClassName?: string
}) {
  return (
    <TableColumnCountContext.Provider value={columnCount}>
      {/* tabIndex={0} torna a região de scroll acessível por teclado: como o
          container é sempre `overflow-x-auto` (e pode ter scroll vertical via
          containerClassName), o axe exige que seja focável (scrollable-region-
          focusable). */}
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
  /** Contagem do grupo, exibida como `(n)` ao lado do rótulo. */
  count?: number
  /** Sobrescreve o `colSpan`; por padrão usa `columnCount` da `Table`. */
  colSpan?: number
  /** Fixa o cabeçalho do grupo no topo durante o scroll. */
  sticky?: boolean
}) {
  // Híbrido: usa o `colSpan` informado por prop; senão, o `columnCount` da Table.
  const columnCount = React.useContext(TableColumnCountContext)
  const colSpan = colSpanProp ?? columnCount

  return (
    <tr data-slot="table-group-row">
      <th
        // `rowgroup` é o escopo correto para um cabeçalho que rotula um grupo de
        // linhas (não `colgroup`). Tabela estática: sem ARIA explícito.
        scope="rowgroup"
        colSpan={colSpan}
        data-sticky={sticky || undefined}
        className={cn(
          // `bg-muted` (sólido) também garante o fundo opaco exigido pelo sticky.
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
