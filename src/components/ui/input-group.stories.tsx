import type { Meta, StoryObj } from '@storybook/react-vite'
import { CreditCard, Search, Send } from 'lucide-react'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'

const meta = {
  title: 'UI/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Container that wraps a control (`InputGroupInput`/`InputGroupTextarea`) with ' +
          '**addons** — icons, text or buttons — aligned to either side (`align="inline-start"` / ' +
          '`"inline-end"`) or stacked above/below (`"block-start"` / `"block-end"`). Focus and ' +
          'error states propagate from the inner control to the whole group. Clicking an addon ' +
          'focuses the control.',
      },
    },
  },
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

/** Leading icon addon — the classic search field. */
export const Default: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Buscar…" aria-label="Buscar" />
    </InputGroup>
  ),
}

/** Text addons act as prefix/suffix (e.g. a URL field). */
export const WithText: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="meusite" aria-label="Domínio" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/** A trailing button addon — useful for submit/clear actions inside the field. */
export const WithButton: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <CreditCard />
      </InputGroupAddon>
      <InputGroupInput placeholder="Código do cupom" aria-label="Código do cupom" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Aplicar</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/** `InputGroupTextarea` with a block-aligned addon footer. */
export const WithTextarea: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupTextarea placeholder="Escreva um comentário…" aria-label="Comentário" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Markdown suportado</InputGroupText>
        <InputGroupButton className="ml-auto" size="sm" variant="default">
          <Send />
          Enviar
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/** Error state propagates from the control (`aria-invalid`) to the whole group. */
export const Invalid: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput aria-invalid defaultValue="termo inválido" aria-label="Buscar" />
    </InputGroup>
  ),
}

/** Interaction test: the button addon fires `onClick` when activated. */
const handleApply = fn()

export const ButtonClicks: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupInput placeholder="Cupom" aria-label="Cupom" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={handleApply}>Aplicar</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    handleApply.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Aplicar' }))
    await expect(handleApply).toHaveBeenCalledOnce()
  },
}

/** Interaction test: clicking the addon focuses the inner control. */
export const AddonFocusesInput: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon data-testid="search-addon">
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Buscar…" aria-label="Buscar" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const addon = canvas.getByTestId('search-addon')
    await userEvent.click(addon)
    await expect(canvas.getByRole('textbox', { name: 'Buscar' })).toHaveFocus()
  },
}
