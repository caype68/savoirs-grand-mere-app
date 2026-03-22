# Guide d'Export des Captures d'Écran

Ce guide explique comment produire des captures d'écran propres pour présenter l'application "Savoirs de Grand-Mère".

---

## Format Recommandé

- **Résolution**: 1290 x 2796 px (iPhone 14 Pro Max) ou 1284 x 2778 px
- **Format**: PNG
- **Orientation**: Portrait
- **Nombre**: 6 à 8 captures

---

## Captures d'Écran à Produire

### 1. Onboarding - Slide 1
**Fichier**: `screenshot-01-onboarding.png`
**Écran**: Premier slide de l'onboarding
**Contenu visible**:
- Icône du livre
- Titre "Des remèdes traditionnels, sources claires."
- Description
- Indicateurs de pagination (3 points)
- Bouton "Continuer"

---

### 2. Accueil Recherche
**Fichier**: `screenshot-02-home.png`
**Écran**: Onglet Rechercher (état initial)
**Contenu visible**:
- Titre "Savoirs de Grand-Mère"
- Barre de recherche vide avec placeholder
- Chips de suggestions (Gorge, Digestion, Sommeil, Peau)
- Section "Tendances" avec 3 cartes
- Navigation bottom avec 4 onglets

---

### 3. Résultats de Recherche
**Fichier**: `screenshot-03-results.png`
**Écran**: Résultats après recherche "thym"
**Contenu visible**:
- Barre de recherche avec "thym"
- Compteur de résultats
- Options de tri (Pertinence/Confiance/Nom)
- 2-3 cartes de résultats avec:
  - Titre du remède
  - Ingrédients clés
  - Badges (source, route, confiance)
  - Ligne "Pourquoi ce résultat ?"

---

### 4. Détail d'un Remède
**Fichier**: `screenshot-04-detail.png`
**Écran**: Détail de "Infusion de thym"
**Contenu visible**:
- Header avec nom + badge vérifié
- Boutons favori et partage
- Badge route (Orale)
- Bandeau disclaimer rouge
- Accordéons (Ingrédients ouvert, autres fermés)
- Liste des ingrédients avec quantités

---

### 5. Détail Remède - Sources
**Fichier**: `screenshot-05-sources.png`
**Écran**: Détail remède, section Sources ouverte
**Contenu visible**:
- Accordéon "Sources & fiabilité" ouvert
- Information du livre (Livre A, p.45)
- Détail confiance (OCR, Parsing, Global)
- Boutons "Voir extrait" et "Signaler une erreur"

---

### 6. Explorer - Par Usages
**Fichier**: `screenshot-06-explore.png`
**Écran**: Onglet Explorer, tab "Par usages"
**Contenu visible**:
- Titre "Explorer"
- 3 onglets (Par plantes, Par usages, Par livres)
- Grille de cartes d'usages:
  - Respiration, Digestion, Peau, Sommeil, etc.
  - Icônes et compteurs de remèdes

---

### 7. Favoris
**Fichier**: `screenshot-07-favorites.png`
**Écran**: Onglet Favoris avec quelques favoris
**Contenu visible**:
- Titre "Favoris"
- Bouton "Exporter"
- Compteur de favoris
- Cartes de remèdes favoris
- Note personnelle sur un favori
- Date d'ajout

**Note**: Pour cette capture, ajoutez d'abord quelques favoris via l'app.

---

### 8. Réglages
**Fichier**: `screenshot-08-settings.png`
**Écran**: Onglet Réglages
**Contenu visible**:
- Titre "Réglages"
- Section Confidentialité
- Section Transparence (note sur l'affiliation)
- Section Préférences (Langue)
- Section Application (À propos, Supprimer données)

---

## Procédure d'Export

### Avec Expo Go (Développement)

1. **Lancer l'application**:
   ```bash
   cd savoirs-de-grand-mere
   npx expo start
   ```

2. **Scanner le QR code** avec Expo Go sur votre téléphone

3. **Naviguer** vers chaque écran à capturer

4. **Capturer l'écran**:
   - **iOS**: Bouton latéral + Volume haut
   - **Android**: Bouton Power + Volume bas

5. **Transférer les captures** vers votre ordinateur

### Avec un Simulateur/Émulateur

1. **iOS Simulator** (macOS uniquement):
   ```bash
   npx expo start --ios
   ```
   - Capture: `Cmd + S` ou File > Save Screen

2. **Android Emulator**:
   ```bash
   npx expo start --android
   ```
   - Capture: Bouton caméra dans la barre d'outils

### Avec Expo Web (Alternative rapide)

```bash
npx expo start --web
```
- Utiliser les DevTools du navigateur pour simuler un mobile
- Capture avec l'outil de capture du navigateur

---

## Post-Traitement Recommandé

### Ajout de Device Frame (Optionnel)
Outils pour ajouter un cadre de téléphone autour des captures:
- **Rotato** (macOS)
- **MockUPhone** (en ligne)
- **Figma** avec templates de devices

### Optimisation
- Compresser les PNG avec **TinyPNG** ou **ImageOptim**
- Vérifier que le texte est lisible
- S'assurer que les couleurs sont fidèles

---

## Checklist Finale

- [ ] Screenshot 1: Onboarding
- [ ] Screenshot 2: Accueil Recherche
- [ ] Screenshot 3: Résultats de Recherche
- [ ] Screenshot 4: Détail Remède (Ingrédients)
- [ ] Screenshot 5: Détail Remède (Sources)
- [ ] Screenshot 6: Explorer
- [ ] Screenshot 7: Favoris
- [ ] Screenshot 8: Réglages

---

## Conseils pour l'App Store / Play Store

- **Titre**: Inclure le nom de l'app dans la première capture
- **Fonctionnalités clés**: Mettre en avant la recherche et les sources
- **Disclaimer**: Montrer le bandeau d'avertissement médical
- **Confiance**: Mettre en évidence le système de score de confiance
