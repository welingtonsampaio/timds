import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Textarea } from './textarea'

const meta = {
  title: 'Data Entry/Textarea',
  component: Textarea,
  // No `autodocs`: the docs page is the custom MDX (textarea.mdx), which
  // embeds these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Multi-line text field. A wrapper over the native `<textarea>` sharing the same ' +
          'tokens as `Input`. It auto-grows with its content (`field-sizing-content`) from a ' +
          'minimum height. Set `aria-invalid` for the error state and `disabled` to lock it.',
      },
    },
  },
  args: {
    placeholder: 'Write your message…',
    onChange: fn(),
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Placeholder text.' },
    disabled: { control: 'boolean', description: 'Disable the field.' },
    rows: { control: 'number', description: 'Initial visible number of text lines.' },
    'aria-invalid': {
      control: 'boolean',
      description: 'Render the error/invalid state.',
    },
  },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — one per state.
 * Each is render-tested (mounts without error) and automatically passes axe.
 * -------------------------------------------------------------------------- */

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => <Textarea {...args} aria-label="Message" className="w-80" />,
}

export const Default: Story = {
  render: (args) => <Textarea {...args} aria-label="Message" className="w-80" />,
}

/** Paired with an associated `<label>` for an accessible name. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-80 gap-2">
      <label htmlFor="bio" className="text-sm font-medium text-foreground">
        Bio
      </label>
      <Textarea {...args} id="bio" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, value: 'Not editable', 'aria-label': 'Message' },
  render: (args) => <Textarea {...args} className="w-80" />,
}

/** `aria-invalid` switches the field to the destructive error styling. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, value: 'Invalid text', 'aria-label': 'Message' },
  render: (args) => <Textarea {...args} className="w-80" />,
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions that ARE the regression tests.
 * Query by role 'textbox'; always `await` on userEvent/expect.
 * -------------------------------------------------------------------------- */

/** Typing fires `onChange` and preserves line breaks. */
export const TypesText: Story = {
  args: { 'aria-label': 'Message' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(textarea, 'line 1{enter}line 2')
    await expect(textarea).toHaveValue('line 1\nline 2')
    await expect(args.onChange).toHaveBeenCalled()
  },
}

/** Keyboard focus reaches the field via Tab. */
export const FocusesWithKeyboard: Story = {
  args: { 'aria-label': 'Message' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: 'Message' })).toHaveFocus()
  },
}

/** A disabled field is not editable and does not fire `onChange`. */
export const DisabledDoesNotType: Story = {
  args: { disabled: true, 'aria-label': 'Message' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByRole('textbox', { name: 'Message' })
    await expect(textarea).toBeDisabled()
    // userEvent.type on a disabled field doesn't type; we confirm the no-op.
    await userEvent.type(textarea, 'something')
    await expect(textarea).toHaveValue('')
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

/** The invalid state exposes `aria-invalid="true"` to assistive tech. */
export const InvalidExposesAria: Story = {
  args: { 'aria-invalid': true, 'aria-label': 'Message' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByRole('textbox', { name: 'Message' })
    await expect(textarea).toHaveAttribute('aria-invalid', 'true')
  },
}
