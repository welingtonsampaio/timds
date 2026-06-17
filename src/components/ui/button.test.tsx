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

  it('renderiza o ícone via prop icon', () => {
    render(<Button icon={<svg data-testid="icone" aria-hidden />}>Com ícone</Button>)
    expect(screen.getByTestId('icone')).toBeInTheDocument()
  })

  it('substitui o ícone pelo spinner e desabilita quando loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading icon={<svg data-testid="icone" aria-hidden />} onClick={onClick}>
        Carregando
      </Button>,
    )
    const button = screen.getByRole('button', { name: /carregando/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByTestId('icone')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('usa type="button" por padrão e respeita htmlType', () => {
    const { rerender } = render(<Button>Padrão</Button>)
    expect(screen.getByRole('button', { name: 'Padrão' })).toHaveAttribute(
      'type',
      'button',
    )
    rerender(<Button htmlType="submit">Enviar</Button>)
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute(
      'type',
      'submit',
    )
  })

  it('renderiza como link <a> quando href é fornecido', () => {
    render(<Button href="/destino">Ir</Button>)
    const link = screen.getByRole('link', { name: 'Ir' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/destino')
    expect(link).not.toHaveAttribute('type')
  })

  it('link desabilitado remove href, marca aria-disabled e sai do tab', () => {
    render(
      <Button href="/destino" disabled>
        Ir
      </Button>,
    )
    const link = screen.getByText('Ir').closest('a') as HTMLAnchorElement
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
  })

  it('ocupa a largura total quando block é usado', () => {
    render(<Button block>Largo</Button>)
    expect(screen.getByRole('button', { name: 'Largo' })).toHaveClass('w-full')
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
