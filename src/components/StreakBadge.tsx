// ============================================
// COMPOSANT STREAK BADGE
// Affiche le streak et les badges de gamification
// Avec animations de déverrouillage et mini-jeux
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { UserStreak, StreakBadge as StreakBadgeType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// BADGE CHALLENGE DESCRIPTIONS (mini-jeux)
// ============================================

const BADGE_CHALLENGES: Record<string, { challenge: string; tip: string; reward: string }> = {
  apprenti_herboriste: {
    challenge: '🎯 Défi : Utilise l\'app 3 jours de suite',
    tip: '💡 Astuce : Ouvre l\'app chaque matin avec ton café !',
    reward: '🎁 Récompense : Badge Apprenti + titre spécial',
  },
  routine_engagee: {
    challenge: '🎯 Défi : 1 semaine sans interruption',
    tip: '💡 Astuce : Active les rappels quotidiens !',
    reward: '🎁 Récompense : Badge doré + accès bien-être',
  },
  herboriste_confirme: {
    challenge: '🎯 Défi : 2 semaines de régularité',
    tip: '💡 Astuce : Explore un nouveau remède chaque jour',
    reward: '🎁 Récompense : Badge confirmé + statistiques',
  },
  maitre_remedes: {
    challenge: '🎯 Défi : 30 jours consécutifs !',
    tip: '💡 Astuce : Intègre les remèdes dans ta routine',
    reward: '🎁 Récompense : Badge Maître + collection complète',
  },
  routine_parfaite: {
    challenge: '🎯 Défi : 60 jours, tu es un guerrier !',
    tip: '💡 Astuce : Partage tes découvertes avec tes proches',
    reward: '🎁 Récompense : Badge Parfait + titre légendaire',
  },
  legende_naturelle: {
    challenge: '🎯 Défi ultime : 100 jours consécutifs',
    tip: '💡 Tu es sur le chemin de la légende !',
    reward: '🎁 Récompense : Badge Légendaire + couronne dorée',
  },
};

// ============================================
// TYPES
// ============================================

interface StreakDisplayProps {
  streak: UserStreak;
  onPress?: () => void;
  compact?: boolean;
}

interface BadgeCardProps {
  badge: StreakBadgeType;
  currentStreak: number;
  onPress?: () => void;
}

interface StreakProgressProps {
  currentStreak: number;
  nextBadge: StreakBadgeType | null;
  progress: number;
}

// ============================================
// COMPOSANT PRINCIPAL - AFFICHAGE STREAK
// ============================================

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  onPress,
  compact = false,
}) => {
  const isActive = streak.currentStreak > 0;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fireGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Pulse animation for fire
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(fireGlow, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fireGlow, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <Animated.View style={[
          styles.compactFireIcon,
          isActive && styles.compactFireIconActive,
          { transform: [{ scale: pulseAnim }] },
        ]}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </Animated.View>
        <Text style={[
          styles.compactStreakNumber,
          isActive && styles.compactStreakNumberActive
        ]}>
          {streak.currentStreak}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <LinearGradient
        colors={isActive
          ? ['#FF6B35', '#FF8C42', '#FFA94D']
          : [colors.surface, colors.surfaceHighlight]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Icône flamme animée */}
          <Animated.View style={[
            styles.fireContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}>
            <Text style={styles.fireEmojiLarge}>🔥</Text>
          </Animated.View>

          {/* Nombre de jours */}
          <View style={styles.streakInfo}>
            <Text style={[
              styles.streakNumber,
              !isActive && styles.streakNumberInactive
            ]}>
              {streak.currentStreak}
            </Text>
            <Text style={[
              styles.streakLabel,
              !isActive && styles.streakLabelInactive
            ]}>
              {streak.currentStreak === 1 ? 'jour' : 'jours'}
            </Text>
          </View>

          {/* Meilleur streak */}
          {streak.bestStreak > 0 && (
            <View style={styles.bestStreak}>
              <Feather name="award" size={12} color={isActive ? '#fff' : colors.textMuted} />
              <Text style={[
                styles.bestStreakText,
                !isActive && styles.bestStreakTextInactive
              ]}>
                Record : {streak.bestStreak}
              </Text>
            </View>
          )}
        </View>

        {/* Chevron si cliquable */}
        {onPress && (
          <Feather
            name="chevron-right"
            size={20}
            color={isActive ? 'rgba(255,255,255,0.7)' : colors.textMuted}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ============================================
// COMPOSANT CARTE BADGE (AVEC ANIMATIONS)
// ============================================

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  currentStreak,
  onPress,
}) => {
  const progress = Math.min(100, (currentStreak / badge.requiredDays) * 100);
  const isUnlocked = badge.isUnlocked;
  const [showDetail, setShowDetail] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const starRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Animate progress bar
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    if (isUnlocked) {
      // Continuous glow pulse for unlocked badges
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shine sweep animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 2,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(shineAnim, {
            toValue: -1,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Gentle bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -4,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Star rotation
      Animated.loop(
        Animated.timing(starRotation, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isUnlocked, progress]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const starSpin = starRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const challengeInfo = BADGE_CHALLENGES[badge.type] || BADGE_CHALLENGES.apprenti_herboriste;

  const handlePress = () => {
    setShowDetail(true);
    if (onPress) onPress();
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.badgeCard,
            isUnlocked && styles.badgeCardUnlocked,
          ]}
          onPress={handlePress}
          activeOpacity={0.75}
        >
          {/* Glow background for unlocked */}
          {isUnlocked && (
            <Animated.View
              style={[
                styles.badgeGlow,
                { opacity: glowOpacity },
              ]}
            />
          )}

          {/* Icône avec animation */}
          <Animated.View style={[
            styles.badgeIconContainer,
            isUnlocked && styles.badgeIconContainerUnlocked,
            {
              transform: [
                { translateY: bounceAnim },
                ...(isUnlocked ? [{ rotate: starSpin }] : []),
              ]
            },
          ]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            {isUnlocked && (
              <View style={styles.badgeCheckMini}>
                <Text style={{ fontSize: 10 }}>✓</Text>
              </View>
            )}
          </Animated.View>

          {/* Infos */}
          <View style={styles.badgeInfo}>
            <View style={styles.badgeNameRow}>
              <Text style={[
                styles.badgeName,
                isUnlocked && styles.badgeNameUnlocked,
              ]}>
                {badge.name}
              </Text>
              {isUnlocked && (
                <View style={styles.unlockedBadgeMini}>
                  <Text style={styles.unlockedBadgeMiniText}>Débloqué !</Text>
                </View>
              )}
            </View>

            <Text style={styles.badgeDescription} numberOfLines={1}>
              {badge.description}
            </Text>

            {/* Challenge hint */}
            <Text style={styles.badgeChallengeHint} numberOfLines={1}>
              {isUnlocked ? '🏆 Bravo, défi complété !' : challengeInfo.challenge}
            </Text>

            {/* Barre de progression animée */}
            {!isUnlocked && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressWidth.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        })
                      }
                    ]}
                  />
                  {/* Progress shine */}
                  <Animated.View
                    style={[
                      styles.progressShine,
                      {
                        transform: [{
                          translateX: shineAnim.interpolate({
                            inputRange: [-1, 2],
                            outputRange: [-30, 200],
                          })
                        }],
                      }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentStreak}/{badge.requiredDays}
                </Text>
              </View>
            )}

            {/* Date de déverrouillage */}
            {isUnlocked && badge.unlockedAt && (
              <Text style={styles.unlockedDate}>
                ✨ Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
              </Text>
            )}
          </View>

          {/* Indicateur chevron */}
          <View style={styles.badgeChevron}>
            <Feather
              name="chevron-right"
              size={16}
              color={isUnlocked ? colors.accentPrimary : colors.textMuted}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal détail du badge */}
      <Modal
        visible={showDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetail(false)}
      >
        <BadgeDetailModal
          badge={badge}
          currentStreak={currentStreak}
          progress={progress}
          challengeInfo={challengeInfo}
          onDismiss={() => setShowDetail(false)}
        />
      </Modal>
    </>
  );
};

