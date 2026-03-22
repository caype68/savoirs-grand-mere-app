// ============================================
// SERVICE API STREAK & BADGES - SUPABASE
// Gestion des streaks et badges avec fallback local
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from './config';
import { hybridQuery, isUsingRemote } from './backendProvider';

// ============================================
// CONSTANTES
// ============================================

const STREAK_KEY = '@user_streak';
const BADGES_KEY = '@user_badges';

// ============================================
// TYPES
// ============================================

export interface UserStreak {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  totalDays: number;
  updatedAt: string;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  earnedAt: string;
  category: 'streak' | 'activity' | 'exploration' | 'special';
}

export interface BadgeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'activity' | 'exploration' | 'special';
  requiredValue: number;
}

// ============================================
// BADGES DEFINITIONS
// ============================================

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: '1', slug: 'apprenti_herboriste', name: 'Apprenti Herboriste', description: '3 jours consécutifs', icon: '🌱', category: 'streak', requiredValue: 3 },
  { id: '2', slug: 'routine_engagee', name: 'Routine Engagée', description: '7 jours consécutifs', icon: '🌿', category: 'streak', requiredValue: 7 },
  { id: '3', slug: 'herboriste_confirme', name: 'Herboriste Confirmé', description: '14 jours consécutifs', icon: '🍃', category: 'streak', requiredValue: 14 },
  { id: '4', slug: 'maitre_remedes', name: 'Maître des Remèdes', description: '30 jours consécutifs', icon: '🌳', category: 'streak', requiredValue: 30 },
  { id: '5', slug: 'routine_parfaite', name: 'Routine Parfaite', description: '60 jours consécutifs', icon: '✨', category: 'streak', requiredValue: 60 },
  { id: '6', slug: 'legende_naturelle', name: 'Légende Naturelle', description: '100 jours consécutifs', icon: '👑', category: 'streak', requiredValue: 100 },
];

// ============================================
// HELPERS
// ============================================

function formatDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isYesterday(dateKey: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateKey(yesterday) === dateKey;
}

function isToday(dateKey: string): boolean {
  return formatDateKey() === dateKey;
}

// ============================================
// STREAK FUNCTIONS
// ============================================

/**
 * Récupère le streak de l'utilisateur
 */
export async function getUserStreak(): Promise<{ data: UserStreak; source: string }> {
  return hybridQuery<UserStreak>(
    // Remote
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data: { user } } = await client.auth.getUser();
      if (!user) return getDefaultStreak('guest');

      const { data, error } = await client
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return getDefaultStreak(user.id);
        throw error;
      }

      return convertSupabaseStreak(data);
    },
    // Local
    async () => {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return getDefaultStreak('guest');
    },
    { cacheKey: 'user_streak' }
  );
}

/**
 * Met à jour le streak après une activité
 */
export async function updateUserStreak(): Promise<{ data: UserStreak; newBadges: UserBadge[]; source: string }> {
  const today = formatDateKey();
  const { data: currentStreak } = await getUserStreak();
  
  let newStreak: UserStreak;
  const newBadges: UserBadge[] = [];

  // Calculer le nouveau streak
  if (isToday(currentStreak.lastActivityDate)) {
    // Déjà fait aujourd'hui, pas de changement
    newStreak = currentStreak;
  } else if (isYesterday(currentStreak.lastActivityDate)) {
    // Continuation du streak
    newStreak = {
      ...currentStreak,
      currentStreak: currentStreak.currentStreak + 1,
      bestStreak: Math.max(currentStreak.bestStreak, currentStreak.currentStreak + 1),
      lastActivityDate: today,
      totalDays: currentStreak.totalDays + 1,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Streak cassé, on recommence
    newStreak = {
      ...currentStreak,
      currentStreak: 1,
      lastActivityDate: today,
      totalDays: currentStreak.totalDays + 1,
      updatedAt: new Date().toISOString(),
    };
  }

  // Vérifier les nouveaux badges
  const { data: existingBadges } = await getUserBadges();
  const existingBadgeIds = existingBadges.map(b => b.badgeId);

  for (const badgeDef of BADGE_DEFINITIONS) {
    if (badgeDef.category === 'streak' && 
        newStreak.currentStreak >= badgeDef.requiredValue &&
        !existingBadgeIds.includes(badgeDef.id)) {
      const newBadge: UserBadge = {
        id: `badge_${Date.now()}_${badgeDef.id}`,
        badgeId: badgeDef.id,
        badgeName: badgeDef.name,
        badgeIcon: badgeDef.icon,
        badgeDescription: badgeDef.description,
        earnedAt: new Date().toISOString(),
        category: badgeDef.category,
      };
      newBadges.push(newBadge);
    }
  }

  // Sauvegarder
  const client = getSupabaseClient();
  let source = 'local';

  if (client && isUsingRemote()) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        await client.from('user_streaks').upsert({
          user_id: user.id,
          current_streak: newStreak.currentStreak,
          best_streak: newStreak.bestStreak,
          last_activity_date: newStreak.lastActivityDate,
          total_days: newStreak.totalDays,
          updated_at: newStreak.updatedAt,
        }, { onConflict: 'user_id' });

        // Sauvegarder les nouveaux badges
        for (const badge of newBadges) {
          await client.from('user_badges').insert({
            user_id: user.id,
            badge_id: badge.badgeId,
            earned_at: badge.earnedAt,
          });
        }

        source = 'remote';
      }
    } catch (err) {
      console.warn('Erreur sauvegarde streak remote:', err);
    }
  }

  // Toujours sauvegarder localement
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
  
  // Sauvegarder les badges localement
  if (newBadges.length > 0) {
    const allBadges = [...existingBadges, ...newBadges];
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(allBadges));
  }

  return { data: newStreak, newBadges, source };
}

/**
 * Récupère les badges de l'utilisateur
 */
export async function getUserBadges(): Promise<{ data: UserBadge[]; source: string }> {
  return hybridQuery<UserBadge[]>(
    // Remote
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data: { user } } = await client.auth.getUser();
      if (!user) return [];

      const { data, error } = await client
        .from('user_badges')
        .select(`
          *,
          badges:badge_id (
            id,
            slug,
            name,
            description,
            icon,
            badge_type
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        badgeId: item.badge_id,
        badgeName: item.badges?.name || 'Badge',
        badgeIcon: item.badges?.icon || '🏆',
        badgeDescription: item.badges?.description || '',
        earnedAt: item.earned_at,
        category: item.badges?.badge_type || 'streak',
      }));
    },
    // Local
    async () => {
      const stored = await AsyncStorage.getItem(BADGES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    },
    { cacheKey: 'user_badges' }
  );
}

// ============================================
// HELPERS
// ============================================

function getDefaultStreak(userId: string): UserStreak {
  return {
    userId,
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: '',
    totalDays: 0,
    updatedAt: new Date().toISOString(),
  };
}

function convertSupabaseStreak(data: any): UserStreak {
  return {
    userId: data.user_id,
    currentStreak: data.current_streak,
    bestStreak: data.best_streak,
    lastActivityDate: data.last_activity_date,
    totalDays: data.total_days,
    updatedAt: data.updated_at,
  };
}

// ============================================
// EXPORTS
// ============================================

export { BADGE_DEFINITIONS, formatDateKey };
