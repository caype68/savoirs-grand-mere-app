// ============================================
// ÉCRAN LISTE DES HUILES ESSENTIELLES
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../theme/colors';
import { EssentialOilCard } from '../components/EssentialOilCard';
import { MedicalWarningCard } from '../components/MedicalWarningCard';
import { 
  ESSENTIAL_OILS, 
  ESSENTIAL_OIL_CATEGORIES,
  searchEssentialOils,
  getEssentialOilsForProfile,
  getSafeEssentialOils,
} from '../data/essentialOils';
import { EssentialOil, EssentialOilCategory } from '../types';

// ============================================
// TYPES
// ============================================

type EssentialOilsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const EssentialOilsScreen: React.FC<EssentialOilsScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSafeOnly, setShowSafeOnly] = useState(false);

  // Filtrage des huiles
  const filteredOils = useMemo(() => {
    let oils = ESSENTIAL_OILS;

    // Filtre par recherche
    if (searchQuery.trim()) {
      oils = searchEssentialOils(searchQuery);
    }

    // Filtre par catégorie
    if (selectedCategory) {
      oils = oils.filter(oil => 
        oil.tags.includes(selectedCategory) ||
        oil.commonUses.some(use => use.toLowerCase().includes(selectedCategory))
      );
    }

    // Filtre huiles sûres uniquement
    if (showSafeOnly) {
      oils = oils.filter(oil => oil.safetyLevel === 'safe');
    }

    return oils;
  }, [searchQuery, selectedCategory, showSafeOnly]);

  const handleOilPress = (oil: EssentialOil) => {
    navigation.navigate('EssentialOilDetail', { oilId: oil.id });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Huiles Essentielles</Text>
          <Text style={styles.headerSubtitle}>
            {ESSENTIAL_OILS.length} huiles • Aromathérapie
          </Text>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une huile, un usage..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Filtre huiles sûres */}
          <Pressable
            style={[styles.filterChip, showSafeOnly && styles.filterChipActive]}
            onPress={() => setShowSafeOnly(!showSafeOnly)}
          >
            <Feather 
              name="shield" 
              size={14} 
              color={showSafeOnly ? '#fff' : colors.textSecondary} 
            />
            <Text style={[styles.filterChipText, showSafeOnly && styles.filterChipTextActive]}>
              Sûres
            </Text>
          </Pressable>

          {/* Catégories */}
          {ESSENTIAL_OIL_CATEGORIES.slice(0, 6).map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.filterChip,
                selectedCategory === cat.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(
                selectedCategory === cat.id ? null : cat.id
              )}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === cat.id && styles.filterChipTextActive,
              ]}>
                {cat.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Avertissement compact */}
      <View style={styles.warningContainer}>
        <View style={styles.warningBanner}>
          <Feather name="alert-triangle" size={14} color="#FF9800" />
          <Text style={styles.warningText}>
            Les huiles essentielles sont puissantes. Respectez les précautions d'usage.
          </Text>
        </View>
      </View>

      {/* Liste des huiles */}
      <FlatList
        data={filteredOils}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EssentialOilCard
            oil={item}
            onPress={() => handleOilPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucune huile trouvée</Text>
            <Text style={styles.emptyText}>
              Essayez avec d'autres termes de recherche
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  warningContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#FF9800',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default EssentialOilsScreen;
