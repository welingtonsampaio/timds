import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Switch } from './switch'

const meta = {
  title: 'Data Entry/Switch',
  component: Switch,
  // Sem `autodocs`: a página de docs é a MDX customizada (switch.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Boolean toggle built on Radix `Switch`. Four chromatic `variant`s, three `size`s, ' +
          'and an optional `texts={{ on, off }}` prop that renders labels inside the track ' +
          '(the track grows in width to fit them). The inner texts are decorative ' +
          '(`aria-hidden`) — provide an `aria-label` or an associated `<label>` for a11y.',
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    'aria-label': 'Toggle',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'green_red', 'success', 'destructive'],
      description: 'Chromatic scheme of the track (on / off colors).',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Track height and thumb size.',
      table: { defaultValue: { summary: 'default' } },
    },
    texts: {
      control: 'object',
      description: 'Optional `{ on, off }` labels rendered inside the track.',
    },
    disabled: { control: 'boolean', description: 'Disables the switch.' },
    checked: { control: false, description: 'Controlled checked state.' },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state (uncontrolled).',
    },
  },
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** Every chromatic variant, shown in both off and on states. */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_repeat(2,auto)] items-center gap-x-6 gap-y-3">
      <span className="text-muted-foreground text-sm">variant</span>
      <span className="text-muted-foreground text-sm">off</span>
      <span className="text-muted-foreground text-sm">on</span>

      {(['default', 'green_red', 'success', 'destructive'] as const).map((variant) => (
        <Fragment key={variant}>
          <code className="text-sm">{variant}</code>
          <Switch variant={variant} aria-label={`${variant} off`} />
          <Switch variant={variant} defaultChecked aria-label={`${variant} on`} />
        </Fragment>
      ))}
    </div>
  ),
}

/** The three sizes side by side (on state). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Switch size={size} defaultChecked aria-label={size} />
          <code className="text-muted-foreground text-xs">{size}</code>
        </div>
      ))}
    </div>
  ),
}

/** Labels rendered inside the track — the rail grows to fit the text. */
export const WithText: Story = {
  args: { texts: { on: 'ON', off: 'OFF' }, defaultChecked: true },
}

/** Texts combined with every size. */
export const TextSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Switch
          key={size}
          size={size}
          texts={{ on: 'Sim', off: 'Não' }}
          defaultChecked
          aria-label={size}
        />
      ))}
    </div>
  ),
}

/** Status toggle: green when active, red when inactive, with labels. */
export const StatusToggle: Story = {
  args: {
    variant: 'green_red',
    texts: { on: 'Ativo', off: 'Inativo' },
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch disabled aria-label="disabled off" />
      <Switch disabled defaultChecked aria-label="disabled on" />
    </div>
  ),
}

/** Controlled example: state lives in the parent and reflects on a label. */
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <label htmlFor="controlled-switch" className="flex items-center gap-3">
        <Switch
          id="controlled-switch"
          checked={checked}
          onCheckedChange={setChecked}
          texts={{ on: 'ON', off: 'OFF' }}
        />
        <span className="text-sm">{checked ? 'Ligado' : 'Desligado'}</span>
      </label>
    )
  },
}

/** Clicking toggles the state and fires `onCheckedChange`. */
export const TogglesOnClick: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const sw = canvas.getByRole('switch')

    await expect(sw).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(sw)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    await expect(sw).toHaveAttribute('data-state', 'checked')
  },
}

/** Keyboard: focus + Space toggles the switch. */
export const TogglesWithKeyboard: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const sw = canvas.getByRole('switch')

    await userEvent.tab()
    await expect(sw).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
  },
}

/** Disabled switches do not toggle on click. */
export const DisabledDoesNotToggle: Story = {
  args: { disabled: true, onCheckedChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const sw = canvas.getByRole('switch')

    // O runtime do browser bloqueia clique em pointer-events:none; ignoramos
    // o check apenas para confirmar que o handler não dispara.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(sw)
    await expect(args.onCheckedChange).not.toHaveBeenCalled()
    await expect(sw).toHaveAttribute('data-state', 'unchecked')
  },
}
