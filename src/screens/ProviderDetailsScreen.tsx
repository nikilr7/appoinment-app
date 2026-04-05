import React from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

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

const SPECIALTY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Dental:           { bg: '#1A2E4A', text: '#79B8FF', dot: '#58A6FF' },
  Cardiology:       { bg: '#3D1A1A', text: '#FF7B72', dot: '#F85149' },
  'Skin Care':      { bg: '#3D2E1A', text: '#FFA657', dot: '#F0883E' },
  'Bone & Joint':   { bg: '#2E1A3D', text: '#D2A8FF', dot: '#BC8CFF' },
  Neurology:        { bg: '#1A3D2E', text: '#3DD68C', dot: '#3DD68C' },
  General:          { bg: '#2A2D35', text: '#8B949E', dot: '#6E7681' },
};

const STATS = [
  { label: 'Experience', icon: '◈', getValue: (p: any) => p.experience ?? '12 yrs' },
  { label: 'Patients',   icon: '◉', getValue: (_: any) => '1.2k+' },
  { label: 'Rating',     icon: '★', getValue: (p: any) => `${p.rating ?? 4.9}/5` },
  { label: 'Reviews',    icon: '◎', getValue: (p: any) => `${p.reviews ?? 128}` },
];

export default function ProviderDetailsScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const { provider } = route.params;
  const spec = SPECIALTY_COLORS[provider.category] ?? SPECIALTY_COLORS.General;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.heroTop}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: provider.image }} style={styles.avatar} />
              <View style={[styles.availDot, {
                backgroundColor: provider.available !== false ? theme.accent : theme.textFaint,
                borderColor: theme.card,
              }]} />
            </View>
            <View style={styles.heroInfo}>
              <View style={[styles.badge, { backgroundColor: spec.bg }]}>
                <View style={[styles.badgeDot, { backgroundColor: spec.dot }]} />
                <Text style={[styles.badgeText, { color: spec.text }]}>{provider.category}</Text>
              </View>
              <Text style={[styles.providerName, { color: theme.text }]}>{provider.name}</Text>
              <Text style={[styles.serviceLabel, { color: theme.textMuted }]}>{provider.service}</Text>
              <Text style={[styles.availLabel, { color: provider.available !== false ? theme.accent : theme.textFaint }]}>
                {provider.available !== false ? '● Available today' : '○ Unavailable'}
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={s.label} style={[styles.statItem, i < STATS.length - 1 && [styles.statBorder, { borderRightColor: theme.border }]]}>
                <Text style={[styles.statIcon, { color: theme.accent }]}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{s.getValue(provider)}</Text>
                <Text style={[styles.statLabel, { color: theme.textFaint }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>About</Text>
          <Text style={[styles.aboutText, { color: theme.textMuted }]}>
            {provider.name} is a highly experienced {provider.service} specializing in{' '}
            {provider.category}. Known for a patient-first approach, combining evidence-based
            treatment with compassionate care to deliver outstanding outcomes.
          </Text>
        </View>

        {/* Specializations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Specializations</Text>
          <View style={styles.tagsRow}>
            {['Consultation', 'Diagnosis', 'Treatment', 'Follow-up', 'Surgery'].map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.tagText, { color: theme.textMuted }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Contact Info</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {[
              { icon: '◎', label: 'Location',    value: 'Apollo Hospital, Bengaluru' },
              { icon: '◉', label: 'Phone',       value: '+91 98765 43210' },
              { icon: '◈', label: 'Working hrs', value: 'Mon – Fri, 9:00 AM – 6:00 PM' },
            ].map((row, i, arr) => (
              <View key={row.label}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoIcon, { color: theme.accent }]}>{row.icon}</Text>
                  <View style={styles.infoText}>
                    <Text style={[styles.infoLabel, { color: theme.textFaint }]}>{row.label}</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{row.value}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.accent }]}
          onPress={() => navigation.navigate('Booking', { provider })}
          activeOpacity={0.85}
        >
          <Text style={[styles.bookBtnText, { color: theme.accentText }]}>Book Appointment</Text>
          <Text style={[styles.bookArrow, { color: theme.accentText }]}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 24 },

  // Hero
  heroCard: { margin: 16, borderRadius: 20, borderWidth: 1, padding: 18 },
  heroTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  avatarWrapper: { position: 'relative', width: 86, height: 86 },
  avatar: { width: 86, height: 86, borderRadius: 22 },
  availDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: COLORS.card,
  },
  heroInfo: { flex: 1, gap: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  providerName: { fontSize: 20, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3 },
  serviceLabel: { fontSize: 13, color: COLORS.textMuted },
  availLabel: { fontSize: 12, fontWeight: '500' },

  divider: { height: 1, marginVertical: 16 },

  // Stats
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statBorder: { borderRightWidth: 1 },
  statIcon: { fontSize: 13, marginBottom: 1 },
  statValue: { fontSize: 15, fontWeight: '700' },
  statLabel: { fontSize: 11, letterSpacing: 0.3 },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  aboutText: { fontSize: 14, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 13, paddingVertical: 6, borderWidth: 1, borderRadius: 10 },
  tagText: { fontSize: 12, fontWeight: '500' },
  infoCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  infoIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  infoText: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '500' },
  infoDivider: { height: 1, marginLeft: 34 },
  footer: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16 },
  bookBtnText: { fontSize: 16, fontWeight: '700' },
  bookArrow: { fontSize: 18, fontWeight: '700' },
});
