import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SidebarMenuButton, useSidebar } from './sidebar'

// Caminho de erro (throw): testado em jsdom porque, numa play function, um
// render que lança quebra a story antes da asserção (ver ADR 0006).
describe('useSidebar', () => {
  it('lança erro quando usado fora do SidebarProvider', () => {
    function Consumer() {
      useSidebar()
      return null
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer />)).toThrow(/SidebarProvider/)
    spy.mockRestore()
  })

  it('SidebarMenuButton também depende do provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <SidebarMenuButton tooltip="Home">
          <span>Home</span>
        </SidebarMenuButton>,
      ),
    ).toThrow(/SidebarProvider/)
    spy.mockRestore()
  })
})
