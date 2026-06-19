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

// Imagem estável usada nas histórias visuais.
const SRC = 'https://github.com/shadcn.png'

// PNG 1x1 transparente embutido (data URI): carrega localmente, sem rede, então o
// teste que depende do load da imagem é determinístico no browser de teste.
const SRC_INLINE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC'

const meta = {
  title: 'Data Display/Avatar',
  component: Avatar,
  // Sem `autodocs`: a página de docs é a MDX customizada (avatar.mdx), que embute
  // estas stories. Ter ambos geraria entradas de Docs duplicadas.
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
 * Render stories — uma por variante / composição visual.
 * Cada uma monta sem erro e passa pelo axe automaticamente.
 * -------------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Avatar não é interativo (sem callbacks/foco): asseguramos a composição
 * estrutural (image alt, fallback, data-slots, contagem do grupo).
 * Sempre `await` em expect.
 * -------------------------------------------------------------------------- */

/** O fallback (iniciais) é renderizado quando não há imagem. */
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

/** A imagem carregada expõe seu texto alternativo (`alt`). */
export const ImageHasAltText: Story = {
  render: () => (
    <Avatar>
      {/* data URI local: o load é determinístico (sem rede) no browser de teste. */}
      <AvatarImage src={SRC_INLINE} alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // O Radix só monta a <img> após o load; aguardamos a imagem com role `img`.
    const img = await waitFor(() => canvas.getByRole('img', { name: '@shadcn' }))
    await expect(img).toHaveAttribute('alt', '@shadcn')
  },
}

/** O `size` do root propaga para os subcomponentes via `data-size`. */
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

/** O grupo empilha os avatares e fecha com o contador (ex.: "+3"). */
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
