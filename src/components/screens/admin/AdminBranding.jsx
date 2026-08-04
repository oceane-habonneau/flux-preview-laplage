import { useState } from 'react'
import { useContent } from '../../../hooks/useContent'
import { Field, AdminCard, SaveButton, SectionDivider, ImageField , BiField } from '../../ui/AdminUI'

export default function AdminBranding() {
  const { content, saveContent, adapterMode } = useContent()
  const [local, setLocal]   = useState(() => content ? structuredClone(content.branding) : null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  if (!content || !local) return null

  function set(path, value) {
    setLocal(prev => {
      const next = { ...prev }
      if (path.includes('.')) {
        const [k1, k2] = path.split('.')
        next[k1] = { ...next[k1], [k2]: value }
      } else {
        next[path] = value
      }
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveContent({ ...content, branding: local })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const colors = local.colors || {}

  return (
    <div>
      <PageHeader eyebrow="Configuration du livret" title="Apparence" />

      {/* Textes du hero */}
      <AdminCard title="Textes affichés sur l'accueil" icon="ti-typography" tone="lav">
        <BiField
          label="Nom affiché (ligne 1 du hero)"
          value={local.tagline}
          onChange={v => set('tagline', v)}
          placeholder="Olmeto · Corse du Sud"
          hint="Affiché en petit au-dessus du titre principal"
        />
        <BiField
          label="Titre principal du hero"
          value={local.heroTitle}
          onChange={v => set('heroTitle', v)}
          placeholder="Bienvenue dans votre villa"
          hint="Grand titre affiché sur la photo d'accueil"
        />
        <Field
          label="Nom de l'établissement (logo alternatif)"
          value={local.name}
          onChange={v => set('name', v)}
          placeholder="Résidence La Plage"
        />
      </AdminCard>

      {/* Photos */}
      <AdminCard title="Images" icon="ti-photo" tone="mint">
        <ImageField
          label="Logo (PNG fond transparent recommandé)"
          value={local.logoUrl}
          onChange={v => set('logoUrl', v)}
          hint="Affiché en haut à gauche du hero. Format PNG transparent."
        />
        <SectionDivider label="Photo d'accueil" />
        <ImageField
          label="Photo hero (fond de l'écran d'accueil)"
          value={local.heroImageUrl}
          onChange={v => set('heroImageUrl', v)}
          hint="Format paysage recommandé — minimum 1200×600px"
        />
      </AdminCard>

      {/* Couleurs */}
      <AdminCard title="Couleurs" icon="ti-palette" tone="amber">
        <p style={{ fontSize: 12, color: 'var(--fh-gray-400)', marginBottom: 16, lineHeight: 1.6 }}>
          Choisissez 1 couleur principale (obligatoire). Les teintes claires et sombres sont calculées automatiquement. La couleur secondaire est optionnelle.
        </p>

        <ColorRow
          label="Couleur principale"
          hint="Utilisée pour la navbar, les boutons et les icônes actifs"
          value={colors.primary}
          onChange={v => set('colors.primary', v)}
        />

        <SectionDivider label="Secondaire (optionnelle)" />
        <p style={{ fontSize: 11, color: 'var(--fh-gray-400)', marginBottom: 12, lineHeight: 1.5 }}>
          Laissez vide si vous n'en avez pas besoin.
        </p>
        <ColorRow
          label="Couleur secondaire"
          hint="Accent décoratif — or, sable, terracotta…"
          value={colors.secondary}
          onChange={v => set('colors.secondary', v)}
        />

        {/* Aperçu calculé */}
        {colors.primary && (
          <>
            <SectionDivider label="Aperçu généré" />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {[
                { bg: colors.primary,                          label: 'Principale' },
                { bg: adjustColor(colors.primary, -20),        label: 'Sombre' },
                { bg: adjustColor(colors.primary, 75),         label: 'Claire' },
                ...(colors.secondary ? [
                  { bg: colors.secondary,                      label: 'Secondaire' },
                  { bg: adjustColor(colors.secondary, 75),     label: 'Sec. claire' },
                ] : [])
              ].map(({ bg, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: bg, border: '0.5px solid var(--fh-sand-200)', marginBottom: 3 }} />
                  <p style={{ fontSize: 10, color: 'var(--fh-gray-400)' }}>{label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </AdminCard>

      <SaveButton onClick={handleSave} saving={saving} saved={saved} adapterMode={adapterMode} />
    </div>
  )
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function ColorRow({ label, hint, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <input
        type="color"
        value={value || '#000000'}
        onChange={e => onChange(e.target.value)}
        style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', border: '1px solid var(--flux-line)', cursor: 'pointer', padding: 2, background: 'var(--fh-white)', flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fh-ink)', marginBottom: 2 }}>{label}</p>
        {hint && <p style={{ fontSize: 11, color: 'var(--fh-gray-400)' }}>{hint}</p>}
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="#000000"
        maxLength={7}
        style={{ width: 90, height: 36, border: '1px solid var(--flux-line)', borderRadius: 'var(--radius-md)', padding: '0 8px', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', color: 'var(--fh-ink)', background: 'var(--fh-white)', outline: 'none' }}
      />
    </div>
  )
}


function PageHeader({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:'.22em', textTransform:'uppercase', color:'var(--flux-ink-mute)', marginBottom:6 }}>
        ✦ &nbsp;{eyebrow}
      </p>
      <h1 style={{ fontFamily:'var(--flux-font-display)', fontWeight:600, fontSize:36, color:'var(--flux-ink)', lineHeight:1.05 }}>
        {title}
      </h1>
    </div>
  )
}
