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
  title: 'Overlays/DropdownMenu',
  component: DropdownMenu,
  // No `autodocs`: the docs page is the custom MDX (dropdown-menu.mdx), which
  // embeds these stories. Having both would generate duplicate Docs entries.
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
    // The demo/interaction stories start closed: Chromatic would only see the
    // trigger, so a snapshot isn't worth it. Visual coverage lives in the
    // `Visual*` stories (open), which re-enable the snapshot individually.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof DropdownMenu>

export default meta

type Story = StoryObj<typeof meta>

const onSelect = fn()

/* --------------------------------------------------------------------------
 * Render stories (start closed) — one per composition.
 * The content is portaled into document.body: in play functions use `screen`.
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
            // preventDefault keeps the menu open on each toggle (common pattern).
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
 * Interaction tests — play functions that ARE the regression tests.
 * Portaled content: query the menu and items via `screen`, not `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the menu and exposes `role="menu"`. */
export const OpensOnTrigger: Story = {
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The menu starts closed: nothing portaled yet.
    await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    const trigger = canvas.getByRole('button', { name: 'Open menu' })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    // Close so the story doesn't end open.
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
    // The accessible name includes the shortcut (e.g. "Profile ⇧⌘P") — match by regex.
    await userEvent.click(screen.getByRole('menuitem', { name: /Profile/ }))
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
    // Arrow down focuses the first item (the name includes the shortcut).
    await userEvent.keyboard('{ArrowDown}')
    await expect(screen.getByRole('menuitem', { name: /Profile/ })).toHaveFocus()
    // The next arrow advances to the following item.
    await userEvent.keyboard('{ArrowDown}')
    await expect(screen.getByRole('menuitem', { name: /Settings/ })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    // On close, focus returns to the trigger.
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
    // Since the item calls preventDefault on select, the menu stays open and the
    // state toggles to checked.
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
    // "Bottom" starts checked.
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
    // The previous value is no longer checked (single selection).
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
    // When disabled the item has pointer-events:none; we force the click to prove
    // that onSelect doesn't fire anyway.
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
    // The submenu opens as a second `menu` with its own items.
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeVisible(),
    )
    await userEvent.keyboard('{Escape}')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Visual regression fixtures (Chromatic): render the menu open
 * (`defaultOpen`). Hidden from the sidebar/docs (`!dev`/`!autodocs`), but they
 * keep running as a smoke test (tag `test`) and re-enable the snapshot the meta turns off.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

// Fixtures use `modal={false}`: the menu needs the trigger as the Popper anchor
// to position itself (without it the content doesn't appear). In modal mode the
// trigger would be marked `aria-hidden` while staying focusable (violates `aria-hidden-focus`);
// non-modal doesn't hide the siblings, so the trigger anchors the menu without a violation.

/** Visual capture — default menu open (label, groups, shortcuts, destructive). */
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

/** Visual capture — checkbox and radio items (with checked indicators). */
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

/** Visual capture — disabled item and destructive variant. */
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
