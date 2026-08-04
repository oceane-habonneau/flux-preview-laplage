import { useLang, ts } from '../../hooks/useLang'

/* ── Header écran intérieur ─────────────────────────────── */
export function ScreenHeader({ title, subtitle, onBack }) {
  const { lang } = useLang()
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 'var(--header-height, 56px)',
      background: 'color-mix(in srgb, var(--client-bg-base) 88%, transparent)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '0.5px solid var(--client-line)',
      display: 'flex', alignItems: 'center',
      padding: '0 var(--side-padding)',
      gap: 'var(--space-3)'
    }}>
      {onBack && <BackButton onBack={onBack} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)',
          fontWeight: 500, color: 'var(--client-ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--client-ink-mute)', marginTop: 1 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Bouton retour ───────────────────────────────────────── */
export function BackButton({ onBack, dark }) {
  return (
    <button
      onClick={onBack}
      style={{
        width: 34, height: 34, borderRadius: '999px',
        background: dark ? 'rgba(0,0,0,0.35)' : 'var(--client-bg-alt)',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      aria-label="Retour"
    >
      <i className="ti ti-arrow-left"
         style={{ fontSize: 16, color: dark ? '#fff' : 'var(--client-ink-soft)' }}
         aria-hidden="true" />
    </button>
  )
}

/* ── Page non trouvée ────────────────────────────────────── */
export function NotFound() {
  const { lang } = useLang()
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'60dvh', gap:12, padding:32 }}>
      <i className="ti ti-map-off" style={{ fontSize:36, color:'var(--client-ink-faint)' }} aria-hidden="true" />
      <p style={{ fontSize:'var(--text-base)', color:'var(--client-ink-mute)', textAlign:'center' }}>
        {ts('introuvable', lang)}
      </p>
    </div>
  )
}

/* ── Liste vide ──────────────────────────────────────────── */
export function Empty() {
  const { lang } = useLang()
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'40dvh', gap:12, padding:32 }}>
      <i className="ti ti-inbox" style={{ fontSize:32, color:'var(--client-ink-faint)' }} aria-hidden="true" />
      <p style={{ fontSize:'var(--text-base)', color:'var(--client-ink-mute)', textAlign:'center' }}>
        {ts('aucunContenu', lang)}
      </p>
    </div>
  )
}
