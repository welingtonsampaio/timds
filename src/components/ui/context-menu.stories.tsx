import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu'

const meta = {
  title: 'Overlays/ContextMenu',
  component: ContextMenu,
  // Sem `autodocs`: a página de docs é a MDX customizada (context-menu.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Menu of actions opened by right-clicking (or long-pressing) a region, built on Radix ' +
          '`ContextMenu`. Use it for contextual actions tied to an element or surface — a row, a ' +
          'canvas item, a file in a list. Compose with `ContextMenuTrigger` (the right-clickable ' +
          'area) and `ContextMenuContent`, filling the content with `ContextMenuItem` (regular or ' +
          '`variant="destructive"`), `ContextMenuCheckboxItem`, `ContextMenuRadioGroup`/`RadioItem`, ' +
          '`ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, and nested ' +
          '`ContextMenuSub`. The menu opens at the pointer, focus is trapped while open, arrow keys ' +
          'move between items, and `Escape` or an outside click dismisses it. Each story starts ' +
          'closed — right-click the trigger area to open the menu. For a menu anchored to a button ' +
          'or "⋯" affordance, prefer `DropdownMenu`.',
      },
    },
    // As histórias de demonstração/interação começam fechadas: o Chromatic só
    // veria o trigger, então não vale snapshot. A cobertura visual fica nas
    // histórias `Visual*` (abertas via play), que reativam o snapshot.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof ContextMenu>

export default meta

type Story = StoryObj<typeof meta>

const onSelect = fn()

// O ContextMenu não tem `defaultOpen` (Radix abre apenas pelo evento contextmenu):
// o clique direito é simulado com `userEvent.pointer` usando o botão direito do
// mouse, que dispara o `contextmenu` posicionando o menu no alvo.
const openMenu = (trigger: Element) =>
  userEvent.pointer({ keys: '[MouseRight]', target: trigger })

// Área padrão de gatilho usada nas stories (clique direito dentro dela abre o menu).
const triggerLabel = 'Right click here'

/* --------------------------------------------------------------------------
 * Render stories (começam fechadas) — uma por composição.
 * O conteúdo é portado para document.body: nas play functions use `screen`.
 * -------------------------------------------------------------------------- */

/** Fully interactive — right-click the area and pick an action. */
export const Playground: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
        {triggerLabel}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onSelect={onSelect}>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={onSelect}>
            Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={onSelect}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

