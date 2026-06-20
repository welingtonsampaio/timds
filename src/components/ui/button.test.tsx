import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders the content and the <button> element', () => {
    render(<Button>Click</Button>)
    const button = screen.getByRole('button', { name: 'Click' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-slot', 'button')
  })

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Action</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Action' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Disabled' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders the icon via the icon prop', () => {
    render(<Button icon={<svg data-testid="icone" aria-hidden />}>With icon</Button>)
    expect(screen.getByTestId('icone')).toBeInTheDocument()
  })

  it('replaces the icon with the spinner and disables when loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading icon={<svg data-testid="icone" aria-hidden />} onClick={onClick}>
        Loading
      </Button>,
    )
    const button = screen.getByRole('button', { name: /loading/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByTestId('icone')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses type="button" by default and respects htmlType', () => {
    const { rerender } = render(<Button>Default</Button>)
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute(
      'type',
      'button',
    )
    rerender(<Button htmlType="submit">Submit</Button>)
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute(
      'type',
      'submit',
    )
  })

  it('renders as an <a> link when href is provided', () => {
    render(<Button href="/destino">Go</Button>)
    const link = screen.getByRole('link', { name: 'Go' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/destino')
    expect(link).not.toHaveAttribute('type')
  })

  it('disabled link removes href, sets aria-disabled and leaves the tab order', () => {
    render(
      <Button href="/destino" disabled>
        Go
      </Button>,
    )
    const link = screen.getByText('Go').closest('a') as HTMLAnchorElement
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
  })

  it('takes the full width when block is used', () => {
    render(<Button block>Wide</Button>)
    expect(screen.getByRole('button', { name: 'Wide' })).toHaveClass('w-full')
  })

  it('renders as the child when asChild is used', () => {
    render(
      <Button asChild>
        <a href="/destino">Go to destination</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Go to destination' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('data-slot', 'button')
  })
})
