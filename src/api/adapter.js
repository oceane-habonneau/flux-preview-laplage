/**
 * FLUXhub — Data Adapter v1.0
 *
 * Détecte automatiquement l'environnement :
 * - PHP disponible (OVH, hébergement classique) → save/load via API PHP
 * - Pas de PHP → localStorage + export/import JSON manuel
 *
 * Le front React n'a pas besoin de savoir lequel est utilisé.
 */

const API_PATH = './api/adapter.php'
const STORAGE_KEY = 'fluxhub_content'
const DATA_PATH = './data/content.json'

let _phpAvailable = null

/**
 * Vérifie si le backend PHP est disponible (testé une seule fois)
 */
async function checkPhpAvailable() {
  if (_phpAvailable !== null) return _phpAvailable
  try {
    const res = await fetch(API_PATH + '?action=ping', { method: 'GET' })
    const text = await res.text()
    _phpAvailable = text.trim() === 'pong'
  } catch {
    _phpAvailable = false
  }
  return _phpAvailable
}

/**
 * Charge le contenu de l'établissement
 * @returns {Promise<Object>} contenu JSON
 */
export async function loadContent() {
  const php = await checkPhpAvailable()

  if (php) {
    const res = await fetch(API_PATH + '?action=load')
    if (!res.ok) throw new Error('Erreur chargement PHP')
    return res.json()
  }

  // Fallback : localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try { return JSON.parse(stored) } catch { /* corrompu, on recharge */ }
  }

  // Premier lancement : charge le JSON initial
  const res = await fetch(DATA_PATH)
  if (!res.ok) throw new Error('Fichier content.json introuvable')
  const data = await res.json()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

/**
 * Sauvegarde le contenu
 * @param {Object} content
 * @returns {Promise<void>}
 */
export async function saveContent(content) {
  content.meta = {
    ...content.meta,
    lastUpdated: new Date().toISOString()
  }

  const php = await checkPhpAvailable()

  if (php) {
    const res = await fetch(API_PATH + '?action=save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', data: content })
    })
    if (!res.ok) throw new Error('Erreur sauvegarde PHP')
    return
  }

  // Fallback : localStorage + téléchargement automatique du JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  exportJson(content)
}

/**
 * Export JSON (mode sans PHP — pour que l'hôtelier sauvegarde manuellement)
 * @param {Object} content
 */
export function exportJson(content) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'content.json'
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Import JSON (mode sans PHP)
 * @returns {Promise<Object>} contenu importé
 */
export function importJson() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return reject(new Error('Aucun fichier'))
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        resolve(data)
      } catch {
        reject(new Error('Fichier JSON invalide'))
      }
    }
    input.click()
  })
}

/**
 * Indique si on est en mode PHP ou localStorage
 * @returns {Promise<'php'|'local'>}
 */
export async function getAdapterMode() {
  const php = await checkPhpAvailable()
  return php ? 'php' : 'local'
}
