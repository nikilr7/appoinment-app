import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const INFO_ITEMS = [
  { icon: '🏥', label: 'App Name',   value: 'MediBook' },
  { icon: '📱', label: 'Version',    value: '1.0.0' },
  { icon: '🎯', label: 'Purpose',    value: 'Seamless appointment booking with top-rated healthcare providers' },
  { icon: '👨‍💻', label: 'Developer',  value: 'Nikil' },
  { icon: '🛠',  label: 'Built With', value: 'React Native · TypeScript · AsyncStorage' },
  { icon: '📧', label: 'Contact',    value: 'support@medibook.app' },
];

export default function AboutScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroOrb, { backgroundColor: theme.accentDim, borderColor: theme.accent + '55' }]}>
            <Text style={styles.heroEmoji}>🏥</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>MediBook</Text>
          <Text style={[styles.heroSub, { color: theme.textMuted }]}>Your trusted healthcare companion</Text>
        </View>

        {/* Info Cards */}
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {INFO_ITEMS.map((item, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.infoIconBox, { backgroundColor: theme.card }]}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: theme.textFaint }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Mission */}
        <View style={[styles.missionCard, { backgroundColor: theme.accentDim, borderColor: theme.accent + '44' }]}>
          <Text style={[styles.missionTitle, { color: theme.accent }]}>Our Mission</Text>
          <Text style={[styles.missionBody, { color: theme.text }]}>
            We connect patients with the best healthcare providers, making it easy to book, manage,
            and track appointments — all from the palm of your hand.
          </Text>
        </View>

        <Text style={[styles.footer, { color: theme.textFaint }]}>© 2025 MediBook. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 48 },
  hero: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  heroOrb: { width: 80, height: 80, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  heroSub: { fontSize: 14 },
  section: { marginHorizontal: 20, borderRadius: 18, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 14 },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoIcon: { fontSize: 16 },
  infoText: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  missionCard: { marginHorizontal: 20, borderRadius: 18, borderWidth: 1, padding: 20, gap: 8, marginBottom: 24 },
  missionTitle: { fontSize: 15, fontWeight: '700' },
  missionBody: { fontSize: 14, lineHeight: 22 },
  footer: { textAlign: 'center', fontSize: 12, paddingBottom: 8 },
});
