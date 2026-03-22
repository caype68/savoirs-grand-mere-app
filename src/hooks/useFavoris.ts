import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriNote } from '../types';

const FAVORIS_KEY = '@savoirs_favoris';

export const useFavoris = () => {
  const [favoris, setFavoris] = useState<FavoriNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoris();
  }, []);

  const loadFavoris = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORIS_KEY);
      if (stored) {
        setFavoris(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavoris = async (newFavoris: FavoriNote[]) => {
    try {
      await AsyncStorage.setItem(FAVORIS_KEY, JSON.stringify(newFavoris));
      setFavoris(newFavoris);
    } catch (error) {
      console.error('Erreur sauvegarde favoris:', error);
    }
  };

  const addFavori = useCallback(async (remedeId: string) => {
    const newFavori: FavoriNote = {
      remedeId,
      dateAjout: new Date().toISOString(),
    };
    const newFavoris = [...favoris, newFavori];
    await saveFavoris(newFavoris);
  }, [favoris]);

  const removeFavori = useCallback(async (remedeId: string) => {
    const newFavoris = favoris.filter(f => f.remedeId !== remedeId);
    await saveFavoris(newFavoris);
  }, [favoris]);

  const toggleFavori = useCallback(async (remedeId: string) => {
    const exists = favoris.some(f => f.remedeId === remedeId);
    if (exists) {
      await removeFavori(remedeId);
    } else {
      await addFavori(remedeId);
    }
  }, [favoris, addFavori, removeFavori]);

  const isFavori = useCallback((remedeId: string) => {
    return favoris.some(f => f.remedeId === remedeId);
  }, [favoris]);

  const updateNote = useCallback(async (remedeId: string, note: string) => {
    const newFavoris = favoris.map(f => 
      f.remedeId === remedeId ? { ...f, note } : f
    );
    await saveFavoris(newFavoris);
  }, [favoris]);

  const getNote = useCallback((remedeId: string) => {
    return favoris.find(f => f.remedeId === remedeId)?.note || '';
  }, [favoris]);

  const exportFavoris = useCallback(() => {
    return JSON.stringify(favoris, null, 2);
  }, [favoris]);

  const clearFavoris = useCallback(async () => {
    await AsyncStorage.removeItem(FAVORIS_KEY);
    setFavoris([]);
  }, []);

  return {
    favoris,
    loading,
    addFavori,
    removeFavori,
    toggleFavori,
    isFavori,
    updateNote,
    getNote,
    exportFavoris,
    clearFavoris,
  };
};
