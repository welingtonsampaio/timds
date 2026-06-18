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
  // Sem `autodocs`: a página de docs é a MDX customizada (input-group.mdx), que embute
  // estas stories. Ter ambos geraria entradas de Docs duplicadas (MultipleIndexingError).
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
  argTypes: {
    children: {
      control: false,
      description:
        'Inner control (`InputGroupInput`/`InputGroupTextarea`) plus any `InputGroupAddon`s.',
    },
  },
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — uma por composição/estado visual (render-testadas + axe).
 * -------------------------------------------------------------------------- */

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

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * Spies de módulo: limpos manualmente no início de cada play (mesmo idioma do button).
 * -------------------------------------------------------------------------- */

const handleApply = fn()
const handleChange = fn()

/** Typing in the inner control updates the value and fires `onChange`. */
export const TypesInControl: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput aria-label="Buscar" onChange={handleChange} />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    handleChange.mockClear()
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Buscar' })
    await userEvent.type(input, 'timds')
    await expect(input).toHaveValue('timds')
    await expect(handleChange).toHaveBeenCalled()
  },
}

/** The button addon fires `onClick` when activated. */
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

/** Clicking the addon focuses the inner control. */
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
    // O addon é decorativo (sem role acionável), então consultamos por testId.
    const addon = canvas.getByTestId('search-addon')
    await userEvent.click(addon)
    await expect(canvas.getByRole('textbox', { name: 'Buscar' })).toHaveFocus()
  },
}

/** Tab reaches the inner control, then the trailing button — focus order is left-to-right. */
export const FocusOrder: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupInput placeholder="Cupom" aria-label="Cupom" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Aplicar</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(canvas.getByRole('textbox', { name: 'Cupom' })).toHaveFocus()
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Aplicar' })).toHaveFocus()
  },
}
