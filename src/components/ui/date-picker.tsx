import { format as formatDateFns, type Locale } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// DatePicker — seleção de uma única data
// ---------------------------------------------------------------------------
// Composição de alto nível sobre `Popover` + `Calendar` (+ `Button` como
// gatilho). Cobre o caso comum de escolher uma data: o gatilho exibe a data
// formatada (ou o placeholder) e abre um calendário em popover. Para seleção de
// intervalo/múltiplas datas use o `Calendar` diretamente com `mode`.
//
// Valor e abertura são controlados ou não controlados (cada par tem `value`/
// `defaultValue` e `open`/`defaultOpen`). Ao selecionar uma data o popover
// fecha automaticamente. Quando `name` é informado, um input oculto carrega a
// data em ISO (yyyy-MM-dd) para submissão em formulários.

type CalendarPassThroughProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'disabled'
>

export interface DatePickerProps {
  /** Data selecionada (controlado). */
  value?: Date
  /** Data inicial (não controlado). */
  defaultValue?: Date
  /** Disparado ao selecionar/limpar a data. */
  onValueChange?: (date: Date | undefined) => void
  /** Abertura do popover (controlado). */
  open?: boolean
  /** Abertura inicial (não controlado). */
  defaultOpen?: boolean
  /** Disparado quando o popover abre/fecha. */
  onOpenChange?: (open: boolean) => void
  /** Texto exibido no gatilho enquanto não há data. */
  placeholder?: React.ReactNode
  /** Desabilita o gatilho. */
  disabled?: boolean
  /**
   * String de formatação do `date-fns` para o rótulo do gatilho.
   * @default 'PPP'
   */
  formatStr?: string
  /** Locale do `date-fns` aplicado à formatação do rótulo. */
  locale?: Locale
  /** Formatação custom da data (prevalece sobre `formatStr`/`locale`). */
  formatDate?: (date: Date) => string
  /** Tamanho do gatilho. */
  size?: 'sm' | 'default' | 'lg'
  /** Lado do popover em relação ao gatilho. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Alinhamento do popover em relação ao gatilho. */
  align?: 'start' | 'center' | 'end'
  /** Faz o gatilho ocupar toda a largura do contêiner. */
  block?: boolean
  /** Nome do campo: renderiza um input oculto (data em ISO) para formulários. */
  name?: string
  /** Id aplicado ao gatilho. */
  id?: string
  /** Classe aplicada ao gatilho. */
  className?: string
  /** Rótulo acessível do gatilho (quando não há `<label>` associado). */
  'aria-label'?: string
  /** Props extras repassadas ao `Calendar` interno. */
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
  // Valor: controlado quando `value` é fornecido; senão estado interno.
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue)
  const selected = isControlled ? value : internalValue

  // Abertura: controlada quando `open` é fornecido; senão estado interno.
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
    // Fecha o popover ao escolher uma data (não ao limpar a seleção).
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
        // O Popover.Content do Radix expõe role="dialog": precisa de nome
        // acessível. Reusa o `aria-label` do gatilho ou um rótulo neutro.
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
