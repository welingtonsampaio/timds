import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
import { Input } from './input'

const meta = {
  title: 'Overlays/Dialog',
  component: Dialog,
  // No `autodocs`: the docs page is the custom MDX (dialog.mdx), which
  // embeds these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Modal overlay built on Radix `Dialog`. Use it for focused, interruptive content — ' +
          'forms, details, confirmations — that the user resolves before returning to the page. ' +
          'Compose with `DialogTrigger`, `DialogContent` (`size`: `default` | `sm`, optional ' +
          '`showCloseButton`), `DialogHeader`/`Footer`, `DialogTitle`/`Description`, and ' +
          '`DialogClose`. Focus is trapped and `Escape`, the close button, or an overlay click ' +
          'dismiss it. Each story starts closed — click the trigger to open the dialog. For ' +
          'destructive confirmations that must block, prefer `AlertDialog`.',
      },
    },
    // The demo/interaction stories start closed: Chromatic would only
    // see the trigger, so a snapshot isn't worthwhile. Visual coverage lives in
    // the `Visual*` stories (open), which re-enable the snapshot individually.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

const onSave = fn()

/* --------------------------------------------------------------------------
 * Render stories (start closed) — one per composition.
 * The content is portaled to document.body: in play functions use `screen`.
 * -------------------------------------------------------------------------- */

/** Fully interactive — open the dialog, edit and confirm or dismiss. */
export const Playground: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your details. Changes are saved when you confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Input aria-label="Name" defaultValue="Ada Lovelace" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** Holds a short form; submitting via a `DialogClose` confirms and closes. */
export const WithForm: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Add member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Invite someone to your workspace.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Input aria-label="Email" placeholder="name@example.com" type="email" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave}>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** `size="sm"` renders a compact dialog. */
export const SmallSize: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Rename</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Rename file</DialogTitle>
          <DialogDescription>Pick a new name for this file.</DialogDescription>
        </DialogHeader>
        <Input aria-label="File name" defaultValue="report.pdf" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/**
 * `showCloseButton={false}` hides the corner "X"; the dialog is then dismissed
 * only by its own footer controls (or `Escape`).
 */
export const WithoutCloseButton: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Subscribe</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Subscribe to updates</DialogTitle>
          <DialogDescription>
            We'll email you when something important happens.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Not now</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Subscribe</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions that ARE the regression tests.
 * Portaled content: look up the dialog and buttons via `screen`, not `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the dialog and exposes `role="dialog"`. */
export const OpensOnTrigger: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your details.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The dialog starts closed: nothing portaled yet.
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }))
    const dialog = await screen.findByRole('dialog')
    await expect(dialog).toBeVisible()
    // The dialog is named by the title and described by the description (Radix wires it).
    await expect(dialog).toHaveAccessibleName('Edit profile')
    await expect(dialog).toHaveAccessibleDescription('Update your details.')
    // Close so the story doesn't end open (avoids aria-hidden-focus with the trigger).
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/** The corner close button dismisses the dialog. */
export const CloseButtonDismisses: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your details.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }))
    await screen.findByRole('dialog')
    // The "X" exposes the accessible name "Close" (via sr-only).
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/** Pressing `Escape` closes the dialog. */
export const EscapeDismisses: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your details.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/**
 * Clicking the dimmed overlay (outside the content) dismisses the dialog — the
 * key behavior that separates a plain Dialog from an `AlertDialog`.
 */
export const OverlayClickDismisses: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your details.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }))
    await screen.findByRole('dialog')
    // The overlay has no role; the only way to select it is by the data-slot.
    const overlay = canvasElement.ownerDocument.querySelector<HTMLElement>(
      '[data-slot="dialog-overlay"]',
    )
    await expect(overlay).not.toBeNull()
    await userEvent.click(overlay as HTMLElement)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/** On open, focus moves into the dialog (focus trap); on close it returns to the trigger. */
export const FocusMovesIntoDialog: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your details.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Edit profile' })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole('dialog')
    // Focus now resides inside the dialog (trap).
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    )
    // On close, focus returns to the trigger.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

/** With `showCloseButton={false}` the corner "X" is not rendered. */
export const HidesCloseButton: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Subscribe</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Subscribe to updates</DialogTitle>
          <DialogDescription>Stay in the loop.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Subscribe</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))
    await screen.findByRole('dialog')
    // Without the "X": there is no "Close" button in the content.
    await expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    // The footer action still closes the dialog.
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Visual regression fixtures (Chromatic): render the dialog open
 * (`defaultOpen`, no trigger — avoids the `aria-hidden-focus` violation and
 * polluting the docs). Hidden from the sidebar/docs (`!dev`/`!autodocs`), but they
 * keep running as a smoke test (tag `test`) and re-enable the snapshot the meta disables.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Visual capture — default dialog open (with "X" and form). */
export const VisualDefault: Story = {
  ...visual,
  render: (args) => (
    <Dialog {...args} defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your details. Changes are saved when you confirm.
          </DialogDescription>
        </DialogHeader>
        <Input aria-label="Name" defaultValue="Ada Lovelace" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** Visual capture — `size="sm"` (compact). */
export const VisualSmall: Story = {
  ...visual,
  render: (args) => (
    <Dialog {...args} defaultOpen>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Rename file</DialogTitle>
          <DialogDescription>Pick a new name for this file.</DialogDescription>
        </DialogHeader>
        <Input aria-label="File name" defaultValue="report.pdf" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** Visual capture — without the close button ("X" hidden). */
export const VisualWithoutCloseButton: Story = {
  ...visual,
  render: (args) => (
    <Dialog {...args} defaultOpen>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Subscribe to updates</DialogTitle>
          <DialogDescription>
            We'll email you when something important happens.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Not now</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Subscribe</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
