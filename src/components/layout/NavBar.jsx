import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useContent } from '../../hooks/useContent'
import { useLang, t, ts } from '../../hooks/useLang'
import { useViewNav } from '../../hooks/useViewNav'

export default function NavBar() {
  const { lang, toggle } = useLang()
  const { content } = useContent()
  const navigate = useViewNav()
  const location = useLocation()
  const [othersOpen, setOthersOpen] = useState(false)

  if (!content) return null

  const isHome = location.pathname === '/'
  const currentSection = location.pathname.split('/')[1] || ''

  const allSections = (content.sections || [])
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order)

  const menuSections  = allSections.filter(s => s.inMenu)
  const otherSections = allSections.filter(s => !s.inMenu)
  const hasOthers     = otherSections.length > 0
  const isOtherActive = otherSections.some(s => s.id === currentSection)

  return (
    <>
      {/* Bouton toggle langue — fixe en haut à droite */}
      <button
        onClick={toggle}
        style={{
          position: 'fixed',
          top: 12,
          right: 'var(--side-padding, 16px)',
          zIndex: 200,
          background: '#000', color: '#fff',
          border: 'none', borderRadius: '999px',
          fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
          letterSpacing: '.1em', padding: '5px 11px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,.25)'
        }}
        aria-label="Switch language"
      >
        <i className="ti ti-language" style={{ fontSize: 11 }} aria-hidden="true" />
        {lang === 'fr' ? 'EN' : 'FR'}
      </button>

      {/* Drawer Autres */}
      {othersOpen && (
        <>
          <div onClick={() => setOthersOpen(false)} style={{ position:'fixed', inset:0, zIndex:98 }} />
          <div style={{
            position:'fixed',
            bottom:'calc(var(--nav-height) + 16px)',
            left:'50%', transform:'translateX(-50%)',
            width:'calc(100% - 64px)',
            maxWidth:900,
            background:'rgba(255,255,255,.95)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            borderRadius:'var(--radius-lg)',
            border:'1px solid var(--fh-sand-200)',
            padding:8, zIndex:99,
            boxShadow:'var(--shadow-float)'
          }}>
            <p className="fh-eyebrow" style={{ padding:'8px 10px 10px', display:'block' }}>{ts('autresSections', lang)}</p>
            {otherSections.map(section => (
              <button
                key={section.id}
                className="fh-tap"
                onClick={() => { navigate(`/${section.id}`); setOthersOpen(false) }}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:'10px 12px',
                  background: currentSection === section.id ? 'var(--client-primary-tint)' : 'none',
                  border:'none', borderRadius:'var(--radius-md)', cursor:'pointer', textAlign:'left'
                }}
              >
                <i className={`ti ${section.navIcon}`} style={{ fontSize:18, color: currentSection === section.id ? 'var(--client-primary-ink)' : 'var(--client-ink-soft)' }} aria-hidden="true" />
                <span style={{ fontSize:14, fontWeight:500, color: currentSection === section.id ? 'var(--client-primary-ink)' : 'var(--client-ink)' }}>
                  {t(section.navLabel, lang)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Navbar pill flottante */}
      <nav style={{
        position:'fixed', bottom:'max(12px, env(safe-area-inset-bottom))',
        left:'50%', transform:'translateX(-50%)',
        width:'calc(100% - 48px)',
        maxWidth:960,
        background:'color-mix(in srgb, var(--client-surface) 86%, transparent)',
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        border:'1px solid var(--client-line)',
        borderRadius:'var(--radius-lg)',
        boxShadow:'var(--shadow-nav)',
        display:'flex', justifyContent:'space-around',
        padding:'9px 6px',
        zIndex:100
      }}>
        <NavItem icon="ti-home" label={ts('accueil', lang)} active={isHome}
          onClick={() => { navigate('/'); setOthersOpen(false) }} />
        {menuSections.map(section => (
          <NavItem key={section.id}
            icon={section.navIcon} label={t(section.navLabel, lang)}
            active={currentSection === section.id}
            onClick={() => { navigate(`/${section.id}`); setOthersOpen(false) }} />
        ))}
        {hasOthers && (
          <NavItem icon="ti-dots" label={ts('autres', lang)}
            active={isOtherActive || othersOpen}
            onClick={() => setOthersOpen(o => !o)} />
        )}
      </nav>
    </>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="fh-tap"
      style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:4,
        background:'none', border:'none', cursor:'pointer',
        padding:'4px 10px', minWidth:44, minHeight:44, justifyContent:'center'
      }}
    >
      <i className={`ti ${icon}`} aria-hidden="true" style={{
        fontSize:20,
        color: active ? 'var(--client-primary-ink)' : 'var(--client-ink-faint)',
        transition:'color var(--transition-fast)'
      }} />
      <span style={{
        fontSize:8, fontWeight:600, letterSpacing:'.10em', textTransform:'uppercase',
        color: active ? 'var(--client-primary-ink)' : 'var(--client-ink-faint)',
        transition:'color var(--transition-fast)'
      }}>
        {label}
      </span>
    </button>
  )
}
