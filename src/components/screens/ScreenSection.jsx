import { useParams } from 'react-router-dom'
import { useContent } from '../../hooks/useContent'
import { useLang, t, ts } from '../../hooks/useLang'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useViewNav } from '../../hooks/useViewNav'
import { ScreenHeader, NotFound, Empty } from '../ui/Shared'

export default function ScreenSection() {
  const { lang } = useLang()
  const { sectionId } = useParams()
  const { content } = useContent()
  const navigate = useViewNav()
  const bp = useBreakpoint()

  if (!content) return null
  const section = content.sections.find(s => s.id === sectionId)
  if (!section) return <NotFound />

  const categories = (section.categories || []).filter(c => c.visible).sort((a, b) => a.order - b.order)

  return (
    <div style={{ background:'var(--fh-sand-50)', minHeight:'100dvh' }}>
      <ScreenHeader title={t(section.navLabel, lang)} onBack={() => navigate('/')} />
      <div style={{ padding:'var(--space-4) var(--side-padding) var(--space-10)', display: bp === 'mobile' ? 'block' : 'grid', gridTemplateColumns: bp === 'mobile' ? 'none' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: bp === 'mobile' ? 0 : 16 }}>
        {categories.length === 0 && <Empty />}
        {categories.map(cat => (
          <CategoryRow key={cat.id} category={cat}
            onClick={() => navigate(`/${sectionId}/${cat.id}`)} />
        ))}
      </div>
    </div>
  )
}

function CategoryRow({ category, onClick }) {
  const { lang } = useLang()
  const itemCount = (category.items || []).filter(i => i.visible).length
  const hasImg = !!category.coverImageUrl
  return (
    <div onClick={onClick} className="fh-card fh-tap fh-press"
      style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-4)', marginBottom:'var(--space-3)', cursor:'pointer' }}>
      {/* Vignette */}
      <div style={{ width:48, height:48, borderRadius:'var(--radius-md)', overflow:'hidden', flexShrink:0,
        background: hasImg ? 'transparent' : 'var(--client-primary-tint)',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        {hasImg
          ? <img src={category.coverImageUrl} alt={t(category.name, lang)} className="fh-img" onLoad={e => e.currentTarget.classList.add('is-loaded')} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <i className={`ti ${category.icon || 'ti-map-pin'}`} style={{ fontSize:20, color:'var(--client-primary)' }} aria-hidden="true" />
        }
      </div>
      {/* Texte */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'var(--text-md)', fontWeight:600, color:'var(--client-ink)', lineHeight:1.3, marginBottom:2 }}>{t(category.name, lang)}</p>
        {itemCount > 0 && (
          <p style={{ fontSize:'var(--text-sm)', color:'var(--client-ink-mute)' }}>
            {itemCount} {itemCount > 1 ? ts('adresses', lang) : ts('adresse', lang)}
          </p>
        )}
      </div>
      <i className="ti ti-chevron-right" style={{ fontSize:18, color:'var(--client-line)', flexShrink:0 }} aria-hidden="true" />
    </div>
  )
}
