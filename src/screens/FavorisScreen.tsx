import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { remedes } from '../data/remedes';
import { useFavoris } from '../hooks/useFavoris';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type FavorisScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// Images plantes
const plantImages: Record<string, string> = {
  'camomille': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200',
  'gingembre': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200',
  'miel': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200',
  'thym': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200',
  'menthe': 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=200',
  'default': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200',
};

export const FavorisScreen: React.FC<FavorisScreenProps> = ({ navigation }) => {
  const { favoris, toggleFavori, isFavori } = useFavoris();

  const favorisRemedes = remedes.filter(r => isFavori(r.id));

  const handleRemedePress = (remedeId: string) => {
    navigation.navigate('RemedeDetail', { remedeId });
  };

  const handleShareAll = async () => {
    if (favorisRemedes.length === 0) return;
    
    const message = favorisRemedes
      .map(r => `• ${r.nom} - ${r.indications[0] || 'Remède naturel'}`)
      .join('\n');
    
    try {
      await Share.share({
        message: `Mes remèdes favoris - Savoirs de Grand-Mère\n\n${message}`,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const getPlantImage = (name: string) => {
    const key = name.toLowerCase().split(' ')[0];
    return plantImages[key] || plantImages.default;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Favoris</Text>
          <Text style={styles.headerSubtitle}>
            {favorisRemedes.length} remède{favorisRemedes.length > 1 ? 's' : ''} sauvegardé{favorisRemedes.length > 1 ? 's' : ''}
          </Text>
        </View>
        {favorisRemedes.length > 0 && (
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareAll}
          >
            <Feather name="share-2" size={18} color={colors.accentPrimary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favorisRemedes.length > 0 ? (
          <View style={styles.favorisList}>
            {favorisRemedes.map((remede) => (
              <TouchableOpacity
                key={remede.id}
                style={styles.favoriCard}
                onPress={() => handleRemedePress(remede.id)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: getPlantImage(remede.nom) }}
                  style={styles.favoriImage}
                />
                <View style={styles.favoriContent}>
                  <View style={styles.favoriHeader}>
                    <Text style={styles.favoriName} numberOfLines={1}>
                      {remede.nom}
                    </Text>
                    {remede.verifie && (
                      <Feather name="check-circle" size={14} color={colors.accentPrimary} />
                    )}
                  </View>
                  <Text style={styles.favoriIndication} numberOfLines={1}>
                    {remede.indications[0] || 'Remède naturel'}
                  </Text>
                  <View style={styles.favoriFooter}>
                    <Text style={styles.favoriSource} numberOfLines={1}>
                      {remede.source.livre}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => toggleFavori(remede.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather name="heart" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="heart" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptyText}>
              Ajoutez des remèdes à vos favoris pour les retrouver facilement ici.
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Chercheur')}
            >
              <Text style={styles.exploreButtonText}>Explorer les remèdes</Text>
              <Feather name="arrow-right" size={16} color={colors.accentPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    fontSize: 28,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  favorisList: {
    gap: spacing.md,
  },
  favoriCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  favoriImage: {
    width: 90,
    height: 90,
    backgroundColor: colors.surface,
  },
  favoriContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  favoriHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  favoriName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  favoriIndication: {
    ...typography.bodySmall,
    color: colors.accentSecondary,
  },
  favoriFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriSource: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentPrimaryMuted,
    borderRadius: borderRadius.full,
  },
  exploreButtonText: {
    ...typography.bodyMedium,
    color: colors.accentPrimary,
    fontWeight: '600',
  },
});
