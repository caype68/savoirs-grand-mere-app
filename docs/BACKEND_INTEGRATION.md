# Guide d'Intégration Backend Supabase

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
npm install @supabase/supabase-js
```

### 2. Configurer les variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

Puis éditer `.env` avec vos clés Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

### 3. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Exécuter le script SQL `backend/supabase/migrations/001_initial_schema.sql`
4. Exécuter `backend/supabase/seed.sql` pour les données initiales

---

## 📁 Structure des fichiers

```
src/
├── services/
│   └── supabase/
│       ├── config.ts           # Configuration client Supabase
│       ├── backendProvider.ts  # Service hybride local/remote
│       ├── remediesApi.ts      # API remèdes
│       └── index.ts            # Exports
├── hooks/
│   ├── useBackend.ts           # Hooks React
│   └── index.ts                # Exports
```

---

## 🔄 Mode Hybride

L'application fonctionne en **mode hybride** :

- **Si Supabase est configuré et disponible** → données du backend
- **Sinon** → fallback sur les données locales

Aucune configuration requise, le basculement est automatique.

### Vérifier le mode actuel

```tsx
import { useBackend } from '../hooks';

function MyComponent() {
  const { isOnline, dataSource, isRemote } = useBackend();
  
  return (
    <View>
      <Text>Mode: {dataSource}</Text>
      <Text>Backend: {isOnline ? 'Connecté' : 'Hors ligne'}</Text>
    </View>
  );
}
```

---

## 📖 Utilisation des Hooks

### useRemedies - Liste des remèdes

```tsx
import { useRemedies } from '../hooks';

function RemediesList() {
  const { data, isLoading, error, source } = useRemedies({
    limit: 20,
    search: 'thym',
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Erreur: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <RemedyCard remedy={item} />}
    />
  );
}
```

### useRemedy - Détail d'un remède

```tsx
import { useRemedy } from '../hooks';

function RemedyDetail({ id }: { id: string }) {
  const { data: remedy, isLoading, error } = useRemedy(id);

  if (isLoading) return <ActivityIndicator />;
  if (!remedy) return <Text>Remède non trouvé</Text>;

  return (
    <View>
      <Text>{remedy.nom}</Text>
      <Text>{remedy.indications.join(', ')}</Text>
    </View>
  );
}
```

### useRemedySearch - Recherche

```tsx
import { useRemedySearch } from '../hooks';

function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useRemedySearch(query);

  return (
    <View>
      <TextInput value={query} onChangeText={setQuery} />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList data={results} ... />
      )}
    </View>
  );
}
```

---

## 🔧 API Directe (sans hooks)

Pour les cas où les hooks ne conviennent pas :

```tsx
import { getRemedies, getRemedyById } from '../services/supabase';

// Récupérer tous les remèdes
const { data, source } = await getRemedies({ limit: 10 });

// Récupérer un remède par ID
const { data: remedy } = await getRemedyById('tisane-thym');
```

---

## 🔐 Authentification (optionnel)

Pour les fonctionnalités utilisateur (favoris, historique, etc.) :

```tsx
import { getSupabaseClient } from '../services/supabase';

const supabase = getSupabaseClient();

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Déconnexion
await supabase.auth.signOut();
```

---

## 📊 Migration des données locales

Pour migrer les données AsyncStorage vers Supabase :

```tsx
import { migrateLocalDataToBackend } from '../services/supabase/migration';

// Au premier lancement après mise à jour
const result = await migrateLocalDataToBackend();

if (result.success) {
  console.log('Migration réussie !');
  console.log('Profil:', result.migratedItems.profile);
  console.log('Logs bien-être:', result.migratedItems.wellnessLogs);
} else {
  console.log('Erreurs:', result.errors);
}
```

---

## 🛠️ Dépannage

### Le backend ne se connecte pas

1. Vérifier les variables d'environnement
2. Vérifier que le projet Supabase est actif
3. Vérifier les policies RLS

### Les données ne s'affichent pas

1. Vérifier que les remèdes ont `status = 'published'`
2. Vérifier les logs console pour les erreurs
3. Forcer le mode local pour tester : `forceLocalMode()`

### Forcer le rafraîchissement

```tsx
const { refresh } = useBackend();
await refresh(); // Reteste la connexion
```

---

## 📋 TODO pour l'intégration complète

- [ ] Installer `@supabase/supabase-js`
- [ ] Configurer `.env` avec les clés Supabase
- [ ] Créer le projet Supabase et exécuter les migrations
- [ ] Importer les données existantes
- [ ] Remplacer les imports directs par les hooks
- [ ] Tester le mode offline
- [ ] Implémenter l'authentification
- [ ] Migrer les données utilisateur
