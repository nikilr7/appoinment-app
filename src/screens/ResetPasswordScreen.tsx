import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, TextInput as RNTextInput, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: NativeStackNavigationProp<any> };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length <= 2) return email;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export default function ResetPasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [touched, setTouched] = useState({ email: false, otp: false, newPwd: false, confirmPwd: false });

  const otpRef = useRef<RNTextInput>(null);
  const newPwdRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const emailError = touched.email && (!email ? 'Email is required' : !EMAIL_REGEX.test(email) ? 'Enter a valid email' : '');
  const otpError = touched.otp && otp.length > 0 && otp.length < 4 ? 'OTP must be 4 digits' : '';
  const newPwdError = touched.newPwd && newPassword.length > 0 && newPassword.length < 6 ? 'Minimum 6 characters' : '';
  const confirmError = touched.confirmPwd && confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : '';

  const handleSendOtp = async () => {
    setTouched(t => ({ ...t, email: true }));
    if (!email || !EMAIL_REGEX.test(email)) {
      Toast.show({ type: 'error', text1: 'Enter a valid email' });
      return;
    }
    const stored = await AsyncStorage.getItem('user');
    if (!stored || JSON.parse(stored).email !== email) {
      Toast.show({ type: 'error', text1: 'No account found with this email' });
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setResendTimer(RESEND_SECONDS);
    // In production this would call an email API
    console.log(`[DEV] OTP for ${email}: ${code}`);
    Toast.show({ type: 'success', text1: 'OTP sent successfully', text2: `Sent to ${maskEmail(email)}` });
    setTimeout(() => otpRef.current?.focus(), 300);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtp('');
    setResendTimer(RESEND_SECONDS);
    console.log(`[DEV] Resent OTP for ${email}: ${code}`);
    Toast.show({ type: 'success', text1: 'OTP resent successfully' });
  };

  const handleResetPassword = async () => {
    setTouched({ email: true, otp: true, newPwd: true, confirmPwd: true });

    if (!otp || otp.length < 4) {
      Toast.show({ type: 'error', text1: 'Please enter the 4-digit OTP' });
      return;
    }
    if (otp !== generatedOtp) {
      Toast.show({ type: 'error', text1: 'Invalid OTP', text2: 'Please check and try again' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    const stored = await AsyncStorage.getItem('user');
    const user = JSON.parse(stored!);
    await AsyncStorage.setItem('user', JSON.stringify({ ...user, password: newPassword }));
    setLoading(false);

    Toast.show({ type: 'success', text1: 'Password reset successful!', text2: 'Please login with your new password.' });
    setTimeout(() => navigation.navigate('Login'), 1800);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { backgroundColor: theme.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Enter your email to receive an OTP</Text>

        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <View style={styles.emailRow}>
          <TextInput
            style={[styles.emailInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }, !!emailError && { borderColor: theme.danger }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.placeholder}
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            editable={!otpSent}
          />
          <TouchableOpacity
            style={[styles.otpBtn, { backgroundColor: theme.accent }, (!email || !EMAIL_REGEX.test(email)) && { opacity: 0.5 }]}
            onPress={handleSendOtp}
            disabled={!email || !EMAIL_REGEX.test(email)}
          >
            <Text style={[styles.otpBtnText, { color: theme.accentText }]}>{otpSent ? 'Resend' : 'Send OTP'}</Text>
          </TouchableOpacity>
        </View>
        {!!emailError && <Text style={[styles.errorText, { color: theme.danger }]}>{emailError}</Text>}

        {otpSent && (
          <>
            <Text style={[styles.maskedHint, { color: theme.accent }]}>OTP sent to {maskEmail(email)}</Text>

            <Text style={[styles.label, { color: theme.text }]}>Enter OTP</Text>
            <TextInput
              ref={otpRef}
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }, !!otpError && { borderColor: theme.danger }]}
              placeholder="4-digit OTP"
              placeholderTextColor={theme.placeholder}
              value={otp}
              onChangeText={v => setOtp(v.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => setTouched(t => ({ ...t, otp: true }))}
              keyboardType="number-pad"
              maxLength={4}
              returnKeyType="next"
              onSubmitEditing={() => newPwdRef.current?.focus()}
            />
            {!!otpError && <Text style={[styles.errorText, { color: theme.danger }]}>{otpError}</Text>}

            <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0}>
              <Text style={[styles.resendText, { color: theme.accent }, resendTimer > 0 && { color: theme.textFaint }]}>
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
            <PasswordInput
              ref={newPwdRef}
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              onBlur={() => setTouched(t => ({ ...t, newPwd: true }))}
              visible={showNew}
              onToggle={() => setShowNew(v => !v)}
              error={newPwdError || undefined}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <PasswordStrength password={newPassword} />

            <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
            <PasswordInput
              ref={confirmRef}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => setTouched(t => ({ ...t, confirmPwd: true }))}
              visible={showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
              error={confirmError || undefined}
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.accent }, (!otp || !newPassword || !confirmPassword) && { opacity: 0.5 }]}
              onPress={handleResetPassword}
              disabled={!otp || !newPassword || !confirmPassword || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: theme.accentText }]}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    borderRadius: 16, padding: 24, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 13, fontSize: 15, marginBottom: 4 },
  emailRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  emailInput: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 13, fontSize: 15 },
  otpBtn: { borderRadius: 10, paddingVertical: 13, paddingHorizontal: 14 },
  otpBtnText: { fontWeight: '600', fontSize: 13 },
  errorText: { fontSize: 12, marginBottom: 6, marginLeft: 2 },
  maskedHint: { fontSize: 12, marginBottom: 10, marginTop: 2 },
  resendText: { fontSize: 13, textAlign: 'right', marginBottom: 14 },
  resendDisabled: { },
  button: { borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  backBtn: { marginTop: 20, alignItems: 'center' },
  backText: { fontSize: 14 },
});
