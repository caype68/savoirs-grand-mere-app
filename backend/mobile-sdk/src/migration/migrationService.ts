// ============================================
// SERVICE DE MIGRATION
// Migre les données locales vers Supabase
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

// Clés AsyncStorage existantes
const LOCAL_STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  WELLNESS_LOGS: '@wellness_logs',
  FAVORITES: '@favorites',
  REMEDY_HISTORY: '@remedy_history',
  STREAK: '@user_streak',
  DAILY_RECOMMENDATIONS: '@daily_recommendations',
  DAILY_ROUTINES: '@daily_routines',
};

// ============================================
// TYPES
// ============================================

interface MigrationResult {
  success: boolean;
  migratedItems: {
    profile: boolean;
    wellnessLogs: number;
    favorites: number;
    history: number;
    streak: boolean;
  };
  errors: string[];
}

// ============================================
// MIGRATION PRINCIPALE
// ============================================

/**
 * Migre toutes les données locales vers le backend
 */
export async function migrateLocalDataToBackend(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedItems: {
      profile: false,
      wellnessLogs: 0,
      favorites: 0,
      history: 0,
      streak: false,
    },
    errors: [],
  };

  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      result.errors.push('Utilisateur non connecté');
      return result;
    }

    const userId = user.id;

    // 1. Migrer le profil
    try {
      const profileMigrated = await migrateProfile(userId);
      result.migratedItems.profile = profileMigrated;
    } catch (error) {
      result.errors.push(`Profil: ${error}`);
    }

    // 2. Migrer les logs bien-être
    try {
      const logsCount = await migrateWellnessLogs(userId);
      result.migratedItems.wellnessLogs = logsCount;
    } catch (error) {
      result.errors.push(`Wellness logs: ${error}`);
    }

    // 3. Migrer les favoris
    try {
      const favoritesCount = await migrateFavorites(userId);
      result.migratedItems.favorites = favoritesCount;
    } catch (error) {
      result.errors.push(`Favoris: ${error}`);
    }

    // 4. Migrer l'historique
    try {
      const historyCount = await migrateRemedyHistory(userId);
      result.migratedItems.history = historyCount;
    } catch (error) {
      result.errors.push(`Historique: ${error}`);
    }

    // 5. Migrer le streak
    try {
      const streakMigrated = await migrateStreak(userId);
      result.migratedItems.streak = streakMigrated;
    } catch (error) {
      result.errors.push(`Streak: ${error}`);
    }

    result.success = result.errors.length === 0;
    
    // Marquer la migration comme effectuée
    if (result.success) {
      await AsyncStorage.setItem('@migration_completed', new Date().toISOString());
    }

    return result;
  } catch (error) {
    result.errors.push(`Erreur générale: ${error}`);
    return result;
  }
}

// ============================================
// MIGRATIONS INDIVIDUELLES
// ============================================

/**
 * Migre le profil utilisateur
 */
async function migrateProfile(userId: string): Promise<boolean> {
  const localProfile = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
  if (!localProfile) return false;

  const profile = JSON.parse(localProfile);

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      display_name: profile.nom || null,
      age: profile.age || null,
      profile_type: mapProfileType(profile.type),
      experience_level: profile.niveau || 'debutant',
      allergies: profile.allergies || [],
      restrictions: profile.restrictions || [],
      notifications_enabled: profile.notifications?.enabled ?? true,
      notification_frequency: profile.notifications?.frequence || 'quotidien',
      onboarding_completed: profile.onboardingComplete ?? false,
    });

  if (error) throw error;

  // Migrer les objectifs
  if (profile.objectifs && profile.objectifs.length > 0) {
    for (const objectif of profile.objectifs) {
      await supabase
        .from('user_goals')
        .upsert({
          user_id: userId,
          goal_type: objectif,
          name: getGoalName(objectif),
          is_active: true,
        }, {
          onConflict: 'user_id,goal_type',
        });
    }
  }

  return true;
}

/**
 * Migre les logs bien-être
 */
async function migrateWellnessLogs(userId: string): Promise<number> {
  const localLogs = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.WELLNESS_LOGS);
  if (!localLogs) return 0;

  const logs = JSON.parse(localLogs);
  let count = 0;

  for (const log of logs) {
    const { error } = await supabase
      .from('wellness_logs')
      .upsert({
        user_id: userId,
        date: log.dateKey || log.date?.split('T')[0],
        sleep_quality: log.sommeil?.qualite || null,
        stress_level: log.stress || null,
        energy_level: log.energie || null,
        mood_level: log.humeur || null,
        symptoms: log.symptomes || [],
        notes: log.noteLibre || null,
        is_validated: log.isValidated ?? true,
      }, {
        onConflict: 'user_id,date',
      });

    if (!error) count++;
  }

  return count;
}

