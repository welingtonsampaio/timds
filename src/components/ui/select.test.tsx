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
    const search = await screen.findByRole('combobox', { name: /buscar fruta/i })
    expect(search).toBeInTheDocument()
  })

  it('filtra as opções pela busca local', async () => {
    const { container } = render(
      <Select options={options} searchable aria-label="Fruta" />,
    )
    await userEvent.click(openTrigger(container))
    const search = await screen.findByRole('combobox', { name: /buscar/i })
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
})
