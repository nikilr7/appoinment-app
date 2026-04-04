import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput as RNTextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

type Props = { navigation: NativeStackNavigationProp<any> };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const passwordRef = useRef<RNTextInput>(null);

  const emailError = touched.email && (!email ? 'Email is required' : !EMAIL_REGEX.test(email) ? 'Please enter a valid email' : '');
  const passwordError = touched.password && !password ? 'Password is required' : '';

  const isDisabled = !email || !password || !EMAIL_REGEX.test(email);

  const handleLogin = async () => {
    setTouched({ email: true, password: true });

    if (!email || !EMAIL_REGEX.test(email)) {
      Toast.show({ type: 'error', text1: 'Please enter a valid email' });
      return;
    }
    if (!password) {
      Toast.show({ type: 'error', text1: 'Password is required' });
      return;
    }

    setLoading(true);
    const stored = await AsyncStorage.getItem('user');

    if (!stored) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'No account found', text2: 'Please register first.' });
      return;
    }

    const user = JSON.parse(stored);
    if (user.email === email && user.password === password) {
      await AsyncStorage.setItem('loggedIn', 'true');
      setLoading(false);
      navigation.navigate('Home');
    } else {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Invalid email or password' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        onSubmitEditing={() => passwordRef.current?.focus()}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
      />
      {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={[styles.inputRow, passwordError ? styles.inputError : null]}>
        <TextInput
          ref={passwordRef}
          style={styles.inputFlex}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched(t => ({ ...t, password: true }))}
          secureTextEntry={!isPasswordVisible}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(v => !v)} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{isPasswordVisible ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isDisabled || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Don't have an account? <Text style={styles.linkBold}>Register</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 4, fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 4,
  },
  inputFlex: { flex: 1, padding: 12, fontSize: 15 },
  inputError: { borderColor: '#e74c3c' },
  eyeBtn: { paddingHorizontal: 12 },
  eyeIcon: { fontSize: 18 },
  errorText: { color: '#e74c3c', fontSize: 12, marginBottom: 8 },
  forgotText: { color: '#007AFF', textAlign: 'right', marginBottom: 16, marginTop: 4, fontSize: 13 },
  button: {
    backgroundColor: '#007AFF', borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  buttonDisabled: { backgroundColor: '#a0c4ff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 20, textAlign: 'center', color: '#555' },
  linkBold: { color: '#007AFF', fontWeight: '600' },
});
