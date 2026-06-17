import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
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
    placeholder: 'Escreva sua mensagem…',
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

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => <Textarea {...args} className="w-80" />,
}

export const Default: Story = {
  render: (args) => <Textarea {...args} className="w-80" />,
}

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
  args: { disabled: true, value: 'Não editável' },
  render: (args) => <Textarea {...args} className="w-80" />,
}

/** `aria-invalid` switches the field to the destructive error styling. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, value: 'Texto inválido' },
  render: (args) => <Textarea {...args} className="w-80" />,
}

/** Interaction test: typing fires `onChange` and preserves line breaks. */
export const TypesText: Story = {
  args: { 'aria-label': 'Mensagem' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByRole('textbox', { name: 'Mensagem' })
    await userEvent.type(textarea, 'linha 1{enter}linha 2')
    await expect(textarea).toHaveValue('linha 1\nlinha 2')
    await expect(args.onChange).toHaveBeenCalled()
  },
}
