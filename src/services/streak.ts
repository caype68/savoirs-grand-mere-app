// ============================================
// SERVICE DE STREAK (GAMIFICATION)
// Gère les séries de jours consécutifs et badges
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserStreak,
  StreakBadge,
  StreakBadgeType,
} from '../types';

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEY = '@user_streak';

// Configuration des badges
export const STREAK_BADGES: StreakBadge[] = [
  {
    type: 'apprenti_herboriste',
    name: 'Apprenti Herboriste',
    description: '3 jours consécutifs d\'utilisation',
    icon: '🌱',
    requiredDays: 3,
    isUnlocked: false,
  },
  {
    type: 'routine_engagee',
    name: 'Routine Engagée',
    description: '7 jours consécutifs - Une semaine complète !',
    icon: '🌿',
    requiredDays: 7,
    isUnlocked: false,
  },
  {
    type: 'herboriste_confirme',
    name: 'Herboriste Confirmé',
    description: '14 jours consécutifs - Deux semaines de bien-être',
    icon: '🍃',
    requiredDays: 14,
    isUnlocked: false,
  },
  {
    type: 'maitre_remedes',
    name: 'Maître des Remèdes',
    description: '30 jours consécutifs - Un mois de sagesse naturelle',
    icon: '🌳',
    requiredDays: 30,
    isUnlocked: false,
  },
  {
    type: 'routine_parfaite',
    name: 'Routine Parfaite',
    description: '60 jours consécutifs - Deux mois d\'excellence',
    icon: '✨',
    requiredDays: 60,
    isUnlocked: false,
  },
  {
    type: 'legende_naturelle',
    name: 'Légende Naturelle',
    description: '100 jours consécutifs - Vous êtes une inspiration !',
    icon: '👑',
    requiredDays: 100,
    isUnlocked: false,
  },
];

// ============================================
// UTILITAIRES
// ============================================

/**
 * Retourne la date du jour au format YYYY-MM-DD
 */
export function getTodayDateKey(): string {
  const today = new Date();
  return formatStreakDateKey(today);
}

/**
 * Formate une date en YYYY-MM-DD
 */
function formatStreakDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcule la différence en jours entre deux dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Vérifie si une date est hier
 */
function isYesterday(dateKey: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatStreakDateKey(yesterday) === dateKey;
}

/**
 * Vérifie si une date est aujourd'hui
 */
function isToday(dateKey: string): boolean {
  return getTodayDateKey() === dateKey;
}

// ============================================
// GESTION DU STREAK
// ============================================

/**
 * Récupère le streak de l'utilisateur
 */
export async function getUserStreak(): Promise<UserStreak> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[Streak] Error getting streak:', error);
  }
  
  // Retourner un streak vide par défaut
  return createEmptyStreak();
}

/**
 * Crée un streak vide
 */
function createEmptyStreak(): UserStreak {
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: '',
    totalActiveDays: 0,
    streakStartDate: '',
    badges: STREAK_BADGES.map(b => ({ ...b })),
  };
}

/**
 * Sauvegarde le streak
 */
async function saveStreak(streak: UserStreak): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(streak));
  } catch (error) {
    console.error('[Streak] Error saving streak:', error);
    throw error;
  }
}

/**
 * Enregistre une activité pour aujourd'hui
 * Appelé quand l'utilisateur remplit son journal ou complète une routine
 */
export async function recordActivity(): Promise<{
  streak: UserStreak;
  newBadges: StreakBadge[];
  isNewDay: boolean;
}> {
  const streak = await getUserStreak();
  const today = getTodayDateKey();
  const newBadges: StreakBadge[] = [];
  
  // Si déjà actif aujourd'hui, ne rien faire
  if (streak.lastActiveDate === today) {
    return { streak, newBadges, isNewDay: false };
  }
  
  // Vérifier si c'est une continuation du streak
  if (streak.lastActiveDate === '' || isYesterday(streak.lastActiveDate)) {
    // Continuer le streak
    streak.currentStreak += 1;
    if (streak.streakStartDate === '') {
      streak.streakStartDate = today;
    }
  } else if (!isToday(streak.lastActiveDate)) {
    // Streak cassé - recommencer
    streak.currentStreak = 1;
    streak.streakStartDate = today;
  }
  
  // Mettre à jour les stats
  streak.lastActiveDate = today;
  streak.totalActiveDays += 1;
  
  // Mettre à jour le meilleur streak
  if (streak.currentStreak > streak.bestStreak) {
    streak.bestStreak = streak.currentStreak;
  }
  
  // Vérifier les nouveaux badges
  for (const badge of streak.badges) {
    if (!badge.isUnlocked && streak.currentStreak >= badge.requiredDays) {
      badge.isUnlocked = true;
      badge.unlockedAt = new Date().toISOString();
      newBadges.push(badge);
    }
  }
  
  // Sauvegarder
  await saveStreak(streak);
  
  console.log(`[Streak] Activity recorded. Current streak: ${streak.currentStreak}`);
  
  return { streak, newBadges, isNewDay: true };
}

