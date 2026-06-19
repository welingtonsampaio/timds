import type { Meta, StoryObj } from '@storybook/react-vite'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { Calendar } from './calendar'
import { DatePicker } from './date-picker'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './popover'

// Mês/dia fixos para tornar render e testes determinísticos (sem depender da
// data atual). Junho/2025 sempre exibe os dias 1..30 do mês.
const FIXED_MONTH = new Date(2025, 5, 1)
const FIXED_DAY = new Date(2025, 5, 15)
const FIXED_RANGE: DateRange = {
  from: new Date(2025, 5, 9),
  to: new Date(2025, 5, 15),
}

// ---------------------------------------------------------------------------
// Padrões de intervalo (range) — compostos a partir dos primitivos públicos
// ---------------------------------------------------------------------------
// O `DatePicker` é single-date por design. Para intervalos, compõe-se `Popover`
// + `Calendar` (mode="range") + `Button`, exatamente como o `DatePicker` faz
// internamente. Estes dois helpers servem de referência copiável e são a base
// das stories/regressões de range.

/** Formata um `DateRange` para o rótulo do gatilho. */
function formatRange(range?: DateRange) {
  if (!range?.from) return null
  if (!range.to) return format(range.from, 'LLL d, y')
  return `${format(range.from, 'LLL d')} – ${format(range.to, 'LLL d, y')}`
}

// Seleção de intervalo controlada manualmente a partir do dia clicado (o rdp
// entrega esse dia no 2º argumento do `onSelect`). Regras pedidas:
//   • escolher uma data NÃO fecha o calendário;
//   • com um range completo, o clique reinicia o `startDate`. Se o novo início
//     for anterior ao `endDate` atual, o `endDate` é mantido; só então o
//     próximo clique troca o `endDate`. Se o novo início for ≥ `endDate`, o
//     intervalo recomeça do zero.
// Uma fase 'start' | 'end' modela "qual ponta o próximo clique define".
type RangePhase = 'start' | 'end'

function nextRangeState(
  range: DateRange | undefined,
  phase: RangePhase,
  day: Date,
): { range: DateRange; phase: RangePhase } {
  if (phase === 'start') {
    // O clique vira o novo início; mantém o fim atual se ele ficar depois.
    if (range?.to && day.getTime() < range.to.getTime()) {
      return { range: { from: day, to: range.to }, phase: 'end' }
    }
    return { range: { from: day, to: undefined }, phase: 'end' }
  }
  // phase 'end': o clique define o fim (se ≥ início); senão reinicia o início.
  if (range?.from && day.getTime() >= range.from.getTime()) {
    return { range: { from: range.from, to: day }, phase: 'start' }
  }
  return { range: { from: day, to: undefined }, phase: 'end' }
}

function useRangeSelection(initial?: DateRange) {
  const [state, setState] = useState<{ range?: DateRange; phase: RangePhase }>(() => ({
    range: initial,
    phase: initial?.from && !initial.to ? 'end' : 'start',
  }))
  const onDayClick = (day: Date) => setState((s) => nextRangeState(s.range, s.phase, day))
  return { range: state.range, onDayClick }
}

