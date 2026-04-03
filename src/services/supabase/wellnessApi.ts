// ============================================
// SERVICE API WELLNESS - SUPABASE
// Gestion des logs bien-être avec fallback local
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from './config';
import { hybridQuery, isUsingRemote } from './backendProvider';
import { WellnessLog, DailyRecommendation, WellnessCategory } from '../../types';
import { remedes } from '../../data/remedes';

// ============================================
// CONSTANTES
// ============================================

const WELLNESS_LOGS_KEY = '@wellness_logs';
const DAILY_RECOMMENDATIONS_KEY = '@daily_recommendations';

// ============================================
// HELPERS
// ============================================

function formatDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// WELLNESS LOGS - CRUD
// ============================================

/**
 * Sauvegarde un log bien-être
 */
export async function saveWellnessLogToBackend(log: WellnessLog): Promise<{ data: WellnessLog; source: string }> {
  return hybridQuery<WellnessLog>(
    // Remote - Supabase
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const supabaseLog = {
        id: log.id,
        user_id: log.userId,
        date: log.date,
        date_key: log.dateKey,
        sleep_quality: log.sommeil.qualite,
        sleep_hours: log.sommeil.heures || null,
        sleep_difficulty: log.sommeil.difficulteEndormissement || false,
        sleep_interruptions: log.sommeil.reveilsNocturnes || false,
        stress_level: log.stress,
        mood_level: log.humeur,
        energy_level: log.energie,
        hydration: log.hydratation || null,
        digestion: log.digestion || null,
        symptoms: log.symptomes,
        cycle_day: log.cycleInfo?.jourCycle || null,
        cycle_period: log.cycleInfo?.regles || false,
        cycle_pain: log.cycleInfo?.douleurs || false,
        notes: log.noteLibre || null,
        remedies_used: log.remedesUtilises,
        is_validated: log.isValidated,
        created_at: log.createdAt,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from('wellness_logs')
        .upsert(supabaseLog, { onConflict: 'user_id,date_key' })
        .select()
        .single();

      if (error) throw error;
      return convertSupabaseWellnessLog(data);
    },
    // Local fallback
    async () => {
      const stored = await AsyncStorage.getItem(WELLNESS_LOGS_KEY);
      const logs: WellnessLog[] = stored ? JSON.parse(stored) : [];
      
      // Remplacer ou ajouter
      const existingIndex = logs.findIndex(l => l.dateKey === log.dateKey);
      if (existingIndex >= 0) {
        logs[existingIndex] = { ...log, updatedAt: new Date().toISOString() };
      } else {
        logs.unshift(log);
      }
      
      // Garder les 90 derniers jours
      const recentLogs = logs.slice(0, 90);
      await AsyncStorage.setItem(WELLNESS_LOGS_KEY, JSON.stringify(recentLogs));
      
      return log;
    },
    { cacheKey: `wellness_log_${log.dateKey}` }
  );
}

/**
 * Récupère le log du jour
 */
export async function getTodayWellnessLogFromBackend(): Promise<{ data: WellnessLog | null; source: string }> {
  const dateKey = formatDateKey();
  return getWellnessLogByDate(dateKey);
}

/**
 * Récupère un log par date
 */
export async function getWellnessLogByDate(dateKey: string): Promise<{ data: WellnessLog | null; source: string }> {
  return hybridQuery<WellnessLog | null>(
    // Remote
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('Not authenticated - use local storage');

      const { data, error } = await client
        .from('wellness_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_key', dateKey)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? convertSupabaseWellnessLog(data) : null;
    },
    // Local
    async () => {
      const stored = await AsyncStorage.getItem(WELLNESS_LOGS_KEY);
      if (!stored) return null;
      const logs: WellnessLog[] = JSON.parse(stored);
      return logs.find(l => l.dateKey === dateKey) || null;
    },
    { cacheKey: `wellness_log_${dateKey}` }
  );
}

/**
 * Récupère les logs récents
 */
export async function getRecentWellnessLogs(days: number = 7): Promise<{ data: WellnessLog[]; source: string }> {
  return hybridQuery<WellnessLog[]>(
    // Remote
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data: { user } } = await client.auth.getUser();
      if (!user) throw new Error('Not authenticated - use local storage');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await client
        .from('wellness_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date_key', formatDateKey(startDate))
        .order('date_key', { ascending: false })
        .limit(days);

      if (error) throw error;
      return (data || []).map(convertSupabaseWellnessLog);
    },
    // Local
    async () => {
      const stored = await AsyncStorage.getItem(WELLNESS_LOGS_KEY);
      if (!stored) return [];
      const logs: WellnessLog[] = JSON.parse(stored);
      return logs.slice(0, days);
    },
    { cacheKey: `wellness_logs_${days}` }
  );
}

// ============================================
// DAILY RECOMMENDATIONS
// ============================================

/**
 * Génère une recommandation basée sur le log wellness
 */
