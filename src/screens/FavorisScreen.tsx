import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { remedes } from '../data/remedes';
import { useFavoris } from '../hooks/useFavoris';
import { useFavoriteCategories, FavoriteCategory } from '../hooks/useFavoriteCategories';
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

const CATEGORY_COLORS = ['#818CF8', '#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C', '#38BDF8'];
const CATEGORY_ICONS = ['folder', 'sun', 'cloud-snow', 'coffee', 'moon', 'heart', 'star', 'zap', 'droplet', 'feather'];

export const FavorisScreen: React.FC<FavorisScreenProps> = ({ navigation }) => {
  const { favoris, toggleFavori, isFavori } = useFavoris();
  const {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    addCategory,
    removeCategory,
    addRemedyToCategory,
    removeRemedyFromCategory,
    getRemedyCategories,
    filterByCategory,
  } = useFavoriteCategories();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder');
  const [newCategoryColor, setNewCategoryColor] = useState('#818CF8');
  const [showCategoryPicker, setShowCategoryPicker] = useState<string | null>(null); // remedeId

  const allFavorisRemedes = remedes.filter(r => isFavori(r.id));
  const filteredIds = filterByCategory(allFavorisRemedes.map(r => r.id));
  const favorisRemedes = allFavorisRemedes.filter(r => filteredIds.includes(r.id));

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

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim(), newCategoryIcon, newCategoryColor);
      setNewCategoryName('');
      setNewCategoryIcon('folder');
      setNewCategoryColor('#818CF8');
      setShowAddCategory(false);
    }
  };

  const handleAssignCategory = async (remedeId: string, categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.remedeIds.includes(remedeId)) {
      await removeRemedyFromCategory(remedeId, categoryId);
    } else {
      await addRemedyToCategory(remedeId, categoryId);
    }
  };

  const getPlantImage = (name: string) => {
    const key = name.toLowerCase().split(' ')[0];
    return plantImages[key] || plantImages.default;
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

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

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            const count = cat.id === 'all'
              ? allFavorisRemedes.length
              : allFavorisRemedes.filter(r => cat.remedeIds.includes(r.id)).length;

            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && { backgroundColor: cat.color + '30', borderColor: cat.color },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                onLongPress={() => {
                  if (cat.id !== 'all') {
                    removeCategory(cat.id);
                  }
                }}
              >
                <Feather
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? cat.color : colors.textMuted}
                />
                <Text style={[
                  styles.categoryPillText,
                  isSelected && { color: cat.color },
                ]}>
                  {cat.name}
                </Text>
                <View style={[
                  styles.categoryCount,
                  isSelected && { backgroundColor: cat.color + '40' },
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    isSelected && { color: cat.color },
                  ]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add Category Button */}
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowAddCategory(true)}
          >
            <Feather name="plus" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favorisRemedes.length > 0 ? (
          <View style={styles.favorisList}>
            {favorisRemedes.map((remede) => {
              const remedyCategories = getRemedyCategories(remede.id);
              return (
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

                    {/* Category Tags */}
                    {remedyCategories.length > 0 && (
                      <View style={styles.categoryTags}>
                        {remedyCategories.slice(0, 3).map((cat) => (
                          <View
                            key={cat.id}
                            style={[styles.categoryTag, { backgroundColor: cat.color + '20' }]}
                          >
                            <Text style={[styles.categoryTagText, { color: cat.color }]}>
                              {cat.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.favoriFooter}>
                      <Text style={styles.favoriSource} numberOfLines={1}>
                        {remede.source.livre}
                      </Text>
                      <View style={styles.favoriActions}>
                        <TouchableOpacity
                          onPress={() => setShowCategoryPicker(remede.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={styles.categoryButton}
                        >
                          <Feather name="tag" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => toggleFavori(remede.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Feather name="heart" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="heart" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedCategoryId === 'all' ? 'Aucun favori' : `Aucun favori dans "${selectedCategory?.name}"`}
            </Text>
            <Text style={styles.emptyText}>
              {selectedCategoryId === 'all'
                ? 'Ajoutez des remèdes à vos favoris pour les retrouver facilement ici.'
                : 'Appuyez sur l\'icône étiquette pour classer vos favoris.'}
            </Text>
            {selectedCategoryId === 'all' && (
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Accueil')}
              >
                <Text style={styles.exploreButtonText}>Explorer les remèdes</Text>
                <Feather name="arrow-right" size={16} color={colors.accentPrimary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategory}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle catégorie</Text>
              <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                <Feather name="x" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nom de la catégorie..."
              placeholderTextColor={colors.textMuted}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />

            {/* Icon picker */}
            <Text style={styles.modalLabel}>Icône</Text>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newCategoryIcon === icon && { backgroundColor: newCategoryColor + '30', borderColor: newCategoryColor },
                  ]}
                  onPress={() => setNewCategoryIcon(icon)}
                >
                  <Feather name={icon as any} size={20} color={newCategoryIcon === icon ? newCategoryColor : colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Color picker */}
            <Text style={styles.modalLabel}>Couleur</Text>
            <View style={styles.colorGrid}>
              {CATEGORY_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newCategoryColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setNewCategoryColor(color)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.modalButton,
                !newCategoryName.trim() && styles.modalButtonDisabled,
              ]}
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              <Text style={styles.modalButtonText}>Créer la catégorie</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal (assign remedy to category) */}
      <Modal
        visible={!!showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(null)}
        >
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Classer dans...</Text>
            {categories.filter(c => c.id !== 'all').map((cat) => {
              const isAssigned = showCategoryPicker ? cat.remedeIds.includes(showCategoryPicker) : false;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    if (showCategoryPicker) {
                      handleAssignCategory(showCategoryPicker, cat.id);
                    }
                  }}
                >
                  <View style={[styles.pickerIcon, { backgroundColor: cat.color + '20' }]}>
                    <Feather name={cat.icon as any} size={16} color={cat.color} />
                  </View>
                  <Text style={styles.pickerItemText}>{cat.name}</Text>
                  <Feather
                    name={isAssigned ? 'check-circle' : 'circle'}
                    size={20}
                    color={isAssigned ? cat.color : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
  // Category Pills
  categoryContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  categoryPillText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryCount: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  addCategoryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // List
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
    height: 'auto',
    minHeight: 90,
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
    marginTop: 2,
  },
  categoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  favoriFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  favoriSource: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  favoriActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryButton: {
    padding: 2,
  },
  // Empty state
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
    textAlign: 'center',
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
  // Modal - Add Category
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  modalLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  modalButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Picker Modal
  pickerContent: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: 40,
    marginTop: 'auto',
  },
  pickerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  pickerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
});
