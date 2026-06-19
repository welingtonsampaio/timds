import { cva, type VariantProps } from 'class-variance-authority'
import { Progress as ProgressPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// Trilho (fundo): tom translúcido da matiz, altura definida por `size`.
const progressVariants = cva('relative w-full overflow-hidden rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary/20',
      success: 'bg-success/20',
      warning: 'bg-warning/20',
      info: 'bg-info/20',
      destructive: 'bg-destructive/20',
    },
    size: {
      sm: 'h-1.5',
      default: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

// Indicador (preenchimento): cor sólida da matiz; o avanço vem do translateX.
const indicatorVariants = cva('h-full w-full flex-1 transition-all', {
  variants: {
    variant: {
      default: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      info: 'bg-info',
      destructive: 'bg-destructive',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Progress({
  className,
  variant = 'default',
  size = 'default',
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants>) {
  // Normaliza para indexar o cva (VariantProps permite null).
  const v = variant ?? 'default'
  const s = size ?? 'default'

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={v}
      data-size={s}
      className={cn(progressVariants({ variant: v, size: s }), className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(indicatorVariants({ variant: v }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressVariants }
