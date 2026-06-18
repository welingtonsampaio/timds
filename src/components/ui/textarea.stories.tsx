import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  // Sem `autodocs`: a página de docs é a MDX customizada (textarea.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
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

/* --------------------------------------------------------------------------
 * Render stories — uma por estado.
 * Cada uma é render-testada (monta sem erro) e passa pelo axe automaticamente.
 * -------------------------------------------------------------------------- */

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => <Textarea {...args} aria-label="Mensagem" className="w-80" />,
}

export const Default: Story = {
  render: (args) => <Textarea {...args} aria-label="Mensagem" className="w-80" />,
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
  args: { disabled: true, value: 'Não editável', 'aria-label': 'Mensagem' },
  render: (args) => <Textarea {...args} className="w-80" />,
}

/** `aria-invalid` switches the field to the destructive error styling. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, value: 'Texto inválido', 'aria-label': 'Mensagem' },
  render: (args) => <Textarea {...args} className="w-80" />,
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Query por role 'textbox'; sempre `await` em userEvent/expect.
 * -------------------------------------------------------------------------- */

/** Typing fires `onChange` and preserves line breaks. */
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

/** Keyboard focus reaches the field via Tab. */
export const FocusesWithKeyboard: Story = {
  args: { 'aria-label': 'Mensagem' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: 'Mensagem' })).toHaveFocus()
  },
}

/** A disabled field is not editable and does not fire `onChange`. */
export const DisabledDoesNotType: Story = {
  args: { disabled: true, 'aria-label': 'Mensagem' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByRole('textbox', { name: 'Mensagem' })
    await expect(textarea).toBeDisabled()
    // userEvent.type num campo disabled não digita; confirmamos o no-op.
    await userEvent.type(textarea, 'algo')
    await expect(textarea).toHaveValue('')
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

/** The invalid state exposes `aria-invalid="true"` to assistive tech. */
export const InvalidExposesAria: Story = {
  args: { 'aria-invalid': true, 'aria-label': 'Mensagem' },
  render: (args) => <Textarea {...args} className="w-80" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByRole('textbox', { name: 'Mensagem' })
    await expect(textarea).toHaveAttribute('aria-invalid', 'true')
  },
}
