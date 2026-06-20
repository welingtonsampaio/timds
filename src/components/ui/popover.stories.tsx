import type { Meta, StoryObj } from '@storybook/react-vite'
import { Settings2 } from 'lucide-react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Input } from './input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover'

// `component` points to `PopoverContent`: that's where the documentable props
// live (`align`, `side`, `sideOffset`) — the `Popover` (Radix Root) has no
// visible props. This way the MDX `<Controls>` renders a useful table.
const meta = {
  title: 'Overlays/Popover',
  component: PopoverContent,
  // No `autodocs`: the docs page is the custom MDX (popover.mdx).
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Floating panel anchored to a trigger, built on Radix `Popover` and rendered in a ' +
          'portal. Compose `PopoverTrigger` (usually `asChild` over a `Button`) with ' +
          '`PopoverContent` (props `align`, `side`, `sideOffset`); the optional ' +
          '`PopoverHeader`/`PopoverTitle`/`PopoverDescription` slots structure the body. It is ' +
          'non-modal — focus moves in on open and returns to the trigger on close; click ' +
          'outside or press Escape to dismiss. Each story starts closed — click the trigger.',
      },
    },
    // Demos start closed: Chromatic would only see the trigger. Visual
    // coverage lives in the `Visual*` stories (opened via `defaultOpen`).
    chromatic: { disableSnapshot: true },
  },
  args: {
    align: 'center',
    side: 'bottom',
    sideOffset: 4,
  },
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment of the content relative to the trigger.',
      table: { defaultValue: { summary: 'center' } },
    },
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred side of the trigger to render on (flips on collision).',
      table: { defaultValue: { summary: 'bottom' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Distance in pixels between the content and the trigger.',
      table: { defaultValue: { summary: '4' } },
    },
  },
} satisfies Meta<typeof PopoverContent>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — click the trigger to open the panel. */
export const Playground: Story = {
  render: (args) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" icon={<Settings2 />}>
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent {...args} aria-label="Dimensions">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the layout dimensions.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-3 grid gap-2">
          <Input aria-label="Width" defaultValue="100%" />
          <Input aria-label="Height" defaultValue="25px" />
        </div>
      </PopoverContent>
    </Popover>
  ),
}

/** A bare panel with only text content (no header). */
export const PlainContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Details</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Details">
        <p className="text-sm">
          Popovers hold secondary content next to the element that opened them.
        </p>
      </PopoverContent>
    </Popover>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions that ARE the regression tests.
 * The content is portaled into document.body: query it via `screen`, not `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the panel; Escape closes it and restores focus. */
export const OpensAndCloses: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the layout dimensions.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open popover' })

    // Starts closed: nothing portaled yet.
    await expect(screen.queryByText('Dimensions')).not.toBeInTheDocument()

    await userEvent.click(trigger)
    // findByText waits for the portal to mount; waitFor covers the entrance
    // animation (animate-in/fade-in leaves opacity 0 on the first frame → toBeVisible fails).
    await screen.findByText('Dimensions')
    await waitFor(() => expect(screen.getByText('Dimensions')).toBeVisible())

    // Escape closes and returns focus to the trigger (non-modal popover).
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('Dimensions')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/** Clicking outside the open panel dismisses it. */
export const ClosesOnOutsideClick: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions">
        <PopoverTitle>Dimensions</PopoverTitle>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open popover' }))
    await screen.findByText('Dimensions')

    // Pointerdown outside the content closes the popover.
    await userEvent.click(document.body)
    await waitFor(() => expect(screen.queryByText('Dimensions')).not.toBeInTheDocument())
  },
}

/** On open, focus moves into the panel (first focusable control). */
export const MovesFocusIntoContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions">
        <PopoverTitle>Dimensions</PopoverTitle>
        <Input aria-label="Width" defaultValue="100%" />
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open popover' }))
    await screen.findByText('Dimensions')

    // Focus moves into the panel; the first focusable field receives focus.
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Width' })).toHaveFocus(),
    )
  },
}

/* --------------------------------------------------------------------------
 * Visual regression fixtures (Chromatic): render the popover open
 * (`defaultOpen`). Hidden from the sidebar/docs (`!dev`/`!autodocs`), but still
 * run as a smoke test (tag `test`) and re-enable the snapshot the meta disables.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Visual capture — panel with header, title, description and fields. */
export const VisualWithHeader: Story = {
  ...visual,
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline" icon={<Settings2 />}>
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the layout dimensions.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-3 grid gap-2">
          <Input aria-label="Width" defaultValue="100%" />
          <Input aria-label="Height" defaultValue="25px" />
        </div>
      </PopoverContent>
    </Popover>
  ),
}

/** Visual capture — text-only panel. */
export const VisualPlain: Story = {
  ...visual,
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">Details</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Details">
        <p className="text-sm">
          Popovers hold secondary content next to the element that opened them.
        </p>
      </PopoverContent>
    </Popover>
  ),
}
