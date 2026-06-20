import { format as formatDateFns, type Locale } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// DatePicker — single date selection
// ---------------------------------------------------------------------------
// High-level composition over `Popover` + `Calendar` (+ `Button` as the
// trigger). Covers the common case of picking a date: the trigger shows the
// formatted date (or the placeholder) and opens a calendar in a popover. For
// range/multiple date selection use `Calendar` directly with `mode`.
//
// Value and open state are controlled or uncontrolled (each pair has `value`/
// `defaultValue` and `open`/`defaultOpen`). Selecting a date closes the popover
// automatically. When `name` is provided, a hidden input carries the date in
// ISO (yyyy-MM-dd) for form submission.

type CalendarPassThroughProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'disabled'
>

export interface DatePickerProps {
  /** Selected date (controlled). */
  value?: Date
  /** Initial date (uncontrolled). */
  defaultValue?: Date
  /** Fired when the date is selected/cleared. */
  onValueChange?: (date: Date | undefined) => void
  /** Popover open state (controlled). */
  open?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
  /** Fired when the popover opens/closes. */
  onOpenChange?: (open: boolean) => void
  /** Text shown in the trigger while there is no date. */
  placeholder?: React.ReactNode
  /** Disables the trigger. */
  disabled?: boolean
  /**
   * `date-fns` format string for the trigger label.
   * @default 'PPP'
   */
  formatStr?: string
  /** `date-fns` locale applied to the label formatting. */
  locale?: Locale
  /** Custom date formatting (takes precedence over `formatStr`/`locale`). */
  formatDate?: (date: Date) => string
  /** Trigger size. */
  size?: 'sm' | 'default' | 'lg'
  /** Popover side relative to the trigger. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Popover alignment relative to the trigger. */
  align?: 'start' | 'center' | 'end'
  /** Makes the trigger span the full width of the container. */
  block?: boolean
  /** Field name: renders a hidden input (ISO date) for forms. */
  name?: string
  /** Id applied to the trigger. */
  id?: string
  /** Class applied to the trigger. */
  className?: string
  /** Accessible label for the trigger (when there is no associated `<label>`). */
  'aria-label'?: string
  /** Extra props forwarded to the internal `Calendar`. */
  calendarProps?: CalendarPassThroughProps
}

function DatePicker({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  placeholder = 'Pick a date',
  disabled = false,
  formatStr = 'PPP',
  locale,
  formatDate,
  size = 'default',
  side,
  align = 'start',
  block = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  calendarProps,
}: DatePickerProps) {
  // Value: controlled when `value` is provided; otherwise internal state.
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue)
  const selected = isControlled ? value : internalValue

  // Open state: controlled when `open` is provided; otherwise internal state.
  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const isOpen = isOpenControlled ? open : internalOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange],
  )

  const handleSelect = (date: Date | undefined) => {
    if (!isControlled) setInternalValue(date)
    onValueChange?.(date)
    // Close the popover when a date is picked (not when clearing the selection).
    if (date) setOpen(false)
  }

  const label = selected
    ? formatDate
      ? formatDate(selected)
      : formatDateFns(selected, formatStr, locale ? { locale } : undefined)
    : placeholder

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          data-slot="date-picker"
          data-empty={selected ? undefined : ''}
          variant="outline"
          size={size}
          block={block}
          disabled={disabled}
          aria-label={ariaLabel}
          icon={<CalendarIcon />}
          className={cn(
            'justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align={align}
        side={side}
        // Radix's Popover.Content exposes role="dialog": it needs an accessible
        // name. Reuses the trigger's `aria-label` or a neutral label.
        aria-label={ariaLabel ?? 'Choose date'}
        data-slot="date-picker-content"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          autoFocus
          {...calendarProps}
        />
      </PopoverContent>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={selected ? formatDateFns(selected, 'yyyy-MM-dd') : ''}
        />
      ) : null}
    </Popover>
  )
}

export { DatePicker }
