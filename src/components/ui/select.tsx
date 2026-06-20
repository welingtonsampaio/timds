import * as Ariakit from '@ariakit/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { matchSorter } from 'match-sorter'
import * as React from 'react'

import { Spinner } from '@/components/ui/spinner'
import { ariaInvalid, disabledControl, focusRing, svgIcon } from '@/lib/styles'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------
// `Select` is an advanced combobox/select built on top of Ariakit (a11y
// WAI-ARIA APG, virtual focus via `aria-activedescendant`) and
// `@tanstack/react-virtual` (virtualization). It does not use the native
// `<select>`.
//
// There are two API layers:
//   1. Composable primitives (`SelectRoot`, `SelectTrigger`, `SelectContent`,
//      `SelectItem`, ...) for advanced cases.
//   2. A data-driven `Select` component (props `options`, `loadOptions`, ...)
//      built on top of the primitives, covering search, async, infinite scroll,
//      virtualization, groups, multi-selection (chips), clearing (`clearable`)
//      and the editable mode (`editable`, autocomplete with optional free text).
//
// Critical a11y detail: keyboard navigation in virtualized lists only works
// with virtual focus (`aria-activedescendant`), provided by the
// `ComboboxProvider`. That is why virtualization always enables the combobox,
// even without a visible search field. In addition, we pass `defaultItems` (the
// complete list with deterministic ids) to the stores: this way Ariakit knows
// all items even those that are not mounted in the DOM.
//
// Two Ariakit "engines":
//   • Default mode (button): `useSelectStore` is the source of the value
//     (string for single, string[] for multi). `useComboboxStore` only comes in
//     as search/virtual focus. The trigger is a button (or a container when
//     there are chips/clear, since you cannot nest <button> inside <button>).
//   • Editable mode (input): `useComboboxStore` with `selectedValue` is the
//     source of the value; the trigger is the input itself (autocomplete).
//     Supports free text.

const SIZE_ITEM_HEIGHT = { sm: 32, default: 36, lg: 40 } as const

type SelectSize = 'sm' | 'default' | 'lg'

