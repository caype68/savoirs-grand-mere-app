// ============================================
// SERVICE DE MIGRATION - LOCAL VERS SUPABASE
// Migre les données locales vers le backend
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from './config';
import { isUsingRemote } from './backendProvider';
import { WellnessLog, UserProfile, FavoriNote } from '../../types';

// ============================================
// CONSTANTES
// ============================================

const MIGRATION_KEY = '@migration_completed';
const MIGRATION_VERSION = '1.0.0';

// Clés AsyncStorage à migrer
const LOCAL_KEYS = {
  USER_PROFILE: '@user_profile',
  WELLNESS_LOGS: '@wellness_logs',
  FAVORITES: '@favoris',
  FAVORITES_NOTES: '@favoris_notes',
  REMEDY_HISTORY: '@remedy_history',
  STREAK: '@user_streak',
  BADGES: '@user_badges',
  DAILY_RECOMMENDATIONS: '@daily_recommendations',
  JOURNAL: '@journal_entries',
};

// ============================================
// TYPES
// ============================================

export interface MigrationStatus {
  completed: boolean;
  version: string;
  migratedAt: string | null;
  itemsMigrated: {
    profile: boolean;
    wellnessLogs: number;
    favorites: number;
    history: number;
    streak: boolean;
    badges: number;
  };
  errors: string[];
}

export interface MigrationResult {
  success: boolean;
  status: MigrationStatus;
  error?: string;
}

// ============================================
// VÉRIFICATION DE MIGRATION
// ============================================

/**
 * Vérifie si la migration a déjà été effectuée
 */
export async function isMigrationCompleted(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(MIGRATION_KEY);
    if (!data) return false;
    
    const status = JSON.parse(data) as MigrationStatus;
    return status.completed && status.version === MIGRATION_VERSION;
  } catch {
    return false;
  }
}

/**
 * Récupère le statut de migration
 */
export async function getMigrationStatus(): Promise<MigrationStatus> {
  try {
    const data = await AsyncStorage.getItem(MIGRATION_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Migration] Error reading status:', err);
  }
  
  return {
    completed: false,
    version: MIGRATION_VERSION,
    migratedAt: null,
    itemsMigrated: {
      profile: false,
      wellnessLogs: 0,
      favorites: 0,
      history: 0,
      streak: false,
      badges: 0,
    },
    errors: [],
  };
}

// ============================================
// MIGRATION PRINCIPALE
// ============================================

/**
 * Lance la migration complète des données locales vers Supabase
 */
export async function migrateLocalDataToSupabase(userId: string): Promise<MigrationResult> {
  const client = getSupabaseClient();
  
  if (!client || !isUsingRemote()) {
    return {
      success: false,
      status: await getMigrationStatus(),
      error: 'Backend non disponible',
    };
  }

  const status: MigrationStatus = {
    completed: false,
    version: MIGRATION_VERSION,
    migratedAt: null,
    itemsMigrated: {
      profile: false,
      wellnessLogs: 0,
      favorites: 0,
      history: 0,
      streak: false,
      badges: 0,
    },
    errors: [],
  };

  try {
    console.log('[Migration] Starting migration for user:', userId);

    // 1. Migrer le profil
    try {
      const profileMigrated = await migrateProfile(client, userId);
      status.itemsMigrated.profile = profileMigrated;
    } catch (err: any) {
      status.errors.push(`Profile: ${err.message}`);
    }

    // 2. Migrer les wellness logs
    try {
      const logsCount = await migrateWellnessLogs(client, userId);
      status.itemsMigrated.wellnessLogs = logsCount;
    } catch (err: any) {
      status.errors.push(`WellnessLogs: ${err.message}`);
    }

    // 3. Migrer les favoris
    try {
      const favCount = await migrateFavorites(client, userId);
      status.itemsMigrated.favorites = favCount;
    } catch (err: any) {
      status.errors.push(`Favorites: ${err.message}`);
    }

    // 4. Migrer l'historique des remèdes
    try {
      const historyCount = await migrateRemedyHistory(client, userId);
      status.itemsMigrated.history = historyCount;
    } catch (err: any) {
      status.errors.push(`History: ${err.message}`);
    }

    // 5. Migrer le streak
    try {
      const streakMigrated = await migrateStreak(client, userId);
      status.itemsMigrated.streak = streakMigrated;
    } catch (err: any) {
      status.errors.push(`Streak: ${err.message}`);
    }

    // 6. Migrer les badges
    try {
      const badgesCount = await migrateBadges(client, userId);
      status.itemsMigrated.badges = badgesCount;
    } catch (err: any) {
      status.errors.push(`Badges: ${err.message}`);
    }

    // Marquer comme terminé
    status.completed = true;
    status.migratedAt = new Date().toISOString();
    
    await AsyncStorage.setItem(MIGRATION_KEY, JSON.stringify(status));
    
    console.log('[Migration] Migration completed:', status);
    
    return { success: true, status };
  } catch (err: any) {
    console.error('[Migration] Migration failed:', err);
    status.errors.push(`Global: ${err.message}`);
    
    return {
      success: false,
      status,
      error: err.message,
    };
  }
}

