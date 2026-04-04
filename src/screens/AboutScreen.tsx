import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';

const COLORS = {
  bg: '#0D1117',
  surface: '#161B22',
  card: '#1C2230',
  border: '#2D3548',
  accent: '#3DD68C',
  accentDim: '#1A3D2E',
  text: '#E6EDF3',
  textMuted: '#8B949E',
  textFaint: '#484F58',
};

const INFO_ITEMS = [
  { icon: '🏥', label: 'App Name', value: 'MediBook' },
  { icon: '📱', label: 'Version', value: '1.0.0' },
  { icon: '🎯', label: 'Purpose', value: 'Seamless appointment booking with top-rated healthcare providers' },
  { icon: '👨‍💻', label: 'Developer', value: 'Nikil' },
  { icon: '🛠', label: 'Built With', value: 'React Native · TypeScript · AsyncStorage' },
  { icon: '📧', label: 'Contact', value: 'support@medibook.app' },
];

export default function AboutScreen({ navigation }: any) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroOrb}>
            <Text style={styles.heroEmoji}>🏥</Text>
          </View>
          <Text style={styles.heroTitle}>MediBook</Text>
          <Text style={styles.heroSub}>Your trusted healthcare companion</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          {INFO_ITEMS.map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionBody}>
            We connect patients with the best healthcare providers, making it easy to book, manage,
            and track appointments — all from the palm of your hand.
          </Text>
        </View>

        <Text style={styles.footer}>© 2025 MediBook. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  content: {
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  heroOrb: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: COLORS.accent + '55',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroEmoji: { fontSize: 36 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  section: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: { fontSize: 16 },
  infoText: { flex: 1, gap: 2 },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  missionCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.accentDim,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
    padding: 20,
    gap: 8,
    marginBottom: 24,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
  },
  missionBody: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textFaint,
    paddingBottom: 8,
  },
});
