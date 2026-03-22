// ============================================
// COMPOSANT BACKEND STATUS
// Affiche l'état de connexion au backend (debug)
// ============================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useBackend } from '../hooks/useBackend';
import { colors, spacing, borderRadius } from '../theme/colors';

interface BackendStatusProps {
  compact?: boolean;
  showRefresh?: boolean;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({
  compact = false,
  showRefresh = true,
}) => {
  const { isOnline, dataSource, lastSync, isRefreshing, refresh } = useBackend();

  const getStatusColor = () => {
    if (isOnline && dataSource === 'remote') return '#22C55E'; // Vert
    if (dataSource === 'hybrid') return '#F59E0B'; // Orange
    return '#6B7280'; // Gris
  };

  const getStatusIcon = (): keyof typeof Feather.glyphMap => {
    if (isOnline && dataSource === 'remote') return 'cloud';
    if (dataSource === 'hybrid') return 'cloud-off';
    return 'hard-drive';
  };

  const getStatusText = () => {
    if (isOnline && dataSource === 'remote') return 'Backend connecté';
    if (dataSource === 'hybrid') return 'Mode hybride';
    return 'Mode local';
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.compactText}>{dataSource}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
          <Feather name={getStatusIcon()} size={16} color={getStatusColor()} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {lastSync && (
            <Text style={styles.syncText}>
              Dernière sync: {new Date(lastSync).toLocaleTimeString('fr-FR')}
            </Text>
          )}
        </View>
        {showRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refresh}
            disabled={isRefreshing}
          >
            <Feather
              name="refresh-cw"
              size={16}
              color={isRefreshing ? colors.textMuted : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================
// COMPOSANT BACKEND INDICATOR (minimaliste)
// ============================================

export const BackendIndicator: React.FC = () => {
  const { isOnline, dataSource } = useBackend();

  const color = isOnline && dataSource === 'remote' ? '#22C55E' : '#6B7280';

  return (
    <View style={styles.indicator}>
      <View style={[styles.indicatorDot, { backgroundColor: color }]} />
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  syncText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  compactText: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  indicator: {
    padding: 4,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default BackendStatus;
