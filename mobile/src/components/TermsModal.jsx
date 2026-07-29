import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing } from '../theme';

const TermsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      const accepted = await AsyncStorage.getItem('termsAccepted');
      if (!accepted) setIsOpen(true);
    };
    check();
  }, []);

  const handleAccept = async () => {
    await AsyncStorage.setItem('termsAccepted', 'true');
    setIsOpen(false);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <ScrollView style={styles.body}>
            <Text style={styles.p}>Welcome to LoveBird Application!</Text>
            <Text style={styles.p}>By using this application, you agree to the following terms:</Text>
            <Text style={styles.li}>• You must be at least 13 years old to use this service.</Text>
            <Text style={styles.li}>• You are responsible for maintaining the security of your account.</Text>
            <Text style={styles.li}>• You will not use the service for any illegal or unauthorized purpose.</Text>
            <Text style={styles.li}>• We reserve the right to terminate accounts for violation of these terms.</Text>
            <Text style={styles.p}>Please read these terms carefully before using our service.</Text>
          </ScrollView>
          <Pressable style={styles.btn} onPress={handleAccept}>
            <Text style={styles.btnText}>I Accept</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  body: { marginBottom: spacing.md },
  p: { color: colors.text, marginBottom: spacing.sm, lineHeight: 22 },
  li: { color: colors.textMuted, marginBottom: 6, lineHeight: 20 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default TermsModal;
