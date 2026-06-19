import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  // Sem `autodocs`: a página de docs é a MDX customizada (toggle-group.mdx).
  parameters: {
    docs: {
      description: {
        component:
          'A set of two-state buttons that share styling, built on Radix `ToggleGroup`. ' +
          '`type="single"` exposes a `radiogroup` (one active item, `role="radio"`); ' +
          '`type="multiple"` exposes a `group` of independent `aria-pressed` buttons. ' +
          '`variant`/`size` propagate from the group to each item; `spacing={0}` joins ' +
          'them into a single segmented block.',
      },
    },
  },
  args: {
    type: 'single',
    variant: 'default',
    size: 'default',
    spacing: 0,
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description: 'Single (`radiogroup`) or multiple (independent toggles) selection.',
      table: { defaultValue: { summary: 'single' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline'],
      description: 'Visual style shared by every item.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Item height shared by every item.',
      table: { defaultValue: { summary: 'default' } },
    },
    spacing: {
      control: { type: 'number', min: 0, max: 4, step: 1 },
      description: 'Gap (theme units) between items. `0` joins them into one block.',
      table: { defaultValue: { summary: '0' } },
    },
    disabled: { control: 'boolean', description: 'Disables every item in the group.' },
  },
} satisfies Meta<typeof ToggleGroup>

export default meta

type Story = StoryObj<typeof meta>

/** Alignment toolbar (single selection) used by most stories. */
const alignmentItems = (
  <>
    <ToggleGroupItem value="left" aria-label="Align left">
      <AlignLeft />
    </ToggleGroupItem>
    <ToggleGroupItem value="center" aria-label="Align center">
      <AlignCenter />
    </ToggleGroupItem>
    <ToggleGroupItem value="right" aria-label="Align right">
      <AlignRight />
    </ToggleGroupItem>
  </>
)

// Render de um grupo single-selection (alinhamento). Fixar `type="single"` e
// enviar só as props conhecidas (sem espalhar `type`) evita o conflito do union
// discriminado do Radix — `defaultValue` é `string` no single e `string[]` no
// multiple, então o spread de `args` não tipa.
const renderSingle =
  (overrides?: { variant?: 'default' | 'outline' }) => (args: Story['args']) => (
    <ToggleGroup
      type="single"
      variant={overrides?.variant ?? args?.variant}
      size={args?.size}
      spacing={args?.spacing}
      disabled={args?.disabled}
      onValueChange={args?.onValueChange as (value: string) => void}
      defaultValue="left"
      aria-label="Text alignment"
    >
      {alignmentItems}
    </ToggleGroup>
  )

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => (
    <ToggleGroup {...args} aria-label="Text alignment">
      {alignmentItems}
    </ToggleGroup>
  ),
}

export const Default: Story = {
  render: renderSingle(),
}

/** The two visual variants, single selection. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['default', 'outline'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <code className="w-16 text-muted-foreground text-xs">{variant}</code>
          <ToggleGroup
            type="single"
            variant={variant}
            defaultValue="left"
            aria-label={variant}
          >
            {alignmentItems}
          </ToggleGroup>
        </div>
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
          <ToggleGroup
            type="single"
            variant="outline"
            size={size}
            defaultValue="left"
            aria-label={size}
          >
            {alignmentItems}
          </ToggleGroup>
          <code className="text-muted-foreground text-xs">{size}</code>
        </div>
      ))}
    </div>
  ),
}

/** Multiple selection: each item toggles independently (text formatting). */
export const Multiple: Story = {
  args: { type: 'multiple' },
  render: (args) => (
    <ToggleGroup {...args} variant="outline" aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

/** `spacing` separates the items instead of joining them. */
export const Spacing: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {([0, 1, 2] as const).map((spacing) => (
        <div key={spacing} className="flex items-center gap-3">
          <code className="w-20 text-muted-foreground text-xs">spacing={spacing}</code>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={spacing}
            defaultValue="left"
            aria-label={`spacing ${spacing}`}
          >
            {alignmentItems}
          </ToggleGroup>
        </div>
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: renderSingle({ variant: 'outline' }),
}

/** Single selection: choosing an item checks it and fires `onValueChange`. */
export const SelectsSingle: Story = {
  render: renderSingle(),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const left = canvas.getByRole('radio', { name: 'Align left' })
    const center = canvas.getByRole('radio', { name: 'Align center' })

    await expect(left).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(center)
    await expect(args.onValueChange).toHaveBeenCalledWith('center')
    await expect(center).toHaveAttribute('aria-checked', 'true')
    await expect(left).toHaveAttribute('aria-checked', 'false')
  },
}

/** Multiple selection: items toggle independently and accumulate. */
export const TogglesMultiple: Story = {
  args: { type: 'multiple' },
  render: (args) => (
    <ToggleGroup {...args} variant="outline" aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const bold = canvas.getByRole('button', { name: 'Bold' })
    const italic = canvas.getByRole('button', { name: 'Italic' })

    await userEvent.click(bold)
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['bold'])
    await userEvent.click(italic)
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['bold', 'italic'])
    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await expect(italic).toHaveAttribute('aria-pressed', 'true')
  },
}

/** Keyboard: arrow keys move focus (roving tabindex); Space/Enter selects. */
export const KeyboardNavigation: Story = {
  render: renderSingle(),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const left = canvas.getByRole('radio', { name: 'Align left' })
    const center = canvas.getByRole('radio', { name: 'Align center' })

    await userEvent.tab()
    await expect(left).toHaveFocus()
    // A seta move o foco entre os itens, mas não altera a seleção.
    await userEvent.keyboard('{ArrowRight}')
    await expect(center).toHaveFocus()
    // A seleção do item focado acontece com Space/Enter.
    await userEvent.keyboard(' ')
    await expect(args.onValueChange).toHaveBeenCalledWith('center')
    await expect(center).toHaveAttribute('aria-checked', 'true')
  },
}

/** A disabled group does not respond to clicks. */
export const DisabledDoesNotSelect: Story = {
  args: { disabled: true },
  render: renderSingle(),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const center = canvas.getByRole('radio', { name: 'Align center' })

    // pointer-events:none nos itens desabilitados; forçamos o clique só para
    // confirmar que a seleção não muda.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(center)
    await expect(args.onValueChange).not.toHaveBeenCalled()
    await expect(center).toHaveAttribute('aria-checked', 'false')
  },
}
