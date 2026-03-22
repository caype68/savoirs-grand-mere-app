// ============================================
// SERVICE DE RECOMMANDATIONS QUOTIDIENNES
// Génère des recommandations de remèdes basées
// sur le journal bien-être de l'utilisateur
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WellnessLog,
  DailyRecommendation,
  RecommendationRule,
  WellnessCategory,
  WellnessStats,
  Remede,
} from '../types';
import { remedes } from '../data/remedes';

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEYS = {
  WELLNESS_LOGS: '@wellness_logs',
  DAILY_RECOMMENDATIONS: '@daily_recommendations',
  RECOMMENDATION_HISTORY: '@recommendation_history',
};

// ============================================
// UTILITAIRES DE DATE
// ============================================

/**
 * Retourne la clé du jour actuel (YYYY-MM-DD)
 */
export function getTodayKey(): string {
  const today = new Date();
  return formatDateKey(today);
}

/**
 * Formate une date en clé YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse une clé de date en objet Date
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Retourne le label lisible d'une date
 */
export function getDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (formatDateKey(date) === formatDateKey(today)) return "Aujourd'hui";
  if (formatDateKey(date) === formatDateKey(yesterday)) return 'Hier';
  
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}

// ============================================
// RÈGLES DE RECOMMANDATION
// ============================================

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  // Priorité 1 : Stress élevé + Sommeil faible
  {
    id: 'stress-sleep-crisis',
    name: 'Crise stress et sommeil',
    priority: 1,
    conditions: {
      sleepMax: 2,
      stressMax: 2, // 1-2 = très stressé/stressé
    },
    targetTags: ['sommeil', 'stress', 'relaxation', 'apaisant', 'detente'],
    targetCategories: ['sommeil', 'stress', 'detente'],
    reason: 'Votre sommeil et votre niveau de stress nécessitent une attention particulière. Ce remède apaisant peut vous aider à retrouver calme et repos.',
  },
  
  // Priorité 2 : Stress élevé seul
  {
    id: 'high-stress',
    name: 'Stress élevé',
    priority: 2,
    conditions: {
      stressMax: 2,
    },
    targetTags: ['stress', 'relaxation', 'detente', 'apaisant', 'respiration', 'anxiete'],
    targetCategories: ['stress', 'detente', 'respiration'],
    reason: 'Votre niveau de stress est élevé aujourd\'hui. Ce remède peut vous aider à vous détendre et retrouver votre sérénité.',
  },
  
  // Priorité 3 : Sommeil faible seul
  {
    id: 'poor-sleep',
    name: 'Sommeil insuffisant',
    priority: 3,
    conditions: {
      sleepMax: 2,
    },
    targetTags: ['sommeil', 'insomnie', 'relaxation', 'nuit', 'endormissement'],
    targetCategories: ['sommeil', 'detente'],
    reason: 'Votre qualité de sommeil était faible. Ce remède peut favoriser un meilleur repos cette nuit.',
  },
  
  // Priorité 4 : Énergie faible + Humeur basse
  {
    id: 'low-energy-mood',
    name: 'Fatigue et moral bas',
    priority: 4,
    conditions: {
      energyMax: 2,
      moodMax: 2,
    },
    targetTags: ['energie', 'tonique', 'vitalite', 'fatigue', 'moral', 'humeur'],
    targetCategories: ['energie', 'humeur'],
    reason: 'Votre énergie et votre humeur sont basses. Ce remède tonique doux peut vous aider à retrouver votre vitalité.',
  },
  
  // Priorité 5 : Énergie faible seule
  {
    id: 'low-energy',
    name: 'Fatigue',
    priority: 5,
    conditions: {
      energyMax: 2,
    },
    targetTags: ['energie', 'tonique', 'vitalite', 'fatigue', 'revitalisant'],
    targetCategories: ['energie'],
    reason: 'Vous manquez d\'énergie aujourd\'hui. Ce remède peut vous donner un coup de boost naturel.',
  },
  
  // Priorité 6 : Humeur basse seule
  {
    id: 'low-mood',
    name: 'Humeur basse',
    priority: 6,
    conditions: {
      moodMax: 2,
    },
    targetTags: ['humeur', 'moral', 'reconfort', 'bien-etre', 'apaisant'],
    targetCategories: ['humeur', 'detente'],
    reason: 'Votre humeur est un peu basse. Ce remède réconfortant peut vous aider à vous sentir mieux.',
  },
  
  // Priorité 7 : Stress modéré
  {
    id: 'moderate-stress',
    name: 'Stress modéré',
    priority: 7,
    conditions: {
      stressMax: 3,
      stressMin: 2,
    },
    targetTags: ['detente', 'relaxation', 'equilibre', 'calme'],
    targetCategories: ['detente', 'stress'],
    reason: 'Un peu de stress aujourd\'hui ? Ce remède peut vous aider à maintenir votre équilibre.',
  },
  
  // Priorité 8 : Tout va bien - entretien
  {
    id: 'maintenance',
    name: 'Bien-être général',
    priority: 8,
    conditions: {
      sleepMin: 4,
      stressMin: 4,
      energyMin: 4,
      moodMin: 4,
    },
    targetTags: ['bien-etre', 'equilibre', 'sante', 'prevention', 'immunite'],
    targetCategories: ['bien_etre_general', 'immunite'],
    reason: 'Vous êtes en pleine forme ! Ce remède d\'entretien peut vous aider à maintenir cet équilibre.',
  },
  
  // Priorité 9 : État moyen - suggestion douce
  {
    id: 'average-state',
    name: 'État moyen',
    priority: 9,
    conditions: {},
    targetTags: ['bien-etre', 'equilibre', 'detente', 'sante'],
    targetCategories: ['bien_etre_general', 'detente'],
    reason: 'Pour maintenir votre bien-être au quotidien, voici une suggestion adaptée à votre état.',
  },
];

