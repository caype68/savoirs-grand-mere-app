import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logo } from '../assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

// Leçons du guide
const lessons = [
  {
    id: 'intro',
    icon: '🌿',
    title: 'Qu\'est-ce que la phytothérapie ?',
    subtitle: 'Se soigner par les plantes',
    color: '#10B981',
    grandMereSays: 'Depuis la nuit des temps, les plantes nous soignent. Nos grands-mères le savaient bien — chaque plante a ses vertus !',
    tips: [
      'La phytothérapie utilise les propriétés des plantes pour prévenir et soigner',
      'C\'est un savoir ancestral transmis de génération en génération',
      'Les plantes contiennent des principes actifs naturels reconnus scientifiquement',
    ],
  },
  {
    id: 'infusions',
    icon: '🍵',
    title: 'Les infusions, la base',
    subtitle: 'Le geste le plus simple',
    color: '#F59E0B',
    grandMereSays: 'Une bonne infusion, c\'est comme un câlin pour le corps. Laissez infuser 5 à 10 minutes, pas plus !',
    tips: [
      'Utilisez de l\'eau frémissante (80-90°C), jamais bouillante',
      'Couvrez pendant l\'infusion pour garder les huiles essentielles',
      '1 cuillère à café de plante par tasse en général',
      'Filtrez et buvez chaud, 2 à 3 fois par jour',
    ],
  },
  {
    id: 'plantes-cles',
    icon: '🌼',
    title: '5 plantes essentielles',
    subtitle: 'Votre pharmacie naturelle de base',
    color: '#8B5CF6',
    grandMereSays: 'Avec ces 5 plantes dans votre placard, vous êtes parés pour les petits maux du quotidien !',
    tips: [
      '🌿 Thym — Gorge, toux, rhume (antiseptique puissant)',
      '🌼 Camomille — Sommeil, stress, digestion (apaisante)',
      '🍃 Menthe poivrée — Digestion, nausées, maux de tête',
      '💜 Lavande — Stress, insomnie, douleurs (relaxante)',
      '🍋 Miel & Citron — Énergie, immunité, gorge',
    ],
  },
  {
    id: 'precautions',
    icon: '⚠️',
    title: 'Les précautions importantes',
    subtitle: 'Se soigner en toute sécurité',
    color: '#EF4444',
    grandMereSays: 'Naturel ne veut pas dire sans risque ! Respectez les dosages et écoutez votre corps.',
    tips: [
      'Consultez un médecin pour tout symptôme persistant',
      'Certaines plantes sont contre-indiquées pendant la grossesse',
      'Attention aux interactions avec vos médicaments',
      'Commencez toujours par de petites doses',
      'Les enfants de moins de 6 ans nécessitent un avis médical',
    ],
  },
  {
    id: 'routine',
    icon: '🌅',
    title: 'Créer sa routine bien-être',
    subtitle: 'Des gestes quotidiens simples',
    color: '#06B6D4',
    grandMereSays: 'La régularité est la clé ! Une tisane le matin et une le soir, et vous verrez la différence en quelques jours.',
    tips: [
      'Matin : infusion de thym ou gingembre pour bien démarrer',
      'Après-repas : menthe poivrée pour la digestion',
      'Soir : camomille ou tilleul pour un sommeil réparateur',
      'Notez vos ressentis dans le journal Bien-être de l\'app',
    ],
  },
];

