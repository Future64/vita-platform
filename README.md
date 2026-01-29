# VITA — Plateforme de Gouvernance Mondiale

## 🎯 Vision

VITA est une plateforme révolutionnaire de gouvernance mondiale où chaque être humain reçoit une unité monétaire (1 Ѵ) par jour vécu.

## 🏗️ Structure

```
vita-platform/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   └── (dashboard)/        # Layout groupe pour le dashboard
│   │       ├── agora/          # Propositions, votes
│   │       ├── codex/          # Constitution, lois
│   │       ├── forge/          # Versioning Git-like
│   │       ├── civis/          # Profil, portefeuille
│   │       └── panorama/       # Dashboard global
│   ├── components/
│   │   ├── ui/                 # ✅ Composants UI de base
│   │   ├── layout/             # TopNav, Sidebar, MobileMenu
│   │   └── modules/            # Composants par module
│   ├── lib/utils.ts            # ✅ Utilitaire cn()
│   └── types/index.ts          # ✅ Types TypeScript
├── tailwind.config.ts          # ✅ Configuration Tailwind
└── globals.css                 # ✅ Variables CSS thème
```

## 🎨 Design System

**Couleurs** : Violet (#8b5cf6), Pink (#ec4899), Cyan (#06b6d4), Green (#10b981), Orange (#f97316)

**Thème sombre (défaut)** : bg-base #0a0e1a, bg-card #111827

## 🚀 Démarrage

```bash
npm install
npm run dev
```

---

# 🤖 PROMPT POUR CLAUDE CODE

Ouvre Claude Code dans le dossier du projet et colle ce prompt :

```
Je développe VITA, une plateforme de gouvernance mondiale avec Next.js 14. 

## ÉTAT ACTUEL
- TypeScript, Tailwind CSS configurés
- Composants UI : Button, Card, Badge, Input, Avatar, Progress, Tabs (src/components/ui/)
- Types TypeScript définis (src/types/index.ts)
- CSS global avec thème clair/sombre (src/app/globals.css)

## À CRÉER

### 1. LAYOUT (src/components/layout/)

**TopNav.tsx** :
- Logo VITA (Ѵ gradient violet→pink)
- Nav horizontale : Agora, Codex, Forge, Civis, Panorama
- Toggle thème soleil/lune
- Notifications avec badge
- Avatar utilisateur
- Menu hamburger mobile

**Sidebar.tsx** :
- Props: items (icon, label, badge?, active?, href?)
- Items avec icônes Lucide
- Badges colorés optionnels
- Visible desktop, cachée mobile

**MobileMenu.tsx** :
- Overlay sombre blur
- Panel latéral navigation
- Fermeture clic extérieur

**DashboardLayout.tsx** :
- TopNav sticky
- Sidebar + Main content responsive

### 2. AGORA (src/app/(dashboard)/agora/)

**page.tsx** - Liste propositions :
- Header + bouton "Nouvelle"
- Recherche + filtres
- Tabs: Toutes, En vote, Collaboratif
- Cartes : badges, titre, auteur, barre vote, %

**[id]/page.tsx** - Détail :
- Timeline : Doléance → Proposition → Vote → Adoption
- Contenu article + diff
- Vote Pour/Contre/Abstention + countdown

### 3. CODEX (src/app/(dashboard)/codex/)

**page.tsx** - Constitution :
- Arborescence fichiers (file-tree)
- Modifications récentes

**laws/page.tsx** - Lois :
- Liste avec badges code/statut

**articles/[id]/page.tsx** :
- Sub-tabs : Texte, Modifications, Historique
- Sections article-block

### 4. FORGE (src/app/(dashboard)/forge/)

**page.tsx** - Projets :
- Grid cartes avec badges type/statut
- Stats branches/commits

**[projectId]/page.tsx** - Branches :
- Liste avec icône, nom mono, stats
- Actions Voir/Diff/Merge

**[projectId]/commits/page.tsx** :
- Timeline verticale
- Hash, message, auteur, votes

**[projectId]/mr/[mrId]/page.tsx** - Merge Request :
- Merge indicator vert/jaune
- Vote fusion + countdown + règles

**[projectId]/diff/page.tsx** :
- Lignes +/- colorées
- Commentaires

### 5. CIVIS (src/app/(dashboard)/civis/)

**page.tsx** - Profil :
- Avatar XL, stats (jours, participation)
- Score fiabilité

**wallet/page.tsx** :
- Solde total (stat-card violet)
- Transactions + sources

### 6. PANORAMA (src/app/(dashboard)/panorama/)

**page.tsx** :
- Carte monde SVG avec marqueurs
- 4 stat-cards : Citoyens, Masse Ѵ, Tx/jour, Projets
- Votes actifs, Projets récents

### 7. DONNÉES MOCK (src/lib/mock-data.ts)

Utilisateurs, propositions, documents, projets, transactions réalistes.

### 8. HOOKS

- useTheme() : toggle dark/light + localStorage
- useMockData() : accès données

## STYLE

- Composants UI existants dans src/components/ui/
- Icônes : lucide-react
- Mode sombre défaut (data-theme="dark")
- Cards arrondies, gradients violet/pink
- Stat-cards avec glow effect
- Diff viewer style GitHub

Commence par DashboardLayout (TopNav + Sidebar), puis page d'accueil redirigeant vers /agora.
```

---

## 📦 Composants UI Disponibles

| Composant | Variants |
|-----------|----------|
| Button | primary, secondary, ghost, voteFor, voteAgainst |
| Card | Card, CardHeader, CardTitle, CardContent |
| Badge | violet, pink, cyan, green, orange, red, yellow |
| Input | default, with icon (SearchInput) |
| Avatar | sm, md, lg, xl + colors |
| Progress | default, cyan, green, orange |
| VoteBar | votesFor, votesAgainst |
| Tabs | Tabs, TabsList, TabsTrigger, SubTabs |
