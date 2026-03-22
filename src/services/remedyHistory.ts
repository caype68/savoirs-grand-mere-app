// ============================================
// SERVICE D'HISTORIQUE DES REMÈDES
// Suivi des remèdes consultés, utilisés et efficaces
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserRemedyHistory,
  RemedyFeedback,
} from '../types';

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEYS = {
  HISTORY: '@remedy_history',
  FEEDBACK: '@remedy_feedback',
};

// ============================================
// GESTION DE L'HISTORIQUE
// ============================================

/**
 * Récupère tout l'historique des remèdes
 */
export async function getAllRemedyHistory(): Promise<UserRemedyHistory[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[RemedyHistory] Error getting history:', error);
    return [];
  }
}

/**
 * Récupère l'historique d'un remède spécifique
 */
export async function getRemedyHistory(remedyId: string): Promise<UserRemedyHistory | null> {
  const history = await getAllRemedyHistory();
  return history.find(h => h.remedyId === remedyId) || null;
}

/**
 * Sauvegarde l'historique
 */
async function saveHistory(history: UserRemedyHistory[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('[RemedyHistory] Error saving history:', error);
    throw error;
  }
}

/**
 * Enregistre une consultation de remède
 */
export async function recordRemedyView(
  remedyId: string,
  remedyName: string
): Promise<UserRemedyHistory> {
  const history = await getAllRemedyHistory();
  const now = new Date().toISOString();
  
  const existingIndex = history.findIndex(h => h.remedyId === remedyId);
  
  if (existingIndex >= 0) {
    // Mettre à jour l'existant
    history[existingIndex].viewCount += 1;
    history[existingIndex].lastViewed = now;
  } else {
    // Créer une nouvelle entrée
    history.push({
      remedyId,
      remedyName,
      viewCount: 1,
      usedCount: 0,
      lastViewed: now,
      isFavorite: false,
    });
  }
  
  await saveHistory(history);
  
  const updated = history.find(h => h.remedyId === remedyId)!;
  console.log(`[RemedyHistory] View recorded for ${remedyName}`);
  
  return updated;
}

/**
 * Enregistre une utilisation de remède
 */
export async function recordRemedyUse(
  remedyId: string,
  remedyName: string
): Promise<UserRemedyHistory> {
  const history = await getAllRemedyHistory();
  const now = new Date().toISOString();
  
  const existingIndex = history.findIndex(h => h.remedyId === remedyId);
  
  if (existingIndex >= 0) {
    history[existingIndex].usedCount += 1;
    history[existingIndex].lastUsed = now;
  } else {
    history.push({
      remedyId,
      remedyName,
      viewCount: 1,
      usedCount: 1,
      lastViewed: now,
      lastUsed: now,
      isFavorite: false,
    });
  }
  
  await saveHistory(history);
  
  const updated = history.find(h => h.remedyId === remedyId)!;
  console.log(`[RemedyHistory] Use recorded for ${remedyName}`);
  
  return updated;
}

/**
 * Met à jour le score d'efficacité d'un remède
 */
export async function updateEffectivenessScore(
  remedyId: string,
  score: number
): Promise<void> {
  const history = await getAllRemedyHistory();
  const existingIndex = history.findIndex(h => h.remedyId === remedyId);
  
  if (existingIndex >= 0) {
    // Calculer la moyenne avec le score existant
    const existing = history[existingIndex];
    if (existing.effectivenessScore) {
      existing.effectivenessScore = (existing.effectivenessScore + score) / 2;
    } else {
      existing.effectivenessScore = score;
    }
    
    await saveHistory(history);
    console.log(`[RemedyHistory] Effectiveness updated for ${remedyId}: ${score}`);
  }
}

/**
 * Toggle favori
 */
export async function toggleFavorite(remedyId: string): Promise<boolean> {
  const history = await getAllRemedyHistory();
  const existingIndex = history.findIndex(h => h.remedyId === remedyId);
  
  if (existingIndex >= 0) {
    history[existingIndex].isFavorite = !history[existingIndex].isFavorite;
    await saveHistory(history);
    return history[existingIndex].isFavorite;
  }
  
  return false;
}

/**
 * Ajoute une note à un remède
 */
export async function addRemedyNote(remedyId: string, note: string): Promise<void> {
  const history = await getAllRemedyHistory();
  const existingIndex = history.findIndex(h => h.remedyId === remedyId);
  
  if (existingIndex >= 0) {
    history[existingIndex].notes = note;
    await saveHistory(history);
  }
}

// ============================================
// REQUÊTES INTELLIGENTES
// ============================================

/**
 * Récupère les remèdes les plus consultés
 */
export async function getMostViewedRemedies(limit: number = 5): Promise<UserRemedyHistory[]> {
  const history = await getAllRemedyHistory();
  return history
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

/**
 * Récupère les remèdes les plus utilisés
 */
export async function getMostUsedRemedies(limit: number = 5): Promise<UserRemedyHistory[]> {
  const history = await getAllRemedyHistory();
  return history
    .filter(h => h.usedCount > 0)
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, limit);
}