/** Range em um único gatilho: abre um calendário de 2 meses em popover. */
function DateRangePicker({
  defaultOpen = false,
  initialRange,
}: {
  defaultOpen?: boolean
  initialRange?: DateRange
}) {
  const { range, onDayClick } = useRangeSelection(initialRange)
  const [open, setOpen] = useState(defaultOpen)
  const label = formatRange(range)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          icon={<CalendarIcon />}
          className={`w-72 justify-start text-left font-normal${label ? '' : ' text-muted-foreground'}`}
        >
          {label ?? 'Pick a date range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" aria-label="Choose date range">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={FIXED_MONTH}
          selected={range}
          // Usa o dia clicado (2º arg) e aplica a regra custom; não fecha.
          onSelect={(_next, day) => onDayClick(day)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

/** Range em dois campos (início/fim) que partilham o mesmo calendário. */
function DateRangeDualField({ initialRange }: { initialRange?: DateRange }) {
  const { range, onDayClick } = useRangeSelection(initialRange)
  const [open, setOpen] = useState(false)

  const fieldClass = (filled: boolean) =>
    `w-40 justify-start text-left font-normal${filled ? '' : ' text-muted-foreground'}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="flex items-end gap-2">
          <div className="grid gap-1.5">
            <span className="text-muted-foreground text-xs">Start</span>
            <Button
              variant="outline"
              icon={<CalendarIcon />}
              className={fieldClass(Boolean(range?.from))}
              onClick={() => setOpen(true)}
            >
              {range?.from ? format(range.from, 'LLL d, y') : 'Start date'}
            </Button>
          </div>
          <span className="text-muted-foreground pb-2">–</span>
          <div className="grid gap-1.5">
            <span className="text-muted-foreground text-xs">End</span>
            <Button
              variant="outline"
              icon={<CalendarIcon />}
              className={fieldClass(Boolean(range?.to))}
              onClick={() => setOpen(true)}
            >
              {range?.to ? format(range.to, 'LLL d, y') : 'End date'}
            </Button>
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-0" align="start" aria-label="Choose date range">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={FIXED_MONTH}
          selected={range}
          onSelect={(_next, day) => onDayClick(day)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

const meta = {
  title: 'UI/DatePicker',
  component: DatePicker,
  // Sem `autodocs`: a página de docs é a MDX customizada (date-picker.mdx).
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single-date picker composed from `Popover` + `Calendar` + `Button`. The trigger ' +
          'shows the formatted date (or a placeholder) and opens a calendar popover; picking a ' +
          'day closes it. Value and open state are each controlled or uncontrolled. Pass ' +
          '`name` to emit a hidden ISO input for form submission, and `calendarProps` to reach ' +
          'the inner `Calendar` (disabled dates, `defaultMonth`, caption layout, …).',
      },
    },
    // O calendário só aparece aberto: as demonstrações começam fechadas, então o
    // Chromatic só veria o trigger. A cobertura visual fica nas histórias
    // `Visual*` (matriz de triggers + calendário aberto via `defaultOpen`).
    chromatic: { disableSnapshot: true },
  },
  args: {
    placeholder: 'Pick a date',
    size: 'default',
    align: 'start',
    disabled: false,
    block: false,
    calendarProps: { defaultMonth: FIXED_MONTH },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Text shown on the trigger while no date is selected.',
      table: { defaultValue: { summary: 'Pick a date' } },
    },
    formatStr: {
      control: 'text',
      description: 'date-fns format string for the trigger label.',
      table: { defaultValue: { summary: 'PPP' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Trigger size.',
      table: { defaultValue: { summary: 'default' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Popover alignment relative to the trigger.',
      table: { defaultValue: { summary: 'start' } },
    },
    block: { control: 'boolean', description: 'Full-width trigger.' },
    disabled: { control: 'boolean', description: 'Disables the trigger.' },
    value: { control: false, description: 'Selected date (controlled).' },
    defaultValue: { control: false, description: 'Initial date (uncontrolled).' },
  },
} satisfies Meta<typeof DatePicker>

export default meta

type Story = StoryObj<typeof meta>

/** Fully interactive — tweak every prop from the **Controls** panel. */
export const Playground: Story = {}

export const Default: Story = {}

/** Starts with a date already selected (uncontrolled via `defaultValue`). */
export const WithValue: Story = {
  args: { defaultValue: FIXED_DAY },
}

/** The three trigger sizes. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <DatePicker key={size} size={size} defaultValue={FIXED_DAY} aria-label={size} />
      ))}
    </div>
  ),
}

/** Full-width trigger inside a constrained container. */
export const Block: Story = {
  render: () => (
    <div className="w-80">
      <DatePicker block defaultValue={FIXED_DAY} />
    </div>
  ),
}

/** A custom `formatStr` controls how the selected date is rendered. */
export const CustomFormat: Story = {
  args: { defaultValue: FIXED_DAY, formatStr: 'dd/MM/yyyy' },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: FIXED_DAY },
}

/** Controlled example: the date lives in the parent and reflects on a label. */
export const Controlled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(FIXED_DAY)
    return (
      <div className="flex flex-col items-start gap-2">
        <DatePicker
          value={date}
          onValueChange={setDate}
          calendarProps={{ defaultMonth: FIXED_MONTH }}
        />
        <span className="text-muted-foreground text-sm">
          {date ? date.toISOString().slice(0, 10) : 'Nenhuma data'}
        </span>
      </div>
    )
  },
}

/* --------------------------------------------------------------------------
 * Padrões de intervalo (range) — compostos, não props do DatePicker.
 * -------------------------------------------------------------------------- */

/**
 * Date range: a single trigger that opens a two-month range calendar. Built by
 * composing `Popover` + `Calendar` (`mode="range"`) — see `DateRangePicker`.
 */
export const Range: Story = {
  render: () => <DateRangePicker />,
}

/**
 * Date range, dual field: separate **Start** and **End** fields sharing one
 * range calendar — the classic check-in / check-out layout.
 */
export const RangeDualField: Story = {
  render: () => <DateRangeDualField />,
}

/* --------------------------------------------------------------------------
 * Interaction tests — play functions que SÃO os testes de regressão.
 * O calendário é portado para document.body: busque-o via `screen`, não `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the calendar; picking a day selects it and closes. */
export const OpensAndSelects: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /pick a date/i })

    await userEvent.click(trigger)
    // O calendário é renderizado em portal (fora do canvasElement).
    await expect(await screen.findByRole('grid')).toBeVisible()

    await userEvent.click(screen.getByText('15'))

    // Disparou com a data correta e fechou o popover.
    await expect(args.onValueChange).toHaveBeenCalledOnce()
    const picked = (args.onValueChange as ReturnType<typeof fn>).mock.calls[0][0] as Date
    await expect(picked.getDate()).toBe(15)
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())

    // O rótulo do gatilho passa a refletir a data escolhida.
    await expect(canvas.getByRole('button')).toHaveTextContent('15')
  },
}

