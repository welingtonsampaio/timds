import type * as React from 'react'

import { cn } from '@/lib/utils'

// Loading placeholder: a block with `animate-pulse` and rounded corners.
// The consumer sets the size via `className` (e.g.: `size-10`, `h-4 w-32`).
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  )
}

export { Skeleton }