/** Checkbox items toggle independent boolean options; selecting keeps the menu open. */
export const WithCheckboxItems: Story = {
  render: (args) => {
    const [showBookmarks, setShowBookmarks] = useState(true)
    const [showUrls, setShowUrls] = useState(false)
    return (
      <ContextMenu {...args}>
        <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
          {triggerLabel}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuLabel>Appearance</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={showBookmarks}
            // preventDefault mantém o menu aberto a cada toggle (padrão comum).
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={setShowBookmarks}
          >
            Bookmarks bar
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showUrls}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={setShowUrls}
          >
            Full URLs
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

/** A radio group picks a single value among options. */
export const WithRadioGroup: Story = {
  render: (args) => {
    const [person, setPerson] = useState('pedro')
    return (
      <ContextMenu {...args}>
        <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
          {triggerLabel}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuLabel>Assign to</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
            <ContextMenuRadioItem value="pedro" onSelect={(e) => e.preventDefault()}>
              Pedro Duarte
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm" onSelect={(e) => e.preventDefault()}>
              Colm Tuite
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

/** A submenu groups related actions behind a nested trigger. */
export const WithSubmenu: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
        {triggerLabel}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={onSelect}>New tab</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={onSelect}>Copy link</ContextMenuItem>
            <ContextMenuItem onSelect={onSelect}>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={onSelect}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

/** Inset items align with a `ContextMenuLabel`, even without a leading icon. */
export const WithInsetItems: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
        {triggerLabel}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel inset>People</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem inset onSelect={onSelect}>
          Invite users
        </ContextMenuItem>
        <ContextMenuItem inset onSelect={onSelect}>
          Manage access
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

/** A disabled item is visible but not selectable. */
export const WithDisabledItem: Story = {
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
        {triggerLabel}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={onSelect}>Edit</ContextMenuItem>
        <ContextMenuItem disabled onSelect={onSelect}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onSelect={onSelect}>Archive</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Conteúdo portado: busque o menu e os itens via `screen`, não `canvas`.
 * -------------------------------------------------------------------------- */

/** Right-clicking the trigger opens the menu and exposes `role="menu"`. */
export const OpensOnRightClick: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // O menu começa fechado: nada portado ainda.
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    const trigger = canvas.getByText(triggerLabel)
    await expect(trigger).toHaveAttribute('data-state', 'closed')
    await openMenu(trigger)
    const menu = await screen.findByRole('menu')
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('data-state', 'open')
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
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
    // O nome acessível inclui o atalho (ex.: "Reload ⌘R") — casamos por regex.
    await userEvent.click(screen.getByRole('menuitem', { name: /Reload/ }))
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
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await expect(onSelect).not.toHaveBeenCalled()
  },
}

/** On open, arrow keys move focus between items. */
export const KeyboardNavigation: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
    // A seta para baixo foca o primeiro item (o nome inclui o atalho).
    await userEvent.keyboard('{ArrowDown}')
    await expect(screen.getByRole('menuitem', { name: /Back/ })).toHaveFocus()
    // A próxima seta avança para o item seguinte.
    await userEvent.keyboard('{ArrowDown}')
    await expect(screen.getByRole('menuitem', { name: /Reload/ })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/** A checkbox item toggles its `aria-checked` state and keeps the menu open. */
export const TogglesCheckboxItem: Story = {
  render: WithCheckboxItems.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
    const urls = screen.getByRole('menuitemcheckbox', { name: 'Full URLs' })
    await expect(urls).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(urls)
    // Como o item faz preventDefault no select, o menu permanece aberto e o
    // estado alterna para marcado.
    await waitFor(() =>
      expect(screen.getByRole('menuitemcheckbox', { name: 'Full URLs' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
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
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
    // "Pedro Duarte" começa marcado.
    await expect(
      screen.getByRole('menuitemradio', { name: 'Pedro Duarte' }),
    ).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Colm Tuite' }))
    await waitFor(() =>
      expect(screen.getByRole('menuitemradio', { name: 'Colm Tuite' })).toHaveAttribute(
        'aria-checked',
        'true',
      ),
    )
    // O valor anterior deixa de estar marcado (seleção única).
    await expect(
      screen.getByRole('menuitemradio', { name: 'Pedro Duarte' }),
    ).toHaveAttribute('aria-checked', 'false')
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
    await openMenu(canvas.getByText(triggerLabel))
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
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
    const subTrigger = screen.getByRole('menuitem', { name: 'Share' })
    await expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu')
    await userEvent.click(subTrigger)
    // O submenu abre com seus próprios itens.
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeVisible(),
    )
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Fixtures de regressão visual (Chromatic). O ContextMenu não tem `defaultOpen`,
 * então abrimos o menu na play function (clique direito). Usam `modal={false}`
 * para não esconder os irmãos enquanto o snapshot é capturado aberto. Ocultas do
 * sidebar/docs (`!dev`/`!autodocs`), mas seguem como smoke test (tag `test`) e
 * reativam o snapshot que o meta desliga.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Captura visual — menu padrão aberto (label, grupos, atalhos, destrutivo). */
export const VisualDefault: Story = {
  ...visual,
  render: (args) => (
    <ContextMenu {...args} modal={false}>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
        {triggerLabel}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
  },
}

/** Captura visual — itens checkbox e radio (com indicadores marcados). */
export const VisualSelectionItems: Story = {
  ...visual,
  render: (args) => (
    <ContextMenu {...args} modal={false}>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
        {triggerLabel}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel>Appearance</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Bookmarks bar</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={false}>Full URLs</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="pedro">
          <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
  },
}

/** Captura visual — item desabilitado, inset e variante destrutiva. */
export const VisualStates: Story = {
  ...visual,
  render: (args) => (
    <ContextMenu {...args} modal={false}>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
        {triggerLabel}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuLabel inset>People</ContextMenuLabel>
        <ContextMenuItem inset>Invite users</ContextMenuItem>
        <ContextMenuItem disabled>Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await openMenu(canvas.getByText(triggerLabel))
    await screen.findByRole('menu')
  },
}
