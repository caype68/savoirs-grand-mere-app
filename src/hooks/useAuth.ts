// ============================================
// HOOK useAuth
// Gestion complète de l'authentification Supabase
// avec fallback local
// ============================================

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { UserProfile, HealthGoal } from '../types';
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getUserProfileFromBackend,
  updateUserProfile,
  updateUserGoals,
  AuthState,
  SignUpData,
  SignInData,
} from '../services/supabase/authApi';
import {
  getUserStreak,
  getUserBadges,
  updateUserStreak,
  UserStreak,
  UserBadge,
} from '../services/supabase/streakApi';
import { getBackendState } from '../services/supabase/backendProvider';

// ============================================
// TYPES
// ============================================

export interface AuthContextType {
  // État
  authState: AuthState;
  profile: UserProfile | null;
  streak: UserStreak | null;
  badges: UserBadge[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  error: string | null;
  source: 'local' | 'remote';
  
  // Actions Auth
  login: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  register: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Actions Profil
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  setGoals: (goals: HealthGoal[]) => Promise<{ success: boolean; error?: string }>;
  
  // Actions Streak
  recordActivity: () => Promise<{ newBadges: UserBadge[] }>;
  
  // Refresh
  refresh: () => Promise<void>;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useAuth(): AuthContextType {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    email: null,
    isGuest: true,
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'local' | 'remote'>('local');

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Récupérer l'état d'auth
      const currentAuth = await getCurrentUser();
      setAuthState(currentAuth);

      // 2. Récupérer le profil
      const userProfile = await getUserProfileFromBackend();
      setProfile(userProfile);

      // 3. Récupérer le streak
      const streakResult = await getUserStreak();
      setStreak(streakResult.data);
      setSource(streakResult.source as 'local' | 'remote');

      // 4. Récupérer les badges
      const badgesResult = await getUserBadges();
      setBadges(badgesResult.data);

    } catch (err: any) {
      console.error('[useAuth] Error loading user data:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // ============================================
  // ACTIONS AUTH
  // ============================================

  const login = useCallback(async (data: SignInData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(data);
      
      if (result.success) {
        await loadUserData();
        return { success: true };
      } else {
        setError(result.error || 'Erreur de connexion');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur de connexion';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserData]);

  const register = useCallback(async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp(data);
      
      if (result.success) {
        await loadUserData();
        return { success: true };
      } else {
        setError(result.error || "Erreur d'inscription");
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const errorMsg = err.message || "Erreur d'inscription";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserData]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
      setAuthState({
        isAuthenticated: false,
        userId: null,
        email: null,
        isGuest: true,
      });
      setProfile(null);
      // Garder le streak et badges locaux
    } catch (err: any) {
      console.error('[useAuth] Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // ACTIONS PROFIL
  // ============================================

  const updateProfileAction = useCallback(async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await updateUserProfile(updates);
      
      if (result.success) {
        // Mettre à jour le profil local
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const setGoals = useCallback(async (goals: HealthGoal[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await updateUserGoals(goals);
      
      if (result.success) {
        setProfile(prev => prev ? { ...prev, objectifs: goals } : null);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  // ============================================
  // ACTIONS STREAK
  // ============================================

  const recordActivity = useCallback(async (): Promise<{ newBadges: UserBadge[] }> => {
    try {
      const result = await updateUserStreak();
      setStreak(result.data);
      
      if (result.newBadges.length > 0) {
        setBadges(prev => [...prev, ...result.newBadges]);
      }
      
      return { newBadges: result.newBadges };
    } catch (err) {
      console.error('[useAuth] Error recording activity:', err);
      return { newBadges: [] };
    }
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    authState,
    profile,
    streak,
    badges,
    isLoading,
    isAuthenticated: authState.isAuthenticated,
    isGuest: authState.isGuest,
    error,
    source,
    login,
    register,
    logout,
    updateProfile: updateProfileAction,
    setGoals,
    recordActivity,
    refresh: loadUserData,
  };
}

// ============================================
// CONTEXT (optionnel pour usage global)
// ============================================

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = AuthContext.Provider;

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

// ============================================
// EXPORTS
// ============================================

export default useAuth;
