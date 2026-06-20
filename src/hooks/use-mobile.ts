import * as React from 'react'

// Breakpoint below which we treat the viewport as "mobile" (aligned with
// Tailwind's `md`: 768px). The Sidebar uses this to switch between the fixed
// layout (desktop) and the Sheet overlay (mobile).
const MOBILE_BREAKPOINT = 768

/** Returns `true` when the window width is below the mobile breakpoint. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
