import { useState, useContext, createContext } from 'react'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('lang') === 'en' ? 'en' : 'fr'
  })
  const toggle = () => setLang(l => l === 'fr' ? 'en' : 'fr')
  return (
    <LangContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang doit être dans <LangProvider>')
  return ctx
}

/**
 * Résout un champ bilingue { fr, en } selon la langue active
 * Fallback sur fr si en est vide
 */
export function t(field, lang = 'fr') {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang] || field.fr || ''
}

/**
 * Traductions statiques — textes en dur dans le code
 */
const STATIC = {
  fr: {
    infosSejour:    'Infos séjour',
    services:       'Services & équipements',
    autresSections: 'Autres sections',
    apartirDe:      'à partir de',
    avant:          'avant',
    consulter:      'Consulter',
    toutVoir:       'Tout voir',
    retourA:        'Retour à',
    adresse:        'adresse',
    adresses:       'adresses',
    introuvable:    'Cette page est introuvable.',
    aucunContenu:   "Aucun contenu disponible pour l'instant.",
    appeler:        'Appeler',
    voirSurLaCarte: 'Voir sur la carte',
    ouvrirGoogleMaps: 'Ouvrir Google Maps',
    siteWeb:        'Site web',
    envoyerEmail:   'Envoyer un email',
    accueil:        'Accueil',
    autres:         'Autres',
  },
  en: {
    infosSejour:    'Stay info',
    services:       'Services & amenities',
    autresSections: 'More sections',
    apartirDe:      'from',
    avant:          'before',
    consulter:      'Read',
    toutVoir:       'See all',
    retourA:        'Back to',
    adresse:        'address',
    adresses:       'addresses',
    introuvable:    'This page could not be found.',
    aucunContenu:   'No content available yet.',
    appeler:        'Call',
    voirSurLaCarte: 'View on map',
    ouvrirGoogleMaps: 'Open Google Maps',
    siteWeb:        'Website',
    envoyerEmail:   'Send an email',
    accueil:        'Home',
    autres:         'More',
  }
}

export function ts(key, lang = 'fr') {
  return STATIC[lang]?.[key] || STATIC.fr[key] || key
}
