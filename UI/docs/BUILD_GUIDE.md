# Guide de Build iOS & Android

Ce guide explique comment compiler l'application "Savoirs de Grand-Mère" pour les stores Apple et Google Play.

---

## Prérequis

### Outils requis
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Expo CLI** : `npm install -g expo-cli`
- **EAS CLI** : `npm install -g eas-cli`

### Pour iOS (macOS uniquement)
- **Xcode** 14+ (App Store)
- **Compte Apple Developer** ($99/an)
- **CocoaPods** : `sudo gem install cocoapods`

### Pour Android
- **Android Studio** avec SDK 33+
- **Compte Google Play Developer** ($25 unique)
- **Java JDK** 11+

---

## Configuration EAS Build

### 1. Connexion à Expo

```bash
npx eas login
```

### 2. Configuration du projet

```bash
npx eas build:configure
```

Cela crée un fichier `eas.json` :

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## Build iOS

### Build de développement (TestFlight interne)

```bash
npx eas build --platform ios --profile preview
```

### Build de production (App Store)

```bash
npx eas build --platform ios --profile production
```

### Soumission à l'App Store

```bash
npx eas submit --platform ios
```

### Build local (sans EAS)

```bash
# Générer le projet natif
npx expo prebuild --platform ios

# Ouvrir dans Xcode
cd ios && open SavoirsDeGrandMere.xcworkspace

# Archiver et soumettre depuis Xcode
```

---

## Build Android

### Build APK (test interne)

```bash
npx eas build --platform android --profile preview
```

### Build AAB (Google Play)

```bash
npx eas build --platform android --profile production
```

### Soumission au Play Store

```bash
npx eas submit --platform android
```

### Build local (sans EAS)

```bash
# Générer le projet natif
npx expo prebuild --platform android

# Build APK
cd android && ./gradlew assembleRelease

# Build AAB
cd android && ./gradlew bundleRelease
```

---

## Configuration des Stores

### App Store Connect (iOS)

1. Créer l'app sur [App Store Connect](https://appstoreconnect.apple.com)
2. Renseigner les métadonnées :
   - **Nom** : Savoirs de Grand-Mère
   - **Sous-titre** : Remèdes traditionnels
   - **Catégorie** : Santé & Forme / Référence
   - **Description** : (voir ci-dessous)
   - **Mots-clés** : remèdes, plantes, traditionnel, santé, naturel
3. Ajouter les captures d'écran (voir EXPORT_GUIDE.md)
4. Configurer App Privacy (aucune donnée collectée ou analytics opt-in)

### Google Play Console (Android)

1. Créer l'app sur [Google Play Console](https://play.google.com/console)
2. Renseigner les métadonnées :
   - **Titre** : Savoirs de Grand-Mère
   - **Description courte** : Remèdes traditionnels sourcés
   - **Description complète** : (voir ci-dessous)
   - **Catégorie** : Santé et remise en forme
3. Ajouter les captures d'écran
4. Remplir le questionnaire de contenu
5. Configurer la politique de confidentialité

---

## Description pour les Stores

### Description courte (80 caractères)
```
Découvrez des remèdes traditionnels avec sources vérifiées et traçabilité.
```

### Description complète
```
Savoirs de Grand-Mère est votre compagnon pour explorer les remèdes traditionnels issus de livres anciens numérisés.

✨ FONCTIONNALITÉS

📚 Sources vérifiées
Chaque remède indique sa source exacte (livre et page) avec un score de confiance basé sur la qualité de la numérisation.

🔍 Recherche intelligente
Trouvez facilement ce que vous cherchez grâce à la correction automatique des fautes et la reconnaissance des synonymes régionaux.

🌿 Exploration par catégories
Parcourez les remèdes par plantes, par usages (digestion, sommeil, peau...) ou par livres sources.

❤️ Favoris personnalisés
Sauvegardez vos remèdes préférés et ajoutez des notes personnelles. Exportez votre liste en JSON.

🔒 Respect de la vie privée
Vos données restent sur votre appareil. Analytics opt-in uniquement.

⚠️ AVERTISSEMENT
Les informations présentées sont documentaires et issues de sources historiques. Elles ne constituent en aucun cas un avis médical. Consultez toujours un professionnel de santé avant d'utiliser un remède.

---
Développé avec ❤️ pour préserver les savoirs traditionnels.
```

---

## Icônes et Assets

Avant de soumettre, assurez-vous d'avoir créé tous les assets listés dans `ASSETS.md` :

- [ ] Icône app 1024x1024
- [ ] Splash screen
- [ ] Icône adaptative Android
- [ ] Favicon web
- [ ] Captures d'écran (6-8)

---

## Checklist Pré-soumission

### Général
- [ ] Version et build number incrémentés
- [ ] Tous les assets en place
- [ ] Tests sur appareil réel
- [ ] Pas de console.log en production

### iOS
- [ ] Bundle identifier configuré
- [ ] Certificats et provisioning profiles
- [ ] App Privacy renseigné
- [ ] Screenshots iPhone et iPad

### Android
- [ ] Package name configuré
- [ ] Keystore de signature créé
- [ ] Questionnaire de contenu rempli
- [ ] Screenshots téléphone et tablette

---

## Commandes Utiles

```bash
# Vérifier la configuration
npx expo config --type public

# Lister les builds
npx eas build:list

# Voir les logs d'un build
npx eas build:view

# Mettre à jour OTA (sans rebuild)
npx eas update --branch production

# Générer les icônes automatiquement
npx expo-optimize
```

---

## Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
