import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import type * as React from 'react'

import { focusRing, svgIcon } from '@/lib/styles'
import { cn } from '@/lib/utils'

/** Position of the tab bar relative to the content. */
type TabPlacement = 'top' | 'bottom' | 'start' | 'end'

function Tabs({
  className,
  tabPlacement = 'top',
  orientation,
  ...props
}: Omit<React.ComponentProps<typeof TabsPrimitive.Root>, 'orientation'> & {
  tabPlacement?: TabPlacement
  orientation?: 'horizontal' | 'vertical'
}) {
  // `start`/`end` place the tabs alongside the content (vertical orientation).
  const resolvedOrientation =
    orientation ??
    (tabPlacement === 'start' || tabPlacement === 'end' ? 'vertical' : 'horizontal')

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={resolvedOrientation}
      data-placement={tabPlacement}
      orientation={resolvedOrientation}
      className={cn(
        'group/tabs flex gap-2 data-[placement=bottom]:flex-col-reverse data-[placement=end]:flex-row-reverse data-[placement=start]:flex-row data-[placement=top]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  // Common base: the tab list bar.
  'group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:flex-col',
  {
    variants: {
      variant: {
        // Default segmented control ("muted" background, raised active item).
        default: 'gap-1 rounded-lg bg-muted p-1',
        // Inline tabs with a bottom indicator.
        line: 'gap-1 rounded-none bg-transparent',
        // Pill: rounded white bar with a shadow and a highlighted active item.
        // In vertical mode it uses a fixed radius so it doesn't turn into a circle.
        pill: 'gap-1 rounded-full border border-border bg-card p-1.5 shadow-sm group-data-[orientation=vertical]/tabs:rounded-3xl',
        // Card: folder-style tabs, connected to the content by a line.
        card: 'gap-1 rounded-none border-border bg-transparent group-data-[orientation=horizontal]/tabs:border-b group-data-[orientation=vertical]/tabs:border-r',
      },
      // The size only sets the `data-size` attribute; vertical spacing and
      // typography are applied to the triggers via `group-data`.
      size: {
        sm: '',
        default: '',
        lg: '',
      },
      // Centers the bar, taking up all available width.
      centered: {
        true: 'w-full justify-center',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      centered: false,
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  size = 'default',
  centered = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      data-centered={centered}
      className={cn(tabsListVariants({ variant, size, centered }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  children,
  closable = false,
  closeIcon,
  onClose,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  /** Shows a close button (x) on the tab. */
  closable?: boolean
  /** Custom icon for the close button. */
  closeIcon?: React.ReactNode
  /** Fired when the tab is closed (clicking the x or Delete/Backspace). */
  onClose?: (event: React.SyntheticEvent) => void
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      onKeyDown={(event) => {
        onKeyDown?.(event)
        // WAI-ARIA pattern: the focused tab is closed with Delete/Backspace.
        if (closable && (event.key === 'Delete' || event.key === 'Backspace')) {
          event.preventDefault()
          onClose?.(event)
        }
      }}
      className={cn(
        // Common base for all variants.
        'relative inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap font-medium text-foreground/60 transition-all group-data-[centered=true]/tabs-list:flex-none group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground',
        focusRing,
        svgIcon,
        // Size: vertical padding and typography.
        'group-data-[size=sm]/tabs-list:py-1 group-data-[size=sm]/tabs-list:text-xs group-data-[size=default]/tabs-list:py-1.5 group-data-[size=default]/tabs-list:text-sm group-data-[size=lg]/tabs-list:py-2.5 group-data-[size=lg]/tabs-list:text-base',
        // Default variant: inner capsule with a slight elevation on the active item.
        'group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-input/30 dark:group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground',
        // Pill variant: generous horizontal padding and active item in the primary color.
        'group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:px-6 group-data-[variant=pill]/tabs-list:data-[state=active]:bg-primary group-data-[variant=pill]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=pill]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=pill]/tabs-list:data-[state=active]:hover:text-primary-foreground',
        // Card variant: folder-style tab connected to the content.
        'group-data-[variant=card]/tabs-list:rounded-t-md group-data-[variant=card]/tabs-list:border group-data-[variant=card]/tabs-list:border-border group-data-[variant=card]/tabs-list:bg-muted/40 group-data-[variant=card]/tabs-list:px-4 group-data-[variant=card]/tabs-list:data-[state=active]:bg-background group-data-[variant=card]/tabs-list:data-[state=active]:text-primary-text group-data-[orientation=horizontal]/tabs:group-data-[variant=card]/tabs-list:mb-[-1px] group-data-[orientation=horizontal]/tabs:group-data-[variant=card]/tabs-list:data-[state=active]:border-b-background group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:mr-[-1px] group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:rounded-tr-none group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:rounded-l-md group-data-[orientation=vertical]/tabs:group-data-[variant=card]/tabs-list:data-[state=active]:border-r-background',
        // Line variant: transparent tab with an animated underline on the active item.
        'group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-2 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100',
        className,
      )}
      {...props}
    >
      {children}
      {closable && (
        // Decorative X (aria-hidden, no role): triggered by the mouse. We don't
        // use an interactive element here so as not to nest controls inside the
        // Trigger's <button> (`nested-interactive` violation). Keyboard access
        // is handled on the tab itself via Delete/Backspace (see onKeyDown).
        <span
          aria-hidden="true"
          data-slot="tabs-trigger-close"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onClose?.(event)
          }}
          className="ml-1 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-60 transition-opacity hover:bg-foreground/10 hover:opacity-100 [&_svg]:size-3.5"
        >
          {closeIcon ?? <X />}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants }
