import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';

interface NaturalFrameCardProps {
  title: string;
  subtitle: string;
  image: any;
  onPress: () => void;
}


// Feuille élégante
const Leaf: React.FC<{
  style: any;
  size: number;
  color: string;
  rotation: number;
  delay: number;
}> = ({ style, size, color, rotation, delay }) => {
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 3500,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${rotation - 3}deg`, `${rotation + 3}deg`],
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size * 1.6,
          transform: [{ rotate }],
        },
        style,
      ] as any}
    >
      <LinearGradient
        colors={[color, adjustColor(color, -25)]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={{
          width: '100%',
          height: '100%',
          borderTopLeftRadius: size * 0.9,
          borderTopRightRadius: size * 0.9,
          borderBottomLeftRadius: size * 0.2,
          borderBottomRightRadius: size * 0.2,
        }}
      />
      {/* Nervure */}
      <View
        style={{
          position: 'absolute',
          left: '50%',
          marginLeft: -0.5,
          top: '15%',
          width: 1,
          height: '70%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 0.5,
        }}
      />
    </Animated.View>
  );
};

// Fonction pour ajuster la couleur
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const NaturalFrameCard: React.FC<NaturalFrameCardProps> = ({
  title,
  subtitle,
  image,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(76, 175, 80, 0.3)', 'rgba(76, 175, 80, 0.6)'],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        {/* Carte principale avec bordure animée */}
        <Animated.View style={[styles.cardWrapper, { borderColor }]}>
          <LinearGradient
            colors={['rgba(25, 28, 32, 0.98)', 'rgba(18, 20, 24, 0.99)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >

            <View style={styles.content}>
              {/* Image avec bordure élégante */}
              <View style={styles.imageWrapper}>
                <LinearGradient
                  colors={['rgba(76, 175, 80, 0.5)', 'rgba(56, 142, 60, 0.3)']}
                  style={styles.imageBorder}
                >
                  <View style={styles.imageContainer}>
                    <Image source={image} style={styles.image} />
                  </View>
                </LinearGradient>
              </View>

              {/* Texte */}
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <View style={styles.subtitleRow}>
                  <View style={styles.subtitleDot} />
                  <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
              </View>

              {/* Flèche élégante */}
              <View style={styles.arrowContainer}>
                <LinearGradient
                  colors={['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.1)']}
                  style={styles.arrowBackground}
                >
                  <Feather name="chevron-right" size={20} color="rgba(76, 175, 80, 0.9)" />
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cardWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    marginRight: spacing.md,
  },
  imageBorder: {
    padding: 2,
    borderRadius: 28,
  },
  imageContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subtitleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.7)',
    marginRight: 6,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.2,
  },
  arrowContainer: {
    marginLeft: spacing.sm,
  },
  arrowBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
