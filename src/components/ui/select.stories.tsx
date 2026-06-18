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

// 1k itens: suficiente para exercitar a virtualização (auto > 100) sem o custo
// de filtrar/re-renderizar 10k a cada tecla, que tornava o play lento e flaky.
const manyOptions: SelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${i}`,
}))

const meta = {
  title: 'UI/Select',
  component: Select,
  // Sem `autodocs`: a página de docs é a MDX customizada (select.mdx), que embute
  // estas stories. Ter ambos geraria entradas de Docs duplicadas.
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
    multiple: { control: 'boolean', description: 'Multi-seleção com chips.' },
    clearable: { control: 'boolean', description: 'Exibe o botão de limpar.' },
    editable: {
      control: 'boolean',
      description: 'Gatilho editável (autocomplete no próprio campo).',
    },
    allowCustomValue: {
      control: 'boolean',
      description: 'Editável: aceita texto fora da lista.',
    },
    maxCount: {
      control: 'number',
      description: 'Multi: nº máximo de itens (mostra "N / max").',
    },
    maxDisplayChips: {
      control: 'number',
      description: 'Multi: chips antes de resumir em "+N".',
    },
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
  args: { searchable: true, messages: { search: 'Search fruit…' } },
}

/** Groups via `option.group` (or the `groupBy` prop). */
export const Groups: Story = {
  args: {
    options: groupedOptions,
    searchable: true,
    placeholder: 'Selecione um item...',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')
    await userEvent.click(trigger)
    await screen.findByRole('listbox')
    // Os rótulos de grupo são exibidos junto às opções.
    await expect(screen.getByText('Frutas')).toBeInTheDocument()
    await expect(screen.getByText('Legumes')).toBeInTheDocument()
    await expect(screen.getByText('Proteínas')).toBeInTheDocument()
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
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')
    await userEvent.click(trigger)
    await screen.findByRole('listbox')
    // O `renderItem` é aplicado: o e-mail e o badge de papel aparecem na opção.
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
        messages={{
          search: 'Digite para buscar...',
          empty: 'Digite para buscar usuários',
        }}
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

/** Virtualized: 1.000 items rendered smoothly (auto-enabled). */
export const Virtualized: Story = {
  args: {
    options: manyOptions,
    searchable: true,
    placeholder: 'Selecione entre 1k itens...',
    messages: { search: 'Buscar item...' },
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
    // primeiro item das 1k opções aparece.
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
    if (!trigger) throw new Error('trigger não encontrado')
    // Mostra o valor, mas clicar não abre a lista.
    await expect(trigger).toHaveTextContent('Maçã')
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
    messages: { empty: 'Nenhuma fruta encontrada' },
  },
}

/** Clearable: a clear (`x`) button appears in the trigger once there is a value. */
export const Clearable: Story = {
  args: { clearable: true, defaultValue: 'apple' },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')
    await expect(trigger).toHaveTextContent('Maçã')

    const clear = canvasElement.querySelector<HTMLElement>('[data-slot="select-clear"]')
    await expect(clear).toBeInTheDocument()
    await userEvent.click(clear as HTMLElement)

    // Limpar zera o valor (some o chip do valor), some o botão e NÃO abre a lista.
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-slot="select-clear"]')).toBeNull(),
    )
    await expect(trigger).not.toHaveTextContent('Maçã')
    await expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  },
}

/** Multi-select: selected items become removable chips, summarized as `+N`. */
export const Multiple: Story = {
  args: {
    multiple: true,
    clearable: true,
    defaultValue: ['apple', 'banana'],
    placeholder: 'Selecione frutas...',
    searchable: true,
    'aria-label': 'Frutas',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')
    // Começa com dois chips.
    await expect(trigger.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2)

    await userEvent.click(trigger)
    // Selecionar mais um mantém a lista aberta (multi).
    await userEvent.click(await screen.findByRole('option', { name: 'Uva' }))
    await expect(screen.getByRole('listbox')).toBeInTheDocument()
    await expect(trigger.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(3)

    // Remover um chip pelo "x" volta para dois (sem reabrir/alterar a lista).
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
    'aria-label': 'Frutas',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')
    // 4 selecionados, mas só 2 chips visíveis + resumo "+2".
    await expect(trigger.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2)
    await expect(trigger).toHaveTextContent('+2')

    // Remover um chip atualiza o resumo para "+1".
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
    placeholder: 'Até 3 frutas...',
    'aria-label': 'Frutas',
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="select-trigger"]',
    )
    if (!trigger) throw new Error('trigger não encontrado')
    await expect(trigger.querySelector('[data-slot="select-count"]')).toHaveTextContent(
      '2 / 3',
    )

    await userEvent.click(trigger)
    // Ao chegar no teto (3), as demais opções ficam desabilitadas.
    await userEvent.click(await screen.findByRole('option', { name: 'Uva' }))
    await waitFor(() =>
      expect(trigger.querySelector('[data-slot="select-count"]')).toHaveTextContent(
        '3 / 3',
      ),
    )
    await expect(screen.getByRole('option', { name: 'Manga' })).toHaveAttribute(
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
    placeholder: 'Busque uma fruta...',
    'aria-label': 'Fruta',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-slot="select-input"]',
    )
    if (!input) throw new Error('input não encontrado')
    await userEvent.click(input)
    await userEvent.type(input, 'man')
    const match = await screen.findByRole('option', { name: 'Manga' })
    await userEvent.click(match)
    await waitFor(() => expect(input).toHaveValue('Manga'))
  },
}

/** Editable + multi: typed search with removable chips. */
export const EditableMultiple: Story = {
  args: {
    editable: true,
    multiple: true,
    clearable: true,
    maxCount: 4,
    placeholder: 'Adicione frutas...',
    'aria-label': 'Frutas',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-slot="select-input"]',
    )
    if (!input) throw new Error('input não encontrado')

    await userEvent.click(input)
    await userEvent.type(input, 'man')
    await userEvent.click(await screen.findByRole('option', { name: 'Manga' }))
    // Selecionar um item no multi limpa a busca e mantém a lista aberta.
    await userEvent.click(await screen.findByRole('option', { name: 'Laranja' }))

    await expect(screen.getByRole('listbox')).toBeInTheDocument()
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2),
    )
    // O contador reflete a seleção contra o teto (maxCount).
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
      empty: 'Nada encontrado',
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
    if (!input) throw new Error('input não encontrado')

    // Placeholder traduzido via `messages` não é o do input; aqui validamos os
    // textos da lista: a opção de criar e o rótulo de remover.
    await userEvent.click(input)
    await userEvent.type(input, 'Pêssego')
    await userEvent.click(
      await screen.findByRole('option', { name: 'Adicionar “Pêssego”' }),
    )

    // O chip criado expõe o rótulo de remoção traduzido.
    await expect(
      await screen.findByRole('button', { name: 'Remover Pêssego' }),
    ).toBeInTheDocument()
  },
}

/** `allowCustomValue`: accept a typed value that is not in the list. */
export const AllowCustomValue: Story = {
  args: {
    editable: true,
    multiple: true,
    allowCustomValue: true,
    placeholder: 'Digite e crie tags...',
    'aria-label': 'Tags',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-slot="select-input"]',
    )
    if (!input) throw new Error('input não encontrado')

    // Cria um valor livre — vira chip.
    await userEvent.click(input)
    await userEvent.type(input, 'Kiwi')
    await userEvent.click(await screen.findByRole('option', { name: /Add/ }))
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(1),
    )

    // Redigitar mostra o valor como item da lista (selecionado), sem reoferecer
    // "Add" — é um item "temporário" derivado da seleção.
    await userEvent.type(input, 'Kiwi')
    const item = await screen.findByRole('option', { name: 'Kiwi' })
    await expect(item).toHaveAttribute('aria-selected', 'true')
    await expect(screen.queryByRole('option', { name: /Add/ })).not.toBeInTheDocument()

    // Desmarcar pelo item remove-o da seleção e da lista.
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
    // Agrupa as opções visíveis pelo `group` para montar os cabeçalhos.
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
        // Single-select: o valor é sempre `string`.
        onValueChange={(v) =>
          (args.onValueChange as ((value: string) => void) | undefined)?.(v as string)
        }
      >
        <SelectTrigger className="w-64" aria-label="Ingrediente">
          <SelectValue placeholder="Selecione um ingrediente...">
            {(v) => groupedOptions.find((o) => o.value === v)?.label ?? v}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectSearch placeholder="Buscar..." />
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
    if (!trigger) throw new Error('trigger não encontrado')

    await userEvent.click(trigger)
    const search = await screen.findByRole('combobox', { name: /search/i })
    await userEvent.type(search, 'cen')

    // O filtro local (includes) mantém apenas "Cenoura" — e seu grupo.
    await waitFor(() => {
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Cenoura')
    })

    await userEvent.click(screen.getByRole('option', { name: 'Cenoura' }))
    await expect(args.onValueChange).toHaveBeenCalledWith('carrot')
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    await expect(trigger).toHaveTextContent('Cenoura')
  },
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
    const search = await screen.findByRole('combobox', { name: /search/i })
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
    const search = await screen.findByRole('combobox', { name: /search/i })
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
// Existem só para regressão visual: ficam ocultas da sidebar e dos docs
// (`!dev`/`!autodocs`), mas seguem rodando como smoke test (tag `test`) e
// reativam o snapshot, desligado por padrão no meta. Juntas devem cobrir TODOS
// os comportamentos visuais do Select (ver ADR 0006). Triggers fechados são
// agrupados em grades (um snapshot por família); estados de lista abrem um
// popover por história (`defaultOpen`) para não sobrepor portais.
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Pick<Story, 'tags' | 'parameters'>

// Variante para listas abertas SEM opções (vazia/carregando): um `role="listbox"`
// sem filhos `option` dispara o axe (`aria-required-children`). A auditoria de
// a11y da lista já é coberta pelas histórias interativas (com opções); aqui só
// queremos o snapshot visual do estado, então desligamos o teste de a11y.
const visualNoA11y = {
  tags: visual.tags,
  parameters: { ...visual.parameters, a11y: { test: 'off' } },
} satisfies Pick<Story, 'tags' | 'parameters'>

// Mesmo `renderItem` da história CustomItemRender, para o snapshot da lista.
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

// --- Triggers fechados (grades) --------------------------------------------

/** Visual — os três tamanhos do trigger, com valor. */
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

/** Visual — estados do trigger: placeholder, valor, valor customizado e desabilitado. */
export const VisualTriggerStates: Story = {
  ...visual,
  render: () => (
    <div className="grid w-[34rem] grid-cols-2 gap-4">
      <Select
        options={fruits}
        placeholder="Selecione uma fruta..."
        aria-label="placeholder"
      />
      <Select options={fruits} defaultValue="apple" aria-label="valor" />
      <Select
        options={users}
        defaultValue="ana"
        aria-label="valor customizado"
        renderValue={(o) => (
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" />
            {o.label} · {o.role as string}
          </span>
        )}
      />
      <Select options={fruits} defaultValue="apple" disabled aria-label="desabilitado" />
    </div>
  ),
}

/** Visual — trigger com botão de limpar (`clearable`). */
export const VisualClearable: Story = {
  ...visual,
  args: { clearable: true, defaultValue: 'apple' },
}

/** Visual — triggers multi: chips, resumo "+N" e contador "N / max". */
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
        aria-label="resumo +N"
      />
      <Select
        multiple
        maxCount={3}
        options={fruits}
        defaultValue={['apple', 'banana']}
        aria-label="contador"
      />
    </div>
  ),
}

/** Visual — triggers editáveis (autocomplete): vazio e com chips. */
export const VisualEditable: Story = {
  ...visual,
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Select
        editable
        clearable
        options={fruits}
        placeholder="Busque uma fruta..."
        aria-label="editável"
      />
      <Select
        editable
        multiple
        clearable
        options={fruits}
        defaultValue={['apple', 'banana']}
        aria-label="editável múltiplo"
      />
    </div>
  ),
}

// --- Lista aberta (um popover por história) --------------------------------

/** Visual — lista aberta com o campo de busca. */
export const VisualOpen: Story = {
  ...visual,
  args: { searchable: true, defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — lista aberta com uma opção selecionada (check). */
export const VisualSelected: Story = {
  ...visual,
  args: { searchable: true, defaultOpen: true, defaultValue: 'banana' },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — grupos abertos. */
export const VisualGroups: Story = {
  ...visual,
  args: { options: groupedOptions, defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — render de item customizado (avatar + texto secundário + badge). */
export const VisualCustomItem: Story = {
  ...visual,
  args: { options: users, defaultOpen: true, renderItem: renderUserItem },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — opção desabilitada dentro da lista (Pera). */
export const VisualDisabledOption: Story = {
  ...visual,
  args: { defaultOpen: true },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — estado vazio (nenhuma opção corresponde). */
export const VisualEmpty: Story = {
  ...visualNoA11y,
  args: {
    options: [],
    searchable: true,
    defaultOpen: true,
    messages: { empty: 'Nenhuma fruta encontrada' },
  },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}

/** Visual — indicador de carregamento na lista. */
export const VisualLoading: Story = {
  ...visualNoA11y,
  args: {
    options: [],
    searchable: true,
    defaultOpen: true,
    loading: true,
    messages: { loading: 'Carregando...' },
  },
  render: (args) => (
    <div className="h-96">
      <Select {...args} />
    </div>
  ),
}
