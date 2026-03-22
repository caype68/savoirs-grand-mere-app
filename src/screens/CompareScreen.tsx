import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { textures, grandMereRemedes } from '../assets';
import { remedes } from '../data/remedes';
import { Remede } from '../types';

// Helper pour obtenir une image de remède
const getRemedyImageSafe = () => {
  return grandMereRemedes;
};

type RootStackParamList = {
  Compare: { remedeIds: string[] };
  RemedeDetail: { remedeId: string };
};

type CompareScreenProps = NativeStackScreenProps<RootStackParamList, 'Compare'>;

interface ComparisonRowProps {
  label: string;
  values: (string | React.ReactNode)[];
  icon?: string;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, values, icon }) => (
  <View style={styles.comparisonRow}>
    <View style={styles.comparisonLabelContainer}>
      {icon && <Feather name={icon as any} size={14} color={colors.textMuted} />}
      <Text style={styles.comparisonLabel}>{label}</Text>
    </View>
    <View style={styles.comparisonValues}>
      {values.map((value, index) => (
        <View key={index} style={styles.comparisonValueCell}>
          {typeof value === 'string' ? (
            <Text style={styles.comparisonValue}>{value}</Text>
          ) : (
            value
          )}
        </View>
      ))}
    </View>
  </View>
);

const IngredientsList: React.FC<{ ingredients: Remede['ingredients'] }> = ({ ingredients }) => (
  <View style={styles.ingredientsList}>
    {ingredients.slice(0, 3).map((ing, idx) => (
      <Text key={idx} style={styles.ingredientItem}>• {ing.nom}</Text>
    ))}
    {ingredients.length > 3 && (
      <Text style={styles.ingredientMore}>+{ingredients.length - 3} autres</Text>
    )}
  </View>
);

const ContraindicationsList: React.FC<{ items: string[] }> = ({ items }) => (
  <View style={styles.contraindicationsList}>
    {items.length === 0 ? (
      <View style={styles.noContraindication}>
        <Feather name="check-circle" size={12} color={colors.success} />
        <Text style={styles.noContraindicationText}>Aucune</Text>
      </View>
    ) : (
      items.slice(0, 2).map((item, idx) => (
        <Text key={idx} style={styles.contraindicationItem}>⚠️ {item}</Text>
      ))
    )}
    {items.length > 2 && (
      <Text style={styles.contraindicationMore}>+{items.length - 2} autres</Text>
    )}
  </View>
);

export const CompareScreen: React.FC<CompareScreenProps> = ({ navigation, route }) => {
  const { remedeIds } = route.params;
  
  const remedesToCompare = remedeIds
    .map(id => remedes.find(r => r.id === id))
    .filter((r): r is Remede => r !== undefined)
    .slice(0, 3); // Maximum 3 remèdes à comparer

  const handleRemedyPress = (remedeId: string) => {
    navigation.navigate('RemedeDetail', { remedeId });
  };

  if (remedesToCompare.length < 2) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Feather name="columns" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Comparaison impossible</Text>
            <Text style={styles.emptySubtitle}>
              Sélectionnez au moins 2 remèdes pour les comparer.
            </Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={textures.grainDark}
        style={styles.backgroundTexture}
        resizeMode="repeat"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.headerBackButton}
            >
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Comparer les remèdes</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Remedy Headers */}
            <View style={styles.remedyHeaders}>
              {remedesToCompare.map((remede) => (
                <TouchableOpacity
                  key={remede.id}
                  style={styles.remedyHeader}
                  onPress={() => handleRemedyPress(remede.id)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={getRemedyImageSafe()}
                    style={styles.remedyImage}
                  />
                  <Text style={styles.remedyName} numberOfLines={2}>
                    {remede.nom}
                  </Text>
                  <View style={styles.routeBadge}>
                    <Text style={styles.routeBadgeText}>{remede.route}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comparison Table */}
            <View style={styles.comparisonTable}>
              {/* Indications */}
              <ComparisonRow
                label="Indications"
                icon="target"
                values={remedesToCompare.map(r => r.indications.slice(0, 2).join(', '))}
              />

              {/* Ingrédients */}
              <ComparisonRow
                label="Ingrédients"
                icon="list"
                values={remedesToCompare.map(r => (
                  <IngredientsList key={r.id} ingredients={r.ingredients} />
                ))}
              />

              {/* Nombre d'étapes */}
              <ComparisonRow
                label="Préparation"
                icon="clock"
                values={remedesToCompare.map(r => `${r.preparation.length} étapes`)}
              />

              {/* Posologie */}
              <ComparisonRow
                label="Posologie"
                icon="calendar"
                values={remedesToCompare.map(r => r.posologie.frequence)}
              />

              {/* Contre-indications */}
              <ComparisonRow
                label="Contre-indications"
                icon="alert-triangle"
                values={remedesToCompare.map(r => (
                  <ContraindicationsList key={r.id} items={r.contreIndications} />
                ))}
              />

              {/* Vérifié */}
              <ComparisonRow
                label="Source vérifiée"
                icon="check-circle"
                values={remedesToCompare.map(r => (
                  <View key={r.id} style={styles.verifiedBadge}>
                    <Feather 
                      name={r.verifie ? 'check-circle' : 'circle'} 
                      size={16} 
                      color={r.verifie ? colors.success : colors.textMuted} 
                    />
                    <Text style={[
                      styles.verifiedText,
                      { color: r.verifie ? colors.success : colors.textMuted }
                    ]}>
                      {r.verifie ? 'Oui' : 'Non'}
                    </Text>
                  </View>
                ))}
              />

              {/* Confiance */}
              <ComparisonRow
                label="Niveau de confiance"
                icon="shield"
                values={remedesToCompare.map(r => {
                  const confidence = Math.round(r.source.confianceGlobale * 100);
                  return (
                    <View key={r.id} style={styles.confidenceContainer}>
                      <View style={styles.confidenceBar}>
                        <View 
                          style={[
                            styles.confidenceFill, 
                            { width: `${confidence}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.confidenceText}>{confidence}%</Text>
                    </View>
                  );
                })}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {remedesToCompare.map((remede) => (
                <TouchableOpacity
                  key={remede.id}
                  style={styles.actionButton}
                  onPress={() => handleRemedyPress(remede.id)}
                >
                  <Text style={styles.actionButtonText}>Voir {remede.nom.split(' ')[0]}</Text>
                  <Feather name="arrow-right" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundTexture: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  remedyHeaders: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  remedyHeader: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  remedyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
  },
  remedyName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  routeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.accentPrimaryMuted,
    borderRadius: borderRadius.sm,
  },
  routeBadgeText: {
    fontSize: 10,
    color: colors.accentPrimary,
    textTransform: 'capitalize',
  },
  comparisonTable: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  comparisonRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  comparisonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonValues: {
    flexDirection: 'row',
  },
  comparisonValueCell: {
    flex: 1,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  comparisonValue: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  ingredientsList: {
    gap: 2,
  },
  ingredientItem: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ingredientMore: {
    fontSize: 11,
    color: colors.accentPrimary,
    marginTop: 2,
  },
  contraindicationsList: {
    gap: 2,
  },
  contraindicationItem: {
    fontSize: 11,
    color: colors.warning,
  },
  contraindicationMore: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  noContraindication: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noContraindicationText: {
    fontSize: 12,
    color: colors.success,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '500',
  },
  confidenceContainer: {
    gap: spacing.xs,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  backButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accentPrimary,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default CompareScreen;
