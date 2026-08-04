import { useState, useRef, useEffect } from 'react'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useContent } from '../../hooks/useContent'
import { useLang, t, ts } from '../../hooks/useLang'
import { useViewNav } from '../../hooks/useViewNav'

export default function ScreenHome() {
  const { lang, toggle } = useLang()
  const { content } = useContent()
  const navigate = useViewNav()
  const [rulesOpen, setRulesOpen] = useState(false)

  const bp = useBreakpoint()
  if (!content) return null

  const { branding, establishment, sections } = content
  const e = establishment
  return (
    <div style={{ background:'var(--client-bg-base)', minHeight:'100dvh' }}>
      <Hero branding={branding} establishment={e} />
      <ConciergeCard establishment={e} hasHeroImage={!!branding.heroImageUrl} onOpenRules={() => setRulesOpen(true)} />
      <ServicesBlock services={e.services} bp={bp} />
      {content.selection?.visible && (
        <SelectionBlock selection={content.selection} sections={sections} navigate={navigate} bp={bp} />
      )}
      {rulesOpen && (
        <RulesDrawer title={t(e.rulesTitle, lang)} content={t(e.rulesContent, lang)} onClose={() => setRulesOpen(false)} />
      )}
    </div>
  )
}

/* ── Hero ────────────────────────────────── */
function Hero({ branding, establishment }) {
  const { lang, toggle } = useLang()
  const hasHero = !!branding.heroImageUrl
  return (
    <div style={{
      position:'relative', height: hasHero ? 'var(--hero-height)' : 'auto', minHeight: hasHero ? 'none' : 280,
      background: hasHero ? '#111' : 'var(--client-primary-solid)',
      overflow:'hidden', display:'flex', flexDirection:'column',
      justifyContent:'flex-end', padding:'var(--space-5)', paddingBottom:'calc(var(--space-5) + 32px)'
    }}>
      {hasHero && (
        <img src={branding.heroImageUrl} alt=""
          className="fh-img"
          onLoad={e => e.currentTarget.classList.add('is-loaded')}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
      )}
      {/* Scrim */}
      <div style={{
        position:'absolute', inset:0,
        background: hasHero
          ? 'linear-gradient(180deg, rgba(20,18,14,.34) 0%, transparent 26%, transparent 48%, rgba(20,18,14,.66) 100%)'
          : 'linear-gradient(to top, var(--client-primary) 0%, transparent 60%)'
      }} />
      {/* Logo */}
      {branding.logoUrl && (
        <img src={branding.logoUrl} alt={t(branding.name, lang)}
          onError={e => { e.target.style.display='none' }}
          style={{ position:'absolute', top:'var(--space-5)', left:'var(--space-5)', height:32, objectFit:'contain', filter:'brightness(0) invert(1)', opacity:.9, zIndex:2 }} />
      )}
      {/* Texte */}
      <div style={{ position:'relative', zIndex:2 }}>
        <p className="fh-eyebrow" style={{ color:'rgba(255,255,255,.82)', letterSpacing:'.26em', marginBottom:6 }}>
          {t(branding.tagline, lang)}
        </p>
        <h1 className="fh-display" style={{
          fontSize:'clamp(34px,12vw,46px)', lineHeight:.96, color:'#fff'
        }}>
          {(t(branding.heroTitle, lang) || 'Bienvenue').split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h1>
        {establishment.address && (
          <p style={{ fontSize:'var(--text-sm)', color:'rgba(255,255,255,.85)', marginTop:'var(--space-2)', display:'flex', alignItems:'center', gap:8 }}>
            <i className="ti ti-map-pin" style={{ fontSize:14 }} aria-hidden="true" />
            {establishment.address}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Carte concierge ─────────────────────── */
function ConciergeCard({ establishment: e, hasHeroImage, onOpenRules }) {
  const { lang } = useLang()
  const [copied, setCopied] = useState(false)

  // Lignes secondaires (hors check-in/out)
  const rows = []

  ;(e.schedules || []).filter(s => s.visible && s.value)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach(s => rows.push({ key:t(s.label, lang), value:s.value, icon:'ti-clock', passive:true }))

  if (e.wifiVisible && e.wifiNetwork)
    rows.push({ key:'Wi-Fi', value:e.wifiNetwork + (e.wifiPassword ? ` · ${e.wifiPassword}` : ''), icon:'ti-wifi', passive:true, copyValue: e.wifiPassword || e.wifiNetwork })

  ;(e.phones || []).filter(p => p.visible && p.value)
    .forEach(p => rows.push({ key:t(p.label, lang) || 'Téléphone', value:p.value, icon:'ti-phone', href:`tel:${p.value}`, isLink:true }))

  ;(e.emails || []).filter(em => em.visible && em.value)
    .forEach(em => rows.push({ key:t(em.label, lang) || 'Email', value:em.value, icon:'ti-mail', href:`mailto:${em.value}`, isLink:true }))

  if (e.websiteVisible && e.website)
    rows.push({ key:'Site web', value:e.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), icon:'ti-world', href:e.website, isLink:true, external:true })

  if (e.rulesVisible && t(e.rulesContent, lang))
    rows.push({ key:t(e.rulesTitle, lang) || 'Règlement intérieur', value:ts('consulter', lang), icon:'ti-file-description', isAction:true, onClick:onOpenRules, passive:false })

  const hasCheckin  = e.checkinVisible  && e.checkin
  const hasCheckout = e.checkoutVisible && e.checkout
  const hasHeader   = hasCheckin || hasCheckout
  const hasContent  = hasHeader || rows.length > 0

  if (!hasContent) return null

  function handleCopy(val) {
    navigator.clipboard?.writeText(val).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="fh-reveal" style={{ padding:'0 18px', marginTop: hasHeroImage ? -26 : 16, position:'relative', zIndex:10 }}>
      <div style={{
        background:'var(--client-surface)',
        borderRadius:'var(--radius-lg)',
        boxShadow:'var(--shadow-float)',
        border:'1px solid var(--client-line)',
        overflow:'hidden',
        /* Hauteur max pour ne jamais dépasser ~60% de l'écran */
        maxHeight:'60dvh',
        display:'flex',
        flexDirection:'column'
      }}>

        {/* ── Check-in / Check-out : 2 colonnes ── */}
        {hasHeader && (
          <div style={{ display:'flex', flexShrink:0, borderBottom: rows.length > 0 ? '1px solid var(--fh-sand-200)' : 'none' }}>
            {hasCheckin && (
              <div style={{
                flex:1, padding:'18px 20px 16px',
                borderRight: hasCheckout ? '1px solid var(--client-line)' : 'none'
              }}>
                <p style={{ fontSize:9, fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--client-ink-mute)', marginBottom:6 }}>
                  Check-in
                </p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:27, fontWeight:600, color:'var(--fh-ink)', lineHeight:1, marginBottom:4 }}>
                  {e.checkin}
                </p>
                <p style={{ fontSize:11, color:'var(--fh-gray-400)' }}>{ts('apartirDe', lang)}</p>
              </div>
            )}
            {hasCheckout && (
              <div style={{ flex:1, padding:'18px 20px 16px' }}>
                <p style={{ fontSize:9, fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--client-ink-mute)', marginBottom:6 }}>
                  Check-out
                </p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:27, fontWeight:600, color:'var(--fh-ink)', lineHeight:1, marginBottom:4 }}>
                  {e.checkout}
                </p>
                <p style={{ fontSize:11, color:'var(--fh-gray-400)' }}>{ts('avant', lang)}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Lignes secondaires scrollables ── */}
        {rows.length > 0 && (
          <div style={{ overflowY:'auto', flex:1 }}>
            {rows.map((row, i) => (
              <ConciergeRow
                key={i}
                row={row}
                isLast={i === rows.length - 1}
                onCopy={row.copyValue ? () => handleCopy(row.copyValue) : null}
                copied={copied}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ConciergeRow({ row, isLast, onCopy, copied }) {
  const isClickable = row.isLink || row.isAction
  const Tag = row.isLink ? 'a' : 'div'
  const tagProps = row.isLink
    ? { href:row.href, ...(row.external ? { target:'_blank', rel:'noopener noreferrer' } : {}) }
    : row.isAction ? { onClick:row.onClick } : {}

  return (
    <Tag
      {...tagProps}
      className={isClickable ? 'fh-tap fh-press' : ''}
      style={{
        display:'flex', alignItems:'center', gap:14,
        padding:'15px 22px',
        borderBottom: isLast ? 'none' : '1px solid var(--client-line)',
        textDecoration:'none',
        cursor: isClickable ? 'pointer' : 'default'
      }}
    >
      {/* Pastille icône */}
      <div style={{
        width:38, height:38, borderRadius:'var(--radius-md)', flexShrink:0,
        background: row.passive ? 'var(--client-bg-alt)' : 'var(--client-primary-solid)',
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        <i className={`ti ${row.icon}`} style={{ fontSize:17, color: row.passive ? 'var(--client-ink-mute)' : 'var(--client-primary-contrast)' }} aria-hidden="true" />
      </div>

      {/* Texte */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:11, color:'var(--fh-gray-400)', marginBottom:2 }}>{row.key}</p>
        <p style={{ fontSize:14, fontWeight:600, color: row.passive ? 'var(--client-ink)' : 'var(--client-primary-ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {row.value}
        </p>
      </div>

      {/* Bouton copier (Wi-Fi) */}
      {onCopy && (
        <button
          onClick={e => { e.stopPropagation(); onCopy() }}
          className="fh-tap"
          style={{ background:'none', border:'none', cursor:'pointer', padding:6, color: copied ? 'var(--client-primary)' : 'var(--fh-sand-300)', flexShrink:0 }}
          aria-label="Copier"
        >
          <i className={copied ? 'ti ti-check' : 'ti ti-copy'} style={{ fontSize:16 }} aria-hidden="true" />
        </button>
      )}

      {/* Chevron actions */}
      {isClickable && !onCopy && (
        <i className="ti ti-chevron-right" style={{ fontSize:16, color:'var(--fh-sand-300)', flexShrink:0 }} aria-hidden="true" />
      )}
    </Tag>
  )
}

/* ── Services ────────────────────────────── */
function ServicesBlock({ services, bp }) {
  const { lang } = useLang()
  const visible = (services || []).filter(s => s.visible && (s.label?.fr || s.label))
  if (visible.length === 0) return null
  return (
    <div style={{ background:'var(--client-secondary-wash)', padding:'var(--space-6) var(--side-padding)', borderBottom:'1px solid var(--client-line)', marginTop:'var(--space-4)' }}>
      <p className="fh-eyebrow" style={{ marginBottom:'var(--space-3)' }}>{ts('services', lang)}</p>
      <div style={{ display:'grid', gridTemplateColumns: bp === 'mobile' ? 'repeat(auto-fill, minmax(140px,1fr))' : 'repeat(auto-fill, minmax(160px,1fr))', gap:'var(--space-2)' }}>
        {visible.map(s => (
          <span key={s.id} className="fh-tap" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--fh-white)', border:'1px solid var(--client-secondary-soft)', borderRadius:'var(--radius-full)', padding:'9px 14px', fontSize:'var(--text-base)', color:'var(--fh-gray-700)', fontWeight:500 }}>
            <i className={`ti ${s.icon}`} style={{ fontSize:14, color:'var(--client-secondary-ink)' }} aria-hidden="true" />
            {t(s.label, lang)}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── SectionPreview ──────────────────────── */
function SectionPreview({ section, onClick, shade }) {
  const { lang } = useLang()
  const visibleCats = (section.categories || []).filter(c => c.visible).sort((a, b) => a.order - b.order).slice(0, 4)
  if (visibleCats.length === 0) return null
  return (
    <div style={{
      background: 'var(--client-bg-base)',
      padding:'30px var(--side-padding)',
      borderBottom:'1px solid var(--client-line)',
      position:'relative'
    }}>
      {/* Tout voir */}
      <button onClick={onClick} className="fh-tap fh-fade"
        style={{ position:'absolute', top:30, right:'var(--side-padding)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, color:'var(--client-secondary-ink)' }}>
        <span style={{ fontSize:12, fontWeight:600 }}>{ts('toutVoir', lang)}</span>
        <i className="ti ti-chevron-right" style={{ fontSize:14 }} aria-hidden="true" />
      </button>
      <h2 className="fh-display" style={{ fontSize:'var(--text-lg)', marginBottom:'var(--space-4)', paddingRight:80 }}>
        {t(section.navLabel, lang)}
      </h2>
      <div style={{ display:'grid', gridTemplateColumns: bp === 'mobile' ? '1fr 1fr' : 'repeat(4, 1fr)', gap:14 }}>
        {visibleCats.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 60}>
            <CategoryCard category={cat} onClick={onClick} shade={shade} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

/* ── CategoryCard ────────────────────────── */
function CategoryCard({ category, onClick, shade }) {
  const { lang } = useLang()
  const itemCount = (category.items || []).filter(i => i.visible).length
  const hasImg = !!category.coverImageUrl
  return (
    <div onClick={onClick} className="fh-tap fh-lift fh-zoom" style={{ cursor:'pointer', borderRadius:'var(--radius-md)', background: 'var(--client-primary-tint)' }}>
      {/* Zone image — coins arrondis, scrim, count */}
      <div style={{
        aspectRatio:'5/4',
        borderRadius:'var(--radius-md)',
        overflow:'hidden',
        position:'relative',
        background: hasImg ? '#111' : 'var(--client-tint)'
      }}>
        {hasImg ? (
          <img src={category.coverImageUrl} alt={t(category.name, lang)}
            className="fh-img" onLoad={e => e.currentTarget.classList.add('is-loaded')}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className={`ti ${category.icon || 'ti-map-pin'}`} style={{ fontSize:28, color:'var(--client-primary)', opacity:.55 }} aria-hidden="true" />
          </div>
        )}
        {/* Scrim bas */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 45%, rgba(0,0,0,.38))' }} />
        {/* Count en bas gauche — toujours affiché si items */}
        {itemCount > 0 && (
          <span className="fh-eyebrow" style={{
            position:'absolute', left:11, bottom:10,
            color:'rgba(255,255,255,.9)', fontSize:8,
            zIndex:1
          }}>
            {itemCount} adresse{itemCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      {/* Titre sous l'image avec gap */}
      <p style={{
        fontSize:'var(--text-md)', fontWeight:600,
        color:'var(--fh-ink)', marginTop:10, lineHeight:1.3
      }}>
        {t(category.name, lang)}
      </p>
    </div>
  )
}

/* ── RulesDrawer ─────────────────────────── */
function RulesDrawer({ title, content, onClose }) {
  const { lang } = useLang()
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:200, animation:'fh-fadein .2s ease' }} />
      <div style={{
        position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:'var(--max-width)',
        maxHeight:'80dvh', background:'var(--client-surface)',
        borderRadius:'var(--radius-xl) var(--radius-xl) 0 0',
        zIndex:201, display:'flex', flexDirection:'column',
        animation:'fh-slidein .25s ease'
      }}>
        <div style={{ width:36, height:4, background:'var(--client-line)', borderRadius:'var(--radius-full)', margin:'12px auto 4px' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px 14px', borderBottom:'1px solid var(--client-line)' }}>
          <h2 className="fh-display" style={{ fontSize:'var(--text-xl)' }}>{title}</h2>
          <button onClick={onClose} className="fh-tap"
            style={{ width:32, height:32, borderRadius:'var(--radius-full)', background:'var(--fh-sand-100)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-x" style={{ fontSize:16, color:'var(--fh-gray-700)' }} aria-hidden="true" />
          </button>
        </div>
        <div style={{ overflowY:'auto', padding:'var(--space-5)', flex:1, fontSize:'var(--text-md)', color:'var(--fh-gray-700)', lineHeight:1.75, whiteSpace:'pre-wrap' }}>
          {content}
        </div>
        <div style={{ height:'max(var(--space-5), env(safe-area-inset-bottom))' }} />
      </div>
      <style>{`
        @keyframes fh-fadein  { from { opacity:0 } to { opacity:1 } }
        @keyframes fh-slidein { from { transform:translateX(-50%) translateY(100%) } to { transform:translateX(-50%) translateY(0) } }
      `}</style>
    </>
  )
}


/* ── SelectionBlock ──────────────────────── */
function SelectionBlock({ selection, sections, navigate, bp }) {
  const { lang } = useLang()
  // Résoudre chaque référence { sectionId, categoryId, itemId } en objet item réel
  const resolved = (selection.items || [])
    .slice(0, 8)
    .map(ref => {
      const section  = sections.find(s => s.id === ref.sectionId)
      const category = section?.categories?.find(c => c.id === ref.categoryId)
      const item     = category?.items?.find(i => i.id === ref.itemId)
      if (!item || !item.visible) return null
      return { item, category, section, ref }
    })
    .filter(Boolean)

  if (resolved.length === 0) return null

  return (
    <div style={{
      background: 'var(--client-primary-tint)',
      padding: '30px var(--side-padding)',
      borderBottom: '1px solid var(--client-line)'
    }}>
      <h2 className="fh-display" style={{ fontSize:'var(--text-lg)', marginBottom:'var(--space-4)', paddingRight:80 }}>
        {t(selection.title, lang) || 'Notre sélection'}
      </h2>
      <div style={{ display:'grid', gridTemplateColumns: bp === 'mobile' ? '1fr 1fr' : 'repeat(4, 1fr)', gap:14 }}>
        {resolved.map(({ item, category, section, ref }, i) => (
          <Reveal key={`${ref.sectionId}-${ref.itemId}`} delay={i * 60}>
            <SelectionCard
              item={item}
              category={category}
              onClick={() => navigate(`/${ref.sectionId}/${ref.categoryId}/${ref.itemId}`)}
            />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

function SelectionCard({ item, category, onClick }) {
  const { lang } = useLang()
  const hasImg = !!item.imageUrl
  return (
    <div onClick={onClick} className="fh-tap fh-lift fh-zoom" style={{ cursor:'pointer', borderRadius:'var(--radius-md)', background:'var(--fh-sand-50)' }}>
      {/* Image */}
      <div style={{
        aspectRatio: '5/4',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        position: 'relative',
        background: hasImg ? '#111' : 'var(--client-tint)'
      }}>
        {hasImg ? (
          <img src={item.imageUrl} alt={t(item.name, lang)}
            className="fh-img" onLoad={e => e.currentTarget.classList.add('is-loaded')}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className={`ti ${category.icon || 'ti-star'}`} style={{ fontSize:28, color:'var(--client-primary)', opacity:.55 }} aria-hidden="true" />
          </div>
        )}
        {/* Scrim */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 45%, rgba(0,0,0,.38))' }} />
        {/* Catégorie en bas gauche */}
        <span className="fh-eyebrow" style={{
          position:'absolute', left:11, bottom:10,
          color:'rgba(255,255,255,.9)', fontSize:8, zIndex:1
        }}>
          {t(category.name, lang)}
        </span>
      </div>
      {/* Nom */}
      <p style={{ fontSize:'var(--text-md)', fontWeight:600, color:'var(--fh-ink)', marginTop:10, lineHeight:1.3 }}>
        {t(item.name, lang)}
      </p>
      {t(item.subtitle, lang) && (
        <p style={{ fontSize:'var(--text-sm)', color:'var(--fh-gray-400)', marginTop:3 }}>
          {t(item.subtitle, lang)}
        </p>
      )}
    </div>
  )
}

/* ── Reveal (IntersectionObserver) ──────── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); io.disconnect() }
    }, { threshold:.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={show ? 'fh-reveal' : ''} style={{ opacity: show ? 1 : 0, animationDelay:`${delay}ms` }}>
      {children}
    </div>
  )
}
