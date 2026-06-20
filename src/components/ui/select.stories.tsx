import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test'

import { Badge } from './badge'
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectItem,
  SelectList,
  type SelectOption,
  SelectRoot,
  SelectSearch,
  SelectTrigger,
  SelectValue,
} from './select'

// --- Example data -----------------------------------------------------------
const fruits: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'pear', label: 'Pear', disabled: true },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'strawberry', label: 'Strawberry' },
]

const groupedOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
  { value: 'broccoli', label: 'Broccoli', group: 'Vegetables' },
  { value: 'salmon', label: 'Salmon', group: 'Proteins' },
  { value: 'egg', label: 'Egg', group: 'Proteins' },
]

const users: SelectOption[] = [
  { value: 'ana', label: 'Ana Souza', email: 'ana@timds.dev', role: 'Admin' },
  { value: 'bruno', label: 'Bruno Lima', email: 'bruno@timds.dev', role: 'Dev' },
  { value: 'carla', label: 'Carla Dias', email: 'carla@timds.dev', role: 'Design' },
]

// 1k items: enough to exercise virtualization (auto > 100) without the cost of
// filtering/re-rendering 10k on every keystroke, which made the play slow and flaky.
const manyOptions: SelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${i}`,
}))

const meta = {
  title: 'Data Entry/Select',
  component: Select,
  // No `autodocs`: the docs page is the custom MDX (select.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Advanced Select/Combobox built on **Ariakit** (WAI-ARIA APG accessibility, ' +
          'virtual focus via `aria-activedescendant`) and **@tanstack/react-virtual** ' +
          '(virtualization). It does NOT use the native `<select>`. Supports search, ' +
          'custom item/value render, async loading, infinite scroll, list virtualization ' +
          'and groups. It also covers **multi-select** (chips with a `+N` summary), a ' +
          '**clear** button (`clearable`), a selection cap (`maxCount`, disables the rest ' +
          'and shows an `N / max` counter) and an **editable** mode (`editable`, ' +
          'autocomplete typed directly in the field, with optional free text via ' +
          '`allowCustomValue`). All UI strings default to English and are translatable ' +
          'via the `messages` prop. Data-driven via `options`, with composable primitives ' +
          '(`SelectRoot`, `SelectItem`, ...) also exported for advanced cases. Each ' +
          'interactive story starts closed — click the trigger to open the listbox.',
      },
    },
    // The interactive stories start closed (only the trigger): the default
    // snapshot is turned off; visual coverage comes from the `Visual*` stories.
    chromatic: { disableSnapshot: true },
  },
  args: {
    options: fruits,
    placeholder: 'Select a fruit...',
    size: 'default',
    searchable: false,
    disabled: false,
    'aria-label': 'Fruit',
  },
  argTypes: {
    options: { control: false, description: 'List of options (`SelectOption[]`).' },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Trigger height.',
      table: { defaultValue: { summary: 'default' } },
    },
    searchable: { control: 'boolean', description: 'Shows the search field.' },
    multiple: { control: 'boolean', description: 'Multi-select with chips.' },
    clearable: { control: 'boolean', description: 'Shows the clear button.' },
    editable: {
      control: 'boolean',
      description: 'Editable trigger (autocomplete in the field itself).',
    },
    allowCustomValue: {
      control: 'boolean',
      description: 'Editable: accepts text outside the list.',
    },
    maxCount: {
      control: 'number',
      description: 'Multi: max number of items (shows "N / max").',
    },
    maxDisplayChips: {
      control: 'number',
      description: 'Multi: chips before summarizing as "+N".',
    },
    virtualized: {
      control: 'boolean',
      description: 'Enables virtualization (auto for > 100 items).',
    },
    loading: { control: 'boolean', description: 'Loading indicator in the list.' },
    hasMore: {
      control: 'boolean',
      description: 'There are more items for infinite scroll.',
    },
    disabled: { control: 'boolean', description: 'Disables the trigger.' },
    value: { control: false, description: 'Selected value (controlled).' },
    placeholder: { control: 'text', description: 'Text when nothing is selected.' },
  },
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

/** The three trigger sizes. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Select key={size} {...args} size={size} aria-label={size} />
      ))}
    </div>
  ),
}

/** With a search field — filters locally with `match-sorter`. */
export const Searchable: Story = {
  args: { searchable: true, messages: { search: 'Search fruit…' } },
}

/** Groups via `option.group` (or the `groupBy` prop). */
export const Groups: Story = {
  args: {
    options: groupedOptions,
    searchable: true,
    placeholder: 'Select an item...',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')
    await userEvent.click(trigger)
    await screen.findByRole('listbox')
    // The group labels are shown alongside the options.
    await expect(screen.getByText('Fruits')).toBeInTheDocument()
    await expect(screen.getByText('Vegetables')).toBeInTheDocument()
    await expect(screen.getByText('Proteins')).toBeInTheDocument()
  },
}

/** Custom item render — avatar + secondary text from extra option fields. */
export const CustomItemRender: Story = {
  args: {
    options: users,
    placeholder: 'Select a user...',
    searchable: true,
    renderItem: (o) => (
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {String(o.label).charAt(0)}
        </span>
        <div className="flex flex-col">
          <span className="text-sm">{o.label}</span>
          <span className="text-xs text-muted-foreground">{o.email as string}</span>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {o.role as string}
        </Badge>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')
    await userEvent.click(trigger)
    await screen.findByRole('listbox')
    // The `renderItem` is applied: the email and the role badge appear in the option.
    await expect(screen.getByText('ana@timds.dev')).toBeInTheDocument()
    await expect(screen.getByText('Admin')).toBeInTheDocument()
  },
}

/** Custom trigger render via `renderValue`. */
export const CustomValue: Story = {
  args: {
    options: users,
    defaultValue: 'ana',
    renderValue: (o) => (
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-success" />
        {o.label} · {o.role as string}
      </span>
    ),
  },
}

/** Async loading: simulates a server-side search with debounce-free fetch. */
export const AsyncLoad: Story = {
  render: (args) => {
    const allUsers = useMemo(
      () =>
        Array.from({ length: 50 }, (_, i) => ({
          value: `user-${i}`,
          label: `User ${i}`,
        })),
      [],
    )
    const [options, setOptions] = useState<SelectOption[]>([])
    const [loading, setLoading] = useState(false)

    const handleSearch = (q: string) => {
      setLoading(true)
      // Simulates network latency.
      window.setTimeout(() => {
        setOptions(
          allUsers.filter((u) => u.label.toLowerCase().includes(q.toLowerCase())),
        )
        setLoading(false)
      }, 400)
    }

    return (
      <Select
        {...args}
        options={options}
        searchable
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search for a user..."
        messages={{
          search: 'Type to search...',
          empty: 'Type to search users',
        }}
        aria-label="User"
      />
    )
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    await userEvent.click(trigger)
    // Before searching, the list shows the guide message (no options).
    await expect(await screen.findByText('Type to search users')).toBeInTheDocument()

    // On typing, the (simulated) async result populates the list.
    const search = screen.getByRole('combobox', { name: /search/i })
    await userEvent.type(search, '7')
    await waitFor(
      () => expect(screen.getByRole('option', { name: 'User 7' })).toBeInTheDocument(),
      { timeout: 3000 },
    )
  },
}

/** Infinite scroll: loads more items as you reach the bottom. */
export const InfiniteScroll: Story = {
  render: (args) => {
    const [count, setCount] = useState(20)
    const [loading, setLoading] = useState(false)
    const options = useMemo(
      () =>
        Array.from({ length: count }, (_, i) => ({
          value: `row-${i}`,
          label: `Row ${i}`,
        })),
      [count],
    )

    const loadMore = () => {
      if (loading || count >= 200) return
      setLoading(true)
      window.setTimeout(() => {
        setCount((c) => Math.min(c + 20, 200))
        setLoading(false)
      }, 500)
    }

    return (
      <Select
        {...args}
        options={options}
        onLoadMore={loadMore}
        hasMore={count < 200}
        loading={loading}
        placeholder="Scroll to the bottom..."
        aria-label="Row"
      />
    )
  },
}

/** Virtualized: 1.000 items rendered smoothly (auto-enabled). */
export const Virtualized: Story = {
  args: {
    options: manyOptions,
    searchable: true,
    placeholder: 'Select from 1k items...',
    messages: { search: 'Search item...' },
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    await userEvent.click(trigger)
    const listbox = await screen.findByRole('listbox')

    // The list does NOT come empty (regression of the virtual focus/scroll
    // element): the first of the 1k options appears.
    await expect(
      await screen.findByRole('option', { name: 'Item 0' }),
    ).toBeInTheDocument()

    // Proof of virtualization (window < total). The test runtime does not apply
    // the layout CSS, so the height/scroll that bounds the window does not come
    // from Tailwind — we force it here via inline style and trigger the recompute.
    listbox.style.maxHeight = '180px'
    listbox.style.overflowY = 'auto'
    listbox.dispatchEvent(new Event('scroll'))
    await waitFor(() => {
      const opts = screen.getAllByRole('option')
      expect(opts.length).toBeGreaterThan(0)
      expect(opts.length).toBeLessThan(100)
    })

    // Searching for a distant item brings it to the top (rendered) and lets you select it.
    const search = screen.getByRole('combobox', { name: /search/i })
    await userEvent.type(search, '942')
    const match = await screen.findByRole('option', { name: 'Item 942' })
    await userEvent.click(match)
    await expect(args.onValueChange).toHaveBeenCalledWith('item-942')
  },
}

/** Disabled trigger. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'apple' },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')
    // Shows the value, but clicking does not open the list.
    await expect(trigger).toHaveTextContent('Apple')
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(trigger)
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  },
}

/** Empty state when no option matches. */
export const EmptyState: Story = {
  args: {
    options: [],
    searchable: true,
    messages: { empty: 'No fruit found' },
  },
}

/** Clearable: a clear (`x`) button appears in the trigger once there is a value. */
export const Clearable: Story = {
  args: { clearable: true, defaultValue: 'apple' },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')
    await expect(trigger).toHaveTextContent('Apple')

    const clear = canvasElement.querySelector<HTMLElement>('[data-slot="select-clear"]')
    await expect(clear).toBeInTheDocument()
    await userEvent.click(clear as HTMLElement)

    // Clearing resets the value (the value chip disappears), hides the button and does NOT open the list.
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-slot="select-clear"]')).toBeNull(),
    )
    await expect(trigger).not.toHaveTextContent('Apple')
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  },
}

/** Multi-select: selected items become removable chips, summarized as `+N`. */
export const Multiple: Story = {
  args: {
    multiple: true,
    clearable: true,
    defaultValue: ['apple', 'banana'],
    placeholder: 'Select fruits...',
    searchable: true,
    'aria-label': 'Fruits',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')
    // Starts with two chips.
    await expect(trigger.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2)

    await userEvent.click(trigger)
    // Selecting one more keeps the list open (multi).
    await userEvent.click(await screen.findByRole('option', { name: 'Grape' }))
    await expect(screen.getByRole('listbox')).toBeInTheDocument()
    await expect(trigger.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(3)

    // Removing a chip via the "x" goes back to two (without reopening/changing the list).
    const remove = trigger.querySelector<HTMLElement>('[data-slot="select-chip-remove"]')
    await userEvent.click(remove as HTMLElement)
    await waitFor(() =>
      expect(trigger.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2),
    )
  },
}

/** `maxDisplayChips` keeps the trigger compact, summarizing the rest as `+N`. */
export const MultipleSummary: Story = {
  args: {
    multiple: true,
    maxDisplayChips: 2,
    defaultValue: ['apple', 'banana', 'orange', 'grape'],
    'aria-label': 'Fruits',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')
    // 4 selected, but only 2 chips visible + "+2" summary.
    await expect(trigger.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2)
    await expect(trigger).toHaveTextContent('+2')

    // Removing a chip updates the summary to "+1".
    const remove = trigger.querySelector<HTMLElement>('[data-slot="select-chip-remove"]')
    await userEvent.click(remove as HTMLElement)
    await waitFor(() => expect(trigger).toHaveTextContent('+1'))
  },
}

/**
 * `maxCount` caps the selection: once reached, the remaining options are
 * disabled and an `N / max` counter is shown in the trigger.
 */
export const MaxCount: Story = {
  args: {
    multiple: true,
    maxCount: 3,
    defaultValue: ['apple', 'banana'],
    placeholder: 'Up to 3 fruits...',
    'aria-label': 'Fruits',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')
    await expect(trigger.querySelector('[data-slot="select-count"]')).toHaveTextContent(
      '2 / 3',
    )

    await userEvent.click(trigger)
    // On reaching the cap (3), the remaining options become disabled.
    await userEvent.click(await screen.findByRole('option', { name: 'Grape' }))
    await waitFor(() =>
      expect(trigger.querySelector('[data-slot="select-count"]')).toHaveTextContent(
        '3 / 3',
      ),
    )
    await expect(screen.getByRole('option', { name: 'Mango' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  },
}

/** Editable: type directly in the field (autocomplete). */
export const Editable: Story = {
  args: {
    editable: true,
    clearable: true,
    placeholder: 'Search for a fruit...',
    'aria-label': 'Fruit',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-slot="select-input"]',
    )
    if (!input) throw new Error('input not found')
    await userEvent.click(input)
    await userEvent.type(input, 'man')
    const match = await screen.findByRole('option', { name: 'Mango' })
    await userEvent.click(match)
    await waitFor(() => expect(input).toHaveValue('Mango'))
  },
}

/** Editable + multi: typed search with removable chips. */
export const EditableMultiple: Story = {
  args: {
    editable: true,
    multiple: true,
    clearable: true,
    maxCount: 4,
    placeholder: 'Add fruits...',
    'aria-label': 'Fruits',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-slot="select-input"]',
    )
    if (!input) throw new Error('input not found')

    await userEvent.click(input)
    await userEvent.type(input, 'man')
    await userEvent.click(await screen.findByRole('option', { name: 'Mango' }))
    // Selecting an item in multi clears the search and keeps the list open.
    await userEvent.click(await screen.findByRole('option', { name: 'Orange' }))

    await expect(screen.getByRole('listbox')).toBeInTheDocument()
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2),
    )
    // The counter reflects the selection against the cap (maxCount).
    await expect(
      canvasElement.querySelector('[data-slot="select-count"]'),
    ).toHaveTextContent('2 / 4')
  },
}

/**
 * i18n: every UI string defaults to English and can be overridden via the
 * `messages` prop (partial — translate only what you need).
 */
export const Translated: Story = {
  args: {
    editable: true,
    multiple: true,
    allowCustomValue: true,
    clearable: true,
    placeholder: 'Selecione frutas...',
    messages: {
      search: 'Buscar...',
      empty: 'Nenhum resultado',
      loading: 'Carregando...',
      clear: 'Limpar',
      remove: (label) => `Remover ${label}`,
      add: (value) => `Adicionar “${value}”`,
    },
    'aria-label': 'Frutas',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-slot="select-input"]',
    )
    if (!input) throw new Error('input not found')

    // The placeholder translated via `messages` is not the input's; here we
    // validate the list texts: the create option and the remove label.
    await userEvent.click(input)
    await userEvent.type(input, 'Peach')
    await userEvent.click(
      await screen.findByRole('option', { name: 'Adicionar “Peach”' }),
    )

    // The created chip exposes the translated remove label.
    await expect(
      await screen.findByRole('button', { name: 'Remover Peach' }),
    ).toBeInTheDocument()
  },
}

/** `allowCustomValue`: accept a typed value that is not in the list. */
export const AllowCustomValue: Story = {
  args: {
    editable: true,
    multiple: true,
    allowCustomValue: true,
    placeholder: 'Type and create tags...',
    'aria-label': 'Tags',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-slot="select-input"]',
    )
    if (!input) throw new Error('input not found')

    // Creates a free value — becomes a chip.
    await userEvent.click(input)
    await userEvent.type(input, 'Kiwi')
    await userEvent.click(await screen.findByRole('option', { name: /Add/ }))
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(1),
    )

    // Retyping shows the value as a list item (selected), without offering
    // "Add" again — it is a "temporary" item derived from the selection.
    await userEvent.type(input, 'Kiwi')
    const item = await screen.findByRole('option', { name: 'Kiwi' })
    await expect(item).toHaveAttribute('aria-selected', 'true')
    await expect(screen.queryByRole('option', { name: /Add/ })).not.toBeInTheDocument()

    // Deselecting via the item removes it from the selection and the list.
    await userEvent.click(item)
    await waitFor(() =>
      expect(screen.queryByRole('option', { name: 'Kiwi' })).not.toBeInTheDocument(),
    )
  },
}

/**
 * **Long mode (composition).** Instead of the data-driven `<Select options={…} />`,
 * assemble the exported primitives yourself when you need full control over the
 * markup. This complete example wires `SelectRoot` (with `combobox` for search +
 * virtual focus) → `SelectTrigger` + `SelectValue` → `SelectContent` with
 * `SelectSearch`, a scrollable `SelectList`, `SelectGroup` headers, `SelectItem`
 * options and a `SelectEmpty` fallback. You own the data and the filtering — here a
 * plain `includes` over the grouped options driven by `onSearch`.
 */
export const Composition: Story = {
  args: { onValueChange: fn() },
  render: (args) => {
    const [search, setSearch] = useState('')
    const visible = useMemo(
      () =>
        search
          ? groupedOptions.filter((o) =>
              o.label.toLowerCase().includes(search.toLowerCase()),
            )
          : groupedOptions,
      [search],
    )
    // Groups the visible options by `group` to build the headers.
    const groups = useMemo(() => {
      const map = new Map<string, SelectOption[]>()
      for (const o of visible) {
        const key = o.group ?? ''
        const bucket = map.get(key)
        if (bucket) bucket.push(o)
        else map.set(key, [o])
      }
      return Array.from(map, ([label, items]) => ({ label, items }))
    }, [visible])

    return (
      <SelectRoot
        combobox
        onSearch={setSearch}
        // Single-select: the value is always a `string`.
        onValueChange={(v) =>
          (args.onValueChange as ((value: string) => void) | undefined)?.(v as string)
        }
      >
        <SelectTrigger className="w-64" aria-label="Ingredient">
          <SelectValue placeholder="Select an ingredient...">
            {(v) => groupedOptions.find((o) => o.value === v)?.label ?? v}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectSearch placeholder="Search..." />
          <SelectList>
            {groups.length === 0 ? (
              <SelectEmpty />
            ) : (
              groups.map((group) => (
                <SelectGroup key={group.label} label={group.label}>
                  {group.items.map((o) => (
                    <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            )}
          </SelectList>
        </SelectContent>
      </SelectRoot>
    )
  },
  play: async ({ args, canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    await userEvent.click(trigger)
    const search = await screen.findByRole('combobox', { name: /search/i })
    await userEvent.type(search, 'car')

    // The local filter (includes) keeps only "Carrot" — and its group.
    await waitFor(() => {
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Carrot')
    })

    await userEvent.click(screen.getByRole('option', { name: 'Carrot' }))
    await expect(args.onValueChange).toHaveBeenCalledWith('carrot')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    await expect(trigger).toHaveTextContent('Carrot')
  },
}

// --- Interaction tests (play) ----------------------------------------------

/** Opening the trigger reveals a `listbox`; clicking an option selects it. */
export const SelectsOnClick: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    await userEvent.click(trigger)
    // Content in a portal: query the document.
    const listbox = await screen.findByRole('listbox')
    await expect(listbox).toBeVisible()

    await userEvent.click(screen.getByRole('option', { name: 'Banana' }))
    await expect(args.onValueChange).toHaveBeenCalledWith('banana')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    // The selected value appears in the trigger.
    await expect(trigger).toHaveTextContent('Banana')
  },
}

/** Typing in the search field filters the options. */
export const SearchFilters: Story = {
  args: { searchable: true },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    await userEvent.click(trigger)
    const search = await screen.findByRole('combobox', { name: /search/i })
    await userEvent.type(search, 'ora')

    // Only "Orange" should remain.
    await waitFor(() => {
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Orange')
    })
  },
}

/**
 * Keyboard navigation uses virtual focus: the active option is tracked via
 * `aria-activedescendant`, not DOM focus. Enter selects it.
 */
export const KeyboardSelects: Story = {
  args: { searchable: true, onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    await userEvent.click(trigger)
    const search = await screen.findByRole('combobox', { name: /search/i })
    await waitFor(() => expect(search).toHaveFocus())

    // With virtual focus, the active option is referenced by aria-activedescendant.
    await userEvent.keyboard('{ArrowDown}')
    await waitFor(() => expect(search.getAttribute('aria-activedescendant')).toBeTruthy())
    await userEvent.keyboard('{Enter}')
    await expect(args.onValueChange).toHaveBeenCalled()
  },
}

/** Disabled options cannot be selected. */
export const DisabledOptionNotSelectable: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    await userEvent.click(trigger)
    await screen.findByRole('listbox')

    const pear = screen.getByRole('option', { name: 'Pear' })
    await expect(pear).toHaveAttribute('aria-disabled', 'true')

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(pear)
    await expect(args.onValueChange).not.toHaveBeenCalled()
  },
}

/**
 * a11y: the trigger's `aria-controls` must reference an existing element both
 * closed and open (the popover stays mounted/hidden). Avoids axe's critical
 * `aria-valid-attr-value` violation.
 */
export const AriaControlsValid: Story = {
  args: { searchable: true },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger not found')

    // Closed: if aria-controls is present, the target must exist in the DOM.
    const closed = trigger.getAttribute('aria-controls')
    if (closed) await expect(document.getElementById(closed)).toBeInTheDocument()

    // Open: aria-controls present and pointing to an existing element.
    await userEvent.click(trigger)
    await screen.findByRole('listbox')
    const open = trigger.getAttribute('aria-controls')
    await expect(open).toBeTruthy()
    await expect(document.getElementById(open as string)).toBeInTheDocument()
  },
}

// --- Visual stories (Chromatic) --------------------------------------------
// They exist only for visual regression: hidden from the sidebar and the docs
// (`!dev`/`!autodocs`), but still run as a smoke test (tag `test`) and re-enable
// the snapshot, off by default in the meta. Together they should cover ALL of
// the Select's visual behaviors (see ADR 0006). Closed triggers are grouped
// into grids (one snapshot per family); list states open one popover per story
// (`defaultOpen`) so portals don't overlap.
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Pick<Story, 'tags' | 'parameters'>

// Variant for open lists WITHOUT options (empty/loading): a `role="listbox"`
// with no `option` children triggers axe (`aria-required-children`). The list's
// a11y audit is already covered by the interactive stories (with options); here
// we only want the visual snapshot of the state, so we turn off the a11y test.
const visualNoA11y = {
  tags: visual.tags,
  parameters: { ...visual.parameters, a11y: { test: 'off' } },
} satisfies Pick<Story, 'tags' | 'parameters'>

// Same `renderItem` as the CustomItemRender story, for the list snapshot.
const renderUserItem = (o: SelectOption) => (
  <div className="flex items-center gap-2">
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
      {String(o.label).charAt(0)}
    </span>
    <div className="flex flex-col">
      <span className="text-sm">{o.label}</span>
      <span className="text-xs text-muted-foreground">{o.email as string}</span>
    </div>
    <Badge variant="secondary" className="ml-auto">
      {o.role as string}
    </Badge>
  </div>
)

// --- Closed triggers (grids) -----------------------------------------------

/** Visual — the three trigger sizes, with a value. */
export const VisualSizes: Story = {
  ...visual,
  args: { defaultValue: 'apple' },
  render: (args) => (
    <div className="flex w-72 flex-col gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Select key={size} {...args} size={size} aria-label={size} />
      ))}
    </div>
  ),
}

/** Visual — trigger states: placeholder, value, custom value and disabled. */
export const VisualTriggerStates: Story = {
  ...visual,
  render: () => (
    <div className="grid w-[34rem] grid-cols-2 gap-4">
      <Select options={fruits} placeholder="Select a fruit..." aria-label="placeholder" />
      <Select options={fruits} defaultValue="apple" aria-label="value" />
      <Select
        options={users}
        defaultValue="ana"
        aria-label="custom value"
        renderValue={(o) => (
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" />
            {o.label} · {o.role as string}
          </span>
        )}
      />
      <Select options={fruits} defaultValue="apple" disabled aria-label="disabled" />
    </div>
  ),
}

/** Visual — trigger with the clear button (`clearable`). */
export const VisualClearable: Story = {
  ...visual,
  args: { clearable: true, defaultValue: 'apple' },
}

/** Visual — multi triggers: chips, "+N" summary and "N / max" counter. */
export const VisualMultiTriggers: Story = {
  ...visual,
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Select
        multiple
        clearable
        options={fruits}
        defaultValue={['apple', 'banana']}
        aria-label="chips"
      />
      <Select
        multiple
        maxDisplayChips={2}
        options={fruits}
        defaultValue={['apple', 'banana', 'orange', 'grape']}
        aria-label="+N summary"
      />
      <Select
        multiple
        maxCount={3}
        options={fruits}
        defaultValue={['apple', 'banana']}
        aria-label="counter"
      />
    </div>
  ),
}

/** Visual — editable triggers (autocomplete): empty and with chips. */
export const VisualEditable: Story = {
  ...visual,
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Select
        editable
        clearable
        options={fruits}
        placeholder="Search for a fruit..."
        aria-label="editable"
      />
      <Select
        editable
        multiple
        clearable
        options={fruits}
        defaultValue={['apple', 'banana']}
        aria-label="editable multiple"
      />
    </div>
  ),
}

// --- Open list (one popover per story) --------------------------------------

/** Visual — open list with the search field. */
export const VisualOpen: Story = {
  ...visual,
  args: { searchable: true, defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — open list with a selected option (check). */
export const VisualSelected: Story = {
  ...visual,
  args: { searchable: true, defaultOpen: true, defaultValue: 'banana' },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — open groups. */
export const VisualGroups: Story = {
  ...visual,
  args: { options: groupedOptions, defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — custom item render (avatar + secondary text + badge). */
export const VisualCustomItem: Story = {
  ...visual,
  args: { options: users, defaultOpen: true, renderItem: renderUserItem },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — disabled option inside the list (Pear). */
export const VisualDisabledOption: Story = {
  ...visual,
  args: { defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — empty state (no option matches). */
export const VisualEmpty: Story = {
  ...visualNoA11y,
  args: {
    options: [],
    searchable: true,
    defaultOpen: true,
    messages: { empty: 'No fruit found' },
  },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — loading indicator in the list. */
export const VisualLoading: Story = {
  ...visualNoA11y,
  args: {
    options: [],
    searchable: true,
    defaultOpen: true,
    loading: true,
    messages: { loading: 'Loading...' },
  },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}
