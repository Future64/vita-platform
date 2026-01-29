# 🤖 PROMPT COMPLET POUR CLAUDE CODE

Copie ce prompt entier dans Claude Code pour obtenir un résultat visuellement identique aux wireframes.

---

## CONTEXTE

Je développe VITA, une plateforme de gouvernance mondiale avec Next.js 14. Le projet est initialisé mais l'esthétique ne correspond pas encore aux wireframes HTML de référence.

**Fichiers de référence dans le projet :**
- `docs/VITA_Wireframes_Complete.html` — L'interface cible
- `docs/DESIGN_SYSTEM.md` — Toutes les spécifications CSS exactes

## PROBLÈME ACTUEL

L'interface actuelle a des problèmes de :
- Espacements incorrects
- Couleurs pas exactes
- Border-radius différents
- Layout pas conforme

## OBJECTIF

Rendre l'interface Next.js **VISUELLEMENT IDENTIQUE** aux wireframes HTML.

---

## SPÉCIFICATIONS CRITIQUES À RESPECTER

### 1. COULEURS THÈME SOMBRE (défaut)

```css
--bg-base: #0a0e1a;        /* Fond très sombre bleu-noir */
--bg-card: #111827;        /* Cartes */
--bg-elevated: #1e293b;    /* Inputs, tabs, items */
--border: rgba(255,255,255,0.06);
--border-light: rgba(255,255,255,0.1);
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--text-muted: #64748b;
```

### 2. ESPACEMENTS EXACTS

```
Card header: padding 1rem 1.25rem (py-4 px-5)
Card content: padding 1.25rem (p-5)
Main mobile: padding 1.25rem (p-5)
Main desktop: padding 2rem (p-8)
Sidebar width: 16rem (w-64)
Sidebar item: padding 0.75rem (p-3), gap 0.75rem
TopNav height: 4rem (h-16)
Gap entre items: 0.75rem (gap-3)
Gap entre sections: 1.25rem (gap-5)
```

### 3. BORDER-RADIUS

```
Cards principales: 1.25rem (rounded-xl, 20px)
Boutons/inputs: 0.75rem (rounded-lg, 12px)
Badges: 9999px (rounded-full, pill)
Stat cards: 1.25rem
Branch items: 1rem (16px)
```

### 4. COMPOSANTS

**Button Primary:**
- Background: `linear-gradient(135deg, #8b5cf6, #ec4899)`
- Padding: `0.625rem 1rem`
- Border-radius: `0.75rem`
- Font: `0.875rem`, weight 500
- Hover: `opacity 0.9`, `translateY(-1px)`

