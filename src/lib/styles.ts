// Class presets shared across components.
//
// This is where COMBINATIONS of Tailwind utilities that repeat across multiple
// components (focus, invalid, disabled states, etc.) live — not design tokens.
// Color/spacing tokens remain in `src/styles.css` (single source of the
// values); these presets only prevent the drift of classes copied between
// files.
//
// Always use via `cn(...)`, concatenating like any other class string:
//
//   className={cn(focusRing, ariaInvalid, disabledControl, '...locals', className)}
//
// Since they go through `cn` (tailwind-merge), the consumer can still
// override any utility via `className`, and the order between presets
// does not affect the result (they are groups of utilities with no conflict
// between them).

/** Default focus ring for controls (button, input, checkbox, select, ...). */
export const focusRing =
  'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'

/** Invalid state via `aria-invalid`: destructive border and ring (with dark). */
export const ariaInvalid =
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'

/** Disabled state for interactive controls. */
export const disabledControl = 'disabled:cursor-not-allowed disabled:opacity-50'

/** Safeguards for embedded SVG icons (do not capture pointer, do not shrink,
 *  default size when the consumer does not define a `size-*`). */
export const svgIcon =
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

/** Darkened backdrop for modal overlays (Dialog/AlertDialog). */
export const overlayClass =
  'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0'

/**
 * Center surface of a modal (Dialog/AlertDialog): positioning,
 * border/shadow, enter/exit animation and width by `size` (driven by the
 * `data-size` attribute on the element itself). The `group/...` name is up to
 * each component (e.g.: `group/dialog-content`), since the children reference
 * that name in `group-data-[size=...]`.
 */
export const modalSurface =
  'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:sm:max-w-lg'
