import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 40;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.6; // Ratio de l'image

// Zones de douleur avec positions relatives (en pourcentage)
// Basé sur l'image avec 3 vues du corps (gauche, face, dos)
interface PainZone {
  id: string;
  label: string;
  searchTerms: string[];
  // Position en pourcentage de l'image
  x: number;
  y: number;
  // Taille du point tactile
  size: number;
}

const painZones: PainZone[] = [
  // Vue de profil gauche (personnage gauche ~17% du centre horizontal)
  { id: 'tete-profil', label: 'Tête', searchTerms: ['tête', 'migraine', 'céphalée', 'mal de tête'], x: 17, y: 12, size: 10 },
  { id: 'coude-profil', label: 'Coude', searchTerms: ['coude', 'articulation', 'bras'], x: 12, y: 42, size: 8 },
  { id: 'poignet', label: 'Poignet/Main', searchTerms: ['poignet', 'main', 'doigt', 'articulation'], x: 19, y: 52, size: 8 },
  { id: 'genou-profil', label: 'Genou', searchTerms: ['genou', 'articulation', 'jambe'], x: 14, y: 72, size: 8 },
  
  // Vue de face (personnage centre ~50% du centre horizontal)
  { id: 'tete', label: 'Tête', searchTerms: ['tête', 'migraine', 'céphalée', 'mal de tête'], x: 50, y: 10, size: 10 },
  { id: 'epaule-gauche', label: 'Épaule gauche', searchTerms: ['épaule', 'cou', 'cervicales'], x: 44, y: 22, size: 8 },
  { id: 'epaule-droite', label: 'Épaule droite', searchTerms: ['épaule', 'cou', 'cervicales'], x: 56, y: 22, size: 8 },
  { id: 'coude-gauche', label: 'Coude gauche', searchTerms: ['coude', 'articulation', 'bras'], x: 38, y: 40, size: 8 },
  { id: 'coude-droit', label: 'Coude droit', searchTerms: ['coude', 'articulation', 'bras'], x: 62, y: 40, size: 8 },
  { id: 'ventre-gauche', label: 'Ventre', searchTerms: ['ventre', 'estomac', 'digestion', 'intestin', 'abdomen'], x: 46, y: 48, size: 8 },
  { id: 'ventre-droit', label: 'Ventre', searchTerms: ['ventre', 'estomac', 'digestion', 'intestin', 'abdomen'], x: 54, y: 48, size: 8 },
  { id: 'genou-gauche', label: 'Genou gauche', searchTerms: ['genou', 'articulation', 'jambe'], x: 46, y: 75, size: 8 },
  { id: 'genou-droit', label: 'Genou droit', searchTerms: ['genou', 'articulation', 'jambe'], x: 54, y: 75, size: 8 },
  
  // Vue de dos (personnage droite ~83% du centre horizontal)
  { id: 'nuque', label: 'Nuque/Cou', searchTerms: ['nuque', 'cou', 'cervicales'], x: 83, y: 18, size: 8 },
  { id: 'dos-haut', label: 'Haut du dos', searchTerms: ['dos', 'dorsales', 'omoplates', 'épaule'], x: 80, y: 28, size: 8 },
  { id: 'dos-bas', label: 'Bas du dos', searchTerms: ['dos', 'lombaires', 'reins', 'lombalgie'], x: 83, y: 42, size: 8 },
  { id: 'genou-dos', label: 'Genou', searchTerms: ['genou', 'articulation', 'jambe'], x: 86, y: 72, size: 8 },
];

interface BodyPainSelectorProps {
  visible: boolean;
  searchTerm: string;
  onClose: () => void;
  onSelectZone: (zone: { id: string; label: string; searchTerms: string[] }) => void;
  onSkip: () => void;
}

export const BodyPainSelector: React.FC<BodyPainSelectorProps> = ({
  visible,
  searchTerm,
  onClose,
  onSelectZone,
  onSkip,
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<PainZone | null>(null);

  const handleZonePress = (zone: PainZone) => {
    setSelectedZone(zone.id);
    setHoveredZone(zone);
    // Petit délai pour montrer la sélection avant de fermer
    setTimeout(() => {
      onSelectZone(zone);
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Où avez-vous mal ?</Text>
          <Text style={styles.subtitle}>
            Touchez la zone douloureuse sur le corps
          </Text>

          {/* Body Image with touchable zones */}
          <View style={styles.bodyContainer}>
            <Image
              source={require('../../assets/images/body-pain-zones.png')}
              style={styles.bodyImage}
              resizeMode="contain"
            />
            
            {/* Touchable zones overlay */}
            {painZones.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.painPoint,
                  {
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: zone.size * 2.5,
                    height: zone.size * 2.5,
                    marginLeft: -(zone.size * 1.25),
                    marginTop: -(zone.size * 1.25),
                  },
                  selectedZone === zone.id && styles.painPointSelected,
                ]}
                onPress={() => handleZonePress(zone)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.painPointInner,
                  selectedZone === zone.id && styles.painPointInnerSelected,
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected zone indicator */}
          {hoveredZone && (
            <View style={styles.selectedIndicator}>
              <Feather name="check-circle" size={20} color={colors.accentPrimary} />
              <Text style={styles.selectedText}>{hoveredZone.label}</Text>
            </View>
          )}

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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: SCREEN_WIDTH - 32,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bodyContainer: {
    width: '100%',
    aspectRatio: 1.6,
    position: 'relative',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  painPoint: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  painPointInner: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  painPointSelected: {
    transform: [{ scale: 1.3 }],
  },
  painPointInnerSelected: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
    borderWidth: 3,
    borderColor: colors.accentPrimary,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  selectedText: {
    ...typography.h3,
    color: colors.accentPrimary,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  skipText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
