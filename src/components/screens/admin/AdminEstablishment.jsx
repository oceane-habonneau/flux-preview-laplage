import { useState, useCallback } from 'react'
import { useContent } from '../../../hooks/useContent'
import { Field, TextArea, Toggle, AdminCard, SaveButton, SectionDivider, AddButton, DeleteButton, MultiContactField, IconPicker , BiField } from '../../ui/AdminUI'

export default function AdminEstablishment() {
  const { content, saveContent, adapterMode } = useContent()
  const [local, setLocal]   = useState(() => content ? structuredClone(content.establishment) : null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  if (!content || !local) return null

  const set = useCallback((path, value) => {
    setLocal(prev => deepSet({ ...prev }, path, value))
    setSaved(false)
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await saveContent({ ...content, establishment: local })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  // Services
  function addService() {
    set('services', [...(local.services || []), { id: `s_${Date.now()}`, icon: 'ti-star', label: '', visible: true }])
  }
  function updateService(id, field, value) {
    set('services', local.services.map(s => s.id === id ? { ...s, [field]: value } : s))
  }
  function removeService(id) {
    set('services', local.services.filter(s => s.id !== id))
  }

  // Horaires
  function addSchedule() {
    set('schedules', [...(local.schedules || []), { id: `sch_${Date.now()}`, label: '', value: '', visible: true }])
  }
  function updateSchedule(id, field, value) {
    set('schedules', local.schedules.map(s => s.id === id ? { ...s, [field]: value } : s))
  }
  function removeSchedule(id) {
    set('schedules', local.schedules.filter(s => s.id !== id))
  }

  return (
    <div>
      <PageHeader eyebrow="Configuration du livret" title="Établissement" />
      {/* Identité */}
      <AdminCard title="Identité" icon="ti-building" tone="mint">
        <Field label="Nom de l'établissement" value={local.name} onChange={v => set('name', v)} placeholder="Résidence La Plage" />
        <Field label="Adresse" value={local.address} onChange={v => set('address', v)} placeholder="Route de Porto Pollo, 20113 Olmeto" />
        <Field label="Site web" value={local.website} onChange={v => set('website', v)} type="url" placeholder="https://www.hotel.com" />
        <Toggle label="Afficher le site web" value={local.websiteVisible} onChange={v => set('websiteVisible', v)} />
      </AdminCard>

      {/* Contact multi */}
      <AdminCard title="Téléphones" icon="ti-phone" tone="lav">
        <MultiContactField
          label="Numéros de téléphone"
          items={local.phones || []}
          onChange={v => set('phones', v)}
          type="tel"
          placeholder="+33 6 12 58 11 02"
        />
      </AdminCard>

      <AdminCard title="Emails" icon="ti-mail" tone="lav">
        <MultiContactField
          label="Adresses email"
          items={local.emails || []}
          onChange={v => set('emails', v)}
          type="email"
          placeholder="contact@hotel.com"
        />
      </AdminCard>

      {/* Horaires check-in/out */}
      <AdminCard title="Horaires arrivée / départ" icon="ti-clock" tone="amber">
        <Field label="Check-in" value={local.checkin} onChange={v => set('checkin', v)} placeholder="16:00" />
        <Toggle label="Afficher le check-in" value={local.checkinVisible} onChange={v => set('checkinVisible', v)} />
        <SectionDivider label="Départ" />
        <Field label="Check-out" value={local.checkout} onChange={v => set('checkout', v)} placeholder="11:00" />
        <Toggle label="Afficher le check-out" value={local.checkoutVisible} onChange={v => set('checkoutVisible', v)} />
      </AdminCard>

      {/* Horaires services */}
      <AdminCard
        title="Horaires services" icon="ti-calendar" tone="amber"
        action={<InlineAdd onClick={addSchedule} />}
      >
        {(local.schedules || []).map(sch => (
          <div key={sch.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10, padding: 10, background: '#FAFAF8', borderRadius: 'var(--radius-md)', border: '1px solid var(--flux-line)' }}>
            <div style={{ flex: 1 }}>
              <BiField label="Label" value={sch.label} onChange={v => updateSchedule(sch.id, 'label', v)} placeholder="Piscine" />
              <Field label="Horaire" value={sch.value} onChange={v => updateSchedule(sch.id, 'value', v)} placeholder="8h00 – 21h00" />
              <Toggle label="Visible" value={sch.visible} onChange={v => updateSchedule(sch.id, 'visible', v)} />
            </div>
            <DeleteButton onClick={() => removeSchedule(sch.id)} />
          </div>
        ))}
        {(local.schedules || []).length === 0 && <Empty />}
        <AddButton label="Ajouter un horaire" onClick={addSchedule} />
      </AdminCard>

      {/* Wi-Fi */}
      <AdminCard title="Wi-Fi" icon="ti-wifi" tone="mint">
        <Toggle label="Afficher le Wi-Fi" value={local.wifiVisible} onChange={v => set('wifiVisible', v)} />
        {local.wifiVisible && (
          <>
            <SectionDivider label="Identifiants" />
            <Field label="Nom du réseau (SSID)" value={local.wifiNetwork} onChange={v => set('wifiNetwork', v)} placeholder="HotelGuests" />
            <Field label="Mot de passe" value={local.wifiPassword} onChange={v => set('wifiPassword', v)} placeholder="Laisser vide si réseau ouvert" />
          </>
        )}
      </AdminCard>

      {/* Services */}
      <AdminCard title="Services & équipements" icon="ti-star" tone="lav" action={<InlineAdd onClick={addService} />}>
        {(local.services || []).map(svc => (
          <div key={svc.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, padding: 10, background: '#FAFAF8', borderRadius: 'var(--radius-md)', border: '1px solid var(--flux-line)' }}>
            <div style={{ flex: 1 }}>
              <BiField label="Label" value={svc.label} onChange={v => updateService(svc.id, 'label', v)} placeholder="Piscine privée" />
              <IconPicker value={svc.icon} onChange={v => updateService(svc.id, 'icon', v)} />
              <Toggle label="Visible" value={svc.visible} onChange={v => updateService(svc.id, 'visible', v)} />
            </div>
            <DeleteButton onClick={() => removeService(svc.id)} />
          </div>
        ))}
        <AddButton label="Ajouter un service" onClick={addService} />
      </AdminCard>

      {/* Règlement */}
      <AdminCard title="Règlement intérieur" icon="ti-scroll" tone="amber">
        <Toggle label="Afficher le règlement" value={local.rulesVisible} onChange={v => set('rulesVisible', v)} hint="Un bouton apparaîtra sur l'accueil si activé" />
        {local.rulesVisible && (
          <>
            <SectionDivider label="Contenu" />
            <BiField label="Titre" value={local.rulesTitle} onChange={v => set('rulesTitle', v)} placeholder="Règlement intérieur" />
            <BiField label="Texte du règlement" value={local.rulesContent} onChange={v => set('rulesContent', v)} placeholder="Saisissez ici le règlement intérieur complet…" rows={12} hint="Pas de limite de caractères. Retours à la ligne conservés." />
          </>
        )}
      </AdminCard>

      <SaveButton onClick={handleSave} saving={saving} saved={saved} adapterMode={adapterMode} />
    </div>
  )
}

function InlineAdd({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--flux-lav)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
      <i className="ti ti-plus" style={{ fontSize: 13 }} aria-hidden="true" /> Ajouter
    </button>
  )
}

function Empty() {
  return <p style={{ fontSize: 12, color: 'var(--flux-ink-mute)', textAlign: 'center', padding: '12px 0' }}>Aucun élément. Cliquez sur Ajouter.</p>
}

function deepSet(obj, path, value) {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...current[keys[i]] }
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
  return obj
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
