import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const show = useCallback(
    (message, type = 'info', duration = 2800) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message: String(message), type });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timerRef.current = setTimeout(hide, duration);
    },
    [hide, opacity]
  );

  const api = useMemo(
    () => ({
      show,
      success: (msg, duration) => show(msg, 'success', duration),
      error: (msg, duration) => show(msg, 'error', duration ?? 3500),
      info: (msg, duration) => show(msg, 'info', duration),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            toast.type === 'success' && styles.success,
            toast.type === 'error' && styles.error,
            toast.type === 'info' && styles.info,
            { opacity },
          ]}
        >
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 48,
    zIndex: 9999,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  success: { backgroundColor: colors.success },
  error: { backgroundColor: colors.danger },
  info: { backgroundColor: colors.toolMid },
  text: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 14 },
});