// ============================================
// MIGRATIONS INDIVIDUELLES
// ============================================

/**
 * Migre le profil utilisateur
 */
async function migrateProfile(client: any, userId: string): Promise<boolean> {
  const data = await AsyncStorage.getItem(LOCAL_KEYS.USER_PROFILE);
  if (!data) return false;

  const profile: UserProfile = JSON.parse(data);
  
  const { error } = await client.from('user_profiles').upsert({
    id: userId,
    nom: profile.nom,
    email: profile.email,
    age: profile.age,
    sexe: profile.sexe,
    profile_type: profile.profileType,
    objectifs: profile.objectifs,
    formats_preferes: profile.formatsPreferes,
    allergies: profile.allergies,
    restrictions: profile.restrictions,
    niveau_experience: profile.niveauExperience,
    notifications_enabled: profile.notificationsEnabled,
    notification_frequency: profile.notificationFrequency,
    notification_horaires: profile.notificationHoraires,
    interesse_par_produits: profile.interesseParProduits,
    onboarding_completed: profile.onboardingCompleted,
    avatar_uri: profile.avatarUri,
    created_at: profile.createdAt,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (error) throw error;
  return true;
}

/**
 * Migre les wellness logs
 */
async function migrateWellnessLogs(client: any, userId: string): Promise<number> {
  const data = await AsyncStorage.getItem(LOCAL_KEYS.WELLNESS_LOGS);
  if (!data) return 0;

  const logs: WellnessLog[] = JSON.parse(data);
  let count = 0;

  for (const log of logs) {
    const { error } = await client.from('wellness_logs').upsert({
      id: log.id,
      user_id: userId,
      date: log.date,
      date_key: log.dateKey,
      sommeil_qualite: log.sommeil.qualite,
      sommeil_heures: log.sommeil.heures,
      sommeil_difficulte_endormissement: log.sommeil.difficulteEndormissement,
      sommeil_reveils_nocturnes: log.sommeil.reveilsNocturnes,
      stress: log.stress,
      humeur: log.humeur,
      energie: log.energie,
      symptomes: log.symptomes,
      note_libre: log.noteLibre,
      remedes_utilises: log.remedesUtilises,
      is_validated: log.isValidated,
      created_at: log.createdAt,
    }, { onConflict: 'id' });

    if (!error) count++;
  }

  return count;
}

/**
 * Migre les favoris
 */
async function migrateFavorites(client: any, userId: string): Promise<number> {
  const favData = await AsyncStorage.getItem(LOCAL_KEYS.FAVORITES);
  const notesData = await AsyncStorage.getItem(LOCAL_KEYS.FAVORITES_NOTES);
  
  if (!favData) return 0;

  const favorites: string[] = JSON.parse(favData);
  const notes: FavoriNote[] = notesData ? JSON.parse(notesData) : [];
  let count = 0;

  for (const remedyId of favorites) {
    const note = notes.find(n => n.remedeId === remedyId);
    
    const { error } = await client.from('user_favorites').upsert({
      user_id: userId,
      remedy_id: remedyId,
      note: note?.note || null,
      created_at: note?.dateAjout || new Date().toISOString(),
    }, { onConflict: 'user_id,remedy_id' });

    if (!error) count++;
  }

  return count;
}

/**
 * Migre l'historique des remèdes
 */
async function migrateRemedyHistory(client: any, userId: string): Promise<number> {
  const data = await AsyncStorage.getItem(LOCAL_KEYS.REMEDY_HISTORY);
  if (!data) return 0;

  const history: any[] = JSON.parse(data);
  let count = 0;

  for (const item of history) {
    const { error } = await client.from('user_remedy_history').upsert({
      user_id: userId,
      remedy_id: item.remedyId,
      remedy_name: item.remedyName,
      view_count: item.viewCount || 1,
      used_count: item.usedCount || 0,
      last_viewed: item.lastViewed,
      last_used: item.lastUsed,
      effectiveness_score: item.effectivenessScore,
      is_favorite: item.isFavorite || false,
      notes: item.notes,
    }, { onConflict: 'user_id,remedy_id' });

    if (!error) count++;
  }

  return count;
}

/**
 * Migre le streak
 */
async function migrateStreak(client: any, userId: string): Promise<boolean> {
  const data = await AsyncStorage.getItem(LOCAL_KEYS.STREAK);
  if (!data) return false;

  const streak = JSON.parse(data);
  
  const { error } = await client.from('user_streaks').upsert({
    user_id: userId,
    current_streak: streak.currentStreak || 0,
    best_streak: streak.bestStreak || 0,
    last_activity_date: streak.lastActivityDate || streak.lastActiveDate,
    total_days: streak.totalDays || streak.totalActiveDays || 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) throw error;
  return true;
}

/**
 * Migre les badges
 */
async function migrateBadges(client: any, userId: string): Promise<number> {
  const data = await AsyncStorage.getItem(LOCAL_KEYS.BADGES);
  if (!data) return 0;

  const badges: any[] = JSON.parse(data);
  let count = 0;

  for (const badge of badges) {
    const { error } = await client.from('user_badges').upsert({
      user_id: userId,
      badge_id: badge.badgeId || badge.type,
      earned_at: badge.earnedAt || badge.unlockedAt || new Date().toISOString(),
    }, { onConflict: 'user_id,badge_id' });

    if (!error) count++;
  }

  return count;
}

// ============================================
// NETTOYAGE POST-MIGRATION
// ============================================

/**
 * Nettoie les données locales après migration réussie
 * ATTENTION: À utiliser avec précaution
 */
export async function cleanupLocalDataAfterMigration(): Promise<void> {
  const status = await getMigrationStatus();
  
  if (!status.completed) {
    console.warn('[Migration] Cannot cleanup: migration not completed');
    return;
  }

  // Ne pas supprimer les données critiques, juste marquer comme migrées
  // Les données locales servent de fallback
  console.log('[Migration] Local data kept as fallback');
}

/**
 * Réinitialise le statut de migration (pour tests)
 */
export async function resetMigrationStatus(): Promise<void> {
  await AsyncStorage.removeItem(MIGRATION_KEY);
  console.log('[Migration] Migration status reset');
}

// ============================================
// HOOK DE MIGRATION AUTOMATIQUE
// ============================================

/**
 * Vérifie et lance la migration si nécessaire
 * À appeler après connexion utilisateur
 */
export async function checkAndMigrate(userId: string): Promise<MigrationResult | null> {
  const alreadyMigrated = await isMigrationCompleted();
  
  if (alreadyMigrated) {
    console.log('[Migration] Already migrated, skipping');
    return null;
  }

  // Vérifier s'il y a des données locales à migrer
  const hasLocalData = await hasDataToMigrate();
  
  if (!hasLocalData) {
    console.log('[Migration] No local data to migrate');
    // Marquer comme terminé même sans données
    const status: MigrationStatus = {
      completed: true,
      version: MIGRATION_VERSION,
      migratedAt: new Date().toISOString(),
      itemsMigrated: {
        profile: false,
        wellnessLogs: 0,
        favorites: 0,
        history: 0,
        streak: false,
        badges: 0,
      },
      errors: [],
    };
    await AsyncStorage.setItem(MIGRATION_KEY, JSON.stringify(status));
    return null;
  }

  console.log('[Migration] Starting automatic migration...');
  return migrateLocalDataToSupabase(userId);
}

/**
 * Vérifie s'il y a des données locales à migrer
 */
async function hasDataToMigrate(): Promise<boolean> {
  const keys = Object.values(LOCAL_KEYS);
  
  for (const key of keys) {
    const data = await AsyncStorage.getItem(key);
    if (data) return true;
  }
  
  return false;
}

// ============================================
// EXPORTS
// ============================================

export {
  LOCAL_KEYS,
  MIGRATION_VERSION,
};
