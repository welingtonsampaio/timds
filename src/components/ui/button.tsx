import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { Spinner } from '@/components/ui/spinner'
import { ariaInvalid, focusRing, svgIcon } from '@/lib/styles'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 shrink-0 outline-none active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
    focusRing,
    ariaInvalid,
    svgIcon,
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary-text underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
      shape: {
        default: '',
        rounded: 'rounded-full',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
      block: false,
    },
  },
)

export interface ButtonProps
  extends Omit<React.ComponentProps<'button'>, 'type'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Icon displayed alongside the content. Replaced by the spinner when `loading`. */
  icon?: React.ReactNode
  /** Side on which the icon (or the spinner) is rendered. */
  iconPlacement?: 'left' | 'right'
  /** Shows the spinner in place of the icon and disables the button. */
  loading?: boolean
  /** Native `<button>` type. Ignored when the button becomes a link (`href`). */
  htmlType?: 'submit' | 'reset' | 'button'
  /** Renders the button as a link (`<a>`) pointing to this URL. */
  href?: string
  /** Makes the button take the full width of the container. */
  block?: boolean
}

function Button({
  className,
  variant,
  size,
  shape,
  block = false,
  asChild = false,
  icon,
  iconPlacement = 'left',
  loading = false,
  htmlType = 'button',
  href,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  // `href` (without asChild) turns the button into a link; asChild takes priority.
  const asLink = href !== undefined && !asChild
  const Comp: React.ElementType = asChild ? Slot : asLink ? 'a' : 'button'

  // When loading, the spinner takes the icon's position (replacing it if present).
  const adornment = loading ? <Spinner /> : icon

  // Attributes specific to the rendered element.
  let elementProps: Record<string, unknown> = {}
  if (Comp === 'a') {
    // A disabled link does not navigate, leaves the tab order, and is announced.
    elementProps = {
      href: isDisabled ? undefined : href,
      'aria-disabled': isDisabled || undefined,
      tabIndex: isDisabled ? -1 : undefined,
    }
  } else if (Comp === 'button') {
    elementProps = { type: htmlType, disabled: isDisabled }
  }

  return (
    <Comp
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, shape, block, className }))}
      {...elementProps}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {iconPlacement === 'left' && adornment}
          {children}
          {iconPlacement === 'right' && adornment}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