/**
 * Récupère les remèdes les plus efficaces
 */
export async function getMostEffectiveRemedies(limit: number = 5): Promise<UserRemedyHistory[]> {
  const history = await getAllRemedyHistory();
  return history
    .filter(h => h.effectivenessScore !== undefined && h.effectivenessScore >= 4)
    .sort((a, b) => (b.effectivenessScore || 0) - (a.effectivenessScore || 0))
    .slice(0, limit);
}

/**
 * Récupère les remèdes favoris
 */
export async function getFavoriteRemedies(): Promise<UserRemedyHistory[]> {
  const history = await getAllRemedyHistory();
  return history.filter(h => h.isFavorite);
}

/**
 * Récupère les remèdes récemment consultés
 */
export async function getRecentlyViewedRemedies(limit: number = 10): Promise<UserRemedyHistory[]> {
  const history = await getAllRemedyHistory();
  return history
    .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
    .slice(0, limit);
}

/**
 * Récupère les remèdes récemment utilisés
 */
export async function getRecentlyUsedRemedies(limit: number = 10): Promise<UserRemedyHistory[]> {
  const history = await getAllRemedyHistory();
  return history
    .filter(h => h.lastUsed)
    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
    .slice(0, limit);
}

/**
 * Vérifie si un remède a été utilisé récemment (dans les X derniers jours)
 */
export async function wasRecentlyUsed(remedyId: string, days: number = 7): Promise<boolean> {
  const remedyHistory = await getRemedyHistory(remedyId);
  
  if (!remedyHistory?.lastUsed) return false;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return new Date(remedyHistory.lastUsed) >= cutoffDate;
}

// ============================================
// GESTION DES FEEDBACKS
// ============================================

/**
 * Récupère tous les feedbacks
 */
export async function getAllFeedback(): Promise<RemedyFeedback[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FEEDBACK);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[RemedyHistory] Error getting feedback:', error);
    return [];
  }
}

/**
 * Ajoute un feedback pour un remède
 */
export async function addRemedyFeedback(feedback: Omit<RemedyFeedback, 'id'>): Promise<RemedyFeedback> {
  const feedbacks = await getAllFeedback();
  
  const newFeedback: RemedyFeedback = {
    ...feedback,
    id: `feedback_${Date.now()}`,
  };
  
  feedbacks.push(newFeedback);
  
  await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbacks));
  
  // Mettre à jour le score d'efficacité dans l'historique
  await updateEffectivenessScore(feedback.remedyId, feedback.effectiveness);
  
  console.log(`[RemedyHistory] Feedback added for ${feedback.remedyId}`);
  
  return newFeedback;
}

/**
 * Récupère les feedbacks d'un remède
 */
export async function getRemedyFeedbacks(remedyId: string): Promise<RemedyFeedback[]> {
  const feedbacks = await getAllFeedback();
  return feedbacks.filter(f => f.remedyId === remedyId);
}

// ============================================
// STATISTIQUES
// ============================================

/**
 * Calcule les statistiques d'utilisation
 */
export async function getUsageStats(): Promise<{
  totalViews: number;
  totalUses: number;
  uniqueRemediesViewed: number;
  uniqueRemediesUsed: number;
  averageEffectiveness: number;
  favoritesCount: number;
}> {
  const history = await getAllRemedyHistory();
  
  const totalViews = history.reduce((sum, h) => sum + h.viewCount, 0);
  const totalUses = history.reduce((sum, h) => sum + h.usedCount, 0);
  const uniqueRemediesViewed = history.length;
  const uniqueRemediesUsed = history.filter(h => h.usedCount > 0).length;
  
  const withEffectiveness = history.filter(h => h.effectivenessScore !== undefined);
  const averageEffectiveness = withEffectiveness.length > 0
    ? withEffectiveness.reduce((sum, h) => sum + (h.effectivenessScore || 0), 0) / withEffectiveness.length
    : 0;
  
  const favoritesCount = history.filter(h => h.isFavorite).length;
  
  return {
    totalViews,
    totalUses,
    uniqueRemediesViewed,
    uniqueRemediesUsed,
    averageEffectiveness: Math.round(averageEffectiveness * 10) / 10,
    favoritesCount,
  };
}

/**
 * Récupère les IDs des remèdes à éviter (utilisés récemment)
 */
export async function getRecentlyUsedIds(days: number = 3): Promise<string[]> {
  const history = await getAllRemedyHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return history
    .filter(h => h.lastUsed && new Date(h.lastUsed) >= cutoffDate)
    .map(h => h.remedyId);
}

/**
 * Récupère les IDs des remèdes efficaces à privilégier
 */
export async function getEffectiveRemedyIds(): Promise<string[]> {
  const history = await getAllRemedyHistory();
  
  return history
    .filter(h => h.effectivenessScore !== undefined && h.effectivenessScore >= 4)
    .map(h => h.remedyId);
}

// ============================================
// EXPORTS
// ============================================

export {
  STORAGE_KEYS as HISTORY_STORAGE_KEYS,
};
