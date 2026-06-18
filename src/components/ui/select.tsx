import * as Ariakit from '@ariakit/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown, Search } from 'lucide-react'
import { matchSorter } from 'match-sorter'
import * as React from 'react'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Visão geral
// ---------------------------------------------------------------------------
// `Select` é um combobox/select avançado construído sobre o Ariakit (a11y
// WAI-ARIA APG, foco virtual via `aria-activedescendant`) e o
// `@tanstack/react-virtual` (virtualização). Não usa o `<select>` nativo.
//
// Há duas camadas de API:
//   1. Primitivas compostas (`SelectRoot`, `SelectTrigger`, `SelectContent`,
//      `SelectItem`, ...) para casos avançados.
//   2. Um componente data-driven `Select` (props `options`, `loadOptions`, ...)
//      construído sobre as primitivas, que cobre busca, async, infinite scroll,
//      virtualização e grupos.
//
// Detalhe crítico de a11y: a navegação por teclado em listas virtualizadas só
// funciona com foco virtual (`aria-activedescendant`), fornecido pelo
// `ComboboxProvider`. Por isso a virtualização sempre habilita o combobox,
// mesmo sem campo de busca visível. Além disso, passamos `defaultItems` (lista
// completa com ids determinísticos) aos stores: assim o Ariakit conhece todos
// os itens mesmo os que não estão montados no DOM.

const SIZE_ITEM_HEIGHT = { sm: 32, default: 36, lg: 40 } as const

type SelectSize = 'sm' | 'default' | 'lg'

// ---------------------------------------------------------------------------
// Contexto interno (compartilha o `size` entre as primitivas)
// ---------------------------------------------------------------------------
type SelectContextValue = { size: SelectSize; label?: string }
const SelectContext = React.createContext<SelectContextValue>({ size: 'default' })
const useSelectContext = () => React.useContext(SelectContext)

// ---------------------------------------------------------------------------
// SelectRoot — cria os stores do Ariakit e provê os contextos
// ---------------------------------------------------------------------------
type SelectRootProps = {
  /** Valor selecionado (controlado). */
  value?: string
  /** Valor inicial (não controlado). */
  defaultValue?: string
  /** Disparado ao selecionar um item. */
  onValueChange?: (value: string) => void
  /** Estado de abertura do popover (controlado). */
  open?: boolean
  /** Abertura inicial (não controlado). */
  defaultOpen?: boolean
  /** Disparado quando o popover abre/fecha. */
  onOpenChange?: (open: boolean) => void
  /**
   * Habilita o combobox (busca e foco virtual). Necessário para virtualização,
   * por isso é ligado automaticamente quando há busca ou virtualização.
   */
  combobox?: boolean
  /** Disparado quando o texto de busca muda (já recebe o valor digitado). */
  onSearch?: (search: string) => void
  /**
   * Registro completo de itens (`{ id, value }`) usado para a navegação por
   * teclado funcionar com itens virtualizados (não montados).
   */
  items?: Array<{ id: string; value: string }>
  size?: SelectSize
  /** Rótulo acessível base, herdado pela busca e pela lista. */
  label?: string
  children?: React.ReactNode
}

function SelectRoot({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  combobox = false,
  onSearch,
  items,
  size = 'default',
  label,
  children,
}: SelectRootProps) {
  // Estado de abertura: o Ariakit não permite combinar a prop controlada e a
  // `default*` (mesmo `undefined`); só passamos uma das chaves do par. Quando há
  // combobox, a abertura é compartilhada e deve ser gerida pelo store do
  // combobox — passá-la ao select store conflita com o store prop `combobox`.
  const openState =
    open !== undefined
      ? { open, setOpen: onOpenChange }
      : defaultOpen !== undefined
        ? { defaultOpen, setOpen: onOpenChange }
        : { setOpen: onOpenChange }

  const comboboxStore = Ariakit.useComboboxStore({
    resetValueOnHide: true,
    defaultItems: items,
    setValue: onSearch,
    ...(combobox ? openState : {}),
  })
  const selectStore = Ariakit.useSelectStore({
    combobox: combobox ? comboboxStore : undefined,
    setValue: onValueChange,
    defaultItems: items,
    ...(value !== undefined ? { value } : { defaultValue: defaultValue ?? '' }),
    ...(combobox ? {} : openState),
  })

  const tree = combobox ? (
    <Ariakit.ComboboxProvider store={comboboxStore}>
      <Ariakit.SelectProvider store={selectStore}>{children}</Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  ) : (
    <Ariakit.SelectProvider store={selectStore}>{children}</Ariakit.SelectProvider>
  )

  return <SelectContext.Provider value={{ size, label }}>{tree}</SelectContext.Provider>
}

