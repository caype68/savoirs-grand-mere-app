// ============================================
// PROFILE SCREEN
// Branché sur Supabase Auth + fallback local
// Remplace l'ancienne version 100% locale
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../theme/colors';
import {
  HealthGoal,
  RemedyFormat,
  UserStreak as LocalStreak,
  StreakBadge as LocalBadge,
} from '../types';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

// Cross-platform alert (Alert.alert ne fonctionne pas sur web)
const crossAlert = (title: string, message: string, buttons?: Array<{ text: string; style?: string; onPress?: () => void }>) => {
  if (Platform.OS === 'web') {
    const hasCancel = buttons?.some(b => b.style === 'cancel');
    const actionBtn = buttons?.find(b => b.style !== 'cancel' && b.onPress);
    if (hasCancel && actionBtn) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && actionBtn.onPress) actionBtn.onPress();
    } else {
      window.alert(`${title}\n\n${message}`);
      const defaultBtn = buttons?.find(b => b.onPress);
      if (defaultBtn?.onPress) defaultBtn.onPress();
    }
  } else {
    Alert.alert(title, message, buttons as any);
  }
};
import { StreakDisplay, BadgeCard } from '../components/StreakBadge';
import { clearAllData } from '../services/storage';
import {
  UserStreak as ApiStreak,
  UserBadge,
  BADGE_DEFINITIONS,
} from '../services/supabase/streakApi';
import { checkAndMigrate } from '../services/supabase/migrationService';

// ============================================
// LABELS
// ============================================

const GOAL_LABELS: Record<HealthGoal, string> = {
  sommeil: '😴 Sommeil',
  digestion: '🍃 Digestion',
  stress: '🧘 Stress',
  immunite: '🛡️ Immunité',
  peau: '✨ Peau',
  douleurs: '💪 Douleurs',
  energie: '⚡ Énergie',
  respiration: '🌬️ Respiration',
  circulation: '❤️ Circulation',
  detox: '🌿 Détox',
};

const FORMAT_LABELS: Record<RemedyFormat, string> = {
  infusion: 'Infusions',
  tisane: 'Tisanes',
  sirop: 'Sirops',
  inhalation: 'Inhalations',
  cataplasme: 'Cataplasmes',
  friction: 'Frictions',
  compresse: 'Compresses',
  bain: 'Bains',
  gargarisme: 'Gargarismes',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  debutant: '🌱 Débutant',
  intermediaire: '🌿 Intermédiaire',
  expert: '🌳 Expert',
};

const PROFILE_TYPE_LABELS: Record<string, string> = {
  adulte: 'Adulte',
  enfant: 'Enfant',
  senior: 'Senior',
  enceinte: 'Enceinte',
  allaitante: 'Allaitante',
};

// ============================================
// ADAPTERS
// Résout l'incompatibilité entre streakApi.UserStreak et types.UserStreak
// Les deux interfaces existent mais ont des noms de champs différents
// ============================================

/**
 * Adapte le UserStreak de l'API (streakApi.ts) vers LocalStreak (types/index.ts)
 * nécessaire car StreakDisplay attend le format types.UserStreak
 *
 * streakApi :  lastActivityDate, totalDays
 * types     :  lastActiveDate,   totalActiveDays
 */
function adaptApiStreakToLocal(apiStreak: ApiStreak): LocalStreak {
  return {
    currentStreak: apiStreak.currentStreak,
    bestStreak: apiStreak.bestStreak,
    lastActiveDate: apiStreak.lastActivityDate,
    totalActiveDays: apiStreak.totalDays,
    streakStartDate: '', // non tracké côté API
    badges: [],          // badges gérés séparément via buildDisplayBadges
  };
}

/**
 * Construit la liste COMPLÈTE des 6 badges (débloqués + verrouillés)
 * à partir de BADGE_DEFINITIONS (définitions) + UserBadge[] (ceux gagnés)
 * → retourne LocalBadge[] attendu par BadgeCard
 *
 * UserBadge (API) :  { badgeId, badgeName, badgeIcon, earnedAt }
 * LocalBadge (types) : { type, name, icon, requiredDays, isUnlocked, unlockedAt }
 */
