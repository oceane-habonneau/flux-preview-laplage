import React from 'react'

/* ── Garde défensive — résout {fr,en} ou retourne la string ── */
function safeStr(val) {
  if (!val) return ''
  if (typeof val === 'object' && (val.fr !== undefined || val.en !== undefined)) return val.fr || val.en || ''
  return String(val)
}

/* ============================================
   FLUXhub Admin UI v2.0 — identité FLUX
   ============================================ */

export const HOTEL_ICONS = [
  { id:'ti-home',              label:'Hôtel' },
  { id:'ti-building',          label:'Bâtiment' },
  { id:'ti-map-pin',           label:'Localisation' },
  { id:'ti-phone',             label:'Téléphone' },
  { id:'ti-mail',              label:'Email' },
  { id:'ti-world',             label:'Site web' },
  { id:'ti-car',               label:'Voiture' },
  { id:'ti-bus',               label:'Bus / Transport' },
  { id:'ti-plane',             label:'Avion' },
  { id:'ti-sailboat',          label:'Bateau' },
  { id:'ti-anchor',            label:'Ancre / Mer' },
  { id:'ti-ripple',            label:'Eau / Kayak' },
  { id:'ti-droplet',           label:'Piscine / Eau' },
  { id:'ti-leaf',              label:'Nature / Spa' },
  { id:'ti-tree',              label:'Forêt' },
  { id:'ti-mountain',          label:'Montagne' },
  { id:'ti-sun',               label:'Soleil' },
  { id:'ti-fork',              label:'Restaurant' },
  { id:'ti-cup',               label:'Bar / Café' },
  { id:'ti-tools',             label:'Services' },
  { id:'ti-heart-rate-monitor',label:'Santé' },
  { id:'ti-building-hospital', label:'Hôpital' },
  { id:'ti-shield',            label:'Sécurité' },
  { id:'ti-info-circle',       label:'Informations' },
  { id:'ti-star',              label:'Favori' },
  { id:'ti-camera',            label:'Photo' },
  { id:'ti-bike',              label:'Vélo' },
  { id:'ti-walk',              label:'Randonnée' },
  { id:'ti-swimming-pool',     label:'Natation' },
  { id:'ti-horse-toy',         label:'Équitation' },
  { id:'ti-golf',              label:'Golf' },
  { id:'ti-friends',           label:'Famille' },
  { id:'ti-ticket',            label:'Activités' },
  { id:'ti-clock',             label:'Horaires' },
  { id:'ti-calendar',          label:'Agenda' },
  { id:'ti-wifi',              label:'Wi-Fi' },
  { id:'ti-parking',           label:'Parking' },
  { id:'ti-door',              label:'Accueil' },
  { id:'ti-key',               label:'Clé / Accès' },
  { id:'ti-beach',             label:'Plage' },
]

/* ── Label ────────────────────────────────── */
function Label({ children }) {
  return (
    <label style={{
      display: 'block',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '.18em',
      textTransform: 'uppercase',
      color: 'var(--flux-ink-mute)',
      marginBottom: 7
    }}>
      {children}
    </label>
  )
}

/* ── Field ────────────────────────────────── */
export function Field({ label, value, onChange, type='text', placeholder='', hint }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <Label>{safeStr(label)}</Label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', height:46,
          border:'1px solid #E4E1D8', borderRadius:12,
          padding:'0 14px',
          fontFamily:'var(--font-body)', fontSize:14,
          background:'var(--fh-white)', color:'var(--flux-ink)',
          outline:'none', transition:'border-color 140ms ease, box-shadow 140ms ease'
        }}
        onFocus={e => { e.target.style.borderColor='var(--flux-ink)'; e.target.style.boxShadow='0 0 0 3px rgba(22,21,15,.1)' }}
        onBlur={e => { e.target.style.borderColor='#E4E1D8'; e.target.style.boxShadow='none' }}
      />
      {hint && <p style={{ fontSize:11, color:'var(--flux-ink-mute)', marginTop:5, lineHeight:1.5 }}>{hint}</p>}
    </div>
  )
}

/* ── TextArea ─────────────────────────────── */
export function TextArea({ label, value, onChange, placeholder='', rows=5, hint }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <Label>{safeStr(label)}</Label>
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width:'100%', border:'1px solid #E4E1D8', borderRadius:12,
          padding:14, fontFamily:'var(--font-body)', fontSize:14,
          background:'var(--fh-white)', color:'var(--flux-ink)',
          outline:'none', resize:'vertical', lineHeight:1.65,
          transition:'border-color 140ms ease, box-shadow 140ms ease'
        }}
        onFocus={e => { e.target.style.borderColor='var(--flux-ink)'; e.target.style.boxShadow='0 0 0 3px rgba(22,21,15,.1)' }}
        onBlur={e => { e.target.style.borderColor='#E4E1D8'; e.target.style.boxShadow='none' }}
      />
      {hint && <p style={{ fontSize:11, color:'var(--flux-ink-mute)', marginTop:5, lineHeight:1.5 }}>{hint}</p>}
    </div>
  )
}

