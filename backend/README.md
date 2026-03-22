# Backend Savoirs de Grand-Mère

## Architecture

Ce backend utilise **Supabase** comme plateforme BaaS (Backend as a Service) avec :
- **PostgreSQL** : Base de données relationnelle
- **Auth** : Authentification utilisateurs
- **Storage** : Stockage d'images
- **Realtime** : Synchronisation temps réel
- **Edge Functions** : Logique métier serverless

## Structure du projet

```
backend/
├── supabase/
│   ├── migrations/          # Migrations SQL
│   ├── functions/           # Edge Functions (Deno)
│   └── seed.sql             # Données initiales
├── admin/                   # Admin Panel (Next.js)
│   ├── src/
│   │   ├── app/             # Pages App Router
│   │   ├── components/      # Composants React
│   │   ├── lib/             # Utilitaires
│   │   └── types/           # Types TypeScript
│   └── package.json
└── mobile-sdk/              # SDK pour l'app mobile
    ├── src/
    │   ├── api/             # Clients API
    │   ├── hooks/           # React Hooks
    │   └── types/           # Types partagés
    └── package.json
```

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Base de données | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| API | Supabase REST + Edge Functions |
| Admin Panel | Next.js 14 + Tailwind CSS |
| Mobile SDK | TypeScript + React Query |

## Installation

### 1. Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser le projet
cd backend/supabase
supabase init

# Lancer localement
supabase start

# Appliquer les migrations
supabase db push
```

### 2. Admin Panel

```bash
cd backend/admin
npm install
npm run dev
```

## Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Schéma de données

Voir `supabase/migrations/` pour le schéma complet.

### Tables principales

- `users` : Utilisateurs (géré par Supabase Auth)
- `user_profiles` : Profils utilisateurs
- `remedies` : Remèdes
- `essential_oils` : Huiles essentielles
- `affiliate_products` : Produits Amazon
- `wellness_logs` : Journal bien-être
- `daily_recommendations` : Recommandations quotidiennes
- `streaks` : Séries de jours consécutifs
- `badges` : Badges de gamification

## API Endpoints

### Remèdes
- `GET /rest/v1/remedies` : Liste des remèdes
- `GET /rest/v1/remedies?id=eq.xxx` : Détail d'un remède
- `POST /rest/v1/remedies` : Créer un remède (admin)

### Huiles essentielles
- `GET /rest/v1/essential_oils` : Liste des HE
- `GET /rest/v1/essential_oils?id=eq.xxx` : Détail d'une HE

### Produits affiliés
- `GET /rest/v1/affiliate_products?remedy_id=eq.xxx` : Produits pour un remède

### Utilisateurs
- `GET /rest/v1/user_profiles?user_id=eq.xxx` : Profil utilisateur
- `PATCH /rest/v1/user_profiles?user_id=eq.xxx` : Mettre à jour le profil

### Bien-être
- `POST /rest/v1/wellness_logs` : Enregistrer une entrée
- `GET /rest/v1/wellness_logs?user_id=eq.xxx&order=date.desc` : Historique

## Migration depuis l'app mobile

1. Exporter les données locales (AsyncStorage)
2. Créer un compte utilisateur
3. Uploader les données vers le backend
4. Basculer l'app vers le mode connecté

Voir `mobile-sdk/src/migration/` pour les utilitaires de migration.
