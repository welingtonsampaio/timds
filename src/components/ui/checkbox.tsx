import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, MinusIcon } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  'group peer shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      // Cor de preenchimento quando marcado (checked/indeterminate).
      variant: {
        default:
          'text-primary-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary dark:data-[state=checked]:bg-primary',
        success:
          'text-success-foreground data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=indeterminate]:border-success data-[state=indeterminate]:bg-success focus-visible:ring-success/40 dark:data-[state=checked]:bg-success',
        destructive:
          'text-white data-[state=checked]:border-destructive data-[state=checked]:bg-destructive data-[state=indeterminate]:border-destructive data-[state=indeterminate]:bg-destructive focus-visible:ring-destructive/40 dark:data-[state=checked]:bg-destructive',
      },
      // Lado da caixa por tamanho (o ícone interno acompanha via iconSizeClass).
      size: {
        sm: 'size-3.5',
        default: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// Tamanho do ícone (check/minus) por size da caixa.
const iconSizeClass: Record<NonNullable<CheckboxProps['size']>, string> = {
  sm: 'size-3',
  default: 'size-3.5',
  lg: 'size-4',
}

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

function Checkbox({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: CheckboxProps) {
  // Normaliza para indexar o mapa de ícone (VariantProps permite null).
  const s = size ?? 'default'

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-variant={variant ?? 'default'}
      data-size={s}
      className={cn(checkboxVariants({ variant, size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        {/* Radix monta o Indicator em checked e indeterminate; trocamos o ícone
            conforme o estado do grupo (Root tem a classe `group`). */}
        <CheckIcon
          className={cn(iconSizeClass[s], 'group-data-[state=indeterminate]:hidden')}
        />
        <MinusIcon
          className={cn(
            iconSizeClass[s],
            'hidden group-data-[state=indeterminate]:block',
          )}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

// ----------------------------------------------------------------------------
// CheckboxGroup
//
// O Radix não tem um primitivo de grupo: o padrão é gerenciar o conjunto de
// valores marcados (array de strings) via Context. O `CheckboxGroup` controla o
// estado (controlado por `value` ou não-controlado por `defaultValue`) e
// propaga `variant`/`size`/`disabled` para os itens; cada `CheckboxGroupItem`
// se liga ao grupo pelo seu `value`.
// ----------------------------------------------------------------------------

interface CheckboxGroupContextValue {
  value: string[]
  toggle: (itemValue: string, checked: boolean) => void
  name?: string
  disabled?: boolean
  variant?: CheckboxProps['variant']
  size?: CheckboxProps['size']
}

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null)

function useCheckboxGroup() {
  const ctx = React.useContext(CheckboxGroupContext)
  if (!ctx) {
    throw new Error('CheckboxGroupItem deve ser usado dentro de um CheckboxGroup.')
  }
  return ctx
}

export interface CheckboxGroupProps
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'>,
    Pick<CheckboxProps, 'variant' | 'size'> {
  /** Valores marcados (modo controlado). */
  value?: string[]
  /** Valores marcados iniciais (modo não-controlado). */
  defaultValue?: string[]
  /** Disparado a cada mudança no conjunto de valores marcados. */
  onValueChange?: (value: string[]) => void
  /** `name` aplicado aos inputs ocultos de cada item (envio em formulários). */
  name?: string
  /** Desabilita todos os itens do grupo. */
  disabled?: boolean
  /** Direção de empilhamento dos itens. */
  orientation?: 'horizontal' | 'vertical'
}

function CheckboxGroup({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  disabled,
  variant,
  size,
  orientation = 'vertical',
  ...props
}: CheckboxGroupProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? [])
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const toggle = React.useCallback(
    (itemValue: string, checked: boolean) => {
      const set = new Set(value)
      if (checked) set.add(itemValue)
      else set.delete(itemValue)
      const next = Array.from(set)
      if (!isControlled) setUncontrolled(next)
      onValueChange?.(next)
    },
    [isControlled, value, onValueChange],
  )

  const ctx = React.useMemo<CheckboxGroupContextValue>(
    () => ({ value, toggle, name, disabled, variant, size }),
    [value, toggle, name, disabled, variant, size],
  )

  return (
    <CheckboxGroupContext.Provider value={ctx}>
      {/* role="group" é o semântico adequado para um conjunto de checkboxes
          relacionados; o consumidor deve associar um rótulo via aria-labelledby. */}
      {/** biome-ignore lint/a11y/useSemanticElements: ver acima */}
      <div
        role="group"
        data-slot="checkbox-group"
        data-orientation={orientation}
        className={cn(
          'flex gap-3 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap',
          className,
        )}
        {...props}
      />
    </CheckboxGroupContext.Provider>
  )
}

export interface CheckboxGroupItemProps
  extends Omit<CheckboxProps, 'checked' | 'defaultChecked' | 'value'> {
  /** Identifica este item no conjunto de valores do grupo. */
  value: string
}

function CheckboxGroupItem({
  value,
  variant,
  size,
  disabled,
  onCheckedChange,
  ...props
}: CheckboxGroupItemProps) {
  const group = useCheckboxGroup()

  return (
    <Checkbox
      checked={group.value.includes(value)}
      onCheckedChange={(state) => {
        group.toggle(value, state === true)
        onCheckedChange?.(state)
      }}
      // Props locais têm prioridade sobre as herdadas do grupo.
      variant={variant ?? group.variant}
      size={size ?? group.size}
      disabled={disabled ?? group.disabled}
      name={group.name}
      value={value}
      {...props}
    />
  )
}

export { Checkbox, CheckboxGroup, CheckboxGroupItem, checkboxVariants }
