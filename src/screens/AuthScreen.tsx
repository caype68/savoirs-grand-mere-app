// ============================================
// AUTH SCREEN — Écran de connexion obligatoire
// L'utilisateur doit créer un compte ou se connecter
// avant d'accéder à l'application
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { logo } from '../assets';

const { width } = Dimensions.get('window');

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { login, register, loginWithGoogle, resetPassword, updatePassword } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoverySessionReady, setRecoverySessionReady] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Détecter le mode récupération de mot de passe (lien depuis email)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      // Supabase ajoute le token dans le hash ou les query params
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        console.log('[AuthScreen] Recovery mode detected from URL');
        setIsRecoveryMode(true);

        // Si on a un access_token dans le hash, la session peut être établie
        if (hash.includes('access_token')) {
          // Essayer de récupérer/établir la session depuis le hash
          const { getSupabaseClient } = require('../services/supabase/config');
          const client = getSupabaseClient();
          if (client) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              }).then(() => {
                console.log('[AuthScreen] Session established from URL tokens');
                setRecoverySessionReady(true);
              }).catch((e: any) => {
                console.warn('[AuthScreen] setSession error:', e);
              });
            }
          }
        }
      }
    }

    // Écouter l'événement PASSWORD_RECOVERY de Supabase
    const { getSupabaseClient } = require('../services/supabase/config');
    const client = getSupabaseClient();
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(
        (event: string, _session: any) => {
          console.log('[AuthScreen] Auth event:', event);
          if (event === 'PASSWORD_RECOVERY') {
            console.log('[AuthScreen] PASSWORD_RECOVERY event → session ready');
            setIsRecoveryMode(true);
            setRecoverySessionReady(true);
          }
        }
      );
      return () => subscription?.unsubscribe();
    }
  }, []);

  // Animation du logo
  const logoAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, { toValue: -8, duration: 2000, useNativeDriver: false }),
        Animated.timing(logoAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === 'register') {
        const result = await register({
          email: email.trim(),
          password,
          displayName: name.trim() || email.split('@')[0],
        });
        if (result.success) {
          onAuthSuccess();
        } else {
          setError(translateError(result.error));
        }
      } else {
        const result = await login({
          email: email.trim(),
          password,
        });
        if (result.success) {
          onAuthSuccess();
        } else {
          setError(translateError(result.error));
        }
      }
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailToReset = resetEmail.trim() || email.trim();
    if (!emailToReset) {
      setError('Entrez votre adresse email pour réinitialiser votre mot de passe');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const result = await resetPassword(emailToReset);
      if (result.success) {
        setSuccessMsg(`Un email de réinitialisation a été envoyé à ${emailToReset}`);
        setShowForgotPassword(false);
      } else {
        setError(translateError(result.error));
      }
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.success) {
        setSuccessMsg('Mot de passe mis à jour ! Connectez-vous avec votre nouveau mot de passe.');
        setIsRecoveryMode(false);
        setRecoverySessionReady(false);
        // Nettoyer l'URL
        if (Platform.OS === 'web') {
          window.history.replaceState({}, '', window.location.pathname);
        }
        // Pré-remplir le mode connexion pour faciliter
        setAuthMode('login');
        setPassword('');
      } else {
        setError(translateError(result.error));
      }
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Traduction des erreurs Supabase en français
  const translateError = (err?: string): string => {
    if (!err) return 'Une erreur est survenue';
    if (err.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.';
    if (err.includes('Email not confirmed')) return 'Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail ou recréez un compte.';
    if (err.includes('User already registered')) return 'Un compte existe déjà avec cet email. Essayez de vous connecter.';
    if (err.includes('Email not confirmed')) return 'Vérifiez votre boîte mail pour confirmer votre compte.';
    if (err.includes('Password should be')) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (err.includes('rate limit')) return 'Trop de tentatives. Réessayez dans quelques minutes.';
    if (err.includes('Backend non configuré')) return 'Service indisponible. Réessayez plus tard.';
    if (err.includes('network') || err.includes('fetch')) return 'Erreur de connexion. Vérifiez votre connexion internet.';
    return err;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header avec logo */}
            <View style={styles.header}>
              <Animated.View style={{ transform: [{ translateY: logoAnim }] }}>
                <Image source={logo} style={styles.logo} />
              </Animated.View>
              <Text style={styles.appName}>Savoirs de Grand-Mère</Text>
              <Text style={styles.tagline}>Remèdes traditionnels & naturels</Text>
            </View>

            {/* Card principale */}
            <View style={styles.card}>
              {isRecoveryMode ? (
                <>
                  <Text style={styles.cardTitle}>Nouveau mot de passe</Text>
                  <Text style={styles.cardSubtitle}>
                    Choisissez un nouveau mot de passe pour votre compte
                  </Text>

                  {!recoverySessionReady && (
                    <View style={styles.successBox}>
                      <ActivityIndicator size="small" color="#818CF8" />
                      <Text style={[styles.successText, { color: '#818CF8' }]}>
                        Vérification du lien en cours...
                      </Text>
                    </View>
                  )}

                  {/* Nouveau mot de passe */}
                  <View style={styles.inputContainer}>
                    <Feather name="lock" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Nouveau mot de passe (min. 6 caractères)"
                      placeholderTextColor={colors.textMuted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Confirmation */}
                  <View style={styles.inputContainer}>
                    <Feather name="check-circle" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirmer le mot de passe"
                      placeholderTextColor={colors.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleUpdatePassword}
                    />
                  </View>

                  {/* Erreur / Succès */}
                  {successMsg && (
                    <View style={styles.successBox}>
                      <Feather name="check-circle" size={14} color="#34D399" />
                      <Text style={styles.successText}>{successMsg}</Text>
                    </View>
                  )}
                  {error && (
                    <View style={styles.errorBox}>
                      <Feather name="alert-circle" size={14} color="#F87171" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  {/* Bouton valider */}
                  <TouchableOpacity
                    style={[styles.submitBtn, (isLoading || !recoverySessionReady) && styles.submitBtnDisabled]}
                    onPress={handleUpdatePassword}
                    disabled={isLoading || !recoverySessionReady}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#92400E', '#B45309', '#D97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Feather name="save" size={18} color="#fff" />
                          <Text style={styles.submitText}>Enregistrer le mot de passe</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 16 }}
                    onPress={() => {
                      setIsRecoveryMode(false);
                      if (Platform.OS === 'web') {
                        window.history.replaceState({}, '', window.location.pathname);
                      }
                    }}
                  >
                    <Text style={styles.forgotText}>Retour à la connexion</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
              <Text style={styles.cardTitle}>
                {authMode === 'register' ? 'Créer votre compte' : 'Bon retour !'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {authMode === 'register'
                  ? 'Rejoignez la communauté et sauvegardez vos remèdes favoris'
                  : 'Connectez-vous pour retrouver vos données'}
              </Text>

              {/* Toggle login / register */}
              <View style={styles.toggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, authMode === 'register' && styles.toggleBtnActive]}
                  onPress={() => { setAuthMode('register'); setError(null); }}
                >
                  <Text style={[styles.toggleText, authMode === 'register' && styles.toggleTextActive]}>
                    Inscription
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, authMode === 'login' && styles.toggleBtnActive]}
                  onPress={() => { setAuthMode('login'); setError(null); }}
                >
                  <Text style={[styles.toggleText, authMode === 'login' && styles.toggleTextActive]}>
                    Connexion
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Champ nom (inscription) */}
              {authMode === 'register' && (
                <View style={styles.inputContainer}>
                  <Feather name="user" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Votre prénom"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              {/* Email */}
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Adresse email"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              {/* Mot de passe */}
              <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mot de passe (min. 6 caractères)"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Mot de passe oublié (mode connexion) */}
              {authMode === 'login' && !showForgotPassword && (
                <TouchableOpacity
                  onPress={() => { setShowForgotPassword(true); setResetEmail(email); setError(null); setSuccessMsg(null); }}
                  style={styles.forgotBtn}
                >
                  <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
              )}

              {/* Formulaire mot de passe oublié */}
              {showForgotPassword && (
                <View style={styles.forgotBox}>
                  <Text style={styles.forgotTitle}>Réinitialiser le mot de passe</Text>
                  <Text style={styles.forgotSubtitle}>Un email vous sera envoyé avec un lien pour créer un nouveau mot de passe.</Text>
                  <View style={styles.inputContainer}>
                    <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Votre adresse email"
                      placeholderTextColor={colors.textMuted}
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.forgotActions}>
                    <TouchableOpacity
                      style={styles.forgotCancelBtn}
                      onPress={() => { setShowForgotPassword(false); setError(null); }}
                    >
                      <Text style={styles.forgotCancelText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.forgotSendBtn, isLoading && { opacity: 0.6 }]}
                      onPress={handleForgotPassword}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.forgotSendText}>Envoyer le lien</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Message de succès */}
              {successMsg && (
                <View style={styles.successBox}>
                  <Feather name="check-circle" size={14} color="#34D399" />
                  <Text style={styles.successText}>{successMsg}</Text>
                </View>
              )}

              {/* Erreur */}
              {error && (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={14} color="#F87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Bouton submit */}
              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#92400E', '#B45309', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather
                        name={authMode === 'register' ? 'user-plus' : 'log-in'}
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.submitText}>
                        {authMode === 'register' ? 'Créer mon compte' : 'Se connecter'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Séparateur */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Bouton Google */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={async () => {
                  setError(null);
                  setSuccessMsg(null);
                  const result = await loginWithGoogle();
                  if (result.success) {
                    // La redirection Google se fait automatiquement
                    // onAuthStateChange détectera le retour
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.googleBtnContent}>
                  <View style={styles.googleLogoContainer}>
                    <Text style={styles.googleLogoG}>G</Text>
                  </View>
                  <Text style={styles.googleBtnText}>
                    Continuer avec Google
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sécurité */}
              <View style={styles.securityRow}>
                <Feather name="shield" size={14} color={colors.textMuted} />
                <Text style={styles.securityText}>
                  Données chiffrées et sécurisées
                </Text>
              </View>
                </>
              )}
            </View>

            {/* Features */}
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Feather name="heart" size={16} color="#F472B6" />
                </View>
                <Text style={styles.featureText}>Sauvegardez vos favoris</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Feather name="bar-chart-2" size={16} color="#60A5FA" />
                </View>
                <Text style={styles.featureText}>Suivez votre bien-être</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Feather name="award" size={16} color="#FBBF24" />
                </View>
                <Text style={styles.featureText}>Débloquez des badges</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: colors.accentPrimary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.cardBackground || '#1A1A2E',
    borderRadius: borderRadius.xl || 20,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.accentPrimary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
  forgotBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  forgotTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  forgotSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  forgotActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  forgotCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  forgotCancelText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  forgotSendBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
  },
  forgotSendText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    fontSize: 13,
    color: '#34D399',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#F87171',
    flex: 1,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  googleBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  googleLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleLogoG: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  securityText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
