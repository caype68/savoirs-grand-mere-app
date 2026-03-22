import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { livres } from '../data/remedes';
import { useFavoris } from '../hooks/useFavoris';
import { BackendStatus } from '../components/BackendStatus';

export const SettingsScreen: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const { clearFavoris } = useFavoris();

  const settingsSections = [
    {
      title: 'Apparence',
      items: [
        {
          id: 'darkMode',
          icon: 'moon',
          label: 'Mode sombre',
          type: 'switch',
          value: darkMode,
          onToggle: () => setDarkMode(!darkMode),
        },
      ],
    },
    {
      title: 'Langue',
      items: [
        {
          id: 'language',
          icon: 'globe',
          label: 'Langue',
          type: 'select',
          value: language === 'fr' ? 'Français' : 'English',
          onPress: () => {
            setLanguage(language === 'fr' ? 'en' : 'fr');
          },
        },
      ],
    },
    {
      title: 'Informations',
      items: [
        {
          id: 'medical',
          icon: 'alert-circle',
          label: 'Informations médicales',
          type: 'link',
          onPress: () => setShowMedicalModal(true),
        },
        {
          id: 'sources',
          icon: 'book',
          label: 'Sources des livres',
          type: 'link',
          onPress: () => setShowSourcesModal(true),
        },
      ],
    },
    {
      title: 'Données',
      items: [
        {
          id: 'clearFavoris',
          icon: 'trash-2',
          label: 'Effacer les favoris',
          type: 'danger',
          onPress: clearFavoris,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réglages</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Backend Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend</Text>
          <BackendStatus />
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={'onPress' in item ? item.onPress : undefined}
                  activeOpacity={item.type === 'switch' ? 1 : 0.7}
                >
                  <View style={[
                    styles.settingIcon,
                    item.type === 'danger' && styles.settingIconDanger,
                  ]}>
                    <Feather 
                      name={item.icon as any} 
                      size={18} 
                      color={item.type === 'danger' ? colors.error : colors.accentPrimary} 
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[
                      styles.settingLabel,
                      item.type === 'danger' && styles.settingLabelDanger,
                    ]}>
                      {item.label}
                    </Text>
                    {'value' in item && item.type !== 'switch' && (
                      <Text style={styles.settingValue}>{String(item.value)}</Text>
                    )}
                  </View>
                  {item.type === 'switch' && 'value' in item && 'onToggle' in item ? (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={item.onToggle}
                      trackColor={{ 
                        false: colors.border, 
                        true: colors.accentPrimaryMuted 
                      }}
                      thumbColor={item.value ? colors.accentPrimary : colors.textMuted}
                    />
                  ) : item.type !== 'danger' && (
                    <Feather name="chevron-right" size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Feather name="book-open" size={24} color={colors.accentPrimary} />
          </View>
          <Text style={styles.appName}>Savoirs de Grand-Mère</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Sources Modal */}
      <Modal
        visible={showSourcesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSourcesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sources des livres</Text>
            <TouchableOpacity 
              onPress={() => setShowSourcesModal(false)}
              style={styles.modalClose}
            >
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Les remèdes présentés dans cette application sont issus de livres anciens numérisés. 
              Voici les sources utilisées :
            </Text>
            {livres.map((livre) => (
              <View key={livre.id} style={styles.sourceItem}>
                <View style={styles.sourceIcon}>
                  <Feather name="book" size={20} color={colors.accentSecondary} />
                </View>
                <View style={styles.sourceInfo}>
                  <Text style={styles.sourceTitle}>{livre.nom}</Text>
                  <Text style={styles.sourceMeta}>
                    {livre.auteur && `${livre.auteur} • `}{livre.annee}
                  </Text>
                  <Text style={styles.sourceStatus}>
                    {livre.statutDroits === 'domaine_public' 
                      ? '📖 Domaine public' 
                      : '📚 Droits réservés'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Medical Info Modal */}
      <Modal
        visible={showMedicalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMedicalModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Informations médicales</Text>
            <TouchableOpacity 
              onPress={() => setShowMedicalModal(false)}
              style={styles.modalClose}
            >
              <Feather name="x" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.warningCard}>
              <Feather name="alert-triangle" size={24} color={colors.warning} />
              <Text style={styles.warningTitle}>Avertissement important</Text>
            </View>
            
            <Text style={styles.modalParagraph}>
              Les informations présentées dans cette application sont issues de savoirs traditionnels 
              et de livres anciens numérisés. Elles sont fournies à titre informatif et documentaire uniquement.
            </Text>
            
            <Text style={styles.modalParagraph}>
              <Text style={styles.bold}>Ces informations ne remplacent en aucun cas :</Text>
            </Text>
            
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Une consultation médicale</Text>
              <Text style={styles.bulletItem}>• Un diagnostic professionnel</Text>
              <Text style={styles.bulletItem}>• Un traitement prescrit par un médecin</Text>
              <Text style={styles.bulletItem}>• Les conseils d'un pharmacien</Text>
            </View>
            
            <Text style={styles.modalParagraph}>
              En cas de symptômes persistants ou graves, consultez immédiatement un professionnel de santé.
            </Text>
            
            <Text style={styles.modalParagraph}>
              Certaines plantes peuvent avoir des interactions avec des médicaments ou être contre-indiquées 
              dans certaines conditions. Demandez toujours l'avis d'un professionnel avant d'utiliser un remède naturel.
            </Text>
          </ScrollView>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconDanger: {
    backgroundColor: colors.error + '20',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  settingLabelDanger: {
    color: colors.error,
  },
  settingValue: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  appVersion: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  modalClose: {
    padding: spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  sourceItem: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sourceIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentSecondaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sourceMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sourceStatus: {
    ...typography.caption,
    color: colors.accentSecondary,
    marginTop: spacing.xs,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  warningTitle: {
    ...typography.h3,
    color: colors.warning,
  },
  modalParagraph: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bold: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bulletList: {
    marginBottom: spacing.md,
    paddingLeft: spacing.md,
  },
  bulletItem: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 28,
  },
});
