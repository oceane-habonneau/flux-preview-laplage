import { useNavigate } from 'react-router-dom'

/**
 * FLUXhub — useViewNav
 * Wrapper de navigate() qui déclenche la View Transitions API si disponible.
 * L'API navigate(path, opts) reste identique — aucun appel à réécrire.
 */
export function useViewNav() {
  const navigate = useNavigate()
  return (to, opts) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => navigate(to, opts))
    } else {
      navigate(to, opts)
    }
  }
}
