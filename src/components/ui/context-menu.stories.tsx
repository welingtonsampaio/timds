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
  // No `autodocs`: the docs page is the custom MDX (context-menu.mdx), which
  // embeds these stories. Having both would create duplicate Docs entries.
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
    // The demo/interaction stories start closed: Chromatic would only see the
    // trigger, so a snapshot is not worthwhile. Visual coverage lives in the
    // `Visual*` stories (opened via play), which re-enable the snapshot.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof ContextMenu>

export default meta

type Story = StoryObj<typeof meta>

const onSelect = fn()

// ContextMenu has no `defaultOpen` (Radix only opens via the contextmenu event):
// the right-click is simulated with `userEvent.pointer` using the right mouse
// button, which fires `contextmenu` positioning the menu on the target.
const openMenu = (trigger: Element) =>
  userEvent.pointer({ keys: '[MouseRight]', target: trigger })

// Default trigger area used in the stories (right-clicking inside it opens the menu).
const triggerLabel = 'Right click here'

/* --------------------------------------------------------------------------
 * Render stories (start closed) — one per composition.
 * The content is portaled to document.body: in play functions use `screen`.
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
            // preventDefault keeps the menu open on each toggle (common pattern).
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
 * Interaction tests — play functions that ARE the regression tests.
 * Portaled content: query the menu and items via `screen`, not `canvas`.
 * -------------------------------------------------------------------------- */

/** Right-clicking the trigger opens the menu and exposes `role="menu"`. */
export const OpensOnRightClick: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The menu starts closed: nothing portaled yet.
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    const trigger = canvas.getByText(triggerLabel)
    await expect(trigger).toHaveAttribute('data-state', 'closed')
    await openMenu(trigger)
    const menu = await screen.findByRole('menu')
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('data-state', 'open')
    // Close so the story does not end open.
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
    // The accessible name includes the shortcut (e.g. "Reload ⌘R") — match by regex.
    await userEvent.click(screen.getByRole('menuitem', { name: /Reload/ }))
    await expect(onSelect).toHaveBeenCalledOnce()
    // Selecting an item closes the menu.
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
    // Arrow down focuses the first item (the name includes the shortcut).
    await userEvent.keyboard('{ArrowDown}')
    await expect(screen.getByRole('menuitem', { name: /Back/ })).toHaveFocus()
    // The next arrow advances to the following item.
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
    // Since the item calls preventDefault on select, the menu stays open and the
    // state toggles to checked.
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
    // "Pedro Duarte" starts checked.
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
    // The previous value is no longer checked (single selection).
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
    // When disabled the item has pointer-events:none; we force the click to prove
    // onSelect does not fire even so.
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
    // The submenu opens with its own items.
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeVisible(),
    )
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Visual regression fixtures (Chromatic). ContextMenu has no `defaultOpen`,
 * so we open the menu in the play function (right-click). They use `modal={false}`
 * to avoid hiding the siblings while the snapshot is captured open. Hidden from
 * the sidebar/docs (`!dev`/`!autodocs`), but kept as a smoke test (tag `test`) and
 * re-enable the snapshot that the meta turns off.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Visual capture — default menu open (label, groups, shortcuts, destructive). */
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

/** Visual capture — checkbox and radio items (with checked indicators). */
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

/** Visual capture — disabled item, inset, and destructive variant. */
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