/**
 * Migre les favoris
 */
async function migrateFavorites(userId: string): Promise<number> {
  const localFavorites = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES);
  if (!localFavorites) return 0;

  const favorites = JSON.parse(localFavorites);
  let count = 0;

  for (const fav of favorites) {
    // Trouver le remède correspondant dans la base
    const { data: remedy } = await supabase
      .from('remedies')
      .select('id')
      .eq('slug', fav.remedeId)
      .single();

    if (remedy) {
      const { error } = await supabase
        .from('user_remedy_history')
        .upsert({
          user_id: userId,
          remedy_id: remedy.id,
          is_favorite: true,
          notes: fav.note || null,
        }, {
          onConflict: 'user_id,remedy_id',
        });

      if (!error) count++;
    }
  }

  return count;
}

/**
 * Migre l'historique des remèdes
 */
async function migrateRemedyHistory(userId: string): Promise<number> {
  const localHistory = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.REMEDY_HISTORY);
  if (!localHistory) return 0;

  const history = JSON.parse(localHistory);
  let count = 0;

  for (const item of history) {
    const { data: remedy } = await supabase
      .from('remedies')
      .select('id')
      .eq('slug', item.remedyId)
      .single();

    if (remedy) {
      const { error } = await supabase
        .from('user_remedy_history')
        .upsert({
          user_id: userId,
          remedy_id: remedy.id,
          view_count: item.viewCount || 0,
          used_count: item.usedCount || 0,
          effectiveness_score: item.effectivenessScore || null,
          is_favorite: item.isFavorite || false,
        }, {
          onConflict: 'user_id,remedy_id',
        });

      if (!error) count++;
    }
  }

  return count;
}

/**
 * Migre le streak
 */
async function migrateStreak(userId: string): Promise<boolean> {
  const localStreak = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.STREAK);
  if (!localStreak) return false;

  const streak = JSON.parse(localStreak);

  const { error } = await supabase
    .from('streaks')
    .upsert({
      user_id: userId,
      current_streak: streak.currentStreak || 0,
      best_streak: streak.bestStreak || 0,
      total_active_days: streak.totalActiveDays || 0,
      last_active_date: streak.lastActiveDate || null,
      streak_start_date: streak.streakStartDate || null,
    }, {
      onConflict: 'user_id',
    });

  if (error) throw error;

  // Migrer les badges débloqués
  if (streak.badges) {
    for (const badge of streak.badges) {
      if (badge.isUnlocked) {
        const { data: badgeData } = await supabase
          .from('badges')
          .select('id')
          .eq('slug', badge.type)
          .single();

        if (badgeData) {
          await supabase
            .from('user_badges')
            .upsert({
              user_id: userId,
              badge_id: badgeData.id,
              unlocked_at: badge.unlockedAt || new Date().toISOString(),
            }, {
              onConflict: 'user_id,badge_id',
            });
        }
      }
    }
  }

  return true;
}

// ============================================
// UTILITAIRES
// ============================================

function mapProfileType(type: string): string {
  const mapping: Record<string, string> = {
    'adulte': 'adulte',
    'enfant': 'enfant',
    'senior': 'senior',
    'enceinte': 'enceinte',
    'allaitante': 'allaitante',
  };
  return mapping[type] || 'adulte';
}

function getGoalName(goalType: string): string {
  const names: Record<string, string> = {
    'dormir_mieux': 'Dormir mieux',
    'reduire_stress': 'Réduire le stress',
    'booster_energie': 'Booster l\'énergie',
    'ameliorer_digestion': 'Améliorer la digestion',
    'renforcer_immunite': 'Renforcer l\'immunité',
    'soulager_douleurs': 'Soulager les douleurs',
    'ameliorer_peau': 'Améliorer la peau',
    'ameliorer_humeur': 'Améliorer l\'humeur',
  };
  return names[goalType] || goalType;
}

/**
 * Vérifie si la migration a déjà été effectuée
 */
export async function isMigrationCompleted(): Promise<boolean> {
  const migrationDate = await AsyncStorage.getItem('@migration_completed');
  return migrationDate !== null;
}

/**
 * Nettoie les données locales après migration réussie
 */
export async function clearLocalDataAfterMigration(): Promise<void> {
  const keys = Object.values(LOCAL_STORAGE_KEYS);
  await AsyncStorage.multiRemove(keys);
}

// ============================================
// EXPORTS
// ============================================

export default {
  migrateLocalDataToBackend,
  isMigrationCompleted,
  clearLocalDataAfterMigration,
};
