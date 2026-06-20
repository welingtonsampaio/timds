import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './avatar'

// Stable image used in the visual stories.
const SRC = 'https://github.com/shadcn.png'

// Inlined 1x1 transparent PNG (data URI): loads locally, no network, so the
// test that depends on the image load is deterministic in the test browser.
const SRC_INLINE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC'

const meta = {
  title: 'Data Display/Avatar',
  component: Avatar,
  // No `autodocs`: the docs page is the custom MDX (avatar.mdx), which embeds
  // these stories. Having both would generate duplicate Docs entries.
  parameters: {
    docs: {
      description: {
        component:
          'User avatar built on Radix `Avatar`. Renders `AvatarImage` and falls back to ' +
          '`AvatarFallback` (usually initials) when the image is missing or fails to load. ' +
          'Three `size`s (`sm` / `default` / `lg`) propagate to subcomponents via `data-size`. ' +
          'Compose with `AvatarBadge` for a status dot and `AvatarGroup` + `AvatarGroupCount` ' +
          'for stacks.',
      },
    },
  },
  args: { size: 'default' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Avatar diameter; propagated to badge and group count.',
      table: { defaultValue: { summary: 'default' } },
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={SRC} alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — one per variant / visual composition.
 * Each one mounts without error and passes axe automatically.
 * -------------------------------------------------------------------------- */

/** Fully interactive — tweak each prop via the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** The three sizes side by side. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src={SRC} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarImage src={SRC} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src={SRC} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  ),
}

/** Without a valid image, the fallback (initials) is shown. */
export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>WS</AvatarFallback>
    </Avatar>
  ),
}

/** Status indicator overlaid via `AvatarBadge`. */
export const WithBadge: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src={SRC} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
        <AvatarBadge className="bg-success" />
      </Avatar>
      <Avatar>
        <AvatarImage src={SRC} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
        <AvatarBadge className="bg-success" />
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src={SRC} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
        <AvatarBadge className="bg-muted-foreground" />
      </Avatar>
    </div>
  ),
}

/** Stack of avatars with a trailing count. */
export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src={SRC} alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions that ARE the regression tests.
 * Avatar is not interactive (no callbacks/focus): we assert the structural
 * composition (image alt, fallback, data-slots, group count).
 * Always `await` on expect.
 * -------------------------------------------------------------------------- */

/** The fallback (initials) is rendered when there is no image. */
export const FallbackRenders: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>WS</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('WS')).toBeInTheDocument()
  },
}

/** The loaded image exposes its alternative text (`alt`). */
export const ImageHasAltText: Story = {
  render: () => (
    <Avatar>
      {/* local data URI: the load is deterministic (no network) in the test browser. */}
      <AvatarImage src={SRC_INLINE} alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Radix only mounts the <img> after the load; we wait for the image with role `img`.
    const img = await waitFor(() => canvas.getByRole('img', { name: '@shadcn' }))
    await expect(img).toHaveAttribute('alt', '@shadcn')
  },
}

/** The root `size` propagates to subcomponents via `data-size`. */
export const SizePropagates: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>CN</AvatarFallback>
      <AvatarBadge data-testid="badge" className="bg-success" />
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByText('CN').closest('[data-slot="avatar"]')
    await expect(root).toHaveAttribute('data-size', 'lg')
  },
}

/** The group stacks the avatars and closes with the count (e.g.: "+3"). */
export const GroupRendersCount: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('CN')).toBeInTheDocument()
    await expect(canvas.getByText('AB')).toBeInTheDocument()
    await expect(canvas.getByText('+3')).toBeInTheDocument()
  },
}
