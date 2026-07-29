import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { colors } from '../theme';
import styles from './LoginModal.styles';

const LoginModal = () => {
  const {
    authModalVisible,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    register,
    forgotPassword,
  } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleClose = () => {
    reset();
    closeAuthModal();
  };

  const onLogin = async (data) => {
    setSubmitting(true);
    const result = await login(data.email, data.password);
    setSubmitting(false);
    if (result.success) {
      toast.success('Logged in successfully');
      handleClose();
    } else toast.error(String(result.error));
  };

  const onSignup = async (data) => {
    setSubmitting(true);
    const result = await register(data.name, data.email, data.password);
    setSubmitting(false);
    if (result.success) {
      toast.success('Account created');
      handleClose();
    } else toast.error(String(result.error));
  };

  const onForgot = async (data) => {
    setSubmitting(true);
    const result = await forgotPassword(data.email);
    setSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      setAuthModalMode('login');
    } else {
      toast.error(String(result.error));
    }
  };

  const title =
    authModalMode === 'signup'
      ? 'Sign Up'
      : authModalMode === 'forgot'
        ? 'Forgot Password'
        : 'Login';

  return (
    <Modal visible={authModalVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.card}>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {authModalMode === 'signup' && (
              <>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: 'Name is required' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Name"
                      placeholderTextColor={colors.textMuted}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
              </>
            )}

            <Controller
              control={control}
              name="email"
              rules={{ required: 'Email is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

            {authModalMode !== 'forgot' && (
              <>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength:
                      authModalMode === 'signup'
                        ? { value: 6, message: 'Minimum 6 characters' }
                        : undefined,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
              </>
            )}

            <Pressable
              style={[styles.submit, submitting && styles.submitDisabled]}
              disabled={submitting}
              onPress={handleSubmit(
                authModalMode === 'signup'
                  ? onSignup
                  : authModalMode === 'forgot'
                    ? onForgot
                    : onLogin
              )}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>
                  {authModalMode === 'signup'
                    ? 'Sign Up'
                    : authModalMode === 'forgot'
                      ? 'Send Reset Link'
                      : 'Login'}
                </Text>
              )}
            </Pressable>

            {authModalMode === 'login' && (
              <>
                <Pressable onPress={() => setAuthModalMode('signup')}>
                  <Text style={styles.link}>Don&apos;t have an account? Sign Up</Text>
                </Pressable>
                <Pressable onPress={() => setAuthModalMode('forgot')}>
                  <Text style={styles.link}>Forgot Password?</Text>
                </Pressable>
              </>
            )}
            {authModalMode === 'signup' && (
              <Pressable onPress={() => setAuthModalMode('login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
              </Pressable>
            )}
            {authModalMode === 'forgot' && (
              <Pressable onPress={() => setAuthModalMode('login')}>
                <Text style={styles.link}>Back to Login</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LoginModal;
