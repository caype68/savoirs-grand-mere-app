import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';

const PREFERENCES_KEY = '@savoirs_preferences';

const defaultPreferences: UserPreferences = {
  onboardingComplete: false,
  analyticsEnabled: false,
  langue: 'fr',
};

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
    }
  };

  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    await savePreferences(newPreferences);
  }, [preferences]);

  const completeOnboarding = useCallback(async () => {
    await updatePreference('onboardingComplete', true);
  }, [updatePreference]);

  const setAnalytics = useCallback(async (enabled: boolean) => {
    await updatePreference('analyticsEnabled', enabled);
  }, [updatePreference]);

  const setLangue = useCallback(async (langue: 'fr' | 'en') => {
    await updatePreference('langue', langue);
  }, [updatePreference]);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Erreur suppression données:', error);
    }
  }, []);

  return {
    preferences,
    loading,
    updatePreference,
    completeOnboarding,
    setAnalytics,
    setLangue,
    clearAllData,
  };
};
