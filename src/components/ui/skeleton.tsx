import type * as React from 'react'

import { cn } from '@/lib/utils'

// Placeholder de carregamento: bloco com `animate-pulse` e cantos arredondados.
// O consumidor define o tamanho via `className` (ex.: `size-10`, `h-4 w-32`).
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
