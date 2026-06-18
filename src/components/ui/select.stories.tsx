import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test'

import { Badge } from './badge'
import { Select, type SelectOption } from './select'

// --- Dados de exemplo -------------------------------------------------------
const fruits: SelectOption[] = [
  { value: 'apple', label: 'Maçã' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Laranja' },
  { value: 'grape', label: 'Uva' },
  { value: 'mango', label: 'Manga' },
  { value: 'pear', label: 'Pera', disabled: true },
  { value: 'pineapple', label: 'Abacaxi' },
  { value: 'strawberry', label: 'Morango' },
]

const groupedOptions: SelectOption[] = [
  { value: 'apple', label: 'Maçã', group: 'Frutas' },
  { value: 'banana', label: 'Banana', group: 'Frutas' },
  { value: 'carrot', label: 'Cenoura', group: 'Legumes' },
  { value: 'broccoli', label: 'Brócolis', group: 'Legumes' },
  { value: 'salmon', label: 'Salmão', group: 'Proteínas' },
  { value: 'egg', label: 'Ovo', group: 'Proteínas' },
]

const users: SelectOption[] = [
  { value: 'ana', label: 'Ana Souza', email: 'ana@timds.dev', role: 'Admin' },
  { value: 'bruno', label: 'Bruno Lima', email: 'bruno@timds.dev', role: 'Dev' },
  { value: 'carla', label: 'Carla Dias', email: 'carla@timds.dev', role: 'Design' },
]

// 10k itens para exercitar a virtualização.
const manyOptions: SelectOption[] = Array.from({ length: 10000 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${i}`,
}))

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Advanced Select/Combobox built on **Ariakit** (WAI-ARIA APG accessibility, ' +
          'virtual focus via `aria-activedescendant`) and **@tanstack/react-virtual** ' +
          '(virtualization). It does NOT use the native `<select>`. Supports search, ' +
          'custom item/value render, async loading, infinite scroll, list virtualization ' +
          'and groups. Data-driven via `options`, with composable primitives (`SelectRoot`, ' +
          '`SelectItem`, ...) also exported for advanced cases. Each interactive story starts ' +
          'closed — click the trigger to open the listbox.',
      },
    },
    // As histórias interativas começam fechadas (só o trigger): o snapshot
    // padrão fica desligado; a cobertura visual vem das histórias `Visual*`.
    chromatic: { disableSnapshot: true },
  },
  args: {
    options: fruits,
    placeholder: 'Selecione uma fruta...',
    size: 'default',
    searchable: false,
    disabled: false,
    'aria-label': 'Fruta',
  },
  argTypes: {
    options: { control: false, description: 'Lista de opções (`SelectOption[]`).' },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Altura do trigger.',
      table: { defaultValue: { summary: 'default' } },
    },
    searchable: { control: 'boolean', description: 'Exibe o campo de busca.' },
    virtualized: {
      control: 'boolean',
      description: 'Liga a virtualização (auto para > 100 itens).',
    },
    loading: { control: 'boolean', description: 'Indicador de carregamento na lista.' },
    hasMore: { control: 'boolean', description: 'Há mais itens para o infinite scroll.' },
    disabled: { control: 'boolean', description: 'Desabilita o trigger.' },
    value: { control: false, description: 'Valor selecionado (controlado).' },
    placeholder: { control: 'text', description: 'Texto quando nada está selecionado.' },
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
  args: { searchable: true, searchPlaceholder: 'Buscar fruta...' },
}

/** Groups via `option.group` (or the `groupBy` prop). */
export const Groups: Story = {
  args: {
    options: groupedOptions,
    searchable: true,
    placeholder: 'Selecione um item...',
  },
}

/** Custom item render — avatar + secondary text from extra option fields. */
export const CustomItemRender: Story = {
  args: {
    options: users,
    placeholder: 'Selecione um usuário...',
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
          label: `Usuário ${i}`,
        })),
      [],
    )
    const [options, setOptions] = useState<SelectOption[]>([])
    const [loading, setLoading] = useState(false)

    const handleSearch = (q: string) => {
      setLoading(true)
      // Simula latência de rede.
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
        placeholder="Busque um usuário..."
        searchPlaceholder="Digite para buscar..."
        emptyMessage="Digite para buscar usuários"
        aria-label="Usuário"
      />
    )
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')

    await userEvent.click(trigger)
    // Antes de buscar, a lista mostra a mensagem-guia (sem opções).
    await expect(
      await screen.findByText('Digite para buscar usuários'),
    ).toBeInTheDocument()

    // Ao digitar, o resultado assíncrono (simulado) popula a lista.
    const search = screen.getByRole('combobox', { name: /buscar/i })
    await userEvent.type(search, '7')
    await waitFor(
      () => expect(screen.getByRole('option', { name: 'Usuário 7' })).toBeInTheDocument(),
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
          label: `Linha ${i}`,
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
        placeholder="Role até o fim..."
        aria-label="Linha"
      />
    )
  },
}

/** Virtualized: 10.000 items rendered smoothly (auto-enabled). */
export const Virtualized: Story = {
  args: {
    options: manyOptions,
    searchable: true,
    placeholder: 'Selecione entre 10k itens...',
    searchPlaceholder: 'Buscar item...',
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')

    await userEvent.click(trigger)
    const listbox = await screen.findByRole('listbox')

    // A lista NÃO vem vazia (regressão do foco virtual/scroll element): o
    // primeiro item das 10k opções aparece.
    await expect(
      await screen.findByRole('option', { name: 'Item 0' }),
    ).toBeInTheDocument()

    // Prova da virtualização (janela < total). O runtime de teste não aplica o
    // CSS de layout, então a altura/scroll que limita a janela não vem do
    // Tailwind — forçamos aqui via inline style e disparamos o recálculo.
    listbox.style.maxHeight = '180px'
    listbox.style.overflowY = 'auto'
    listbox.dispatchEvent(new Event('scroll'))
    await waitFor(() => {
      const opts = screen.getAllByRole('option')
      expect(opts.length).toBeGreaterThan(0)
      expect(opts.length).toBeLessThan(100)
    })

    // Buscar um item distante traz ele ao topo (renderizado) e permite selecionar.
    const search = screen.getByRole('combobox', { name: /buscar/i })
    await userEvent.type(search, '4242')
    const match = await screen.findByRole('option', { name: 'Item 4242' })
    await userEvent.click(match)
    await expect(args.onValueChange).toHaveBeenCalledWith('item-4242')
  },
}

/** Disabled trigger. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'apple' },
}

/** Empty state when no option matches. */
export const EmptyState: Story = {
  args: { options: [], searchable: true, emptyMessage: 'Nenhuma fruta encontrada' },
}

// --- Testes de interação (play) --------------------------------------------

/** Opening the trigger reveals a `listbox`; clicking an option selects it. */
export const SelectsOnClick: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')

    await userEvent.click(trigger)
    // Conteúdo num portal: busca no document.
    const listbox = await screen.findByRole('listbox')
    await expect(listbox).toBeVisible()

    await userEvent.click(screen.getByRole('option', { name: 'Banana' }))
    await expect(args.onValueChange).toHaveBeenCalledWith('banana')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    // O valor selecionado aparece no trigger.
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
    if (!trigger) throw new Error('trigger não encontrado')

    await userEvent.click(trigger)
    const search = await screen.findByRole('combobox', { name: /buscar/i })
    await userEvent.type(search, 'lar')

    // Apenas "Laranja" deve permanecer.
    await waitFor(() => {
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Laranja')
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
    if (!trigger) throw new Error('trigger não encontrado')

    await userEvent.click(trigger)
    const search = await screen.findByRole('combobox', { name: /buscar/i })
    await waitFor(() => expect(search).toHaveFocus())

    // Com foco virtual, a opção ativa é referenciada por aria-activedescendant.
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
    if (!trigger) throw new Error('trigger não encontrado')

    await userEvent.click(trigger)
    await screen.findByRole('listbox')

    const pear = screen.getByRole('option', { name: 'Pera' })
    await expect(pear).toHaveAttribute('aria-disabled', 'true')

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(pear)
    await expect(args.onValueChange).not.toHaveBeenCalled()
  },
}

/**
 * a11y: o `aria-controls` do trigger deve referenciar um elemento existente
 * tanto fechado quanto aberto (o popover permanece montado/oculto). Evita a
 * violação crítica `aria-valid-attr-value` do axe.
 */
export const AriaControlsValid: Story = {
  args: { searchable: true },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')

    // Fechado: se houver aria-controls, o alvo precisa existir no DOM.
    const closed = trigger.getAttribute('aria-controls')
    if (closed) await expect(document.getElementById(closed)).toBeInTheDocument()

    // Aberto: aria-controls presente e apontando para um elemento existente.
    await userEvent.click(trigger)
    await screen.findByRole('listbox')
    const open = trigger.getAttribute('aria-controls')
    await expect(open).toBeTruthy()
    await expect(document.getElementById(open as string)).toBeInTheDocument()
  },
}

// --- Histórias visuais (Chromatic) -----------------------------------------
// Abrem o popover (`defaultOpen`) para capturar a lista em light/dark.
const visualParameters = {
  docs: { disable: true },
  chromatic: { disableSnapshot: false },
}

/** Captura visual — lista aberta com busca. */
export const VisualOpen: Story = {
  parameters: visualParameters,
  args: { searchable: true, defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Captura visual — grupos abertos. */
export const VisualGroups: Story = {
  parameters: visualParameters,
  args: { options: groupedOptions, defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}