**Card:**
- Background: `var(--bg-card)` (#111827)
- Border: `1px solid var(--border)`
- Border-radius: `1.25rem`
- Hover: `border-color: var(--border-light)`

**Badge:**
- Font: `0.6875rem` (11px), weight 600
- Padding: `0.25rem 0.625rem`
- Background: couleur avec 15% opacité
- Ex violet: `rgba(139,92,246,0.15)` + `color: #8b5cf6`

**Input:**
- Height: `2.5rem` (40px)
- Background: `var(--bg-elevated)` (#1e293b)
- Border-radius: `0.75rem`
- Avec icône: `padding-left: 2.75rem`

**Sidebar Item:**
- Padding: `0.75rem`
- Border-radius: `0.75rem`
- Active: gradient primary + text white

**Nav Item (TopNav):**
- Padding: `0.5rem 0.875rem`
- Active: gradient primary + text white
- Icon: `1.125rem` (18px)

### 5. STAT CARDS AVEC GLOW

```css
.stat-card-violet {
  background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05));
  border: 1px solid rgba(139,92,246,0.2);
}
.stat-card-violet::before {
  /* Glow effect */
  position: absolute;
  top: 0; right: 0;
  width: 100px; height: 100px;
  filter: blur(40px);
  opacity: 0.3;
  background: #8b5cf6;
}
```

### 6. LAYOUT STRUCTURE

```
┌─────────────────────────────────────────────────────┐
│ TopNav (sticky, h-16, glass effect dark mode)       │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │  Main Content                            │
│ w-64     │  p-5 mobile, p-8 desktop                 │
│ hidden   │                                          │
│ mobile   │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 7. GRILLES

```css
/* Stats: 2 cols mobile, 4 cols desktop */
grid-cols-2 md:grid-cols-4 gap-4

/* Cards: 1 col mobile, 2 md, 3 lg */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

/* Main + sidebar: 1 col mobile, 2fr 1fr lg */
grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5
```

---

## TÂCHES À EFFECTUER

### ÉTAPE 1: Corriger le CSS global (src/app/globals.css)

Assure-toi que TOUTES les variables CSS sont présentes et correctes. Le fichier doit inclure :
- Variables de couleurs dark/light
- Classes utilitaires (.gradient-text, .stat-card-*, .diff-*, .timeline-*, etc.)
- Styles de base (scrollbar, selection, focus)

### ÉTAPE 2: Créer/Corriger les composants UI

Vérifie que chaque composant dans `src/components/ui/` utilise les bonnes valeurs :

**Button** — gradients, padding, radius, transitions
**Card** — bg-card, border subtle, radius-xl
**Badge** — 11px font, 15% opacity backgrounds
**Input** — h-10, bg-elevated, radius-lg
**Avatar** — gradients, tailles exactes
**Progress** — h-1.5, gradient bars
**Tabs** — bg-elevated container, radius-lg triggers

### ÉTAPE 3: Créer le Layout (src/components/layout/)

**TopNav.tsx:**
```tsx
// Height 4rem, sticky, glass effect en dark
// Logo: icône 36px avec gradient, texte gradient
// Nav items: padding 8px 14px, active = gradient bg
// Droite: theme toggle, notifications, avatar
```

**Sidebar.tsx:**
```tsx
// Width 16rem, bg-card, border-right
// Hidden en mobile (lg:block)
// Items: padding 12px, gap 12px, radius 12px
// Active: gradient bg, white text
```

**DashboardLayout.tsx:**
```tsx
// Wrapper: flex, min-h-[calc(100vh-4rem)]
// TopNav sticky top
// Sidebar + Main flex
```

### ÉTAPE 4: Créer les pages avec le design exact

Pour chaque page, utilise les composants correctement et respecte :
- Les espacements (gap-3 entre items, gap-5 entre sections)
- Les grilles (grid-main pour 2fr/1fr)
- Les cartes avec header/content séparés
- Les badges avec les bonnes couleurs
- Les stat-cards avec glow effect

### ÉTAPE 5: Vérification finale

Ouvre le HTML de référence (`docs/VITA_Wireframes_Complete.html`) dans un navigateur et compare visuellement avec ton app Next.js. Ils doivent être **identiques**.

---

## COMPOSANTS SPÉCIAUX À CRÉER

### StatCard (src/components/ui/stat-card.tsx)
```tsx
interface StatCardProps {
  variant: 'violet' | 'pink' | 'cyan' | 'green' | 'orange';
  label: string;
  value: string | number;
  trend?: { value: string; direction: 'up' | 'down' };
}
// Avec ::before pour le glow effect
```

### BranchItem (src/components/modules/forge/branch-item.tsx)
```tsx
// Icône carrée 36px avec bg coloré 15% opacity
// Texte + description
// Actions à droite
// Hover: bg-card-hover
```

### DiffViewer (src/components/modules/forge/diff-viewer.tsx)
```tsx
// Font mono 13px
// Lignes avec numéros à gauche (3rem width)
// .diff-add: bg vert 10%, border-left vert
// .diff-remove: bg rouge 10%, border-left rouge
```

### Timeline (src/components/ui/timeline.tsx)
```tsx
// Étapes horizontales avec icônes rondes 40px
// Connecteurs entre (height 2px)
// States: completed (vert), active (gradient), default (gris)
```

### VoteButtons (src/components/ui/vote-buttons.tsx)
```tsx
// Boutons avec border 2px
// Pour: border/text vert, hover bg vert 10%
// Contre: border/text rouge, hover bg rouge 10%
// Abstention: border gris
```

### WorldMap (src/components/modules/panorama/world-map.tsx)
```tsx
// SVG simplifié des continents
// Markers avec pulse animation
// Legend en position absolute bottom-left
// Stats en position absolute top-right
```

---

## EXEMPLE DE STRUCTURE DE PAGE

```tsx
// src/app/(dashboard)/agora/page.tsx
export default function AgoraPage() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Propositions</h1>
          <p className="text-sm text-muted">12 propositions actives</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Nouvelle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput placeholder="Rechercher..." className="flex-1 max-w-xs" />
        <Select>...</Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-5">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="voting">En vote</TabsTrigger>
          <TabsTrigger value="collab">Collaboratif</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      <div className="space-y-4">
        <ProposalCard ... />
        <ProposalCard ... />
      </div>
    </>
  );
}
```

---

## COMMANDES DE VÉRIFICATION

Après chaque modification, vérifie visuellement :

1. **Espacements** — Ouvre DevTools, inspecte les padding/margin
2. **Couleurs** — Compare les hex avec la spec
3. **Radius** — Vérifie visuellement les arrondis
4. **Responsive** — Teste mobile/tablet/desktop
5. **Thème** — Teste le toggle dark/light

---

## FICHIERS À MODIFIER/CRÉER (dans l'ordre)

1. `src/app/globals.css` — Compléter avec toutes les variables et classes
2. `src/components/ui/*.tsx` — Corriger les valeurs CSS
3. `src/components/layout/TopNav.tsx` — Créer
4. `src/components/layout/Sidebar.tsx` — Créer
5. `src/components/layout/MobileMenu.tsx` — Créer
6. `src/components/layout/DashboardLayout.tsx` — Créer
7. `src/app/(dashboard)/layout.tsx` — Utiliser DashboardLayout
8. `src/app/(dashboard)/agora/page.tsx` — Créer avec design exact
9. Continuer avec les autres modules...

---

Commence par lire le fichier `docs/DESIGN_SYSTEM.md` pour avoir toutes les spécifications, puis corrige le CSS global et les composants UI avant de créer le layout.
