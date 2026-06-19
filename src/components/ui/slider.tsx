import { cva, type VariantProps } from 'class-variance-authority'
import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Cor do trilho preenchido (Range) por variante semântica.
const rangeVariants = cva(
  'absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-success',
        destructive: 'bg-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

// Espessura do trilho por tamanho (horizontal usa altura; vertical, largura).
const trackVariants = cva('relative grow overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      sm: 'data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1',
      default: 'data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5',
      lg: 'data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2',
    },
  },
  defaultVariants: { size: 'default' },
})

// Marcador (Thumb): borda na cor da variante e diâmetro pelo tamanho.
// O Thumb é um <span>: o estado desabilitado vem do Radix via `data-disabled`
// (não do atributo `disabled`), então neutralizamos hover/foco por aí — caso
// contrário o anel continuaria aparecendo no slider desabilitado.
const thumbVariants = cva(
  // Miolo sólido na cor da variante com uma borda na cor do fundo, que separa
  // a bolinha da barra preenchida (mesma cor). O anel (halo) aparece no
  // hover/foco e some no estado desabilitado.
  'block shrink-0 rounded-full border-2 border-background shadow-sm ring-ring/50 transition-[color,box-shadow] outline-hidden hover:ring-4 focus-visible:ring-4 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:hover:ring-0',
  {
    variants: {
      // Preenchimento na cor da variante: a bolinha acompanha a barra preenchida.
      variant: {
        default: 'bg-primary',
        success: 'bg-success',
        destructive: 'bg-destructive',
      },
      size: {
        sm: 'size-3',
        default: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root>,
    VariantProps<typeof thumbVariants> {}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  variant = 'default',
  size = 'default',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: SliderProps) {
  // Normaliza para indexar o cva (VariantProps permite null).
  const v = variant ?? 'default'
  const s = size ?? 'default'

  // Quantidade de thumbs: deriva do array controlado/inicial; sem array,
  // assume um intervalo (min, max) com dois marcadores.
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-variant={v}
      data-size={s}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(trackVariants({ size: s }))}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(rangeVariants({ variant: v }))}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          // biome-ignore lint/suspicious/noArrayIndexKey: thumbs são posicionais e sem identidade própria
          key={index}
          // O elemento focável com role="slider" é o Thumb — é nele que mora o
          // nome acessível. Encaminhamos `aria-label`/`aria-labelledby` do Root
          // para cada Thumb (o Radix não os propaga sozinho).
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn(thumbVariants({ variant: v, size: s }))}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { rangeVariants, Slider, thumbVariants }
