import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { ariaInvalid, focusRing } from '@/lib/styles'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent font-medium whitespace-nowrap transition-[color,box-shadow] [&>svg]:pointer-events-none',
    focusRing,
    ariaInvalid,
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',

        /* === Semantic (soft/tonal style) ===
           Light translucent background + hue-colored text. In light mode the
           text uses the token's dark foreground; in dark mode it flips to the
           light color. Passes AA comfortably in both themes, avoiding the weak
           contrast of the solid style. */
        success:
          'border-success/20 bg-success/15 text-success-foreground dark:text-success focus-visible:ring-success/40 [a&]:hover:bg-success/25',
        warning:
          'border-warning/20 bg-warning/15 text-warning-foreground dark:text-warning focus-visible:ring-warning/40 [a&]:hover:bg-warning/25',
        info: 'border-info/20 bg-info/15 text-info-foreground dark:text-info focus-visible:ring-info/40 [a&]:hover:bg-info/25',

        /* === Decorative (charts palette, soft/tonal style) ===
           For categorization/decoration. Neutral text ensures contrast across
           any hue; the identity comes from the tonal background and the colored
           icon. */
        'chart-1':
          'border-chart-1/20 bg-chart-1/15 text-foreground focus-visible:ring-chart-1/40 [&>svg]:text-chart-1 [a&]:hover:bg-chart-1/25',
        'chart-2':
          'border-chart-2/20 bg-chart-2/15 text-foreground focus-visible:ring-chart-2/40 [&>svg]:text-chart-2 [a&]:hover:bg-chart-2/25',
        'chart-3':
          'border-chart-3/20 bg-chart-3/15 text-foreground focus-visible:ring-chart-3/40 [&>svg]:text-chart-3 [a&]:hover:bg-chart-3/25',
        'chart-4':
          'border-chart-4/20 bg-chart-4/15 text-foreground focus-visible:ring-chart-4/40 [&>svg]:text-chart-4 [a&]:hover:bg-chart-4/25',
        'chart-5':
          'border-chart-5/20 bg-chart-5/15 text-foreground focus-visible:ring-chart-5/40 [&>svg]:text-chart-5 [a&]:hover:bg-chart-5/25',

        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary-text underline-offset-4 [a&]:hover:underline',
      },
      size: {
        sm: 'px-1.5 py-0 text-[0.625rem] [&>svg]:size-2.5',
        md: 'px-2 py-0.5 text-xs [&>svg]:size-3',
        lg: 'gap-1.5 px-2.5 py-1 text-sm [&>svg]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  size = 'md',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