// ---------------------------------------------------------------------------
// Messages (i18n) — all of the component's fixed UI texts
// ---------------------------------------------------------------------------
// The defaults are in English (neutral DS). Override per instance via the
// `messages` prop (partial merge) to translate any text.
export type SelectMessages = {
  /** Placeholder of the internal search field. */
  search: string
  /** Content displayed when the list is empty. */
  empty: React.ReactNode
  /** Content of the loading indicator. */
  loading: React.ReactNode
  /** Accessible label of the clear button. */
  clear: string
  /** Accessible label of each chip's "x" (receives the item label). */
  remove: (label: string) => string
  /** Content of the create-free-value option (receives the typed text). */
  add: (value: string) => React.ReactNode
  /** Accessible label of the list/popover (fallback when there is no `aria-label`). */
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
// Internal context (shares `size`, `multiple` and `messages` across primitives)
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
// SelectRoot — creates the Ariakit stores and provides the contexts
// ---------------------------------------------------------------------------
type SelectRootProps = {
  /** Selected value (controlled). `string[]` when `multiple`. */
  value?: string | string[]
  /** Initial value (uncontrolled). `string[]` when `multiple`. */
  defaultValue?: string | string[]
  /** Fired when selecting an item (receives `string[]` when `multiple`). */
  onValueChange?: (value: string | string[]) => void
  /** Multi-selection: the value becomes an array. */
  multiple?: boolean
  /** Open state of the popover (controlled). */
  open?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
  /** Fired when the popover opens/closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Enables the combobox (search and virtual focus). Required for
   * virtualization, so it is turned on automatically when there is search or
   * virtualization.
   */
  combobox?: boolean
  /** Fired when the search text changes (receives the typed value). */
  onSearch?: (search: string) => void
  /**
   * Complete registry of items (`{ id, value }`) used so that keyboard
   * navigation works with virtualized (unmounted) items.
   */
  items?: Array<{ id: string; value: string }>
  size?: SelectSize
  /** Base accessible label, inherited by the search and the list. */
  label?: string
  /** Text overrides (i18n) — partial merge over the English defaults. */
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
  // Open state: Ariakit does not allow combining the controlled prop and the
  // `default*` one (even `undefined`); we only pass one of the pair's keys. When
  // there is a combobox, the open state is shared and must be managed by the
  // combobox store — passing it to the select store conflicts with the
  // `combobox` store prop.
  const openState =
    open !== undefined
      ? { open, setOpen: onOpenChange }
      : defaultOpen !== undefined
        ? { defaultOpen, setOpen: onOpenChange }
        : { setOpen: onOpenChange }

  // Initial value consistent with the mode: `[]` for multi, `''` for single.
  // Ariakit infers multi-selection from the value type (array → multi).
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
// SelectTrigger — button that opens the popover (visually aligned with Input)
// ---------------------------------------------------------------------------
const selectTriggerVariants = cva(
  [
    // Base: mirrors the Input (border, shadow, focus) and lays out value + chevron.
    'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30',
    focusRing,
    disabledControl,
    ariaInvalid,
    svgIcon,
  ],
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
    /** Clear control, rendered to the left of the chevron (see `SelectClear`). */
    clearSlot?: React.ReactNode
    /** "N / max" counter, rendered to the left of the clear (see `maxCount`). */
    countSlot?: React.ReactNode
  }) {
  const ctx = useSelectContext()
  const resolvedSize = size ?? ctx.size

  // When there are chips (multi) or a clear control, the trigger needs to
  // contain <button>s (the "x" of the chips/clear). Since you cannot nest
  // <button> inside <button>, we render the `Ariakit.Select` as a <div> (it
  // keeps the disclosure role) and the controls become siblings of the content.
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
      // `h-auto`/`min-h-*` replace the fixed height: chips may wrap to a new line.
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
// SelectChip / SelectClear — internal trigger controls (multi and clearable)
// ---------------------------------------------------------------------------
// Both stop propagation on `pointerdown`: Ariakit opens/focuses the popover on
// pointerdown, so we intercept beforehand so that clicking the "x" does not open
// the list.
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
// SelectValue — shows the selected value (or the placeholder)
// ---------------------------------------------------------------------------
function SelectValue({
  className,
  placeholder,
  children,
}: {
  className?: string
  placeholder?: React.ReactNode
  /** Custom content; as a function it receives the selected value. */
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
// SelectChipsValue — displays the multiple selection as chips (with a "+N" summary)
// ---------------------------------------------------------------------------
// Reads the value (array) directly from the Select store and renders up to
// `maxDisplayChips` chips; the overflow becomes a "+N". Each chip removes the
// item via `store.setValue`.
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
// SelectClearControl — clear button; only appears when there is a selection
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
// SelectCountControl — "N / max" counter (multi with `maxCount`)
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

// SelectItem that respects the `maxCount` limit: reads the selection from the
// store and disables the option (when not yet selected) once the cap is reached.
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
// SelectContent — popover (portal) that wraps the search and the list
// ---------------------------------------------------------------------------
// Classes shared between the Select popover (`SelectPopover`) and the editable
// mode one (`ComboboxPopover`). 24rem fallback on the Ariakit var (only defined
// in a real browser): without it, `min(24rem, var(--undefined))` is invalid and
// the popover grows.
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
      // No `unmountOnHide`: the popover stays mounted (hidden) when closed, so
      // the trigger's `aria-controls` always references an existing element in
      // any state. (axe still flags `aria-controls` + `aria-haspopup` as "needs
      // review"/inconclusive — a known false positive of the combobox pattern,
      // not a violation.)
      className={cn(popoverClass, className)}
      {...props}
    >
      {children}
    </Ariakit.SelectPopover>
  )
}

// ---------------------------------------------------------------------------
// SelectSearch — search field (combobox). Only inside a ComboboxProvider.
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
// SelectList — scrollable list container (uses Combobox/Select per the mode)
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
// SelectGroup — labeled grouping
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
      // Subtle separator between groups (except the first) reinforces the division.
      className={cn(
        'py-1 not-first:mt-1 not-first:border-t not-first:border-border',
        className,
      )}
      {...props}
    >
      {label != null && (
        // Section header: uppercase + weight + tracking and pinned to the top
        // (sticky) with the popover background, to highlight the group while scrolling.
        <LabelComp className="sticky top-0 z-10 bg-popover px-2 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </LabelComp>
      )}
      {children}
    </GroupComp>
  )
}

