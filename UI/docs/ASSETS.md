# Liste des Assets à Créer

## Icône de l'Application

### App Icon (1024x1024)
- **Fichier**: `app-icon.png`
- **Format**: PNG, 1024x1024px
- **Description**: Icône principale de l'application
- **Style suggéré**: 
  - Fond dégradé vert sauge (#7BC8A4) vers vert foncé
  - Illustration stylisée d'un livre ouvert avec des feuilles/plantes
  - Style minimaliste et moderne
  - Coins arrondis (automatique sur iOS/Android)

### Adaptive Icon (Android)
- **Fichier foreground**: `adaptive-icon-foreground.png` (1024x1024)
- **Fichier background**: `adaptive-icon-background.png` (1024x1024)
- **Description**: Icône adaptative pour Android avec couches séparées

### Favicon (Web)
- **Fichier**: `favicon.png`
- **Format**: PNG, 48x48px

---

## Splash Screen

### Splash Image
- **Fichier**: `splash.png`
- **Format**: PNG, 1284x2778px (iPhone 14 Pro Max)
- **Description**: Écran de chargement
- **Style suggéré**:
  - Fond: #0F1115 (couleur de fond de l'app)
  - Logo centré avec nom "Savoirs de Grand-Mère"
  - Sous-titre optionnel: "Remèdes traditionnels"

---

## Illustrations Onboarding

### Slide 1 - Sources claires
- **Fichier**: `onboarding-1.svg` ou `onboarding-1.png`
- **Dimensions**: 300x300px
- **Description**: Illustration d'un livre ancien avec des pages qui s'envolent
- **Couleurs**: Tons verts (#7BC8A4) et ambrés (#F2B66D)

### Slide 2 - Recherche intelligente
- **Fichier**: `onboarding-2.svg` ou `onboarding-2.png`
- **Dimensions**: 300x300px
- **Description**: Loupe avec des plantes/herbes
- **Couleurs**: Tons verts (#7BC8A4)

### Slide 3 - Prudence
- **Fichier**: `onboarding-3.svg` ou `onboarding-3.png`
- **Dimensions**: 300x300px
- **Description**: Symbole de prudence stylisé (triangle avec plante)
- **Couleurs**: Tons ambrés (#F2B66D) et rouges doux (#FF6B6B)

---

## Icônes Personnalisées (Optionnel)

Si vous souhaitez des icônes personnalisées au lieu de Feather Icons:

### Icônes de Navigation
- `icon-search.svg` - Rechercher
- `icon-heart.svg` - Favoris
- `icon-compass.svg` - Explorer
- `icon-settings.svg` - Réglages

### Icônes de Catégories (Usages)
- `icon-respiration.svg` - Poumons/vent
- `icon-digestion.svg` - Estomac stylisé
- `icon-peau.svg` - Goutte d'eau
- `icon-sommeil.svg` - Lune/étoiles
- `icon-gorge.svg` - Gorge stylisée
- `icon-douleurs.svg` - Éclair/activité

### Icônes de Routes
- `icon-orale.svg` - Tasse/cuillère
- `icon-cutanee.svg` - Main/peau
- `icon-inhalation.svg` - Nuage/vapeur

---

## Badges et Éléments UI

### Badge Vérifié
- **Fichier**: `badge-verified.svg`
- **Dimensions**: 24x24px
- **Description**: Coche dans un cercle, couleur sauge

### Badge Confiance
- **Fichiers**: 
  - `badge-confidence-high.svg` (vert)
  - `badge-confidence-medium.svg` (ambre)
  - `badge-confidence-low.svg` (rouge)
- **Dimensions**: 16x16px

---

## Ressources Typographiques

### Police recommandée
- **Titres**: Inter Bold / SF Pro Display Bold
- **Corps**: Inter Regular / SF Pro Text Regular
- **Note**: Les polices système sont utilisées par défaut dans le prototype

---

## Outils Recommandés pour la Création

1. **Figma** - Design UI/UX et export d'assets
2. **Adobe Illustrator** - Illustrations vectorielles
3. **Canva** - Alternative simple pour les illustrations
4. **IconJar** - Gestion des icônes
5. **App Icon Generator** - Génération automatique des tailles d'icônes

---

## Structure des Fichiers Assets

```
assets/
├── images/
│   ├── app-icon.png
│   ├── adaptive-icon-foreground.png
│   ├── adaptive-icon-background.png
│   ├── splash.png
│   ├── favicon.png
│   └── onboarding/
│       ├── slide-1.png
│       ├── slide-2.png
│       └── slide-3.png
├── icons/
│   ├── navigation/
│   ├── categories/
│   └── routes/
└── fonts/
    └── (polices personnalisées si nécessaire)
```

---

## Notes Importantes

- Tous les assets doivent être en haute résolution (@3x minimum)
- Prévoir des versions pour le mode sombre (déjà le thème principal)
- Les SVG sont préférés pour les icônes (scalabilité)
- Les PNG sont préférés pour les illustrations complexes
- Respecter la palette de couleurs définie dans le thème
