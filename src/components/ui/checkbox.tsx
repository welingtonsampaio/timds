import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, MinusIcon } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type * as React from 'react'

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

export { Checkbox, checkboxVariants }
