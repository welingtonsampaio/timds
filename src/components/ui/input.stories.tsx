import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Input } from './input'

const meta = {
  title: 'Data Entry/Input',
  component: Input,
  // Sem `autodocs`: a página de docs é a MDX customizada (input.mdx), que embute
  // estas stories. Ter ambos geraria entradas de Docs duplicadas (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'Single-line text field — a thin wrapper over the native `<input>` wired to the ' +
          'design tokens. Pass any native `type` (text, email, password, number, file…). ' +
          'Set `aria-invalid` for the error state and `disabled` to lock it. For prefixes, ' +
          'suffixes or inline buttons compose it with `InputGroup`.',
      },
    },
  },
  args: {
    placeholder: 'Digite aqui…',
    onChange: fn(),
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'file'],
      description: 'Native `<input>` type forwarded as-is.',
      table: { defaultValue: { summary: 'text' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder shown while the field is empty.',
    },
    value: { control: 'text', description: 'Controlled value of the field.' },
    disabled: {
      control: 'boolean',
      description: 'Disables the field: not focusable, ignores input.',
    },
    'aria-invalid': {
      control: 'boolean',
      description: 'Renders the destructive error/invalid styling.',
    },
    onChange: { control: false, description: 'Fires on every value change.' },
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — uma por estado visual (render-testadas + axe).
 * -------------------------------------------------------------------------- */

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => <Input {...args} className="w-72" />,
}

export const Default: Story = {
  render: (args) => <Input {...args} className="w-72" />,
}

/** Pair the field with an associated `<label>` so the name is exposed and clickable. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-72 gap-2">
      <label htmlFor="email" className="text-sm font-medium text-foreground">
        E-mail
      </label>
      <Input {...args} id="email" type="email" placeholder="voce@exemplo.com" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, value: 'Não editável' },
  render: (args) => <Input {...args} className="w-72" />,
}

/** `aria-invalid` switches the field to the destructive error styling. */
export const Invalid: Story = {
  args: { 'aria-invalid': true, value: 'valor-invalido' },
  render: (args) => <Input {...args} className="w-72" />,
}

/** A few common input types side by side. */
export const Types: Story = {
  render: (args) => (
    <div className="grid w-72 gap-3">
      <Input {...args} type="text" placeholder="Texto" />
      <Input {...args} type="email" placeholder="E-mail" />
      <Input {...args} type="password" placeholder="Senha" />
      <Input {...args} type="number" placeholder="Número" />
    </div>
  ),
}

/** Native file picker styled with the design tokens. */
export const File: Story = {
  args: { type: 'file' },
  render: (args) => <Input {...args} className="w-72" />,
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * -------------------------------------------------------------------------- */

/** Typing fires `onChange` and updates the controlled value. */
export const TypesText: Story = {
  args: { 'aria-label': 'Nome' },
  render: (args) => <Input {...args} className="w-72" />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Nome' })
    await userEvent.type(input, 'Ada Lovelace')
    await expect(input).toHaveValue('Ada Lovelace')
    await expect(args.onChange).toHaveBeenCalled()
  },
}

/** The field is keyboard-focusable (reachable via Tab). */
export const FocusesWithKeyboard: Story = {
  args: { 'aria-label': 'Nome' },
  render: (args) => <Input {...args} className="w-72" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: 'Nome' })).toHaveFocus()
  },
}

/** The error state exposes `aria-invalid="true"` for assistive tech. */
export const InvalidExposesAria: Story = {
  args: { 'aria-invalid': true, 'aria-label': 'E-mail', value: 'invalido' },
  render: (args) => <Input {...args} className="w-72" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'E-mail' })
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  },
}

/** A disabled field is not focusable and does not accept input. */
export const DisabledDoesNotType: Story = {
  args: { disabled: true, 'aria-label': 'Bloqueado' },
  render: (args) => <Input {...args} className="w-72" />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Bloqueado' })
    await expect(input).toBeDisabled()
    // Em disabled o input tem pointer-events:none; forçamos a digitação
    // (pointerEventsCheck: 0) para provar que o valor não muda mesmo assim.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.type(input, 'nada')
    await expect(input).toHaveValue('')
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}
