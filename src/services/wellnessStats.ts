// ============================================
// SERVICE DE STATISTIQUES BIEN-ÊTRE
// Calcul des tendances et évolutions
// ============================================

import {
  WellnessLog,
  WellnessTrends,
  TrendData,
} from '../types';
import { getAllWellnessLogs, formatDateKey } from './dailyRecommendations';

// ============================================
// CALCUL DES TENDANCES
// ============================================

/**
 * Calcule les tendances sur une période donnée
 */
export async function calculateWellnessTrends(
  period: '7days' | '30days' | '90days' = '7days'
): Promise<WellnessTrends> {
  const logs = await getAllWellnessLogs();
  
  const periodDays = period === '7days' ? 7 : period === '30days' ? 30 : 90;
  
  const now = new Date();
  const currentPeriodStart = new Date(now);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - periodDays);
  
  const previousPeriodStart = new Date(currentPeriodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);
  
  // Filtrer les logs par période
  const currentLogs = logs.filter(log => {
    const logDate = new Date(log.dateKey);
    return logDate >= currentPeriodStart && logDate <= now;
  });
  
  const previousLogs = logs.filter(log => {
    const logDate = new Date(log.dateKey);
    return logDate >= previousPeriodStart && logDate < currentPeriodStart;
  });
  
  return {
    sleepTrend: calculateTrend(currentLogs, previousLogs, 'sleep'),
    stressTrend: calculateTrend(currentLogs, previousLogs, 'stress'),
    energyTrend: calculateTrend(currentLogs, previousLogs, 'energy'),
    moodTrend: calculateTrend(currentLogs, previousLogs, 'mood'),
    period,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Calcule une tendance spécifique
 */
function calculateTrend(
  currentLogs: WellnessLog[],
  previousLogs: WellnessLog[],
  metric: 'sleep' | 'stress' | 'energy' | 'mood'
): TrendData {
  // Extraire les valeurs
  const currentValues = currentLogs.map(log => getMetricValue(log, metric));
  const previousValues = previousLogs.map(log => getMetricValue(log, metric));
  
  // Calculer les moyennes
  const currentAverage = currentValues.length > 0
    ? currentValues.reduce((a, b) => a + b, 0) / currentValues.length
    : 0;
  
  const previousAverage = previousValues.length > 0
    ? previousValues.reduce((a, b) => a + b, 0) / previousValues.length
    : 0;
  
  // Calculer le changement en pourcentage
  let changePercent = 0;
  if (previousAverage > 0) {
    changePercent = ((currentAverage - previousAverage) / previousAverage) * 100;
  } else if (currentAverage > 0) {
    changePercent = 100;
  }
  
  // Déterminer la direction
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (changePercent > 5) {
    direction = 'up';
  } else if (changePercent < -5) {
    direction = 'down';
  }
  
  // Pour le stress, inverser la logique (moins = mieux)
  // Note: dans notre système, 1 = très stressé, 5 = calme
  // Donc "up" est bon pour le stress aussi
  
  // Créer les points de données
  const dataPoints = currentLogs.map(log => ({
    date: log.dateKey,
    value: getMetricValue(log, metric),
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    currentAverage: Math.round(currentAverage * 10) / 10,
    previousAverage: Math.round(previousAverage * 10) / 10,
    changePercent: Math.round(changePercent),
    direction,
    dataPoints,
  };
}

/**
 * Extrait la valeur d'une métrique d'un log
 */
function getMetricValue(log: WellnessLog, metric: 'sleep' | 'stress' | 'energy' | 'mood'): number {
  switch (metric) {
    case 'sleep':
      return log.sommeil.qualite;
    case 'stress':
      return log.stress;
    case 'energy':
      return log.energie;
    case 'mood':
      return log.humeur;
    default:
      return 0;
  }
}

// ============================================
// MESSAGES DE TENDANCE
// ============================================

/**
 * Génère un message pour une tendance
 */
export function getTrendMessage(trend: TrendData, metricName: string): string {
  const { direction, changePercent } = trend;
  const absChange = Math.abs(changePercent);
  
  if (direction === 'stable') {
    return `Votre ${metricName} est stable`;
  }
  
  const directionText = direction === 'up' ? 'amélioré' : 'diminué';
  
  if (absChange < 10) {
    return `Votre ${metricName} s'est légèrement ${directionText}`;
  } else if (absChange < 25) {
    return `Votre ${metricName} s'est ${directionText} de ${absChange}%`;
  } else {
    return `Votre ${metricName} s'est nettement ${directionText} de ${absChange}% !`;
  }
}

/**
 * Génère un message global basé sur toutes les tendances
 */
export function getOverallTrendMessage(trends: WellnessTrends): string {
  const improvements = [
    trends.sleepTrend.direction === 'up',
    trends.stressTrend.direction === 'up',
    trends.energyTrend.direction === 'up',
    trends.moodTrend.direction === 'up',
  ].filter(Boolean).length;
  
  const declines = [
    trends.sleepTrend.direction === 'down',
    trends.stressTrend.direction === 'down',
    trends.energyTrend.direction === 'down',
    trends.moodTrend.direction === 'down',
  ].filter(Boolean).length;
  
  if (improvements >= 3) {
    return "Excellente progression ! Continuez ainsi 🌟";
  } else if (improvements >= 2) {
    return "Bonne évolution, vous êtes sur la bonne voie 👍";
  } else if (declines >= 3) {
    return "Période difficile ? Prenez soin de vous 💚";
  } else if (declines >= 2) {
    return "Quelques points à améliorer, restez motivé 💪";
  } else {
    return "Votre bien-être est stable, maintenez vos bonnes habitudes";
  }
}

// ============================================
// STATISTIQUES DÉTAILLÉES
// ============================================

/**
 * Calcule les statistiques détaillées
 */
export async function getDetailedStats(): Promise<{
  totalDays: number;
  currentStreak: number;
  bestDay: { date: string; score: number } | null;
  worstDay: { date: string; score: number } | null;
  averageScore: number;
  symptomFrequency: { symptom: string; count: number; percentage: number }[];
  weekdayAverages: { day: string; score: number }[];
}> {
  const logs = await getAllWellnessLogs();
  
  if (logs.length === 0) {
    return {
      totalDays: 0,
      currentStreak: 0,
      bestDay: null,
      worstDay: null,
      averageScore: 0,
      symptomFrequency: [],
      weekdayAverages: [],
    };
  }
  
  // Calculer le score global de chaque jour
  const scoredLogs = logs.map(log => ({
    date: log.dateKey,
    score: (log.sommeil.qualite + log.stress + log.energie + log.humeur) / 4,
  }));
  
  // Trouver le meilleur et le pire jour
  const sortedByScore = [...scoredLogs].sort((a, b) => b.score - a.score);
  const bestDay = sortedByScore[0];
  const worstDay = sortedByScore[sortedByScore.length - 1];
  
  // Moyenne globale
  const averageScore = scoredLogs.reduce((sum, l) => sum + l.score, 0) / scoredLogs.length;
  
  // Fréquence des symptômes
  const symptomCounts: Record<string, number> = {};
  for (const log of logs) {
    for (const symptom of log.symptomes) {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    }
  }
  
  const symptomFrequency = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({
      symptom,
      count,
      percentage: Math.round((count / logs.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);
  
  // Moyennes par jour de la semaine
  const weekdayScores: Record<number, number[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  };
  
  for (const log of logs) {
    const date = new Date(log.dateKey);
    const dayOfWeek = date.getDay();
    const score = (log.sommeil.qualite + log.stress + log.energie + log.humeur) / 4;
    weekdayScores[dayOfWeek].push(score);
  }
  
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const weekdayAverages = Object.entries(weekdayScores).map(([day, scores]) => ({
    day: dayNames[parseInt(day)],
    score: scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0,
  }));
  
  // Calculer le streak actuel
  let currentStreak = 0;
  const sortedLogs = [...logs].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const today = formatDateKey(new Date());
  let expectedDate = today;
  
  for (const log of sortedLogs) {
    if (log.dateKey === expectedDate) {
      currentStreak++;
      const prevDate = new Date(expectedDate);
      prevDate.setDate(prevDate.getDate() - 1);
      expectedDate = formatDateKey(prevDate);
    } else {
      break;
    }
  }
  
  return {
    totalDays: logs.length,
    currentStreak,
    bestDay,
    worstDay,
    averageScore: Math.round(averageScore * 10) / 10,
    symptomFrequency,
    weekdayAverages,
  };
}

// ============================================
// INSIGHTS PERSONNALISÉS
// ============================================

export interface WellnessInsight {
  type: 'positive' | 'negative' | 'neutral';
  icon: string;
  title: string;
  description: string;
  actionable?: string;
}

/**
 * Génère des insights personnalisés basés sur les données
 */
export async function generateInsights(): Promise<WellnessInsight[]> {
  const trends = await calculateWellnessTrends('7days');
  const stats = await getDetailedStats();
  const insights: WellnessInsight[] = [];
  
  // Insight sur le sommeil
  if (trends.sleepTrend.direction === 'up' && trends.sleepTrend.changePercent > 10) {
    insights.push({
      type: 'positive',
      icon: '😴',
      title: 'Sommeil en amélioration',
      description: `Votre qualité de sommeil s'est améliorée de ${trends.sleepTrend.changePercent}% cette semaine.`,
    });
  } else if (trends.sleepTrend.direction === 'down' && trends.sleepTrend.changePercent < -10) {
    insights.push({
      type: 'negative',
      icon: '😴',
      title: 'Sommeil à surveiller',
      description: 'Votre sommeil semble moins bon cette semaine.',
      actionable: 'Essayez une routine du soir relaxante',
    });
  }
  
  // Insight sur le stress
  if (trends.stressTrend.currentAverage <= 2) {
    insights.push({
      type: 'negative',
      icon: '😰',
      title: 'Niveau de stress élevé',
      description: 'Votre niveau de stress moyen est élevé cette semaine.',
      actionable: 'Prenez du temps pour vous détendre',
    });
  } else if (trends.stressTrend.currentAverage >= 4) {
    insights.push({
      type: 'positive',
      icon: '😌',
      title: 'Bonne gestion du stress',
      description: 'Vous gérez bien votre stress, continuez ainsi !',
    });
  }
  
  // Insight sur le streak
  if (stats.currentStreak >= 7) {
    insights.push({
      type: 'positive',
      icon: '🔥',
      title: `${stats.currentStreak} jours consécutifs !`,
      description: 'Votre régularité est impressionnante.',
    });
  }
  
  // Insight sur les symptômes récurrents
  if (stats.symptomFrequency.length > 0 && stats.symptomFrequency[0].percentage > 50) {
    const topSymptom = stats.symptomFrequency[0];
    insights.push({
      type: 'neutral',
      icon: '📊',
      title: `Symptôme fréquent : ${topSymptom.symptom}`,
      description: `Présent dans ${topSymptom.percentage}% de vos journées.`,
      actionable: 'Consultez nos remèdes adaptés',
    });
  }
  
  // Insight sur le meilleur jour
  if (stats.weekdayAverages.length > 0) {
    const bestWeekday = [...stats.weekdayAverages].sort((a, b) => b.score - a.score)[0];
    if (bestWeekday.score > 0) {
      insights.push({
        type: 'neutral',
        icon: '📅',
        title: `Votre meilleur jour : ${bestWeekday.day}`,
        description: `Score moyen de ${bestWeekday.score}/5 ce jour-là.`,
      });
    }
  }
  
  return insights;
}

// ============================================
// EXPORTS
// ============================================

export {
  getMetricValue,
};
