// button.stories.tsx — worked example for the design-system-docs skill.
// The stories double as interaction (regression) tests via play functions.
// Mirrors the real timds conventions: title by semantic category (e.g. 'Data
// Entry/Button', never 'UI/*'), autodocs tags, `storybook/test` utilities,
// `canvasElement` + `within` idiom, comments in pt-BR.

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Rocket } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from './button'

const meta = {
  title: 'Data Entry/Button',
  component: Button,
  // No `autodocs`: the docs page is the custom MDX (button.mdx). Having both
  // would generate duplicate Docs entries (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'Primary interactive control. Built on a `cva` recipe with six **variants** ' +
          '(default, secondary, destructive, outline, ghost, link) and four **sizes** ' +
          '(default, sm, lg, icon). The `loading` flag swaps the icon for a spinner and ' +
          'disables the button. Use `asChild` to render the styling on a custom element.',
      },
    },
  },
  args: {
    children: 'Button',
    onClick: fn(), // spy shared by all stories; auto-reset between them
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual style / emphasis of the button.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Height and padding preset. Use `icon` for square icon-only buttons.',
      table: { defaultValue: { summary: 'default' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show a spinner in place of the icon and disable the button.',
    },
    disabled: { control: 'boolean', description: 'Disables interaction and dims it.' },
    children: { control: 'text', description: 'Button label or content.' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/* ----- Variants & states (render-tested + axe) ----- */

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Destructive: Story = { args: { variant: 'destructive' } }

/** All sizes side by side. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
}

/** Icon-only buttons must carry an accessible name via `aria-label`. */
export const IconOnly: Story = {
  args: { size: 'icon', 'aria-label': 'Launch', children: <Rocket /> },
}

/** `loading` swaps the icon for a spinner and disables the button. */
export const Loading: Story = {
  args: { icon: <Rocket />, loading: true, children: 'Launching' },
}

/* ----- Interaction tests (regression checks) ----- */

/** Clicking the button fires `onClick` exactly once. */
export const ClicksOnce: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Button' }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

/** While loading, the button is disabled, exposes `aria-busy` and ignores clicks. */
export const LoadingBlocksClicks: Story = {
  args: { icon: <Rocket />, loading: true, children: 'Launching' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /launching/i })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
    // While loading the button has pointer-events:none; we force the click
    // (pointerEventsCheck: 0) to prove that onClick still does not fire.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

/** The button is keyboard-focusable. */
export const FocusesWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Button' })).toHaveFocus()
  },
}
