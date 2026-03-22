// ============================================
// COMPOSANT D'AVERTISSEMENT MÉDICAL
// Pour l'aromathérapie et les remèdes
// ============================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { SafetyLevel, ProfileCompatibility } from '../types';

// ============================================
// TYPES
// ============================================

interface MedicalWarningCardProps {
  type?: 'aromatherapy' | 'remedy' | 'general';
  safetyLevel?: SafetyLevel;
  incompatibleProfiles?: ProfileCompatibility[];
  precautions?: string[];
  contraindications?: string[];
  compact?: boolean;
  showDisclaimer?: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const SAFETY_LEVEL_CONFIG: Record<SafetyLevel, { color: string; icon: string; label: string }> = {
  safe: { color: '#4CAF50', icon: 'check-circle', label: 'Usage courant' },
  caution: { color: '#FF9800', icon: 'alert-circle', label: 'Précautions requises' },
  restricted: { color: '#F44336', icon: 'alert-triangle', label: 'Usage restreint' },
  expert_only: { color: '#9C27B0', icon: 'alert-octagon', label: 'Avis expert requis' },
};

const PROFILE_LABELS: Record<ProfileCompatibility, string> = {
  adulte: 'Adultes',
  enfant_6_plus: 'Enfants +6 ans',
  enfant_3_plus: 'Enfants +3 ans',
  femme_enceinte: 'Femmes enceintes',
  femme_allaitante: 'Femmes allaitantes',
  senior: 'Seniors',
  tous: 'Tous publics',
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const MedicalWarningCard: React.FC<MedicalWarningCardProps> = ({
  type = 'aromatherapy',
  safetyLevel,
  incompatibleProfiles = [],
  precautions = [],
  contraindications = [],
  compact = false,
  showDisclaimer = true,
}) => {
  const safetyConfig = safetyLevel ? SAFETY_LEVEL_CONFIG[safetyLevel] : null;
  const hasWarnings = incompatibleProfiles.length > 0 || contraindications.length > 0;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Bandeau de sécurité */}
      {safetyConfig && (
        <View style={[styles.safetyBanner, { backgroundColor: `${safetyConfig.color}15` }]}>
          <Feather 
            name={safetyConfig.icon as any} 
            size={16} 
            color={safetyConfig.color} 
          />
          <Text style={[styles.safetyLabel, { color: safetyConfig.color }]}>
            {safetyConfig.label}
          </Text>
        </View>
      )}

      {/* Avertissement principal */}
      <View style={styles.warningHeader}>
        <View style={styles.warningIconContainer}>
          <Feather name="alert-triangle" size={20} color="#FF9800" />
        </View>
        <Text style={styles.warningTitle}>
          {type === 'aromatherapy' ? 'Précautions aromathérapie' : 'Avertissement'}
        </Text>
      </View>

      {/* Profils incompatibles */}
      {incompatibleProfiles.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user-x" size={14} color="#F44336" />
            <Text style={styles.sectionTitle}>Déconseillé pour :</Text>
          </View>
          <View style={styles.tagContainer}>
            {incompatibleProfiles.map((profile, index) => (
              <View key={index} style={styles.dangerTag}>
                <Text style={styles.dangerTagText}>
                  {PROFILE_LABELS[profile] || profile}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contre-indications */}
      {contraindications.length > 0 && !compact && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="x-circle" size={14} color="#F44336" />
            <Text style={styles.sectionTitle}>Contre-indications :</Text>
          </View>
          <View style={styles.listContainer}>
            {contraindications.slice(0, compact ? 2 : 5).map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Précautions */}
      {precautions.length > 0 && !compact && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={14} color="#FF9800" />
            <Text style={styles.sectionTitle}>Précautions :</Text>
          </View>
          <View style={styles.listContainer}>
            {precautions.slice(0, compact ? 2 : 5).map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Disclaimer */}
      {showDisclaimer && (
        <View style={styles.disclaimer}>
          <Feather name="info" size={12} color={colors.textMuted} />
          <Text style={styles.disclaimerText}>
            {type === 'aromatherapy' 
              ? 'Les huiles essentielles ne remplacent pas un traitement médical. Consultez un professionnel de santé en cas de doute.'
              : 'Ces informations sont documentaires et ne remplacent pas un avis médical.'}
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================
// COMPOSANT COMPACT POUR LISTE
// ============================================

interface SafetyBadgeProps {
  safetyLevel: SafetyLevel;
  size?: 'small' | 'medium';
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({ 
  safetyLevel, 
  size = 'small' 
}) => {
  const config = SAFETY_LEVEL_CONFIG[safetyLevel];
  
  return (
    <View style={[
      styles.badge, 
      { backgroundColor: `${config.color}20` },
      size === 'medium' && styles.badgeMedium,
    ]}>
      <Feather 
        name={config.icon as any} 
        size={size === 'small' ? 10 : 12} 
        color={config.color} 
      />
      {size === 'medium' && (
        <Text style={[styles.badgeText, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

// ============================================
// COMPOSANT ALERTE FEMME ENCEINTE
// ============================================

export const PregnancyWarning: React.FC = () => (
  <View style={styles.pregnancyWarning}>
    <Feather name="alert-triangle" size={16} color="#F44336" />
    <Text style={styles.pregnancyText}>
      Déconseillé aux femmes enceintes et allaitantes
    </Text>
  </View>
);

// ============================================
// COMPOSANT ALERTE ENFANTS
// ============================================

interface ChildrenWarningProps {
  minAge?: number;
}

export const ChildrenWarning: React.FC<ChildrenWarningProps> = ({ minAge = 6 }) => (
  <View style={styles.childrenWarning}>
    <Feather name="alert-circle" size={16} color="#FF9800" />
    <Text style={styles.childrenText}>
      Déconseillé aux enfants de moins de {minAge} ans
    </Text>
  </View>
);

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    overflow: 'hidden',
  },
  containerCompact: {
    padding: spacing.sm,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  safetyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  warningIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dangerTag: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dangerTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F44336',
  },
  listContainer: {
    gap: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  listBullet: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeMedium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  pregnancyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  pregnancyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#F44336',
  },
  childrenWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  childrenText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#FF9800',
  },
});

export default MedicalWarningCard;
