import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { RadioGroup, RadioGroupItem } from './radio-group'

const meta = {
  title: 'Data Entry/RadioGroup',
  component: RadioGroup,
  // Sem `autodocs`: a página de docs é a MDX customizada (radio-group.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Single-choice selection built on Radix `RadioGroup`. Compose `RadioGroupItem`s and ' +
          'associate each with a `<label htmlFor>`. Set the initial value with `defaultValue` ' +
          '(uncontrolled) or `value` + `onValueChange` (controlled); `disabled` locks the whole group. ' +
          'Arrow keys move the selection (roving focus) and `orientation` sets the axis.',
      },
    },
  },
  args: {
    onValueChange: fn(),
  },
  argTypes: {
    defaultValue: {
      control: 'select',
      description: 'Initially selected value (uncontrolled).',
    },
    disabled: { control: 'boolean', description: 'Disable the entire group.' },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Layout/keyboard navigation direction.',
    },
    onValueChange: {
      control: false,
      description: 'Fired with the newly selected value.',
    },
  },
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

const OPTIONS = [
  { value: 'monthly', label: 'Monthly', hint: 'Billed every month' },
  { value: 'yearly', label: 'Yearly', hint: 'Save 20% — billed once a year' },
  { value: 'lifetime', label: 'Lifetime', hint: 'One-time payment' },
]

// Cartão de opção reutilizado: rótulo associado por `id`/`htmlFor` ao item.
function PlanCard({
  value,
  label,
  hint,
}: {
  value: string
  label: string
  hint: string
}) {
  return (
    <label
      htmlFor={value}
      className="flex items-start gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent/40"
    >
      <RadioGroupItem id={value} value={value} className="mt-0.5" />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  )
}

/* ----- Variants & states (render-tested + axe) ----- */

/** Fully interactive — change `defaultValue`, `disabled` and orientation from **Controls**. */
export const Playground: Story = {
  args: { defaultValue: 'yearly' },
  argTypes: {
    defaultValue: { control: 'select', options: OPTIONS.map((o) => o.value) },
  },
  render: (args) => (
    <RadioGroup {...args} aria-label="Plano" className="gap-3">
      {OPTIONS.map((opt) => (
        <PlanCard key={opt.value} {...opt} />
      ))}
    </RadioGroup>
  ),
}

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Plano" defaultValue="yearly" className="gap-3">
      {OPTIONS.map((opt) => (
        <PlanCard key={opt.value} {...opt} />
      ))}
    </RadioGroup>
  ),
}

/** Itens lado a lado com `orientation="horizontal"`. */
export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup
      {...args}
      aria-label="Plano"
      defaultValue="monthly"
      orientation="horizontal"
      className="grid-flow-col"
    >
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          htmlFor={`h-${opt.value}`}
          className="flex items-center gap-2 text-sm"
        >
          <RadioGroupItem id={`h-${opt.value}`} value={opt.value} />
          {opt.label}
        </label>
      ))}
    </RadioGroup>
  ),
}

/** O grupo inteiro pode ser desabilitado de uma vez. */
export const Disabled: Story = {
  render: (args) => (
    <RadioGroup
      {...args}
      aria-label="Plano"
      defaultValue="monthly"
      disabled
      className="gap-2"
    >
      <label htmlFor="opt-a" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="monthly" id="opt-a" /> Monthly
      </label>
      <label htmlFor="opt-b" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="yearly" id="opt-b" /> Yearly
      </label>
    </RadioGroup>
  ),
}

/** Um único item pode ser desabilitado, mantendo o resto navegável. */
export const ItemDisabled: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Plano" defaultValue="monthly" className="gap-2">
      <label htmlFor="id-a" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="monthly" id="id-a" /> Monthly
      </label>
      <label htmlFor="id-b" className="flex items-center gap-2 text-sm opacity-50">
        <RadioGroupItem value="yearly" id="id-b" disabled /> Yearly (indisponível)
      </label>
      <label htmlFor="id-c" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="lifetime" id="id-c" /> Lifetime
      </label>
    </RadioGroup>
  ),
}

