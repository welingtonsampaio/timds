import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SidebarMenuButton, useSidebar } from './sidebar'

// Error path (throw): tested in jsdom because, in a play function, a
// render that throws breaks the story before the assertion (see ADR 0006).
describe('useSidebar', () => {
  it('throws an error when used outside the SidebarProvider', () => {
    function Consumer() {
      useSidebar()
      return null
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer />)).toThrow(/SidebarProvider/)
    spy.mockRestore()
  })

  it('SidebarMenuButton also depends on the provider', () => {
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
