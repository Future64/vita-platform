# 🎨 VITA Design System — Spécifications Exactes

Ce document contient TOUTES les spécifications visuelles à respecter pour que le projet Next.js soit identique aux wireframes HTML.

---

## 📐 ESPACEMENTS (SPACING)

```css
/* Padding/Margin standards */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */

/* Card padding */
card-header: padding: 1rem 1.25rem;        /* py-4 px-5 */
card-content: padding: 1.25rem;            /* p-5 */

/* Main content */
main-mobile: padding: 1.25rem;             /* p-5 */
main-tablet: padding: 1.5rem;              /* p-6 */
main-desktop: padding: 2rem;               /* p-8 */

/* Gaps */
gap-items: 0.75rem;                        /* gap-3 */
gap-sections: 1.25rem;                     /* gap-5 */
gap-cards: 1rem;                           /* gap-4 */

/* Sidebar */
sidebar-width: 16rem;                      /* w-64 */
sidebar-padding: 1.25rem;                  /* p-5 */
sidebar-item-padding: 0.75rem;             /* p-3 */

/* TopNav */
topnav-height: 4rem;                       /* h-16 */
topnav-padding-mobile: 0 1rem;             /* px-4 */
topnav-padding-desktop: 0 1.5rem;          /* px-6 */
```

---

## 🎨 COULEURS EXACTES

### Thème Sombre (défaut)
```css
[data-theme="dark"] {
  --bg-base: #0a0e1a;           /* Fond principal très sombre bleu-noir */
  --bg-card: #111827;           /* Cartes */
  --bg-card-hover: #1a2234;     /* Cartes hover */
  --bg-elevated: #1e293b;       /* Éléments surélevés (inputs, tabs) */
  --bg-code: #0f172a;           /* Blocs de code */
  
  --border: rgba(255, 255, 255, 0.06);       /* Bordures subtiles */
  --border-light: rgba(255, 255, 255, 0.1);  /* Bordures hover */
  
  --text-primary: #f1f5f9;      /* Texte principal (quasi blanc) */
  --text-secondary: #94a3b8;    /* Texte secondaire (gris clair) */
  --text-muted: #64748b;        /* Texte désactivé (gris) */
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
}
```

