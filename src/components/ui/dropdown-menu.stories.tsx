import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  // Sem `autodocs`: a página de docs é a MDX customizada (dropdown-menu.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Menu of actions anchored to a trigger, built on Radix `DropdownMenu`. Use it for ' +
          'secondary or overflow actions tied to an element — a row "⋯" menu, an account menu, ' +
          'a toolbar of options. Compose with `DropdownMenuTrigger` and `DropdownMenuContent`, ' +
          'filling the content with `DropdownMenuItem` (regular or `variant="destructive"`), ' +
          '`DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`/`RadioItem`, `DropdownMenuLabel`, ' +
          '`DropdownMenuSeparator`, `DropdownMenuShortcut`, and nested `DropdownMenuSub`. Focus ' +
          'is trapped while open, arrow keys move between items, and `Escape` or an outside click ' +
          'dismisses it. Each story starts closed — click the trigger to open the menu. For ' +
          'single-value selection inside a form, prefer `Select`.',
      },
    },
    // As histórias de demonstração/interação começam fechadas: o Chromatic só
    // veria o trigger, então não vale snapshot. A cobertura visual fica nas
    // histórias `Visual*` (abertas), que reativam o snapshot individualmente.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof DropdownMenu>

export default meta

type Story = StoryObj<typeof meta>

const onSelect = fn()

/* --------------------------------------------------------------------------
 * Render stories (começam fechadas) — uma por composição.
 * O conteúdo é portado para document.body: nas play functions use `screen`.
 * -------------------------------------------------------------------------- */

/** Fully interactive — open the menu and pick an action. */
export const Playground: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onSelect}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSelect}>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onSelect}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/** Checkbox items toggle independent boolean options; selecting keeps the menu open. */
export const WithCheckboxItems: Story = {
  render: (args) => {
    const [showStatus, setShowStatus] = useState(true)
    const [showActivity, setShowActivity] = useState(false)
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">View options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Panels</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showStatus}
            // preventDefault mantém o menu aberto a cada toggle (padrão comum).
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={setShowStatus}
          >
            Status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showActivity}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={setShowActivity}
          >
            Activity bar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}

/** A radio group picks a single value among options. */
export const WithRadioGroup: Story = {
  render: (args) => {
    const [position, setPosition] = useState('bottom')
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Panel position</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel>Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top" onSelect={(e) => e.preventDefault()}>
              Top
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom" onSelect={(e) => e.preventDefault()}>
              Bottom
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right" onSelect={(e) => e.preventDefault()}>
              Right
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}

/** A submenu groups related actions behind a nested trigger. */
export const WithSubmenu: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">More actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onSelect={onSelect}>New file</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={onSelect}>Copy link</DropdownMenuItem>
            <DropdownMenuItem onSelect={onSelect}>Email</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onSelect}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/** A disabled item is visible but not selectable. */
