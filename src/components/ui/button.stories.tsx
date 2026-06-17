import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Rocket } from 'lucide-react'
import type { FormEvent } from 'react'
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
          '(default, secondary, destructive, outline, ghost, link), four **sizes** ' +
          '(default, sm, lg, icon) and two **shapes** (default, rounded). Pass an `icon` ' +
          'with `iconPlacement` to add a leading/trailing icon; the `loading` flag swaps ' +
          'that icon for a spinner and disables the button. Use `asChild` to render the ' +
          'styling on a custom element (e.g. an `<a>` link) without an extra wrapper.',
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
    shape: {
      control: 'inline-radio',
      options: ['default', 'rounded'],
      description: 'Corner shape. `rounded` makes the button fully pill/circular.',
      table: { defaultValue: { summary: 'default' } },
    },
    iconPlacement: {
      control: 'inline-radio',
      options: ['left', 'right'],
      description: 'Side where the `icon` (or the loading spinner) is rendered.',
      table: { defaultValue: { summary: 'left' } },
    },
    icon: { control: false, description: 'Icon node shown alongside the content.' },
    loading: {
      control: 'boolean',
      description: 'Show a spinner in place of the icon and disable the button.',
    },
    block: {
      control: 'boolean',
      description: 'Stretch the button to fill its container width.',
      table: { defaultValue: { summary: 'false' } },
    },
    htmlType: {
      control: 'inline-radio',
      options: ['button', 'submit', 'reset'],
      description: 'Native `type` of the `<button>`. Ignored when `href` is set.',
      table: { defaultValue: { summary: 'button' } },
    },
    href: {
      control: 'text',
      description: 'Render the button as an `<a>` linking to this URL.',
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

/** Icon supplied via the `icon` prop instead of inline children. */
export const IconProp: Story = {
  args: {
    icon: <Rocket />,
    children: 'Lançar',
  },
}

/** `iconPlacement="right"` renders the icon after the label. */
export const IconRight: Story = {
  args: {
    icon: <ArrowRight />,
    iconPlacement: 'right',
    children: 'Avançar',
  },
}

/** `loading` swaps the icon for a spinner and disables the button. */
export const Loading: Story = {
  args: {
    icon: <Rocket />,
    loading: true,
    children: 'Lançando',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /lançando/i })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute('aria-busy', 'true')
    // Em loading o botão tem `pointer-events: none`; forçamos o clique
    // (pointerEventsCheck: 0) para provar que, ainda assim, `onClick` não
    // dispara — pois está `disabled`.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

/** Loading also works without an icon — the spinner takes the icon slot. */
export const LoadingNoIcon: Story = {
  args: {
    loading: true,
    children: 'Salvando',
  },
}

/** `shape="rounded"` for pill-shaped (and circular, with `size="icon"`) buttons. */
export const Rounded: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} shape="rounded">
        Rounded
      </Button>
      <Button {...args} shape="rounded" size="icon" aria-label="Lançar">
        <Rocket />
      </Button>
    </div>
  ),
}

/** `href` renders an `<a>` styled as a button (icons and variants still apply). */
export const LinkButton: Story = {
  args: {
    href: 'https://example.com',
    icon: <ArrowRight />,
    iconPlacement: 'right',
    children: 'Abrir link',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: 'Abrir link' })
    await expect(link.tagName).toBe('A')
    await expect(link).toHaveAttribute('href', 'https://example.com')
  },
}

/** A disabled link button drops its `href` and is removed from the tab order. */
export const LinkDisabled: Story = {
  args: {
    href: 'https://example.com',
    disabled: true,
    children: 'Link desabilitado',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByText('Link desabilitado').closest('a')
    await expect(link).not.toBeNull()
    await expect(link).not.toHaveAttribute('href')
    await expect(link).toHaveAttribute('aria-disabled', 'true')
    await expect(link).toHaveAttribute('tabindex', '-1')
  },
}

/** `block` makes the button fill the available width. */
export const Block: Story = {
  args: { block: true, children: 'Largura total' },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-6">
        <Story />
      </div>
    ),
  ],
}

/** `htmlType="submit"` submits the surrounding form; `reset` clears it. */
const handleSubmit = fn((e: FormEvent) => e.preventDefault())

export const SubmitInForm: Story = {
  args: { htmlType: 'submit', children: 'Enviar' },
  render: (args) => (
    <form className="flex flex-col items-start gap-3" onSubmit={handleSubmit}>
      <input className="rounded-md border px-3 py-1.5 text-sm" placeholder="Seu nome" />
      <Button {...args} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    handleSubmit.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Enviar' }))
    await expect(handleSubmit).toHaveBeenCalledOnce()
  },
}

/**
 * Interactive states. Hover, focus and click are handled with CSS so they work
 * for mouse, keyboard and touch alike:
 * - **hover** — background shifts per variant (e.g. `bg-primary/90`).
 * - **focus** — keyboard focus shows a 3px `ring` (`focus-visible`), no ring on
 *   plain mouse clicks.
 * - **click-effect** — the button scales down (`active:scale-[0.97]`) while
 *   pressed; honors `prefers-reduced-motion`. The `link` variant is exempt.
 *
 * Hover with the mouse and press <kbd>Tab</kbd> here to see each state.
 */
export const States: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args}>Default</Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
    </div>
  ),
}

/** Interaction test: keyboard focus lands on the button (drives the focus ring). */
export const FocusesWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Button' })
    await userEvent.tab()
    await expect(button).toHaveFocus()
  },
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
