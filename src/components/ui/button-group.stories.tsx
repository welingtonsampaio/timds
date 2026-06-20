import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronLeft, ChevronRight, Copy, Minus, Plus } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from './button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group'

const meta = {
  title: 'Data Entry/ButtonGroup',
  component: ButtonGroup,
  // No `autodocs`: the docs page is the custom MDX (button-group.mdx), which
  // embeds these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'Layout wrapper that joins buttons (and related controls) into a single ' +
          'continuous segment, collapsing inner borders and corners. Lay it out ' +
          '`horizontal` or `vertical`, nest groups for gapped clusters, and compose ' +
          'with `ButtonGroupText` for static labels and `ButtonGroupSeparator` for ' +
          'divisions.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Direction the buttons are stacked in.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
  },
  args: { orientation: 'horizontal' },
} satisfies Meta<typeof ButtonGroup>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — switch `orientation` from the **Controls** panel. */
export const Playground: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">One</Button>
      <Button variant="outline">Two</Button>
      <Button variant="outline">Three</Button>
    </ButtonGroup>
  ),
}

/** Buttons sit side by side as one joined bar. */
export const Horizontal: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Archive</Button>
      <Button variant="outline">Report</Button>
      <Button variant="outline">Snooze</Button>
    </ButtonGroup>
  ),
}

/** The same grouping, stacked vertically. */
export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
}

/** Icon-only buttons make a compact stepper or pager. */
export const IconOnly: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Previous">
        <ChevronLeft />
      </Button>
      <Button variant="outline" size="icon" aria-label="Next">
        <ChevronRight />
      </Button>
    </ButtonGroup>
  ),
}

/** `ButtonGroupText` adds a static, non-interactive segment. */
export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Decrease">
        <Minus />
      </Button>
      <ButtonGroupText>12</ButtonGroupText>
      <Button variant="outline" size="icon" aria-label="Increase">
        <Plus />
      </Button>
    </ButtonGroup>
  ),
}

/** `ButtonGroupSeparator` divides clusters within a single bar. */
export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Copy</Button>
      <ButtonGroupSeparator />
      <Button variant="outline" size="icon" aria-label="Duplicate">
        <Copy />
      </Button>
    </ButtonGroup>
  ),
}

/** Nesting groups inserts a gap between the clusters. */
export const Nested: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Left</Button>
        <Button variant="outline">Center</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
}

// Module-level spies: `render` is static, so we clear them at the start of play.
const onFirst = fn()
const onSecond = fn()

/** Each child button keeps its own click handler; clicking fires only that one. */
export const ClicksFire: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" onClick={onFirst}>
        One
      </Button>
      <Button variant="outline" onClick={onSecond}>
        Two
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    onFirst.mockClear()
    onSecond.mockClear()
    const canvas = within(canvasElement)

    // The wrapper exposes `role="group"` and reflects the orientation in `data-orientation`.
    const group = canvas.getByRole('group')
    await expect(group).toHaveAttribute('data-orientation', 'horizontal')

    // Each child remains an independent `button` with its own handler.
    const one = canvas.getByRole('button', { name: 'One' })
    await userEvent.click(one)
    await expect(onFirst).toHaveBeenCalledOnce()
    await expect(onSecond).not.toHaveBeenCalled()
    await expect(one).toHaveFocus()
  },
}

/** Switching `orientation` to `vertical` reflects on `data-orientation`. */
export const VerticalReflectsOrientation: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group')
    await expect(group).toHaveAttribute('data-orientation', 'vertical')
  },
}

/** A static `ButtonGroupText` segment is exposed as text, not as a button. */
export const TextIsNotAButton: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Decrease">
        <Minus />
      </Button>
      <ButtonGroupText>12</ButtonGroupText>
      <Button variant="outline" size="icon" aria-label="Increase">
        <Plus />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The text segment is static: only the two icons are buttons.
    await expect(canvas.getAllByRole('button')).toHaveLength(2)
    await expect(canvas.getByText('12')).toBeInTheDocument()
  },
}