// ============================================
// MODAL DÉTAIL BADGE (MINI-JEU)
// ============================================

interface BadgeDetailModalProps {
  badge: StreakBadgeType;
  currentStreak: number;
  progress: number;
  challengeInfo: { challenge: string; tip: string; reward: string };
  onDismiss: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  currentStreak,
  progress,
  challengeInfo,
  onDismiss,
}) => {
  const isUnlocked = badge.isUnlocked;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: -10,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconBounce, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.bounce),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particle animations for unlocked badges
    if (isUnlocked) {
      particleAnims.forEach((particle, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 80 + Math.random() * 40;

        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 200),
            Animated.parallel([
              Animated.timing(particle.x, {
                toValue: Math.cos(angle) * radius,
                duration: 1500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: Math.sin(angle) * radius,
                duration: 1500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(particle.x, { toValue: 0, duration: 0, useNativeDriver: true }),
              Animated.timing(particle.y, { toValue: 0, duration: 0, useNativeDriver: true }),
            ]),
          ])
        ).start();
      });
    }
  }, []);

  const PARTICLE_EMOJIS = ['⭐', '✨', '🌟', '💫', '🔥', '🌿', '🍃', '🎉'];

  return (
    <TouchableOpacity
      style={styles.detailOverlay}
      activeOpacity={1}
      onPress={onDismiss}
    >
      <Animated.View
        style={[
          styles.detailCard,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }
        ]}
      >
        <TouchableOpacity activeOpacity={1}>
          {/* Background gradient */}
          <LinearGradient
            colors={isUnlocked
              ? ['#1A2F1A', '#0D1F0D', '#0A0A0F']
              : ['#1A1A2F', '#0F0F1A', '#0A0A0F']
            }
            style={styles.detailGradient}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.detailClose} onPress={onDismiss}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.detailLabel}>
              {isUnlocked ? '🏆 BADGE DÉBLOQUÉ' : '🎯 DÉFI EN COURS'}
            </Text>

            {/* Animated badge icon */}
            <View style={styles.detailIconWrapper}>
              {/* Particles */}
              {isUnlocked && particleAnims.map((particle, i) => (
                <Animated.Text
                  key={i}
                  style={[
                    styles.particle,
                    {
                      transform: [
                        { translateX: particle.x },
                        { translateY: particle.y },
                        { scale: particle.scale },
                      ],
                      opacity: particle.opacity,
                    },
                  ]}
                >
                  {PARTICLE_EMOJIS[i]}
                </Animated.Text>
              ))}

              <Animated.View style={[
                styles.detailIconCircle,
                isUnlocked && styles.detailIconCircleUnlocked,
                { transform: [{ translateY: iconBounce }] },
              ]}>
                <Text style={styles.detailIconEmoji}>{badge.icon}</Text>
              </Animated.View>
            </View>

            {/* Badge name */}
            <Text style={styles.detailName}>{badge.name}</Text>
            <Text style={styles.detailDescription}>{badge.description}</Text>

            {/* Progress section */}
            <View style={styles.detailProgressSection}>
              <View style={styles.detailProgressBar}>
                <LinearGradient
                  colors={isUnlocked
                    ? ['#4ade80', '#22c55e']
                    : [colors.accentPrimary, '#FF8C42']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.detailProgressFill, { width: `${progress}%` }]}
                />
              </View>
              <View style={styles.detailProgressLabels}>
                <Text style={styles.detailProgressCurrent}>
                  {currentStreak} jours
                </Text>
                <Text style={styles.detailProgressTarget}>
                  Objectif : {badge.requiredDays} jours
                </Text>
              </View>
              <Text style={styles.detailProgressPercent}>
                {Math.round(progress)}% complété
              </Text>
            </View>

            {/* Challenge info (mini-jeu) */}
            <View style={styles.detailChallengeBox}>
              <Text style={styles.detailChallengeTitle}>
                {isUnlocked ? '🎮 Défi complété !' : '🎮 Comment l\'obtenir ?'}
              </Text>
              <Text style={styles.detailChallengeText}>
                {challengeInfo.challenge}
              </Text>
              <Text style={styles.detailChallengeTip}>
                {challengeInfo.tip}
              </Text>
              <View style={styles.detailRewardRow}>
                <Text style={styles.detailRewardText}>
                  {challengeInfo.reward}
                </Text>
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[
                styles.detailButton,
                isUnlocked && styles.detailButtonUnlocked,
              ]}
              onPress={onDismiss}
            >
              <LinearGradient
                colors={isUnlocked
                  ? ['#4ade80', '#22c55e']
                  : [colors.accentPrimary, '#FF8C42']
                }
                style={styles.detailButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.detailButtonText}>
                  {isUnlocked ? '🎉 Super !' : '💪 Je relève le défi !'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================
// COMPOSANT PROGRESSION VERS PROCHAIN BADGE
// ============================================

export const StreakProgress: React.FC<StreakProgressProps> = ({
  currentStreak,
  nextBadge,
  progress,
}) => {
  if (!nextBadge) {
    return (
      <View style={styles.progressCard}>
        <View style={styles.progressCardContent}>
          <Text style={styles.progressCardIcon}>👑</Text>
          <View style={styles.progressCardInfo}>
            <Text style={styles.progressCardTitle}>Tous les badges débloqués !</Text>
            <Text style={styles.progressCardSubtitle}>
              Vous êtes une Légende Naturelle
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const daysRemaining = nextBadge.requiredDays - currentStreak;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressCardContent}>
        <Text style={styles.progressCardIcon}>{nextBadge.icon}</Text>
        <View style={styles.progressCardInfo}>
          <Text style={styles.progressCardTitle}>
            Prochain badge : {nextBadge.name}
          </Text>
          <Text style={styles.progressCardSubtitle}>
            Plus que {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} !
          </Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressCardBar}>
        <View
          style={[
            styles.progressCardBarFill,
            { width: `${progress}%` }
          ]}
        />
      </View>

      <Text style={styles.progressCardPercent}>
        {Math.round(progress)}% complété
      </Text>
    </View>
  );
};