### Thème Clair
```css
:root, [data-theme="light"] {
  --bg-base: #f8fafc;           /* Fond principal */
  --bg-card: #ffffff;           /* Cartes */
  --bg-card-hover: #f1f5f9;     /* Cartes hover */
  --bg-elevated: #f1f5f9;       /* Éléments surélevés */
  --bg-code: #f8fafc;           /* Blocs de code */
  
  --border: rgba(0, 0, 0, 0.08);
  --border-light: rgba(0, 0, 0, 0.12);
  
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

### Accents (identiques dark/light)
```css
--accent-violet: #8b5cf6;
--accent-pink: #ec4899;
--accent-cyan: #06b6d4;
--accent-blue: #3b82f6;
--accent-green: #10b981;
--accent-orange: #f97316;
--accent-red: #ef4444;
--accent-yellow: #fbbf24;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8b5cf6, #ec4899);
--gradient-cyan: linear-gradient(135deg, #06b6d4, #3b82f6);
--gradient-green: linear-gradient(135deg, #10b981, #06b6d4);
```

---

## 📦 BORDER-RADIUS

```css
--radius-sm: 0.5rem;    /* 8px - petits éléments */
--radius-md: 0.75rem;   /* 12px - boutons, inputs */
--radius-lg: 1rem;      /* 16px - cards internes */
--radius-xl: 1.25rem;   /* 20px - cards principales */
--radius-full: 9999px;  /* badges, avatars ronds */
```

---

## 🔤 TYPOGRAPHIE

```css
/* Font families */
font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
font-mono: 'JetBrains Mono', monospace;

/* Font sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-4xl: 2.5rem;      /* 40px */

/* Font weights */
font-normal: 400;
font-medium: 500;
font-semibold: 600;
font-bold: 700;
font-extrabold: 800;

/* Line heights */
line-height-normal: 1.5;
line-height-tight: 1.25;

/* Specific elements */
page-title: font-size: 1.5rem; font-weight: 700;
card-title: font-size: 0.9rem; font-weight: 600;
sidebar-title: font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
badge: font-size: 0.6875rem; font-weight: 600;
button: font-size: 0.875rem; font-weight: 500;
```

---

## 🧩 COMPOSANTS DÉTAILLÉS

### Card
```css
.card {
  background: var(--bg-card);               /* #111827 dark */
  border: 1px solid var(--border);          /* rgba(255,255,255,0.06) */
  border-radius: 1.25rem;                   /* 20px */
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.card:hover {
  border-color: var(--border-light);        /* rgba(255,255,255,0.1) */
}

.card-header {
  padding: 1rem 1.25rem;                    /* 16px 20px */
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.card-content {
  padding: 1.25rem;                         /* 20px */
}
```

### Button
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;                              /* 8px */
  font-size: 0.875rem;                      /* 14px */
  font-weight: 500;
  padding: 0.625rem 1rem;                   /* 10px 16px */
  border-radius: 0.75rem;                   /* 12px */
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
}
.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-elevated);           /* #1e293b dark */
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.5rem 0.75rem;                  /* 8px 12px */
  font-size: 0.8125rem;                     /* 13px */
}

.btn-icon {
  width: 2.5rem;                            /* 40px */
  height: 2.5rem;
  padding: 0;
}
```

### Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;                             /* 4px */
  font-size: 0.6875rem;                     /* 11px */
  font-weight: 600;
  padding: 0.25rem 0.625rem;                /* 4px 10px */
  border-radius: 9999px;                    /* pill */
}

/* Variantes avec 15% d'opacité */
.badge-violet { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.badge-pink { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
.badge-cyan { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
.badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge-orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
.badge-red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.badge-yellow { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
```

### Input
```css
.input {
  width: 100%;
  height: 2.5rem;                           /* 40px */
  padding: 0 1rem;                          /* 16px */
  font-size: 0.875rem;                      /* 14px */
  color: var(--text-primary);
  background: var(--bg-elevated);           /* #1e293b dark */
  border: 1px solid var(--border);
  border-radius: 0.75rem;                   /* 12px */
  outline: none;
  transition: border-color 0.2s ease;
}
.input::placeholder {
  color: var(--text-muted);
}
.input:focus {
  border-color: #8b5cf6;                    /* violet */
}

/* Input avec icône */
.input-with-icon {
  padding-left: 2.75rem;                    /* 44px */
}
.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}
```

### Avatar
```css
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-sm { width: 2rem; height: 2rem; font-size: 0.7rem; }      /* 32px */
.avatar-md { width: 2.5rem; height: 2.5rem; font-size: 0.875rem; } /* 40px */
.avatar-lg { width: 3.5rem; height: 3.5rem; font-size: 1.125rem; } /* 56px */
.avatar-xl { 
  width: 5rem; height: 5rem;                /* 80px */
  font-size: 1.5rem;
  border-radius: 1.25rem;                   /* carré arrondi pour XL */
}
```

### Progress Bar
```css
.progress {
  width: 100%;
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 9999px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  transition: width 0.5s ease;
}
```

### Vote Bar
```css
.vote-bar {
  display: flex;
  height: 6px;
  background: var(--bg-elevated);
  border-radius: 9999px;
  overflow: hidden;
}
.vote-bar-pour {
  background: #10b981;                      /* green */
}
.vote-bar-contre {
  background: #ef4444;                      /* red */
}
```

### Tabs
```css
.tabs {
  display: flex;
  gap: 0.25rem;                             /* 4px */
  padding: 0.25rem;                         /* 4px */
  background: var(--bg-elevated);
  border-radius: 1rem;                      /* 16px */
  overflow-x: auto;
}
.tab {
  padding: 0.5rem 1rem;                     /* 8px 16px */
  font-size: 0.8125rem;                     /* 13px */
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 0.75rem;                   /* 12px */
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.tab:hover {
  color: var(--text-secondary);
}
.tab[data-active="true"] {
  color: var(--text-primary);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}
```

### Sub-Tabs (bordure inférieure)
```css
.sub-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  margin-bottom: 1.5rem;                    /* 24px */
}
.sub-tab {
  padding: 0.75rem 1rem;                    /* 12px 16px */
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  margin-bottom: -1px;
  transition: all 0.2s ease;
}
.sub-tab:hover {
  color: var(--text-secondary);
}
.sub-tab[data-active="true"] {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
}
```

---

## 📱 LAYOUT

### TopNav
```css
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-card);               /* solid en light */
  border-bottom: 1px solid var(--border);
  height: 4rem;                             /* 64px */
}

/* Glass effect en dark mode */
[data-theme="dark"] .top-nav {
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(12px);
}

.top-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 1rem;                          /* mobile */
}
@media (min-width: 768px) {
  .top-nav-inner { padding: 0 1.5rem; }
}
```

### Logo
```css
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;                             /* 12px */
}
.logo-icon {
  width: 2.25rem;                           /* 36px */
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: 0.75rem;                   /* 12px */
  font-weight: 800;
  font-size: 1rem;
  color: white;
}
.logo-text {
  font-size: 1.125rem;                      /* 18px */
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Nav Item
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;                              /* 8px */
  padding: 0.5rem 0.875rem;                 /* 8px 14px */
  font-size: 0.875rem;                      /* 14px */
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 0.75rem;                   /* 12px */
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
.nav-item[data-active="true"] {
  color: white;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}
.nav-item svg {
  width: 1.125rem;                          /* 18px */
  height: 1.125rem;
}
```

### Sidebar
```css
.sidebar {
  display: none;                            /* hidden mobile */
  width: 16rem;                             /* 256px */
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  padding: 1.25rem;                         /* 20px */
  flex-shrink: 0;
  overflow-y: auto;
}
@media (min-width: 1024px) {
  .sidebar { display: block; }
}

.sidebar-title {
  font-size: 0.6875rem;                     /* 11px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;                   /* 12px */
  padding-left: 0.75rem;                    /* 12px */
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;                             /* 12px */
  width: 100%;
  padding: 0.75rem;                         /* 12px */
  font-size: 0.875rem;                      /* 14px */
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 0.75rem;                   /* 12px */
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.sidebar-item:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
.sidebar-item[data-active="true"] {
  color: white;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}
.sidebar-item svg {
  width: 1.125rem;                          /* 18px */
  height: 1.125rem;
  opacity: 0.7;
}
.sidebar-item[data-active="true"] svg {
  opacity: 1;
}
```

### Main Content
```css
.main {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;                         /* 20px mobile */
}
@media (min-width: 768px) {
  .main { padding: 1.5rem; }                /* 24px tablet */
}
@media (min-width: 1024px) {
  .main { padding: 2rem; }                  /* 32px desktop */
}

.app-layout {
  display: flex;
  min-height: calc(100vh - 4rem);           /* viewport - topnav */
}
```

---

## 📊 STAT CARDS

```css
.stat-card {
  padding: 1.25rem;                         /* 20px */
  border-radius: 1.25rem;                   /* 20px */
  position: relative;
  overflow: hidden;
}

/* Glow effect */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  filter: blur(40px);
  opacity: 0.3;
  border-radius: 50%;
}

.stat-card-violet {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(139, 92, 246, 0.2);
}
.stat-card-violet::before { background: #8b5cf6; }

.stat-card-pink {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05));
  border: 1px solid rgba(236, 72, 153, 0.2);
}
.stat-card-pink::before { background: #ec4899; }

.stat-card-cyan {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05));
  border: 1px solid rgba(6, 182, 212, 0.2);
}
.stat-card-cyan::before { background: #06b6d4; }

.stat-card-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.stat-card-green::before { background: #10b981; }

.stat-label {
  font-size: 0.75rem;                       /* 12px */
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;                       /* 28px */
  font-weight: 700;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  margin-top: 0.5rem;
}
.stat-trend-up {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
```

---

## 🔀 GRILLES

```css
/* 2 colonnes */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr;               /* 1 col mobile */
  gap: 1rem;
}
@media (min-width: 640px) {
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
}

/* 3 colonnes */
.grid-3 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 768px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
}

/* 4 colonnes (stats) */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);    /* 2 col mobile */
  gap: 1rem;
}
@media (min-width: 768px) {
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Main + Sidebar (2fr 1fr) */
.grid-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;                             /* 20px */
}
@media (min-width: 1024px) {
  .grid-main {
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;                            /* 24px */
  }
}
```

---

## 🎯 COMPOSANTS SPÉCIAUX

### Branch Item
```css
.branch-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;                             /* 12px */
  padding: 0.875rem 1rem;                   /* 14px 16px */
  background: var(--bg-elevated);
  border-radius: 1rem;                      /* 16px */
  cursor: pointer;
  transition: all 0.2s ease;
}
.branch-item:hover {
  background: var(--bg-card-hover);
}

