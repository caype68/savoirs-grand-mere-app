import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const PRIVACY_POLICY_URL = 'https://savoirs-de-grand-mere.netlify.app/privacy';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique de confidentialité</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Dernière mise à jour : 24 mars 2025</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          L'application « Savoirs de Grand-Mère » (ci-après « l'Application ») est éditée dans le but
          de proposer un répertoire de remèdes traditionnels issus de livres anciens numérisés.
          La présente politique de confidentialité décrit les données que nous collectons,
          comment nous les utilisons et les droits dont vous disposez.
        </Text>

        <Text style={styles.sectionTitle}>2. Données collectées</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Données de profil :</Text> prénom (optionnel), objectifs de santé,
          allergies, type de profil, préférences de format de remèdes, niveau d'expérience.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Données de compte :</Text> adresse email et mot de passe (si vous
          créez un compte — stockés de manière chiffrée via Supabase Auth).
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Données d'utilisation :</Text> favoris, journal de bien-être,
          historique de consultation des remèdes, série d'activité (streak).
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Données techniques :</Text> aucun cookie tiers n'est utilisé.
          Aucun identifiant publicitaire n'est collecté.
        </Text>

        <Text style={styles.sectionTitle}>3. Stockage des données</Text>
        <Text style={styles.paragraph}>
          Par défaut, vos données sont stockées localement sur votre appareil (AsyncStorage / SQLite).
          Si vous créez un compte, vos données sont synchronisées sur nos serveurs via Supabase
          (hébergé par AWS dans l'Union Européenne). Les mots de passe sont hashés et ne sont
          jamais stockés en clair.
        </Text>

        <Text style={styles.sectionTitle}>4. Utilisation des données</Text>
        <Text style={styles.paragraph}>
          Vos données sont utilisées exclusivement pour :
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Personnaliser vos recommandations de remèdes</Text>
          <Text style={styles.bulletItem}>• Sauvegarder vos favoris et votre progression</Text>
          <Text style={styles.bulletItem}>• Synchroniser vos données entre vos appareils (si connecté)</Text>
        </View>
        <Text style={styles.paragraph}>
          Nous ne vendons, ne partageons et ne transmettons jamais vos données personnelles
          à des tiers à des fins commerciales.
        </Text>

        <Text style={styles.sectionTitle}>5. Liens affiliés Amazon</Text>
        <Text style={styles.paragraph}>
          L'Application peut afficher des liens affiliés vers Amazon. Si vous cliquez sur un lien
          et effectuez un achat, nous recevons une commission. Aucune donnée personnelle
          n'est partagée avec Amazon via ces liens.
        </Text>

        <Text style={styles.sectionTitle}>6. Droits de l'utilisateur</Text>
        <Text style={styles.paragraph}>
          Conformément au RGPD et aux réglementations applicables, vous pouvez :
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Accéder à vos données depuis l'écran Profil</Text>
          <Text style={styles.bulletItem}>• Modifier vos données à tout moment</Text>
          <Text style={styles.bulletItem}>• Supprimer votre compte et toutes vos données</Text>
          <Text style={styles.bulletItem}>• Exporter vos données</Text>
        </View>

        <Text style={styles.sectionTitle}>7. Sécurité</Text>
        <Text style={styles.paragraph}>
          Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
          appropriées pour protéger vos données : chiffrement en transit (HTTPS/TLS),
          authentification sécurisée (Supabase Auth avec JWT), accès restreint aux bases de données.
        </Text>

        <Text style={styles.sectionTitle}>8. Mineurs</Text>
        <Text style={styles.paragraph}>
          L'Application n'est pas destinée aux enfants de moins de 16 ans.
          Nous ne collectons pas sciemment de données auprès de mineurs.
        </Text>

        <Text style={styles.sectionTitle}>9. Modifications</Text>
        <Text style={styles.paragraph}>
          Nous nous réservons le droit de modifier cette politique de confidentialité.
          Toute modification sera notifiée via une mise à jour de l'Application.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.paragraph}>
          Pour toute question relative à vos données personnelles, contactez-nous à :{'\n'}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('mailto:contact@savoirsdegrandmere.fr')}
          >
            contact@savoirsdegrandmere.fr
          </Text>
        </Text>

        {/* Link to web version */}
        <TouchableOpacity
          style={styles.webLink}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <Feather name="external-link" size={16} color={colors.accentPrimary} />
          <Text style={styles.webLinkText}>Voir la version web complète</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  paragraph: {
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
  link: {
    color: colors.accentPrimary,
    textDecorationLine: 'underline',
  },
  webLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  webLinkText: {
    ...typography.bodyMedium,
    color: colors.accentPrimary,
  },
});