// ============================================
// MAPPING SYMPTÔMES -> TAGS
// ============================================

const SYMPTOM_TO_TAGS: Record<string, string[]> = {
  'Fatigue': ['energie', 'fatigue', 'tonique', 'vitalite'],
  'Maux de tête': ['douleurs', 'tete', 'migraine', 'tension'],
  'Mal de gorge': ['gorge', 'respiration', 'immunite'],
  'Toux': ['toux', 'respiration', 'gorge', 'bronches'],
  'Nez bouché': ['respiration', 'nez', 'rhume', 'sinus'],
  'Douleurs musculaires': ['douleurs', 'muscles', 'articulations'],
  'Ballonnements': ['digestion', 'ventre', 'ballonnements'],
  'Nausées': ['digestion', 'nausees', 'estomac'],
  'Insomnie': ['sommeil', 'insomnie', 'nuit'],
  'Anxiété': ['stress', 'anxiete', 'calme', 'relaxation'],
  'Irritabilité': ['humeur', 'stress', 'calme', 'equilibre'],
  'Douleurs articulaires': ['douleurs', 'articulations', 'rhumatismes'],
};

// ============================================
// GESTION DES WELLNESS LOGS
// ============================================

/**
 * Récupère tous les wellness logs
 */
export async function getAllWellnessLogs(): Promise<WellnessLog[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[DailyReco] Error getting wellness logs:', error);
    return [];
  }
}

/**
 * Récupère le wellness log d'une date spécifique
 */
export async function getWellnessLogByDate(dateKey: string): Promise<WellnessLog | null> {
  const logs = await getAllWellnessLogs();
  return logs.find(log => log.dateKey === dateKey) || null;
}

/**
 * Récupère le wellness log du jour
 */
export async function getDailyWellnessLog(): Promise<WellnessLog | null> {
  return getWellnessLogByDate(getTodayKey());
}

/**
 * Sauvegarde un wellness log
 */
export async function saveDailyWellnessLog(log: WellnessLog): Promise<void> {
  try {
    const logs = await getAllWellnessLogs();
    
    // Chercher si un log existe déjà pour cette date
    const existingIndex = logs.findIndex(l => l.dateKey === log.dateKey);
    
    if (existingIndex >= 0) {
      // Mettre à jour le log existant
      logs[existingIndex] = {
        ...logs[existingIndex],
        ...log,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Ajouter un nouveau log
      logs.push(log);
    }
    
    // Garder seulement les 90 derniers jours
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const filteredLogs = logs.filter(l => 
      parseDateKey(l.dateKey) >= cutoffDate
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_LOGS, JSON.stringify(filteredLogs));
    console.log('[DailyReco] Wellness log saved for', log.dateKey);
  } catch (error) {
    console.error('[DailyReco] Error saving wellness log:', error);
    throw error;
  }
}

/**
 * Met à jour un wellness log existant
 */
export async function updateWellnessLog(
  dateKey: string, 
  updates: Partial<WellnessLog>
): Promise<WellnessLog | null> {
  const existing = await getWellnessLogByDate(dateKey);
  if (!existing) return null;
  
  const updated: WellnessLog = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await saveDailyWellnessLog(updated);
  return updated;
}

/**
 * Récupère les X derniers wellness logs
 */
export async function getRecentWellnessLogs(count: number = 7): Promise<WellnessLog[]> {
  const logs = await getAllWellnessLogs();
  return logs
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, count);
}

