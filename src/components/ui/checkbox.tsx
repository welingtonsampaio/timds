import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, MinusIcon } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import * as React from 'react'

import { ariaInvalid, disabledControl, focusRing } from '@/lib/styles'
import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  [
    'group peer shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none dark:bg-input/30',
    focusRing,
    ariaInvalid,
    disabledControl,
  ],
  {
    variants: {
      // Fill color when checked (checked/indeterminate).
      variant: {
        default:
          'text-primary-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary dark:data-[state=checked]:bg-primary',
        success:
          'text-success-foreground data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=indeterminate]:border-success data-[state=indeterminate]:bg-success focus-visible:ring-success/40 dark:data-[state=checked]:bg-success',
        destructive:
          'text-white data-[state=checked]:border-destructive data-[state=checked]:bg-destructive data-[state=indeterminate]:border-destructive data-[state=indeterminate]:bg-destructive focus-visible:ring-destructive/40 dark:data-[state=checked]:bg-destructive',
      },
      // Box side length per size (the inner icon follows via iconSizeClass).
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

// Icon size (check/minus) per box size.
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
  // Normalize to index the icon map (VariantProps allows null).
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
        {/* Radix mounts the Indicator on checked and indeterminate; we swap the
            icon according to the group state (Root has the `group` class). */}
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
// Radix has no group primitive: the pattern is to manage the set of checked
// values (array of strings) via Context. `CheckboxGroup` controls the state
// (controlled via `value` or uncontrolled via `defaultValue`) and propagates
// `variant`/`size`/`disabled` to the items; each `CheckboxGroupItem` binds to
// the group through its `value`.
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
    throw new Error('CheckboxGroupItem must be used within a CheckboxGroup.')
  }
  return ctx
}

export interface CheckboxGroupProps
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'>,
    Pick<CheckboxProps, 'variant' | 'size'> {
  /** Checked values (controlled mode). */
  value?: string[]
  /** Initial checked values (uncontrolled mode). */
  defaultValue?: string[]
  /** Fired on every change to the set of checked values. */
  onValueChange?: (value: string[]) => void
  /** `name` applied to each item's hidden inputs (form submission). */
  name?: string
  /** Disables all items in the group. */
  disabled?: boolean
  /** Stacking direction of the items. */
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
      {/* role="group" is the proper semantics for a set of related checkboxes;
          the consumer should associate a label via aria-labelledby. */}
      {/** biome-ignore lint/a11y/useSemanticElements: see above */}
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
  /** Identifies this item within the group's set of values. */
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
      // Local props take priority over those inherited from the group.
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
