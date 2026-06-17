import type { Meta, StoryObj } from '@storybook/react-vite'
import { Rocket } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Primary interactive control. Built on a `cva` recipe with six **variants** ' +
          '(default, secondary, destructive, outline, ghost, link) and four **sizes** ' +
          '(default, sm, lg, icon). Use `asChild` to render the styling on a custom element ' +
          '(e.g. an `<a>` link) without an extra wrapper.',
      },
    },
  },
  args: {
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Visual style / emphasis of the button.',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Height and padding preset. Use `icon` for square icon-only buttons.',
      table: { defaultValue: { summary: 'default' } },
    },
    asChild: {
      control: false,
      description:
        'Merge props onto the child element instead of rendering a `<button>`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and dims the button.',
    },
    children: { control: 'text', description: 'Button label or content.' },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Link: Story = {
  args: { variant: 'link' },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Rocket />
        Lançar
      </>
    ),
  },
}

export const IconOnly: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Lançar',
    children: <Rocket />,
  },
}

/** All sizes side by side. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
}

/** Interaction test: clicking the button fires `onClick`. Runs in the Vitest addon. */
export const ClicksOnce: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Button' })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
