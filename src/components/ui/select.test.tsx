import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select, type SelectOption, SelectRoot, SelectSearch } from './select'

const options: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'pear', label: 'Pear', disabled: true },
]

function openTrigger(container: HTMLElement) {
  const trigger = container.querySelector<HTMLElement>('[data-slot="select-trigger"]')
  if (!trigger) throw new Error('trigger not found')
  return trigger
}

describe('Select', () => {
  it('does not use the native <select> and shows the placeholder', () => {
    const { container } = render(
      <Select options={options} placeholder="Select" aria-label="Fruit" />,
    )
    expect(container.querySelector('select')).toBeNull()
    const trigger = openTrigger(container)
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
    expect(trigger).toHaveTextContent('Select')
  })

  it('opens the list on click and exposes the options', async () => {
    const { container } = render(<Select options={options} aria-label="Fruit" />)
    await userEvent.click(openTrigger(container))

    const listbox = await screen.findByRole('listbox')
    expect(listbox).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
  })

  it('selects an option, fires onValueChange and reflects it on the trigger', async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <Select options={options} onValueChange={onValueChange} aria-label="Fruit" />,
    )
    await userEvent.click(openTrigger(container))
    await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

    expect(onValueChange).toHaveBeenCalledWith('banana')
    await waitFor(() => expect(openTrigger(container)).toHaveTextContent('Banana'))
  })

  it('marks the disabled option with aria-disabled', async () => {
    const { container } = render(<Select options={options} aria-label="Fruit" />)
    await userEvent.click(openTrigger(container))
    const pear = await screen.findByRole('option', { name: 'Pear' })
    expect(pear).toHaveAttribute('aria-disabled', 'true')
  })

  it('reflects the controlled value on the trigger', () => {
    const { container } = render(
      <Select options={options} value="apple" aria-label="Fruit" />,
    )
    expect(openTrigger(container)).toHaveTextContent('Apple')
  })

  it('renders the accessible search field when searchable', async () => {
    const { container } = render(
      <Select options={options} searchable aria-label="Fruit" />,
    )
    await userEvent.click(openTrigger(container))
    const search = await screen.findByRole('combobox', { name: /search/i })
    expect(search).toBeInTheDocument()
  })

  it('filters the options via local search', async () => {
    const { container } = render(
      <Select options={options} searchable aria-label="Fruit" />,
    )
    await userEvent.click(openTrigger(container))
    const search = await screen.findByRole('combobox', { name: /search/i })
    await userEvent.type(search, 'ban')

    await waitFor(() => {
      const opts = screen.getAllByRole('option')
      expect(opts).toHaveLength(1)
      expect(opts[0]).toHaveTextContent('Banana')
    })
  })

  it('does not fire onValueChange when clicking a disabled option', async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <Select options={options} onValueChange={onValueChange} aria-label="Fruit" />,
    )
    await userEvent.click(openTrigger(container))
    const pear = await screen.findByRole('option', { name: 'Pear' })

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(pear)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('applies the size to the trigger', () => {
    const { container } = render(
      <Select options={options} size="lg" aria-label="Fruit" />,
    )
    const trigger = openTrigger(container)
    expect(trigger).toHaveAttribute('data-size', 'lg')
    expect(trigger).toHaveClass('h-10')
  })

  describe('clearable', () => {
    it('does not show the clear button when there is no selection', () => {
      const { container } = render(
        <Select options={options} clearable aria-label="Fruit" />,
      )
      expect(container.querySelector('[data-slot="select-clear"]')).toBeNull()
    })

    it('clears the single selection when clicking the clear button', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          clearable
          defaultValue="apple"
          onValueChange={onValueChange}
          aria-label="Fruit"
        />,
      )
      const trigger = openTrigger(container)
      expect(trigger).toHaveTextContent('Apple')

      const clear = container.querySelector<HTMLElement>('[data-slot="select-clear"]')
      expect(clear).not.toBeNull()
      await userEvent.click(clear as HTMLElement)

      expect(onValueChange).toHaveBeenLastCalledWith('')
      // Clearing must not open the popover.
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('multiple', () => {
    it('selects multiple items, keeps the popover open and shows chips', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          multiple
          onValueChange={onValueChange}
          aria-label="Fruits"
        />,
      )
      await userEvent.click(openTrigger(container))
      await userEvent.click(await screen.findByRole('option', { name: 'Apple' }))
      await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

      // The list stays open in multi mode.
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana'])

      const chips = container.querySelectorAll('[data-slot="select-chip"]')
      expect(chips).toHaveLength(2)
      expect(chips[0]).toHaveTextContent('Apple')
      expect(chips[1]).toHaveTextContent('Banana')
    })

    it('removes an item when clicking the chip "x"', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          multiple
          defaultValue={['apple', 'banana']}
          onValueChange={onValueChange}
          aria-label="Fruits"
        />,
      )
      const removes = container.querySelectorAll<HTMLElement>(
        '[data-slot="select-chip-remove"]',
      )
      expect(removes).toHaveLength(2)
      await userEvent.click(removes[0])

      expect(onValueChange).toHaveBeenLastCalledWith(['banana'])
      // Removing the chip must not open the list.
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('summarizes the overflow as "+N" respecting maxDisplayChips', () => {
      const many: SelectOption[] = Array.from({ length: 5 }, (_, i) => ({
        value: `v${i}`,
        label: `Item ${i}`,
      }))
      const { container } = render(
        <Select
          options={many}
          multiple
          maxDisplayChips={2}
          defaultValue={['v0', 'v1', 'v2', 'v3']}
          aria-label="Items"
        />,
      )
      expect(container.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2)
      expect(openTrigger(container)).toHaveTextContent('+2')
    })
  })

  describe('maxCount (multi)', () => {
    const many: SelectOption[] = Array.from({ length: 4 }, (_, i) => ({
      value: `v${i}`,
      label: `Item ${i}`,
    }))

    it('shows the "N / max" counter', () => {
      const { container } = render(
        <Select
          options={many}
          multiple
          maxCount={2}
          defaultValue={['v0']}
          aria-label="Items"
        />,
      )
      const count = container.querySelector('[data-slot="select-count"]')
      expect(count).toHaveTextContent('1 / 2')
    })

    it('disables the unselected options when reaching the limit', async () => {
      const { container } = render(
        <Select
          options={many}
          multiple
          maxCount={2}
          defaultValue={['v0', 'v1']}
          aria-label="Items"
        />,
      )
      await userEvent.click(openTrigger(container))
      // Already-selected ones stay enabled (they can be deselected)...
      expect(await screen.findByRole('option', { name: 'Item 0' })).not.toHaveAttribute(
        'aria-disabled',
        'true',
      )
      // ...the rest become disabled.
      expect(screen.getByRole('option', { name: 'Item 2' })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      expect(container.querySelector('[data-slot="select-count"]')).toHaveTextContent(
        '2 / 2',
      )
    })
  })

  describe('editable (autocomplete)', () => {
    it('uses an input (combobox role) as the trigger and filters while typing', async () => {
      render(<Select options={options} editable aria-label="Fruit" />)
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('data-slot', 'select-input')

      await userEvent.click(input)
      await userEvent.type(input, 'ban')
      await waitFor(() => {
        const opts = screen.getAllByRole('option')
        expect(opts).toHaveLength(1)
        expect(opts[0]).toHaveTextContent('Banana')
      })
    })

    it('selects an item and reflects the label in the input (single)', async () => {
      const onValueChange = vi.fn()
      render(
        <Select
          options={options}
          editable
          onValueChange={onValueChange}
          aria-label="Fruit"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

      expect(onValueChange).toHaveBeenCalledWith('banana')
      await waitFor(() => expect(input).toHaveValue('Banana'))
    })

    it('accepts free text with allowCustomValue', async () => {
      const onValueChange = vi.fn()
      render(
        <Select
          options={options}
          editable
          allowCustomValue
          onValueChange={onValueChange}
          aria-label="Fruit"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Kiwi')
      const create = await screen.findByRole('option', { name: /Add/ })
      await userEvent.click(create)
      expect(onValueChange).toHaveBeenCalledWith('Kiwi')
    })

    it('does not offer "Add" without allowCustomValue', async () => {
      render(<Select options={options} editable aria-label="Fruit" />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Kiwi')
      await waitFor(() =>
        expect(screen.queryByRole('option', { name: /Add/ })).not.toBeInTheDocument(),
      )
    })

    it('a created free value becomes a temporary list item and disappears when deselected', async () => {
      render(
        <Select options={options} editable multiple allowCustomValue aria-label="Tags" />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'sdf')
      await userEvent.click(await screen.findByRole('option', { name: /Add/ }))

      // Retyping shows the value as a list item (with a check), no longer "Add".
      await userEvent.type(input, 'sdf')
      const item = await screen.findByRole('option', { name: 'sdf' })
      expect(item).toBeInTheDocument()
      expect(item).toHaveAttribute('aria-selected', 'true')
      expect(screen.queryByRole('option', { name: /Add/ })).not.toBeInTheDocument()

      // Deselecting via the item removes it from the selection and the list (it is not an official option).
      await userEvent.click(item)
      await waitFor(() =>
        expect(screen.queryByRole('option', { name: 'sdf' })).not.toBeInTheDocument(),
      )
    })

    it('translates texts via the messages prop', async () => {
      render(
        <Select
          options={options}
          editable
          allowCustomValue
          messages={{ add: (v) => `Create “${v}”` }}
          aria-label="Fruit"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Kiwi')
      expect(await screen.findByRole('option', { name: /Create/ })).toBeInTheDocument()
    })

    it('multi editable shows chips and keeps the popover open', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          editable
          multiple
          onValueChange={onValueChange}
          aria-label="Fruits"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.click(await screen.findByRole('option', { name: 'Apple' }))
      await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana'])
      expect(container.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2)
    })

    it('removes a chip via the "x" in editable multi mode', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          editable
          multiple
          defaultValue={['apple', 'banana']}
          onValueChange={onValueChange}
          aria-label="Fruits"
        />,
      )
      const removes = container.querySelectorAll<HTMLElement>(
        '[data-slot="select-chip-remove"]',
      )
      expect(removes).toHaveLength(2)
      await userEvent.click(removes[0])
      expect(onValueChange).toHaveBeenLastCalledWith(['banana'])
    })

    it('clears the selection via the clear button in editable mode', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          editable
          clearable
          defaultValue="apple"
          onValueChange={onValueChange}
          aria-label="Fruit"
        />,
      )
      const clear = container.querySelector<HTMLElement>('[data-slot="select-clear"]')
      expect(clear).not.toBeNull()
      await userEvent.click(clear as HTMLElement)
      expect(onValueChange).toHaveBeenLastCalledWith('')
    })

    it('opens the list via the disclosure button', async () => {
      const { container } = render(
        <Select options={options} editable aria-label="Fruit" />,
      )
      const disclosure = container.querySelector<HTMLElement>(
        '[data-slot="select-disclosure"]',
      )
      expect(disclosure).not.toBeNull()
      await userEvent.click(disclosure as HTMLElement)
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('uses renderItem in the editable mode list', async () => {
      render(
        <Select
          options={options}
          editable
          renderItem={(o) => `E:${o.label}`}
          aria-label="Fruit"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      expect(await screen.findByText('E:Apple')).toBeInTheDocument()
    })

    it('uses renderItem with maxCount (LimitedEditableItem)', async () => {
      render(
        <Select
          options={options}
          editable
          multiple
          maxCount={2}
          renderItem={(o) => `L:${o.label}`}
          aria-label="Fruits"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      expect(await screen.findByText('L:Apple')).toBeInTheDocument()
    })

    it('uses renderValue in the chips and summarizes as "+N" (editable multi)', () => {
      const many: SelectOption[] = Array.from({ length: 4 }, (_, i) => ({
        value: `v${i}`,
        label: `I${i}`,
      }))
      const { container } = render(
        <Select
          options={many}
          editable
          multiple
          renderValue={(o) => `C:${o.label}`}
          maxDisplayChips={2}
          defaultValue={['v0', 'v1', 'v2']}
          aria-label="Tags"
        />,
      )
      expect(container).toHaveTextContent('C:I0')
      expect(container).toHaveTextContent('+1')
    })

    it('editable: does not fire onLoadMore while loading', async () => {
      const onLoadMore = vi.fn()
      render(
        <Select
          options={options}
          editable
          onLoadMore={onLoadMore}
          hasMore
          loading
          aria-label="Fruit"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      const list = (await screen.findByRole('listbox')) as HTMLElement
      fireEvent.scroll(list)
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('groups the options by group in editable mode', async () => {
      const grouped: SelectOption[] = [
        { value: 'apple', label: 'Apple', group: 'Fruits' },
        // A second item in the same group exercises the "append" into the existing bucket.
        { value: 'pear', label: 'Pear', group: 'Fruits' },
        { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
      ]
      render(<Select options={grouped} editable aria-label="Food" />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await screen.findByRole('listbox')
      expect(screen.getByText('Fruits')).toBeInTheDocument()
      expect(screen.getByText('Vegetables')).toBeInTheDocument()
    })
  })

  describe('infinite scroll (onLoadMore)', () => {
    it('fires onLoadMore when scrolling the list (single)', async () => {
      const onLoadMore = vi.fn()
      const { container } = render(
        <Select options={options} onLoadMore={onLoadMore} hasMore aria-label="Fruit" />,
      )
      await userEvent.click(openTrigger(container))
      await screen.findByRole('listbox')
      const list = container.querySelector<HTMLElement>('[data-slot="select-list"]')
      fireEvent.scroll(list as HTMLElement)
      expect(onLoadMore).toHaveBeenCalled()
    })

    it('does not fire onLoadMore while loading', async () => {
      const onLoadMore = vi.fn()
      const { container } = render(
        <Select
          options={options}
          onLoadMore={onLoadMore}
          hasMore
          loading
          aria-label="Fruit"
        />,
      )
      await userEvent.click(openTrigger(container))
      await screen.findByRole('listbox')
      const list = container.querySelector<HTMLElement>('[data-slot="select-list"]')
      fireEvent.scroll(list as HTMLElement)
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('fires onLoadMore when scrolling the list (editable)', async () => {
      const onLoadMore = vi.fn()
      render(
        <Select
          options={options}
          editable
          onLoadMore={onLoadMore}
          hasMore
          aria-label="Fruit"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      const list = (await screen.findByRole('listbox')) as HTMLElement
      fireEvent.scroll(list)
      expect(onLoadMore).toHaveBeenCalled()
    })

    it('does not fire onLoadMore when still far from the end (standard)', async () => {
      const onLoadMore = vi.fn()
      const { container } = render(
        <Select options={options} onLoadMore={onLoadMore} hasMore aria-label="Fruit" />,
      )
      await userEvent.click(openTrigger(container))
      await screen.findByRole('listbox')
      const list = container.querySelector<HTMLElement>(
        '[data-slot="select-list"]',
      ) as HTMLElement
      // Forge the layout metrics: still far from the end (>= 96px).
      Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 1000 })
      Object.defineProperty(list, 'clientHeight', { configurable: true, value: 200 })
      Object.defineProperty(list, 'scrollTop', { configurable: true, value: 0 })
      fireEvent.scroll(list)
      expect(onLoadMore).not.toHaveBeenCalled()
    })
  })

  describe('custom render and groups (standard)', () => {
    const kinded: SelectOption[] = [
      { value: 'a', label: 'A', kind: 'X' },
      { value: 'b', label: 'B', kind: 'Y' },
    ]

    it('groups via groupBy and uses renderItem/renderValue', async () => {
      const { container } = render(
        <Select
          options={kinded}
          groupBy={(o) => o.kind as string}
          renderItem={(o) => `item:${o.label}`}
          renderValue={(o) => `val:${o.label}`}
          defaultValue="a"
          aria-label="K"
        />,
      )
      // renderValue reflects on the trigger.
      expect(openTrigger(container)).toHaveTextContent('val:A')
      await userEvent.click(openTrigger(container))
      await screen.findByRole('listbox')
      expect(screen.getByText('X')).toBeInTheDocument()
      expect(screen.getByText('Y')).toBeInTheDocument()
      // renderItem reflects in the list.
      expect(screen.getByText('item:A')).toBeInTheDocument()
    })

    it('uses an empty group label when the option has no group', async () => {
      const mixed: SelectOption[] = [
        { value: 'a', label: 'A', group: 'Group' },
        { value: 'b', label: 'B' },
      ]
      const { container } = render(<Select options={mixed} aria-label="M" />)
      await userEvent.click(openTrigger(container))
      await screen.findByRole('listbox')
      expect(screen.getByText('Group')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument()
    })

    it('shows the raw value on the trigger when it is not in the options (single)', () => {
      const { container } = render(
        <Select options={options} defaultValue="unknown" aria-label="Fruit" />,
      )
      expect(openTrigger(container)).toHaveTextContent('unknown')
    })

    it('clears the multi selection via the clear button', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          multiple
          clearable
          defaultValue={['apple', 'banana']}
          onValueChange={onValueChange}
          aria-label="Fruits"
        />,
      )
      const clear = container.querySelector<HTMLElement>('[data-slot="select-clear"]')
      expect(clear).not.toBeNull()
      await userEvent.click(clear as HTMLElement)
      expect(onValueChange).toHaveBeenLastCalledWith([])
    })

    it('shows the loading indicator', async () => {
      const { container } = render(
        <Select options={options} loading aria-label="Fruit" />,
      )
      await userEvent.click(openTrigger(container))
      expect(container.querySelector('[data-slot="select-loading"]')).toBeInTheDocument()
    })

    it('uses renderItem with maxCount in standard (LimitedSelectItem)', async () => {
      const { container } = render(
        <Select
          options={options}
          multiple
          maxCount={2}
          renderItem={(o) => `X:${o.label}`}
          aria-label="Fruits"
        />,
      )
      await userEvent.click(openTrigger(container))
      expect(await screen.findByText('X:Apple')).toBeInTheDocument()
    })

    it('renders in virtualized mode', async () => {
      const many: SelectOption[] = Array.from({ length: 150 }, (_, i) => ({
        value: `v${i}`,
        label: `Item ${i}`,
      }))
      const { container } = render(<Select options={many} virtualized aria-label="V" />)
      await userEvent.click(openTrigger(container))
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('works without an explicit aria-label (uses the default messages)', async () => {
      const { container } = render(<Select options={options} searchable />)
      await userEvent.click(openTrigger(container))
      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('SelectSearch returns null outside a ComboboxProvider', () => {
      const { container } = render(
        <SelectRoot combobox={false} items={[]}>
          <SelectSearch />
        </SelectRoot>,
      )
      expect(container.querySelector('[data-slot="select-search"]')).toBeNull()
    })
  })
})
