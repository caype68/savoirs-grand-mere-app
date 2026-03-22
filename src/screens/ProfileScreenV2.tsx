// ============================================
// PROFILE SCREEN V2 - SUPABASE AUTH
// Gestion complète du profil avec backend hybride
// ============================================

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../theme/colors';
import { UserProfile, HealthGoal, RemedyFormat } from '../types';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { StreakDisplay, BadgeCard } from '../components/StreakBadge';
import { clearAllData } from '../services/storage';
import { UserStreak as LocalUserStreak } from '../types';

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

const EXPERIENCE_LABELS = {
  debutant: '🌱 Débutant',
  intermediaire: '🌿 Intermédiaire',
  expert: '🌳 Expert',
};

const PROFILE_TYPE_LABELS = {
  adulte: 'Adulte',
  enfant: 'Enfant',
  senior: 'Senior',
  enceinte: 'Enceinte',
  allaitante: 'Allaitante',
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const ProfileScreenV2: React.FC = () => {
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

  // États locaux pour les modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  
  // États pour le formulaire d'auth
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // État pour l'édition du nom
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (profile?.nom) {
      setEditedName(profile.nom);
    }
  }, [profile]);

  // ============================================
  // HANDLERS AUTH
  // ============================================

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'login') {
        const result = await login({ email: authEmail, password: authPassword });
        if (result.success) {
          setShowAuthModal(false);
          resetAuthForm();
        } else {
          setAuthError(result.error || 'Erreur de connexion');
        }
      } else {
        const result = await register({ 
          email: authEmail, 
          password: authPassword,
          displayName: authName || authEmail.split('@')[0],
        });
        if (result.success) {
          setShowAuthModal(false);
          resetAuthForm();
          Alert.alert('Compte créé', 'Votre compte a été créé avec succès !');
        } else {
          setAuthError(result.error || "Erreur d'inscription");
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const resetAuthForm = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError(null);
  };

  // ============================================
  // HANDLERS PROFIL
  // ============================================

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfile({ avatarUri: result.assets[0].uri });
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim()) {
      const result = await updateProfile({ nom: editedName.trim() });
      if (result.success) {
        setShowEditNameModal(false);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de sauvegarder');
      }
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    await clearAllData();
    await logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Onboarding' as never }],
      })
    );
  };

  const handleRedoOnboarding = async () => {
    setShowRedoModal(false);
    await clearAllData();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Onboarding' as never }],
      })
    );
  };

  // ============================================
  // RENDER LOADING
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
  // RENDER ERROR / EMPTY
  // ============================================

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="user-x" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>Profil non trouvé</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => setShowAuthModal(true)}>
          <Text style={styles.errorButtonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.errorButtonSecondary} onPress={handleRedoOnboarding}>
          <Text style={styles.errorButtonSecondaryText}>Créer un profil local</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={styles.headerRight}>
            {/* Indicateur source */}
            <View style={[styles.sourceBadge, source === 'remote' && styles.sourceBadgeRemote]}>
              <Feather 
                name={source === 'remote' ? 'cloud' : 'smartphone'} 
                size={12} 
                color={source === 'remote' ? colors.accentSecondary : colors.textMuted} 
              />
              <Text style={[styles.sourceBadgeText, source === 'remote' && styles.sourceBadgeTextRemote]}>
                {source === 'remote' ? 'Sync' : 'Local'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar et infos principales */}
          <LinearGradient
            colors={[colors.accentPrimaryMuted, colors.surface]}
            style={styles.profileCard}
          >
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
            
            <TouchableOpacity onPress={() => setShowEditNameModal(true)}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.nom || 'Utilisateur'}</Text>
                <Feather name="edit-2" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.profileType}>
              {PROFILE_TYPE_LABELS[profile.profileType]} • {profile.age ? `${profile.age} ans` : 'Âge non renseigné'}
            </Text>
            
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceText}>
                {EXPERIENCE_LABELS[profile.niveauExperience]}
              </Text>
            </View>

            {/* Statut Auth */}
            {isAuthenticated && !isGuest ? (
              <View style={styles.authStatus}>
                <Feather name="check-circle" size={14} color={colors.accentPrimary} />
                <Text style={styles.authStatusText}>Connecté</Text>
                {profile.email && (
                  <Text style={styles.authEmail}>{profile.email}</Text>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={() => setShowAuthModal(true)}
              >
                <Feather name="log-in" size={16} color="#fff" />
                <Text style={styles.connectButtonText}>Se connecter</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          {/* Streak et Badges */}
          {streak && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="zap" size={18} color={colors.accentPrimary} />
                <Text style={styles.sectionTitle}>Ma progression</Text>
              </View>
              
              <StreakDisplay 
                streak={{
                  currentStreak: streak.currentStreak,
                  bestStreak: streak.bestStreak,
                  lastActiveDate: streak.lastActivityDate,
                  totalActiveDays: streak.totalDays,
                  streakStartDate: streak.updatedAt,
                  badges: [],
                }} 
                onPress={() => setShowBadgesModal(true)}
              />
              
              {/* Badges récents */}
              {badges.length > 0 && (
                <View style={styles.badgesPreview}>
                  <Text style={styles.badgesPreviewTitle}>
                    {badges.length} badge{badges.length > 1 ? 's' : ''} débloqué{badges.length > 1 ? 's' : ''}
                  </Text>
                  <View style={styles.badgesRow}>
                    {badges.slice(0, 4).map((badge, index) => (
                      <View key={index} style={styles.badgeMini}>
                        <Text style={styles.badgeMiniIcon}>{badge.badgeIcon}</Text>
                      </View>
                    ))}
                    {badges.length > 4 && (
                      <View style={styles.badgeMiniMore}>
                        <Text style={styles.badgeMiniMoreText}>+{badges.length - 4}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Objectifs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="target" size={18} color={colors.accentPrimary} />
              <Text style={styles.sectionTitle}>Mes objectifs</Text>
            </View>
            <View style={styles.tagsContainer}>
              {profile.objectifs.length > 0 ? (
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

          {/* Formats préférés */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="coffee" size={18} color={colors.accentPrimary} />
              <Text style={styles.sectionTitle}>Formats préférés</Text>
            </View>
            <View style={styles.tagsContainer}>
              {profile.formatsPreferes.length > 0 ? (
                profile.formatsPreferes.map((format) => (
                  <View key={format} style={styles.tagSecondary}>
                    <Text style={styles.tagTextSecondary}>{FORMAT_LABELS[format]}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Aucune préférence</Text>
              )}
            </View>
          </View>

          {/* Allergies */}
          {profile.allergies.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="alert-triangle" size={18} color="#FBBF24" />
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

          {/* Actions */}
          <View style={styles.actionsSection}>
            {isAuthenticated && !isGuest && (
              <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                <Feather name="log-out" size={20} color={colors.textSecondary} />
                <Text style={styles.actionButtonText}>Se déconnecter</Text>
                <Feather name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={() => setShowRedoModal(true)}>
              <Feather name="refresh-cw" size={20} color={colors.accentPrimary} />
              <Text style={styles.actionButtonText}>Refaire le questionnaire</Text>
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

          {/* Info compte */}
          <View style={styles.accountInfo}>
            <Text style={styles.accountInfoText}>
              Compte créé le {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.accountInfoText}>
              ID: {profile.id.slice(0, 12)}...
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      {/* Modal Auth */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.authModalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => { setShowAuthModal(false); resetAuthForm(); }}
            >
              <Feather name="x" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <Text style={styles.authModalTitle}>
              {authMode === 'login' ? 'Connexion' : 'Créer un compte'}
            </Text>

            {authError && (
              <View style={styles.authError}>
                <Feather name="alert-circle" size={16} color="#F87171" />
                <Text style={styles.authErrorText}>{authError}</Text>
              </View>
            )}

            {authMode === 'register' && (
              <TextInput
                style={styles.authInput}
                placeholder="Votre nom"
                placeholderTextColor={colors.textMuted}
                value={authName}
                onChangeText={setAuthName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={styles.authInput}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={authEmail}
              onChangeText={setAuthEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.authInput}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textMuted}
              value={authPassword}
              onChangeText={setAuthPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.authButton, authLoading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.authSwitch}
              onPress={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError(null);
              }}
            >
              <Text style={styles.authSwitchText}>
                {authMode === 'login' 
                  ? "Pas de compte ? S'inscrire" 
                  : 'Déjà un compte ? Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Badges */}
      <Modal
        visible={showBadgesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBadgesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.badgesModalContent}>
            <View style={styles.badgesModalHeader}>
              <Text style={styles.badgesModalTitle}>Mes badges</Text>
              <TouchableOpacity onPress={() => setShowBadgesModal(false)}>
                <Feather name="x" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.badgesList}>
              {badges.length > 0 ? (
                badges.map((badge, index) => (
                  <BadgeCard
                    key={index}
                    badge={{
                      type: badge.badgeId as any,
                      name: badge.badgeName,
                      description: badge.badgeDescription,
                      icon: badge.badgeIcon,
                      requiredDays: 0,
                      isUnlocked: true,
                      unlockedAt: badge.earnedAt,
                    }}
                    currentStreak={streak?.currentStreak || 0}
                  />
                ))
              ) : (
                <View style={styles.noBadges}>
                  <Text style={styles.noBadgesEmoji}>🏆</Text>
                  <Text style={styles.noBadgesText}>
                    Pas encore de badges. Continuez votre routine pour en débloquer !
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Supprimer Compte */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather name="alert-triangle" size={32} color="#F87171" />
            </View>
            <Text style={styles.modalTitle}>Supprimer le compte</Text>
            <Text style={styles.modalMessage}>
              Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront définitivement effacées.
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

      {/* Modal Refaire Questionnaire */}
      <Modal
        visible={showRedoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.accentPrimaryMuted }]}>
              <Feather name="refresh-cw" size={32} color={colors.accentPrimary} />
            </View>
            <Text style={styles.modalTitle}>Refaire le questionnaire</Text>
            <Text style={styles.modalMessage}>
              Voulez-vous refaire le questionnaire de personnalisation ? Vos préférences actuelles seront réinitialisées.
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

      {/* Modal Modifier Nom */}
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
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  errorButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorButtonSecondary: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  errorButtonSecondaryText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  sourceBadgeRemote: {
    backgroundColor: colors.accentSecondary + '20',
  },
  sourceBadgeText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sourceBadgeTextRemote: {
    color: colors.accentSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  profileCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
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
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  experienceBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  experienceText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  authStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.accentPrimaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  authStatusText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accentPrimary,
  },
  authEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagTextSecondary: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tagWarning: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagTextWarning: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  badgesPreview: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  badgesPreviewTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badgeMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeMiniIcon: {
    fontSize: 20,
  },
  badgeMiniMore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeMiniMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  actionsSection: {
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  actionButtonDanger: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  actionButtonTextDanger: {
    color: '#F87171',
  },
  accountInfo: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  accountInfoText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  bottomSpacer: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalInput: {
    width: '100%',
    backgroundColor: colors.surfaceInput,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderRadius: borderRadius.md,
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
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
  },
  // Auth Modal
  authModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  authModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  authError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  authErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
  },
  authInput: {
    backgroundColor: colors.surfaceInput,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  authButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  authSwitch: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  authSwitchText: {
    fontSize: 14,
    color: colors.accentPrimary,
  },
  // Badges Modal
  badgesModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  badgesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badgesModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badgesList: {
    flex: 1,
  },
  noBadges: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noBadgesEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  noBadgesText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default ProfileScreenV2;
