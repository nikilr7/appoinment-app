import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type Props = { navigation: NativeStackNavigationProp<any> };

function getPasswordStrength(pwd: string): { label: string; color: string } | null {
  if (!pwd) return null;
  if (pwd.length < 6) return { label: 'Weak', color: '#e74c3c' };
  if (pwd.length < 10) return { label: 'Medium', color: '#f39c12' };
  return { label: 'Strong', color: '#27ae60' };
}

export default function RegisterScreen({ navigation }: Props) {
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

  const isDisabled =
    !email || !password || !confirmPassword ||
    password !== confirmPassword || password.length < 6;

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
      Toast.show({ type: 'error', text1: 'Password and Retype Password do not match' });
      return;
    }

    setLoading(true);
    await AsyncStorage.setItem('user', JSON.stringify({ email, password }));
    setLoading(false);

    Toast.show({ type: 'success', text1: 'Account created!', text2: 'Please login to continue.' });
    setTimeout(() => navigation.navigate('Login'), 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched(t => ({ ...t, password: true }))}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
      {passwordStrength && (
        <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
          Password Strength: {passwordStrength.label}
        </Text>
      )}

      {/* Confirm Password */}
      <Text style={styles.label}>Retype Password</Text>
      <View style={[styles.inputRow, confirmError ? styles.inputError : null]}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {!!confirmError && <Text style={styles.errorText}>{confirmError}</Text>}

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isDisabled || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? <Text style={styles.linkBold}>Login</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 4, fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    marginBottom: 4,
  },
  inputFlex: { flex: 1, padding: 12, fontSize: 15 },
  inputError: { borderColor: '#e74c3c' },
  eyeBtn: { paddingHorizontal: 12 },
  eyeIcon: { fontSize: 18 },
  errorText: { color: '#e74c3c', fontSize: 12, marginBottom: 8 },
  strengthText: { fontSize: 12, marginBottom: 10 },
  button: {
    backgroundColor: '#007AFF', borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 16,
  },
  buttonDisabled: { backgroundColor: '#a0c4ff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 20, textAlign: 'center', color: '#555' },
  linkBold: { color: '#007AFF', fontWeight: '600' },
});
