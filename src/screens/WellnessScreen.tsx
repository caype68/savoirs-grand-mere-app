import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import {
  WellnessLog,
  MoodLevel,
  StressLevel,
  SleepQuality,
  EnergyLevel,
} from '../types';

// Hooks backend hybrides
import { useWellnessLog, useWellnessHistory } from '../hooks/useWellness';
import { useAuth } from '../hooks/useAuth';
import { formatDateKey, generateId } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// COMPOSANTS DE SAISIE
// ============================================

interface LevelSelectorProps {
  label: string;
  emoji: string;
  value: number;
  onChange: (value: number) => void;
  labels?: string[];
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  label,
  emoji,
  value,
  onChange,
  labels = ['Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent'],
}) => {
  return (
    <View style={styles.levelContainer}>
      <View style={styles.levelHeader}>
        <Text style={styles.levelEmoji}>{emoji}</Text>
        <Text style={styles.levelLabel}>{label}</Text>
      </View>
      <View style={styles.levelButtons}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelButton,
              value === level && styles.levelButtonActive,
            ]}
            onPress={() => onChange(level)}
          >
            <Text
              style={[
                styles.levelButtonText,
                value === level && styles.levelButtonTextActive,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.levelDescription}>
        {value > 0 ? labels[value - 1] : 'Sélectionnez un niveau'}
      </Text>
    </View>
  );
};

interface SymptomChipProps {
  symptom: string;
  selected: boolean;
  onToggle: () => void;
}

const SymptomChip: React.FC<SymptomChipProps> = ({ symptom, selected, onToggle }) => (
  <TouchableOpacity
    style={[styles.symptomChip, selected && styles.symptomChipSelected]}
    onPress={onToggle}
  >
    <Text style={[styles.symptomChipText, selected && styles.symptomChipTextSelected]}>
      {symptom}
    </Text>
  </TouchableOpacity>
);

// ============================================
// ÉCRAN PRINCIPAL
// ============================================

const COMMON_SYMPTOMS = [
  'Fatigue',
  'Maux de tête',
  'Mal de gorge',
  'Toux',
  'Nez bouché',
  'Douleurs musculaires',
  'Ballonnements',
  'Nausées',
  'Insomnie',
  'Anxiété',
  'Irritabilité',
  'Douleurs articulaires',
];

