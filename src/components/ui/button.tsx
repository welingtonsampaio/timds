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
  /** Ícone exibido junto ao conteúdo. Substituído pelo spinner em `loading`. */
  icon?: React.ReactNode
  /** Lado em que o ícone (ou o spinner) é renderizado. */
  iconPlacement?: 'left' | 'right'
  /** Exibe o spinner no lugar do ícone e desabilita o botão. */
  loading?: boolean
  /** Tipo nativo do `<button>`. Ignorado quando o botão vira link (`href`). */
  htmlType?: 'submit' | 'reset' | 'button'
  /** Renderiza o botão como link (`<a>`) apontando para esta URL. */
  href?: string
  /** Faz o botão ocupar toda a largura do contêiner. */
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
  // `href` (sem asChild) transforma o botão num link; asChild tem prioridade.
  const asLink = href !== undefined && !asChild
  const Comp: React.ElementType = asChild ? Slot : asLink ? 'a' : 'button'

  // Em loading o spinner ocupa a posição do ícone (substituindo-o se existir).
  const adornment = loading ? <Spinner /> : icon

  // Atributos específicos do elemento renderizado.
  let elementProps: Record<string, unknown> = {}
  if (Comp === 'a') {
    // Link desabilitado não navega, sai da ordem de tabulação e é anunciado.
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
