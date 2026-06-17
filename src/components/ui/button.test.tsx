import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renderiza o conteúdo e o elemento <button>', () => {
    render(<Button>Clique</Button>)
    const button = screen.getByRole('button', { name: 'Clique' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('dispara onClick ao ser clicado', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Ação</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Ação' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('não dispara onClick quando desabilitado', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Desabilitado
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Desabilitado' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renderiza como o filho quando asChild é usado', () => {
    render(
      <Button asChild>
        <a href="/destino">Ir para o destino</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Ir para o destino' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('data-slot', 'button')
  })
})