// ============================================
// MOTEUR DE RECOMMANDATION
// ============================================

/**
 * Vérifie si une règle correspond à un wellness log
 */
function matchesRule(log: WellnessLog, rule: RecommendationRule): boolean {
  const { conditions } = rule;
  
  // Vérifier sommeil
  if (conditions.sleepMax !== undefined && log.sommeil.qualite > conditions.sleepMax) {
    return false;
  }
  if (conditions.sleepMin !== undefined && log.sommeil.qualite < conditions.sleepMin) {
    return false;
  }
  
  // Vérifier stress (attention: 1 = très stressé, 5 = calme)
  if (conditions.stressMax !== undefined && log.stress > conditions.stressMax) {
    return false;
  }
  if (conditions.stressMin !== undefined && log.stress < conditions.stressMin) {
    return false;
  }
  
  // Vérifier énergie
  if (conditions.energyMax !== undefined && log.energie > conditions.energyMax) {
    return false;
  }
  if (conditions.energyMin !== undefined && log.energie < conditions.energyMin) {
    return false;
  }
  
  // Vérifier humeur
  if (conditions.moodMax !== undefined && log.humeur > conditions.moodMax) {
    return false;
  }
  if (conditions.moodMin !== undefined && log.humeur < conditions.moodMin) {
    return false;
  }
  
  // Vérifier symptômes
  if (conditions.symptoms && conditions.symptoms.length > 0) {
    const hasMatchingSymptom = conditions.symptoms.some(s => 
      log.symptomes.includes(s)
    );
    if (!hasMatchingSymptom) return false;
  }
  
  return true;
}

/**
 * Calcule le score d'un remède pour un ensemble de tags cibles
 */
function calculateRemedyScore(
  remedy: Remede, 
  targetTags: string[],
  symptomTags: string[]
): { score: number; matchedTags: string[] } {
  let score = 0;
  const matchedTags: string[] = [];
  
  // Récupérer les tags du remède (depuis indications, nom, etc.)
  const remedyTags = extractRemedyTags(remedy);
  
  // Matcher avec les tags cibles
  for (const tag of targetTags) {
    if (remedyTags.some(rt => rt.includes(tag) || tag.includes(rt))) {
      score += 10;
      matchedTags.push(tag);
    }
  }
  
  // Bonus pour les symptômes
  for (const tag of symptomTags) {
    if (remedyTags.some(rt => rt.includes(tag) || tag.includes(rt))) {
      score += 15; // Bonus plus élevé pour les symptômes
      if (!matchedTags.includes(tag)) {
        matchedTags.push(tag);
      }
    }
  }
  
  // Bonus si le remède est vérifié
  if (remedy.verifie) {
    score += 5;
  }
  
  return { score, matchedTags };
}

/**
 * Extrait les tags d'un remède
 */
function extractRemedyTags(remedy: Remede): string[] {
  const tags: string[] = [];
  
  // Depuis le nom
  const nameLower = remedy.nom.toLowerCase();
  tags.push(nameLower);
  
  // Depuis les indications
  for (const indication of remedy.indications) {
    tags.push(indication.toLowerCase());
  }
  
  // Depuis les ingrédients
  for (const ing of remedy.ingredients) {
    tags.push(ing.nom.toLowerCase());
    if (ing.alias) {
      tags.push(...ing.alias.map(a => a.toLowerCase()));
    }
  }
  
  // Depuis la route
  tags.push(remedy.route);
  
  return tags;
}

/**
 * Récupère les tags de symptômes pour un wellness log
 */
