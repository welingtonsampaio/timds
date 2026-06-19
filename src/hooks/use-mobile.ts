import * as React from 'react'

// Breakpoint abaixo do qual tratamos a viewport como "mobile" (alinhado ao
// `md` do Tailwind: 768px). A Sidebar usa isto para alternar entre o layout
// fixo (desktop) e o overlay em Sheet (mobile).
const MOBILE_BREAKPOINT = 768

/** Retorna `true` quando a largura da janela está abaixo do breakpoint mobile. */
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
