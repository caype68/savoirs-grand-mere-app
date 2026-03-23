// ============================================
// HOOK useDailyRoutine
// Gestion des routines quotidiennes
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { DailyRoutine, Remede, UserGoalType } from '../types';
import {
  getTodayRoutine,
  generateDailyRoutine,
  completeRoutine,
  getRoutineRemedies,
} from '../services/dailyRoutine';
import { getUserProfile } from '../services/storage';
import { getTodayWellnessLogFromBackend } from '../services/supabase/wellnessApi';

// ============================================
// HELPER - charge morning + evening remedies
// ============================================

function loadRemediesForRoutine(routine: DailyRoutine): { morning: Remede[]; evening: Remede[] } {
  return {
    morning: getRoutineRemedies(routine, 'morning'),
    evening: getRoutineRemedies(routine, 'evening'),
  };
}

// ============================================
// HOOK
// ============================================

export function useDailyRoutine() {
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [remedies, setRemedies] = useState<{ morning: Remede[]; evening: Remede[] }>({
    morning: [],
    evening: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Charger la routine du jour
  const loadRoutine = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const todayRoutine = await getTodayRoutine();

      if (todayRoutine) {
        setRoutine(todayRoutine);
        setRemedies(loadRemediesForRoutine(todayRoutine));
      } else {
        setRoutine(null);
        setRemedies({ morning: [], evening: [] });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur chargement routine'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Générer une nouvelle routine
  const generateRoutine = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Récupérer le profil et le wellness log
      const profile = await getUserProfile();
      const wellnessResult = await getTodayWellnessLogFromBackend();

      // Convertir HealthGoal[] en UserGoalType[] (mapping souple)
      const goals = (profile?.objectifs || []) as unknown as UserGoalType[];
      const wellnessLog = wellnessResult.data;

      // Générer la routine
      const newRoutine = await generateDailyRoutine(goals, wellnessLog || undefined);
      setRoutine(newRoutine);

      // Charger les remèdes
      setRemedies(loadRemediesForRoutine(newRoutine));

      return newRoutine;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur génération routine'));
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Marquer un bloc comme complété
  const completeBlock = useCallback(async (type: 'morning' | 'evening') => {
    if (!routine) return;

    try {
      // completeRoutine attend (dateKey, type)
      const updatedRoutine = await completeRoutine(routine.dateKey, type);
      if (updatedRoutine) {
        setRoutine(updatedRoutine);
      }
    } catch (err) {
      console.error('[useDailyRoutine] Error completing block:', err);
    }
  }, [routine]);

  // Charger au montage
  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  return {
    routine,
    remedies,
    isLoading,
    isGenerating,
    error,
    generateRoutine,
    completeBlock,
    refresh: loadRoutine,
  };
}

export default useDailyRoutine;
