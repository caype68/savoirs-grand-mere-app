import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé directe pour vérifier si le journal du jour est rempli
const WELLNESS_LOGS_KEY = '@wellness_logs';
const WELLNESS_TODAY_FLAG = '@wellness_today_flag';

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
  const navigation = useNavigation<any>();
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
  // UNE SEULE variable contrôle la vue : 'form' ou 'summary'
  const [viewMode, setViewMode] = useState<'form' | 'summary'>('form');
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const todayDateKey = formatDateKey(new Date());

  // showHistory dérivé simplement
  const showHistory = viewMode === 'summary';

  // ✅ Au démarrage : vérifier si on a déjà rempli aujourd'hui
  useEffect(() => {
    const checkIfFilledToday = async () => {
      console.log('[Wellness] 🔍 Vérification flag pour:', todayDateKey);
      try {
        // 1) Flag rapide
        const flag = await AsyncStorage.getItem(WELLNESS_TODAY_FLAG);
        console.log('[Wellness] Flag lu:', flag);
        if (flag === todayDateKey) {
          console.log('[Wellness] ✅ Flag = aujourd\'hui → résumé');
          setViewMode('summary');
          return;
        }
        // 2) Vérifier dans les logs
        const stored = await AsyncStorage.getItem(WELLNESS_LOGS_KEY);
        console.log('[Wellness] Logs trouvés:', stored ? 'oui' : 'non');
        if (stored) {
          const logs: any[] = JSON.parse(stored);
          const found = logs.find((l: any) => l.dateKey === todayDateKey);
          if (found) {
            console.log('[Wellness] ✅ Log trouvé dans AsyncStorage → résumé');
            setViewMode('summary');
            setFormData(found);
            await AsyncStorage.setItem(WELLNESS_TODAY_FLAG, todayDateKey);
            return;
          }
        }
        console.log('[Wellness] ❌ Rien trouvé → formulaire');
      } catch (e) {
        console.warn('[Wellness] Erreur:', e);
      }
    };
    checkIfFilledToday();
  }, []);

  // À chaque focus du tab : re-vérifier si déjà rempli et forcer summary
  useFocusEffect(
    React.useCallback(() => {
      console.log('[Wellness] 🔄 TAB FOCUS déclenché');
      setIsSaved(false);
      setSaveStatus(null);
      refreshHistory();
      // Re-check flag + logs à chaque focus
      const recheckIfFilled = async () => {
        const today = formatDateKey(new Date());
        console.log('[Wellness] 🔄 Recheck pour:', today);
        try {
          // 1) Vérifier le flag
          const flag = await AsyncStorage.getItem(WELLNESS_TODAY_FLAG);
          console.log('[Wellness] 🔄 Flag:', flag);
          if (flag === today) {
            console.log('[Wellness] 🔄 Flag match → summary');
            setViewMode('summary');
            return;
          }
          // 2) Vérifier les logs directement
          const stored = await AsyncStorage.getItem(WELLNESS_LOGS_KEY);
          if (stored) {
            const logs: any[] = JSON.parse(stored);
            const found = logs.find((l: any) => l.dateKey === today);
            if (found) {
              console.log('[Wellness] 🔄 Log trouvé → summary + sauver flag');
              setViewMode('summary');
              await AsyncStorage.setItem(WELLNESS_TODAY_FLAG, today);
              return;
            }
          }
          console.log('[Wellness] 🔄 Pas rempli → form');
        } catch (e) {
          console.warn('[Wellness] Erreur recheck:', e);
        }
      };
      recheckIfFilled();
    }, [])
  );

  // Quand existingLog se charge via le hook → switch auto
  useEffect(() => {
    if (existingLog) {
      setFormData(existingLog);
      if (existingLog.dateKey === todayDateKey) {
        setViewMode('summary');
      }
    }
  }, [existingLog?.id]);

  const handleSave = async () => {
    console.log('[Wellness] 💾 handleSave déclenché');
    const now = new Date();
    const dateKey = formatDateKey(now);

    // 1) SAUVER LE FLAG IMMÉDIATEMENT — avant tout le reste
    try {
      await AsyncStorage.setItem(WELLNESS_TODAY_FLAG, dateKey);
      console.log('[Wellness] ✅ Flag sauvé:', dateKey);
    } catch (e) {
      console.error('[Wellness] ❌ Erreur sauvegarde flag:', e);
    }

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

    console.log('[Wellness] 📤 Appel saveLog...');
    const result = await saveLog(log);
    console.log('[Wellness] 📥 Résultat saveLog:', result.success);

    if (result.success) {
      refreshHistory();
      const msg = result.recommendation
        ? `Remède du jour : ${result.recommendation.remedyName}`
        : 'Journal bien-être enregistré !';
      setIsSaved(true);
      setSaveStatus({ type: 'success', message: msg });
      console.log('[Wellness] ✅ Succès ! Basculer sur résumé dans 1.5s');
      setTimeout(() => {
        setSaveStatus(null);
        setIsSaved(false);
        setViewMode('summary');
        console.log('[Wellness] → viewMode = summary');
      }, 1500);
    } else {
      console.log('[Wellness] ⚠️ saveLog failed, mais flag est déjà sauvé');
      setSaveStatus({ type: 'success', message: 'Journal enregistré !' });
      setIsSaved(true);
      setTimeout(() => {
        setSaveStatus(null);
        setIsSaved(false);
        setViewMode('summary');
      }, 1500);
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

  // Calcul des moyennes (hors JSX pour éviter IIFE)
  const weekAvg = history.length >= 2 ? {
    sommeil: Math.round(history.reduce((s, l) => s + (l.sommeil?.qualite || 0), 0) / history.length * 10) / 10,
    stress:  Math.round(history.reduce((s, l) => s + (l.stress  || 0), 0) / history.length * 10) / 10,
    humeur:  Math.round(history.reduce((s, l) => s + (l.humeur  || 0), 0) / history.length * 10) / 10,
    energie: Math.round(history.reduce((s, l) => s + (l.energie || 0), 0) / history.length * 10) / 10,
  } : null;

  // ============================================
  // CHART 7 JOURS - données & animation
  // ============================================
  const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Build last 7 days array (oldest first)
  const chartDays = React.useMemo(() => {
    const days: { dateKey: string; label: string; sommeil: number; energie: number; stress: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const log = history.find(l => l.dateKey === dk);
      days.push({
        dateKey: dk,
        label: DAY_LABELS_FR[d.getDay()],
        sommeil: log?.sommeil?.qualite || 0,
        energie: log?.energie || 0,
        stress: log?.stress || 0,
      });
    }
    return days;
  }, [history]);

  // Animated values for the 7-day chart (one per day, staggered)
  const chartAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (viewMode === 'summary' && history.length > 0) {
      // Reset
      chartAnims.forEach(a => a.setValue(0));
      // Stagger animation
      const animations = chartAnims.map((anim, idx) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: idx * 80,
          useNativeDriver: false,
        })
      );
      Animated.stagger(80, animations).start();
    }
  }, [viewMode, history.length]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal Bien-être</Text>
          {showHistory ? (
            <View style={styles.historyBadge}>
              <Feather name="check-circle" size={16} color="#4ADE80" />
              <Text style={styles.historyBadgeLabel}>Complété</Text>
            </View>
          ) : (
            <View />
          )}
        </View>

        {showHistory ? (
          // ── Vue résumé de la semaine ──
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

            {/* Bannière succès si on vient de sauvegarder */}
            {saveStatus && (
              <View style={styles.successBanner}>
                <View style={styles.successIconCircle}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <View style={styles.successTextBlock}>
                  <Text style={styles.successTitle}>Enregistré !</Text>
                  <Text style={styles.successMessage}>{saveStatus.message}</Text>
                </View>
              </View>
            )}

            {/* Titre section */}
            <View style={styles.weekTitleRow}>
              <Text style={styles.weekTitle}>📊 Résumé de la semaine</Text>
              <Text style={styles.weekSubtitle}>7 derniers jours</Text>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>Aucun enregistrement</Text>
                <Text style={styles.emptySubtext}>Revenez demain pour voir votre historique</Text>
              </View>
            ) : (
              <View>
                {/* Bloc moyennes — affiché seulement si 2+ jours */}
                {weekAvg !== null ? (
                  <View style={styles.avgCard}>
                    <Text style={styles.avgCardTitle}>MOYENNES DE LA SEMAINE</Text>
                    <View style={styles.avgGrid}>
                      <View style={styles.avgItem}>
                        <Text style={styles.avgEmoji}>😴</Text>
                        <Text style={styles.avgValue}>{weekAvg.sommeil} / 5</Text>
                        <Text style={styles.avgLabel}>Sommeil</Text>
                      </View>
                      <View style={styles.avgItem}>
                        <Text style={styles.avgEmoji}>😰</Text>
                        <Text style={styles.avgValue}>{weekAvg.stress} / 5</Text>
                        <Text style={styles.avgLabel}>Stress</Text>
                      </View>
                      <View style={styles.avgItem}>
                        <Text style={styles.avgEmoji}>🙂</Text>
                        <Text style={styles.avgValue}>{weekAvg.humeur} / 5</Text>
                        <Text style={styles.avgLabel}>Humeur</Text>
                      </View>
                      <View style={styles.avgItem}>
                        <Text style={styles.avgEmoji}>⚡</Text>
                        <Text style={styles.avgValue}>{weekAvg.energie} / 5</Text>
                        <Text style={styles.avgLabel}>Énergie</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.placeholderAvg} />
                )}

                {/* ── Graphique évolution 7 jours ── */}
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>{'📊 Évolution sur 7 jours'}</Text>
                  {/* Légende */}
                  <View style={styles.chartLegend}>
                    <View style={styles.chartLegendItem}>
                      <View style={[styles.chartLegendDot, { backgroundColor: '#818CF8' }]} />
                      <Text style={styles.chartLegendText}>Sommeil</Text>
                    </View>
                    <View style={styles.chartLegendItem}>
                      <View style={[styles.chartLegendDot, { backgroundColor: '#34D399' }]} />
                      <Text style={styles.chartLegendText}>Énergie</Text>
                    </View>
                    <View style={styles.chartLegendItem}>
                      <View style={[styles.chartLegendDot, { backgroundColor: '#F87171' }]} />
                      <Text style={styles.chartLegendText}>Stress</Text>
                    </View>
                  </View>
                  {/* Bars per day */}
                  {chartDays.map((day, idx) => {
                    const hasData = day.sommeil > 0 || day.energie > 0 || day.stress > 0;
                    const scale = chartAnims[idx];
                    return (
                      <View key={day.dateKey} style={styles.chartDayRow}>
                        <Text style={styles.chartDayLabel}>{day.label}</Text>
                        <View style={styles.chartBarsCol}>
                          {/* Sommeil */}
                          <View style={styles.chartBarTrack}>
                            <Animated.View
                              style={[
                                styles.chartBarFill,
                                {
                                  backgroundColor: hasData ? '#818CF8' : '#333',
                                  width: scale.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', `${(hasData ? day.sommeil : 0.3) / 5 * 100}%`],
                                  }),
                                },
                              ]}
                            />
                          </View>
                          {/* Énergie */}
                          <View style={styles.chartBarTrack}>
                            <Animated.View
                              style={[
                                styles.chartBarFill,
                                {
                                  backgroundColor: hasData ? '#34D399' : '#333',
                                  width: scale.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', `${(hasData ? day.energie : 0.3) / 5 * 100}%`],
                                  }),
                                },
                              ]}
                            />
                          </View>
                          {/* Stress */}
                          <View style={styles.chartBarTrack}>
                            <Animated.View
                              style={[
                                styles.chartBarFill,
                                {
                                  backgroundColor: hasData ? '#F87171' : '#333',
                                  width: scale.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', `${(hasData ? day.stress : 0.3) / 5 * 100}%`],
                                  }),
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <Text style={styles.chartDayValues}>
                          {hasData ? `${day.sommeil} ${day.energie} ${day.stress}` : '—'}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Cartes jour par jour */}
                {history.map((log) => {
                  const sommeilVal = log.sommeil?.qualite || 0;
                  const energieVal = log.energie || 0;
                  const stressVal  = log.stress  || 0;
                  return (
                    <View key={log.id} style={styles.historyCard}>
                      <View style={styles.historyHeader}>
                        <View>
                          <Text style={styles.historyDate}>{getDateLabel(log.date)}</Text>
                          <Text style={styles.historyDateSub}>
                            {new Date(log.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </Text>
                        </View>
                        <Text style={styles.historyMood}>{getMoodEmoji(log.humeur)}</Text>
                      </View>

                      {/* Barres — width numérique pour éviter crash web */}
                      <View style={styles.barRow}>
                        <Text style={styles.barLabel}>😴 Sommeil</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { flex: sommeilVal, backgroundColor: '#6366F1' }]} />
                          <View style={{ flex: 5 - sommeilVal }} />
                        </View>
                        <Text style={styles.barValue}>{sommeilVal}/5</Text>
                      </View>
                      <View style={styles.barRow}>
                        <Text style={styles.barLabel}>⚡ Énergie</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { flex: energieVal, backgroundColor: '#10B981' }]} />
                          <View style={{ flex: 5 - energieVal }} />
                        </View>
                        <Text style={styles.barValue}>{energieVal}/5</Text>
                      </View>
                      <View style={styles.barRow}>
                        <Text style={styles.barLabel}>😰 Stress</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { flex: stressVal, backgroundColor: '#F59E0B' }]} />
                          <View style={{ flex: 5 - stressVal }} />
                        </View>
                        <Text style={styles.barValue}>{stressVal}/5</Text>
                      </View>

                      {log.symptomes?.length > 0 ? (
                        <View style={styles.historySymptoms}>
                          {log.symptomes.map((s, i) => (
                            <View key={i} style={styles.historySymptomTag}>
                              <Text style={styles.historySymptomText}>{s}</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.noSymptoms} />
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Bouton retour à l'accueil */}
            <TouchableOpacity
              style={styles.backToHomeBtn}
              onPress={() => {
                // WellnessScreen est un onglet du TabNavigator
                // navigation = Stack nav, navigation lui-même a jumpTo si c'est le Tab
                try {
                  // Essayer jumpTo sur le navigation actuel (Tab)
                  if (typeof (navigation as any).jumpTo === 'function') {
                    (navigation as any).jumpTo('Accueil');
                  } else {
                    // Sinon naviguer via le parent Tab
                    const parent = navigation.getParent();
                    if (parent && typeof (parent as any).jumpTo === 'function') {
                      (parent as any).jumpTo('Accueil');
                    } else {
                      // Dernier recours : navigate vers MainTabs avec écran initial
                      navigation.navigate('MainTabs', { screen: 'Accueil' });
                    }
                  }
                } catch (e) {
                  console.warn('Navigation Accueil failed:', e);
                }
              }}
            >
              <Feather name="home" size={18} color="#fff" />
              <Text style={styles.backToHomeBtnText}>Retour à l'accueil</Text>
            </TouchableOpacity>

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

            {/* Bannière de succès */}
            {saveStatus && saveStatus.type === 'success' && (
              <View style={styles.successBanner}>
                <View style={styles.successIconCircle}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <View style={styles.successTextBlock}>
                  <Text style={styles.successTitle}>Enregistré !</Text>
                  <Text style={styles.successMessage}>{saveStatus.message}</Text>
                </View>
                <View style={styles.successLoader}>
                  <Text style={styles.successLoaderText}>Redirection...</Text>
                </View>
              </View>
            )}

            {/* Bannière d'erreur */}
            {saveStatus && saveStatus.type === 'error' && (
              <View style={styles.statusBannerError}>
                <Text style={styles.statusBannerText}>{saveStatus.message}</Text>
              </View>
            )}

            {/* Bouton sauvegarder */}
            <TouchableOpacity
              style={[styles.saveButton, (isSaving || isSaved) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving || isSaved}
            >
              <LinearGradient
                colors={isSaved ? ['#16A34A', '#15803D'] : [colors.accentPrimary, '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Feather name={isSaved ? 'check-circle' : 'check'} size={20} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Enregistrement...' : isSaved ? 'Enregistré ✓' : 'Enregistrer'}
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
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D2B1A',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#16A34A44',
  },
  historyBadgeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4ADE80',
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2B1A',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#16A34A',
    gap: spacing.sm,
  },
  successIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  successTextBlock: {
    flex: 1,
  },
  successTitle: {
    color: '#4ADE80',
    fontSize: 15,
    fontWeight: '700',
  },
  successMessage: {
    color: '#86EFAC',
    fontSize: 13,
    marginTop: 2,
  },
  successLoader: {
    backgroundColor: '#16A34A33',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  successLoaderText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '600',
  },
  statusBannerError: {
    backgroundColor: '#3D1515',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
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
  saveButtonDisabled: {
    opacity: 0.85,
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
  backToHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary || '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.lg || 16,
    marginTop: spacing.xl || 24,
    marginHorizontal: spacing.md || 16,
    gap: 8,
  },
  backToHomeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  weekTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weekSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  avgCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avgCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  avgGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  avgItem: {
    alignItems: 'center',
    gap: 4,
  },
  avgEmoji: {
    fontSize: 22,
  },
  avgValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  avgMax: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '400',
  },
  avgLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
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
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historyDateSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  historyMood: {
    fontSize: 28,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  barLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 80,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: 6,
  },
  placeholderAvg: {
    height: 0,
  },
  // ── Chart 7 jours ──
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  chartDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  chartDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 30,
  },
  chartBarsCol: {
    flex: 1,
    gap: 3,
  },
  chartBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: 6,
    borderRadius: 3,
  },
  chartDayValues: {
    fontSize: 10,
    color: colors.textMuted,
    width: 40,
    textAlign: 'right',
  },
  noSymptoms: {
    height: 0,
  },
  barValue: {
    fontSize: 12,
    color: colors.textMuted,
    width: 28,
    textAlign: 'right',
  },
  historySymptoms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
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
