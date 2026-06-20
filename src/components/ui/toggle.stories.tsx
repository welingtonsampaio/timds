import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bold, Italic, Underline } from 'lucide-react'
import { Fragment, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Toggle } from './toggle'

const meta = {
  title: 'Data Entry/Toggle',
  component: Toggle,
  // No `autodocs`: the docs page is the custom MDX (toggle.mdx), which
  // embeds these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Two-state button built on Radix `Toggle`. Pressed state is exposed via ' +
          '`aria-pressed`/`data-state="on"`. Two `variant`s (`default`, `outline`) and ' +
          'three `size`s. Icon-only toggles must receive an `aria-label`.',
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    'aria-label': 'Toggle italic',
    children: <Italic />,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline'],
      description: 'Visual style: transparent (`default`) or bordered (`outline`).',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Control height and minimum width.',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: { control: 'boolean', description: 'Disables the toggle.' },
    pressed: { control: false, description: 'Controlled pressed state.' },
    defaultPressed: {
      control: 'boolean',
      description: 'Initial pressed state (uncontrolled).',
    },
  },
} satisfies Meta<typeof Toggle>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** The two chromatic variants, shown off and on. */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_repeat(2,auto)] items-center gap-x-6 gap-y-3">
      <span className="text-muted-foreground text-sm">variant</span>
      <span className="text-muted-foreground text-sm">off</span>
      <span className="text-muted-foreground text-sm">on</span>

      {(['default', 'outline'] as const).map((variant) => (
        <Fragment key={variant}>
          <code className="text-sm">{variant}</code>
          <Toggle variant={variant} aria-label={`${variant} off`}>
            <Bold />
          </Toggle>
          <Toggle variant={variant} defaultPressed aria-label={`${variant} on`}>
            <Bold />
          </Toggle>
        </Fragment>
      ))}
    </div>
  ),
}

/** The three sizes side by side. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Toggle size={size} defaultPressed aria-label={size}>
            <Bold />
          </Toggle>
          <code className="text-muted-foreground text-xs">{size}</code>
        </div>
      ))}
    </div>
  ),
}

/** Icon paired with a text label — no `aria-label` needed when text is present. */
export const WithText: Story = {
  args: { 'aria-label': undefined, children: undefined },
  render: (args) => (
    <Toggle {...args}>
      <Underline />
      Underline
    </Toggle>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle disabled aria-label="disabled off">
        <Bold />
      </Toggle>
      <Toggle disabled defaultPressed aria-label="disabled on">
        <Bold />
      </Toggle>
    </div>
  ),
}

/** Controlled example: pressed state lives in the parent. */
export const Controlled: Story = {
  render: () => {
    const [pressed, setPressed] = useState(false)
    return (
      <div className="flex items-center gap-3">
        <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="Bold">
          <Bold />
        </Toggle>
        <span className="text-sm">{pressed ? 'On' : 'Off'}</span>
      </div>
    )
  },
}

/** Clicking toggles the pressed state and fires `onPressedChange`. */
export const TogglesOnClick: Story = {
  args: { onPressedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('button', { name: 'Toggle italic' })

    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(toggle)
    await expect(args.onPressedChange).toHaveBeenCalledWith(true)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(toggle).toHaveAttribute('data-state', 'on')
  },
}

/** Keyboard: focus + Space toggles the pressed state. */
export const TogglesWithKeyboard: Story = {
  args: { onPressedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('button', { name: 'Toggle italic' })

    await userEvent.tab()
    await expect(toggle).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(args.onPressedChange).toHaveBeenCalledWith(true)
  },
}

/** Disabled toggles do not change state on click. */
export const DisabledDoesNotToggle: Story = {
  args: { disabled: true, onPressedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('button', { name: 'Toggle italic' })

    // The browser runtime blocks clicks on pointer-events:none; we skip
    // the check just to confirm the handler does not fire.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(toggle)
    await expect(args.onPressedChange).not.toHaveBeenCalled()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  },
}
