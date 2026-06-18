import * as Ariakit from '@ariakit/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown, Search, X } from 'lucide-react'
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
//      virtualização, grupos, multi-seleção (chips), limpar (`clearable`) e o
//      modo editável (`editable`, autocomplete com texto livre opcional).
//
// Detalhe crítico de a11y: a navegação por teclado em listas virtualizadas só
// funciona com foco virtual (`aria-activedescendant`), fornecido pelo
// `ComboboxProvider`. Por isso a virtualização sempre habilita o combobox,
// mesmo sem campo de busca visível. Além disso, passamos `defaultItems` (lista
// completa com ids determinísticos) aos stores: assim o Ariakit conhece todos
// os itens mesmo os que não estão montados no DOM.
//
// Dois "motores" Ariakit:
//   • Modo padrão (botão): `useSelectStore` é a fonte do valor (string para
//     single, string[] para multi). O `useComboboxStore` entra só como busca/
//     foco virtual. O gatilho é um botão (ou um container quando há chips/clear,
//     pois não se pode aninhar <button> dentro de <button>).
//   • Modo editável (input): `useComboboxStore` com `selectedValue` é a fonte do
//     valor; o gatilho é o próprio input (autocomplete). Suporta texto livre.

const SIZE_ITEM_HEIGHT = { sm: 32, default: 36, lg: 40 } as const

type SelectSize = 'sm' | 'default' | 'lg'

// ---------------------------------------------------------------------------
// Mensagens (i18n) — todos os textos de UI fixos do componente
// ---------------------------------------------------------------------------
// Os defaults são em inglês (DS neutro). Sobrescreva por instância via a prop
// `messages` (merge parcial) para traduzir qualquer texto.
export type SelectMessages = {
  /** Placeholder do campo de busca interno. */
  search: string
  /** Conteúdo exibido quando a lista está vazia. */
  empty: React.ReactNode
  /** Conteúdo do indicador de carregamento. */
  loading: React.ReactNode
  /** Rótulo acessível do botão de limpar. */
  clear: string
  /** Rótulo acessível do "x" de cada chip (recebe o rótulo do item). */
  remove: (label: string) => string
  /** Conteúdo da opção de criar valor livre (recebe o texto digitado). */
  add: (value: string) => React.ReactNode
  /** Rótulo acessível da lista/popover (fallback quando não há `aria-label`). */
  options: string
}

const defaultMessages: SelectMessages = {
  search: 'Search…',
  empty: 'No results',
  loading: 'Loading…',
  clear: 'Clear',
  remove: (label) => `Remove ${label}`,
  add: (value) => <>Add “{value}”</>,
  options: 'Options',
}

// ---------------------------------------------------------------------------
// Contexto interno (compartilha `size`, `multiple` e `messages` entre primitivas)
// ---------------------------------------------------------------------------
type SelectContextValue = {
  size: SelectSize
  label?: string
  multiple?: boolean
  messages: SelectMessages
}
const SelectContext = React.createContext<SelectContextValue>({
  size: 'default',
  messages: defaultMessages,
})
const useSelectContext = () => React.useContext(SelectContext)

// ---------------------------------------------------------------------------
// SelectRoot — cria os stores do Ariakit e provê os contextos
// ---------------------------------------------------------------------------
type SelectRootProps = {
  /** Valor selecionado (controlado). `string[]` quando `multiple`. */
  value?: string | string[]
  /** Valor inicial (não controlado). `string[]` quando `multiple`. */
  defaultValue?: string | string[]
  /** Disparado ao selecionar um item (recebe `string[]` quando `multiple`). */
  onValueChange?: (value: string | string[]) => void
  /** Multi-seleção: o valor passa a ser um array. */
  multiple?: boolean
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
  /** Sobrescritas de texto (i18n) — merge parcial sobre os defaults em inglês. */
  messages?: Partial<SelectMessages>
  children?: React.ReactNode
}

