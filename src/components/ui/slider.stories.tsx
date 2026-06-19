import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fragment, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Slider } from './slider'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  // Sem `autodocs`: a página de docs é a MDX customizada (slider.mdx), que
  // embute estas stories. Ter ambos geraria entradas de Docs duplicadas.
  parameters: {
    docs: {
      description: {
        component:
          'Range input built on Radix `Slider`. Three chromatic `variant`s and three ' +
          '`size`s (track thickness + thumb diameter). Pass a single-element ' +
          '`defaultValue`/`value` for one thumb, or a two-element array for a range. ' +
          'The focusable element is the thumb (`role="slider"`) — give it an ' +
          'accessible name with `aria-label`/`aria-labelledby`, which the component ' +
          'forwards from the root to each thumb.',
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    'aria-label': 'Volume',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'destructive'],
      description: 'Chromatic scheme of the filled range and thumb border.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Track thickness and thumb diameter.',
      table: { defaultValue: { summary: 'default' } },
    },
    min: { control: 'number', description: 'Minimum value.' },
    max: { control: 'number', description: 'Maximum value.' },
    step: { control: 'number', description: 'Stepping interval.' },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction of the slider.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    disabled: { control: 'boolean', description: 'Disables the slider.' },
    value: { control: false, description: 'Controlled value (array).' },
    defaultValue: {
      control: 'object',
      description: 'Initial value as an array (uncontrolled).',
    },
  },
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** Every chromatic variant, shown at the same value. */
export const Variants: Story = {
  render: (args) => (
    <div className="grid w-72 grid-cols-[auto_1fr] items-center gap-x-6 gap-y-4">
      {(['default', 'success', 'destructive'] as const).map((variant) => (
        <Fragment key={variant}>
          <code className="text-sm">{variant}</code>
          <Slider {...args} variant={variant} defaultValue={[60]} aria-label={variant} />
        </Fragment>
      ))}
    </div>
  ),
}

/** The three sizes stacked, same value. */
export const Sizes: Story = {
  render: (args) => (
    <div className="grid w-72 grid-cols-[auto_1fr] items-center gap-x-6 gap-y-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Fragment key={size}>
          <code className="text-muted-foreground text-xs">{size}</code>
          <Slider {...args} size={size} defaultValue={[60]} aria-label={size} />
        </Fragment>
      ))}
    </div>
  ),
}

/** Two thumbs select a lower and upper bound. */
export const RangeSelection: Story = {
  args: { defaultValue: [25, 75] },
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
}

/** Discrete steps via `step` — values snap to multiples of 10. */
export const Steps: Story = {
  args: { defaultValue: [40], step: 10 },
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: [40] },
  render: (args) => (
    <div className="w-72">
      <Slider {...args} />
    </div>
  ),
}

/** Vertical orientation inside a fixed-height container. */
export const Vertical: Story = {
  args: { orientation: 'vertical', defaultValue: [50] },
  render: (args) => (
    <div className="flex h-48 justify-center">
      <Slider {...args} />
    </div>
  ),
}

/** Controlled example: value lives in the parent and reflects on a label. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([30])
    return (
      <div className="w-72 space-y-3">
        <label htmlFor="controlled-slider" className="flex justify-between text-sm">
          <span>Brightness</span>
          <span className="tabular-nums">{value[0]}%</span>
        </label>
        <Slider
          id="controlled-slider"
          value={value}
          onValueChange={setValue}
          aria-label="Brightness"
        />
      </div>
    )
  },
}

/** Keyboard: focus the thumb and arrow keys change the value by `step`. */
export const ChangesWithKeyboard: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const thumb = canvas.getByRole('slider')

    await userEvent.tab()
    await expect(thumb).toHaveFocus()
    await expect(thumb).toHaveAttribute('aria-valuenow', '50')

    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onValueChange).toHaveBeenCalledWith([51])
    await expect(thumb).toHaveAttribute('aria-valuenow', '51')

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    await expect(thumb).toHaveAttribute('aria-valuenow', '49')
  },
}

/** Arrow keys snap to the configured `step`. */
export const KeyboardRespectsStep: Story = {
  args: { defaultValue: [40], step: 10, onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const thumb = canvas.getByRole('slider')

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onValueChange).toHaveBeenCalledWith([50])
    await expect(thumb).toHaveAttribute('aria-valuenow', '50')
  },
}

/** A range exposes one `slider` role per thumb, each bounded by the other. */
export const RangeHasTwoThumbs: Story = {
  args: { defaultValue: [25, 75] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const thumbs = canvas.getAllByRole('slider')

    await expect(thumbs).toHaveLength(2)
    await expect(thumbs[0]).toHaveAttribute('aria-valuenow', '25')
    await expect(thumbs[1]).toHaveAttribute('aria-valuenow', '75')
  },
}

/** A disabled slider does not change on keyboard interaction. */
export const DisabledDoesNotChange: Story = {
  args: { disabled: true, defaultValue: [40], onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const thumb = canvas.getByRole('slider')

    // Estado desabilitado vem do Radix via `data-disabled` (o Thumb é um span).
    await expect(thumb).toHaveAttribute('data-disabled')

    // Não é alcançável por teclado: o Tab não pousa nele.
    await userEvent.tab()
    await expect(thumb).not.toHaveFocus()

    // E mesmo com foco programático, as teclas não alteram o valor.
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onValueChange).not.toHaveBeenCalled()
    await expect(thumb).toHaveAttribute('aria-valuenow', '40')
  },
}