// ---------------------------------------------------------------------------
// SelectItem — option. Combines ComboboxItem (virtual focus) + SelectItem (selection)
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

  // With combobox, the item receives virtual focus via ComboboxItem and selects
  // via the rendered SelectItem. Without combobox, it is a plain SelectItem.
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
// SelectEmpty / SelectLoading — auxiliary states
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
// Virtualized list (internal) — renders only the visible items
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
  // Virtual focus lives in the combobox store (or the select store, as a fallback).
  const select = Ariakit.useSelectContext()
  const combobox = Ariakit.useComboboxContext()
  const store = combobox ?? select

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => itemHeight,
    overscan: 12,
  })

  // Keeps the active item (virtual focus) mounted/visible while navigating by keyboard.
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
// Select (data-driven) — high-level API
// ---------------------------------------------------------------------------
export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
  /** Group label (alternative to `groupBy`). */
  group?: string
  /** Free-form data accessible in `renderItem`/`renderValue`. */
  [key: string]: unknown
}

/** Props common to single and multi. */
type SelectBaseProps = {
  options: SelectOption[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: React.ReactNode
  disabled?: boolean
  size?: SelectSize
  /** Shows the search field. */
  searchable?: boolean
  /**
   * Controlled/async search: when provided, the local filter is disabled and the
   * list becomes controlled by `options`.
   */
  onSearch?: (search: string) => void
  /** Loading indicator at the end of the list. */
  loading?: boolean
  /** Fired when getting close to the end of the scroll (infinite scroll). */
  onLoadMore?: () => void
  /** Whether there are more items to load. */
  hasMore?: boolean
  /**
   * Turns on virtualization. By default it is automatic for large lists
   * (> 100 items). Virtualization and groups are not combined (see docs).
   */
  virtualized?: boolean
  /** Groups by a key derived from the option (alternative to `option.group`). */
  groupBy?: (option: SelectOption) => string
  /** Custom render of each item. */
  renderItem?: (option: SelectOption) => React.ReactNode
  /** Custom render of the value in the trigger. */
  renderValue?: (option: SelectOption) => React.ReactNode
  /** Shows a clear button (`x`) in the trigger when there is a selection. */
  clearable?: boolean
  /** Multi: number of chips shown before summarizing into "+N" (default 3). */
  maxDisplayChips?: number
  /**
   * Multi: maximum number of selectable items. Once the limit is reached, the
   * unselected options become disabled and a "N / max" counter appears in the
   * trigger.
   */
  maxCount?: number
  /**
   * Editable trigger (autocomplete): the field becomes an input you type into
   * directly to filter. Uses Ariakit's combobox engine.
   */
  editable?: boolean
  /**
   * Editable mode: accepts a typed value that is not in the list (Enter/clicking
   * "Add …" creates the value). Only takes effect with `editable`.
   */
  allowCustomValue?: boolean
  /**
   * Text overrides (i18n). Partial merge over the English defaults —
   * translate only what you need: `messages={{ add: (v) => `Add “${v}”` }}`.
   */
  messages?: Partial<SelectMessages>
  className?: string
  triggerClassName?: string
  contentClassName?: string
  /** Accessible label of the trigger (use when there is no associated `<label>`). */
  'aria-label'?: string
}

/** Single variant: value is a `string`. */
type SelectSingleProps = {
  multiple?: false
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/** Multi variant: value is a `string[]` and the trigger displays chips. */
type SelectMultipleProps = {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type SelectProps = SelectBaseProps & (SelectSingleProps | SelectMultipleProps)

// Internal (wide) type: the impl treats the value as `string | string[]`; the
// public union above is what guarantees the correct typing by `multiple` at the
// consumption site.
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
  // Callback ref + state: the virtualizer needs the scroll element on the very
  // first render where it exists. Since the `SelectList` (parent) ref is only
  // assigned after the virtual body (child) layout effect, a `useRef` would be
  // `null` at the virtualizer's initialization. The state forces the re-render
  // as soon as the element is available.
  const [scrollEl, setScrollEl] = React.useState<HTMLDivElement | null>(null)
  const [search, setSearch] = React.useState('')
  const isAsyncSearch = typeof onSearch === 'function'

  // Internal items with a deterministic id (stable by position in `options`).
  const allItems = React.useMemo<InternalItem<SelectOption>[]>(
    () =>
      options.map((option, i) => ({
        id: `tds-select-item-${i}`,
        value: option.value,
        option,
      })),
    [options],
  )

  // Complete registry for keyboard navigation in virtualized lists.
  const registry = React.useMemo(
    () => allItems.map(({ id, value: v }) => ({ id, value: v })),
    [allItems],
  )

  // Filter: local (match-sorter) when synchronous; controlled when asynchronous.
  const filteredItems = React.useMemo(() => {
    if (!searchable || isAsyncSearch || !search) return allItems
    return matchSorter(allItems, search, { keys: ['option.label', 'value'] })
  }, [allItems, search, searchable, isAsyncSearch])

  const isVirtualized = virtualized ?? filteredItems.length > 100
  const enableCombobox = searchable || isVirtualized

  // Groups only in non-virtualized mode.
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

  // Infinite scroll: fires when approaching the end of the scroll.
  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!onLoadMore || !hasMore || loading) return
      const el = event.currentTarget
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 96) onLoadMore()
    },
    [onLoadMore, hasMore, loading],
  )

  const itemHeight = SIZE_ITEM_HEIGHT[size]

  // With `maxCount` (multi), the option needs to react to the selection in order
  // to disable once the cap is reached — hence `LimitedSelectItem`, which
  // subscribes to the store.
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
// Editable mode (autocomplete) — `ComboboxStore` engine with `selectedValue`
// ---------------------------------------------------------------------------
// Here the trigger is the input itself (`Ariakit.Combobox`) and the source of
// the value is the combobox's `selectedValue` (there is no `SelectStore`). It
// covers single/multi, clearing and — via `allowCustomValue` — accepting text
// outside the list.

