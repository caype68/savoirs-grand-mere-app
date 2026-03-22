// ============================================
// SERVICE DE ROUTINES QUOTIDIENNES
// Génère des routines matin/soir personnalisées
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DailyRoutine,
  RoutineBlock,
  UserGoalType,
  WellnessLog,
  Remede,
} from '../types';
import { remedes } from '../data/remedes';
import { getTodayKey, formatDateKey } from './dailyRecommendations';

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEY = '@daily_routines';

// Mapping objectifs -> tags de remèdes
const GOAL_TO_TAGS: Record<UserGoalType, string[]> = {
  'dormir_mieux': ['sommeil', 'relaxation', 'detente', 'nuit', 'insomnie', 'apaisant'],
  'reduire_stress': ['stress', 'anxiete', 'calme', 'relaxation', 'respiration', 'detente'],
  'booster_energie': ['energie', 'tonique', 'vitalite', 'fatigue', 'reveil', 'dynamisant'],
  'ameliorer_digestion': ['digestion', 'estomac', 'ventre', 'ballonnements', 'foie'],
  'renforcer_immunite': ['immunite', 'defense', 'hiver', 'prevention', 'rhume'],
  'soulager_douleurs': ['douleur', 'muscle', 'articulation', 'tension', 'anti-inflammatoire'],
  'ameliorer_peau': ['peau', 'beaute', 'cicatrisant', 'hydratant', 'acne'],
  'ameliorer_humeur': ['humeur', 'moral', 'bien-etre', 'joie', 'equilibre'],
  'concentration': ['concentration', 'memoire', 'mental', 'focus', 'clarte'],
  'detox': ['detox', 'purification', 'drainage', 'foie', 'reins'],
};

// Remèdes adaptés au matin
const MORNING_TAGS = ['energie', 'reveil', 'tonique', 'vitalite', 'concentration', 'dynamisant', 'respiration'];

// Remèdes adaptés au soir
const EVENING_TAGS = ['sommeil', 'relaxation', 'detente', 'calme', 'apaisant', 'nuit', 'stress'];

// Tips par type de routine
const MORNING_TIPS = [
  "Prenez quelques respirations profondes avant de commencer",
  "Buvez un grand verre d'eau au réveil",
  "Étirez-vous doucement pendant 2 minutes",
  "Exposez-vous à la lumière naturelle",
  "Prenez le temps de savourer votre infusion",
];

const EVENING_TIPS = [
  "Évitez les écrans 1h avant le coucher",
  "Créez une ambiance tamisée et calme",
  "Pratiquez quelques étirements doux",
  "Respirez profondément pendant 5 minutes",
  "Notez 3 choses positives de votre journée",
];

// ============================================
// UTILITAIRES
// ============================================

/**
 * Extrait les tags d'un remède
 */
function extractRemedyTags(remedy: Remede): string[] {
  const tags: string[] = [];
  
  // Depuis le nom
  tags.push(remedy.nom.toLowerCase());
  
  // Depuis les indications
  for (const indication of remedy.indications) {
    tags.push(indication.toLowerCase());
  }
  
  // Depuis les ingrédients
  for (const ing of remedy.ingredients) {
    tags.push(ing.nom.toLowerCase());
  }
  
  return tags;
}

/**
 * Calcule le score d'un remède pour un ensemble de tags cibles
 */
function scoreRemedyForTags(remedy: Remede, targetTags: string[]): number {
  const remedyTags = extractRemedyTags(remedy);
  let score = 0;
  
  for (const tag of targetTags) {
    if (remedyTags.some(rt => rt.includes(tag) || tag.includes(rt))) {
      score += 10;
    }
  }
  
  // Bonus si vérifié
  if (remedy.verifie) {
    score += 5;
  }
  
  return score;
}

/**
 * Sélectionne les meilleurs remèdes pour une routine
 */
