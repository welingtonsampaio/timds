import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { Separator } from '@/components/ui/separator'
import { svgIcon } from '@/lib/styles'
import { cn } from '@/lib/utils'

const buttonGroupVariants = cva(
  // Joins the children into a continuous block: resets inner borders/corners and
  // raises the focused item (z-index) so the focus ring isn't clipped by neighbors.
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
    // It's a button bar, not a field group: `role="group"` on a div is the
    // appropriate semantics here (a <fieldset> would bring form semantics).
    // biome-ignore lint/a11y/useSemanticElements: see above
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

// Static label/segment inside the group (e.g. input prefix or label).
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

// Divider between group items; uses the `input` color to match the borders.
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
