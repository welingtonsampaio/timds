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
  title: 'UI/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
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
    maxLength: { control: 'number', description: 'Total number of characters/slots.' },
    disabled: { control: 'boolean', description: 'Disable the field.' },
    children: { control: false, description: 'Slot layout (groups, slots, separators).' },
  },
} satisfies Meta<typeof InputOTP>

export default meta

type Story = StoryObj<typeof meta>

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

export const Disabled: Story = {
  args: { disabled: true, value: '123', children: continuousSlots(6) },
}

/** Interaction test: typing fills the slots and fires `onChange` with the value. */
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