function buildDisplayBadges(earnedBadges: UserBadge[]): LocalBadge[] {
  return BADGE_DEFINITIONS.map((def) => {
    const earned = earnedBadges.find((b) => b.badgeId === def.id);
    return {
      type: def.slug as any, // cast StreakBadgeType — les slugs correspondent
      name: def.name,
      description: def.description,
      icon: def.icon,
      requiredDays: def.requiredValue,
      unlockedAt: earned?.earnedAt,
      isUnlocked: !!earned,
    };
  });
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    profile,
    streak,
    badges,
    isLoading,
    isAuthenticated,
    isGuest,
    error,
    source,
    login,
    register,
    logout,
    updateProfile,
    refresh,
  } = useAuth();

  // ——— États modals ———
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedNotifFreq, setSelectedNotifFreq] = useState<string>(
    profile?.notificationFrequency || 'quotidien'
  );

  // ——— Formulaire auth ———
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // ——— Édition nom ———
  const [editedName, setEditedName] = useState('');

  // ——— Migration ———
  const [isMigrating, setIsMigrating] = useState(false);
  // Ref pour éviter de relancer la migration à chaque re-render
  const migrationTriggered = React.useRef(false);

  // ============================================
  // CALLBACKS (déclarés AVANT les useEffect qui les utilisent)
  // ============================================

  const resetAuthForm = useCallback(() => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError(null);
  }, []);

  /**
   * Lance la migration des données locales vers Supabase
   * Déclarée avant le useEffect qui l'appelle (règle closure JS)
   */
  const triggerMigration = useCallback(async (userId: string) => {
    if (!userId || userId === 'guest') return;
    setIsMigrating(true);
    try {
      await checkAndMigrate(userId);
    } catch (err) {
      console.warn('[ProfileScreen] Erreur migration:', err);
    } finally {
      setIsMigrating(false);
    }
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  // Synchronise le nom éditable quand le profil change
  useEffect(() => {
    if (profile?.nom) {
      setEditedName(profile.nom);
    }
  }, [profile?.nom]);

  // Déclenche automatiquement la migration après connexion
  // useEffect (pas setTimeout) pour capturer profile.id réel après rechargement
  useEffect(() => {
    if (
      isAuthenticated &&
      profile?.id &&
      profile.id !== 'guest' &&
      !migrationTriggered.current
    ) {
      migrationTriggered.current = true;
      triggerMigration(profile.id);
    }
    // Reset le flag à la déconnexion pour permettre une future migration
    if (!isAuthenticated) {
      migrationTriggered.current = false;
    }
  }, [isAuthenticated, profile?.id, triggerMigration]);

  const handleAuth = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Email et mot de passe requis');
      return;
    }
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'login') {
        const result = await login({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (result.success) {
          setShowAuthModal(false);
          resetAuthForm();
          // La migration est déclenchée automatiquement par le useEffect
          // qui surveille isAuthenticated + profile.id
        } else {
          setAuthError(result.error || 'Identifiants incorrects');
        }
      } else {
        const result = await register({
          email: authEmail.trim(),
          password: authPassword,
          displayName: authName.trim() || authEmail.split('@')[0],
        });
        if (result.success) {
          setShowAuthModal(false);
          resetAuthForm();
          crossAlert(
            '🌿 Bienvenue !',
            'Votre compte a été créé. Vos données locales vont être synchronisées.',
            [{ text: 'Super !', style: 'default' }]
          );
          // Migration déclenchée par useEffect
        } else {
          setAuthError(result.error || "Erreur lors de l'inscription");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Une erreur inattendue est survenue');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    crossAlert(
      'Déconnexion',
      'Vos données locales sont conservées. Vous pourrez vous reconnecter à tout moment.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Rediriger vers l'écran Auth
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              })
            );
          },
        },
      ]
    );
  };

  // ============================================
  // HANDLERS PROFIL
  // ============================================

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      crossAlert('Permission requise', "Veuillez autoriser l'accès à votre galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType?.Images || 'images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      let uri = result.assets[0].uri;
      // Sur web, les blob: URIs sont temporaires — convertir en base64 pour persister
      if (Platform.OS === 'web' && uri.startsWith('blob:')) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const reader = new FileReader();
          uri = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Erreur conversion avatar:', e);
        }
      }
      await updateProfile({ avatarUri: uri });
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    const result = await updateProfile({ nom: editedName.trim() });
    if (result.success) {
      setShowEditNameModal(false);
    } else {
      crossAlert('Erreur', result.error || 'Impossible de sauvegarder');
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    if (isAuthenticated) await logout();
    await clearAllData();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' as never }] })
    );
  };

  const handleRedoOnboarding = async () => {
    setShowRedoModal(false);
    await clearAllData();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Onboarding' as never }] })
    );
  };

  // ============================================
  // DONNÉES ADAPTÉES (résolution des conflits de types)
  // ============================================

  // Adapte le streak API → format attendu par StreakDisplay
  const localStreak = streak ? adaptApiStreakToLocal(streak) : null;

  // Construit tous les badges (débloqués + verrouillés) pour BadgeCard
  const displayBadges = buildDisplayBadges(badges);

  // Compte de badges débloqués
  const unlockedCount = badges.length;

  // ============================================
  // RENDER — LOADING
  // ============================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  // ============================================
  // RENDER — PROFIL ABSENT
  // ============================================

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="user-x" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>Profil introuvable</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
        >
          <Text style={styles.errorButtonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.errorButtonSecondary} onPress={handleRedoOnboarding}>
          <Text style={styles.errorButtonSecondaryText}>Créer un profil local</Text>
        </TouchableOpacity>

        {/* Modal auth accessible même depuis l'empty state */}
        <Modal
          visible={showAuthModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAuthModal(false)}
        >
          {renderAuthModal()}
        </Modal>
      </View>
    );
  }

  // ============================================
  // RENDER — MODAL AUTH (réutilisable)
  // ============================================

  function renderAuthModal() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.authModalOverlay}
      >
        <View style={styles.authModalContent}>
          {/* Fermer */}
          <TouchableOpacity
            style={styles.authModalClose}
            onPress={() => {
              setShowAuthModal(false);
              resetAuthForm();
            }}
          >
            <Feather name="x" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Icône */}
          <View style={styles.authModalIconContainer}>
            <Text style={styles.authModalEmoji}>🌿</Text>
          </View>

          {/* Titre */}
          <Text style={styles.authModalTitle}>
            {authMode === 'login' ? 'Bon retour !' : 'Créer un compte'}
          </Text>
          <Text style={styles.authModalSubtitle}>
            {authMode === 'login'
              ? 'Connectez-vous pour synchroniser vos données'
              : 'Sauvegardez votre progression sur tous vos appareils'}
          </Text>

          {/* Toggle connexion / inscription */}
          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[
                styles.authToggleBtn,
                authMode === 'login' && styles.authToggleBtnActive,
              ]}
              onPress={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
            >
              <Text
                style={[
                  styles.authToggleText,
                  authMode === 'login' && styles.authToggleTextActive,
                ]}
              >
                Connexion
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.authToggleBtn,
                authMode === 'register' && styles.authToggleBtnActive,
              ]}
              onPress={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
            >
              <Text
                style={[
                  styles.authToggleText,
                  authMode === 'register' && styles.authToggleTextActive,
                ]}
              >
                Inscription
              </Text>
            </TouchableOpacity>
          </View>

          {/* Champ prénom (inscription seulement) */}
          {authMode === 'register' && (
            <TextInput
              style={styles.authInput}
              placeholder="Votre prénom (optionnel)"
              placeholderTextColor={colors.textMuted}
              value={authName}
              onChangeText={setAuthName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          )}

          {/* Email */}
          <TextInput
            style={styles.authInput}
            placeholder="Adresse email"
            placeholderTextColor={colors.textMuted}
            value={authEmail}
            onChangeText={setAuthEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Mot de passe */}
          <TextInput
            style={styles.authInput}
            placeholder="Mot de passe (min. 6 caractères)"
            placeholderTextColor={colors.textMuted}
            value={authPassword}
            onChangeText={setAuthPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleAuth}
          />

          {/* Erreur */}
          {authError ? (
            <View style={styles.authErrorBox}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={styles.authErrorText}>{authError}</Text>
            </View>
          ) : null}

          {/* Bouton submit */}
          <TouchableOpacity
            style={[
              styles.authSubmitBtn,
              isAuthLoading && styles.authSubmitBtnDisabled,
            ]}
            onPress={handleAuth}
            disabled={isAuthLoading}
            activeOpacity={0.8}
          >
            {isAuthLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.authSubmitText}>
                {authMode === 'login' ? 'Se connecter' : 'Créer le compte'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Note migration */}
          <Text style={styles.authDisclaimer}>
            🔒 Vos données locales seront synchronisées automatiquement.
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* ——— HEADER ——— */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={[styles.sourceBadge, source === 'remote' && styles.sourceBadgeRemote]}>
            <Feather
              name={source === 'remote' ? 'cloud' : 'smartphone'}
              size={11}
              color={source === 'remote' ? colors.accentPrimary : colors.textMuted}
            />
            <Text
              style={[
                styles.sourceBadgeText,
                source === 'remote' && styles.sourceBadgeTextRemote,
              ]}
            >
              {source === 'remote' ? 'Synchronisé' : 'Local'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ——— CARTE PROFIL ——— */}
          <LinearGradient
            colors={[colors.accentPrimaryMuted, colors.surface]}
            style={styles.profileCard}
          >
            {/* Avatar */}
            <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Feather name="user" size={40} color={colors.accentPrimary} />
                </View>
              )}
              <View style={styles.editAvatarBadge}>
                <Feather name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Nom éditable */}
            <TouchableOpacity
              onPress={() => {
                setEditedName(profile.nom || '');
                setShowEditNameModal(true);
              }}
            >
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.nom || 'Utilisateur'}</Text>
                <Feather name="edit-2" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            {/* Email */}
            {profile.email ? (
              <Text style={styles.profileEmail}>{profile.email}</Text>
            ) : null}

            {/* Type & âge */}
            <Text style={styles.profileType}>
              {PROFILE_TYPE_LABELS[profile.profileType] || 'Adulte'}
              {profile.age ? ` • ${profile.age} ans` : ''}
            </Text>

            {/* Niveau d'expérience */}
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceText}>
                {EXPERIENCE_LABELS[profile.niveauExperience] || '🌱 Débutant'}
              </Text>
            </View>

            {/* ——— Auth status ——— */}
            {isGuest ? (
              <TouchableOpacity
                style={styles.authInviteBtn}
                onPress={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                activeOpacity={0.8}
              >
                <Feather name="log-in" size={15} color="#fff" />
                <Text style={styles.authInviteBtnText}>
                  Se connecter · Sauvegarder mes données
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.connectedRow}>
                <Feather name="check-circle" size={14} color="#4ade80" />
                <Text style={styles.connectedText}>Compte synchronisé</Text>
              </View>
            )}
          </LinearGradient>

          {/* ——— BANNIÈRE MIGRATION ——— */}
          {isMigrating && (
            <View style={styles.migrationBanner}>
              <ActivityIndicator size="small" color={colors.accentPrimary} />
              <Text style={styles.migrationText}>Synchronisation en cours...</Text>
            </View>
          )}

          {/* ——— BANNIÈRE ERREUR ——— */}
          {error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={15} color={colors.error} />
              <Text style={styles.errorBannerText} numberOfLines={2}>
                {error}
              </Text>
              <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ——— STREAK ——— */}
          {localStreak !== null && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🔥</Text>
                <Text style={styles.sectionTitle}>Série d'activité</Text>
                <View style={styles.streakPill}>
                  <Text style={styles.streakPillText}>
                    {streak?.currentStreak ?? 0} jour{(streak?.currentStreak ?? 0) !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <StreakDisplay streak={localStreak} />
            </View>
          )}

          {/* ——— BADGES ——— */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="award" size={18} color={colors.accentPrimary} />
              <Text style={styles.sectionTitle}>Badges</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>
                  {unlockedCount} / {BADGE_DEFINITIONS.length}
                </Text>
              </View>
            </View>
            {displayBadges.map((badge) => (
              <BadgeCard
                key={badge.type}
                badge={badge}
                currentStreak={streak?.currentStreak ?? 0}
              />
            ))}
          </View>

          {/* ——— OBJECTIFS ——— */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="target" size={18} color={colors.accentPrimary} />
              <Text style={styles.sectionTitle}>Mes objectifs</Text>
            </View>
            <View style={styles.tagsContainer}>
              {(profile.objectifs?.length || 0) > 0 ? (
                profile.objectifs.map((goal) => (
                  <View key={goal} style={styles.tag}>
                    <Text style={styles.tagText}>{GOAL_LABELS[goal]}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucun objectif défini</Text>
              )}
            </View>
          </View>

          {/* ——— FORMATS PRÉFÉRÉS ——— */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="coffee" size={18} color={colors.accentPrimary} />
              <Text style={styles.sectionTitle}>Formats préférés</Text>
            </View>
            <View style={styles.tagsContainer}>
              {(profile.formatsPreferes?.length || 0) > 0 ? (
                (profile.formatsPreferes || []).map((format) => (
                  <View key={format} style={styles.tagSecondary}>
                    <Text style={styles.tagTextSecondary}>{FORMAT_LABELS[format]}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucune préférence</Text>
              )}
            </View>
          </View>

          {/* ——— ALLERGIES ——— */}
          {(profile.allergies?.length || 0) > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="alert-triangle" size={18} color={colors.warning} />
                <Text style={styles.sectionTitle}>Allergies</Text>
              </View>
              <View style={styles.tagsContainer}>
                {profile.allergies.map((allergy) => (
                  <View key={allergy} style={styles.tagWarning}>
                    <Text style={styles.tagTextWarning}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ——— NOTIFICATIONS (cliquable) ——— */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => {
              setSelectedNotifFreq(profile.notificationFrequency || 'quotidien');
              setShowNotifModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Feather name="bell" size={18} color={colors.accentPrimary} />
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.editBadge}>
                <Feather name="edit-2" size={12} color={colors.accentPrimary} />
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fréquence</Text>
              <View style={styles.notifValueRow}>
                <Text style={styles.infoValue}>
                  {profile.notificationFrequency === 'jamais'
                    ? '🔕 Désactivées'
                    : profile.notificationFrequency === 'quotidien'
                    ? '🔔 Quotidien'
                    : profile.notificationFrequency === 'hebdomadaire'
                    ? '🔔 Hebdomadaire'
                    : '🔔 2–3 fois / semaine'}
                </Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </View>
            </View>
            {profile.notificationHoraires && (
              <View style={[styles.infoRow, { marginTop: spacing.sm }]}>
                <Text style={styles.infoLabel}>Horaires</Text>
                <Text style={styles.infoValue}>
                  🌅 {profile.notificationHoraires.matin || '08:00'} · 🌙 {profile.notificationHoraires.soir || '21:00'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ——— ACTIONS ——— */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowRedoModal(true)}
            >
              <Feather name="refresh-cw" size={20} color={colors.accentPrimary} />
              <Text style={styles.actionButtonText}>Refaire le questionnaire</Text>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={colors.textSecondary} />
              <Text style={styles.actionButtonText}>Se déconnecter</Text>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => setShowDeleteModal(true)}
            >
              <Feather name="trash-2" size={20} color="#F87171" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                Supprimer mon compte
              </Text>
              <Feather name="chevron-right" size={20} color="#F87171" />
            </TouchableOpacity>
          </View>

          {/* ——— INFO COMPTE ——— */}
          <View style={styles.accountInfo}>
            <Text style={styles.accountInfoText}>
              Compte créé le{' '}
              {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.accountInfoText}>
              ID : {profile.id.slice(0, 12)}...
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      {/* ================================================ */}
      {/* MODAL AUTH (login / register)                    */}
      {/* ================================================ */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAuthModal(false);
          resetAuthForm();
        }}
      >
        {renderAuthModal()}
      </Modal>

      {/* ================================================ */}
      {/* MODAL SUPPRIMER COMPTE                           */}
      {/* ================================================ */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconDanger}>
              <Feather name="alert-triangle" size={32} color="#F87171" />
            </View>
            <Text style={styles.modalTitle}>Supprimer le compte</Text>
            <Text style={styles.modalMessage}>
              Toutes vos données locales seront définitivement supprimées.
              {isAuthenticated
                ? '\n\nVotre compte Supabase restera actif et pourra être réutilisé.'
                : ''}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonDanger}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalButtonDangerText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================================================ */}
      {/* MODAL REFAIRE QUESTIONNAIRE                      */}
      {/* ================================================ */}
      <Modal
        visible={showRedoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconPrimary}>
              <Feather name="refresh-cw" size={32} color={colors.accentPrimary} />
            </View>
            <Text style={styles.modalTitle}>Refaire le questionnaire</Text>
            <Text style={styles.modalMessage}>
              Vos préférences seront réinitialisées. Votre compte Supabase restera intact.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowRedoModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleRedoOnboarding}
              >
                <Text style={styles.modalButtonPrimaryText}>Refaire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================================================ */}
      {/* MODAL MODIFIER NOM                               */}
      {/* ================================================ */}
      <Modal
        visible={showEditNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le nom</Text>
            <TextInput
              style={styles.modalInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Votre nom"
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowEditNameModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleSaveName}
              >
                <Text style={styles.modalButtonPrimaryText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================================================ */}
      {/* MODAL NOTIFICATIONS                              */}
      {/* ================================================ */}
      <Modal
        visible={showNotifModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifModal(false)}
      >
        <View style={styles.notifModalOverlay}>
          <View style={styles.notifModalContent}>
            <View style={styles.notifModalHandle} />

            <View style={styles.notifModalHeader}>
              <View style={styles.notifModalIconCircle}>
                <Feather name="bell" size={28} color={colors.accentPrimary} />
              </View>
              <Text style={styles.notifModalTitle}>Notifications</Text>
              <Text style={styles.notifModalSubtitle}>
                Choisis la fréquence de tes rappels bien-être
              </Text>
            </View>

            {/* Options */}
            {[
              { key: 'quotidien', label: 'Quotidien', desc: 'Un rappel chaque jour', icon: '🔔', emoji: '☀️' },
              { key: '2-3_fois', label: '2–3 fois / semaine', desc: 'Mardi, jeudi et samedi', icon: '🔔', emoji: '📅' },
              { key: 'hebdomadaire', label: 'Hebdomadaire', desc: 'Un rappel par semaine', icon: '🔔', emoji: '📆' },
              { key: 'jamais', label: 'Désactivées', desc: 'Pas de notifications', icon: '🔕', emoji: '🔇' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.notifOption,
                  selectedNotifFreq === option.key && styles.notifOptionSelected,
                ]}
                onPress={() => setSelectedNotifFreq(option.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.notifOptionEmoji}>{option.emoji}</Text>
                <View style={styles.notifOptionInfo}>
                  <Text style={[
                    styles.notifOptionLabel,
                    selectedNotifFreq === option.key && styles.notifOptionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.notifOptionDesc}>{option.desc}</Text>
                </View>
                <View style={[
                  styles.notifRadio,
                  selectedNotifFreq === option.key && styles.notifRadioSelected,
                ]}>
                  {selectedNotifFreq === option.key && (
                    <Feather name="check" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Boutons */}
            <View style={styles.notifModalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowNotifModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={async () => {
                  await updateProfile({ notificationFrequency: selectedNotifFreq as any });
                  setShowNotifModal(false);
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // ——— Loading ———
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 15,
  },

  // ——— Empty / Error state ———
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginTop: spacing.md,
  },
  errorButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorButtonSecondary: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  errorButtonSecondaryText: {
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // ——— Layout principal ———
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // ——— Header ———
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // ——— Badge source (local / synchronisé) ———
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceBadgeRemote: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentPrimaryMuted,
  },
  sourceBadgeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sourceBadgeTextRemote: {
    color: colors.accentPrimary,
  },

  // ——— Carte profil ———
  profileCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  avatarContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accentPrimary,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.accentPrimary,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  profileType: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  experienceBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  experienceText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  // ——— Auth invite ———
  authInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  authInviteBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  connectedText: {
    fontSize: 13,
    color: '#4ade80',
    fontWeight: '500',
  },

  // ——— Banners ———
  migrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimaryMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  migrationText: {
    fontSize: 13,
    color: colors.accentPrimary,
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(195, 107, 107, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(195, 107, 107, 0.3)',
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  retryBtnText: {
    fontSize: 13,
    color: colors.accentPrimary,
    fontWeight: '600',
  },

  // ——— Sections ———
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },

  // ——— Streak pill ———
  streakPill: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  streakPillText: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '700',
  },

  // ——— Badge pill ———
  badgePill: {
    backgroundColor: colors.accentPrimaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgePillText: {
    fontSize: 11,
    color: colors.accentPrimary,
    fontWeight: '700',
  },

  // ——— Tags ———
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.accentPrimaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: 13,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
  tagSecondary: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagTextSecondary: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tagWarning: {
    backgroundColor: 'rgba(210, 165, 101, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagTextWarning: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  // ——— Info row ———
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  // ——— Actions ———
  actionsSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  actionButtonDanger: {
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  actionButtonTextDanger: {
    color: '#F87171',
  },

  // ——— Account info ———
  accountInfo: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  accountInfoText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomSpacer: {
    height: 60,
  },

  // ================================================
  // AUTH MODAL
  // ================================================
  authModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  authModalContent: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
  },
  authModalClose: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    padding: spacing.xs,
    zIndex: 10,
  },
  authModalIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  authModalEmoji: {
    fontSize: 40,
  },
  authModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  authModalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  // Toggle login / register
  authToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  authToggleBtnActive: {
    backgroundColor: colors.accentPrimary,
  },
  authToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  authToggleTextActive: {
    color: '#fff',
  },

  // Inputs
  authInput: {
    backgroundColor: colors.surfaceInput,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Erreur
  authErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(195, 107, 107, 0.15)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  authErrorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },

  // Bouton submit
  authSubmitBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  authSubmitBtnDisabled: {
    opacity: 0.6,
  },
  authSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  authDisclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ================================================
  // MODALS GÉNÉRIQUES
  // ================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconDanger: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalIconPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  modalInput: {
    width: '100%',
    backgroundColor: colors.surfaceInput,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalButtonDanger: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F87171',
    alignItems: 'center',
  },
  modalButtonDangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // ——— Edit badge (notification section) ———
  editBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // ——— Notification Modal ———
  notifModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  notifModalContent: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
  },
  notifModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  notifModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  notifModalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  notifModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  notifModalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  notifOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  notifOptionSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryMuted,
  },
  notifOptionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  notifOptionInfo: {
    flex: 1,
  },
  notifOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  notifOptionLabelSelected: {
    color: colors.accentPrimary,
  },
  notifOptionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  notifRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  notifRadioSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  notifModalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});

export default ProfileScreen;
