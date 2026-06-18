import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  it('renderiza com o data-slot e orientação horizontal por padrão', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('respeita a orientação vertical', () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
      'data-orientation',
      'vertical',
    )
  })

  it('é decorativo por padrão (sem papel semântico)', () => {
    const { container } = render(<Separator />)
    const separator = container.querySelector('[data-slot="separator"]')
    // Decorativo: o Radix usa role="none", removendo-o da árvore de acessibilidade.
    expect(separator).toHaveAttribute('role', 'none')
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('expõe o papel separator quando não decorativo', () => {
    render(<Separator decorative={false} />)
    // Horizontal é o default do papel separator, então o Radix omite aria-orientation.
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('anuncia a orientação vertical via aria quando não decorativo', () => {
    render(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('mescla classes do consumidor', () => {
    const { container } = render(<Separator className="minha-classe" />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveClass('minha-classe')
  })
})
