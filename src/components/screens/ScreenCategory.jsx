import { useParams } from 'react-router-dom'
import { useContent } from '../../hooks/useContent'
import { useLang, t, ts } from '../../hooks/useLang'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useViewNav } from '../../hooks/useViewNav'
import { ScreenHeader, BackButton, NotFound, Empty } from '../ui/Shared'

export default function ScreenCategory() {
  const { lang } = useLang()
  const { sectionId, categoryId } = useParams()
  const { content } = useContent()
  const navigate = useViewNav()
  const bp = useBreakpoint()

  if (!content) return null
  const section  = content.sections.find(s => s.id === sectionId)
  const category = section?.categories?.find(c => c.id === categoryId)
  if (!section || !category) return <NotFound />

  const items = (category.items || []).filter(i => i.visible).sort((a, b) => a.order - b.order)

  return (
    <div style={{ background:'var(--client-bg-base)', minHeight:'100dvh' }}>
      {category.coverImageUrl
        ? <HeroHeader title={t(category.name, lang)} imageUrl={category.coverImageUrl} onBack={() => navigate(`/${sectionId}`)} />
        : <ScreenHeader title={t(category.name, lang)} onBack={() => navigate(`/${sectionId}`)} />
      }
      <div style={{ padding:'var(--space-4) var(--side-padding) var(--space-10)', display: bp === 'mobile' ? 'block' : 'grid', gridTemplateColumns: bp === 'mobile' ? 'none' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: bp === 'mobile' ? 0 : 16 }}>
        {items.length === 0 && <Empty />}
        {items.map(item => (
          <ItemRow key={item.id} item={item}
            onClick={() => navigate(`/${sectionId}/${categoryId}/${item.id}`)} />
        ))}
      </div>
    </div>
  )
}

function HeroHeader({ title, imageUrl, onBack }) {
  const { lang } = useLang()
  return (
    <div style={{ position:'relative', height:160, overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'var(--space-4) var(--side-padding)' }}>
      <img src={imageUrl} alt="" className="fh-img" onLoad={e => e.currentTarget.classList.add('is-loaded')} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.62), transparent 60%)' }} />
      <BackButton onBack={onBack} dark />
      <h1 className="fh-display" style={{ position:'relative', zIndex:1, fontSize:'var(--text-xl)', color:'#fff' }}>{title}</h1>
    </div>
  )
}

function ItemRow({ item, onClick }) {
  const { lang } = useLang()
  const hasPhone = item.phoneVisible && item.phone
  const hasMap   = item.mapVisible   && item.mapUrl
  const hasImg   = !!item.imageUrl
  return (
    <div onClick={onClick} className="fh-card fh-tap fh-press"
      style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-4)', marginBottom:'var(--space-3)', cursor:'pointer' }}>
      {/* Miniature */}
      {hasImg
        ? <img src={item.imageUrl} alt={t(item.name, lang)} className="fh-img" onLoad={e => e.currentTarget.classList.add('is-loaded')}
            style={{ width:52, height:52, borderRadius:'var(--radius-md)', objectFit:'cover', flexShrink:0 }} />
        : <div style={{ width:52, height:52, borderRadius:'var(--radius-md)', background:'var(--client-bg-alt)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-building" style={{ fontSize:20, color:'var(--client-line)' }} aria-hidden="true" />
          </div>
      }
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'var(--text-md)', fontWeight:600, color:'var(--client-ink)', lineHeight:1.3, marginBottom:2, fontFamily:'var(--font-body)' }}>{t(item.name, lang)}</p>
        {t(item.subtitle, lang) && <p style={{ fontSize:'var(--text-sm)', color:'var(--client-ink-mute)' }}>{t(item.subtitle, lang)}</p>}
        {(hasPhone || hasMap) && (
          <div style={{ display:'flex', gap:'var(--space-2)', marginTop:'var(--space-1)' }}>
            {hasPhone && <QuickBadge icon="ti-phone" />}
            {hasMap   && <QuickBadge icon="ti-map-pin" />}
          </div>
        )}
      </div>
      <i className="ti ti-chevron-right" style={{ fontSize:18, color:'var(--client-line)', flexShrink:0 }} aria-hidden="true" />
    </div>
  )
}

function QuickBadge({ icon }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:'var(--radius-full)', background:'var(--client-tint)' }}>
      <i className={`ti ${icon}`} style={{ fontSize:11, color:'var(--client-primary)' }} aria-hidden="true" />
    </span>
  )
}