/** Modo controlado: o valor vive no pai e reflete num texto auxiliar. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('monthly')
    return (
      <div className="flex flex-col gap-3">
        <RadioGroup
          aria-label="Plano"
          value={value}
          onValueChange={setValue}
          className="gap-2"
        >
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              htmlFor={`c-${opt.value}`}
              className="flex items-center gap-2 text-sm"
            >
              <RadioGroupItem id={`c-${opt.value}`} value={opt.value} />
              {opt.label}
            </label>
          ))}
        </RadioGroup>
        <output className="text-sm text-muted-foreground">Selecionado: {value}</output>
      </div>
    )
  },
}

/* ----- Interaction tests (regression checks) ----- */

/** Selecting an item fires `onValueChange` with its value and flips `aria-checked`. */
export const SelectsOnClick: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Plano" className="gap-2">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          htmlFor={`s-${opt.value}`}
          className="flex items-center gap-2 text-sm"
        >
          <RadioGroupItem id={`s-${opt.value}`} value={opt.value} />
          {opt.label}
        </label>
      ))}
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const yearly = canvas.getByRole('radio', { name: 'Yearly' })

    await expect(yearly).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(yearly)
    await expect(args.onValueChange).toHaveBeenCalledWith('yearly')
    await expect(yearly).toHaveAttribute('aria-checked', 'true')
    await expect(yearly).toHaveAttribute('data-state', 'checked')
  },
}

/** Only one radio is selected at a time — choosing another clears the previous. */
export const SelectsOnlyOne: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Plano" defaultValue="monthly" className="gap-2">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          htmlFor={`o-${opt.value}`}
          className="flex items-center gap-2 text-sm"
        >
          <RadioGroupItem id={`o-${opt.value}`} value={opt.value} />
          {opt.label}
        </label>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const monthly = canvas.getByRole('radio', { name: 'Monthly' })
    const lifetime = canvas.getByRole('radio', { name: 'Lifetime' })

    await expect(monthly).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(lifetime)
    await expect(lifetime).toHaveAttribute('aria-checked', 'true')
    // A seleção anterior é limpa — só um item fica marcado.
    await expect(monthly).toHaveAttribute('aria-checked', 'false')
  },
}

/** Arrow keys move the selection along the group (roving focus). */
export const NavigatesWithArrows: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Plano" defaultValue="monthly" className="gap-2">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          htmlFor={`n-${opt.value}`}
          className="flex items-center gap-2 text-sm"
        >
          <RadioGroupItem id={`n-${opt.value}`} value={opt.value} />
          {opt.label}
        </label>
      ))}
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const monthly = canvas.getByRole('radio', { name: 'Monthly' })

    // Tab leva o foco ao item selecionado (roving tabindex do Radix).
    await userEvent.tab()
    await expect(monthly).toHaveFocus()

    // Seta move o foco (roving) e seleciona o item focado. Mantemos a tecla
    // pressionada (`{ArrowDown>}`) durante o assert: o Radix só dispara o
    // onCheck no onFocus enquanto a seta está abaixada (isArrowKeyPressedRef),
    // e o keyup do userEvent zeraria essa flag antes do foco assentar.
    await userEvent.keyboard('{ArrowDown>}')
    const yearly = canvas.getByRole('radio', { name: 'Yearly' })
    await expect(yearly).toHaveFocus()
    await waitFor(() => expect(yearly).toHaveAttribute('aria-checked', 'true'))
    await expect(args.onValueChange).toHaveBeenCalledWith('yearly')
    await userEvent.keyboard('{/ArrowDown}')
  },
}

/** A disabled group ignores clicks and does not fire `onValueChange`. */
export const DisabledDoesNotSelect: Story = {
  args: { disabled: true },
  render: (args) => (
    <RadioGroup {...args} aria-label="Plano" className="gap-2">
      <label htmlFor="d-a" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="monthly" id="d-a" /> Monthly
      </label>
      <label htmlFor="d-b" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="yearly" id="d-b" /> Yearly
      </label>
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const monthly = canvas.getByRole('radio', { name: 'Monthly' })

    // O runtime do browser bloqueia clique em pointer-events:none; ignoramos o
    // check apenas para confirmar que nada é selecionado nem notificado.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(monthly)
    await expect(args.onValueChange).not.toHaveBeenCalled()
    await expect(monthly).toHaveAttribute('aria-checked', 'false')
  },
}
