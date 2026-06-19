import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { Separator } from '@/components/ui/separator'
import { svgIcon } from '@/lib/styles'
import { cn } from '@/lib/utils'

const buttonGroupVariants = cva(
  // Une os filhos num bloco contínuo: zera bordas/cantos internos e eleva o
  // item focado (z-index) para o anel de foco não ficar cortado pelos vizinhos.
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

function ButtonGroup({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    // É uma barra de botões, não um grupo de campos: `role="group"` num div é o
    // semântico adequado aqui (um <fieldset> traria semântica de formulário).
    // biome-ignore lint/a11y/useSemanticElements: ver acima
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

// Rótulo/segmento estático dentro do grupo (ex.: prefixo de input ou label).
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      data-slot="button-group-text"
      className={cn(
        'flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium shadow-xs',
        svgIcon,
        className,
      )}
      {...props}
    />
  )
}

// Divisor entre itens do grupo; usa a cor `input` para combinar com as bordas.
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'relative m-0! self-stretch bg-input data-[orientation=vertical]:h-auto',
        className,
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
