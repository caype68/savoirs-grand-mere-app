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
  signInWithGoogle as signInWithGoogleApi,
  resetPassword as resetPasswordApi,
  updatePassword as updatePasswordApi,
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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

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

      // 2. Récupérer le profil — ne JAMAIS écraser un profil existant avec un profil vierge
      let userProfile = await getUserProfileFromBackend();
      if (!userProfile) {
        // Vérifier si on a déjà un profil en state (ne pas écraser)
        if (profile && profile.id !== 'guest') {
          console.log('[useAuth] Profil backend non trouvé mais profil local existant — conservé');
          userProfile = profile;
        } else {
          // Vraiment aucun profil → créer un profil invité par défaut
          console.log('[useAuth] Aucun profil trouvé, création du profil invité par défaut');
          userProfile = {
            id: currentAuth.userId || 'guest',
            sexe: 'non_precise' as any,
            profileType: 'adulte' as any,
            objectifs: [],
            formatsPreferes: [],
            formatsPreferees: [],
            allergies: [],
            restrictions: [],
            niveauExperience: 'debutant' as any,
            notificationsEnabled: true,
            notificationFrequency: 'quotidien' as any,
            notificationHoraires: { matin: '08:00', soir: '21:00' },
            interesseParProduits: true,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any;
        }
      }
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

  // Écouter les changements d'auth (retour OAuth Google, etc.)
  useEffect(() => {
    const { getSupabaseClient } = require('../services/supabase/config');
    const client = getSupabaseClient();
    if (!client) return;

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('[useAuth] Auth state changed:', event);
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData();
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
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

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogleApi();
      if (result.success) {
        // Sur web, Supabase redirige automatiquement vers Google
        // Au retour, onAuthStateChange détectera la session
        return { success: true };
      } else {
        setError(result.error || 'Erreur Google Sign-In');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return await resetPasswordApi(email);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return await updatePasswordApi(newPassword);
    } catch (err: any) {
      return { success: false, error: err.message };
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
    loginWithGoogle,
    logout,
    resetPassword,
    updatePassword,
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
