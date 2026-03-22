import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../theme/colors';

interface ZoneOption {
  id: string;
  label: string;
  icon: string;
}

const zones: ZoneOption[] = [
  { id: 'tete', label: 'Tête', icon: 'circle' },
  { id: 'gorge', label: 'Gorge', icon: 'mic' },
  { id: 'epaules', label: 'Épaules', icon: 'maximize' },
  { id: 'poitrine', label: 'Poitrine', icon: 'heart' },
  { id: 'ventre', label: 'Ventre', icon: 'target' },
  { id: 'dos', label: 'Dos', icon: 'align-center' },
  { id: 'bras', label: 'Bras', icon: 'move' },
  { id: 'jambes', label: 'Jambes', icon: 'trending-down' },
  { id: 'general', label: 'Tout le corps', icon: 'user' },
];

interface ZoneSelectionModalProps {
  visible: boolean;
  searchTerm: string;
  onSelectZone: (zone: string) => void;
  onClose: () => void;
}

const ZoneButton: React.FC<{
  zone: ZoneOption;
  onPress: () => void;
}> = ({ zone, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.zoneButtonWrapper}
    >
      <Animated.View style={[styles.zoneButton, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.zoneIconContainer}>
          <Feather name={zone.icon as any} size={20} color={colors.accentPrimary} />
        </View>
        <Text style={styles.zoneLabel}>{zone.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const ZoneSelectionModal: React.FC<ZoneSelectionModalProps> = ({
  visible,
  searchTerm,
  onSelectZone,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.overlayPress} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={[colors.surfaceCard, colors.background]}
            style={styles.modalGradient}
          >
            {/* Handle */}
            <View style={styles.handle} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Où avez-vous mal ?</Text>
              <Text style={styles.searchTermText}>
                Recherche : <Text style={styles.searchTermHighlight}>{searchTerm}</Text>
              </Text>
            </View>

            {/* Zone Grid */}
            <ScrollView 
              style={styles.zonesScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.zonesGrid}>
                {zones.map((zone) => (
                  <ZoneButton
                    key={zone.id}
                    zone={zone}
                    onPress={() => onSelectZone(zone.id)}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Skip button */}
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => onSelectZone('all')}
            >
              <Text style={styles.skipButtonText}>Rechercher sans préciser la zone</Text>
              <Feather name="arrow-right" size={16} color={colors.accentPrimary} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayPress: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalGradient: {
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  searchTermText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  searchTermHighlight: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  zonesScroll: {
    maxHeight: 300,
  },
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  zoneButtonWrapper: {
    width: '30%',
    marginBottom: spacing.sm,
  },
  zoneButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoneIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPrimaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  zoneLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
});