export const BeginnerGuideScreen: React.FC<Props> = ({ navigation }) => {
  const [expandedLesson, setExpandedLesson] = useState<string | null>('intro');

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const speechBubble = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(lessons.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerFade, { toValue: 1, duration: 800, useNativeDriver: false }).start();

    // Logo floating animation
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -8, duration: 2000, useNativeDriver: false }),
        Animated.timing(logoFloat, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    );
    float.start();

    // Logo subtle rotation
    const rotate = Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, { toValue: 1, duration: 3000, useNativeDriver: false }),
        Animated.timing(logoRotate, { toValue: 0, duration: 3000, useNativeDriver: false }),
      ])
    );
    rotate.start();

    // Speech bubble pop in
    Animated.spring(speechBubble, {
      toValue: 1,
      friction: 5,
      tension: 100,
      delay: 500,
      useNativeDriver: false,
    }).start();

    // Stagger card animations
    Animated.stagger(
      150,
      cardAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: false })
      )
    ).start();

    return () => { float.stop(); rotate.stop(); };
  }, []);

  const rotateInterp = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const currentLesson = lessons.find(l => l.id === expandedLesson);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Guide du débutant</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section — Grand-Mère animée */}
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.heroSection}
          >
            {/* Logo animé */}
            <Animated.View style={[styles.logoContainer, {
              transform: [
                { translateY: logoFloat },
                { rotate: rotateInterp },
              ],
            }]}>
              <Image source={logo} style={styles.heroLogo} />
              {/* Glow effect */}
              <View style={styles.logoGlow} />
            </Animated.View>

            {/* Bulle de dialogue animée */}
            <Animated.View style={[styles.speechBubble, {
              opacity: speechBubble,
              transform: [{ scale: speechBubble }],
            }]}>
              <Text style={styles.speechText}>
                {currentLesson
                  ? currentLesson.grandMereSays
                  : 'Bienvenue ! Je vais vous apprendre les bases des remèdes naturels.'}
              </Text>
              <View style={styles.speechArrow} />
            </Animated.View>

            {/* Particles décoratives */}
            <Text style={[styles.particle, { top: 20, left: 30 }]}>🌿</Text>
            <Text style={[styles.particle, { top: 40, right: 25 }]}>✨</Text>
            <Text style={[styles.particle, { bottom: 30, left: 50 }]}>🍃</Text>
            <Text style={[styles.particle, { bottom: 20, right: 40 }]}>🌸</Text>
          </LinearGradient>

          {/* Progression */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {lessons.map((lesson, i) => {
                const isActive = expandedLesson === lesson.id;
                const isPast = expandedLesson ? lessons.findIndex(l => l.id === expandedLesson) > i : false;
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.progressDot,
                      isActive && { backgroundColor: lesson.color, width: 28 },
                      isPast && { backgroundColor: `${lesson.color}80` },
                    ]}
                    onPress={() => setExpandedLesson(lesson.id)}
                  />
                );
              })}
            </View>
            <Text style={styles.progressText}>
              {expandedLesson
                ? `${lessons.findIndex(l => l.id === expandedLesson) + 1} / ${lessons.length}`
                : `${lessons.length} leçons`}
            </Text>
          </View>

          {/* Leçons */}
          {lessons.map((lesson, index) => {
            const isExpanded = expandedLesson === lesson.id;
            return (
              <Animated.View
                key={lesson.id}
                style={{
                  opacity: cardAnims[index],
                  transform: [{
                    translateY: cardAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.lessonCard,
                    isExpanded && { borderColor: lesson.color, borderWidth: 2 },
                  ]}
                  onPress={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                  activeOpacity={0.85}
                >
                  {/* Header de la leçon */}
                  <View style={styles.lessonHeader}>
                    <View style={[styles.lessonIconBg, { backgroundColor: `${lesson.color}20` }]}>
                      <Text style={styles.lessonIcon}>{lesson.icon}</Text>
                    </View>
                    <View style={styles.lessonHeaderText}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
                    </View>
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </View>

                  {/* Contenu étendu */}
                  {isExpanded ? (
                    <View style={styles.lessonContent}>
                      <View style={[styles.lessonDivider, { backgroundColor: lesson.color }]} />
                      {lesson.tips.map((tip, tipIndex) => (
                        <View key={tipIndex} style={styles.tipRow}>
                          <View style={[styles.tipDot, { backgroundColor: lesson.color }]} />
                          <Text style={styles.tipText}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* CTA final */}
          <LinearGradient
            colors={[colors.accentPrimary || '#6366F1', '#8B5CF6']}
            style={styles.ctaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaEmoji}>🌟</Text>
            <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
            <Text style={styles.ctaSubtitle}>
              Explorez nos remèdes et commencez votre parcours de bien-être naturel
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.ctaButtonText}>Explorer les remèdes</Text>
              <Feather name="arrow-right" size={16} color={colors.accentPrimary || '#6366F1'} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  heroSection: {
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.lg,
    minHeight: 260,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(253, 230, 138, 0.4)',
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(253, 230, 138, 0.15)',
    top: -10,
    left: -10,
  },
  speechBubble: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  speechText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  speechArrow: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    left: '45%',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  particle: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.5,
  },

  // Progress
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Lessons
  lessonCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 12,
  },
  lessonIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonIcon: {
    fontSize: 22,
  },
  lessonHeaderText: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lessonSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  lessonContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  lessonDivider: {
    height: 2,
    borderRadius: 1,
    marginBottom: 14,
    opacity: 0.3,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // CTA
  ctaCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentPrimary || '#6366F1',
  },
});
