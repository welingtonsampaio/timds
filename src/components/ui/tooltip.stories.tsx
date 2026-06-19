import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, within } from 'storybook/test'

import { Button } from './button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  // Sem `autodocs`: a página de docs é a MDX customizada (tooltip.mdx).
  parameters: {
    docs: {
      description: {
        component:
          'A small floating label that explains an element on hover or keyboard focus, built ' +
          'on Radix `Tooltip`. Wrap an interactive trigger with `TooltipTrigger` and put the ' +
          'text in `TooltipContent`; a `TooltipProvider` (mounted once near the app root) shares ' +
          'the open delay. Use it for supplementary hints on icon-only buttons — never for ' +
          'essential information, since touch users never see it.',
      },
    },
    // As histórias começam fechadas: o Chromatic só veria o trigger. A cobertura
    // visual fica na história `VisualOpen` (aberta), que reativa o snapshot.
    chromatic: { disableSnapshot: true },
  },
  // Todo tooltip precisa de um Provider em volta.
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

/** Hover (or focus) the trigger to reveal the hint. */
export const Playground: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
}

/** `TooltipContent` accepts `side` to place the label around the trigger. */
export const Sides: Story = {
  render: () => (
    <div className="flex gap-8">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline">{side}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>On {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — o conteúdo é portado para document.body: use `screen`.
 * -------------------------------------------------------------------------- */

/** Hovering the trigger shows the tooltip; unhovering hides it. */
export const ShowsOnHover: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(canvas.getByRole('button', { name: 'Hover me' }))
    // Radix porta o conteúdo para o body; o role do tooltip é `tooltip`.
    const tip = await screen.findByRole('tooltip')
    await expect(tip).toHaveTextContent('Add to library')
  },
}

/** Keyboard focus also opens the tooltip (parity with hover). */
export const ShowsOnFocus: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Focus me</Button>
      </TooltipTrigger>
      <TooltipContent>Keyboard accessible</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Focus me' })).toHaveFocus()
    const tip = await screen.findByRole('tooltip')
    await expect(tip).toHaveTextContent('Keyboard accessible')
  },
}

/* --------------------------------------------------------------------------
 * Visual regression — fixture aberta e determinística para o Chromatic.
 * -------------------------------------------------------------------------- */

/** Deterministic open state for the visual snapshot. */
export const VisualOpen: Story = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
  render: () => (
    <div className="p-16">
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline">Trigger</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Tooltip label</TooltipContent>
      </Tooltip>
    </div>
  ),
}