function getSymptomTags(log: WellnessLog): string[] {
  const tags: string[] = [];
  
  for (const symptom of log.symptomes) {
    const symptomTags = SYMPTOM_TO_TAGS[symptom];
    if (symptomTags) {
      tags.push(...symptomTags);
    }
  }
  
  return [...new Set(tags)];
}

/**
 * Génère une recommandation quotidienne basée sur le wellness log
 */
export async function generateDailyRecommendation(
  log: WellnessLog
): Promise<DailyRecommendation | null> {
  // Trouver la règle qui correspond le mieux
  const matchingRules = RECOMMENDATION_RULES
    .filter(rule => matchesRule(log, rule))
    .sort((a, b) => a.priority - b.priority);
  
  if (matchingRules.length === 0) {
    console.log('[DailyReco] No matching rules found');
    return null;
  }
  
  const bestRule = matchingRules[0];
  const symptomTags = getSymptomTags(log);
  
  // Récupérer les recommandations passées pour éviter les répétitions
  const pastRecommendations = await getRecentRecommendations(7);
  const recentRemedyIds = pastRecommendations.map(r => r.remedyId);
  
  // Scorer tous les remèdes
  const scoredRemedies = remedes
    .map(remedy => {
      const { score, matchedTags } = calculateRemedyScore(
        remedy, 
        bestRule.targetTags,
        symptomTags
      );
      
      // Pénalité si déjà recommandé récemment
      const recentPenalty = recentRemedyIds.includes(remedy.id) ? -20 : 0;
      
      return {
        remedy,
        score: score + recentPenalty,
        matchedTags,
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  if (scoredRemedies.length === 0) {
    console.log('[DailyReco] No matching remedies found');
    return null;
  }
  
  // Sélectionner le meilleur remède (avec un peu de variation)
  const topRemedies = scoredRemedies.slice(0, 3);
  const selectedIndex = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * topRemedies.length);
  const selected = topRemedies[selectedIndex];
  
  const recommendation: DailyRecommendation = {
    id: `reco_${log.dateKey}_${Date.now()}`,
    dateKey: log.dateKey,
    wellnessLogId: log.id,
    remedyId: selected.remedy.id,
    remedyName: selected.remedy.nom,
    category: bestRule.targetCategories[0] || 'bien_etre_general',
    reason: bestRule.reason,
    matchScore: Math.min(100, selected.score),
    matchedTags: selected.matchedTags,
    priority: bestRule.priority,
    isViewed: false,
    isSavedToFavorites: false,
    generatedAt: new Date().toISOString(),
  };
  
  // Sauvegarder la recommandation
  await saveDailyRecommendation(recommendation);
  
  console.log('[DailyReco] Generated recommendation:', recommendation.remedyName);
  return recommendation;
}

// ============================================
// GESTION DES RECOMMANDATIONS
// ============================================

/**
 * Récupère toutes les recommandations
 */
export async function getAllRecommendations(): Promise<DailyRecommendation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_RECOMMENDATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[DailyReco] Error getting recommendations:', error);
    return [];
  }
}

/**
 * Récupère la recommandation d'une date spécifique
 */
export async function getRecommendationByDate(dateKey: string): Promise<DailyRecommendation | null> {
  const recommendations = await getAllRecommendations();
  return recommendations.find(r => r.dateKey === dateKey) || null;
}

/**
 * Récupère la recommandation du jour
 */
export async function getTodayRecommendation(): Promise<DailyRecommendation | null> {
  return getRecommendationByDate(getTodayKey());
}

/**
 * Sauvegarde une recommandation
 */
export async function saveDailyRecommendation(recommendation: DailyRecommendation): Promise<void> {
  try {
    const recommendations = await getAllRecommendations();
    
    // Remplacer si existe déjà pour cette date
    const existingIndex = recommendations.findIndex(r => r.dateKey === recommendation.dateKey);
    
    if (existingIndex >= 0) {
      recommendations[existingIndex] = recommendation;
    } else {
      recommendations.push(recommendation);
    }
    
    // Garder seulement les 30 derniers jours
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const filtered = recommendations.filter(r => 
      parseDateKey(r.dateKey) >= cutoffDate
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_RECOMMENDATIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('[DailyReco] Error saving recommendation:', error);
    throw error;
  }
}

/**
 * Récupère les X dernières recommandations
 */
export async function getRecentRecommendations(count: number = 7): Promise<DailyRecommendation[]> {
  const recommendations = await getAllRecommendations();
  return recommendations
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, count);
}