/* ── Toggle ───────────────────────────────── */
export function Toggle({ label, value, onChange, hint }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'12px 0', borderBottom:'1px solid var(--flux-line)'
    }}>
      <div>
        <p style={{ fontSize:14, color:'var(--flux-ink)', fontWeight:500 }}>{safeStr(label)}</p>
        {hint && <p style={{ fontSize:11, color:'var(--flux-ink-mute)', marginTop:2 }}>{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        style={{
          width:44, height:26, borderRadius:'var(--radius-full)',
          background: value ? 'var(--flux-ink)' : 'var(--fh-sand-300)',
          border:'none', cursor:'pointer', position:'relative',
          transition:'background 200ms ease', flexShrink:0
        }}
      >
        <span style={{
          position:'absolute', top:3,
          left: value ? 21 : 3,
          width:20, height:20, borderRadius:'50%', background:'#fff',
          transition:'left 200ms ease',
          boxShadow:'0 1px 3px rgba(0,0,0,.15)'
        }} />
      </button>
    </div>
  )
}

/* ── AdminCard ────────────────────────────── */
const TONE_COLORS = {
  mint:   { bg:'var(--flux-mint-bg)',   icon:'var(--flux-mint)'   },
  lav:    { bg:'var(--flux-lav-bg)',    icon:'var(--flux-lav)'    },
  amber:  { bg:'var(--flux-amber-bg)',  icon:'var(--flux-amber)'  },
  default:{ bg:'var(--flux-line)',      icon:'var(--flux-ink-mute)'},
}

export function AdminCard({ title, icon, tone='default', children, action }) {
  const t = TONE_COLORS[tone] || TONE_COLORS.default
  // Garde défensive
  const safeTitle = safeStr(title)
  return (
    <div style={{
      background:'var(--fh-white)',
      borderRadius: 'var(--radius-xl)',
      border:'1px solid var(--flux-line)',
      marginBottom: 'var(--space-4)',
      overflow:'hidden'
    }}>
      {title && (
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px 14px',
          borderBottom:'1px solid var(--flux-line)'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            {icon && (
              <div style={{
                width:32, height:32, borderRadius:'var(--radius-md)',
                background: t.bg,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
              }}>
                <i className={`ti ${icon}`} style={{ fontSize:16, color: t.icon }} aria-hidden="true" />
              </div>
            )}
            <p style={{
              fontFamily:'var(--flux-font-display)', fontWeight:600,
              fontSize:19, color:'var(--flux-ink)', lineHeight:1.1,
              letterSpacing:'normal', textTransform:'none'
            }}>
              {safeTitle}
            </p>
          </div>
          {action}
        </div>
      )}
      <div style={{ padding:'18px 20px' }}>{children}</div>
    </div>
  )
}

/* ── SaveButton ───────────────────────────── */
export function SaveButton({ onClick, saving, saved, adapterMode }) {
  const isPhp  = adapterMode === 'php'
  const label  = saving ? 'Sauvegarde…'
               : saved  ? (isPhp ? 'Sauvegardé !' : 'Téléchargé !')
               : isPhp  ? 'Sauvegarde automatique'
               :           'Télécharger la sauvegarde'
  const icon   = saving ? 'ti ti-loader'
               : saved  ? 'ti ti-check'
               : isPhp  ? 'ti ti-cloud-upload'
               :           'ti ti-download'

  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        width:'100%', height:48,
        background: saved ? 'var(--flux-mint)' : 'var(--flux-ink)',
        color:'#fff', border:'none',
        borderRadius:'var(--radius-full)',
        fontFamily:'var(--font-body)', fontSize:11,
        fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase',
        cursor: saving ? 'default' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'background 200ms ease',
        marginTop: 'var(--space-2)'
      }}
    >
      <i className={icon} style={{ fontSize:15, animation: saving ? 'fh-spin 1s linear infinite' : 'none' }} aria-hidden="true" />
      {safeStr(label)}
    </button>
  )
}

/* ── AddButton ────────────────────────────── */
export function AddButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:8,
        background:'var(--flux-lav-bg)',
        color:'var(--flux-lav)',
        border:'1px dashed rgba(106,90,208,.35)',
        borderRadius:'var(--radius-md)',
        padding:'11px 16px',
        fontFamily:'var(--font-body)', fontSize:13, fontWeight:600,
        cursor:'pointer', width:'100%', justifyContent:'center',
        transition:'background 140ms ease'
      }}
    >
      <i className="ti ti-plus" style={{ fontSize:14 }} aria-hidden="true" />
      {safeStr(label)}
    </button>
  )
}