// Chips of the editable mode (read `selectedValue` from the ComboboxStore).
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

// Clear button of the editable mode.
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

// Option of the editable mode: a ComboboxItem that adds to `selectedValue` (does
// not put the text into the input) and shows the check via `ComboboxItemCheck`.
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

// "N / max" counter of the editable mode.
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

// EditableItem that respects `maxCount`: disables the unselected option once the
// cap is reached.
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
  // Popover anchor: the trigger container (not the input). Without this, the
  // popover would anchor to `Ariakit.Combobox`, which shrinks as the chips grow —
  // shifting and narrowing the list with each selected item.
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

  // The combobox store types `selectedValue` as `string | readonly string[]`;
  // we normalize it to the mutable array that the public API exposes.
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

  // Current selection as an array (covers single, multi and free values already chosen).
  const selectedArray = Array.isArray(selectedValue)
    ? (selectedValue as string[])
    : selectedValue
      ? [selectedValue as string]
      : []

  // Free values already selected (not present in `options`) become "temporary"
  // list items: they appear as an option with a check and disappear when
  // unchecked — mirroring the official options registry.
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

  // Syncs the input text when the popover is closed: in single it shows the
  // selected label; in multi it clears (the selection stays in the chips). While
  // open, the input is free to type/filter.
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

  // Free text: offers "Add …" when there is a search with no exact match.
  // Considers both the `options` and the values already selected — otherwise a
  // free value already chosen would reappear as "Add" and clicking it would
  // remove it (toggle) with a misleading label.
  const trimmed = search.trim()
  const hasExactMatch =
    options.some((o) => o.value === trimmed || o.label === trimmed) ||
    selectedArray.includes(trimmed)
  const showCreate = allowCustomValue && trimmed.length > 0 && !hasExactMatch
  const isEmpty = filteredItems.length === 0 && !loading && !showCreate

  // The API's `placeholder` is a ReactNode, but the input attribute only accepts
  // a string. In multi, it disappears once there are chips so as not to compete
  // with the selection.
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
// Select — public entry point; dispatches between the default and editable modes
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
