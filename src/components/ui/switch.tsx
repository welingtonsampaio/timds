import { cva, type VariantProps } from 'class-variance-authority'
import { Switch as SwitchPrimitive } from 'radix-ui'
import type * as React from 'react'

import { disabledControl, focusRing } from '@/lib/styles'
import { cn } from '@/lib/utils'

const switchVariants = cva(
  [
    // Uniform 2px padding (p-0.5) defines the thumb inset on all sides.
    'peer group/switch inline-flex shrink-0 items-center overflow-hidden rounded-full p-0.5 align-middle shadow-xs transition-colors outline-none',
    focusRing,
    disabledControl,
  ],
  {
    variants: {
      // Track color scheme (color when on / off).
      variant: {
        default:
          'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        green_red:
          'data-[state=checked]:bg-success data-[state=unchecked]:bg-destructive',
        success:
          'data-[state=checked]:bg-success data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        destructive:
          'data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
      },
      // Track height per size (= thumb + 2x the 2px padding).
      size: {
        sm: 'h-4',
        default: 'h-5',
        lg: 'h-6',
      },
      // With text, the track has automatic width (stable: see switch-text).
      withText: {
        true: 'w-auto gap-0.5',
        false: '',
      },
    },
    compoundVariants: [
      // Without text: width = 2x the thumb + padding, so the slide lands exactly.
      { withText: false, size: 'sm', class: 'w-7' },
      { withText: false, size: 'default', class: 'w-9' },
      { withText: false, size: 'lg', class: 'w-11' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      withText: false,
    },
  },
)

const thumbVariants = cva(
  'pointer-events-none block shrink-0 rounded-full bg-background shadow-sm ring-0 transition-transform dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
  {
    variants: {
      size: {
        sm: 'size-3',
        default: 'size-4',
        lg: 'size-5',
      },
      withText: {
        // With text, the thumb switches sides via `order` (no translate slide).
        true: 'data-[state=checked]:order-2 data-[state=unchecked]:order-1',
        // Without text: inner area = 2x the thumb, so translate-x-full lands exactly.
        false:
          'data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: { size: 'default', withText: false },
  },
)

// Inner text size per switch size — subtle, just a detail.
const textSizeClass: Record<NonNullable<SwitchProps['size']>, string> = {
  sm: 'text-[8px]',
  default: 'text-[9px]',
  lg: 'text-[10px]',
}

// Color of the text shown when on (over the track in the checked state).
const onTextColor: Record<NonNullable<SwitchProps['variant']>, string> = {
  default: 'text-primary-foreground',
  green_red: 'text-success-foreground',
  success: 'text-success-foreground',
  destructive: 'text-destructive-foreground',
}

// Color of the text shown when off (over the track in the unchecked state).
// Over light backgrounds we use a soft tone; in green_red the background is red.
const offTextColor: Record<NonNullable<SwitchProps['variant']>, string> = {
  default: 'text-foreground/70',
  green_red: 'text-destructive-foreground',
  success: 'text-foreground/70',
  destructive: 'text-foreground/70',
}

export interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    Omit<VariantProps<typeof switchVariants>, 'withText'> {
  /**
   * Optional labels shown inside the track. When present, the switch
   * becomes a toggle with text: the label appears on the side opposite the
   * thumb, alternating with the state. They are decorative (`aria-hidden`) —
   * provide an `aria-label`/`<Label>` for accessibility.
   */
  texts?: { on: React.ReactNode; off: React.ReactNode }
}

function Switch({
  className,
  variant = 'default',
  size = 'default',
  texts,
  ...props
}: SwitchProps) {
  const withText = Boolean(texts)
  // Normalize to index the maps and cva (VariantProps allows null).
  const v = variant ?? 'default'
  const s = size ?? 'default'

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-variant={v}
      data-size={s}
      className={cn(switchVariants({ variant: v, size: s, withText }), className)}
      {...props}
    >
      {withText && (
        // Both labels are stacked in the SAME grid cell: both always take up
        // space, so the width is that of the larger one and does not change when
        // toggling (avoids the width "jump"). Only the opacity changes (cross-fade).
        // The block goes to the side opposite the thumb via `order`.
        <span
          aria-hidden="true"
          data-slot="switch-text"
          className={cn(
            'grid place-items-center px-0.5 leading-none font-medium whitespace-nowrap select-none group-data-[state=checked]/switch:order-1 group-data-[state=unchecked]/switch:order-2',
            textSizeClass[s],
          )}
        >
          <span
            className={cn(
              'col-start-1 row-start-1 transition-opacity group-data-[state=unchecked]/switch:opacity-0',
              onTextColor[v],
            )}
          >
            {texts?.on}
          </span>
          <span
            className={cn(
              'col-start-1 row-start-1 transition-opacity group-data-[state=checked]/switch:opacity-0',
              offTextColor[v],
            )}
          >
            {texts?.off}
          </span>
        </span>
      )}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(thumbVariants({ size: s, withText }))}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