/** Keyboard: the trigger is focusable and opens with Enter. */
export const OpensWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.tab()
    await expect(canvas.getByRole('button')).toHaveFocus()
    await userEvent.keyboard('{Enter}')

    await expect(await screen.findByRole('grid')).toBeVisible()
    // Fecha para a story não terminar com o portal aberto.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())
  },
}

/** A disabled trigger does not open the calendar. */
export const DisabledDoesNotOpen: Story = {
  args: { disabled: true, onOpenChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /pick a date/i })

    // pointer-events:none bloqueia o clique; forçamos para provar o no-op.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(trigger)

    await expect(args.onOpenChange).not.toHaveBeenCalled()
    await expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  },
}

/** Range: picking start then end fills the trigger and keeps the calendar open. */
export const RangeSelectsInterval: Story = {
  render: () => <DateRangePicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /pick a date range/i })
    await userEvent.click(trigger)

    // 2 meses → busca os dias pelo nome acessível (aria-label = data por extenso).
    await screen.findByRole('grid', { name: /June 2025/i })
    await userEvent.click(screen.getByRole('button', { name: /June 9th, 2025/i }))
    await userEvent.click(screen.getByRole('button', { name: /June 15th, 2025/i }))

    // Escolher uma data NÃO fecha o calendário.
    await expect(screen.getByRole('grid', { name: /June 2025/i })).toBeInTheDocument()
    // O gatilho reflete o intervalo ao vivo.
    await expect(trigger).toHaveTextContent('Jun 9')
    await expect(trigger).toHaveTextContent('Jun 15')

    // Fecha por Escape (não por seleção).
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())
  },
}

