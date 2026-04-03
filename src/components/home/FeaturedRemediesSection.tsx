// ============================================
// SECTION REMÈDES POPULAIRES
// Même DA que le conseil de grand-mère (carte dark unifiée)
// ============================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { getRemedyImage, logo } from '../../assets';

interface FeaturedRemedy {
  id: string;
  title: string;
  subtitle: string;
  route: 'orale' | 'cutanee' | 'inhalation';
  emoji: string;
  color: string;
}

const featuredRemedies: FeaturedRemedy[] = [
  { id: 'infusion-thym', title: 'Infusion de thym', subtitle: 'Gorge irritée', route: 'orale', emoji: '🍵', color: '#38BDF8' },
  { id: 'argile-cataplasme', title: 'Cataplasme d\'argile', subtitle: 'Douleurs articulaires', route: 'cutanee', emoji: '🧴', color: '#F97316' },
  { id: 'lavande-inhalation', title: 'Inhalation lavande', subtitle: 'Respiration & détente', route: 'inhalation', emoji: '💨', color: '#A78BFA' },
];

interface FeaturedRemediesSectionProps {
  onSelectRemedy: (remedyId: string) => void;
}

export const FeaturedRemediesSection: React.FC<FeaturedRemediesSectionProps> = ({
  onSelectRemedy,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header avec avatar */}
        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <Image source={logo} style={styles.avatarImg} resizeMode="contain" />
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeEmoji}>⭐</Text>
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>LES INDISPENSABLES</Text>
            <Text style={styles.headerTitle}>Remèdes populaires</Text>
          </View>
        </View>

        {/* Liste des remèdes */}
        <View style={styles.remediesList}>
          {featuredRemedies.map((remedy, index) => {
            const image = getRemedyImage(remedy.title, remedy.route);
            const isLast = index === featuredRemedies.length - 1;
            return (
              <TouchableOpacity
                key={remedy.id}
                style={[styles.remedyItem, !isLast ? styles.remedyItemBorder : null]}
                onPress={() => onSelectRemedy(remedy.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.remedyDot, { backgroundColor: remedy.color }]} />
                <View style={styles.remedyImgWrap}>
                  <Image source={image} style={styles.remedyImg} />
                </View>
                <View style={styles.remedyContent}>
                  <Text style={styles.remedyTitle} numberOfLines={1}>{remedy.title}</Text>
                  <View style={styles.remedyMeta}>
                    <Text style={styles.remedySubtitle}>{remedy.subtitle}</Text>
                    <View style={[styles.routeTag, { borderColor: remedy.color + '40' }]}>
                      <Text style={[styles.routeTagText, { color: remedy.color }]}>{remedy.route}</Text>
                    </View>
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarBadgeEmoji: {
    fontSize: 8,
  },
  headerText: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },

  // Remedies list
  remediesList: {
    gap: 0,
  },
  remedyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  remedyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  remedyDot: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  remedyImgWrap: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHighlight,
  },
  remedyImg: {
    width: 42,
    height: 42,
  },
  remedyContent: {
    flex: 1,
  },
  remedyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  remedyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  remedySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  routeTag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  routeTagText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default FeaturedRemediesSection;
