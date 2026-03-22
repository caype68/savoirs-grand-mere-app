# Savoirs de Grand-Mère

Application mobile (iOS + Android) qui agrège des remèdes traditionnels issus de livres numérisés.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![License](https://img.shields.io/badge/license-Prototype-orange)

## 🌿 Aperçu

**Savoirs de Grand-Mère** est un prototype d'application qui permet de :
- Rechercher des remèdes traditionnels avec correction de fautes et synonymes
- Consulter les détails complets (ingrédients, préparation, posologie)
- Voir la provenance exacte (livre + page) et un score de confiance
- Explorer par plantes, usages ou livres sources
- Sauvegarder ses favoris avec notes personnelles

> ⚠️ **Disclaimer** : Les informations présentées sont documentaires et ne constituent pas un avis médical. Consultez toujours un professionnel de santé.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go sur votre téléphone (iOS/Android)

### Installation

```bash
# Cloner ou accéder au projet
cd savoirs-de-grand-mere

# Installer les dépendances
npm install

# Lancer le serveur de développement
npx expo start
```

### Lancer sur un appareil

1. Scannez le QR code avec **Expo Go** (Android) ou l'app **Appareil photo** (iOS)
2. L'application se chargera automatiquement

### Lancer sur simulateur

```bash
# iOS (macOS uniquement)
npx expo start --ios

# Android
npx expo start --android

# Web
npx expo start --web
```

---

## 📱 Écrans de l'Application

| Écran | Description |
|-------|-------------|
| **Onboarding** | 3 slides d'introduction + choix analytics |
| **Rechercher** | Barre de recherche, suggestions, tendances, filtres |
| **Résultats** | Liste de remèdes avec badges et tri |
| **Détail Remède** | Ingrédients, préparation, posologie, sources |
| **Détail Ingrédient** | Info plante + remèdes associés |
| **Explorer** | Navigation par plantes, usages ou livres |
| **Favoris** | Liste des favoris avec notes et export |
| **Réglages** | Confidentialité, langue, à propos |

---

## 🎨 Design System

### Palette de Couleurs (Dark Theme)

| Élément | Couleur | Hex |
|---------|---------|-----|
| Fond | Noir profond | `#0F1115` |
| Surface | Gris foncé | `#151A21` |
| Surface élevée | Gris moyen | `#1B2230` |
| Texte primaire | Blanc cassé | `#E8EDF5` |
| Texte secondaire | Gris clair | `#AAB4C5` |
| Accent primaire | Sauge | `#7BC8A4` |
| Accent secondaire | Ambre | `#F2B66D` |
| Warning | Rouge doux | `#FF6B6B` |

### Espacements
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px

### Rayons de bordure
- Cartes : 16px
- Boutons : 12px
- Chips : 9999px (full)

---

## 📂 Structure du Projet

```
savoirs-de-grand-mere/
├── App.tsx                 # Point d'entrée
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── SearchBar.tsx
│   │   ├── FilterChips.tsx
│   │   ├── ResultCard.tsx
│   │   ├── BadgeSource.tsx
│   │   ├── BadgeConfidence.tsx
│   │   ├── SectionAccordion.tsx
│   │   ├── DisclaimerBanner.tsx
│   │   └── EmptyState.tsx
│   ├── screens/            # Écrans de l'application
│   │   ├── OnboardingScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── RemedeDetailScreen.tsx
│   │   ├── IngredientDetailScreen.tsx
│   │   ├── ExploreScreen.tsx
│   │   ├── FavorisScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/         # Configuration navigation
│   │   └── AppNavigator.tsx
│   ├── data/               # Données de démonstration
│   │   └── remedes.ts
│   ├── hooks/              # Hooks personnalisés
│   │   ├── useFavoris.ts
│   │   └── usePreferences.ts
│   ├── utils/              # Utilitaires
│   │   └── search.ts
│   ├── theme/              # Thème et styles
│   │   └── colors.ts
│   └── types/              # Types TypeScript
│       └── index.ts
└── docs/                   # Documentation
    ├── ASSETS.md           # Liste des assets à créer
    └── EXPORT_GUIDE.md     # Guide de capture d'écran
```

---

## 📊 Données de Démonstration

Le prototype inclut :
- **8 remèdes** répartis sur 3 livres fictifs
- **8 plantes/ingrédients** avec alias régionaux
- **6 catégories d'usages**
- Scores de confiance variés (0.77 à 0.90)

### Remèdes inclus
1. Infusion de thym (alias: farigoule)
2. Miel & citron
3. Vinaigre en friction
4. Infusion de camomille
5. Inhalation à la lavande
6. Infusion de menthe poivrée
7. Cataplasme d'argile verte
8. Sirop thym-miel

---

## 🔧 Adaptation à une Vraie Base de Données

Le prototype est conçu pour être facilement adapté :

### 1. Remplacer les données statiques

```typescript
// src/data/remedes.ts → API call
import { fetchRemedes } from '../api/remedes';

// Dans les composants, remplacer:
// import { remedes } from '../data/remedes';
// Par:
// const { data: remedes } = useQuery('remedes', fetchRemedes);
```

### 2. Structure de données compatible

Les types dans `src/types/index.ts` définissent le schéma attendu :
- `Remede` : structure complète d'un remède
- `Ingredient` : ingrédient avec quantités
- `Source` : provenance et scores de confiance
- `Livre`, `Usage`, `Plante` : entités de référence

### 3. Points d'intégration

| Fonctionnalité | Fichier à modifier |
|----------------|-------------------|
| Recherche | `src/utils/search.ts` |
| Favoris | `src/hooks/useFavoris.ts` |
| Préférences | `src/hooks/usePreferences.ts` |
| Données | `src/data/remedes.ts` |

---

## 📸 Captures d'Écran

Voir le [Guide d'Export](./docs/EXPORT_GUIDE.md) pour produire des captures propres.

---

## 🎯 Fonctionnalités Clés

### Recherche Intelligente
- Correction de fautes de frappe (Levenshtein)
- Support des alias régionaux (thym → farigoule)
- Recherche par ingrédient ou usage
- Filtres par route, livre, confiance

### Traçabilité des Sources
- Livre et page d'origine
- Score de confiance OCR + Parsing
- Extrait du texte source
- Possibilité de signaler des erreurs

### Respect de la Vie Privée
- Données stockées localement
- Analytics opt-in uniquement
- Export des favoris en JSON
- Suppression complète des données

---

## 📄 Licence

Ce prototype est fourni à des fins de démonstration.

---

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'Ajout fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

---

## 📞 Contact

Pour toute question sur ce prototype, ouvrez une issue sur le repository.
