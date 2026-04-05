import React, { forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  visible: boolean;
  onToggle: () => void;
  error?: string;
};

const PasswordInput = forwardRef<TextInput, Props>(({ visible, onToggle, error, style, ...props }, ref) => (
  <View>
    <View style={[styles.row, error ? styles.errorBorder : styles.normalBorder, style as any]}>
      <TextInput
        ref={ref}
        style={styles.input}
        secureTextEntry={!visible}
        placeholderTextColor="#aaa"
        {...props}
      />
      <TouchableOpacity onPress={onToggle} style={styles.eye}>
        <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁️'}</Text>
      </TouchableOpacity>
    </View>
    {!!error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

export default PasswordInput;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10, marginBottom: 4,
    backgroundColor: '#f9f9f9',
  },
  normalBorder: { borderColor: '#ddd' },
  errorBorder: { borderColor: '#e74c3c' },
  input: { flex: 1, padding: 13, fontSize: 15, color: '#222' },
  eye: { paddingHorizontal: 13 },
  eyeIcon: { fontSize: 18 },
  errorText: { color: '#e74c3c', fontSize: 12, marginBottom: 8, marginLeft: 2 },
});
