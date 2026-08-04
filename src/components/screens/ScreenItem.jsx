import { useParams } from 'react-router-dom'
import { useContent } from '../../hooks/useContent'
import { useLang, t, ts } from '../../hooks/useLang'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useViewNav } from '../../hooks/useViewNav'
import { ScreenHeader, BackButton, NotFound, Empty } from '../ui/Shared'

export default function ScreenItem() {
  const { lang } = useLang()
  const { sectionId, categoryId, itemId } = useParams()
  const { content } = useContent()
  const navigate = useViewNav()
  const bp = useBreakpoint()

  if (!content) return null
  const section  = content.sections.find(s => s.id === sectionId)
  const category = section?.categories?.find(c => c.id === categoryId)
  const item     = category?.items?.find(i => i.id === itemId)
  if (!item) return <NotFound />

  const hasPhone   = item.phoneVisible   && item.phone
  const hasEmail   = item.emailVisible   && item.email
  const hasWebsite = item.websiteVisible && item.website
  const hasMap     = item.mapVisible     && item.mapUrl
  const hasAnyAction = hasPhone || hasEmail || hasWebsite || hasMap
  const isEmpty = !item.description && !hasAnyAction

  return (
    <div style={{ background:'var(--client-bg-base)', minHeight:'100dvh' }}>
      {item.imageUrl
        ? <HeroHeader title={t(item.name, lang)} subtitle={t(item.subtitle, lang)} imageUrl={item.imageUrl} onBack={() => navigate(`/${sectionId}/${categoryId}`)} />
        : <ScreenHeader title={t(item.name, lang)} subtitle={t(item.subtitle, lang)} onBack={() => navigate(`/${sectionId}/${categoryId}`)} />
      }
      <div style={{ padding:'var(--space-5) var(--side-padding) var(--space-10)' }}>
        {isEmpty && <Empty />}

        {t(item.description, lang) && (
          <p className="fh-reveal" style={{ fontSize:'var(--text-md)', color:'var(--client-ink-soft)', lineHeight:1.75, marginBottom:'var(--space-6)' }}>
            {t(item.description, lang)}
          </p>
        )}

        {hasAnyAction && (
          <div style={{ display:'grid', gridTemplateColumns: bp === 'mobile' ? '1fr' : '1fr 1fr', gap:'var(--space-3)', marginBottom:'var(--space-6)' }}>
            {hasPhone && <ActionButton icon="ti-phone" label={ts('appeler', lang)} sub={item.phone} href={`tel:${item.phone}`} primary />}
            {hasMap   && <ActionButton icon="ti-map-pin" label={ts('voirSurLaCarte', lang)} sub={ts('ouvrirGoogleMaps', lang)} href={item.mapUrl} external />}
            {hasWebsite && <ActionButton icon="ti-world" label={ts('siteWeb', lang)} sub={item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} href={item.website} external />}
            {hasEmail && <ActionButton icon="ti-mail" label={ts('envoyerEmail', lang)} sub={item.email} href={`mailto:${item.email}`} />}
          </div>
        )}

        <button onClick={() => navigate(`/${sectionId}/${categoryId}`)}
          className="fh-tap fh-fade"
          style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', background:'none', border:'none', padding:0, cursor:'pointer', color:'var(--client-ink-mute)', fontSize:'var(--text-sm)', fontFamily:'var(--font-body)', fontWeight:600 }}>
          <i className="ti ti-arrow-left" style={{ fontSize:14 }} aria-hidden="true" />
          {ts('retourA', lang)} {t(category.name, lang)}
        </button>
      </div>
    </div>
  )
}

function ActionButton({ icon, label, sub, href, primary, external }) {
  const { lang } = useLang()
  const handleClick = () => {
    if (external) window.open(href, '_blank', 'noopener')
    else window.location.href = href
  }
  return (
    <button onClick={handleClick}
      className={`fh-tap${primary ? ' fh-press' : ' fh-press fh-lift'}`}
      style={{
        display:'flex', alignItems:'center', gap:'var(--space-4)',
        width:'100%',
        background: primary ? 'var(--client-primary)' : 'var(--fh-white)',
        border: primary ? 'none' : '1px solid var(--client-line)',
        borderRadius:'var(--radius-lg)', padding:'var(--space-4)',
        cursor:'pointer', textAlign:'left'
      }}>
      <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', flexShrink:0,
        background: primary ? 'rgba(255,255,255,.16)' : 'var(--client-primary-tint)',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <i className={`ti ${icon}`} style={{ fontSize:18, color: primary ? 'var(--client-primary-contrast)' : 'var(--client-primary-ink)' }} aria-hidden="true" />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'var(--text-md)', fontWeight:600, color: primary ? 'var(--client-primary-contrast)' : 'var(--client-ink)', lineHeight:1.2, marginBottom:1 }}>{label}</p>
        {sub && <p style={{ fontSize:'var(--text-sm)', color: primary ? 'rgba(255,255,255,.65)' : 'var(--client-ink-mute)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</p>}
      </div>
      <i className={external ? 'ti ti-external-link' : 'ti ti-chevron-right'} style={{ fontSize:16, color: primary ? 'rgba(255,255,255,.5)' : 'var(--fh-sand-300)', flexShrink:0 }} aria-hidden="true" />
    </button>
  )
}

function HeroHeader({ title, subtitle, imageUrl, onBack }) {
  const { lang } = useLang()
  return (
    <div style={{ position:'relative', height:200, overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'var(--space-4) var(--side-padding)' }}>
      <img src={imageUrl} alt="" className="fh-img" onLoad={e => e.currentTarget.classList.add('is-loaded')} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.1) 55%)' }} />
      <BackButton onBack={onBack} dark />
      <div style={{ position:'relative', zIndex:1 }}>
        <h1 className="fh-display" style={{ fontSize:'var(--text-xl)', color:'#fff' }}>{title}</h1>
        {subtitle && <p style={{ fontSize:'var(--text-sm)', color:'rgba(255,255,255,.6)', marginTop:3 }}>{subtitle}</p>}
      </div>
    </div>
  )
}
