import { cva, type VariantProps } from 'class-variance-authority'
import { Slider as SliderPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Filled track color (Range) by semantic variant.
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

// Track thickness by size (horizontal uses height; vertical, width).
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

// Marker (Thumb): border in the variant color and diameter by size.
// The Thumb is a <span>: the disabled state comes from Radix via `data-disabled`
// (not the `disabled` attribute), so we neutralize hover/focus through it —
// otherwise the ring would keep showing on the disabled slider.
const thumbVariants = cva(
  // Solid core in the variant color with a border in the background color, which
  // separates the dot from the filled bar (same color). The ring (halo) appears on
  // hover/focus and disappears in the disabled state.
  'block shrink-0 rounded-full border-2 border-background shadow-sm ring-ring/50 transition-[color,box-shadow] outline-hidden hover:ring-4 focus-visible:ring-4 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:hover:ring-0',
  {
    variants: {
      // Fill in the variant color: the dot matches the filled bar.
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
  // Normalize to index the cva (VariantProps allows null).
  const v = variant ?? 'default'
  const s = size ?? 'default'

  // Number of thumbs: derived from the controlled/initial array; without an array,
  // it assumes a range (min, max) with two markers.
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
          // biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional and have no identity of their own
          key={index}
          // The focusable element with role="slider" is the Thumb — that's where the
          // accessible name lives. We forward `aria-label`/`aria-labelledby` from the Root
          // to each Thumb (Radix does not propagate them on its own).
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn(thumbVariants({ variant: v, size: s }))}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { rangeVariants, Slider, thumbVariants }