export const WithDisabledItem: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled onSelect={onSelect}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSelect}>Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Conteúdo portado: busque o menu e os itens via `screen`, não `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the menu and exposes `role="menu"`. */
export const OpensOnTrigger: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // O menu começa fechado: nada portado ainda.
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    const trigger = canvas.getByRole('button', { name: 'Open menu' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // Fecha para a story não terminar aberta.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/** Selecting an item fires its `onSelect` and closes the menu. */
export const SelectsItem: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    onSelect.mockClear()
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }))
    await screen.findByRole('menu')
    // O nome acessível inclui o atalho (ex.: "Profile ⇧⌘P") — casamos por regex.
    await userEvent.click(screen.getByRole('menuitem', { name: /Profile/ }))
    await expect(onSelect).toHaveBeenCalledOnce()
    // Selecionar um item fecha o menu.
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/** Pressing `Escape` closes the menu without selecting anything. */
export const EscapeDismisses: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    onSelect.mockClear()
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }))
    await screen.findByRole('menu')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await expect(onSelect).not.toHaveBeenCalled()
  },
}

/** On open, focus moves into the menu; arrow keys move between items. */
export const KeyboardNavigation: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open menu' })
    await userEvent.click(trigger)
    await screen.findByRole('menu')
    // A seta para baixo foca o primeiro item (o nome inclui o atalho).
    await userEvent.keyboard('{ArrowDown}')
    await expect(screen.getByRole('menuitem', { name: /Profile/ })).toHaveFocus()
    // A próxima seta avança para o item seguinte.
    await userEvent.keyboard('{ArrowDown}')
    await expect(screen.getByRole('menuitem', { name: /Settings/ })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    // Ao fechar, o foco retorna ao trigger.
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/** A checkbox item toggles its `aria-checked` state and keeps the menu open. */
export const TogglesCheckboxItem: Story = {
  render: WithCheckboxItems.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'View options' }))
    await screen.findByRole('menu')
    const activity = screen.getByRole('menuitemcheckbox', { name: 'Activity bar' })
    await expect(activity).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(activity)
    // Como o item faz preventDefault no select, o menu permanece aberto e o
    // estado alterna para marcado.
    await waitFor(() =>
      expect(
        screen.getByRole('menuitemcheckbox', { name: 'Activity bar' }),
      ).toHaveAttribute('aria-checked', 'true'),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/** Selecting a radio item moves the single checked value within the group. */
export const SelectsRadioItem: Story = {
  render: WithRadioGroup.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Panel position' }))
    await screen.findByRole('menu')
    // "Bottom" começa marcado.
    await expect(screen.getByRole('menuitemradio', { name: 'Bottom' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Top' }))
    await waitFor(() =>
      expect(screen.getByRole('menuitemradio', { name: 'Top' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    )
    // O valor anterior deixa de estar marcado (seleção única).
    await expect(screen.getByRole('menuitemradio', { name: 'Bottom' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/** A disabled item is exposed as disabled and does not fire `onSelect`. */
export const DisabledItemDoesNotFire: Story = {
  render: WithDisabledItem.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    onSelect.mockClear()
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }))
    await screen.findByRole('menu')
    const disabled = screen.getByRole('menuitem', { name: 'Duplicate' })
    await expect(disabled).toHaveAttribute('aria-disabled', 'true')
    // Em disabled o item tem pointer-events:none; forçamos o clique para provar
    // que onSelect não dispara mesmo assim.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(disabled)
    await expect(onSelect).not.toHaveBeenCalled()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/** Hovering the sub-trigger opens the nested submenu. */
export const OpensSubmenu: Story = {
  render: WithSubmenu.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'More actions' }))
    await screen.findByRole('menu')
    const subTrigger = screen.getByRole('menuitem', { name: 'Share' })
    await expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu')
    await userEvent.click(subTrigger)
    // O submenu abre como um segundo `menu` com seus próprios itens.
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeVisible(),
    )
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Fixtures de regressão visual (Chromatic): renderizam o menu aberto
 * (`defaultOpen`). Ocultas do sidebar/docs (`!dev`/`!autodocs`), mas seguem
 * rodando como smoke test (tag `test`) e reativam o snapshot que o meta desliga.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

// Fixtures usam `modal={false}`: o menu precisa do trigger como âncora do Popper
// para se posicionar (sem ele o conteúdo não aparece). No modo modal o trigger
// seria marcado `aria-hidden` mantendo-se focável (viola `aria-hidden-focus`);
// não-modal não esconde os irmãos, então o trigger ancora o menu sem violação.

/** Captura visual — menu padrão aberto (label, grupos, atalhos, destrutivo). */
export const VisualDefault: Story = {
  ...visual,
  render: (args) => (
    <DropdownMenu {...args} defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/** Captura visual — itens checkbox e radio (com indicadores marcados). */
export const VisualSelectionItems: Story = {
  ...visual,
  render: (args) => (
    <DropdownMenu {...args} defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Panels</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Status bar</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>Activity bar</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="bottom">
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/** Captura visual — item desabilitado e variante destrutiva. */
export const VisualStates: Story = {
  ...visual,
  render: (args) => (
    <DropdownMenu {...args} defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
