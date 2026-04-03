import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const TERMS_URL = 'https://savoirs-de-grand-mere.netlify.app/terms';

export const TermsOfUseScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Dernière mise à jour : 24 mars 2025</Text>

        <Text style={styles.sectionTitle}>1. Objet</Text>
        <Text style={styles.paragraph}>
          Les présentes conditions générales d'utilisation (ci-après « CGU ») régissent l'accès
          et l'utilisation de l'application mobile « Savoirs de Grand-Mère » (ci-après « l'Application »).
          En téléchargeant ou en utilisant l'Application, vous acceptez ces CGU dans leur intégralité.
        </Text>

        <Text style={styles.sectionTitle}>2. Description du service</Text>
        <Text style={styles.paragraph}>
          L'Application propose un répertoire de remèdes traditionnels et de savoirs ancestraux
          issus de livres anciens numérisés tombés dans le domaine public. Elle offre également
          un journal de bien-être, des recommandations personnalisées et un système de suivi
          de progression.
        </Text>

        <Text style={styles.sectionTitle}>3. Avertissement médical</Text>
        <View style={styles.warningCard}>
          <Feather name="alert-triangle" size={20} color={colors.warning} />
          <Text style={styles.warningText}>Avertissement important</Text>
        </View>
        <Text style={styles.paragraph}>
          Les informations présentées dans l'Application sont fournies à titre informatif et
          documentaire uniquement. Elles proviennent de sources historiques et ne constituent
          en aucun cas un avis médical, un diagnostic ou un traitement.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>L'Application ne remplace pas une consultation médicale.</Text>{' '}
          En cas de problème de santé, consultez toujours un professionnel de santé qualifié.
          Certaines plantes peuvent avoir des contre-indications ou des interactions médicamenteuses.
        </Text>

        <Text style={styles.sectionTitle}>4. Compte utilisateur</Text>
        <Text style={styles.paragraph}>
          L'Application peut être utilisée sans inscription (mode local). La création d'un compte
          (optionnelle) permet la synchronisation de vos données entre appareils. Vous êtes
          responsable de la confidentialité de vos identifiants de connexion.
        </Text>

        <Text style={styles.sectionTitle}>5. Propriété intellectuelle</Text>
        <Text style={styles.paragraph}>
          Les remèdes présentés sont issus de livres du domaine public. Le design, le code,
          les textes originaux et la compilation de l'Application sont protégés par le droit
          d'auteur. Toute reproduction non autorisée est interdite.
        </Text>

        <Text style={styles.sectionTitle}>6. Liens affiliés</Text>
        <Text style={styles.paragraph}>
          L'Application peut contenir des liens affiliés vers des sites marchands (notamment Amazon).
          Ces liens nous permettent de percevoir une commission en cas d'achat, sans surcoût
          pour l'utilisateur. La présence de ces liens est identifiée dans l'interface.
        </Text>

        <Text style={styles.sectionTitle}>7. Limitation de responsabilité</Text>
        <Text style={styles.paragraph}>
          L'Application est fournie « en l'état ». Nous ne garantissons pas l'exactitude,
          l'exhaustivité ou la pertinence des informations présentées. En aucun cas nous ne
          pourrons être tenus responsables de dommages directs ou indirects résultant de
          l'utilisation de l'Application ou des remèdes présentés.
        </Text>

        <Text style={styles.sectionTitle}>8. Disponibilité</Text>
        <Text style={styles.paragraph}>
          Nous nous efforçons d'assurer la disponibilité de l'Application. Toutefois, nous
          ne garantissons pas un accès ininterrompu et nous nous réservons le droit de
          suspendre ou d'interrompre le service pour maintenance ou mise à jour.
        </Text>

        <Text style={styles.sectionTitle}>9. Données personnelles</Text>
        <Text style={styles.paragraph}>
          Le traitement de vos données personnelles est régi par notre{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            Politique de confidentialité
          </Text>
          , qui fait partie intégrante des présentes CGU.
        </Text>

        <Text style={styles.sectionTitle}>10. Modification des CGU</Text>
        <Text style={styles.paragraph}>
          Nous nous réservons le droit de modifier les présentes CGU. Les modifications
          entreront en vigueur dès leur publication dans l'Application. L'utilisation
          continue de l'Application après modification vaut acceptation des nouvelles CGU.
        </Text>

        <Text style={styles.sectionTitle}>11. Droit applicable</Text>
        <Text style={styles.paragraph}>
          Les présentes CGU sont soumises au droit français. Tout litige relatif à
          l'interprétation ou à l'exécution des présentes CGU sera soumis aux tribunaux
          compétents.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact</Text>
        <Text style={styles.paragraph}>
          Pour toute question relative aux présentes CGU, contactez-nous à :{'\n'}
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
          onPress={() => Linking.openURL(TERMS_URL)}
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningText: {
    ...typography.bodyMedium,
    color: colors.warning,
    fontWeight: '600',
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
