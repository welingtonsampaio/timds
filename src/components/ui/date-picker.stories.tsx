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

// Fixed month/day to make render and tests deterministic (without depending on
// the current date). June/2025 always shows days 1..30 of the month.
const FIXED_MONTH = new Date(2025, 5, 1)
const FIXED_DAY = new Date(2025, 5, 15)
const FIXED_RANGE: DateRange = {
  from: new Date(2025, 5, 9),
  to: new Date(2025, 5, 15),
}

// ---------------------------------------------------------------------------
// Range patterns — composed from the public primitives
// ---------------------------------------------------------------------------
// `DatePicker` is single-date by design. For ranges, compose `Popover`
// + `Calendar` (mode="range") + `Button`, exactly like `DatePicker` does
// internally. These two helpers serve as copyable references and are the basis
// of the range stories/regressions.

/** Formats a `DateRange` for the trigger label. */
function formatRange(range?: DateRange) {
  if (!range?.from) return null
  if (!range.to) return format(range.from, 'LLL d, y')
  return `${format(range.from, 'LLL d')} – ${format(range.to, 'LLL d, y')}`
}

// Range selection controlled manually from the clicked day (rdp delivers that
// day in the 2nd argument of `onSelect`). Required rules:
//   • picking a date does NOT close the calendar;
//   • with a complete range, the click restarts the `startDate`. If the new
//     start is before the current `endDate`, the `endDate` is kept; only then
//     does the next click swap the `endDate`. If the new start is ≥ `endDate`,
//     the range starts over from scratch.
// A 'start' | 'end' phase models "which end the next click sets".
type RangePhase = 'start' | 'end'

function nextRangeState(
  range: DateRange | undefined,
  phase: RangePhase,
  day: Date,
): { range: DateRange; phase: RangePhase } {
  if (phase === 'start') {
    // The click becomes the new start; keeps the current end if it stays after.
    if (range?.to && day.getTime() < range.to.getTime()) {
      return { range: { from: day, to: range.to }, phase: 'end' }
    }
    return { range: { from: day, to: undefined }, phase: 'end' }
  }
  // phase 'end': the click sets the end (if ≥ start); otherwise restarts the start.
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

/** Range in a single trigger: opens a 2-month calendar in a popover. */
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
          // Uses the clicked day (2nd arg) and applies the custom rule; does not close.
          onSelect={(_next, day) => onDayClick(day)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

/** Range in two fields (start/end) that share the same calendar. */
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
  title: 'Data Entry/DatePicker',
  component: DatePicker,
  // No `autodocs`: the docs page is the custom MDX (date-picker.mdx).
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
    // The calendar only appears when open: the demos start closed, so Chromatic
    // would only see the trigger. Visual coverage lives in the `Visual*` stories
    // (matrix of triggers + open calendar via `defaultOpen`).
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
          {date ? date.toISOString().slice(0, 10) : 'No date'}
        </span>
      </div>
    )
  },
}

/* --------------------------------------------------------------------------
 * Range patterns — composed, not DatePicker props.
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
 * Interaction tests — play functions that ARE the regression tests.
 * The calendar is portaled to document.body: query it via `screen`, not `canvas`.
 * -------------------------------------------------------------------------- */

/** Clicking the trigger opens the calendar; picking a day selects it and closes. */
export const OpensAndSelects: Story = {
  args: { onValueChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: /pick a date/i })

    await userEvent.click(trigger)
    // The calendar is rendered in a portal (outside the canvasElement).
    await expect(await screen.findByRole('grid')).toBeVisible()

    await userEvent.click(screen.getByText('15'))

    // Fired with the correct date and closed the popover.
    await expect(args.onValueChange).toHaveBeenCalledOnce()
    const picked = (args.onValueChange as ReturnType<typeof fn>).mock.calls[0][0] as Date
    await expect(picked.getDate()).toBe(15)
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())

    // The trigger label now reflects the chosen date.
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
    // Close so the story does not end with the portal open.
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

    // pointer-events:none blocks the click; we force it to prove the no-op.
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

    // 2 months → find the days by accessible name (aria-label = full date).
    await screen.findByRole('grid', { name: /June 2025/i })
    await userEvent.click(screen.getByRole('button', { name: /June 9th, 2025/i }))
    await userEvent.click(screen.getByRole('button', { name: /June 15th, 2025/i }))

    // Picking a date does NOT close the calendar.
    await expect(screen.getByRole('grid', { name: /June 2025/i })).toBeInTheDocument()
    // The trigger reflects the range live.
    await expect(trigger).toHaveTextContent('Jun 9')
    await expect(trigger).toHaveTextContent('Jun 15')

    // Closes via Escape (not via selection).
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

    // Builds a range {9, 20}.
    await userEvent.click(screen.getByRole('button', { name: /June 9th, 2025/i }))
    await userEvent.click(screen.getByRole('button', { name: /June 20th, 2025/i }))
    await expect(trigger).toHaveTextContent('Jun 9')
    await expect(trigger).toHaveTextContent('Jun 20')

    // Clicking 15 (< 20) restarts the start and keeps the end → {15, 20}.
    await userEvent.click(screen.getByRole('button', { name: /June 15th, 2025/i }))
    await expect(trigger).toHaveTextContent('Jun 15')
    await expect(trigger).toHaveTextContent('Jun 20')

    // The next click swaps the end → {15, 25}.
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
    // Either field opens the same shared calendar.
    await userEvent.click(canvas.getByRole('button', { name: /start date/i }))

    await screen.findByRole('grid', { name: /June 2025/i })
    await userEvent.click(screen.getByRole('button', { name: /June 9th, 2025/i }))
    await userEvent.click(screen.getByRole('button', { name: /June 15th, 2025/i }))

    // Both fields reflect the range, with the calendar still open.
    await expect(canvas.getByRole('button', { name: /Jun 9, 2025/i })).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: /Jun 15, 2025/i }),
    ).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument())
  },
}

/* --------------------------------------------------------------------------
 * Visual regression fixtures (Chromatic). Hidden from the sidebar/docs
 * (`!dev`/`!autodocs`), but keep running as a smoke test (tag `test`) and
 * re-enable the snapshot that the meta turns off.
 * -------------------------------------------------------------------------- */
const visual = {
  tags: ['!dev', '!autodocs'],
  parameters: { chromatic: { disableSnapshot: false } },
} satisfies Partial<Story>

/** Visual capture — closed triggers: placeholder, with value, sizes and disabled. */
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

/** Visual capture — open calendar (`defaultOpen`) with the selected date. */
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

/** Visual capture — single-field range, open calendar with the range. */
export const VisualRange: Story = {
  ...visual,
  render: () => (
    <div className="h-[420px]">
      <DateRangePicker defaultOpen initialRange={FIXED_RANGE} />
    </div>
  ),
}

/** Visual capture — dual-field range (Start/End fields filled). */
export const VisualRangeDualField: Story = {
  ...visual,
  render: () => <DateRangeDualField initialRange={FIXED_RANGE} />,
}
