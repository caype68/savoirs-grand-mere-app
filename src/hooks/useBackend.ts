// ============================================
// HOOK useBackend
// Hook React pour utiliser le backend hybride
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  initializeBackend,
  getBackendState,
  isUsingRemote,
  refreshConnection,
  BackendState,
} from '../services/supabase';

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook pour gérer l'état du backend et la connexion
 */
export function useBackend() {
  const [state, setState] = useState<BackendState>(getBackendState());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialisation au montage
  useEffect(() => {
    let mounted = true;

    async function init() {
      const newState = await initializeBackend();
      if (mounted) {
        setState(newState);
        setIsInitialized(true);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Rafraîchir la connexion
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshConnection();
      setState(getBackendState());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    ...state,
    isInitialized,
    isRefreshing,
    isRemote: isUsingRemote(),
    refresh,
  };
}

// ============================================
// HOOK useRemoteData
// Hook générique pour charger des données avec fallback
// ============================================

interface UseRemoteDataOptions<T> {
  initialData?: T;
  enabled?: boolean;
  cacheKey?: string;
}

interface UseRemoteDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  source: 'local' | 'remote' | 'hybrid' | null;
  refetch: () => Promise<void>;
}

/**
 * Hook générique pour charger des données avec fallback local
 */
export function useRemoteData<T>(
  fetcher: () => Promise<{ data: T; source: string }>,
  options: UseRemoteDataOptions<T> = {}
): UseRemoteDataResult<T> {
  const { initialData, enabled = true } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'local' | 'remote' | 'hybrid' | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result.data);
      setSource(result.source as 'local' | 'remote' | 'hybrid');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    isLoading,
    error,
    source,
    refetch: fetch,
  };
}

// ============================================
// HOOKS SPÉCIALISÉS POUR LES REMÈDES
// ============================================

import {
  getRemedies,
  getRemedyById,
  searchRemedies,
  getFeaturedRemedies,
} from '../services/supabase';
import { Remede } from '../types';

/**
 * Hook pour charger la liste des remèdes
 */
export function useRemedies(options?: {
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryOptions } = options || {};

  return useRemoteData<Remede[]>(
    () => getRemedies(queryOptions),
    { enabled, initialData: [] }
  );
}

/**
 * Hook pour charger un remède par ID
 */
export function useRemedy(id: string | undefined) {
  return useRemoteData<Remede | null>(
    () => getRemedyById(id || ''),
    { enabled: !!id }
  );
}

/**
 * Hook pour la recherche de remèdes
 */
export function useRemedySearch(query: string, limit: number = 20) {
  return useRemoteData<Remede[]>(
    () => searchRemedies(query, limit),
    { enabled: query.length >= 2, initialData: [] }
  );
}

/**
 * Hook pour les remèdes mis en avant
 */
export function useFeaturedRemedies(limit: number = 5) {
  return useRemoteData<Remede[]>(
    () => getFeaturedRemedies(limit),
    { initialData: [] }
  );
}

// ============================================
// EXPORTS
// ============================================

export default useBackend;
