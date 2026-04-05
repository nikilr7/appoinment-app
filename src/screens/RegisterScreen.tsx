import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: NativeStackNavigationProp<any> };

function getPasswordStrength(pwd: string): { label: string; color: string } | null {
  if (!pwd) return null;
  if (pwd.length < 6) return { label: 'Weak', color: '#e74c3c' };
  if (pwd.length < 10) return { label: 'Medium', color: '#f39c12' };
  return { label: 'Strong', color: '#27ae60' };
}

export default function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const emailError = touched.email && !email ? 'Email is required' : '';
  const passwordError = touched.password && password.length > 0 && password.length < 6
    ? 'Password must be at least 6 characters' : '';
  const confirmError = touched.confirm && confirmPassword && password !== confirmPassword
    ? 'Passwords do not match' : '';

  const isDisabled = !email || !password || !confirmPassword || password !== confirmPassword || password.length < 6;

  const handleRegister = async () => {
    setTouched({ email: true, password: true, confirm: true });
    if (!email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    await AsyncStorage.setItem('user', JSON.stringify({ email, password }));
    setLoading(false);
    Toast.show({ type: 'success', text1: 'Account created!', text2: 'Please login to continue.' });
    setTimeout(() => navigation.navigate('Login'), 1500);
  };

  const s = makeStyles(theme);

  return (
    <View style={s.container}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <Text style={s.title}>Create Account</Text>

      <Text style={s.label}>Email</Text>
      <TextInput
        style={[s.input, !!emailError && s.inputError]}
        placeholder="Enter your email"
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {!!emailError && <Text style={s.errorText}>{emailError}</Text>}

      <Text style={s.label}>Password</Text>
      <View style={[s.inputRow, !!passwordError && s.inputError]}>
        <TextInput
          style={s.inputFlex}
          placeholder="Enter password"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched(t => ({ ...t, password: true }))}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={s.eyeBtn}>
          <Text style={s.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {!!passwordError && <Text style={s.errorText}>{passwordError}</Text>}
      {passwordStrength && (
        <Text style={[s.strengthText, { color: passwordStrength.color }]}>
          Password Strength: {passwordStrength.label}
        </Text>
      )}

      <Text style={s.label}>Retype Password</Text>
      <View style={[s.inputRow, !!confirmError && s.inputError]}>
        <TextInput
          style={s.inputFlex}
          placeholder="Confirm password"
          placeholderTextColor={theme.placeholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={s.eyeBtn}>
          <Text style={s.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {!!confirmError && <Text style={s.errorText}>{confirmError}</Text>}

      <TouchableOpacity
        style={[s.button, isDisabled && s.buttonDisabled]}
        onPress={handleRegister}
        disabled={isDisabled || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Register</Text>}
      </TouchableOpacity>

      <Text style={s.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? <Text style={s.linkBold}>Login</Text>
      </Text>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof import('../context/ThemeContext').useTheme>['theme']) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.bg },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: theme.text },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: theme.text },
    input: {
      borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 8,
      padding: 12, marginBottom: 4, fontSize: 15,
      backgroundColor: theme.inputBg, color: theme.inputText,
    },
    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderColor: theme.inputBorder,
      borderRadius: 8, marginBottom: 4,
      backgroundColor: theme.inputBg,
    },
    inputFlex: { flex: 1, padding: 12, fontSize: 15, color: theme.inputText },
    inputError: { borderColor: theme.danger },
    eyeBtn: { paddingHorizontal: 12 },
    eyeIcon: { fontSize: 18 },
    errorText: { color: theme.danger, fontSize: 12, marginBottom: 8 },
    strengthText: { fontSize: 12, marginBottom: 10 },
    button: {
      backgroundColor: theme.accent, borderRadius: 8,
      padding: 14, alignItems: 'center', marginTop: 16,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: theme.accentText, fontSize: 16, fontWeight: '600' },
    link: { marginTop: 20, textAlign: 'center', color: theme.textMuted },
    linkBold: { color: theme.accent, fontWeight: '600' },
  });
}
