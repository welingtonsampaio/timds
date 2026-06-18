import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select, type SelectOption } from './select'

const options: SelectOption[] = [
  { value: 'apple', label: 'Maçã' },
  { value: 'banana', label: 'Banana' },
  { value: 'pear', label: 'Pera', disabled: true },
]

function openTrigger(container: HTMLElement) {
  const trigger = container.querySelector<HTMLElement>('[data-slot="select-trigger"]')
  if (!trigger) throw new Error('trigger não encontrado')
  return trigger
}

describe('Select', () => {
  it('não usa o <select> nativo e mostra o placeholder', () => {
    const { container } = render(
      <Select options={options} placeholder="Selecione" aria-label="Fruta" />,
    )
    expect(container.querySelector('select')).toBeNull()
    const trigger = openTrigger(container)
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
    expect(trigger).toHaveTextContent('Selecione')
  })

  it('abre a lista ao clicar e expõe as opções', async () => {
    const { container } = render(<Select options={options} aria-label="Fruta" />)
    await userEvent.click(openTrigger(container))

    const listbox = await screen.findByRole('listbox')
    expect(listbox).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Maçã' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
  })

  it('seleciona uma opção, dispara onValueChange e reflete no trigger', async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <Select options={options} onValueChange={onValueChange} aria-label="Fruta" />,
    )
    await userEvent.click(openTrigger(container))
    await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

    expect(onValueChange).toHaveBeenCalledWith('banana')
    await waitFor(() => expect(openTrigger(container)).toHaveTextContent('Banana'))
  })

  it('marca a opção desabilitada com aria-disabled', async () => {
    const { container } = render(<Select options={options} aria-label="Fruta" />)
    await userEvent.click(openTrigger(container))
    const pear = await screen.findByRole('option', { name: 'Pera' })
    expect(pear).toHaveAttribute('aria-disabled', 'true')
  })

  it('reflete o value controlado no trigger', () => {
    const { container } = render(
      <Select options={options} value="apple" aria-label="Fruta" />,
    )
    expect(openTrigger(container)).toHaveTextContent('Maçã')
  })

  it('renderiza o campo de busca acessível quando searchable', async () => {
    const { container } = render(
      <Select options={options} searchable aria-label="Fruta" />,
    )
    await userEvent.click(openTrigger(container))
    const search = await screen.findByRole('combobox', { name: /search/i })
    expect(search).toBeInTheDocument()
  })

  it('filtra as opções pela busca local', async () => {
    const { container } = render(
      <Select options={options} searchable aria-label="Fruta" />,
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

  it('não dispara onValueChange ao clicar numa opção desabilitada', async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <Select options={options} onValueChange={onValueChange} aria-label="Fruta" />,
    )
    await userEvent.click(openTrigger(container))
    const pear = await screen.findByRole('option', { name: 'Pera' })

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(pear)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('aplica o size ao trigger', () => {
    const { container } = render(
      <Select options={options} size="lg" aria-label="Fruta" />,
    )
    const trigger = openTrigger(container)
    expect(trigger).toHaveAttribute('data-size', 'lg')
    expect(trigger).toHaveClass('h-10')
  })

  describe('clearable', () => {
    it('não exibe o botão de limpar quando não há seleção', () => {
      const { container } = render(
        <Select options={options} clearable aria-label="Fruta" />,
      )
      expect(container.querySelector('[data-slot="select-clear"]')).toBeNull()
    })

    it('limpa a seleção single ao clicar no botão de limpar', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          clearable
          defaultValue="apple"
          onValueChange={onValueChange}
          aria-label="Fruta"
        />,
      )
      const trigger = openTrigger(container)
      expect(trigger).toHaveTextContent('Maçã')

      const clear = container.querySelector<HTMLElement>('[data-slot="select-clear"]')
      expect(clear).not.toBeNull()
      await userEvent.click(clear as HTMLElement)

      expect(onValueChange).toHaveBeenLastCalledWith('')
      // Limpar não pode abrir o popover.
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('multiple', () => {
    it('seleciona vários itens, mantém o popover aberto e exibe chips', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          multiple
          onValueChange={onValueChange}
          aria-label="Frutas"
        />,
      )
      await userEvent.click(openTrigger(container))
      await userEvent.click(await screen.findByRole('option', { name: 'Maçã' }))
      await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

      // A lista permanece aberta no modo multi.
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana'])

      const chips = container.querySelectorAll('[data-slot="select-chip"]')
      expect(chips).toHaveLength(2)
      expect(chips[0]).toHaveTextContent('Maçã')
      expect(chips[1]).toHaveTextContent('Banana')
    })

    it('remove um item ao clicar no "x" do chip', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          multiple
          defaultValue={['apple', 'banana']}
          onValueChange={onValueChange}
          aria-label="Frutas"
        />,
      )
      const removes = container.querySelectorAll<HTMLElement>(
        '[data-slot="select-chip-remove"]',
      )
      expect(removes).toHaveLength(2)
      await userEvent.click(removes[0])

      expect(onValueChange).toHaveBeenLastCalledWith(['banana'])
      // Remover o chip não pode abrir a lista.
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('resume o excedente em "+N" respeitando maxDisplayChips', () => {
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
          aria-label="Itens"
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

    it('exibe o contador "N / max"', () => {
      const { container } = render(
        <Select
          options={many}
          multiple
          maxCount={2}
          defaultValue={['v0']}
          aria-label="Itens"
        />,
      )
      const count = container.querySelector('[data-slot="select-count"]')
      expect(count).toHaveTextContent('1 / 2')
    })

    it('desabilita as opções não selecionadas ao atingir o limite', async () => {
      const { container } = render(
        <Select
          options={many}
          multiple
          maxCount={2}
          defaultValue={['v0', 'v1']}
          aria-label="Itens"
        />,
      )
      await userEvent.click(openTrigger(container))
      // As já selecionadas continuam habilitadas (podem ser desmarcadas)...
      expect(await screen.findByRole('option', { name: 'Item 0' })).not.toHaveAttribute(
        'aria-disabled',
        'true',
      )
      // ...as demais ficam desabilitadas.
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
    it('usa um input (role combobox) como gatilho e filtra ao digitar', async () => {
      render(<Select options={options} editable aria-label="Fruta" />)
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

    it('seleciona um item e reflete o rótulo no input (single)', async () => {
      const onValueChange = vi.fn()
      render(
        <Select
          options={options}
          editable
          onValueChange={onValueChange}
          aria-label="Fruta"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

      expect(onValueChange).toHaveBeenCalledWith('banana')
      await waitFor(() => expect(input).toHaveValue('Banana'))
    })

    it('aceita texto livre com allowCustomValue', async () => {
      const onValueChange = vi.fn()
      render(
        <Select
          options={options}
          editable
          allowCustomValue
          onValueChange={onValueChange}
          aria-label="Fruta"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Kiwi')
      const create = await screen.findByRole('option', { name: /Add/ })
      await userEvent.click(create)
      expect(onValueChange).toHaveBeenCalledWith('Kiwi')
    })

    it('não oferece "Add" sem allowCustomValue', async () => {
      render(<Select options={options} editable aria-label="Fruta" />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Kiwi')
      await waitFor(() =>
        expect(screen.queryByRole('option', { name: /Add/ })).not.toBeInTheDocument(),
      )
    })

    it('valor livre criado vira item temporário da lista e some ao desmarcar', async () => {
      render(
        <Select options={options} editable multiple allowCustomValue aria-label="Tags" />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'sdf')
      await userEvent.click(await screen.findByRole('option', { name: /Add/ }))

      // Redigitar exibe o valor como item da lista (com check), não mais "Add".
      await userEvent.type(input, 'sdf')
      const item = await screen.findByRole('option', { name: 'sdf' })
      expect(item).toBeInTheDocument()
      expect(item).toHaveAttribute('aria-selected', 'true')
      expect(screen.queryByRole('option', { name: /Add/ })).not.toBeInTheDocument()

      // Desmarcar pelo item remove-o da seleção e da lista (não é opção oficial).
      await userEvent.click(item)
      await waitFor(() =>
        expect(screen.queryByRole('option', { name: 'sdf' })).not.toBeInTheDocument(),
      )
    })

    it('traduz textos via a prop messages', async () => {
      render(
        <Select
          options={options}
          editable
          allowCustomValue
          messages={{ add: (v) => `Adicionar “${v}”` }}
          aria-label="Fruta"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Kiwi')
      expect(await screen.findByRole('option', { name: /Adicionar/ })).toBeInTheDocument()
    })

    it('multi editable exibe chips e mantém o popover aberto', async () => {
      const onValueChange = vi.fn()
      const { container } = render(
        <Select
          options={options}
          editable
          multiple
          onValueChange={onValueChange}
          aria-label="Frutas"
        />,
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.click(await screen.findByRole('option', { name: 'Maçã' }))
      await userEvent.click(await screen.findByRole('option', { name: 'Banana' }))

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana'])
      expect(container.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2)
    })
  })
})
