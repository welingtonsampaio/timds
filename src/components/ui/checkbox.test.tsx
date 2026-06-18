import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox, CheckboxGroup, CheckboxGroupItem } from './checkbox'

describe('Checkbox', () => {
  it('normaliza variant/size nulos para o padrão', () => {
    const { container } = render(
      <Checkbox variant={null} size={null} aria-label="aceitar" />,
    )
    const box = container.querySelector('[data-slot="checkbox"]')
    expect(box).toHaveAttribute('data-variant', 'default')
    expect(box).toHaveAttribute('data-size', 'default')
  })

  it('reflete o estado indeterminate', () => {
    const { container } = render(
      <Checkbox checked="indeterminate" aria-label="parcial" />,
    )
    expect(container.querySelector('[data-slot="checkbox"]')).toHaveAttribute(
      'data-state',
      'indeterminate',
    )
  })
})

describe('CheckboxGroup', () => {
  it('lança erro quando o item é usado fora de um CheckboxGroup', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<CheckboxGroupItem value="a" />)).toThrow(/CheckboxGroup/)
    spy.mockRestore()
  })

  it('alterna valores no modo não-controlado e dispara onValueChange', async () => {
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup defaultValue={['a']} onValueChange={onValueChange} name="g">
        <CheckboxGroupItem value="a" aria-label="A" />
        <CheckboxGroupItem value="b" aria-label="B" />
      </CheckboxGroup>,
    )
    const [a, b] = screen.getAllByRole('checkbox')
    expect(a).toBeChecked()
    expect(b).not.toBeChecked()

    await userEvent.click(b)
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'])
    expect(b).toBeChecked()

    // Desmarcar remove do conjunto.
    await userEvent.click(a)
    expect(onValueChange).toHaveBeenLastCalledWith(['b'])
  })

  it('respeita o modo controlado (value não muda sem o pai atualizar)', async () => {
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup value={['a']} onValueChange={onValueChange}>
        <CheckboxGroupItem value="a" aria-label="A" />
        <CheckboxGroupItem value="b" aria-label="B" />
      </CheckboxGroup>,
    )
    const [a, b] = screen.getAllByRole('checkbox')
    expect(a).toBeChecked()

    await userEvent.click(b)
    // Notifica a mudança...
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'])
    // ...mas, controlado, o estado segue o `value` do pai.
    expect(b).not.toBeChecked()
  })

  it('propaga variant/size/disabled e prioriza props locais do item', () => {
    const { container } = render(
      <CheckboxGroup variant="success" size="lg" disabled>
        <CheckboxGroupItem value="a" aria-label="A" />
        <CheckboxGroupItem
          value="b"
          variant="destructive"
          disabled={false}
          aria-label="B"
        />
      </CheckboxGroup>,
    )
    const boxes = container.querySelectorAll('[data-slot="checkbox"]')
    expect(boxes[0]).toHaveAttribute('data-variant', 'success')
    expect(boxes[0]).toHaveAttribute('data-size', 'lg')
    expect(boxes[0]).toBeDisabled()
    // Item B sobrescreve variant e disabled herdados do grupo.
    expect(boxes[1]).toHaveAttribute('data-variant', 'destructive')
    expect(boxes[1]).not.toBeDisabled()
  })

  it('aplica a orientação horizontal no container', () => {
    const { container } = render(
      <CheckboxGroup orientation="horizontal">
        <CheckboxGroupItem value="a" aria-label="A" />
      </CheckboxGroup>,
    )
    expect(container.querySelector('[data-slot="checkbox-group"]')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    )
  })
})
