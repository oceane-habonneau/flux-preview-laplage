import { useState, useEffect } from 'react'
import { useBreakpoint } from '../../../hooks/useBreakpoint'
import { useContent } from '../../../hooks/useContent'
import AdminEstablishment from './AdminEstablishment'
import AdminSections from './AdminSections'
import AdminBranding from './AdminBranding'

const TABS = [
  { id: 'establishment', label: 'Établissement', icon: 'ti-building' },
  { id: 'sections',      label: 'Sections',       icon: 'ti-layout-list' },
  { id: 'branding',      label: 'Apparence',       icon: 'ti-palette' },
]

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState('establishment')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { saving, adapterMode, content, loading, error } = useContent()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile' || bp === 'tablet'

  // Palette fixe FLUX — jamais impactée par la charte client
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--client-primary',        '#16150F')
    root.style.setProperty('--client-primary-dark',   '#000000')
    root.style.setProperty('--client-primary-light',  '#F2F0EA')
    root.style.setProperty('--client-secondary',      '#C9A96E')
    root.style.setProperty('--client-secondary-light','#F7F2EA')
    return () => {
      root.style.removeProperty('--client-primary')
      root.style.removeProperty('--client-primary-dark')
      root.style.removeProperty('--client-primary-light')
      root.style.removeProperty('--client-secondary')
      root.style.removeProperty('--client-secondary-light')
    }
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', flexDirection:'column', gap:12, background:'var(--flux-canvas)' }}>
      <div style={{ width:28, height:28, border:'1.5px solid var(--flux-line)', borderTop:'1.5px solid var(--flux-ink)', borderRadius:'50%', animation:'fh-spin 0.8s linear infinite' }} />
      <style>{`@keyframes fh-spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize:12, color:'var(--flux-ink-mute)', fontFamily:'var(--font-body)' }}>Chargement…</p>
    </div>
  )

  if (error || !content) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'var(--flux-canvas)' }}>
      <p style={{ fontSize:13, color:'var(--flux-danger)', fontFamily:'var(--font-body)' }}>Erreur : {error}</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh', background:'var(--flux-canvas)', display:'flex', flexDirection:'column', width:'100%' }}>

      {/* ── Topbar ── */}
      <div style={{
        background: 'rgba(252,251,249,.86)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--flux-line)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 58,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Voile menthe signature */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '45%', pointerEvents: 'none',
          background: 'radial-gradient(120% 100% at 100% 0%, rgba(206,234,219,.55), transparent 60%)'
        }} />

        {/* Hamburger tablette */}
        {isMobile && (
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, marginRight:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className={`ti ${sidebarOpen ? 'ti-x' : 'ti-menu-2'}`} style={{ fontSize:20, color:'var(--flux-ink)' }} aria-hidden="true" />
          </button>
        )}
        {/* Logo FLUX */}
        <div style={{ display:'flex', alignItems:'center', gap:24, position:'relative', zIndex:1 }}>
          <p style={{ fontFamily:'var(--font-body)', fontSize:17, fontWeight:600, color:'var(--flux-ink)', letterSpacing:'.01em' }}>
            <span style={{ fontFamily:'var(--flux-font-display)', fontStyle:'italic', fontWeight:600 }}>FLUX</span>
            <span style={{ fontWeight:600, color:'var(--flux-ink-soft)' }}>hub</span>
          </p>
          <span style={{
            fontSize:9, fontWeight:600, letterSpacing:'.26em', textTransform:'uppercase',
            color:'var(--flux-ink-mute)',
            borderLeft:'1px solid var(--flux-line)', paddingLeft:20
          }}>
            ✦ &nbsp;Room Directory
          </span>
        </div>

        {/* Statut */}
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
          {saving && (
            <span style={{ fontSize:11, color:'var(--flux-ink-mute)', display:'flex', alignItems:'center', gap:5 }}>
              <i className="ti ti-loader" style={{ fontSize:13, animation:'fh-spin 1s linear infinite' }} aria-hidden="true" />
              Sauvegarde…
            </span>
          )}
          <span style={{
            fontSize:11, fontWeight:600,
            color: adapterMode === 'php' ? 'var(--flux-mint)' : 'var(--flux-amber)',
            background: adapterMode === 'php' ? 'var(--flux-mint-bg)' : 'var(--flux-amber-bg)',
            padding:'4px 11px', borderRadius:'var(--radius-full)',
            display:'flex', alignItems:'center', gap:5
          }}>
            <i className={adapterMode === 'php' ? 'ti ti-cloud-check' : 'ti ti-device-floppy'} style={{ fontSize:13 }} aria-hidden="true" />
            {adapterMode === 'php' ? 'Sauvegarde PHP active' : 'Mode local'}
          </span>
        </div>
      </div>

      {/* ── Layout 2 colonnes ── */}
      <div style={{ display:'flex', flex:1, minHeight:0, position:'relative' }}>
        {/* Overlay tablette */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:199, top:58 }} />
        )}

        {/* Sidebar */}
        {(!isMobile || sidebarOpen) && <aside style={{
          width: 220,
          background: 'var(--flux-canvas)',
          borderRight: '1px solid var(--flux-line)',
          padding: '28px 0',
          flexShrink: 0,
          position: isMobile ? 'fixed' : 'sticky',
          top: 58,
          left: isMobile ? 0 : 'auto',
          height: 'calc(100dvh - 58px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: isMobile ? 200 : 'auto',
          boxShadow: isMobile ? 'var(--shadow-float)' : 'none'
        }}>
          <nav>
            <p style={{
              fontSize:9, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase',
              color:'var(--flux-ink-mute)', padding:'0 20px', marginBottom:10
            }}>
              Contenu
            </p>
            {TABS.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width:'100%',
                    display:'flex', alignItems:'center', gap:11,
                    padding:'11px 20px',
                    background: active ? '#F2F0EA' : 'none',
                    border:'none',
                    borderLeft: active ? '2px solid var(--flux-ink)' : '2px solid transparent',
                    cursor:'pointer',
                    textAlign:'left',
                    transition:'all 140ms ease'
                  }}
                >
                  <i className={`ti ${tab.icon}`} style={{ fontSize:17, color: active ? 'var(--flux-ink)' : 'var(--flux-ink-mute)' }} aria-hidden="true" />
                  <span style={{ fontSize:14, fontWeight: active ? 600 : 400, color: active ? 'var(--flux-ink)' : 'var(--flux-ink-soft)' }}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </nav>

          <p style={{ fontSize:9, color:'var(--flux-line)', letterSpacing:'.18em', textTransform:'uppercase', padding:'0 20px', fontFamily:'var(--font-body)', fontWeight:600 }}>
            FLUXhub
          </p>
        </aside>}

        {/* Zone principale */}
        <main style={{ flex:1, overflowY:'auto', padding:'36px 40px', maxWidth:960 }}>
          {activeTab === 'establishment' && <AdminEstablishment />}
          {activeTab === 'sections'      && <AdminSections />}
          {activeTab === 'branding'      && <AdminBranding />}
        </main>
      </div>
    </div>
  )
}