// ---------------------------------------------------------------------------
// SelectTrigger — botão que abre o popover (visual alinhado ao Input)
// ---------------------------------------------------------------------------
const selectTriggerVariants = cva(
  // Base: espelha o Input (borda, sombra, foco) e dispõe valor + chevron.
  "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: { sm: 'h-8', default: 'h-9', lg: 'h-10' },
    },
    defaultVariants: { size: 'default' },
  },
)

function SelectTrigger({
  className,
  children,
  size,
  ...props
}: React.ComponentProps<typeof Ariakit.Select> &
  VariantProps<typeof selectTriggerVariants>) {
  const ctx = useSelectContext()
  const resolvedSize = size ?? ctx.size
  return (
    <Ariakit.Select
      data-slot="select-trigger"
      data-size={resolvedSize}
      className={cn(selectTriggerVariants({ size: resolvedSize }), className)}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
    </Ariakit.Select>
  )
}

// ---------------------------------------------------------------------------
// SelectValue — mostra o valor selecionado (ou o placeholder)
// ---------------------------------------------------------------------------
function SelectValue({
  className,
  placeholder,
  children,
}: {
  className?: string
  placeholder?: React.ReactNode
  /** Conteúdo custom; como função recebe o valor selecionado. */
  children?: React.ReactNode | ((value: string) => React.ReactNode)
}) {
  const store = Ariakit.useSelectContext()
  const value = Ariakit.useStoreState(store, 'value') as string | undefined
  const isEmpty = value == null || value === ''
  return (
    <span
      data-slot="select-value"
      className={cn('truncate', isEmpty && 'text-muted-foreground', className)}
    >
      {isEmpty
        ? placeholder
        : typeof children === 'function'
          ? children(value)
          : (children ?? value)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// SelectContent — popover (portal) que envolve a busca e a lista
// ---------------------------------------------------------------------------
function SelectContent({
  className,
  children,
  gutter = 4,
  sameWidth = true,
  ...props
}: React.ComponentProps<typeof Ariakit.SelectPopover>) {
  const { label } = useSelectContext()
  return (
    <Ariakit.SelectPopover
      aria-label={label ?? 'Opções'}
      data-slot="select-content"
      gutter={gutter}
      sameWidth={sameWidth}
      // Sem `unmountOnHide`: o popover permanece montado (oculto) quando fechado,
      // assim o `aria-controls` do trigger sempre referencia um elemento
      // existente em qualquer estado. (O axe ainda marca `aria-controls` +
      // `aria-haspopup` como "needs review"/inconclusive — falso-positivo
      // conhecido do padrão combobox, não é uma violação.)
      className={cn(
        // Fallback de 24rem na var do Ariakit (só é definida no browser real):
        // sem ele, `min(24rem, var(--undefined))` é inválido e o popover cresce.
        'z-50 flex max-h-[min(24rem,var(--popover-available-height,24rem))] origin-(--popover-transform-origin) flex-col overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </Ariakit.SelectPopover>
  )
}

// ---------------------------------------------------------------------------
// SelectSearch — campo de busca (combobox). Só dentro de um ComboboxProvider.
// ---------------------------------------------------------------------------
function SelectSearch({
  className,
  placeholder = 'Buscar...',
  ...props
}: React.ComponentProps<typeof Ariakit.Combobox>) {
  const combobox = Ariakit.useComboboxContext()
  const { label } = useSelectContext()
  if (!combobox) return null
  return (
    <div
      data-slot="select-search"
      className="flex items-center gap-2 border-b border-border px-3"
    >
      <Search className="size-4 shrink-0 opacity-50" aria-hidden="true" />
      <Ariakit.Combobox
        aria-label={label ? `Buscar ${label}` : 'Buscar'}
        autoSelect
        placeholder={placeholder}
        className={cn(
          'h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground',
          className,
        )}
        {...props}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// SelectList — container rolável da lista (usa Combobox/Select conforme o modo)
// ---------------------------------------------------------------------------
function SelectList({
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<'div'> & { ref?: React.Ref<HTMLDivElement> }) {
  const combobox = Ariakit.useComboboxContext()
  const { label } = useSelectContext()
  const Comp = combobox ? Ariakit.ComboboxList : Ariakit.SelectList
  return (
    <Comp
      ref={ref}
      aria-label={label ?? 'Opções'}
      data-slot="select-list"
      className={cn('max-h-72 overflow-y-auto overflow-x-hidden p-1', className)}
      {...props}
    >
      {children}
    </Comp>
  )
}

// ---------------------------------------------------------------------------
// SelectGroup — agrupamento com rótulo
// ---------------------------------------------------------------------------
function SelectGroup({
  className,
  label,
  children,
  ...props
}: React.ComponentProps<'div'> & { label?: React.ReactNode }) {
  const combobox = Ariakit.useComboboxContext()
  const GroupComp = combobox ? Ariakit.ComboboxGroup : Ariakit.SelectGroup
  const LabelComp = combobox ? Ariakit.ComboboxGroupLabel : Ariakit.SelectGroupLabel
  return (
    <GroupComp
      data-slot="select-group"
      // Separador sutil entre grupos (exceto o primeiro) reforça a divisão.
      className={cn(
        'py-1 not-first:mt-1 not-first:border-t not-first:border-border',
        className,
      )}
      {...props}
    >
      {label != null && (
        // Cabeçalho de seção: maiúsculas + peso + tracking e fixo no topo
        // (sticky) com fundo do popover, para destacar o grupo ao rolar.
        <LabelComp className="sticky top-0 z-10 bg-popover px-2 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </LabelComp>
      )}
      {children}
    </GroupComp>
  )
}

// ---------------------------------------------------------------------------
// SelectItem — opção. Combina ComboboxItem (foco virtual) + SelectItem (seleção)
// ---------------------------------------------------------------------------
const selectItemClass =
  'relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[active-item]:bg-accent data-[active-item]:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50'

function SelectItem({
  className,
  children,
  value,
  disabled,
  ref,
  ...props
}: Omit<React.ComponentProps<'div'>, 'ref'> & {
  value: string
  disabled?: boolean
  ref?: React.Ref<HTMLDivElement>
}) {
  const combobox = Ariakit.useComboboxContext()
  const content = (
    <>
      <span className="flex-1 truncate">{children}</span>
      <Ariakit.SelectItemCheck className="flex size-4 shrink-0 items-center justify-center">
        <Check className="size-4" />
      </Ariakit.SelectItemCheck>
    </>
  )

  // Com combobox, o item recebe foco virtual via ComboboxItem e seleciona via
  // o SelectItem renderizado. Sem combobox, é um SelectItem comum.
  if (combobox) {
    return (
      <Ariakit.ComboboxItem
        ref={ref}
        data-slot="select-item"
        disabled={disabled}
        className={cn(selectItemClass, className)}
        render={<Ariakit.SelectItem value={value} />}
        {...props}
      >
        {content}
      </Ariakit.ComboboxItem>
    )
  }

  return (
    <Ariakit.SelectItem
      ref={ref}
      data-slot="select-item"
      value={value}
      disabled={disabled}
      className={cn(selectItemClass, className)}
      {...props}
    >
      {content}
    </Ariakit.SelectItem>
  )
}

// ---------------------------------------------------------------------------
// SelectEmpty / SelectLoading — estados auxiliares
// ---------------------------------------------------------------------------
function SelectEmpty({
  className,
  children = 'Nada encontrado',
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="select-empty"
      className={cn('py-6 text-center text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SelectLoading({
  className,
  children = 'Carregando...',
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="select-loading"
      className={cn(
        'flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      <Spinner className="size-4" />
      <span>{children}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lista virtualizada (interno) — renderiza só os itens visíveis
// ---------------------------------------------------------------------------
type InternalItem<T> = { id: string; value: string; option: T }

function VirtualSelectBody<T>({
  items,
  itemHeight,
  scrollEl,
  renderRow,
}: {
  items: InternalItem<T>[]
  itemHeight: number
  scrollEl: HTMLDivElement | null
  renderRow: (
    item: InternalItem<T>,
    extra: { ref: (node: Element | null) => void; style: React.CSSProperties } & Record<
      string,
      unknown
    >,
  ) => React.ReactNode
}) {
  // O foco virtual fica no store do combobox (ou no select, como fallback).
  const select = Ariakit.useSelectContext()
  const combobox = Ariakit.useComboboxContext()
  const store = combobox ?? select

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => itemHeight,
    overscan: 12,
  })

  // Mantém o item ativo (foco virtual) montado/visível ao navegar por teclado.
  const activeId = Ariakit.useStoreState(store, 'activeId') as string | null | undefined
  const indexById = React.useMemo(() => {
    const map = new Map<string, number>()
    for (let i = 0; i < items.length; i++) map.set(items[i].id, i)
    return map
  }, [items])

  React.useEffect(() => {
    if (!activeId) return
    const index = indexById.get(activeId)
    if (index != null) virtualizer.scrollToIndex(index, { align: 'auto' })
  }, [activeId, indexById, virtualizer])

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}
    >
      {virtualItems.map((vi) =>
        renderRow(items[vi.index], {
          ref: virtualizer.measureElement,
          'data-index': vi.index,
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${vi.start}px)`,
          },
        }),
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Select (data-driven) — API de alto nível
// ---------------------------------------------------------------------------
export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
  /** Rótulo do grupo (alternativa a `groupBy`). */
  group?: string
  /** Dados livres acessíveis em `renderItem`/`renderValue`. */
  [key: string]: unknown
}

export type SelectProps = {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: React.ReactNode
  disabled?: boolean
  size?: SelectSize
  /** Mostra o campo de busca. */
  searchable?: boolean
  /** Placeholder do campo de busca. */
  searchPlaceholder?: string
  /**
   * Busca controlada/assíncrona: ao informar, o filtro local é desativado e a
   * lista passa a ser controlada por `options`.
   */
  onSearch?: (search: string) => void
  /** Indicador de carregamento ao final da lista. */
  loading?: boolean
  /** Disparado ao chegar perto do fim da rolagem (infinite scroll). */
  onLoadMore?: () => void
  /** Há mais itens para carregar. */
  hasMore?: boolean
  /**
   * Liga a virtualização. Por padrão é automática para listas grandes
   * (> 100 itens). Virtualização e grupos não são combinados (ver docs).
   */
  virtualized?: boolean
  /** Agrupa por uma chave derivada da opção (alternativa a `option.group`). */
  groupBy?: (option: SelectOption) => string
  /** Render custom de cada item. */
  renderItem?: (option: SelectOption) => React.ReactNode
  /** Render custom do valor no trigger. */
  renderValue?: (option: SelectOption) => React.ReactNode
  /** Mensagem quando não há itens. */
  emptyMessage?: React.ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
  /** Rótulo acessível do trigger (use quando não houver `<label>` associado). */
  'aria-label'?: string
}

function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = 'Selecione...',
  disabled,
  size = 'default',
  searchable = false,
  searchPlaceholder,
  onSearch,
  loading = false,
  onLoadMore,
  hasMore = false,
  virtualized,
  groupBy,
  renderItem,
  renderValue,
  emptyMessage,
  triggerClassName,
  contentClassName,
  'aria-label': ariaLabel,
}: SelectProps) {
  // Callback ref + state: o virtualizer precisa do elemento de scroll já no
  // primeiro render em que existe. Como o ref do `SelectList` (pai) só é
  // atribuído após o layout effect do corpo virtual (filho), um `useRef` ficaria
  // `null` na inicialização do virtualizer. O state força o re-render assim que o
  // elemento está disponível.
  const [scrollEl, setScrollEl] = React.useState<HTMLDivElement | null>(null)
  const [search, setSearch] = React.useState('')
  const isAsyncSearch = typeof onSearch === 'function'

  // Itens internos com id determinístico (estável por posição em `options`).
  const allItems = React.useMemo<InternalItem<SelectOption>[]>(
    () =>
      options.map((option, i) => ({
        id: `tds-select-item-${i}`,
        value: option.value,
        option,
      })),
    [options],
  )

  // Registro completo para a navegação por teclado em listas virtualizadas.
  const registry = React.useMemo(
    () => allItems.map(({ id, value: v }) => ({ id, value: v })),
    [allItems],
  )

  // Filtro: local (match-sorter) quando síncrono; controlado quando assíncrono.
  const filteredItems = React.useMemo(() => {
    if (!searchable || isAsyncSearch || !search) return allItems
    return matchSorter(allItems, search, { keys: ['option.label', 'value'] })
  }, [allItems, search, searchable, isAsyncSearch])

  const isVirtualized = virtualized ?? filteredItems.length > 100
  const enableCombobox = searchable || isVirtualized

  // Grupos só no modo não virtualizado.
  const hasGroups =
    !isVirtualized && (groupBy != null || options.some((o) => o.group != null))
  const groups = React.useMemo(() => {
    if (!hasGroups) return []
    const map = new Map<string, InternalItem<SelectOption>[]>()
    for (const item of filteredItems) {
      const key = groupBy ? groupBy(item.option) : (item.option.group ?? '')
      const bucket = map.get(key)
      if (bucket) bucket.push(item)
      else map.set(key, [item])
    }
    return Array.from(map, ([label, items]) => ({ label, items }))
  }, [hasGroups, filteredItems, groupBy])

  const optionByValue = React.useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options],
  )

  const handleSearch = React.useCallback(
    (next: string) => {
      setSearch(next)
      onSearch?.(next)
    },
    [onSearch],
  )

  // Infinite scroll: dispara ao aproximar-se do fim da rolagem.
  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!onLoadMore || !hasMore || loading) return
      const el = event.currentTarget
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 96) onLoadMore()
    },
    [onLoadMore, hasMore, loading],
  )

  const itemHeight = SIZE_ITEM_HEIGHT[size]

  const renderRow = React.useCallback(
    (
      item: InternalItem<SelectOption>,
      extra?: Record<string, unknown>,
    ): React.ReactNode => (
      <SelectItem
        key={item.id}
        id={item.id}
        value={item.value}
        disabled={item.option.disabled}
        {...extra}
      >
        {renderItem ? renderItem(item.option) : item.option.label}
      </SelectItem>
    ),
    [renderItem],
  )

  const isEmpty = filteredItems.length === 0 && !loading

  return (
    <SelectRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      combobox={enableCombobox}
      onSearch={enableCombobox ? handleSearch : undefined}
      items={registry}
      size={size}
      label={ariaLabel}
    >
      <SelectTrigger
        className={triggerClassName}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder}>
          {(v) => {
            const option = optionByValue.get(v)
            if (!option) return v
            return renderValue ? renderValue(option) : option.label
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {searchable && <SelectSearch placeholder={searchPlaceholder} />}
        <SelectList ref={setScrollEl} onScroll={handleScroll}>
          {isEmpty ? (
            <SelectEmpty>{emptyMessage}</SelectEmpty>
          ) : isVirtualized ? (
            <VirtualSelectBody
              items={filteredItems}
              itemHeight={itemHeight}
              scrollEl={scrollEl}
              renderRow={(item, extra) => renderRow(item, extra)}
            />
          ) : hasGroups ? (
            groups.map((group) => (
              <SelectGroup key={group.label} label={group.label}>
                {group.items.map((item) => renderRow(item))}
              </SelectGroup>
            ))
          ) : (
            filteredItems.map((item) => renderRow(item))
          )}
          {loading && <SelectLoading />}
        </SelectList>
      </SelectContent>
    </SelectRoot>
  )
}

export {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectItem,
  SelectList,
  SelectLoading,
  SelectRoot,
  SelectSearch,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
}
