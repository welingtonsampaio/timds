import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  it('renders with the data-slot and horizontal orientation by default', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('respects the vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
      'data-orientation',
      'vertical',
    )
  })

  it('is decorative by default (no semantic role)', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[data-slot="separator"]')
    // Decorative: Radix uses role="none", removing it from the accessibility tree.
    expect(separator).toHaveAttribute('role', 'none')
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('exposes the separator role when not decorative', () => {
    render(<Separator decorative={false} />)
    // Horizontal is the default for the separator role, so Radix omits aria-orientation.
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('announces the vertical orientation via aria when not decorative', () => {
    render(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('merges consumer classes', () => {
    const { container } = render(<Separator className="my-class" />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveClass('my-class')
  })
})