.branch-icon {
  width: 2.25rem;                           /* 36px */
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;                   /* 12px */
  flex-shrink: 0;
}
.branch-icon svg {
  width: 1rem;
  height: 1rem;
}
.branch-icon-violet { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.branch-icon-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.branch-icon-cyan { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
.branch-icon-orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
```

### Diff Viewer
```css
.diff-container {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;                     /* 13px */
  line-height: 1.6;
  background: var(--bg-code);               /* #0f172a dark */
  border-radius: 0.75rem;
  overflow: hidden;
}

.diff-header {
  padding: 0.75rem 1rem;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  font-weight: 500;
}

.diff-line {
  display: flex;
  padding: 0 1rem;
}

.diff-line-number {
  width: 3rem;                              /* 48px */
  text-align: right;
  padding-right: 1rem;
  color: var(--text-muted);
  user-select: none;
  flex-shrink: 0;
}

.diff-line-content {
  flex: 1;
  padding: 0.125rem 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.diff-add {
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
}
.diff-add .diff-line-content::before {
  content: '+';
  color: #10b981;
  margin-right: 0.5rem;
}

.diff-remove {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}
.diff-remove .diff-line-content::before {
  content: '-';
  color: #ef4444;
  margin-right: 0.5rem;
}
```

### Vote Buttons
```css
.vote-buttons {
  display: flex;
  gap: 0.5rem;
}

.vote-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid;
  border-radius: 1rem;
  cursor: pointer;
  background: transparent;
  transition: all 0.2s ease;
}
.vote-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.vote-btn-pour {
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}
.vote-btn-pour:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.vote-btn-contre {
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
.vote-btn-contre:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.vote-btn-abstention {
  border-color: var(--border-light);
  color: var(--text-muted);
}
.vote-btn-abstention:hover {
  background: var(--bg-elevated);
}
```

### Timeline (Process Steps)
```css
.timeline {
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.timeline-icon {
  width: 2.5rem;                            /* 40px */
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-elevated);
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.timeline-icon svg {
  width: 1rem;
  height: 1rem;
}

.timeline-step[data-state="completed"] .timeline-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.timeline-step[data-state="active"] .timeline-icon {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
}

.timeline-label {
  font-size: 0.6875rem;                     /* 11px */
  font-weight: 500;
  color: var(--text-secondary);
}

.timeline-connector {
  flex: 1;
  height: 2px;
  margin: 1.25rem 0.5rem 0;
  background: var(--bg-elevated);
  border-radius: 9999px;
}
.timeline-connector[data-state="completed"] {
  background: #10b981;
}
.timeline-connector[data-state="active"] {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}
```

### Article Block
```css
.article-block {
  padding: 1.25rem;                         /* 20px */
  background: var(--bg-elevated);
  border-radius: 0.75rem;                   /* 12px */
  border-left: 4px solid #8b5cf6;
}

.article-number {
  font-size: 0.75rem;                       /* 12px */
  font-weight: 600;
  color: #8b5cf6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.article-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.article-content {
  font-size: 0.9375rem;                     /* 15px */
  color: var(--text-secondary);
  line-height: 1.7;
}
```

---

## 🗺️ CARTE DU MONDE

```css
.world-map-container {
  position: relative;
  width: 100%;
  height: 280px;                            /* mobile */
  background: var(--map-bg);                /* #0f172a dark */
  border-radius: 1rem;
  overflow: hidden;
}
@media (min-width: 768px) {
  .world-map-container { height: 320px; }
}

.world-map-svg .land {
  fill: var(--map-land);                    /* #1e293b dark */
  stroke: var(--map-border);                /* #334155 */
  stroke-width: 0.5;
  transition: fill 0.3s ease;
}
.world-map-svg .land:hover {
  fill: rgba(139, 92, 246, 0.3);
}

.map-marker {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.map-marker:hover {
  transform: scale(1.3);
}

@keyframes pulse-marker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.map-marker-pulse {
  animation: pulse-marker 2s ease-in-out infinite;
}

.map-legend {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6875rem;
  color: var(--text-secondary);
}

.map-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile first */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */

/* Sidebar visible à partir de lg (1024px) */
/* Grid passe en colonnes à partir de sm/md selon le type */
/* Padding augmente progressivement */
```

---

## ✅ CHECKLIST VALIDATION VISUELLE

Avant de valider un composant, vérifier :

- [ ] Border-radius correct (xl pour cards, md pour boutons)
- [ ] Espacement interne correct (p-5 cards, p-3 items)
- [ ] Couleurs de fond correctes (bg-card, bg-elevated)
- [ ] Bordures subtiles présentes (border, border-light hover)
- [ ] Typographie correcte (tailles, poids)
- [ ] Transitions fluides (0.2s ease)
- [ ] Mode sombre par défaut
- [ ] Responsive (sidebar cachée mobile, grilles adaptatives)
- [ ] Gradients là où nécessaire (boutons primary, avatars, nav active)
- [ ] Glow effect sur stat-cards