export async function generateDailyRecommendationFromLog(
  log: WellnessLog
): Promise<{ data: DailyRecommendation | null; source: string }> {
  return hybridQuery<DailyRecommendation | null>(
    // Remote - génération côté serveur si disponible
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      // Appeler une fonction RPC ou générer localement
      // Pour l'instant, on génère localement et on sauvegarde
      const recommendation = generateRecommendationLocally(log);
      if (!recommendation) return null;

      const supabaseReco = {
        id: recommendation.id,
        user_id: log.userId,
        date_key: recommendation.dateKey,
        wellness_log_id: recommendation.wellnessLogId,
        remedy_id: recommendation.remedyId,
        remedy_name: recommendation.remedyName,
        category: recommendation.category,
        reason: recommendation.reason,
        match_score: recommendation.matchScore,
        matched_tags: recommendation.matchedTags,
        priority: recommendation.priority,
        is_viewed: false,
        is_saved: false,
        generated_at: recommendation.generatedAt,
      };

      const { data, error } = await client
        .from('daily_recommendations')
        .upsert(supabaseReco, { onConflict: 'user_id,date_key' })
        .select()
        .single();

      if (error) throw error;
      return convertSupabaseRecommendation(data);
    },
    // Local
    async () => {
      const recommendation = generateRecommendationLocally(log);
      if (!recommendation) return null;

      // Sauvegarder localement
      const stored = await AsyncStorage.getItem(DAILY_RECOMMENDATIONS_KEY);
      const recommendations: DailyRecommendation[] = stored ? JSON.parse(stored) : [];
      
      const existingIndex = recommendations.findIndex(r => r.dateKey === recommendation.dateKey);
      if (existingIndex >= 0) {
        recommendations[existingIndex] = recommendation;
      } else {
        recommendations.unshift(recommendation);
      }
      
      await AsyncStorage.setItem(DAILY_RECOMMENDATIONS_KEY, JSON.stringify(recommendations.slice(0, 30)));
      return recommendation;
    },
    { cacheKey: `recommendation_${log.dateKey}` }
  );
}

/**
 * Récupère la recommandation du jour
 */
export async function getTodayRecommendation(): Promise<{ data: DailyRecommendation | null; source: string }> {
  const dateKey = formatDateKey();
  
  return hybridQuery<DailyRecommendation | null>(
    // Remote
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data: { user } } = await client.auth.getUser();
      if (!user) return null;

      const { data, error } = await client
        .from('daily_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_key', dateKey)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data ? convertSupabaseRecommendation(data) : null;
    },
    // Local
    async () => {
      const stored = await AsyncStorage.getItem(DAILY_RECOMMENDATIONS_KEY);
      if (!stored) return null;
      const recommendations: DailyRecommendation[] = JSON.parse(stored);
      return recommendations.find(r => r.dateKey === dateKey) || null;
    },
    { cacheKey: `recommendation_today` }
  );
}

/**
 * Marque une recommandation comme vue
 */
