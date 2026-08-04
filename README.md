# FLUXhub

Livret d'accueil digital pour hôtels et résidences de vacances.  
Webapp React mobile-first, personnalisable via JSON, déployable sur tout hébergement.

---

## Sommaire

1. [Concept](#concept)
2. [Stack technique](#stack-technique)
3. [Structure du projet](#structure-du-projet)
4. [Installation](#installation)
5. [Configuration d'un établissement](#configuration-dun-établissement)
6. [Déploiement OVH (PHP)](#déploiement-ovh-php)
7. [Déploiement sans PHP](#déploiement-sans-php)
8. [Personnalisation visuelle](#personnalisation-visuelle)
9. [Architecture des données](#architecture-des-données)
10. [Back-office admin](#back-office-admin)
11. [Roadmap sessions](#roadmap-sessions)

---

## Concept

FLUXhub est un produit blanc : une seule codebase, autant d'instances que d'établissements.  
Chaque instance est configurée par un fichier `content.json` qui contient l'intégralité du contenu et de la charte graphique. Le code ne change jamais — seul le JSON change.

**Principe clé :** tout champ non rempli = invisible côté client. L'hôtelier active ou désactive chaque élément sans toucher au code.

---

## Stack technique

| Outil | Rôle |
|---|---|
| React 18 | UI et routing |
| React Router v6 | Navigation entre écrans |
| Vite | Bundler et dev server |
| CSS custom properties | Design tokens + thème client |
| PHP 8.x (optionnel) | Sauvegarde JSON côté serveur |
| localStorage (fallback) | Sauvegarde si pas de PHP |

Aucune base de données. Aucun framework CSS externe. Aucune dépendance cloud obligatoire.

---

## Structure du projet

```
fluxhub/
├── public/
│   ├── data/
│   │   └── content.json          ← données de l'établissement
│   ├── api/
│   │   └── adapter.php           ← backend PHP (optionnel)
│   └── index.html
├── src/
│   ├── design-tokens.css         ← source of truth visuelle
│   ├── main.jsx
│   ├── App.jsx                   ← routing principal
│   ├── api/
│   │   └── adapter.js            ← détection PHP / localStorage
│   ├── hooks/
│   │   └── useContent.jsx        ← context global données
│   └── components/
│       ├── layout/
│       │   ├── AppShell.jsx      ← shell app + loading
│       │   └── NavBar.jsx        ← navbar bottom dynamique
│       ├── screens/
│       │   ├── ScreenHome.jsx    ← accueil (session 3)
│       │   ├── ScreenSection.jsx ← liste catégories (session 4)
│       │   ├── ScreenCategory.jsx← liste rubriques (session 4)
│       │   ├── ScreenItem.jsx    ← détail rubrique (session 4)
│       │   └── ScreenAdmin.jsx   ← back-office (sessions 6-7)
│       └── ui/                   ← composants réutilisables
└── package.json
```

---

## Installation

```bash
# Cloner ou décompresser l'archive
cd fluxhub

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Builder pour la production
npm run build
# → génère /dist à déposer sur le serveur
```

---

## Configuration d'un établissement

Tout le contenu est dans `public/data/content.json`.  
Pour créer une nouvelle instance (nouvel hôtel) :

1. Dupliquer le dossier `fluxhub/`
2. Modifier `public/data/content.json` avec les informations de l'établissement
3. Déposer `logo.png` et `hero.jpg` dans `public/data/`
4. Builder et déployer

### Champs obligatoires minimaux

```json
{
  "branding": {
    "name": "Nom de l'établissement",
    "colors": {
      "primary": "#1B3A5C",
      "secondary": "#C9A96E"
    }
  },
  "establishment": {
    "address": "...",
    "checkin": "16:00",
    "checkout": "11:00"
  },
  "sections": []
}
```

---

## Déploiement OVH (PHP)

**Prérequis :** hébergement OVH avec PHP 8.x (mutualisé ou VPS).

```
1. npm run build
2. Uploader le contenu de /dist/ via FTP à la racine du domaine
3. Uploader public/api/adapter.php → /api/adapter.php sur le serveur
4. Vérifier que /data/content.json est accessible en écriture (chmod 664)
5. Dans adapter.php, définir ADMIN_PASSWORD_HASH (sha256 du mot de passe admin)
```

**Test de fonctionnement :**  
Ouvrir `https://votre-domaine.fr/api/adapter.php?action=ping` → doit répondre `pong`.

**Sauvegarde :** chaque modification admin écrit directement dans `content.json` côté serveur. Sauvegardes automatiques recommandées via cron OVH (copie quotidienne du fichier).

---

## Déploiement sans PHP

Compatible Vercel, Netlify, GitHub Pages, ou tout hébergement de fichiers statiques.

```
1. npm run build
2. Déployer /dist/
```

En l'absence de PHP, l'adapter bascule automatiquement sur **localStorage**.  
Le contenu est stocké dans le navigateur de l'administrateur.

**Important :** en mode localStorage, utiliser le bouton **Exporter JSON** dans le back-office après chaque modification, puis remplacer manuellement `public/data/content.json` et redéployer pour que les changements soient visibles par les clients.

---

## Personnalisation visuelle

La charte graphique est définie dans `content.json` sous `branding.colors` :

```json
"colors": {
  "primary":        "#1B3A5C",
  "primaryDark":    "#0F2340",
  "primaryLight":   "#E8EEF4",
  "secondary":      "#C9A96E",
  "secondaryLight": "#F7F2EA"
}
```

Ces valeurs sont injectées automatiquement comme CSS custom properties au chargement de l'app. Aucune modification du code n'est nécessaire.

**Ce qui est fixe (identité FLUXhub) :**
- Typographie : Cormorant Garamond (titres) + Inter (corps)
- Espacements et rayons
- Fond app `#F7F5F2`
- Structure des écrans

**Ce qui est personnalisable par établissement :**
- Couleur primaire et secondaire
- Logo
- Photo hero
- Nom, adresse, contacts
- Toutes les sections, catégories, rubriques

---

## Architecture des données

### Principe "visible si rempli"

Chaque champ a son booléen `visible` associé :

```json
"phone": "+33612581102",
"phoneVisible": true
```

Si `phoneVisible` est `false`, le champ n'apparaît pas côté client, même si une valeur est renseignée. L'hôtelier peut ainsi préparer du contenu sans le publier.

### Hiérarchie des données

```
Établissement
└── Sections (Alentours / Transport / Contact)
    └── Catégories (Location bateau / Taxis / Urgences...)
        └── Rubriques (LocaValincu / Pompiers...)
            ├── nom, sous-titre, description
            ├── téléphone + visible
            ├── site web + visible
            ├── lien Google Maps + visible
            └── image + visible
```

Sections, catégories et rubriques ont toutes un champ `order` (entier) pour contrôler l'ordre d'affichage, et `visible` pour les masquer sans les supprimer.

---

## Back-office admin

Accessible sur `/admin` — protégé par mot de passe.

**Fonctionnalités prévues (sessions 6-7) :**
- Édition de la fiche établissement (nom, contacts, horaires, services)
- Gestion des sections : ajout / suppression / réordonnement
- Gestion des catégories : ajout / suppression / réordonnement / image
- Gestion des rubriques : tous les champs + toggles visibilité
- Personnalisation couleurs et logo
- Règlement intérieur (texte long, scroll)
- Indicateur mode sauvegarde (PHP temps réel / localStorage + export)

**L'hôtelier n'a jamais accès au code.** Il interagit uniquement avec cette interface.

---

## Roadmap sessions

| Session | Contenu | Statut |
|---|---|---|
| 1 | Design tokens, structure JSON, adapter, routing | ✅ Fait |
| 2 | ScreenHome — Accueil complet | ✅ Fait |
| 3 | ScreenSection + ScreenCategory + ScreenItem | ✅ Fait |
| 4 | Back-office complet — Auth, Établissement, Sections, Apparence | ✅ Fait |
| 5 | Back-office Partie 1 — Auth + fiche + catégories | ⏳ |
| 6 | Back-office Partie 2 — Images, couleurs, toggles | ⏳ |
| 7 | Build, déploiement OVH, tests, duplication 2e livret | ⏳ |

---

## Crédits

Développé par **Océane Habonneau** — conseil en technologie hôtelière.  
Produit FLUXhub — tous droits réservés.