/* ── DeleteButton ─────────────────────────── */
export function DeleteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width:30, height:30, borderRadius:'var(--radius-full)',
        background:'var(--flux-danger-bg)',
        border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
      }}
      aria-label="Supprimer"
    >
      <i className="ti ti-trash" style={{ fontSize:13, color:'var(--flux-danger)' }} aria-hidden="true" />
    </button>
  )
}

/* ── SectionDivider ───────────────────────── */
export function SectionDivider({ label }) {
  const safeLabel = safeStr(label)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0 16px' }}>
      <div style={{ flex:1, height:'1px', background:'var(--flux-line)' }} />
      <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.16em', textTransform:'uppercase', color:'var(--flux-ink-mute)', whiteSpace:'nowrap' }}>
        {safeLabel}
      </span>
      <div style={{ flex:1, height:'1px', background:'var(--flux-line)' }} />
    </div>
  )
}

/* ── IconPicker ───────────────────────────── */
export function IconPicker({ value, onChange }) {
  return (
    <div style={{ marginBottom:'var(--space-4)' }}>
      <Label>Icône</Label>
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(48px, 1fr))',
        gap:6, padding:12, background:'#FAFAF8',
        borderRadius:'var(--radius-md)', border:'1px solid var(--flux-line)',
        maxHeight:200, overflowY:'auto'
      }}>
        {HOTEL_ICONS.map(icon => (
          <button
            key={icon.id}
            onClick={() => onChange(icon.id)}
            title={icon.label}
            style={{
              width:48, height:48, borderRadius:'var(--radius-md)',
              border: value === icon.id ? '2px solid var(--flux-ink)' : '1px solid var(--flux-line)',
              background: value === icon.id ? '#F2F0EA' : 'var(--fh-white)',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 120ms ease'
            }}
          >
            <i className={`ti ${icon.id}`} style={{ fontSize:20, color: value === icon.id ? 'var(--flux-ink)' : 'var(--flux-ink-mute)' }} aria-hidden="true" />
          </button>
        ))}
      </div>
      {value && (
        <p style={{ fontSize:11, color:'var(--flux-ink-mute)', marginTop:5, display:'flex', alignItems:'center', gap:4 }}>
          <i className={`ti ${value}`} style={{ fontSize:13 }} aria-hidden="true" />
          {HOTEL_ICONS.find(i => i.id === value)?.label || value}
        </p>
      )}
    </div>
  )
}

/* ── ImageField ───────────────────────────── */
export function ImageField({ label, value, onChange, hint }) {
  label = safeStr(label)
  return (
    <div style={{ marginBottom:'var(--space-4)' }}>
      <Label>{safeStr(label)}</Label>
      <input
        type="url"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="https://… ou /data/image.jpg"
        style={{
          width:'100%', height:46, border:'1px solid #E4E1D8', borderRadius:12,
          padding:'0 14px', fontFamily:'var(--font-body)', fontSize:14,
          background:'var(--fh-white)', color:'var(--flux-ink)', outline:'none',
          transition:'border-color 140ms ease, box-shadow 140ms ease'
        }}
        onFocus={e => { e.target.style.borderColor='var(--flux-ink)'; e.target.style.boxShadow='0 0 0 3px rgba(22,21,15,.1)' }}
        onBlur={e => { e.target.style.borderColor='#E4E1D8'; e.target.style.boxShadow='none' }}
      />
      {value && (
        <div style={{ marginTop:8, borderRadius:'var(--radius-md)', overflow:'hidden', height:100, background:'var(--flux-line)' }}>
          <img src={value} alt="Aperçu" onError={e => { e.target.style.display='none' }}
            style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      )}
      {hint && <p style={{ fontSize:11, color:'var(--flux-ink-mute)', marginTop:5 }}>{hint}</p>}
    </div>
  )
}

