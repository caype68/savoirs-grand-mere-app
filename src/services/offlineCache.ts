// ============================================
// SERVICE CACHE HORS-LIGNE
// Sauvegarde les remèdes consultés pour accès offline
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@offline_remedy_';
const CACHE_INDEX_KEY = '@offline_cache_index';
const LAST_SEARCH_KEY = '@offline_last_search';
const MAX_CACHED = 50;

// ============================================
// TYPES
// ============================================

interface CacheEntry {
  id: string;
  cachedAt: string;
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Cache un remède pour accès hors-ligne
 */
export async function cacheRemedy(remedy: any): Promise<void> {
  if (!remedy?.id) return;

  try {
    // Sauvegarder le remède
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${remedy.id}`,
      JSON.stringify(remedy)
    );

    // Mettre à jour l'index
    const index = await getCacheIndex();
    const existing = index.findIndex((e) => e.id === remedy.id);
    if (existing >= 0) {
      index.splice(existing, 1);
    }
    index.unshift({ id: remedy.id, cachedAt: new Date().toISOString() });

    // Éviction FIFO si > MAX_CACHED
    while (index.length > MAX_CACHED) {
      const removed = index.pop();
      if (removed) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${removed.id}`);
      }
    }

    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.warn('[OfflineCache] Error caching remedy:', e);
  }
}

/**
 * Récupère un remède depuis le cache
 */
export async function getCachedRemedy(id: string): Promise<any | null> {
  try {
    const data = await AsyncStorage.getItem(`${CACHE_PREFIX}${id}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('[OfflineCache] Error reading cache:', e);
    return null;
  }
}

/**
 * Vérifie si un remède est en cache
 */
export async function isRemedyCached(id: string): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(`${CACHE_PREFIX}${id}`);
    return data !== null;
  } catch {
    return false;
  }
}

/**
 * Récupère tous les remèdes en cache
 */
export async function getAllCachedRemedies(): Promise<any[]> {
  try {
    const index = await getCacheIndex();
    const remedies: any[] = [];

    for (const entry of index) {
      const data = await AsyncStorage.getItem(`${CACHE_PREFIX}${entry.id}`);
      if (data) {
        remedies.push(JSON.parse(data));
      }
    }

    return remedies;
  } catch (e) {
    console.warn('[OfflineCache] Error reading all cached:', e);
    return [];
  }
}

/**
 * Sauvegarde les derniers résultats de recherche
 */
export async function cacheSearchResults(query: string, results: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      LAST_SEARCH_KEY,
      JSON.stringify({ query, results: results.slice(0, 20), cachedAt: new Date().toISOString() })
    );
  } catch (e) {
    console.warn('[OfflineCache] Error caching search:', e);
  }
}

/**
 * Récupère les derniers résultats de recherche
 */
export async function getCachedSearchResults(): Promise<{ query: string; results: any[] } | null> {
  try {
    const data = await AsyncStorage.getItem(LAST_SEARCH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Nombre de remèdes en cache
 */
export async function getCacheCount(): Promise<number> {
  const index = await getCacheIndex();
  return index.length;
}

/**
 * Vide le cache
 */
export async function clearCache(): Promise<void> {
  try {
    const index = await getCacheIndex();
    for (const entry of index) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${entry.id}`);
    }
    await AsyncStorage.removeItem(CACHE_INDEX_KEY);
    await AsyncStorage.removeItem(LAST_SEARCH_KEY);
  } catch (e) {
    console.warn('[OfflineCache] Error clearing cache:', e);
  }
}

// ============================================
// HELPERS
// ============================================

async function getCacheIndex(): Promise<CacheEntry[]> {
  try {
    const data = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
