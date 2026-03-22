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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../theme/colors';
import { UserProfile, HealthGoal, RemedyFormat } from '../types';
import { getUserProfile, clearAllData, saveUserProfile } from '../services/storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

// Labels pour l'affichage
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

export const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    console.log('📱 ProfileScreen: Loading user profile...');
    const userProfile = await getUserProfile();
    console.log('📱 ProfileScreen: User profile loaded:', userProfile);
    setProfile(userProfile);
    if (userProfile) {
      setEditedName(userProfile.nom || '');
    }
    setIsLoading(false);
  };

  const handlePickImage = async () => {
    console.log('📷 ProfileScreen: Picking image...');
    
    // Demander la permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      console.log('❌ Permission refusée');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('✅ Image sélectionnée:', result.assets[0].uri);
      if (profile) {
        const updatedProfile = {
          ...profile,
          avatarUri: result.assets[0].uri,
          updatedAt: new Date().toISOString(),
        };
        await saveUserProfile(updatedProfile);
        setProfile(updatedProfile);
      }
    }
  };

  const handleSaveName = async () => {
    if (profile && editedName.trim()) {
      const updatedProfile = {
        ...profile,
        nom: editedName.trim(),
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setShowEditNameModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    console.log('🗑️ ProfileScreen: Deleting user account...');
    setShowDeleteModal(false);
    await clearAllData();
    // Reset navigation to onboarding
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Onboarding' as never }],
      })
    );
  };

  const handleRedoOnboarding = async () => {
    console.log('🔄 ProfileScreen: Resetting onboarding...');
    setShowRedoModal(false);
    await clearAllData();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Onboarding' as never }],
      })
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="user-x" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>Profil non trouvé</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleRedoOnboarding}>
          <Text style={styles.errorButtonText}>Créer un profil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Profil</Text>
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
          </LinearGradient>

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

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="bell" size={18} color={colors.accentPrimary} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fréquence</Text>
              <Text style={styles.infoValue}>
                {profile.notificationFrequency === 'jamais' ? 'Désactivées' :
                 profile.notificationFrequency === 'quotidien' ? 'Quotidien' :
                 profile.notificationFrequency === 'hebdomadaire' ? 'Hebdomadaire' : '2-3 fois/semaine'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
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
    color: colors.textMuted,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 18,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  profileCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
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
  },
  experienceText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
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
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagTextWarning: {
    fontSize: 13,
    color: '#FBBF24',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
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
  actionsSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
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
  accountInfo: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  accountInfoText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  bottomSpacer: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
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
});

export default ProfileScreen;