/* ── MultiContactField ────────────────────── */
export function MultiContactField({ label, items, onChange, type='tel', placeholder }) {
  label = safeStr(label)
  function add() {
    onChange([...items, { id:`item_${Date.now()}`, label:'', value:'', visible:true }])
  }
  function update(id, field, val) {
    onChange(items.map(i => i.id === id ? { ...i, [field]:val } : i))
  }
  function remove(id) {
    onChange(items.filter(i => i.id !== id))
  }

  return (
    <div style={{ marginBottom:'var(--space-4)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
        <Label>{safeStr(label)}</Label>
        <button onClick={add} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--flux-lav)', fontSize:12, fontFamily:'var(--font-body)', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
          <i className="ti ti-plus" style={{ fontSize:13 }} aria-hidden="true" /> Ajouter
        </button>
      </div>
      {items.map(item => (
        <div key={item.id} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8, padding:10, background:'#FAFAF8', borderRadius:'var(--radius-md)', border:'1px solid var(--flux-line)' }}>
          <BiField
            label=""
            value={item.label}
            onChange={v => update(item.id,'label',v)}
            placeholder="Label"
          />
          <input type={type} value={item.value} onChange={e => update(item.id,'value',e.target.value)}
            placeholder={placeholder} style={{ flex:1, height:36, border:'1px solid #E4E1D8', borderRadius:8, padding:'0 10px', fontFamily:'var(--font-body)', fontSize:13, background:'var(--fh-white)', color:'var(--flux-ink)', outline:'none' }} />
          <button onClick={() => update(item.id,'visible',!item.visible)} title={item.visible ? 'Visible':'Masqué'}
            style={{ width:32, height:32, borderRadius:'var(--radius-full)', background: item.visible ? 'var(--flux-lav-bg)':'var(--flux-line)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className={item.visible ? 'ti ti-eye':'ti ti-eye-off'} style={{ fontSize:14, color: item.visible ? 'var(--flux-lav)':'var(--flux-ink-mute)' }} aria-hidden="true" />
          </button>
          <DeleteButton onClick={() => remove(item.id)} />
        </div>
      ))}
      {items.length === 0 && (
        <p style={{ fontSize:12, color:'var(--flux-ink-mute)', padding:'8px 0' }}>Aucun — cliquez sur Ajouter.</p>
      )}
    </div>
  )
}

/* ── BiField — champ bilingue FR/EN ──────── */
export function BiField({ label, value, onChange, placeholder='', hint, rows }) {
  const [tab, setTab] = React.useState('fr')
  const normalized = value && typeof value === 'object' ? value : { fr: value || '', en: '' }
  const [val, setVal] = React.useState(normalized)

  // Sync si la valeur externe change (ex: reset)
  React.useEffect(() => {
    const n = value && typeof value === 'object' ? value : { fr: value || '', en: '' }
    setVal(n)
  }, [JSON.stringify(value)])

  function update(lang, text) {
    const next = { ...val, [lang]: text }
    setVal(next)
    onChange(next)
  }
  function copyToEn() {
    const next = { ...val, en: val.fr }
    setVal(next)
    onChange(next)
  }
  const isTextarea = !!rows
  const inputStyle = {
    width:'100%', border:'1px solid #E4E1D8', borderRadius:12,
    padding: isTextarea ? 14 : '0 14px', height: isTextarea ? 'auto' : 46,
    fontFamily:'var(--font-body)', fontSize:14, background:'var(--fh-white)',
    color:'var(--flux-ink)', outline:'none', resize: isTextarea ? 'vertical' : 'none',
    lineHeight: isTextarea ? 1.65 : 'normal',
  }
  return (
    <div style={{ marginBottom:'var(--space-4)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
        <label style={{ fontSize:10, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--flux-ink-mute)' }}>{label}</label>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button
            onClick={() => setTab(tab === 'fr' ? 'en' : 'fr')}
            style={{
              fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
              padding:'3px 10px', borderRadius:6,
              background:'#000', color:'#fff',
              border:'2px solid #000', cursor:'pointer', fontFamily:'var(--font-body)'
            }}
          >
            {tab === 'fr' ? 'FR → EN' : 'EN → FR'}
          </button>
          <button
            onClick={copyToEn}
            style={{
              fontSize:10, fontWeight:600, background:'none', color:'#000',
              border:'1px solid #ccc', borderRadius:6,
              padding:'3px 7px', cursor:'pointer', fontFamily:'var(--font-body)'
            }}
          >Copier FR</button>
        </div>
      </div>
      {isTextarea ? (
        <textarea value={val[tab] || ''} onChange={e => update(tab, e.target.value)}
          placeholder={placeholder} rows={rows} style={inputStyle}
          onFocus={e => { e.target.style.borderColor='var(--flux-ink)'; e.target.style.boxShadow='0 0 0 3px rgba(22,21,15,.1)' }}
          onBlur={e => { e.target.style.borderColor='#E4E1D8'; e.target.style.boxShadow='none' }} />
      ) : (
        <input type="text" value={val[tab] || ''} onChange={e => update(tab, e.target.value)}
          placeholder={placeholder} style={inputStyle}
          onFocus={e => { e.target.style.borderColor='var(--flux-ink)'; e.target.style.boxShadow='0 0 0 3px rgba(22,21,15,.1)' }}
          onBlur={e => { e.target.style.borderColor='#E4E1D8'; e.target.style.boxShadow='none' }} />
      )}
      {tab === 'en' && !val.en && val.fr && (
        <p style={{ fontSize:11, color:'var(--flux-amber)', marginTop:4 }}>Traduction EN manquante</p>
      )}
      {hint && <p style={{ fontSize:11, color:'var(--flux-ink-mute)', marginTop:5 }}>{hint}</p>}
    </div>
  )
}
