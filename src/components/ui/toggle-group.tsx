import type { VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import * as React from 'react'

import { toggleVariants } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

// Context: the group propagates `variant`/`size`/`spacing` to each item, keeping
// a consistent appearance without repeating the props on every `ToggleGroupItem`.
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }
>({
  variant: 'default',
  size: 'default',
  spacing: 0,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /** Space (in theme units) between the items. `0` joins them into a single block. */
    spacing?: number
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        // When `spacing=0` the items become a single block; in `outline` the shadow
        // stays on the group (the items lose their own) to avoid duplicating the border.
        'group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=0]:data-[variant=outline]:shadow-xs',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10',
        // Joined items (`spacing=0`): square corners, only the ends round off and
        // the inner `outline` borders collapse so they don't end up doubled.
        'data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
