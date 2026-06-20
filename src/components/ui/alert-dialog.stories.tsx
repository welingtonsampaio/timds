import type { Meta, StoryObj } from '@storybook/react-vite'
import { TriangleAlert } from 'lucide-react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { Button } from './button'

const meta = {
  title: 'Overlays/AlertDialog',
  component: AlertDialog,
  // No `autodocs`: the docs page is the custom MDX (alert-dialog.mdx), which
  // embeds these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Modal confirmation dialog built on Radix `AlertDialog`. Unlike a plain Dialog it ' +
          'interrupts the user and expects an explicit choice — use it for destructive or ' +
          'irreversible actions. Compose with `AlertDialogTrigger`, `AlertDialogContent` ' +
          '(`size`: `default` | `sm`), `AlertDialogHeader`/`Footer`, `AlertDialogTitle`/' +
          '`Description`, and the `AlertDialogAction`/`AlertDialogCancel` buttons (both accept ' +
          "the Button's `variant`/`size`). An optional `AlertDialogMedia` slot holds a leading " +
          'icon. Focus is trapped and `Escape`/overlay clicks resolve via Cancel. Each story ' +
          'starts closed — click the trigger to open the dialog.',
      },
    },
    // The demo/interaction stories start closed: Chromatic would only see the
    // trigger, so a snapshot is not worth it. Visual coverage lives in the
    // `Visual*` stories (open), which re-enable the snapshot individually.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof AlertDialog>

export default meta

type Story = StoryObj<typeof meta>

const onConfirm = fn()
const onCancel = fn()

/* --------------------------------------------------------------------------
 * Render stories (start closed) — one per composition.
 * The content is portaled to document.body: in play functions use `screen`.
 * -------------------------------------------------------------------------- */

/** Fully interactive — open the dialog and pick an action. */
export const Playground: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and
            remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** A destructive confirmation — the action uses the Button `destructive` variant. */
export const DestructiveAction: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            All boards, tasks and history will be lost. This cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** `size="sm"` renders a compact, centered dialog with a two-column footer. */
export const SmallSize: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Discard changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** `AlertDialogMedia` adds a leading icon above (or beside) the title. */
export const WithMedia: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Check storage</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Storage almost full</AlertDialogTitle>
          <AlertDialogDescription>
            You are using 92% of your quota. Free up space or upgrade your plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Later</AlertDialogCancel>
          <AlertDialogAction>Upgrade</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions that ARE the regression tests.
 * Portaled content: query the dialog and buttons via `screen`, not `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the dialog and exposes `role="alertdialog"`. */
export const OpensOnTrigger: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The dialog starts closed: nothing portaled yet.
    await expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    const dialog = await screen.findByRole('alertdialog')
    // waitFor covers the enter animation (opacity 0 on the first frame).
    await waitFor(() => expect(dialog).toBeVisible())
    // The dialog is named by the title and described by the description (Radix wires it up).
    await expect(dialog).toHaveAccessibleName('Are you absolutely sure?')
    // Close it so the story does not end open (avoids aria-hidden-focus with the trigger).
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  },
}

/** Opening the trigger reveals the dialog; Continue confirms and closes it. */
export const ConfirmFlow: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    onConfirm.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    // The content is rendered in a portal, outside the canvas — query the document.
    const dialog = await screen.findByRole('alertdialog')
    // waitFor covers the enter animation (opacity 0 on the first frame).
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await expect(onConfirm).toHaveBeenCalledOnce()
    // Confirming closes the dialog.
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  },
}

/** Cancel dismisses the dialog without confirming. */
export const CancelFlow: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    onConfirm.mockClear()
    onCancel.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    await screen.findByRole('alertdialog')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await expect(onCancel).toHaveBeenCalledOnce()
    await expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  },
}

/** Pressing `Escape` closes the dialog without confirming the action. */
export const EscapeDismisses: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    onConfirm.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    await screen.findByRole('alertdialog')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    // Escape resolves via Cancel: the destructive action is never executed.
    await expect(onConfirm).not.toHaveBeenCalled()
  },
}

/**
 * On open, focus goes to **Cancel**, not to the action. This is the WAI-ARIA
 * Alert Dialog safety pattern — the fast path (Enter) cancels instead of
 * executing the destructive action. It also locks the button order (Cancel
 * before Action), preventing regressions.
 */
export const FocusStartsOnCancel: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete account' }))
    await screen.findByRole('alertdialog')
    // Initial focus should rest on Cancel, not on the confirmation action.
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    await waitFor(() => expect(cancel).toHaveFocus())
    await expect(screen.getByRole('button', { name: 'Continue' })).not.toHaveFocus()
    // Close the dialog (Escape) so the story does not end open — avoids the
    // `aria-hidden-focus` violation with the trigger outside the dialog.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Visual regression fixtures (Chromatic): render the dialog open
 * (`defaultOpen`, no trigger — avoids the `aria-hidden-focus` violation and
 * docs clutter). Hidden from the sidebar/docs (`!dev`/`!autodocs`), but still
 * run as a smoke test (tag `test`) and re-enable the snapshot the meta disables.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Visual capture — default dialog open. */
export const VisualDefault: Story = {
  ...visual,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and
            remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** Visual capture — destructive action. */
export const VisualDestructive: Story = {
  ...visual,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            All boards, tasks and history will be lost. This cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** Visual capture — `size="sm"` (compact, two-column footer). */
export const VisualSmall: Story = {
  ...visual,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>Your edits will be lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}

/** Visual capture — with `AlertDialogMedia`. */
export const VisualMedia: Story = {
  ...visual,
  render: (args) => (
    <AlertDialog {...args} defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Storage almost full</AlertDialogTitle>
          <AlertDialogDescription>
            You are using 92% of your quota. Free up space or upgrade your plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Later</AlertDialogCancel>
          <AlertDialogAction>Upgrade</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
