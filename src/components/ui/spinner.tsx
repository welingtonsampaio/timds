import { Loader2 } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// Loading indicator. By default uses lucide's Loader2 icon with
// `animate-spin`. Inherits the text color (`currentColor`) and the size from
// the context (e.g.: inside the Button), and can be adjusted via `className`.
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
