import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar,
  TextInput as RNTextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: NativeStackNavigationProp<any> };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
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

  const s = makeStyles(theme);

  return (
    <View style={s.container}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <Text style={s.title}>Welcome Back</Text>
      <Text style={s.subtitle}>Login to your account</Text>

      <Text style={s.label}>Email</Text>
      <TextInput
        style={[s.input, !!emailError && s.inputError]}
        placeholder="Enter your email"
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        onSubmitEditing={() => passwordRef.current?.focus()}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="next"
      />
      {!!emailError && <Text style={s.errorText}>{emailError}</Text>}

      <Text style={s.label}>Password</Text>
      <View style={[s.inputRow, !!passwordError && s.inputError]}>
        <TextInput
          ref={passwordRef}
          style={s.inputFlex}
          placeholder="Enter your password"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched(t => ({ ...t, password: true }))}
          secureTextEntry={!isPasswordVisible}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(v => !v)} style={s.eyeBtn}>
          <Text style={s.eyeIcon}>{isPasswordVisible ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {!!passwordError && <Text style={s.errorText}>{passwordError}</Text>}

      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={s.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.button, isDisabled && s.buttonDisabled]}
        onPress={handleLogin}
        disabled={isDisabled || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Login</Text>}
      </TouchableOpacity>

      <Text style={s.link} onPress={() => navigation.navigate('Register')}>
        Don't have an account? <Text style={s.linkBold}>Register</Text>
      </Text>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof import('../context/ThemeContext').useTheme>['theme']) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.bg },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, color: theme.text },
    subtitle: { fontSize: 14, color: theme.textMuted, textAlign: 'center', marginBottom: 28 },
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
    forgotText: { color: theme.accent, textAlign: 'right', marginBottom: 16, marginTop: 4, fontSize: 13 },
    button: {
      backgroundColor: theme.accent, borderRadius: 8,
      padding: 14, alignItems: 'center', marginTop: 4,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: theme.accentText, fontSize: 16, fontWeight: '600' },
    link: { marginTop: 20, textAlign: 'center', color: theme.textMuted },
    linkBold: { color: theme.accent, fontWeight: '600' },
  });
}
