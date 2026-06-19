import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import { Progress } from './progress'

const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  // Sem `autodocs`: a página de docs é a MDX customizada (progress.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Linear progress bar built on Radix `Progress`. Exposes the `progressbar` role ' +
          'with `aria-valuemin` / `aria-valuemax` / `aria-valuenow`. Five semantic `variant`s ' +
          '(`default` / `success` / `warning` / `info` / `destructive`) and three `size`s ' +
          '(`sm` / `default` / `lg`). Omit `value` for the indeterminate state. Always pass an ' +
          'accessible name via `aria-label` (or `aria-labelledby`).',
      },
    },
  },
  // Todas as stories herdam um nome acessível para o progressbar (axe é enforced).
  args: { value: 60, 'aria-label': 'Uploading files' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'info', 'destructive'],
      description: 'Chromatic scheme of the track and indicator.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Height of the progress bar.',
      table: { defaultValue: { summary: 'default' } },
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress (0–100). Omit it for the indeterminate state.',
    },
  },
  // Largura fixa para o trilho (w-full) ter referência nas stories e no Chromatic.
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — uma por variante / estado visual.
 * Cada uma monta sem erro e passa pelo axe automaticamente.
 * -------------------------------------------------------------------------- */

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** Every semantic variant at the same value. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Progress {...args} variant="default" aria-label="Default" />
      <Progress {...args} variant="success" aria-label="Success" />
      <Progress {...args} variant="warning" aria-label="Warning" />
      <Progress {...args} variant="info" aria-label="Info" />
      <Progress {...args} variant="destructive" aria-label="Destructive" />
    </div>
  ),
}

/** Three heights share the same rounded track. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Progress {...args} size="sm" aria-label="Small" />
      <Progress {...args} size="default" aria-label="Default" />
      <Progress {...args} size="lg" aria-label="Large" />
    </div>
  ),
}

/** Boundary values: empty, halfway and complete. */
export const Values: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Progress {...args} value={0} aria-label="Empty" />
      <Progress {...args} value={50} aria-label="Halfway" />
      <Progress {...args} value={100} aria-label="Complete" />
    </div>
  ),
}

/** No `value` → indeterminate: the bar reports progress of unknown duration. */
export const Indeterminate: Story = {
  args: { value: undefined },
}

/** A finished task reports the maximum. */
export const Complete: Story = {
  args: { value: 100 },
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Progress é não-interativo: validamos a semântica ARIA do progressbar
 * (role, aria-value*, data-state) e os data-attributes de estilo.
 * Sempre `await` em expect.
 * -------------------------------------------------------------------------- */

/** Exposes the `progressbar` role with the ARIA value range. */
export const HasProgressbarSemantics: Story = {
  args: { value: 60, variant: 'success', size: 'lg' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Uploading files' })
    await expect(bar).toBeInTheDocument()
    await expect(bar).toHaveAttribute('aria-valuenow', '60')
    await expect(bar).toHaveAttribute('aria-valuemin', '0')
    await expect(bar).toHaveAttribute('aria-valuemax', '100')
    // data-attributes refletem variant/size (hooks de estrutura, não de teste).
    await expect(bar).toHaveAttribute('data-slot', 'progress')
    await expect(bar).toHaveAttribute('data-variant', 'success')
    await expect(bar).toHaveAttribute('data-size', 'lg')
    // Radix marca o estado de carregamento no progressbar.
    await expect(bar).toHaveAttribute('data-state', 'loading')
  },
}

/** Without `value`, Radix marks it indeterminate and drops `aria-valuenow`. */
export const IndeterminateHasNoValueNow: Story = {
  args: { value: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Uploading files' })
    await expect(bar).toHaveAttribute('data-state', 'indeterminate')
    await expect(bar).not.toHaveAttribute('aria-valuenow')
  },
}

/** At `value=100` the bar reports the maximum and the complete state. */
export const CompleteReflectsMax: Story = {
  args: { value: 100 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const bar = canvas.getByRole('progressbar', { name: 'Uploading files' })
    await expect(bar).toHaveAttribute('aria-valuenow', '100')
    await expect(bar).toHaveAttribute('data-state', 'complete')
  },
}