export async function markRecommendationViewed(recommendationId: string): Promise<void> {
  const client = getSupabaseClient();
  
  if (client && isUsingRemote()) {
    await client
      .from('daily_recommendations')
      .update({ is_viewed: true })
      .eq('id', recommendationId);
  }

  // Aussi mettre à jour localement
  const stored = await AsyncStorage.getItem(DAILY_RECOMMENDATIONS_KEY);
  if (stored) {
    const recommendations: DailyRecommendation[] = JSON.parse(stored);
    const index = recommendations.findIndex(r => r.id === recommendationId);
    if (index >= 0) {
      recommendations[index].isViewed = true;
      await AsyncStorage.setItem(DAILY_RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
    }
  }
}

// ============================================
// GÉNÉRATION LOCALE DE RECOMMANDATION
// ============================================

function generateRecommendationLocally(log: WellnessLog): DailyRecommendation | null {
  // Règles de matching
  const rules = [
    {
      condition: () => log.sommeil.qualite <= 2,
      category: 'sommeil' as WellnessCategory,
      tags: ['sommeil', 'relaxation', 'camomille', 'tilleul', 'lavande'],
      reason: 'Pour améliorer votre qualité de sommeil',
      priority: 1,
    },
    {
      condition: () => log.stress <= 2,
      category: 'stress' as WellnessCategory,
      tags: ['stress', 'anxiété', 'relaxation', 'nervosité', 'calme'],
      reason: 'Pour vous aider à gérer votre stress',
      priority: 1,
    },
    {
      condition: () => log.energie <= 2,
      category: 'energie' as WellnessCategory,
      tags: ['énergie', 'fatigue', 'vitalité', 'tonique', 'ginseng'],
      reason: 'Pour booster votre énergie naturellement',
      priority: 2,
    },
    {
      condition: () => log.humeur <= 2,
      category: 'humeur' as WellnessCategory,
      tags: ['humeur', 'moral', 'bien-être', 'millepertuis'],
      reason: 'Pour améliorer votre humeur',
      priority: 2,
    },
    {
      condition: () => log.symptomes.some(s => s.toLowerCase().includes('toux')),
      category: 'respiration' as WellnessCategory,
      tags: ['toux', 'gorge', 'respiration', 'thym', 'miel'],
      reason: 'Pour soulager votre toux',
      priority: 1,
    },
    {
      condition: () => log.symptomes.some(s => s.toLowerCase().includes('gorge')),
      category: 'respiration' as WellnessCategory,
      tags: ['gorge', 'mal de gorge', 'miel', 'citron', 'thym'],
      reason: 'Pour apaiser votre gorge',
      priority: 1,
    },
    {
      condition: () => log.symptomes.some(s => s.toLowerCase().includes('tête')),
      category: 'douleurs' as WellnessCategory,
      tags: ['maux de tête', 'migraine', 'menthe', 'lavande'],
      reason: 'Pour soulager vos maux de tête',
      priority: 1,
    },
    {
      condition: () => log.symptomes.some(s => s.toLowerCase().includes('digestion') || s.toLowerCase().includes('ballonnement')),
      category: 'digestion' as WellnessCategory,
      tags: ['digestion', 'ballonnements', 'menthe', 'gingembre', 'fenouil'],
      reason: 'Pour améliorer votre digestion',
      priority: 2,
    },
  ];

  // Trouver les règles qui matchent
  const matchingRules = rules.filter(rule => rule.condition());
  
  if (matchingRules.length === 0) {
    // Recommandation par défaut - bien-être général
    matchingRules.push({
      condition: () => true,
      category: 'bien_etre_general' as WellnessCategory,
      tags: ['bien-être', 'santé', 'naturel'],
      reason: 'Pour maintenir votre bien-être au quotidien',
      priority: 3,
    });
  }

  // Trier par priorité
  matchingRules.sort((a, b) => a.priority - b.priority);
  const bestRule = matchingRules[0];

  // Trouver un remède correspondant
  const matchingRemedies = remedes.filter(remede => {
    const remedeText = `${remede.nom} ${remede.indications.join(' ')}`.toLowerCase();
    return bestRule.tags.some(tag => remedeText.includes(tag.toLowerCase()));
  });

  if (matchingRemedies.length === 0) {
    // Prendre un remède aléatoire (avec guard si remedes est vide)
    if (remedes.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * Math.min(remedes.length, 10));
    matchingRemedies.push(remedes[randomIndex]);
  }

  // Sélectionner un remède avec un peu de variation
  const selectedIndex = Math.floor(Math.random() * Math.min(matchingRemedies.length, 3));
  const selectedRemedy = matchingRemedies[selectedIndex];

  // Guard final - ne devrait jamais arriver mais protège contre undefined
  if (!selectedRemedy) {
    return null;
  }

  const recommendation: DailyRecommendation = {
    id: generateId(),
    dateKey: log.dateKey,
    wellnessLogId: log.id,
    remedyId: selectedRemedy.id,
    remedyName: selectedRemedy.nom,
    category: bestRule.category,
    reason: bestRule.reason,
    matchScore: Math.floor(70 + Math.random() * 30), // 70-100
    matchedTags: bestRule.tags.slice(0, 3),
    priority: bestRule.priority,
    isViewed: false,
    isSavedToFavorites: false,
    generatedAt: new Date().toISOString(),
  };

  return recommendation;
}

// ============================================
// CONVERTERS
// ============================================

function convertSupabaseWellnessLog(data: any): WellnessLog {
  return {
    id: data.id || '',
    userId: data.user_id || 'guest',
    date: data.date || new Date().toISOString(),
    dateKey: data.date_key || '',
    sommeil: {
      qualite: data.sleep_quality ?? 0,
      heures: data.sleep_hours ?? undefined,
      difficulteEndormissement: data.sleep_difficulty ?? false,
      reveilsNocturnes: data.sleep_interruptions ?? false,
    },
    stress: data.stress_level ?? 0,
    humeur: data.mood_level ?? 0,
    energie: data.energy_level ?? 0,
    hydratation: data.hydration ?? undefined,
    digestion: data.digestion ?? undefined,
    symptomes: data.symptoms || [],
    cycleInfo: data.cycle_day ? {
      jourCycle: data.cycle_day,
      regles: data.cycle_period ?? false,
      douleurs: data.cycle_pain ?? false,
    } : undefined,
    noteLibre: data.notes ?? undefined,
    remedesUtilises: data.remedies_used || [],
    isValidated: data.is_validated ?? false,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || undefined,
  };
}

function convertSupabaseRecommendation(data: any): DailyRecommendation {
  return {
    id: data.id,
    dateKey: data.date_key,
    wellnessLogId: data.wellness_log_id,
    remedyId: data.remedy_id,
    remedyName: data.remedy_name,
    category: data.category,
    reason: data.reason,
    matchScore: data.match_score,
    matchedTags: data.matched_tags || [],
    priority: data.priority,
    isViewed: data.is_viewed,
    isSavedToFavorites: data.is_saved,
    generatedAt: data.generated_at,
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  formatDateKey,
  generateId,
};
