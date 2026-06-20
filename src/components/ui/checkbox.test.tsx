import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox, CheckboxGroup, CheckboxGroupItem } from './checkbox'

describe('Checkbox', () => {
  it('normalizes null variant/size to the default', () => {
    const { container } = render(
      <Checkbox variant={null} size={null} aria-label="accept" />,
    )
    const box = container.querySelector('[data-slot="checkbox"]')
    expect(box).toHaveAttribute('data-variant', 'default')
    expect(box).toHaveAttribute('data-size', 'default')
  })

  it('reflects the indeterminate state', () => {
    const { container } = render(
      <Checkbox checked="indeterminate" aria-label="partial" />,
    )
    expect(container.querySelector('[data-slot="checkbox"]')).toHaveAttribute(
      'data-state',
      'indeterminate',
    )
  })
})

describe('CheckboxGroup', () => {
  it('throws an error when the item is used outside a CheckboxGroup', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<CheckboxGroupItem value="a" />)).toThrow(/CheckboxGroup/)
    spy.mockRestore()
  })

  it('toggles values in uncontrolled mode and fires onValueChange', async () => {
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

    // Unchecking removes it from the set.
    await userEvent.click(a)
    expect(onValueChange).toHaveBeenLastCalledWith(['b'])
  })

  it('respects controlled mode (value does not change without the parent updating)', async () => {
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
    // Notifies the change...
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'])
    // ...but, controlled, the state follows the parent's `value`.
    expect(b).not.toBeChecked()
  })

  it('propagates variant/size/disabled and prioritizes the item local props', () => {
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
    // Item B overrides variant and disabled inherited from the group.
    expect(boxes[1]).toHaveAttribute('data-variant', 'destructive')
    expect(boxes[1]).not.toBeDisabled()
  })

  it('applies horizontal orientation on the container', () => {
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
