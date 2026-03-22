// ============================================
// HOOK useWellness
// Gestion du journal bien-être avec backend hybride
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WellnessLog, DailyRecommendation } from '../types';
import {
  saveWellnessLogToBackend,
  getTodayWellnessLogFromBackend,
  getRecentWellnessLogs,
  generateDailyRecommendationFromLog,
  getTodayRecommendation,
  updateUserStreak,
} from '../services/supabase';

// ============================================
// HOOK useWellnessLog
// ============================================

export function useWellnessLog() {
  const [todayLog, setTodayLog] = useState<WellnessLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<string>('local');

  // Charger le log du jour
  const loadTodayLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTodayWellnessLogFromBackend();
      setTodayLog(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur chargement'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder le log
  const saveLog = useCallback(async (log: WellnessLog): Promise<{ success: boolean; recommendation?: DailyRecommendation | null }> => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await saveWellnessLogToBackend(log);
      setTodayLog(result.data);
      setSource(result.source);

      // Générer la recommandation du jour
      const recoResult = await generateDailyRecommendationFromLog(result.data);
      
      // Mettre à jour le streak
      await updateUserStreak();

      return { success: true, recommendation: recoResult.data };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur sauvegarde'));
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    loadTodayLog();
  }, [loadTodayLog]);

  return {
    todayLog,
    isLoading,
    isSaving,
    error,
    source,
    saveLog,
    refresh: loadTodayLog,
  };
}

// ============================================
// HOOK useWellnessHistory
// ============================================

export function useWellnessHistory(days: number = 7) {
  const [history, setHistory] = useState<WellnessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<string>('local');

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getRecentWellnessLogs(days);
      setHistory(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur chargement historique'));
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    source,
    refresh: loadHistory,
  };
}

// ============================================
// HOOK useDailyRecommendation
// ============================================

export function useDailyRecommendation() {
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<string>('local');

  const loadRecommendation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTodayRecommendation();
      setRecommendation(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur chargement recommandation'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  return {
    recommendation,
    isLoading,
    error,
    source,
    refresh: loadRecommendation,
  };
}

// ============================================
// EXPORTS
// ============================================

export default useWellnessLog;
