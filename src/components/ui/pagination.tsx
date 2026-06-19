import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import type * as React from 'react'

import { Button, type ButtonProps, buttonVariants } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/* ============================================================================
 * Primitivas (forma composicional / "long")
 *
 * Montam a paginação peça a peça. Use quando precisar de controle total sobre
 * quais páginas/itens renderizar (ex.: SSR com links reais). Para a maioria dos
 * casos, prefira `PaginationShort` (mais abaixo).
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

// Link de página: reusa o visual do botão (outline quando ativo, ghost caso
// contrário) mantendo a semântica de âncora para navegação real.
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
 * Cálculo do intervalo de páginas (algoritmo estilo MUI usePagination)
 * ==========================================================================*/

/** Item do intervalo: um número de página ou uma reticência (`ellipsis`). */
export type PaginationRangeItem = number | 'ellipsis'

export interface PaginationRangeOptions {
  /** Página atual (1-based). */
  page: number
  /** Total de páginas. */
  total: number
  /** Quantas páginas vizinhas à atual exibir de cada lado. Padrão: 1. */
  siblingCount?: number
  /** Quantas páginas fixas exibir em cada extremidade. Padrão: 1. */
  boundaryCount?: number
}

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i)
}

/**
 * Calcula a sequência de páginas/reticências a renderizar. Útil para montar a
 * paginação manualmente com as primitivas, ou para testes. `PaginationShort`
 * usa esta função internamente nos modos `full`/`numbers`.
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
    // Reticência inicial (ou a página solta que ela substituiria).
    ...(siblingsStart > boundaryCount + 2
      ? (['ellipsis'] as const)
      : boundaryCount + 1 < total - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    // Reticência final (ou a página solta que ela substituiria).
    ...(siblingsEnd < total - boundaryCount - 1
      ? (['ellipsis'] as const)
      : total - boundaryCount > boundaryCount
        ? [total - boundaryCount]
        : []),
    ...endPages,
  ]
}

/* ============================================================================
 * PaginationShort (forma pronta / vários modos)
 * ==========================================================================*/

/** Modos de renderização do `PaginationShort`. */
export type PaginationMode = 'full' | 'numbers' | 'simple' | 'compact'

type PaginationShortSize = 'sm' | 'default' | 'lg'

// Tamanho quadrado dos botões numerados por `size` (sobrescreve o `size-9` do
// `size="icon"` do Button via tailwind-merge).
const SQUARE_SIZE: Record<PaginationShortSize, string> = {
  sm: 'size-8',
  default: 'size-9',
  lg: 'size-10',
}

/** Rótulos personalizáveis (i18n) do `PaginationShort`. */
export interface PaginationShortLabels {
  /** Texto do controle "anterior" (também vira `aria-label` no modo compact). */
  previous?: React.ReactNode
  /** Texto do controle "próximo" (também vira `aria-label` no modo compact). */
  next?: React.ReactNode
  /** Prefixo do status no modo compact: "{page} {current} {of} {total}". */
  page?: string
  /** Conectivo do status no modo compact. */
  of?: string
  /** Gera o `aria-label` de cada página numerada. */
  goToPage?: (page: number) => string
  /** Rótulo do seletor de tamanho de página (`pageSizeOptions`). */
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
  /** Página atual (1-based). */
  page: number
  /** Total de páginas. */
  total: number
  /** Disparado ao escolher uma página (modo "controlado por estado"/SPA). */
  onPageChange?: (page: number) => void
  /** Gera o `href` de cada página (modo "links reais"/SSR). Tem prioridade
   *  sobre `onPageChange` para a navegação. */
  href?: (page: number) => string
  /**
   * Forma de exibição:
   * - `full` (padrão): anterior/próximo + números com reticências.
   * - `numbers`: apenas os números (sem anterior/próximo).
   * - `simple`: apenas os botões anterior/próximo.
   * - `compact`: setas + status "Page X of Y".
   */
  mode?: PaginationMode
  /** Tamanho dos controles. Padrão: `default`. */
  size?: PaginationShortSize
  /** Páginas vizinhas à atual (modos `full`/`numbers`). Padrão: 1. */
  siblingCount?: number
  /** Páginas fixas nas extremidades (modos `full`/`numbers`). Padrão: 1. */
  boundaryCount?: number
  /** Tamanho de página atual ("rows per page"). Use junto de `pageSizeOptions`. */
  pageSize?: number
  /** Opções de tamanho de página; quando informado, exibe o seletor à esquerda. */
  pageSizeOptions?: number[]
  /** Disparado ao trocar o tamanho de página. */
  onPageSizeChange?: (pageSize: number) => void
  /** Rótulos personalizáveis (i18n). */
  labels?: PaginationShortLabels
}

// Botão interno: vira `<a href>` quando `href` é informado (navegação real) ou
// `<button onClick>` caso contrário (estado/SPA). Reaproveita o Button do DS,
// que já trata disabled/aria-disabled/foco para ambos os elementos.
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
 * Paginação pronta para uso. Controle `page`/`total` e reaja via `onPageChange`
 * (SPA) ou `href` (links reais). Escolha a aparência por `mode`.
 *
 * @example
 * // SPA, completo
 * <PaginationShort page={p} total={20} onPageChange={setP} />
 * // Apenas anterior/próximo
 * <PaginationShort mode="simple" page={p} total={20} onPageChange={setP} />
 * // Setas + "Page X of Y"
 * <PaginationShort mode="compact" page={p} total={20} onPageChange={setP} />
 * // Links reais (SSR)
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
        // biome-ignore lint/suspicious/noArrayIndexKey: posição da reticência é estável o bastante
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

  // Seletor de "rows per page": só aparece quando há opções; fica à esquerda e
  // empurra os controles de página para a direita (layout justify-between).
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
