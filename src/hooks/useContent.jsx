/**
 * FLUXhub — useContent hook
 * Point d'accès unique aux données dans toute l'app.
 * Utilise React Context pour éviter le prop drilling.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { computeTokens } from './colorEngine'
import { loadContent, saveContent as adapterSave, getAdapterMode } from '../api/adapter'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [adapterMode, setAdapterMode] = useState(null) // 'php' | 'local'

  // Chargement initial
  useEffect(() => {
    async function init() {
      try {
        const [data, mode] = await Promise.all([loadContent(), getAdapterMode()])
        setContent(data)
        setAdapterMode(mode)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Applique les CSS variables client via moteur OKLCH
  useEffect(() => {
    if (!content?.branding?.colors) return
    const { primary, secondary } = content.branding.colors
    if (!primary) return
    const tokens = computeTokens(primary, secondary || primary)
    const root = document.documentElement
    Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v))
  }, [content?.branding?.colors])

  // Sauvegarde
  const saveContent = useCallback(async (updatedContent) => {
    await adapterSave(updatedContent)
    setContent(updatedContent)
  }, [])

  // Mise à jour partielle (merge)
  const updateContent = useCallback(async (path, value) => {
    if (!content) return
    const updated = deepSet({ ...content }, path, value)
    await saveContent(updated)
  }, [content, saveContent])

  return (
    <ContentContext.Provider value={{
      content,
      loading,
      error,
      saving,
      adapterMode,
      saveContent,
      updateContent,
      setContent
    }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent doit être utilisé dans <ContentProvider>')
  return ctx
}

/**
 * Utilitaire : set imbriqué par chemin dot-notation
 * ex: deepSet(obj, 'establishment.phone', '0612...')
 */
function deepSet(obj, path, value) {
  const keys = path.split('.')
  const result = { ...obj }
  let current = result
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = { ...current[keys[i]] }
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
  return result
}