function SelectRoot({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  open,
  defaultOpen,
  onOpenChange,
  combobox = false,
  onSearch,
  items,
  size = 'default',
  label,
  messages,
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

  // Valor inicial coerente com o modo: `[]` para multi, `''` para single. O
  // Ariakit infere multi-seleção pelo tipo do valor (array → multi).
  const emptyValue = multiple ? [] : ''

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
    ...(value !== undefined ? { value } : { defaultValue: defaultValue ?? emptyValue }),
    ...(combobox ? {} : openState),
  })

  const tree = combobox ? (
    <Ariakit.ComboboxProvider store={comboboxStore}>
      <Ariakit.SelectProvider store={selectStore}>{children}</Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  ) : (
    <Ariakit.SelectProvider store={selectStore}>{children}</Ariakit.SelectProvider>
  )

  const mergedMessages = messages ? { ...defaultMessages, ...messages } : defaultMessages

  return (
    <SelectContext.Provider value={{ size, label, multiple, messages: mergedMessages }}>
      {tree}
    </SelectContext.Provider>
  )
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
  clearSlot,
  countSlot,
  ...props
}: React.ComponentProps<typeof Ariakit.Select> &
  VariantProps<typeof selectTriggerVariants> & {
    /** Controle de limpar, renderizado à esquerda do chevron (ver `SelectClear`). */
    clearSlot?: React.ReactNode
    /** Contador "N / max", renderizado à esquerda do clear (ver `maxCount`). */
    countSlot?: React.ReactNode
  }) {
  const ctx = useSelectContext()
  const resolvedSize = size ?? ctx.size

  // Quando há chips (multi) ou um controle de limpar, o gatilho precisa conter
  // <button>s (o "x" dos chips/clear). Como não se pode aninhar <button> dentro
  // de <button>, renderizamos o `Ariakit.Select` como um <div> (ele mantém o
  // papel de disclosure) e os controles ficam como irmãos do conteúdo.
  const asContainer = Boolean(ctx.multiple || clearSlot || countSlot)

  if (!asContainer) {
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

  return (
    <Ariakit.Select
      render={<div />}
      data-slot="select-trigger"
      data-size={resolvedSize}
      // `h-auto`/`min-h-*` substituem a altura fixa: chips podem quebrar linha.
      className={cn(
        selectTriggerVariants({ size: resolvedSize }),
        'h-auto min-h-9 cursor-default flex-wrap gap-1.5 py-1 data-[size=sm]:min-h-8 data-[size=lg]:min-h-10',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">{children}</div>
      {countSlot}
      {clearSlot}
      <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
    </Ariakit.Select>
  )
}

// ---------------------------------------------------------------------------
// SelectChip / SelectClear — controles internos do gatilho (multi e clearable)
// ---------------------------------------------------------------------------
// Ambos param a propagação no `pointerdown`: o Ariakit abre/foca o popover no
// pointerdown, então interceptamos antes para que clicar no "x" não abra a lista.
function stopTriggerOpen(event: React.PointerEvent) {
  event.stopPropagation()
  event.preventDefault()
}

function SelectChip({
  children,
  onRemove,
  removeLabel,
}: {
  children: React.ReactNode
  onRemove?: () => void
  removeLabel: string
}) {
  return (
    <span
      data-slot="select-chip"
      className="inline-flex max-w-[12rem] items-center gap-1 rounded-sm bg-muted py-0.5 pr-0.5 pl-1.5 text-xs font-medium text-foreground"
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          data-slot="select-chip-remove"
          aria-label={removeLabel}
          className="flex size-4 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onPointerDown={stopTriggerOpen}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}

function SelectClear({
  onClear,
  label = 'Clear',
}: {
  onClear: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      data-slot="select-clear"
      aria-label={label}
      className="flex size-5 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onPointerDown={stopTriggerOpen}
      onClick={(event) => {
        event.stopPropagation()
        onClear()
      }}
    >
      <X className="size-4" aria-hidden="true" />
    </button>
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
// SelectChipsValue — exibe a seleção múltipla como chips (com resumo "+N")
// ---------------------------------------------------------------------------
// Lê o valor (array) direto do store do Select e renderiza até `maxDisplayChips`
// chips; o excedente vira um "+N". Cada chip remove o item via `store.setValue`.
function SelectChipsValue({
  optionByValue,
  renderValue,
  placeholder,
  maxDisplayChips = 3,
}: {
  optionByValue: Map<string, SelectOption>
  renderValue?: (option: SelectOption) => React.ReactNode
  placeholder?: React.ReactNode
  maxDisplayChips?: number
}) {
  const { messages } = useSelectContext()
  const store = Ariakit.useSelectContext()
  const value = (Ariakit.useStoreState(store, 'value') ?? []) as string[]

  if (value.length === 0) {
    return <span className="truncate text-muted-foreground">{placeholder}</span>
  }

  const shown = value.slice(0, maxDisplayChips)
  const extra = value.length - shown.length

  return (
    <>
      {shown.map((v) => {
        const option = optionByValue.get(v)
        const content = option ? (renderValue ? renderValue(option) : option.label) : v
        const text = option?.label ?? v
        return (
          <SelectChip
            key={v}
            removeLabel={messages.remove(text)}
            onRemove={() =>
              store?.setValue((prev) => (prev as string[]).filter((item) => item !== v))
            }
          >
            {content}
          </SelectChip>
        )
      })}
      {extra > 0 && (
        <span className="px-0.5 text-xs font-medium text-muted-foreground">+{extra}</span>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// SelectClearControl — botão de limpar; só aparece quando há seleção
// ---------------------------------------------------------------------------
function SelectClearControl({ multiple }: { multiple?: boolean }) {
  const { messages } = useSelectContext()
  const store = Ariakit.useSelectContext()
  const value = Ariakit.useStoreState(store, 'value')
  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value != null && value !== ''
  if (!hasValue) return null
  return (
    <SelectClear
      label={messages.clear}
      onClear={() => store?.setValue(multiple ? [] : '')}
    />
  )
}

// ---------------------------------------------------------------------------
// SelectCountControl — contador "N / max" (multi com `maxCount`)
// ---------------------------------------------------------------------------
function SelectCountControl({ maxCount }: { maxCount: number }) {
  const store = Ariakit.useSelectContext()
  const value = (Ariakit.useStoreState(store, 'value') ?? []) as string[]
  return (
    <span
      data-slot="select-count"
      className="shrink-0 px-0.5 text-xs tabular-nums text-muted-foreground"
    >
      {value.length} / {maxCount}
    </span>
  )
}

// SelectItem que respeita o limite `maxCount`: lê a seleção do store e desabilita
// a opção (quando ainda não selecionada) ao atingir o teto.
function LimitedSelectItem({
  value,
  disabled,
  maxCount,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'ref'> & {
  value: string
  disabled?: boolean
  maxCount: number
}) {
  const store = Ariakit.useSelectContext()
  const selected = (Ariakit.useStoreState(store, 'value') ?? []) as string[]
  const reached = selected.length >= maxCount
  const blocked = reached && !selected.includes(value)
  return (
    <SelectItem value={value} disabled={disabled || blocked} {...props}>
      {children}
    </SelectItem>
  )
}

// ---------------------------------------------------------------------------
// SelectContent — popover (portal) que envolve a busca e a lista
// ---------------------------------------------------------------------------
// Classes compartilhadas entre o popover do Select (`SelectPopover`) e o do
// modo editável (`ComboboxPopover`). Fallback de 24rem na var do Ariakit (só
// definida no browser real): sem ele, `min(24rem, var(--undefined))` é inválido
// e o popover cresce.
const popoverClass =
  'z-50 flex max-h-[min(24rem,var(--popover-available-height,24rem))] origin-(--popover-transform-origin) flex-col overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md'
const listClass = 'max-h-72 overflow-y-auto overflow-x-hidden p-1'

function SelectContent({
  className,
  children,
  gutter = 4,
  sameWidth = true,
  ...props
}: React.ComponentProps<typeof Ariakit.SelectPopover>) {
  const { label, messages } = useSelectContext()
  return (
    <Ariakit.SelectPopover
      aria-label={label ?? messages.options}
      data-slot="select-content"
      gutter={gutter}
      sameWidth={sameWidth}
      // Sem `unmountOnHide`: o popover permanece montado (oculto) quando fechado,
      // assim o `aria-controls` do trigger sempre referencia um elemento
      // existente em qualquer estado. (O axe ainda marca `aria-controls` +
      // `aria-haspopup` como "needs review"/inconclusive — falso-positivo
      // conhecido do padrão combobox, não é uma violação.)
      className={cn(popoverClass, className)}
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
  placeholder,
  ...props
}: React.ComponentProps<typeof Ariakit.Combobox>) {
  const combobox = Ariakit.useComboboxContext()
  const { label, messages } = useSelectContext()
  if (!combobox) return null
  return (
    <div
      data-slot="select-search"
      className="flex items-center gap-2 border-b border-border px-3"
    >
      <Search className="size-4 shrink-0 opacity-50" aria-hidden="true" />
      <Ariakit.Combobox
        aria-label={label ? `${messages.search} ${label}` : messages.search}
        autoSelect
        placeholder={placeholder ?? messages.search}
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
  const { label, messages } = useSelectContext()
  const Comp = combobox ? Ariakit.ComboboxList : Ariakit.SelectList
  return (
    <Comp
      ref={ref}
      aria-label={label ?? messages.options}
      data-slot="select-list"
      className={cn(listClass, className)}
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
function SelectEmpty({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { messages } = useSelectContext()
  return (
    <div
      data-slot="select-empty"
      className={cn('py-6 text-center text-sm text-muted-foreground', className)}
      {...props}
    >
      {children ?? messages.empty}
    </div>
  )
}

function SelectLoading({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { messages } = useSelectContext()
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
      <span>{children ?? messages.loading}</span>
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

/** Props comuns a single e multi. */
type SelectBaseProps = {
  options: SelectOption[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: React.ReactNode
  disabled?: boolean
  size?: SelectSize
  /** Mostra o campo de busca. */
  searchable?: boolean
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
  /** Exibe um botão de limpar (`x`) no trigger quando há seleção. */
  clearable?: boolean
  /** Multi: nº de chips exibidos antes de resumir em "+N" (padrão 3). */
  maxDisplayChips?: number
  /**
   * Multi: nº máximo de itens selecionáveis. Ao atingir o limite, as opções
   * não selecionadas ficam desabilitadas e um contador "N / max" aparece no
   * trigger.
   */
  maxCount?: number
  /**
   * Gatilho editável (autocomplete): o campo vira um input no qual se digita
   * diretamente para filtrar. Usa o motor de combobox do Ariakit.
   */
  editable?: boolean
  /**
   * Modo editável: aceita um valor digitado que não está na lista (Enter/clique
   * em "Adicionar …" cria o valor). Só tem efeito com `editable`.
   */
  allowCustomValue?: boolean
  /**
   * Sobrescritas de texto (i18n). Merge parcial sobre os defaults em inglês —
   * traduza só o que precisar: `messages={{ add: (v) => `Adicionar “${v}”` }}`.
   */
  messages?: Partial<SelectMessages>
  className?: string
  triggerClassName?: string
  contentClassName?: string
  /** Rótulo acessível do trigger (use quando não houver `<label>` associado). */
  'aria-label'?: string
}

/** Variante single: valor é uma `string`. */
type SelectSingleProps = {
  multiple?: false
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/** Variante multi: valor é um `string[]` e o trigger exibe chips. */
type SelectMultipleProps = {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type SelectProps = SelectBaseProps & (SelectSingleProps | SelectMultipleProps)

// Tipo interno (amplo): a impl trata o valor como `string | string[]`; a união
// pública acima é quem garante a tipagem correta por `multiple` no consumo.
type InternalSelectProps = SelectBaseProps & {
  multiple?: boolean
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

function StandardSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = 'Select…',
  disabled,
  size = 'default',
  searchable = false,
  onSearch,
  loading = false,
  onLoadMore,
  hasMore = false,
  virtualized,
  groupBy,
  renderItem,
  renderValue,
  clearable = false,
  maxDisplayChips = 3,
  maxCount,
  messages,
  triggerClassName,
  contentClassName,
  'aria-label': ariaLabel,
}: InternalSelectProps) {
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

  // Com `maxCount` (multi), a opção precisa reagir à seleção para desabilitar ao
  // atingir o teto — daí o `LimitedSelectItem`, que assina o store.
  const limited = multiple && maxCount != null
  const renderRow = React.useCallback(
    (
      item: InternalItem<SelectOption>,
      extra?: Record<string, unknown>,
    ): React.ReactNode =>
      limited ? (
        <LimitedSelectItem
          key={item.id}
          id={item.id}
          value={item.value}
          disabled={item.option.disabled}
          maxCount={maxCount as number}
          {...extra}
        >
          {renderItem ? renderItem(item.option) : item.option.label}
        </LimitedSelectItem>
      ) : (
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
    [renderItem, limited, maxCount],
  )

  const isEmpty = filteredItems.length === 0 && !loading

  return (
    <SelectRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      multiple={multiple}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      combobox={enableCombobox}
      onSearch={enableCombobox ? handleSearch : undefined}
      items={registry}
      size={size}
      label={ariaLabel}
      messages={messages}
    >
      <SelectTrigger
        className={triggerClassName}
        disabled={disabled}
        aria-label={ariaLabel}
        countSlot={
          multiple && maxCount != null ? (
            <SelectCountControl maxCount={maxCount} />
          ) : undefined
        }
        clearSlot={clearable ? <SelectClearControl multiple={multiple} /> : undefined}
      >
        {multiple ? (
          <SelectChipsValue
            optionByValue={optionByValue}
            renderValue={renderValue}
            placeholder={placeholder}
            maxDisplayChips={maxDisplayChips}
          />
        ) : (
          <SelectValue placeholder={placeholder}>
            {(v) => {
              const option = optionByValue.get(v)
              if (!option) return v
              return renderValue ? renderValue(option) : option.label
            }}
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {searchable && <SelectSearch />}
        <SelectList ref={setScrollEl} onScroll={handleScroll}>
          {isEmpty ? (
            <SelectEmpty />
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

// ---------------------------------------------------------------------------
// Modo editável (autocomplete) — motor `ComboboxStore` com `selectedValue`
// ---------------------------------------------------------------------------
// Aqui o gatilho é o próprio input (`Ariakit.Combobox`) e a fonte do valor é o
// `selectedValue` do combobox (não há `SelectStore`). Cobre single/multi, limpar
// e — via `allowCustomValue` — aceitar texto fora da lista.

// Chips do modo editável (leem `selectedValue` do ComboboxStore).
function EditableChips({
  optionByValue,
  renderValue,
  maxDisplayChips = 3,
}: {
  optionByValue: Map<string, SelectOption>
  renderValue?: (option: SelectOption) => React.ReactNode
  maxDisplayChips?: number
}) {
  const { messages } = useSelectContext()
  const store = Ariakit.useComboboxContext()
  const selected = (Ariakit.useStoreState(store, 'selectedValue') ?? []) as string[]
  if (selected.length === 0) return null
  const shown = selected.slice(0, maxDisplayChips)
  const extra = selected.length - shown.length
  return (
    <>
      {shown.map((v) => {
        const option = optionByValue.get(v)
        const content = option ? (renderValue ? renderValue(option) : option.label) : v
        const text = option?.label ?? v
        return (
          <SelectChip
            key={v}
            removeLabel={messages.remove(text)}
            onRemove={() =>
              store?.setSelectedValue((prev) =>
                (prev as string[]).filter((item) => item !== v),
              )
            }
          >
            {content}
          </SelectChip>
        )
      })}
      {extra > 0 && (
        <span className="px-0.5 text-xs font-medium text-muted-foreground">+{extra}</span>
      )}
    </>
  )
}

// Botão de limpar do modo editável.
function EditableClear({ multiple }: { multiple?: boolean }) {
  const { messages } = useSelectContext()
  const store = Ariakit.useComboboxContext()
  const selected = Ariakit.useStoreState(store, 'selectedValue')
  const hasValue = multiple
    ? Array.isArray(selected) && selected.length > 0
    : selected != null && selected !== ''
  if (!hasValue) return null
  return (
    <SelectClear
      label={messages.clear}
      onClear={() => {
        store?.setSelectedValue(multiple ? [] : '')
        store?.setValue('')
      }}
    />
  )
}

// Opção do modo editável: ComboboxItem que adiciona ao `selectedValue` (não joga
// o texto no input) e mostra o check via `ComboboxItemCheck`.
function EditableItem({
  value,
  disabled,
  multiple,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'ref'> & {
  value: string
  disabled?: boolean
  multiple?: boolean
}) {
  return (
    <Ariakit.ComboboxItem
      value={value}
      disabled={disabled}
      selectValueOnClick
      setValueOnClick={false}
      hideOnClick={!multiple}
      resetValueOnSelect={multiple}
      focusOnHover
      data-slot="select-item"
      className={selectItemClass}
      {...props}
    >
      <span className="flex-1 truncate">{children}</span>
      <Ariakit.ComboboxItemCheck className="flex size-4 shrink-0 items-center justify-center">
        <Check className="size-4" />
      </Ariakit.ComboboxItemCheck>
    </Ariakit.ComboboxItem>
  )
}

// Contador "N / max" do modo editável.
function EditableCountControl({ maxCount }: { maxCount: number }) {
  const store = Ariakit.useComboboxContext()
  const selected = (Ariakit.useStoreState(store, 'selectedValue') ?? []) as string[]
  return (
    <span
      data-slot="select-count"
      className="shrink-0 px-0.5 text-xs tabular-nums text-muted-foreground"
    >
      {selected.length} / {maxCount}
    </span>
  )
}

// EditableItem que respeita `maxCount`: desabilita a opção não selecionada ao
// atingir o teto.
function LimitedEditableItem({
  value,
  disabled,
  maxCount,
  multiple,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'ref'> & {
  value: string
  disabled?: boolean
  maxCount: number
  multiple?: boolean
}) {
  const store = Ariakit.useComboboxContext()
  const selected = (Ariakit.useStoreState(store, 'selectedValue') ?? []) as string[]
  const reached = selected.length >= maxCount
  const blocked = reached && !selected.includes(value)
  return (
    <EditableItem
      value={value}
      disabled={disabled || blocked}
      multiple={multiple}
      {...props}
    >
      {children}
    </EditableItem>
  )
}

function EditableSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = 'Select…',
  disabled,
  size = 'default',
  onSearch,
  loading = false,
  onLoadMore,
  hasMore = false,
  groupBy,
  renderItem,
  renderValue,
  clearable = false,
  maxDisplayChips = 3,
  maxCount,
  allowCustomValue = false,
  messages,
  triggerClassName,
  contentClassName,
  'aria-label': ariaLabel,
}: InternalSelectProps) {
  const mergedMessages = messages ? { ...defaultMessages, ...messages } : defaultMessages
  // Âncora do popover: o container do gatilho (não o input). Sem isto, o popover
  // ancoraria no `Ariakit.Combobox`, que encolhe conforme os chips crescem —
  // deslocando e estreitando a lista a cada item selecionado.
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearch] = React.useState('')
  const isAsyncSearch = typeof onSearch === 'function'

  const allItems = React.useMemo<InternalItem<SelectOption>[]>(
    () =>
      options.map((option, i) => ({
        id: `tds-select-item-${i}`,
        value: option.value,
        option,
      })),
    [options],
  )
  const registry = React.useMemo(
    () => allItems.map(({ id, value: v }) => ({ id, value: v })),
    [allItems],
  )

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

  // O store do combobox tipa `selectedValue` como `string | readonly string[]`;
  // normalizamos para o array mutável que a API pública expõe.
  const handleSelectedChange = React.useCallback(
    (next: string | readonly string[]) =>
      onValueChange?.(Array.isArray(next) ? [...next] : (next as string)),
    [onValueChange],
  )

  const openState =
    open !== undefined
      ? { open, setOpen: onOpenChange }
      : defaultOpen !== undefined
        ? { defaultOpen, setOpen: onOpenChange }
        : { setOpen: onOpenChange }

  const comboboxStore = Ariakit.useComboboxStore({
    defaultItems: registry,
    setValue: handleSearch,
    setSelectedValue: handleSelectedChange,
    ...(value !== undefined
      ? { selectedValue: value }
      : { defaultSelectedValue: defaultValue ?? (multiple ? [] : '') }),
    ...openState,
  })

  const selectedValue = Ariakit.useStoreState(comboboxStore, 'selectedValue')
  const isOpen = Ariakit.useStoreState(comboboxStore, 'open')

  // Seleção atual como array (cobre single, multi e valores livres já escolhidos).
  const selectedArray = Array.isArray(selectedValue)
    ? (selectedValue as string[])
    : selectedValue
      ? [selectedValue as string]
      : []

  // Valores livres já selecionados (não presentes em `options`) viram itens
  // "temporários" da lista: aparecem como opção com check e desaparecem quando
  // desmarcados — espelhando o registro oficial de opções.
  const customItems: InternalItem<SelectOption>[] = selectedArray
    .filter((v) => !optionByValue.has(v))
    .map((v) => ({
      id: `tds-select-custom-${v}`,
      value: v,
      option: { value: v, label: v },
    }))
  const combinedItems = customItems.length > 0 ? [...allItems, ...customItems] : allItems

  const filteredItems =
    isAsyncSearch || !search
      ? combinedItems
      : matchSorter(combinedItems, search, { keys: ['option.label', 'value'] })

  // Sincroniza o texto do input quando o popover está fechado: no single mostra
  // o rótulo selecionado; no multi limpa (a seleção fica nos chips). Enquanto
  // aberto, o input é livre para digitar/filtrar.
  React.useEffect(() => {
    if (isOpen) return
    if (multiple) {
      comboboxStore.setValue('')
      return
    }
    const sv = (selectedValue ?? '') as string
    comboboxStore.setValue(sv ? (optionByValue.get(sv)?.label ?? sv) : '')
  }, [isOpen, multiple, selectedValue, optionByValue, comboboxStore])

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!onLoadMore || !hasMore || loading) return
      const el = event.currentTarget
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 96) onLoadMore()
    },
    [onLoadMore, hasMore, loading],
  )

  const hasGroups = groupBy != null || options.some((o) => o.group != null)
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

  const limited = multiple && maxCount != null
  const renderRow = (item: InternalItem<SelectOption>) =>
    limited ? (
      <LimitedEditableItem
        key={item.id}
        id={item.id}
        value={item.value}
        disabled={item.option.disabled}
        maxCount={maxCount as number}
        multiple={multiple}
      >
        {renderItem ? renderItem(item.option) : item.option.label}
      </LimitedEditableItem>
    ) : (
      <EditableItem
        key={item.id}
        id={item.id}
        value={item.value}
        disabled={item.option.disabled}
        multiple={multiple}
      >
        {renderItem ? renderItem(item.option) : item.option.label}
      </EditableItem>
    )

  // Texto livre: oferece "Adicionar …" quando há busca sem correspondência exata.
  // Considera tanto as `options` quanto os valores já selecionados — senão um
  // valor livre já escolhido reapareceria como "Adicionar" e o clique o removeria
  // (toggle) com um rótulo enganoso.
  const trimmed = search.trim()
  const hasExactMatch =
    options.some((o) => o.value === trimmed || o.label === trimmed) ||
    selectedArray.includes(trimmed)
  const showCreate = allowCustomValue && trimmed.length > 0 && !hasExactMatch
  const isEmpty = filteredItems.length === 0 && !loading && !showCreate

  // `placeholder` da API é ReactNode, mas o atributo do input só aceita string.
  // No multi, some quando já há chips para não competir com a seleção.
  const placeholderText = typeof placeholder === 'string' ? placeholder : undefined
  const hasSelection = selectedArray.length > 0
  const inputPlaceholder = multiple && hasSelection ? undefined : placeholderText

  return (
    <SelectContext.Provider
      value={{ size, label: ariaLabel, multiple, messages: mergedMessages }}
    >
      <Ariakit.ComboboxProvider store={comboboxStore}>
        <div
          ref={anchorRef}
          data-slot="select-trigger"
          data-size={size}
          className={cn(
            selectTriggerVariants({ size }),
            'h-auto min-h-9 flex-wrap gap-1.5 py-1 data-[size=sm]:min-h-8 data-[size=lg]:min-h-10',
            disabled && 'cursor-not-allowed opacity-50',
            triggerClassName,
          )}
        >
          {multiple && (
            <EditableChips
              optionByValue={optionByValue}
              renderValue={renderValue}
              maxDisplayChips={maxDisplayChips}
            />
          )}
          <Ariakit.Combobox
            data-slot="select-input"
            aria-label={ariaLabel}
            disabled={disabled}
            autoSelect
            placeholder={inputPlaceholder}
            className="min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {multiple && maxCount != null && <EditableCountControl maxCount={maxCount} />}
          {clearable && <EditableClear multiple={multiple} />}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            data-slot="select-disclosure"
            className="flex size-5 shrink-0 items-center justify-center"
            onClick={() => comboboxStore.setOpen(!isOpen)}
          >
            <ChevronDown className="size-4 opacity-50" aria-hidden="true" />
          </button>
        </div>
        <Ariakit.ComboboxPopover
          aria-label={ariaLabel ?? mergedMessages.options}
          data-slot="select-content"
          gutter={4}
          sameWidth
          unmountOnHide={false}
          getAnchorRect={() => anchorRef.current?.getBoundingClientRect() ?? null}
          className={cn(popoverClass, contentClassName)}
        >
          <SelectList onScroll={handleScroll}>
            {isEmpty ? (
              <SelectEmpty />
            ) : hasGroups ? (
              groups.map((group) => (
                <SelectGroup key={group.label} label={group.label}>
                  {group.items.map(renderRow)}
                </SelectGroup>
              ))
            ) : (
              filteredItems.map(renderRow)
            )}
            {showCreate && (
              <EditableItem value={trimmed} multiple={multiple}>
                {mergedMessages.add(trimmed)}
              </EditableItem>
            )}
            {loading && <SelectLoading />}
          </SelectList>
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </SelectContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Select — ponto de entrada público; despacha entre o modo padrão e o editável
// ---------------------------------------------------------------------------
function Select(props: SelectProps) {
  if ((props as InternalSelectProps).editable) {
    return <EditableSelect {...(props as InternalSelectProps)} />
  }
  return <StandardSelect {...(props as InternalSelectProps)} />
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
