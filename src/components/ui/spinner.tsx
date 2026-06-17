import { Loader2 } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'

// Indicador de carregamento. Por padrão usa o ícone Loader2 do lucide com
// `animate-spin`. Herda a cor do texto (`currentColor`) e o tamanho do
// contexto (ex.: dentro do Button), podendo ser ajustado via `className`.
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2
      data-slot="spinner"
      role="status"
      aria-label="Carregando"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
