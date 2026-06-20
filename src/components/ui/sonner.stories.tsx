import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Toaster, type ToasterProps, toast } from './sonner'

// Module-level spy for the toast actions (action/cancel). It's cleared at the
// start of each play because it lives outside `meta.args` (which resets itself
// between stories).
const onAction = fn()

// Common wrapper for the demos: the triggers + a single Toaster per story (avoids
// mounting two Toasters, which would duplicate every notification).
function Demo({ children, toaster }: { children: ReactNode; toaster?: ToasterProps }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {children}
      <Toaster {...toaster} />
    </div>
  )
}

const meta = {
  title: 'Feedback/Toaster',
  component: Toaster,
  // No `autodocs`: the docs page is the custom MDX (sonner.mdx). Having both
  // would generate duplicate Docs entries (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'Toast notifications built on **sonner**. Mount `<Toaster />` once near the app ' +
          'root and fire notifications from anywhere with the imperative `toast` function ' +
          '(`toast`, `toast.success`, `toast.error`, `toast.warning`, `toast.info`, ' +
          '`toast.loading`, `toast.promise`). The wrapper defaults to `richColors` and ' +
          'bottom-right, and maps sonner’s color CSS variables to the design-system tokens ' +
          '(`--success`, `--destructive`, `--warning`, `--info`) so semantic colors adapt to ' +
          'light/dark automatically — without `next-themes`.',
      },
    },
    // Toasts are imperative and animated: deterministic snapshots would have to
    // come from inside a `play` (portal + entry animation = flaky). The regression
    // coverage here is behavioral (play functions); the visual is left out.
    chromatic: { disableSnapshot: true },
  },
  args: {
    position: 'bottom-right',
    richColors: true,
  },
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      description: 'Where the stack of toasts is anchored on screen.',
      table: { defaultValue: { summary: 'bottom-right' } },
    },
    richColors: {
      control: 'boolean',
      description:
        'Colorize toasts by type (success/error/warning/info) using the design tokens.',
      table: { defaultValue: { summary: 'true' } },
    },
    closeButton: {
      control: 'boolean',
      description: 'Render an explicit close (×) button on every toast.',
    },
    expand: {
      control: 'boolean',
      description: 'Keep toasts expanded instead of stacking them collapsed.',
    },
    duration: {
      control: 'number',
      description: 'Default auto-dismiss time in ms (per toast can override).',
      table: { defaultValue: { summary: '4000' } },
    },
    visibleToasts: {
      control: 'number',
      description: 'How many toasts are shown at once before older ones collapse.',
      table: { defaultValue: { summary: '3' } },
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      description:
        'Sonner’s internal theme. Colors here come from tokens, so this rarely matters; ' +
        'dark mode follows the `.dark` class on an ancestor.',
    },
  },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/* ----- Showcase (render-tested + axe) ----- */

/** Fully interactive — tweak the `<Toaster />` props from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() => toast('Event created', { description: 'Friday, May 23 at 7pm' })}
      >
        Show toast
      </Button>
    </Demo>
  ),
}

/** One trigger per semantic type. Colors come from the design-system tokens. */
export const Colors: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button variant="outline" onClick={() => toast('Neutral notification')}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Changes saved')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Failed to save')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Quota almost reached')}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('New version available')}>
        Info
      </Button>
    </Demo>
  ),
}

/** A primary action (and an optional cancel) rendered inside the toast. */
export const WithAction: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() =>
          toast('File moved to trash', {
            action: { label: 'Undo', onClick: () => onAction() },
          })
        }
      >
        With action
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('Delete permanently?', {
            action: { label: 'Delete', onClick: () => onAction() },
            cancel: { label: 'Cancel', onClick: () => onAction() },
            duration: Number.POSITIVE_INFINITY,
          })
        }
      >
        Action + cancel
      </Button>
    </Demo>
  ),
}

/** Custom auto-dismiss times via the per-toast `duration` option. */
export const Durations: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button
        variant="outline"
        onClick={() => toast('Dismisses in 1s', { duration: 1000 })}
      >
        Short (1s)
      </Button>
      <Button
        variant="outline"
        onClick={() => toast('Dismisses in 10s', { duration: 10000 })}
      >
        Long (10s)
      </Button>
    </Demo>
  ),
}

/** Persistent toast (`duration: Infinity`) — only the close button dismisses it. */
export const Persistent: Story = {
  args: { closeButton: true },
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() =>
          toast('Connection lost', {
            description: 'Trying to reconnect…',
            duration: Number.POSITIVE_INFINITY,
          })
        }
      >
        Persistent toast
      </Button>
    </Demo>
  ),
}

/** `toast.promise` swaps loading → success/error as the promise settles. */
export const PromiseToast: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button
        onClick={() =>
          toast.promise(new Promise<void>((resolve) => setTimeout(resolve, 800)), {
            loading: 'Saving…',
            success: 'All saved!',
            error: 'Could not save',
          })
        }
      >
        Save
      </Button>
    </Demo>
  ),
}

/* ----- Interaction tests (regression checks) — toasts go to document.body,
   so we query with `screen`. Each play clears pending toasts at the start. -- */

/** Clicking the trigger renders a toast with the given message. */
export const FiresToast: Story = {
  render: (args) => (
    <Demo toaster={args}>
      <Button onClick={() => toast('Event created')}>Show toast</Button>
    </Demo>
  ),
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }))
    await expect(await screen.findByText('Event created')).toBeInTheDocument()
  },
}

/** Each semantic helper tags the toast with its `data-type`. */
export const SemanticType: Story = {
  render: Colors.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Success' }))
    await screen.findByText('Changes saved')
    // data-type is a structural attribute of sonner (we don't depend on CSS).
    await waitFor(() =>
      expect(
        document.querySelector('[data-sonner-toast][data-type="success"]'),
      ).toBeInTheDocument(),
    )
  },
}

/** Clicking the toast action runs its callback. */
export const ActionRunsCallback: Story = {
  render: WithAction.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    onAction.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'With action' }))
    await screen.findByText('File moved to trash')
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await expect(onAction).toHaveBeenCalledOnce()
  },
}

/** A short-duration toast auto-dismisses on its own. */
export const ShortDurationAutoDismisses: Story = {
  render: Durations.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Short (1s)' }))
    await expect(await screen.findByText('Dismisses in 1s')).toBeInTheDocument()
    await waitFor(
      () => expect(screen.queryByText('Dismisses in 1s')).not.toBeInTheDocument(),
      { timeout: 4000 },
    )
  },
}

/** A persistent toast stays until the close button is pressed. */
export const CloseButtonDismisses: Story = {
  args: { closeButton: true },
  render: Persistent.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Persistent toast' }))
    await expect(await screen.findByText('Connection lost')).toBeInTheDocument()
    // Sonner's close button exposes aria-label "Close toast".
    await userEvent.click(screen.getByRole('button', { name: 'Close toast' }))
    await waitFor(() =>
      expect(screen.queryByText('Connection lost')).not.toBeInTheDocument(),
    )
  },
}

/** `toast.promise` shows loading, then the success message once it resolves. */
export const PromiseResolves: Story = {
  render: PromiseToast.render,
  play: async ({ canvasElement }) => {
    toast.dismiss()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(await screen.findByText('Saving…')).toBeInTheDocument()
    await expect(
      await screen.findByText('All saved!', {}, { timeout: 4000 }),
    ).toBeInTheDocument()
  },
}
