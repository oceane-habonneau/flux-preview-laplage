import { useState, useEffect } from 'react'

/**
 * FLUXhub — useBreakpoint
 * Retourne le breakpoint courant : 'mobile' | 'tablet' | 'desktop'
 */
export function useBreakpoint() {
  const [bp, setBp] = useState(() => getBreakpoint())

  useEffect(() => {
    const mq768  = window.matchMedia('(min-width: 768px)')
    const mq1024 = window.matchMedia('(min-width: 1024px)')

    function update() { setBp(getBreakpoint()) }
    mq768.addEventListener('change', update)
    mq1024.addEventListener('change', update)
    return () => {
      mq768.removeEventListener('change', update)
      mq1024.removeEventListener('change', update)
    }
  }, [])

  return bp
}

function getBreakpoint() {
  if (typeof window === 'undefined') return 'mobile'
  if (window.innerWidth >= 1024) return 'desktop'
  if (window.innerWidth >= 768)  return 'tablet'
  return 'mobile'
}
