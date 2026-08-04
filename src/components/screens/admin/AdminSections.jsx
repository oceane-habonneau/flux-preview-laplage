import { useState, useCallback } from 'react'
import { useContent } from '../../../hooks/useContent'
import { Field, TextArea, Toggle, AdminCard, SaveButton, AddButton, DeleteButton, SectionDivider, IconPicker, ImageField , BiField } from '../../ui/AdminUI'

const MAX_MENU_SLOTS = 3  // + Accueil fixe = 4 total

export default function AdminSections() {
  const { content, saveContent, adapterMode } = useContent()
  const [local, setLocal]       = useState(() => content ? structuredClone(content.sections) : null)
  const [openSection, setOpenSection]   = useState(null)
  const [openCategory, setOpenCategory] = useState(null)
  const [openItem, setOpenItem]         = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  if (!content || !local) return null

  const menuCount = local.filter(s => s.inMenu).length

  const update = useCallback((updater) => {
    setLocal(prev => updater(structuredClone(prev)))
    setSaved(false)
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await saveContent({ ...content, sections: local })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  // Toggle inMenu avec limite 3
  function toggleInMenu(id) {
    update(prev => prev.map(s => {
      if (s.id !== id) return s
      if (s.inMenu) return { ...s, inMenu: false }          // désactiver toujours OK
      if (menuCount >= MAX_MENU_SLOTS) return s              // bloquer si déjà 3
      return { ...s, inMenu: true }
    }))
  }

  // Sections CRUD
  function addSection() {
    update(prev => [...prev, { id: `sec_${Date.now()}`, navLabel: '', navIcon: 'ti-map-pin', visible: true, inMenu: false, order: prev.length + 1, categories: [] }])
  }
  function updateSection(id, field, value) {
    update(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }
  function removeSection(id) {
    if (!confirm('Supprimer cette section et tout son contenu ?')) return
    update(prev => prev.filter(s => s.id !== id))
    if (openSection === id) setOpenSection(null)
  }
  function moveSection(id, dir) {
    update(prev => {
      const idx = prev.findIndex(s => s.id === id)
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }

  // Catégories CRUD
  function addCategory(sectionId) {
    const section = local.find(s => s.id === sectionId)
    const cat = { id: `cat_${Date.now()}`, name: '', icon: 'ti-star', coverImageUrl: '', visible: true, order: (section?.categories?.length || 0) + 1, items: [] }
    update(prev => prev.map(s => s.id === sectionId ? { ...s, categories: [...(s.categories || []), cat] } : s))
  }
  function moveCategory(sectionId, catId, dir) {
    update(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      const cats = [...s.categories]
      const idx = cats.findIndex(c => c.id === catId)
      const swap = idx + dir
      if (swap < 0 || swap >= cats.length) return s
      ;[cats[idx], cats[swap]] = [cats[swap], cats[idx]]
      return { ...s, categories: cats.map((c, i) => ({ ...c, order: i + 1 })) }
    }))
  }

  function moveItem(sectionId, catId, itemId, dir) {
    update(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      return {
        ...s, categories: s.categories.map(cat => {
          if (cat.id !== catId) return cat
          const items = [...cat.items]
          const idx = items.findIndex(i => i.id === itemId)
          const swap = idx + dir
          if (swap < 0 || swap >= items.length) return cat
          ;[items[idx], items[swap]] = [items[swap], items[idx]]
          return { ...cat, items: items.map((i, n) => ({ ...i, order: n + 1 })) }
        })
      }
    }))
  }

  function updateCategory(sectionId, catId, field, value) {
    update(prev => prev.map(s => s.id === sectionId
      ? { ...s, categories: s.categories.map(c => c.id === catId ? { ...c, [field]: value } : c) }
      : s
    ))
  }
  function removeCategory(sectionId, catId) {
    if (!confirm('Supprimer cette catégorie et toutes ses rubriques ?')) return
    update(prev => prev.map(s => s.id === sectionId
      ? { ...s, categories: s.categories.filter(c => c.id !== catId) }
      : s
    ))
    if (openCategory === catId) setOpenCategory(null)
  }

  // Rubriques CRUD
  function addItem(sectionId, catId) {
    const section = local.find(s => s.id === sectionId)
    const cat = section?.categories?.find(c => c.id === catId)
    const item = {
      id: `item_${Date.now()}`, name: '', subtitle: '', description: '',
      phone: '', phoneVisible: false, email: '', emailVisible: false,
      website: '', websiteVisible: false, mapUrl: '', mapVisible: false,
      imageUrl: '', visible: true, order: (cat?.items?.length || 0) + 1
    }
    update(prev => prev.map(s => s.id === sectionId
      ? { ...s, categories: s.categories.map(c => c.id === catId ? { ...c, items: [...(c.items || []), item] } : c) }
      : s
    ))
  }
  function updateItem(sectionId, catId, itemId, field, value) {
    update(prev => prev.map(s => s.id === sectionId
      ? { ...s, categories: s.categories.map(c => c.id === catId
          ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
          : c
        )}
      : s
    ))
  }
  function removeItem(sectionId, catId, itemId) {
    update(prev => prev.map(s => s.id === sectionId
      ? { ...s, categories: s.categories.map(c => c.id === catId
          ? { ...c, items: c.items.filter(i => i.id !== itemId) }
          : c
        )}
      : s
    ))
  }

  const sections = [...local].sort((a, b) => a.order - b.order)

  return (
    <div>
      <PageHeader eyebrow="Configuration du livret" title="Sections" />

      {/* Notre sélection — fixe */}
      <SelectionAdmin />

      {/* Info navbar */}
      <div style={{ background: 'var(--flux-lav-bg)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="ti ti-info-circle" style={{ fontSize: 16, color: 'var(--flux-lav)', flexShrink: 0 }} aria-hidden="true" />
        <p style={{ fontSize: 12, color: 'var(--flux-lav)', lineHeight: 1.5 }}>
          <strong>Menu :</strong> Accueil est toujours fixe. Vous pouvez afficher <strong>{MAX_MENU_SLOTS} sections</strong> supplémentaires dans le menu ({menuCount}/{MAX_MENU_SLOTS} utilisés). Les autres apparaissent dans <strong>Autres</strong>.
        </p>
      </div>

      {sections.map((section, secIdx) => {
        const isSecOpen = openSection === section.id
        const categories = [...(section.categories || [])].sort((a, b) => a.order - b.order)

        return (
          <AdminCard key={section.id}>
            {/* En-tête section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isSecOpen ? 16 : 0 }}>
              {/* Flèches ordre */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <OrderBtn onClick={() => moveSection(section.id, -1)} icon="ti-chevron-up" disabled={secIdx === 0} />
                <OrderBtn onClick={() => moveSection(section.id, 1)} icon="ti-chevron-down" disabled={secIdx === sections.length - 1} />
              </div>

              {/* Icône + nom */}
              <div style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setOpenSection(isSecOpen ? null : section.id)}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--flux-lav-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${section.navIcon || 'ti-map-pin'}`} style={{ fontSize: 17, color: 'var(--flux-mint)' }} aria-hidden="true" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fh-ink)' }}>
                    {(section.navLabel?.fr || section.navLabel?.en || '') || <span style={{ color: 'var(--fh-gray-400)' }}>Sans nom</span>}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--fh-gray-400)' }}>{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Radio menu */}
              <button
                onClick={() => toggleInMenu(section.id)}
                disabled={!section.inMenu && menuCount >= MAX_MENU_SLOTS}
                title={section.inMenu ? 'Dans le menu' : menuCount >= MAX_MENU_SLOTS ? 'Menu complet (3/3)' : 'Afficher dans le menu'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: section.inMenu ? 'var(--flux-ink)' : 'var(--fh-sand-100)',
                  border: section.inMenu ? 'none' : '0.5px solid var(--fh-sand-300)',
                  cursor: (!section.inMenu && menuCount >= MAX_MENU_SLOTS) ? 'not-allowed' : 'pointer',
                  opacity: (!section.inMenu && menuCount >= MAX_MENU_SLOTS) ? 0.4 : 1,
                  transition: 'all var(--transition-fast)',
                  flexShrink: 0
                }}
              >
                <i
                  className={section.inMenu ? 'ti ti-layout-navbar' : 'ti ti-layout-navbar-inactive'}
                  style={{ fontSize: 13, color: section.inMenu ? '#fff' : 'var(--fh-gray-500)' }}
                  aria-hidden="true"
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: section.inMenu ? '#fff' : 'var(--fh-gray-500)', whiteSpace: 'nowrap' }}>
                  {section.inMenu ? 'Dans le menu' : 'Autres'}
                </span>
              </button>

              <Toggle label="" value={section.visible} onChange={v => updateSection(section.id, 'visible', v)} />
              <DeleteButton onClick={() => removeSection(section.id)} />
              <i className={`ti ${isSecOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 16, color: 'var(--fh-gray-400)', cursor: 'pointer' }} onClick={() => setOpenSection(isSecOpen ? null : section.id)} aria-hidden="true" />
            </div>

            {/* Détail section */}
            {isSecOpen && (
              <div style={{ borderTop: '1px solid var(--flux-line)', paddingTop: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <BiField label="Label menu" value={section.navLabel?.fr || section.navLabel?.en || ''} onChange={v => updateSection(section.id, 'navLabel', v)} placeholder="Alentours" />
                  </div>
                </div>
                <IconPicker value={section.navIcon} onChange={v => updateSection(section.id, 'navIcon', v)} />

                <SectionDivider label={`Catégories (${categories.length})`} />

                {categories.map((cat, catIdx) => {
                  const isCatOpen = openCategory === cat.id
                  const items = [...(cat.items || [])].sort((a, b) => a.order - b.order)

                  return (
                    <div key={cat.id} style={{ background: '#FAF9F6', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 10, border: '1px solid var(--flux-line)' }}>
                      {/* En-tête catégorie */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          <OrderBtn onClick={() => moveCategory(section.id, cat.id, -1)} icon="ti-chevron-up" disabled={catIdx === 0} />
                          <OrderBtn onClick={() => moveCategory(section.id, cat.id, 1)} icon="ti-chevron-down" disabled={catIdx === categories.length - 1} />
                        </div>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => {
                            setOpenSection(section.id)
                            setOpenCategory(isCatOpen ? null : cat.id)
                          }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--flux-ink)' }}>
                            {(cat.name?.fr || cat.name?.en || '') || <span style={{ color: 'var(--flux-ink-mute)' }}>Nouvelle catégorie</span>}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--flux-ink-mute)' }}>{items.length} rubrique{items.length !== 1 ? 's' : ''}</p>
                        </div>
                        <Toggle label="" value={cat.visible} onChange={v => updateCategory(section.id, cat.id, 'visible', v)} />
                        <DeleteButton onClick={() => removeCategory(section.id, cat.id)} />
                        <i className={`ti ${isCatOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 14, color: 'var(--flux-ink-mute)', cursor: 'pointer' }} onClick={() => setOpenCategory(isCatOpen ? null : cat.id)} aria-hidden="true" />
                      </div>

                      {/* Détail catégorie */}
                      {isCatOpen && (
                        <div style={{ borderTop: '1px solid var(--flux-line)', marginTop: 12, paddingTop: 12 }}>
                          <BiField label="Nom" value={cat.name} onChange={v => updateCategory(section.id, cat.id, 'name', v)} placeholder="Location bateau" />
                          <IconPicker value={cat.icon} onChange={v => updateCategory(section.id, cat.id, 'icon', v)} />
                          <ImageField label="Image de couverture" value={cat.coverImageUrl} onChange={v => updateCategory(section.id, cat.id, 'coverImageUrl', v)} hint="Affichée en header de la catégorie" />

                          <SectionDivider label={`Rubriques (${items.length})`} />

                          {items.map((item, itemIdx) => {
                            const isItemOpen = openItem === item.id
                            return (
                              <div key={item.id} style={{ background: 'var(--fh-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--flux-line)', padding: 12, marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                                    <OrderBtn onClick={() => moveItem(section.id, cat.id, item.id, -1)} icon="ti-chevron-up" disabled={itemIdx === 0} />
                                    <OrderBtn onClick={() => moveItem(section.id, cat.id, item.id, 1)} icon="ti-chevron-down" disabled={itemIdx === items.length - 1} />
                                  </div>
                                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setOpenItem(isItemOpen ? null : item.id)}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--flux-ink)' }}>
                                      {(item.name?.fr || item.name?.en || '') || <span style={{ color: 'var(--flux-ink-mute)' }}>Nouvelle rubrique</span>}
                                    </p>
                                    {(item.subtitle?.fr || item.subtitle?.en || '') && <p style={{ fontSize: 11, color: 'var(--flux-ink-mute)' }}>{item.subtitle?.fr || item.subtitle?.en || ''}</p>}
                                  </div>
                                  <Toggle label="" value={item.visible} onChange={v => updateItem(section.id, cat.id, item.id, 'visible', v)} />
                                  <DeleteButton onClick={() => removeItem(section.id, cat.id, item.id)} />
                                  <i className={`ti ${isItemOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 13, color: 'var(--flux-ink-mute)', cursor: 'pointer' }} onClick={() => setOpenItem(isItemOpen ? null : item.id)} aria-hidden="true" />
                                </div>

                                {isItemOpen && (
                                  <div style={{ borderTop: '1px solid var(--flux-line)', marginTop: 12, paddingTop: 12 }}>
                                    <BiField label="Nom" value={item.name} onChange={v => updateItem(section.id, cat.id, item.id, 'name', v)} placeholder="LocaValincu" />
                                    <BiField label="Sous-titre" value={item.subtitle} onChange={v => updateItem(section.id, cat.id, item.id, 'subtitle', v)} placeholder="Propriano" />
                                    <BiField label="Description" value={item.description} onChange={v => updateItem(section.id, cat.id, item.id, 'description', v)} placeholder="Courte description…" rows={3} />
                                    <ImageField label="Photo de la rubrique" value={item.imageUrl} onChange={v => updateItem(section.id, cat.id, item.id, 'imageUrl', v)} />

                                    <SectionDivider label="Contact" />
                                    <Field label="Téléphone" value={item.phone} onChange={v => updateItem(section.id, cat.id, item.id, 'phone', v)} type="tel" placeholder="+33 4 95 …" />
                                    <Toggle label="Afficher téléphone" value={item.phoneVisible} onChange={v => updateItem(section.id, cat.id, item.id, 'phoneVisible', v)} />
                                    <Field label="Email" value={item.email} onChange={v => updateItem(section.id, cat.id, item.id, 'email', v)} type="email" placeholder="contact@…" />
                                    <Toggle label="Afficher email" value={item.emailVisible} onChange={v => updateItem(section.id, cat.id, item.id, 'emailVisible', v)} />
                                    <Field label="Site web" value={item.website} onChange={v => updateItem(section.id, cat.id, item.id, 'website', v)} type="url" placeholder="https://…" />
                                    <Toggle label="Afficher site web" value={item.websiteVisible} onChange={v => updateItem(section.id, cat.id, item.id, 'websiteVisible', v)} />
                                    <Field label="Lien Google Maps" value={item.mapUrl} onChange={v => updateItem(section.id, cat.id, item.id, 'mapUrl', v)} type="url" placeholder="https://maps.google.com/…" />
                                    <Toggle label="Afficher sur la carte" value={item.mapVisible} onChange={v => updateItem(section.id, cat.id, item.id, 'mapVisible', v)} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          <AddButton label="Ajouter une rubrique" onClick={() => addItem(section.id, cat.id)} />
                        </div>
                      )}
                    </div>
                  )
                })}
                <AddButton label="Ajouter une catégorie" onClick={() => addCategory(section.id)} />
              </div>
            )}
          </AdminCard>
        )
      })}

      <AddButton label="Ajouter une section" onClick={addSection} />
      <div style={{ marginTop: 16 }}>
        <SaveButton onClick={handleSave} saving={saving} saved={saved} adapterMode={adapterMode} />
      </div>
    </div>
  )
}

function OrderBtn({ onClick, icon, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 22, height: 22, borderRadius: 4, background: disabled ? 'transparent' : 'var(--fh-sand-100)', border: '1px solid var(--flux-line)', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 11, color: 'var(--fh-gray-700)' }} aria-hidden="true" />
    </button>
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

/* ── SelectionAdmin ────────────────────────
   Bloc fixe "Notre sélection" dans l'admin.
   Non supprimable. Max 8 rubriques.
   ─────────────────────────────────────────── */
function SelectionAdmin() {
  const { content, saveContent, adapterMode } = useContent()
  const [localSel, setLocalSel] = useState(() =>
    content ? structuredClone(content.selection || { title:'Notre sélection', visible:true, items:[] }) : null
  )
  const [search, setSearch]     = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  if (!content || !localSel) return null

  // Construire la liste plate de toutes les rubriques pour la recherche
  const allItems = []
  ;(content.sections || []).forEach(section => {
    ;(section.categories || []).forEach(cat => {
      ;(cat.items || []).filter(i => i.visible).forEach(item => {
        allItems.push({ item, category: cat, section })
      })
    })
  })

  // Filtrer par recherche
  const filtered = search.length >= 1
    ? allItems.filter(({ item, category, section }) =>
        [item.name?.fr||item.name, item.subtitle?.fr||item.subtitle, category.name?.fr||category.name, section.navLabel?.fr||section.navLabel]
          .join(' ').toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8)
    : []

  // Vérifier si une rubrique est déjà sélectionnée
  function isSelected(item, cat, section) {
    return localSel.items.some(r => r.itemId === item.id && r.categoryId === cat.id && r.sectionId === section.id)
  }

  function addItem(item, cat, section) {
    if (localSel.items.length >= 8) return
    if (isSelected(item, cat, section)) return
    setLocalSel(prev => ({
      ...prev,
      items: [...prev.items, { sectionId: section.id, categoryId: cat.id, itemId: item.id }]
    }))
    setSearch('')
    setShowPicker(false)
    setSaved(false)
  }

  function removeItem(idx) {
    setLocalSel(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
    setSaved(false)
  }

  function moveItem(idx, dir) {
    const next = [...localSel.items]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setLocalSel(prev => ({ ...prev, items: next }))
    setSaved(false)
  }

  // Résoudre les références en objets lisibles
  function resolve(ref) {
    const section  = content.sections.find(s => s.id === ref.sectionId)
    const category = section?.categories?.find(c => c.id === ref.categoryId)
    const item     = category?.items?.find(i => i.id === ref.itemId)
    return { section, category, item }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveContent({ ...content, selection: localSel })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: 'var(--fh-white)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--flux-line)',
      marginBottom: 'var(--space-4)',
      overflow: 'visible'
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 14px', borderBottom:'1px solid var(--flux-line)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <div style={{ width:32, height:32, borderRadius:'var(--radius-md)', background:'var(--flux-mint-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ti ti-star" style={{ fontSize:16, color:'var(--flux-mint)' }} aria-hidden="true" />
          </div>
          <div>
            <p style={{ fontFamily:'var(--flux-font-display)', fontWeight:600, fontSize:19, color:'var(--flux-ink)', lineHeight:1.1, letterSpacing:'normal', textTransform:'none' }}>
              Notre sélection
            </p>
            <p style={{ fontSize:11, color:'var(--flux-ink-mute)', marginTop:2 }}>Section fixe — non supprimable</p>
          </div>
        </div>
        {/* Toggle visible */}
        <button
          onClick={() => { setLocalSel(prev => ({ ...prev, visible: !prev.visible })); setSaved(false) }}
          role="switch" aria-checked={localSel.visible}
          style={{ width:44, height:26, borderRadius:'var(--radius-full)', background: localSel.visible ? 'var(--flux-ink)' : 'var(--fh-sand-300)', border:'none', cursor:'pointer', position:'relative', transition:'background 200ms ease', flexShrink:0 }}
        >
          <span style={{ position:'absolute', top:3, left: localSel.visible ? 21 : 3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 200ms ease', boxShadow:'0 1px 3px rgba(0,0,0,.15)' }} />
        </button>
      </div>

      <div style={{ padding:'18px 20px' }}>
        {/* Titre modifiable */}
        <div style={{ marginBottom:'var(--space-4)' }}>
          <label style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--flux-ink-mute)', marginBottom:7 }}>
            Titre de la section
          </label>
          <BiField
            label=""
            value={localSel.title}
            onChange={v => { setLocalSel(prev => ({ ...prev, title: v })); setSaved(false) }}
            placeholder="Notre sélection"
          />
        </div>

        {/* Rubriques sélectionnées */}
        <label style={{ display:'block', fontSize:10, fontWeight:600, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--flux-ink-mute)', marginBottom:10 }}>
          Rubriques ({localSel.items.length}/8)
        </label>

        {localSel.items.map((ref, idx) => {
          const { section, category, item } = resolve(ref)
          if (!item) return (
            <div key={idx} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--flux-danger-bg)', borderRadius:'var(--radius-md)', marginBottom:6 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize:14, color:'var(--flux-danger)' }} aria-hidden="true" />
              <span style={{ fontSize:12, color:'var(--flux-danger)', flex:1 }}>Rubrique supprimée</span>
              <DeleteButton onClick={() => removeItem(idx)} />
            </div>
          )
          return (
            <div key={idx} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'#FAF9F6', border:'1px solid var(--flux-line)', borderRadius:'var(--radius-md)', marginBottom:6 }}>
              {/* Ordre */}
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} style={{ width:20, height:20, borderRadius:4, background: idx === 0 ? 'transparent' : 'var(--fh-sand-100)', border:'1px solid var(--flux-line)', cursor: idx === 0 ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: idx === 0 ? .3 : 1 }}>
                  <i className="ti ti-chevron-up" style={{ fontSize:10, color:'var(--flux-ink-mute)' }} aria-hidden="true" />
                </button>
                <button onClick={() => moveItem(idx, 1)} disabled={idx === localSel.items.length - 1} style={{ width:20, height:20, borderRadius:4, background: idx === localSel.items.length - 1 ? 'transparent' : 'var(--fh-sand-100)', border:'1px solid var(--flux-line)', cursor: idx === localSel.items.length - 1 ? 'default' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: idx === localSel.items.length - 1 ? .3 : 1 }}>
                  <i className="ti ti-chevron-down" style={{ fontSize:10, color:'var(--flux-ink-mute)' }} aria-hidden="true" />
                </button>
              </div>
              {/* Infos */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--flux-ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name?.fr || item.name?.en || ''}</p>
                <p style={{ fontSize:11, color:'var(--flux-ink-mute)' }}>{section?.navLabel?.fr || section?.navLabel?.en || ''} › {category?.name?.fr || category?.name?.en || ''}</p>
              </div>
              <DeleteButton onClick={() => removeItem(idx)} />
            </div>
          )
        })}

        {/* Picker recherche */}
        {localSel.items.length < 8 && (
          <div style={{ position:'relative', marginTop: localSel.items.length > 0 ? 8 : 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'var(--flux-lav-bg)', border:'1px dashed rgba(106,90,208,.35)', borderRadius:'var(--radius-md)', cursor:'text' }}
              onClick={() => { setShowPicker(true) }}>
              <i className="ti ti-search" style={{ fontSize:15, color:'var(--flux-lav)', flexShrink:0 }} aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowPicker(true) }}
                onFocus={() => setShowPicker(true)}
                placeholder="Rechercher une rubrique…"
                style={{ background:'none', border:'none', outline:'none', fontFamily:'var(--font-body)', fontSize:13, color:'var(--flux-ink)', width:'100%' }}
              />
            </div>

            {/* Dropdown résultats */}
            {showPicker && (search.length >= 1) && (
              <div style={{
                position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
                background:'var(--fh-white)', border:'1px solid var(--flux-line)',
                borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-float)',
                zIndex:50, maxHeight:240, overflowY:'auto'
              }}>
                {filtered.length === 0 && (
                  <p style={{ fontSize:12, color:'var(--flux-ink-mute)', padding:'12px 14px' }}>Aucun résultat</p>
                )}
                {filtered.map(({ item, category, section }) => {
                  const already = isSelected(item, category, section)
                  return (
                    <div
                      key={item.id}
                      onClick={() => !already && addItem(item, category, section)}
                      style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'10px 14px',
                        background: already ? 'var(--flux-lav-bg)' : 'none',
                        cursor: already ? 'default' : 'pointer',
                        borderBottom:'1px solid var(--flux-line)',
                        opacity: already ? .6 : 1
                      }}
                    >
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:'var(--flux-ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name?.fr || item.name?.en || ''}</p>
                        <p style={{ fontSize:11, color:'var(--flux-ink-mute)' }}>{section.navLabel?.fr || section.navLabel?.en || ''} › {category.name?.fr || category.name?.en || ''}</p>
                      </div>
                      {already
                        ? <i className="ti ti-check" style={{ fontSize:14, color:'var(--flux-lav)', flexShrink:0 }} aria-hidden="true" />
                        : <i className="ti ti-plus" style={{ fontSize:14, color:'var(--flux-lav)', flexShrink:0 }} aria-hidden="true" />
                      }
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Fermer picker si clic hors */}
        {showPicker && <div onClick={() => setShowPicker(false)} style={{ position:'fixed', inset:0, zIndex:49 }} />}

        <div style={{ marginTop:16 }}>
          <SaveButton onClick={handleSave} saving={saving} saved={saved} adapterMode={adapterMode} />
        </div>
      </div>
    </div>
  )
}