function selectRemediesForRoutine(
  targetTags: string[],
  routineTags: string[],
  count: number = 2,
  excludeIds: string[] = []
): string[] {
  const combinedTags = [...targetTags, ...routineTags];
  
  const scoredRemedies = remedes
    .filter(r => !excludeIds.includes(r.id))
    .map(remedy => ({
      remedy,
      score: scoreRemedyForTags(remedy, combinedTags),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  // Prendre les meilleurs avec un peu de variation
  const topRemedies = scoredRemedies.slice(0, count * 2);
  const selected: string[] = [];
  
  for (let i = 0; i < Math.min(count, topRemedies.length); i++) {
    // Ajouter un peu de randomisation parmi les top
    const pool = topRemedies.filter(r => !selected.includes(r.remedy.id));
    if (pool.length > 0) {
      const index = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * Math.min(3, pool.length));
      selected.push(pool[index].remedy.id);
    }
  }
  
  return selected;
}

/**
 * Sélectionne des tips aléatoires
 */
function selectRandomTips(tips: string[], count: number = 2): string[] {
  const shuffled = [...tips].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============================================
// GÉNÉRATION DE ROUTINES
// ============================================

/**
 * Génère la routine du jour basée sur les objectifs et le wellness log
 */
export async function generateDailyRoutine(
  userGoals: UserGoalType[],
  wellnessLog?: WellnessLog
): Promise<DailyRoutine> {
  const dateKey = getTodayKey();
  
  // Construire les tags cibles basés sur les objectifs
  let targetTags: string[] = [];
  for (const goal of userGoals) {
    const goalTags = GOAL_TO_TAGS[goal];
    if (goalTags) {
      targetTags.push(...goalTags);
    }
  }
  
  // Ajouter des tags basés sur le wellness log si disponible
  if (wellnessLog) {
    // Stress élevé (1-2 = stressé)
    if (wellnessLog.stress <= 2) {
      targetTags.push('stress', 'calme', 'relaxation');
    }
    // Sommeil faible
    if (wellnessLog.sommeil.qualite <= 2) {
      targetTags.push('sommeil', 'repos', 'nuit');
    }
    // Énergie faible
    if (wellnessLog.energie <= 2) {
      targetTags.push('energie', 'tonique', 'vitalite');
    }
    // Humeur basse
    if (wellnessLog.humeur <= 2) {
      targetTags.push('humeur', 'moral', 'bien-etre');
    }
  }
  
  // Dédupliquer
  targetTags = [...new Set(targetTags)];
  
  // Si pas d'objectifs, utiliser des tags généraux
  if (targetTags.length === 0) {
    targetTags = ['bien-etre', 'equilibre', 'sante'];
  }
  
  // Sélectionner les remèdes du matin
  const morningRemedyIds = selectRemediesForRoutine(targetTags, MORNING_TAGS, 2);
  
  // Sélectionner les remèdes du soir (différents du matin)
  const eveningRemedyIds = selectRemediesForRoutine(targetTags, EVENING_TAGS, 2, morningRemedyIds);
  
  // Créer les blocs de routine
  const morningRoutine: RoutineBlock = {
    type: 'morning',
    title: '🌞 Routine Matin',
    subtitle: 'Démarrez la journée en douceur',
    remedyIds: morningRemedyIds,
    tips: selectRandomTips(MORNING_TIPS, 2),
    duration: '10-15 min',
    isCompleted: false,
  };
  
  const eveningRoutine: RoutineBlock = {
    type: 'evening',
    title: '🌙 Routine Soir',
    subtitle: 'Préparez une nuit réparatrice',
    remedyIds: eveningRemedyIds,
    tips: selectRandomTips(EVENING_TIPS, 2),
    duration: '10-15 min',
    isCompleted: false,
  };
  
  const routine: DailyRoutine = {
    id: `routine_${dateKey}_${Date.now()}`,
    dateKey,
    morningRoutine,
    eveningRoutine,
    basedOnGoals: userGoals,
    basedOnWellnessLog: wellnessLog?.id,
    generatedAt: new Date().toISOString(),
  };
  
  // Sauvegarder
  await saveDailyRoutine(routine);
  
  console.log('[DailyRoutine] Generated routine for', dateKey);
  return routine;
}

// ============================================
// GESTION DES ROUTINES
// ============================================

/**
 * Récupère toutes les routines
 */
export async function getAllRoutines(): Promise<DailyRoutine[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[DailyRoutine] Error getting routines:', error);
    return [];
  }
}

/**
 * Récupère la routine d'une date spécifique
 */
export async function getRoutineByDate(dateKey: string): Promise<DailyRoutine | null> {
  const routines = await getAllRoutines();
  return routines.find(r => r.dateKey === dateKey) || null;
}

/**
 * Récupère la routine du jour
 */
export async function getTodayRoutine(): Promise<DailyRoutine | null> {
  return getRoutineByDate(getTodayKey());
}

/**
 * Sauvegarde une routine
 */
export async function saveDailyRoutine(routine: DailyRoutine): Promise<void> {
  try {
    const routines = await getAllRoutines();
    
    // Remplacer si existe déjà pour cette date
    const existingIndex = routines.findIndex(r => r.dateKey === routine.dateKey);
    
    if (existingIndex >= 0) {
      routines[existingIndex] = routine;
    } else {
      routines.push(routine);
    }
    
    // Garder seulement les 30 derniers jours
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const filtered = routines.filter(r => {
      const routineDate = new Date(r.dateKey);
      return routineDate >= cutoffDate;
    });
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[DailyRoutine] Error saving routine:', error);
    throw error;
  }
}

/**
 * Marque une routine comme complétée
 */
export async function completeRoutine(
  dateKey: string, 
  routineType: 'morning' | 'evening'
): Promise<DailyRoutine | null> {
  const routine = await getRoutineByDate(dateKey);
  if (!routine) return null;
  
  const now = new Date().toISOString();
  
  if (routineType === 'morning') {
    routine.morningRoutine.isCompleted = true;
    routine.morningRoutine.completedAt = now;
  } else {
    routine.eveningRoutine.isCompleted = true;
    routine.eveningRoutine.completedAt = now;
  }
  
  await saveDailyRoutine(routine);
  console.log(`[DailyRoutine] ${routineType} routine completed for ${dateKey}`);
  
  return routine;
}

/**
 * Vérifie si la routine du jour existe, sinon la génère
 */
export async function ensureTodayRoutine(
  userGoals: UserGoalType[],
  wellnessLog?: WellnessLog
): Promise<DailyRoutine> {
  const existing = await getTodayRoutine();
  
  if (existing) {
    return existing;
  }
  
  return generateDailyRoutine(userGoals, wellnessLog);
}

/**
 * Récupère les remèdes d'une routine avec leurs détails
 */
export function getRoutineRemedies(routine: DailyRoutine, type: 'morning' | 'evening'): Remede[] {
  const block = type === 'morning' ? routine.morningRoutine : routine.eveningRoutine;
  
  return block.remedyIds
    .map(id => remedes.find(r => r.id === id))
    .filter((r): r is Remede => r !== undefined);
}

/**
 * Calcule le taux de complétion des routines sur une période
 */
export async function getRoutineCompletionRate(days: number = 7): Promise<{
  morningRate: number;
  eveningRate: number;
  overallRate: number;
  completedDays: number;
  totalDays: number;
}> {
  const routines = await getAllRoutines();
  
  // Filtrer les routines des X derniers jours
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentRoutines = routines.filter(r => {
    const routineDate = new Date(r.dateKey);
    return routineDate >= cutoffDate;
  });
  
  if (recentRoutines.length === 0) {
    return {
      morningRate: 0,
      eveningRate: 0,
      overallRate: 0,
      completedDays: 0,
      totalDays: 0,
    };
  }
  
  const morningCompleted = recentRoutines.filter(r => r.morningRoutine.isCompleted).length;
  const eveningCompleted = recentRoutines.filter(r => r.eveningRoutine.isCompleted).length;
  const fullyCompleted = recentRoutines.filter(
    r => r.morningRoutine.isCompleted && r.eveningRoutine.isCompleted
  ).length;
  
  return {
    morningRate: Math.round((morningCompleted / recentRoutines.length) * 100),
    eveningRate: Math.round((eveningCompleted / recentRoutines.length) * 100),
    overallRate: Math.round((fullyCompleted / recentRoutines.length) * 100),
    completedDays: fullyCompleted,
    totalDays: recentRoutines.length,
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  STORAGE_KEY as ROUTINE_STORAGE_KEY,
  GOAL_TO_TAGS,
  MORNING_TIPS,
  EVENING_TIPS,
};
