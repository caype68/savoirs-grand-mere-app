// ============================================
// API BIEN-ÊTRE
// Services pour le journal et les recommandations
// ============================================

import { supabase } from '../supabase';
import { WellnessLog, DailyRecommendation, DailyRoutine, Streak } from '../types/database';

// ============================================
// JOURNAL BIEN-ÊTRE
// ============================================

/**
 * Récupère le journal du jour
 */
export async function getTodayWellnessLog(userId: string): Promise<WellnessLog | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('wellness_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[API] Error fetching today wellness log:', error);
    throw error;
  }

  return data;
}

/**
 * Récupère l'historique du journal
 */
export async function getWellnessLogs(
  userId: string, 
  limit: number = 30
): Promise<WellnessLog[]> {
  const { data, error } = await supabase
    .from('wellness_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[API] Error fetching wellness logs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Sauvegarde une entrée du journal
 */
export async function saveWellnessLog(
  userId: string,
  log: Omit<WellnessLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<WellnessLog> {
  const { data, error } = await supabase
    .from('wellness_logs')
    .upsert({
      user_id: userId,
      ...log,
    }, {
      onConflict: 'user_id,date',
    })
    .select()
    .single();

  if (error) {
    console.error('[API] Error saving wellness log:', error);
    throw error;
  }

  return data;
}

/**
 * Valide le journal du jour
 */
export async function validateWellnessLog(
  userId: string,
  date: string
): Promise<WellnessLog> {
  const { data, error } = await supabase
    .from('wellness_logs')
    .update({
      is_validated: true,
      validated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('date', date)
    .select()
    .single();

  if (error) {
    console.error('[API] Error validating wellness log:', error);
    throw error;
  }

  return data;
}

// ============================================
// RECOMMANDATIONS QUOTIDIENNES
// ============================================

/**
 * Récupère la recommandation du jour
 */
export async function getTodayRecommendation(userId: string): Promise<DailyRecommendation | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_recommendations')
    .select(`
      *,
      remedies (*)
    `)
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[API] Error fetching today recommendation:', error);
    throw error;
  }

  return data;
}

/**
 * Récupère l'historique des recommandations
 */
export async function getRecommendationHistory(
  userId: string,
  limit: number = 7
): Promise<DailyRecommendation[]> {
  const { data, error } = await supabase
    .from('daily_recommendations')
    .select(`
      *,
      remedies (id, name, slug)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[API] Error fetching recommendation history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Marque une recommandation comme vue
 */
export async function markRecommendationViewed(
  userId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from('daily_recommendations')
    .update({
      is_viewed: true,
      viewed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('date', date);

  if (error) {
    console.error('[API] Error marking recommendation viewed:', error);
    throw error;
  }
}

/**
 * Sauvegarde une recommandation en favoris
 */
export async function saveRecommendationToFavorites(
  userId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from('daily_recommendations')
    .update({
      is_saved: true,
      saved_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('date', date);

  if (error) {
    console.error('[API] Error saving recommendation:', error);
    throw error;
  }
}

// ============================================
// ROUTINES QUOTIDIENNES
// ============================================

/**
 * Récupère la routine du jour
 */
export async function getTodayRoutine(userId: string): Promise<DailyRoutine | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_routines')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[API] Error fetching today routine:', error);
    throw error;
  }

  return data;
}

/**
 * Marque une routine comme complétée
 */
export async function completeRoutine(
  userId: string,
  date: string,
  routineType: 'morning' | 'evening'
): Promise<DailyRoutine> {
  const updateData = routineType === 'morning'
    ? { morning_completed: true, morning_completed_at: new Date().toISOString() }
    : { evening_completed: true, evening_completed_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from('daily_routines')
    .update(updateData)
    .eq('user_id', userId)
    .eq('date', date)
    .select()
    .single();

  if (error) {
    console.error('[API] Error completing routine:', error);
    throw error;
  }

  return data;
}

// ============================================
// STREAKS
// ============================================

/**
 * Récupère le streak de l'utilisateur
 */
export async function getUserStreak(userId: string): Promise<Streak | null> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[API] Error fetching streak:', error);
    throw error;
  }

  return data;
}

/**
 * Met à jour le streak après une activité
 */
export async function recordActivity(userId: string): Promise<Streak> {
  // Appeler une fonction RPC côté serveur pour gérer la logique
  const { data, error } = await supabase.rpc('record_user_activity', {
    p_user_id: userId,
  });

  if (error) {
    console.error('[API] Error recording activity:', error);
    throw error;
  }

  return data;
}

/**
 * Récupère les badges de l'utilisateur
 */
export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badges (*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) {
    console.error('[API] Error fetching user badges:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// STATISTIQUES
// ============================================

/**
 * Calcule les statistiques de bien-être
 */
export async function getWellnessStats(userId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('wellness_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('[API] Error fetching wellness stats:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Calculer les moyennes
  const stats = {
    averageSleep: 0,
    averageStress: 0,
    averageEnergy: 0,
    averageMood: 0,
    totalLogs: data.length,
    dataPoints: data,
  };

  let sleepSum = 0, stressSum = 0, energySum = 0, moodSum = 0;
  let sleepCount = 0, stressCount = 0, energyCount = 0, moodCount = 0;

  for (const log of data) {
    if (log.sleep_quality) { sleepSum += log.sleep_quality; sleepCount++; }
    if (log.stress_level) { stressSum += log.stress_level; stressCount++; }
    if (log.energy_level) { energySum += log.energy_level; energyCount++; }
    if (log.mood_level) { moodSum += log.mood_level; moodCount++; }
  }

  stats.averageSleep = sleepCount > 0 ? Math.round((sleepSum / sleepCount) * 10) / 10 : 0;
  stats.averageStress = stressCount > 0 ? Math.round((stressSum / stressCount) * 10) / 10 : 0;
  stats.averageEnergy = energyCount > 0 ? Math.round((energySum / energyCount) * 10) / 10 : 0;
  stats.averageMood = moodCount > 0 ? Math.round((moodSum / moodCount) * 10) / 10 : 0;

  return stats;
}

// ============================================
// EXPORTS
// ============================================

export default {
  getTodayWellnessLog,
  getWellnessLogs,
  saveWellnessLog,
  validateWellnessLog,
  getTodayRecommendation,
  getRecommendationHistory,
  markRecommendationViewed,
  saveRecommendationToFavorites,
  getTodayRoutine,
  completeRoutine,
  getUserStreak,
  recordActivity,
  getUserBadges,
  getWellnessStats,
};
