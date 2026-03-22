import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { DisclaimerBanner, ResultCard } from '../components';
import { plantes, remedes } from '../data/remedes';
import { useFavoris } from '../hooks/useFavoris';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  MainTabs: undefined;
  RemedeDetail: { remedeId: string };
  IngredientDetail: { ingredientId: string };
};

type IngredientDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'IngredientDetail'>;

const typeLabels = {
  plante: 'Plante',
  mineral: 'Minéral',
  animal: 'Animal',
  autre: 'Autre',
};

export const IngredientDetailScreen: React.FC<IngredientDetailScreenProps> = ({ navigation, route }) => {
  const { ingredientId } = route.params;
  const plante = plantes.find(p => p.id === ingredientId);
  const { isFavori, toggleFavori } = useFavoris();

  const associatedRemedes = remedes.filter(r => 
    r.ingredients.some(i => i.id === ingredientId)
  );

  if (!plante) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Feather name="help-circle" size={48} color={colors.textMuted} />
          <Text style={styles.notFoundText}>Ingrédient non trouvé dans la base</Text>
          <Text style={styles.notFoundSubtext}>
            Les informations détaillées sur cet ingrédient ne sont pas encore disponibles.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>{plante.nom}</Text>
          {plante.alias && plante.alias.length > 0 && (
            <Text style={styles.aliases}>
              Alias : {plante.alias.join(', ')}
            </Text>
          )}
          <View style={styles.typeContainer}>
            <Feather 
              name={plante.type === 'plante' ? 'feather' : plante.type === 'mineral' ? 'hexagon' : 'droplet'} 
              size={16} 
              color={colors.accentPrimary} 
            />
            <Text style={styles.typeText}>Type : {typeLabels[plante.type]}</Text>
          </View>
        </View>

        {(plante.contreIndications && plante.contreIndications.length > 0) || 
         (plante.interactions && plante.interactions.length > 0) ? (
          <View style={styles.warningSection}>
            <DisclaimerBanner 
              type="warning"
              message="Cet ingrédient présente des précautions d'emploi importantes."
            />
            
            {plante.contreIndications && plante.contreIndications.length > 0 && (
              <View style={styles.warningBlock}>
                <Text style={styles.warningTitle}>Contre-indications</Text>
                {plante.contreIndications.map((ci, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Feather name="alert-circle" size={14} color={colors.warning} />
                    <Text style={styles.warningText}>{ci}</Text>
                  </View>
                ))}
              </View>
            )}

            {plante.interactions && plante.interactions.length > 0 && (
              <View style={styles.warningBlock}>
                <Text style={styles.warningTitle}>Interactions possibles</Text>
                {plante.interactions.map((interaction, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Feather name="alert-triangle" size={14} color={colors.accentSecondary} />
                    <Text style={styles.warningText}>{interaction}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.remedesSection}>
          <Text style={styles.sectionTitle}>
            Remèdes associés ({associatedRemedes.length})
          </Text>
          <View style={styles.remedesList}>
            {associatedRemedes.map((remede) => (
              <ResultCard
                key={remede.id}
                remede={remede}
                onPress={() => navigation.navigate('RemedeDetail', { remedeId: remede.id })}
                isFavori={isFavori(remede.id)}
                onToggleFavori={() => toggleFavori(remede.id)}
              />
            ))}
          </View>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  titleSection: {
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  aliases: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  typeText: {
    ...typography.body,
    color: colors.accentPrimary,
  },
  warningSection: {
    gap: spacing.md,
  },
  warningBlock: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  warningTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  warningText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  remedesSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  remedesList: {
    gap: spacing.md,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  notFoundText: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notFoundSubtext: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
