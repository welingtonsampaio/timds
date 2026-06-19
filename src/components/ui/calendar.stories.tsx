import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Calendar } from './calendar'

// Mês/dia fixos para tornar render e testes determinísticos (sem depender da
// data atual). Junho/2025 começa num domingo, então a grade exibe 1..30 sem
// dias "de fora" no início e com Jul 1..5 ao final.
const FIXED_MONTH = new Date(2025, 5, 1)
const FIXED_DAY = new Date(2025, 5, 15)

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  // Sem `autodocs`: a página de docs é a MDX customizada (calendar.mdx).
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Date-field calendar built on `react-day-picker`, styled with the design-system ' +
          'tokens and reusing the repo `Button` for days and navigation. Pick the selection ' +
          'shape with `mode`: `single`, `range` or `multiple`. `captionLayout` switches the ' +
          'header between a static label and month/year dropdowns; `numberOfMonths` renders ' +
          'several months side by side. It is the building block of `DatePicker` — for a ' +
          'single date in a popover trigger, prefer that.',
      },
    },
  },
  args: {
    showOutsideDays: true,
    captionLayout: 'label',
    numberOfMonths: 1,
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range', 'multiple'],
      description: 'Selection shape (drives the `selected`/`onSelect` types).',
    },
    captionLayout: {
      control: 'select',
      options: ['label', 'dropdown', 'dropdown-months', 'dropdown-years'],
      description: 'Header as a static label or month/year dropdowns.',
      table: { defaultValue: { summary: 'label' } },
    },
    numberOfMonths: {
      control: { type: 'number', min: 1, max: 3 },
      description: 'How many months to render side by side.',
      table: { defaultValue: { summary: '1' } },
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Show leading/trailing days from adjacent months.',
      table: { defaultValue: { summary: 'true' } },
    },
    buttonVariant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'secondary'],
      description: 'Button variant used by the navigation arrows.',
      table: { defaultValue: { summary: 'ghost' } },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive single-date calendar — tweak props from **Controls**. */
export const Playground: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(FIXED_DAY)
    return (
      <Calendar
        {...args}
        mode="single"
        defaultMonth={FIXED_MONTH}
        selected={date}
        onSelect={setDate}
      />
    )
  },
}

export const Default: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(FIXED_DAY)
    return (
      <Calendar
        {...args}
        mode="single"
        defaultMonth={FIXED_MONTH}
        selected={date}
        onSelect={setDate}
      />
    )
  },
}

/** `mode="range"` selects a contiguous start→end interval. */
export const RangeMode: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(2025, 5, 9),
      to: new Date(2025, 5, 15),
    })
    return (
      <Calendar
        mode="range"
        defaultMonth={FIXED_MONTH}
        selected={range}
        onSelect={setRange}
      />
    )
  },
}

/** `mode="multiple"` collects an unordered set of individual days. */
export const MultipleMode: Story = {
  render: () => {
    const [days, setDays] = useState<Date[] | undefined>([
      new Date(2025, 5, 4),
      new Date(2025, 5, 12),
      new Date(2025, 5, 20),
    ])
    return (
      <Calendar
        mode="multiple"
        defaultMonth={FIXED_MONTH}
        selected={days}
        onSelect={setDays}
      />
    )
  },
}

/** `captionLayout="dropdown"` turns the header into month + year selects. */
export const WithDropdowns: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(FIXED_DAY)
    return (
      <Calendar
        {...args}
        mode="single"
        captionLayout="dropdown"
        defaultMonth={FIXED_MONTH}
        selected={date}
        onSelect={setDate}
      />
    )
  },
}

/** Two months side by side via `numberOfMonths`. */
export const TwoMonths: Story = {
  render: (args) => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(2025, 5, 24),
      to: new Date(2025, 6, 3),
    })
    return (
      <Calendar
        {...args}
        mode="range"
        numberOfMonths={2}
        defaultMonth={FIXED_MONTH}
        selected={range}
        onSelect={setRange}
      />
    )
  },
}

/** Weekends are disabled and cannot be selected. */
export const DisabledDays: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        {...args}
        mode="single"
        defaultMonth={FIXED_MONTH}
        disabled={{ dayOfWeek: [0, 6] }}
        selected={date}
        onSelect={setDate}
      />
    )
  },
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * O nome acessível de cada dia é o aria-label do rdp (formato "PPPP"), com
 * ", selected" anexado quando selecionado; o texto visível é o número do dia.
 * -------------------------------------------------------------------------- */

// Spies de módulo: o tipo de `Calendar` é uma união discriminada por `mode`,
// então `onSelect`/`onMonthChange` não podem viver em `meta.args` (não existem
// no topo da união). Usamos spies locais e limpamos no início de cada play.
const onSelect = fn()
const onMonthChange = fn()

/** Clicking a day selects it: fires `onSelect` and marks it selected. */
export const SelectsADay: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        defaultMonth={FIXED_MONTH}
        selected={date}
        onSelect={(day, ...rest) => {
          setDate(day)
          onSelect(day, ...rest)
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    onSelect.mockClear()
    const canvas = within(canvasElement)
    // O dia 15 é único na grade (não há dia "de fora" 15 em jun/2025).
    await userEvent.click(canvas.getByText('15'))

    await expect(onSelect).toHaveBeenCalledOnce()
    const picked = onSelect.mock.calls[0][0] as Date
    await expect(picked.getDate()).toBe(15)
    // O rdp anexa ", selected" ao aria-label do dia escolhido.
    await expect(
      canvas.getByRole('button', { name: /June 15.*selected/i }),
    ).toBeInTheDocument()
  },
}

/** The next/previous arrows page the visible month and fire `onMonthChange`. */
export const NavigatesMonths: Story = {
  render: () => (
    <Calendar mode="single" defaultMonth={FIXED_MONTH} onMonthChange={onMonthChange} />
  ),
  play: async ({ canvasElement }) => {
    onMonthChange.mockClear()
    const canvas = within(canvasElement)
    // A grade é nomeada pelo mês visível (aria-label = "June 2025").
    await expect(canvas.getByRole('grid', { name: /June 2025/i })).toBeInTheDocument()

    await userEvent.click(canvas.getByRole('button', { name: /next month/i }))
    await expect(onMonthChange).toHaveBeenCalledOnce()
    await waitFor(() =>
      expect(canvas.getByRole('grid', { name: /July 2025/i })).toBeInTheDocument(),
    )
  },
}

/** A disabled day ignores clicks and never fires `onSelect`. */
export const DisabledDayDoesNotSelect: Story = {
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={FIXED_MONTH}
      disabled={{ dayOfWeek: [0, 6] }}
      onSelect={onSelect}
    />
  ),
  play: async ({ canvasElement }) => {
    onSelect.mockClear()
    const canvas = within(canvasElement)
    // 14/jun/2025 é sábado → desabilitado.
    const saturday = canvas.getByRole('button', { name: /June 14/i })
    await expect(saturday).toBeDisabled()

    // pointer-events:none bloqueia o clique; forçamos para provar o no-op.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(saturday)
    await expect(onSelect).not.toHaveBeenCalled()
  },
}