/**
 * Vérifie et met à jour le streak (à appeler au démarrage de l'app)
 */
export async function checkAndUpdateStreak(): Promise<UserStreak> {
  const streak = await getUserStreak();
  const today = getTodayDateKey();
  
  // Si pas d'activité enregistrée, retourner tel quel
  if (streak.lastActiveDate === '') {
    return streak;
  }
  
  // Si la dernière activité était aujourd'hui ou hier, le streak est intact
  if (isToday(streak.lastActiveDate) || isYesterday(streak.lastActiveDate)) {
    return streak;
  }
  
  // Sinon, le streak est cassé
  const daysMissed = daysBetween(streak.lastActiveDate, today);
  if (daysMissed > 1) {
    console.log(`[Streak] Streak broken. Days missed: ${daysMissed}`);
    streak.currentStreak = 0;
    streak.streakStartDate = '';
    await saveStreak(streak);
  }
  
  return streak;
}

/**
 * Récupère le prochain badge à débloquer
 */
export async function getNextBadge(): Promise<StreakBadge | null> {
  const streak = await getUserStreak();
  
  const lockedBadges = streak.badges
    .filter(b => !b.isUnlocked)
    .sort((a, b) => a.requiredDays - b.requiredDays);
  
  return lockedBadges[0] || null;
}

/**
 * Récupère les badges débloqués
 */
export async function getUnlockedBadges(): Promise<StreakBadge[]> {
  const streak = await getUserStreak();
  return streak.badges.filter(b => b.isUnlocked);
}

/**
 * Calcule la progression vers le prochain badge
 */
export async function getBadgeProgress(): Promise<{
  currentStreak: number;
  nextBadge: StreakBadge | null;
  progress: number; // 0-100
  daysRemaining: number;
}> {
  const streak = await getUserStreak();
  const nextBadge = await getNextBadge();
  
  if (!nextBadge) {
    return {
      currentStreak: streak.currentStreak,
      nextBadge: null,
      progress: 100,
      daysRemaining: 0,
    };
  }
  
  const progress = Math.min(100, (streak.currentStreak / nextBadge.requiredDays) * 100);
  const daysRemaining = Math.max(0, nextBadge.requiredDays - streak.currentStreak);
  
  return {
    currentStreak: streak.currentStreak,
    nextBadge,
    progress,
    daysRemaining,
  };
}

/**
 * Réinitialise le streak (pour debug/test)
 */
export async function resetStreak(): Promise<void> {
  await saveStreak(createEmptyStreak());
  console.log('[Streak] Streak reset');
}

// ============================================
// MESSAGES MOTIVATIONNELS
// ============================================

export function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return "Commencez votre série aujourd'hui !";
  }
  if (streak === 1) {
    return "Premier jour ! Continuez demain 💪";
  }
  if (streak < 3) {
    return `${streak} jours ! Encore ${3 - streak} pour votre premier badge`;
  }
  if (streak < 7) {
    return `${streak} jours de suite ! Objectif : 7 jours 🎯`;
  }
  if (streak < 14) {
    return `${streak} jours ! Vous êtes sur une belle lancée 🌿`;
  }
  if (streak < 30) {
    return `${streak} jours ! Impressionnant, continuez 🌳`;
  }
  if (streak < 60) {
    return `${streak} jours ! Vous êtes un Maître des Remèdes ✨`;
  }
  if (streak < 100) {
    return `${streak} jours ! La légende est proche 👑`;
  }
  return `${streak} jours ! Vous êtes une Légende Naturelle 🏆`;
}

/**
 * Récupère un message d'encouragement basé sur le contexte
 */
export function getEncouragementMessage(streak: UserStreak): string {
  const today = getTodayDateKey();
  
  // Si pas encore actif aujourd'hui
  if (streak.lastActiveDate !== today) {
    if (streak.currentStreak > 0) {
      return `Ne cassez pas votre série de ${streak.currentStreak} jours !`;
    }
    return "Commencez votre routine bien-être aujourd'hui";
  }
  
  // Si déjà actif aujourd'hui
  if (streak.currentStreak === streak.bestStreak && streak.currentStreak > 1) {
    return `Record personnel : ${streak.bestStreak} jours ! 🎉`;
  }
  
  return getStreakMessage(streak.currentStreak);
}

// ============================================
// EXPORTS
// ============================================

export {
  STORAGE_KEY as STREAK_STORAGE_KEY,
};