/**
 * Marque une recommandation comme vue
 */
export async function markRecommendationAsViewed(dateKey: string): Promise<void> {
  const recommendation = await getRecommendationByDate(dateKey);
  if (recommendation) {
    recommendation.isViewed = true;
    await saveDailyRecommendation(recommendation);
  }
}

/**
 * Marque une recommandation comme sauvegardée en favoris
 */
export async function markRecommendationAsFavorite(dateKey: string): Promise<void> {
  const recommendation = await getRecommendationByDate(dateKey);
  if (recommendation) {
    recommendation.isSavedToFavorites = true;
    await saveDailyRecommendation(recommendation);
  }
}

// ============================================
// STATISTIQUES
// ============================================

/**
 * Calcule les statistiques de bien-être
 */
export async function getWellnessStats(): Promise<WellnessStats> {
  const logs = await getAllWellnessLogs();
  const recommendations = await getAllRecommendations();
  
  if (logs.length === 0) {
    return {
      averageSleep: 0,
      averageStress: 0,
      averageEnergy: 0,
      averageMood: 0,
      totalLogs: 0,
      streak: 0,
      lastLogDate: '',
      topSymptoms: [],
      recommendationsFollowed: 0,
    };
  }
  
  // Calculer les moyennes
  const totalSleep = logs.reduce((sum, log) => sum + log.sommeil.qualite, 0);
  const totalStress = logs.reduce((sum, log) => sum + log.stress, 0);
  const totalEnergy = logs.reduce((sum, log) => sum + log.energie, 0);
  const totalMood = logs.reduce((sum, log) => sum + log.humeur, 0);
  
  // Calculer le streak
  let streak = 0;
  const sortedLogs = logs.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const today = getTodayKey();
  let currentDate = today;
  
  for (const log of sortedLogs) {
    if (log.dateKey === currentDate) {
      streak++;
      const prevDate = new Date(parseDateKey(currentDate));
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = formatDateKey(prevDate);
    } else {
      break;
    }
  }
  
  // Compter les symptômes
  const symptomCounts: Record<string, number> = {};
  for (const log of logs) {
    for (const symptom of log.symptomes) {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    }
  }
  
  const topSymptoms = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Compter les recommandations suivies
  const recommendationsFollowed = recommendations.filter(r => r.isSavedToFavorites).length;
  
  return {
    averageSleep: Math.round((totalSleep / logs.length) * 10) / 10,
    averageStress: Math.round((totalStress / logs.length) * 10) / 10,
    averageEnergy: Math.round((totalEnergy / logs.length) * 10) / 10,
    averageMood: Math.round((totalMood / logs.length) * 10) / 10,
    totalLogs: logs.length,
    streak,
    lastLogDate: sortedLogs[0]?.dateKey || '',
    topSymptoms,
    recommendationsFollowed,
  };
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface WellnessNotification {
  id: string;
  type: 'reminder' | 'recommendation';
  title: string;
  body: string;
  data?: {
    remedyId?: string;
    dateKey?: string;
  };
}

/**
 * Génère le contenu de notification pour le rappel journal
 */
export function getJournalReminderNotification(): WellnessNotification {
  return {
    id: `journal_reminder_${getTodayKey()}`,
    type: 'reminder',
    title: '📝 Journal Bien-être',
    body: 'Comment allez-vous aujourd\'hui ? Prenez un moment pour noter votre état.',
    data: {
      dateKey: getTodayKey(),
    },
  };
}

/**
 * Génère le contenu de notification pour la recommandation du jour
 */
export async function getRecommendationNotification(): Promise<WellnessNotification | null> {
  const recommendation = await getTodayRecommendation();
  
  if (!recommendation) {
    return null;
  }
  
  return {
    id: `recommendation_${recommendation.dateKey}`,
    type: 'recommendation',
    title: '🌿 Votre remède du jour',
    body: `Découvrez "${recommendation.remedyName}" - adapté à votre état d'aujourd'hui.`,
    data: {
      remedyId: recommendation.remedyId,
      dateKey: recommendation.dateKey,
    },
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  STORAGE_KEYS,
  SYMPTOM_TO_TAGS,
};