// ============================================
// COMPOSANT ANIMATION NOUVEAU BADGE (UNLOCK)
// ============================================

interface NewBadgeAnimationProps {
  badge: StreakBadgeType;
  onDismiss: () => void;
}

export const NewBadgeAnimation: React.FC<NewBadgeAnimationProps> = ({
  badge,
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Badge entrance
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Trophy rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.05,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Confetti explosion
    confettiAnims.forEach((confetti, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 100 + Math.random() * 80;

      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(confetti.x, {
            toValue: Math.cos(angle) * radius,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(confetti.y, {
            toValue: Math.sin(angle) * radius + 50,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(confetti.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.delay(600),
            Animated.timing(confetti.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(confetti.rotate, {
            toValue: 3 + Math.random() * 3,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, []);

  const CONFETTI_EMOJIS = ['🎊', '⭐', '✨', '🌟', '💫', '🎉', '🌿', '🍃', '💚', '🔥', '🏆', '👑'];

  const rotation = rotateAnim.interpolate({
    inputRange: [-0.05, 0, 0.05],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  return (
    <View style={styles.unlockOverlay}>
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(10,30,10,0.95)', 'rgba(0,0,0,0.9)']}
        style={styles.unlockGradient}
      >
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {confettiAnims.map((confetti, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.confetti,
                {
                  transform: [
                    { translateX: confetti.x },
                    { translateY: confetti.y },
                    { rotate: confetti.rotate.interpolate({
                      inputRange: [0, 6],
                      outputRange: ['0deg', '2160deg'],
                    })},
                  ],
                  opacity: confetti.opacity,
                },
              ]}
            >
              {CONFETTI_EMOJIS[i]}
            </Animated.Text>
          ))}
        </View>

        <Text style={styles.unlockTitle}>🎊 NOUVEAU BADGE ! 🎊</Text>

        <Animated.View style={[
          styles.unlockBadgeCircle,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ]
          },
        ]}>
          <LinearGradient
            colors={['#4ade80', '#22c55e', '#16a34a']}
            style={styles.unlockBadgeGradient}
          >
            <Text style={styles.unlockBadgeIcon}>{badge.icon}</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.unlockBadgeName}>{badge.name}</Text>
        <Text style={styles.unlockBadgeDesc}>{badge.description}</Text>

        <View style={styles.unlockStars}>
          <Text style={styles.unlockStarsText}>⭐ ⭐ ⭐</Text>
        </View>

        <TouchableOpacity style={styles.unlockButton} onPress={onDismiss}>
          <LinearGradient
            colors={['#4ade80', '#22c55e']}
            style={styles.unlockButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.unlockButtonText}>🎉 Trop bien !</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  compactFireIcon: {
    opacity: 0.5,
  },
  compactFireIconActive: {
    opacity: 1,
  },
  fireEmoji: {
    fontSize: 16,
  },
  compactStreakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  compactStreakNumberActive: {
    color: '#FF6B35',
  },

  // Container principal
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fireContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireEmojiLarge: {
    fontSize: 28,
  },
  streakInfo: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  streakNumberInactive: {
    color: colors.textPrimary,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -4,
  },
  streakLabelInactive: {
    color: colors.textMuted,
  },
  bestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bestStreakText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  bestStreakTextInactive: {
    color: colors.textMuted,
  },

  // Badge Card (enhanced)
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.85,
    overflow: 'hidden',
  },
  badgeCardUnlocked: {
    opacity: 1,
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  badgeGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: borderRadius.lg,
  },
  badgeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeIconContainerUnlocked: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  badgeIcon: {
    fontSize: 26,
  },
  badgeCheckMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  badgeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  badgeNameUnlocked: {
    color: colors.textPrimary,
  },
  unlockedBadgeMini: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unlockedBadgeMiniText: {
    fontSize: 10,
    color: '#4ade80',
    fontWeight: '700',
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeChallengeHint: {
    fontSize: 11,
    color: '#FFA94D',
    marginTop: 4,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 3,
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  unlockedDate: {
    fontSize: 11,
    color: '#4ade80',
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  badgeChevron: {
    marginLeft: spacing.xs,
    opacity: 0.6,
  },

  // Badge Detail Modal
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  detailCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
    zIndex: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFA94D',
    letterSpacing: 2,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  detailIconWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  particle: {
    position: 'absolute',
    fontSize: 18,
  },
  detailIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  detailIconCircleUnlocked: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  detailIconEmoji: {
    fontSize: 44,
  },
  detailName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  detailDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  detailProgressSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  detailProgressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  detailProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  detailProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailProgressCurrent: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  detailProgressTarget: {
    fontSize: 13,
    color: colors.textMuted,
  },
  detailProgressPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accentPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  detailChallengeBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailChallengeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  detailChallengeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  detailChallengeTip: {
    fontSize: 13,
    color: '#FFA94D',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  detailRewardRow: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 10,
    padding: spacing.sm,
  },
  detailRewardText: {
    fontSize: 13,
    color: '#4ade80',
    fontWeight: '600',
  },
  detailButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  detailButtonUnlocked: {},
  detailButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Progress Card
  progressCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  progressCardIcon: {
    fontSize: 32,
  },
  progressCardInfo: {
    flex: 1,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressCardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressCardBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressCardBarFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 4,
  },
  progressCardPercent: {
    fontSize: 12,
    color: colors.accentPrimary,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: spacing.sm,
  },

  // Unlock Animation (full screen)
  unlockOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  unlockGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
  },
  unlockTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFA94D',
    marginBottom: spacing.xl,
    textAlign: 'center',
    letterSpacing: 1,
  },
  unlockBadgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  unlockBadgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockBadgeIcon: {
    fontSize: 56,
  },
  unlockBadgeName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4ade80',
    marginBottom: spacing.xs,
  },
  unlockBadgeDesc: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  unlockStars: {
    marginBottom: spacing.xl,
  },
  unlockStarsText: {
    fontSize: 28,
  },
  unlockButton: {
    width: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  unlockButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  unlockButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

export default StreakDisplay;
