import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface BodyPartOption {
  id: string;
  label: string;
  icon: string;
  searchTerms: string[];
}

const bodyParts: BodyPartOption[] = [
  { id: 'tete', label: 'Tête', icon: 'circle', searchTerms: ['tête', 'migraine', 'céphalée', 'mal de tête'] },
  { id: 'gorge', label: 'Gorge', icon: 'mic', searchTerms: ['gorge', 'angine', 'pharyngite'] },
  { id: 'poitrine', label: 'Poitrine', icon: 'heart', searchTerms: ['poitrine', 'respiration', 'poumons'] },
  { id: 'ventre', label: 'Ventre', icon: 'coffee', searchTerms: ['ventre', 'estomac', 'digestion', 'intestin'] },
  { id: 'dos', label: 'Dos', icon: 'align-center', searchTerms: ['dos', 'lombaire', 'colonne'] },
  { id: 'articulations', label: 'Articulations', icon: 'move', searchTerms: ['articulation', 'genou', 'coude', 'épaule', 'rhumatisme'] },
  { id: 'muscles', label: 'Muscles', icon: 'activity', searchTerms: ['muscle', 'crampe', 'courbature'] },
  { id: 'peau', label: 'Peau', icon: 'droplet', searchTerms: ['peau', 'irritation', 'démangeaison'] },
  { id: 'dents', label: 'Dents', icon: 'smile', searchTerms: ['dent', 'dentaire', 'gencive'] },
  { id: 'general', label: 'Général / Fatigue', icon: 'zap', searchTerms: ['fatigue', 'général', 'corps'] },
];

// Termes larges qui déclenchent le modal
export const broadTerms = ['douleur', 'douleurs', 'mal', 'maux', 'souffrance', 'fait mal'];

export const isBroadSearchTerm = (query: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  return broadTerms.some(term => normalizedQuery.includes(term));
};

interface SearchRefinementModalProps {
  visible: boolean;
  searchTerm: string;
  onClose: () => void;
  onSelectBodyPart: (bodyPart: BodyPartOption) => void;
  onSkip: () => void;
}

export const SearchRefinementModal: React.FC<SearchRefinementModalProps> = ({
  visible,
  searchTerm,
  onClose,
  onSelectBodyPart,
  onSkip,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Feather name="help-circle" size={24} color={colors.accentPrimary} />
            </View>
            <Text style={styles.title}>Précisez votre recherche</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Vous recherchez "{searchTerm}". Pour de meilleurs résultats, où ressentez-vous cette douleur ?
          </Text>

          {/* Body Parts Grid */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.optionsGrid}>
              {bodyParts.map((part) => (
                <TouchableOpacity
                  key={part.id}
                  style={styles.optionCard}
                  onPress={() => onSelectBodyPart(part)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <Feather name={part.icon as any} size={24} color={colors.accentPrimary} />
                  </View>
                  <Text style={styles.optionLabel}>{part.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Voir tous les résultats pour "{searchTerm}"</Text>
            <Feather name="arrow-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  scrollView: {
    maxHeight: 300,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  optionCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  optionLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  skipText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
