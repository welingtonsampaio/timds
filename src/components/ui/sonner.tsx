import type { CSSProperties } from 'react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

import { cn } from '@/lib/utils'

/**
 * Maps sonner's CSS vars to the design system tokens (src/styles.css).
 *
 * Each color is derived via `color-mix` toward `--popover` /
 * `--popover-foreground`, which already switch under `.dark`. This way background,
 * border and text adapt to the theme automatically — without relying on
 * `next-themes` (dark mode here is opt-in via the `.dark` class, not through
 * sonner's internal theme).
 *
 * It goes in the Toaster's inline `style` because inline style beats the
 * specificity of the CSS sonner injects at runtime
 * ([data-sonner-toaster][data-sonner-theme]). The custom properties are inherited
 * by the child toasts.
 */
const tokenStyle = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',

  // Sonner's neutral scale. The neutral toast's close button uses it
  // (`color: var(--gray12)`, `border: var(--gray4)`, hover `--gray2`/`--gray5`).
  // Without this, the X inherits sonner's internal theme scale (light by default)
  // and disappears over our dark `--popover` in dark mode. By pointing to the
  // tokens, the button stays visible and changes color with `.dark`.
  '--gray2': 'var(--accent)',
  '--gray4': 'var(--border)',
  '--gray5': 'var(--border)',
  '--gray12': 'var(--popover-foreground)',

  // Light tonal background + text that darkens/lightens along with
  // popover-foreground. We mix in `oklab` (not `oklch`) on purpose: oklab
  // interpolates in rectangular coordinates, without rotating the hue. In `oklch`,
  // mixing a saturated color with the nearly neutral popover pushes the hue toward
  // ~0° (red), tinting success pink and info purple. In oklab the hue is preserved.
  '--success-bg': 'color-mix(in oklab, var(--success) 14%, var(--popover))',
  '--success-border': 'color-mix(in oklab, var(--success) 30%, var(--border))',
  '--success-text': 'color-mix(in oklab, var(--success) 58%, var(--popover-foreground))',

  '--error-bg': 'color-mix(in oklab, var(--destructive) 14%, var(--popover))',
  '--error-border': 'color-mix(in oklab, var(--destructive) 30%, var(--border))',
  '--error-text':
    'color-mix(in oklab, var(--destructive) 62%, var(--popover-foreground))',

  '--warning-bg': 'color-mix(in oklab, var(--warning) 14%, var(--popover))',
  '--warning-border': 'color-mix(in oklab, var(--warning) 30%, var(--border))',
  '--warning-text': 'color-mix(in oklab, var(--warning) 58%, var(--popover-foreground))',

  '--info-bg': 'color-mix(in oklab, var(--info) 14%, var(--popover))',
  '--info-border': 'color-mix(in oklab, var(--info) 30%, var(--border))',
  '--info-text': 'color-mix(in oklab, var(--info) 58%, var(--popover-foreground))',
} as CSSProperties

/**
 * Notifications container. Render it once at the application root; toasts are
 * triggered from anywhere via the `toast` function.
 *
 * Defaults: `richColors` (semantic colors per type) and bottom-right position.
 * Everything is overridable — including `richColors`, `position`, `closeButton`,
 * `expand`, `duration`, etc. — since the consumer's props take precedence.
 */
function Toaster({ className, style, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      richColors
      position="bottom-right"
      className={cn('toaster group', className)}
      style={{ ...tokenStyle, ...style }}
      {...props}
    />
  )
}

export { toast } from 'sonner'
export { Toaster, type ToasterProps }
