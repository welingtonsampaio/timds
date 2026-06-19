import type { Meta, StoryObj } from '@storybook/react-vite'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { expect, fn, userEvent, within } from 'storybook/test'

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp'

// Layout contínuo de N slots, sem separador.
function continuousSlots(count: number) {
  return (
    <InputOTPGroup>
      {Array.from({ length: count }, (_, i) => (
        // O índice é a identidade fixa de cada slot (lista estática, nunca reordena).
        // biome-ignore lint/suspicious/noArrayIndexKey: o índice do slot é estável e único
        <InputOTPSlot key={i} index={i} />
      ))}
    </InputOTPGroup>
  )
}

const meta = {
  title: 'Data Entry/InputOTP',
  component: InputOTP,
  // Sem `autodocs`: a página de docs é a MDX customizada (input-otp.mdx), que embute
  // estas stories. Ter ambos geraria entradas de Docs duplicadas (MultipleIndexingError).
  parameters: {
    docs: {
      description: {
        component:
          'One-time-password / verification code field built on `input-otp`. Set `maxLength` ' +
          'and lay out the slots with `InputOTPGroup` + `InputOTPSlot` (the `index` maps each ' +
          'slot to a character), optionally split by `InputOTPSeparator`. Restrict typing with ' +
          '`pattern` (e.g. `REGEXP_ONLY_DIGITS`). Caret and active slot are handled for you.',
      },
    },
  },
  args: {
    maxLength: 6,
    'aria-label': 'Código de verificação',
    onChange: fn(),
    // Padrão: seis dígitos divididos 3 + 3 por um separador.
    children: (
      <>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </>
    ),
  },
  argTypes: {
    maxLength: {
      control: 'number',
      description: 'Total number of characters/slots the field accepts.',
    },
    pattern: {
      control: false,
      description: 'Regex restricting accepted characters (e.g. `REGEXP_ONLY_DIGITS`).',
    },
    disabled: { control: 'boolean', description: 'Disables the field.' },
    value: { control: 'text', description: 'Controlled value.' },
    onChange: {
      control: false,
      description: 'Fires with the full string on every change.',
    },
    children: {
      control: false,
      description: 'Slot layout: `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`.',
    },
  },
} satisfies Meta<typeof InputOTP>

export default meta

type Story = StoryObj<typeof meta>

/* --------------------------------------------------------------------------
 * Render stories — uma por estado visual (render-testadas + axe).
 * -------------------------------------------------------------------------- */

/** Six digits split 3 + 3 by a separator. */
export const Default: Story = {}

/** A single continuous group of four slots, no separator. */
export const FourDigits: Story = {
  args: { maxLength: 4, children: continuousSlots(4) },
}

/** `pattern={REGEXP_ONLY_DIGITS}` blocks any non-numeric character. */
export const DigitsOnly: Story = {
  args: { pattern: REGEXP_ONLY_DIGITS, children: continuousSlots(6) },
}

/** A partially-filled field: the first slots carry chars, the next is active. */
export const Filled: Story = {
  args: { value: '123', children: continuousSlots(6) },
}

export const Disabled: Story = {
  args: { disabled: true, value: '123', children: continuousSlots(6) },
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * -------------------------------------------------------------------------- */

/** Typing fills the slots in order and fires `onChange` with the full value. */
export const TypesCode: Story = {
  args: { pattern: REGEXP_ONLY_DIGITS, children: continuousSlots(6) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Código de verificação' })
    await userEvent.type(input, '123456')
    await expect(input).toHaveValue('123456')
    await expect(args.onChange).toHaveBeenLastCalledWith('123456')
  },
}

/** The hidden input is keyboard-focusable, so typing can start immediately. */
export const FocusesWithKeyboard: Story = {
  args: { children: continuousSlots(6) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    await expect(
      canvas.getByRole('textbox', { name: 'Código de verificação' }),
    ).toHaveFocus()
  },
}

/** `pattern` rejects characters outside the allowed set (digits only here). */
export const RejectsNonMatchingChars: Story = {
  args: { pattern: REGEXP_ONLY_DIGITS, children: continuousSlots(6) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Código de verificação' })
    // Letras não casam com REGEXP_ONLY_DIGITS e são descartadas; só os dígitos entram.
    await userEvent.type(input, 'ab12')
    await expect(input).toHaveValue('12')
    await expect(args.onChange).toHaveBeenLastCalledWith('12')
  },
}

/** Backspace removes the last character and updates the value. */
export const BackspaceDeletes: Story = {
  args: { pattern: REGEXP_ONLY_DIGITS, children: continuousSlots(6) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Código de verificação' })
    await userEvent.type(input, '123')
    await userEvent.keyboard('{Backspace}')
    await expect(input).toHaveValue('12')
    await expect(args.onChange).toHaveBeenLastCalledWith('12')
  },
}

/** A disabled field does not accept input. */
export const DisabledDoesNotType: Story = {
  args: { disabled: true, children: continuousSlots(6) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'Código de verificação' })
    await expect(input).toBeDisabled()
    // Em disabled o input tem pointer-events:none; forçamos a digitação
    // (pointerEventsCheck: 0) para provar que nada é registrado mesmo assim.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.type(input, '123')
    await expect(input).toHaveValue('')
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}
