// ============================================
// HOOK - CATÉGORIES DE FAVORIS
// Permet d'organiser les favoris en catégories
// ============================================

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES_KEY = '@savoirs_favorite_categories';

export interface FavoriteCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  remedeIds: string[];
  createdAt: string;
}

const DEFAULT_CATEGORIES: FavoriteCategory[] = [
  {
    id: 'all',
    name: 'Tous',
    icon: 'grid',
    color: '#818CF8',
    remedeIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hiver',
    name: 'Hiver',
    icon: 'cloud-snow',
    color: '#60A5FA',
    remedeIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'digestion',
    name: 'Digestion',
    icon: 'coffee',
    color: '#34D399',
    remedeIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sommeil',
    name: 'Sommeil',
    icon: 'moon',
    color: '#A78BFA',
    remedeIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'stress',
    name: 'Stress',
    icon: 'heart',
    color: '#F87171',
    remedeIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'beaute',
    name: 'Beauté',
    icon: 'star',
    color: '#FBBF24',
    remedeIds: [],
    createdAt: new Date().toISOString(),
  },
];

export const useFavoriteCategories = () => {
  const [categories, setCategories] = useState<FavoriteCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FavoriteCategory[];
        // Ensure 'all' category always exists
        if (!parsed.find(c => c.id === 'all')) {
          parsed.unshift(DEFAULT_CATEGORIES[0]);
        }
        setCategories(parsed);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCategories = async (newCategories: FavoriteCategory[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Erreur sauvegarde catégories:', error);
    }
  };

  const addCategory = useCallback(async (name: string, icon: string, color: string) => {
    const newCategory: FavoriteCategory = {
      id: `cat_${Date.now()}`,
      name,
      icon,
      color,
      remedeIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...categories, newCategory];
    await saveCategories(updated);
    return newCategory;
  }, [categories]);

  const removeCategory = useCallback(async (categoryId: string) => {
    if (categoryId === 'all') return; // Can't delete "all"
    const updated = categories.filter(c => c.id !== categoryId);
    await saveCategories(updated);
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId('all');
    }
  }, [categories, selectedCategoryId]);

  const addRemedyToCategory = useCallback(async (remedeId: string, categoryId: string) => {
    if (categoryId === 'all') return; // "all" is virtual
    const updated = categories.map(c => {
      if (c.id === categoryId && !c.remedeIds.includes(remedeId)) {
        return { ...c, remedeIds: [...c.remedeIds, remedeId] };
      }
      return c;
    });
    await saveCategories(updated);
  }, [categories]);

  const removeRemedyFromCategory = useCallback(async (remedeId: string, categoryId: string) => {
    if (categoryId === 'all') return;
    const updated = categories.map(c => {
      if (c.id === categoryId) {
        return { ...c, remedeIds: c.remedeIds.filter(id => id !== remedeId) };
      }
      return c;
    });
    await saveCategories(updated);
  }, [categories]);

  const getRemedyCategories = useCallback((remedeId: string): FavoriteCategory[] => {
    return categories.filter(c => c.id !== 'all' && c.remedeIds.includes(remedeId));
  }, [categories]);

  const filterByCategory = useCallback((remedeIds: string[]): string[] => {
    if (selectedCategoryId === 'all') return remedeIds;
    const category = categories.find(c => c.id === selectedCategoryId);
    if (!category) return remedeIds;
    return remedeIds.filter(id => category.remedeIds.includes(id));
  }, [categories, selectedCategoryId]);

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    loading,
    addCategory,
    removeCategory,
    addRemedyToCategory,
    removeRemedyFromCategory,
    getRemedyCategories,
    filterByCategory,
  };
};