export const WellnessScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();

  // Auth pour récupérer le userId réel
  const { authState } = useAuth();

  // Hooks backend hybrides
  const { todayLog: existingLog, saveLog, isSaving, source, refresh: refreshLog } = useWellnessLog();
  const { history, refresh: refreshHistory } = useWellnessHistory(7);

  // État local pour la saisie
  const [formData, setFormData] = useState<Partial<WellnessLog>>({
    sommeil: { qualite: 0 as SleepQuality },
    stress: 0 as StressLevel,
    humeur: 0 as MoodLevel,
    energie: 0 as EnergyLevel,
    symptomes: [],
    noteLibre: '',
  });
  const [showHistory, setShowHistory] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Charger les données existantes dans le formulaire
  useEffect(() => {
    if (existingLog) {
      setFormData(existingLog);
    }
  }, [existingLog]);

  const handleSave = async () => {
    const now = new Date();
    const dateKey = formatDateKey(now);

    const log: WellnessLog = {
      id: existingLog?.id || generateId(),
      userId: existingLog?.userId || authState.userId || 'guest',
      date: now.toISOString(),
      dateKey,
      sommeil: formData.sommeil as WellnessLog['sommeil'],
      stress: formData.stress as StressLevel,
      humeur: formData.humeur as MoodLevel,
      energie: formData.energie as EnergyLevel,
      symptomes: formData.symptomes || [],
      noteLibre: formData.noteLibre,
      remedesUtilises: existingLog?.remedesUtilises || [],
      isValidated: true,
      createdAt: existingLog?.createdAt || now.toISOString(),
    };

    const result = await saveLog(log);

    if (result.success) {
      refreshHistory();
      const msg = result.recommendation
        ? `✅ Enregistré ! Remède du jour : ${result.recommendation.remedyName}`
        : '✅ Journal bien-être enregistré !';
      setSaveStatus({ type: 'success', message: msg });
      // Retour à l'accueil après 1,5 secondes
      setTimeout(() => {
        navigation.navigate('Accueil');
      }, 1500);
    } else {
      setSaveStatus({ type: 'error', message: "❌ Erreur lors de l'enregistrement. Réessayez." });
    }
  };

  const toggleSymptom = (symptom: string) => {
    const current = formData.symptomes || [];
    const newSymptoms = current.includes(symptom)
      ? current.filter((s: string) => s !== symptom)
      : [...current, symptom];
    setFormData(prev => ({ ...prev, symptomes: newSymptoms }));
  };

  const updateSleepQuality = (value: number) => {
    setFormData(prev => ({
      ...prev,
      sommeil: { ...prev.sommeil, qualite: value as SleepQuality },
    }));
  };

  const getDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  };

  const getMoodEmoji = (level: number): string => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[level - 1] || '❓';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal Bien-être</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Feather
              name={showHistory ? 'edit-3' : 'calendar'}
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {showHistory ? (
          // Vue historique
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Historique des 7 derniers jours</Text>
            
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="calendar" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>Aucun enregistrement</Text>
                <Text style={styles.emptySubtext}>
                  Commencez à suivre votre bien-être quotidien
                </Text>
              </View>
            ) : (
              history.map((log) => (
                <View key={log.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{getDateLabel(log.date)}</Text>
                    <Text style={styles.historyMood}>{getMoodEmoji(log.humeur)}</Text>
                  </View>
                  <View style={styles.historyStats}>
                    <View style={styles.historyStat}>
                      <Text style={styles.historyStatLabel}>Sommeil</Text>
                      <Text style={styles.historyStatValue}>{log.sommeil.qualite}/5</Text>
                    </View>
                    <View style={styles.historyStat}>
                      <Text style={styles.historyStatLabel}>Stress</Text>
                      <Text style={styles.historyStatValue}>{log.stress}/5</Text>
                    </View>
                    <View style={styles.historyStat}>
                      <Text style={styles.historyStatLabel}>Énergie</Text>
                      <Text style={styles.historyStatValue}>{log.energie}/5</Text>
                    </View>
                  </View>
                  {log.symptomes.length > 0 && (
                    <View style={styles.historySymptoms}>
                      {log.symptomes.map((s, i) => (
                        <View key={i} style={styles.historySymptomTag}>
                          <Text style={styles.historySymptomText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
            
            <View style={styles.bottomSpacer} />
          </ScrollView>
        ) : (
          // Vue saisie quotidienne
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Carte du jour */}
            <LinearGradient
              colors={[colors.accentPrimaryMuted, colors.surface]}
              style={styles.todayCard}
            >
              <Text style={styles.todayTitle}>Comment allez-vous aujourd'hui ?</Text>
              <Text style={styles.todaySubtitle}>
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            </LinearGradient>

            {/* Niveaux */}
            <View style={styles.section}>
              <LevelSelector
                label="Qualité du sommeil"
                emoji="😴"
                value={formData.sommeil?.qualite || 0}
                onChange={updateSleepQuality}
                labels={['Très mauvais', 'Mauvais', 'Correct', 'Bon', 'Excellent']}
              />

              <LevelSelector
                label="Niveau de stress"
                emoji="😰"
                value={formData.stress || 0}
                onChange={(v) => setFormData(prev => ({ ...prev, stress: v as StressLevel }))}
                labels={['Très stressé', 'Stressé', 'Modéré', 'Calme', 'Très calme']}
              />

              <LevelSelector
                label="Humeur générale"
                emoji="🙂"
                value={formData.humeur || 0}
                onChange={(v) => setFormData(prev => ({ ...prev, humeur: v as MoodLevel }))}
                labels={['Très basse', 'Basse', 'Neutre', 'Bonne', 'Excellente']}
              />

              <LevelSelector
                label="Niveau d'énergie"
                emoji="⚡"
                value={formData.energie || 0}
                onChange={(v) => setFormData(prev => ({ ...prev, energie: v as EnergyLevel }))}
                labels={['Épuisé', 'Fatigué', 'Normal', 'Énergique', 'Très énergique']}
              />
            </View>

            {/* Symptômes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptômes ressentis</Text>
              <View style={styles.symptomsGrid}>
                {COMMON_SYMPTOMS.map((symptom) => (
                  <SymptomChip
                    key={symptom}
                    symptom={symptom}
                    selected={formData.symptomes?.includes(symptom) || false}
                    onToggle={() => toggleSymptom(symptom)}
                  />
                ))}
              </View>
            </View>

            {/* Note libre */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes personnelles</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Comment vous sentez-vous ? Des observations particulières ?"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={formData.noteLibre}
                onChangeText={(text) => setFormData(prev => ({ ...prev, noteLibre: text }))}
              />
            </View>

            {/* Bannière de statut */}
            {saveStatus && (
              <View style={[styles.statusBanner, saveStatus.type === 'error' && styles.statusBannerError]}>
                <Text style={styles.statusBannerText}>{saveStatus.message}</Text>
              </View>
            )}

            {/* Bouton sauvegarder */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <LinearGradient
                colors={[colors.accentPrimary, '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Feather name="check" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  todayCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  todayTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  todaySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  levelContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelButton: {
    width: (SCREEN_WIDTH - spacing.lg * 4 - spacing.md * 4) / 5,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: colors.accentPrimary,
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  levelDescription: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  symptomChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  symptomChipSelected: {
    backgroundColor: colors.accentPrimaryMuted,
    borderColor: colors.accentPrimary,
  },
  symptomChipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  symptomChipTextSelected: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBanner: {
    backgroundColor: colors.accentPrimaryMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  statusBannerError: {
    backgroundColor: '#3D1515',
    borderColor: '#C0392B',
  },
  statusBannerText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bottomSpacer: {
    height: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyMood: {
    fontSize: 24,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  historyStat: {
    alignItems: 'center',
  },
  historyStatLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historySymptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  historySymptomTag: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  historySymptomText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

export default WellnessScreen;