/**
 * Re-clicking on a complete range restarts the start; if the new start is below
 * the current end, the end is kept, and the next click then moves the end.
 */
export const RangeRestartKeepsEnd: Story = {
  render: () => <DateRangePicker />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /pick a date range/i })
    await userEvent.click(trigger)
    await screen.findByRole('grid', { name: /June 2025/i })

    // Monta um intervalo {9, 20}.
    await userEvent.click(screen.getByRole('button', { name: /June 9th, 2025/i }))
    await userEvent.click(screen.getByRole('button', { name: /June 20th, 2025/i }))
    await expect(trigger).toHaveTextContent('Jun 9')
    await expect(trigger).toHaveTextContent('Jun 20')

    // Clicar 15 (< 20) reinicia o início e mantém o fim → {15, 20}.
    await userEvent.click(screen.getByRole('button', { name: /June 15th, 2025/i }))
    await expect(trigger).toHaveTextContent('Jun 15')
    await expect(trigger).toHaveTextContent('Jun 20')

    // O clique seguinte troca o fim → {15, 25}.
    await userEvent.click(screen.getByRole('button', { name: /June 25th, 2025/i }))
    await expect(trigger).toHaveTextContent('Jun 15')
    await expect(trigger).toHaveTextContent('Jun 25')

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())
  },
}

/** Dual field: selecting a range fills both the Start and End fields. */
export const RangeDualFieldFillsBothFields: Story = {
  render: () => <DateRangeDualField />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Qualquer um dos campos abre o mesmo calendário compartilhado.
    await userEvent.click(canvas.getByRole('button', { name: /start date/i }))

    await screen.findByRole('grid', { name: /June 2025/i })
    await userEvent.click(screen.getByRole('button', { name: /June 9th, 2025/i }))
    await userEvent.click(screen.getByRole('button', { name: /June 15th, 2025/i }))

    // Ambos os campos refletem o intervalo, com o calendário ainda aberto.
    await expect(canvas.getByRole('button', { name: /Jun 9, 2025/i })).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: /Jun 15, 2025/i }),
    ).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Fixtures de regressão visual (Chromatic). Ocultas do sidebar/docs
 * (`!dev`/`!autodocs`), mas seguem rodando como smoke test (tag `test`) e
 * reativam o snapshot que o meta desliga.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Captura visual — triggers fechados: placeholder, com valor, tamanhos e desabilitado. */
export const VisualTriggers: Story = {
  ...visual,
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <DatePicker placeholder="Pick a date" />
      <DatePicker defaultValue={FIXED_DAY} />
      <div className="flex items-center gap-3">
        <DatePicker size="sm" defaultValue={FIXED_DAY} aria-label="sm" />
        <DatePicker size="default" defaultValue={FIXED_DAY} aria-label="default" />
        <DatePicker size="lg" defaultValue={FIXED_DAY} aria-label="lg" />
      </div>
      <DatePicker disabled defaultValue={FIXED_DAY} />
    </div>
  ),
}

/** Captura visual — calendário aberto (`defaultOpen`) com a data selecionada. */
export const VisualOpen: Story = {
  ...visual,
  render: () => (
    <div className="h-[420px]">
      <DatePicker
        defaultOpen
        defaultValue={FIXED_DAY}
        calendarProps={{ defaultMonth: FIXED_MONTH }}
      />
    </div>
  ),
}

/** Captura visual — range em campo único, calendário aberto com o intervalo. */
export const VisualRange: Story = {
  ...visual,
  render: () => (
    <div className="h-[420px]">
      <DateRangePicker defaultOpen initialRange={FIXED_RANGE} />
    </div>
  ),
}

/** Captura visual — range dual field (campos Start/End preenchidos). */
export const VisualRangeDualField: Story = {
  ...visual,
  render: () => <DateRangeDualField initialRange={FIXED_RANGE} />,
}
