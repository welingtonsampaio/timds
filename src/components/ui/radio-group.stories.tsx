import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadioGroup, RadioGroupItem } from './radio-group'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Single-choice selection built on Radix `RadioGroup`. Compose `RadioGroupItem`s and ' +
          'associate each with a `<label htmlFor>`. Set the initial value with `defaultValue` ' +
          '(uncontrolled) or `value` + `onValueChange` (controlled); `disabled` locks the whole group.',
      },
    },
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
  },
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

const OPTIONS = [
  { value: 'monthly', label: 'Monthly', hint: 'Billed every month' },
  { value: 'yearly', label: 'Yearly', hint: 'Save 20% — billed once a year' },
  { value: 'lifetime', label: 'Lifetime', hint: 'One-time payment' },
]

/** Fully interactive — change `defaultValue`, `disabled` and orientation from **Controls**. */
export const Playground: Story = {
  args: { defaultValue: 'yearly' },
  argTypes: {
    defaultValue: { control: 'select', options: OPTIONS.map((o) => o.value) },
  },
  render: (args) => (
    <RadioGroup {...args} className="gap-3">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          htmlFor={`pg-${opt.value}`}
          className="flex items-start gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent/40"
        >
          <RadioGroupItem id={`pg-${opt.value}`} value={opt.value} className="mt-0.5" />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{opt.label}</span>
            <span className="text-xs text-muted-foreground">{opt.hint}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  ),
}

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="yearly" className="gap-3">
      {OPTIONS.map((opt) => (
        <label
          key={opt.value}
          htmlFor={opt.value}
          className="flex items-start gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent/40"
        >
          <RadioGroupItem id={opt.value} value={opt.value} className="mt-0.5" />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{opt.label}</span>
            <span className="text-xs text-muted-foreground">{opt.hint}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="a" disabled className="gap-2">
      <label htmlFor="opt-a" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="a" id="opt-a" /> Option A
      </label>
      <label htmlFor="opt-b" className="flex items-center gap-2 text-sm">
        <RadioGroupItem value="b" id="opt-b" /> Option B
      </label>
    </RadioGroup>
  ),
}
