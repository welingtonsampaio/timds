import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from './avatar'

// Imagem estável usada nas histórias visuais.
const SRC = 'https://github.com/shadcn.png'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'User avatar built on Radix `Avatar`. Renders `AvatarImage` and falls back to ' +
          '`AvatarFallback` (usually initials) when the image is missing or fails to load. ' +
          'Three `size`s (`sm` / `default` / `lg`) propagate to subcomponents. Compose with ' +
          '`AvatarBadge` for a status dot and `AvatarGroup` + `AvatarGroupCount` for stacks.',
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

/** Totalmente interativo — ajuste cada prop pelo painel **Controls**. */
export const Playground: Story = {}

export const Default: Story = {}

/** Os três tamanhos lado a lado. */
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

/** Sem imagem válida, o fallback (iniciais) é exibido. */
export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>WS</AvatarFallback>
    </Avatar>
  ),
}

/** Indicador de status sobreposto via `AvatarBadge`. */
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

/** Pilha de avatares com contador final. */
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

/** Verifica que o fallback é renderizado quando não há imagem. */
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
