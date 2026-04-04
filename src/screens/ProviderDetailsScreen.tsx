import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
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
  const { provider } = route.params;
  const spec = SPECIALTY_COLORS[provider.category] ?? SPECIALTY_COLORS.General;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />



      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: provider.image }} style={styles.avatar} />
              <View style={[
                styles.availDot,
                { backgroundColor: provider.available !== false ? COLORS.accent : COLORS.textFaint }
              ]} />
            </View>

            <View style={styles.heroInfo}>
              <View style={[styles.badge, { backgroundColor: spec.bg }]}>
                <View style={[styles.badgeDot, { backgroundColor: spec.dot }]} />
                <Text style={[styles.badgeText, { color: spec.text }]}>{provider.category}</Text>
              </View>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.serviceLabel}>{provider.service}</Text>
              <Text style={[
                styles.availLabel,
                { color: provider.available !== false ? COLORS.accent : COLORS.textFaint }
              ]}>
                {provider.available !== false ? '● Available today' : '○ Unavailable'}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={s.label} style={[styles.statItem, i < STATS.length - 1 && styles.statBorder]}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statValue}>{s.getValue(provider)}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {provider.name} is a highly experienced {provider.service} specializing in{' '}
            {provider.category}. Known for a patient-first approach, combining evidence-based
            treatment with compassionate care to deliver outstanding outcomes.
          </Text>
        </View>

        {/* Specializations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.tagsRow}>
            {['Consultation', 'Diagnosis', 'Treatment', 'Follow-up', 'Surgery'].map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Info</Text>
          <View style={styles.infoCard}>
            {[
              { icon: '◎', label: 'Location',    value: 'Apollo Hospital, Bengaluru' },
              { icon: '◉', label: 'Phone',       value: '+91 98765 43210' },
              { icon: '◈', label: 'Working hrs', value: 'Mon – Fri, 9:00 AM – 6:00 PM' },
            ].map((row, i, arr) => (
              <View key={row.label}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>{row.icon}</Text>
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={styles.infoDivider} />}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Bottom CTA — navigates to the dedicated BookingScreen */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('Booking', { provider })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>Book Appointment</Text>
          <Text style={styles.bookArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },



  scroll: { paddingBottom: 24 },

  // Hero
  heroCard: {
    margin: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
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

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },

  // Stats
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statBorder: { borderRightWidth: 1, borderRightColor: COLORS.border },
  statIcon: { fontSize: 13, color: COLORS.accent, marginBottom: 1 },
  statValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textFaint, letterSpacing: 0.3 },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  aboutText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
  },
  tagText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },

  // Contact Info Card
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  infoIcon: { fontSize: 16, color: COLORS.accent, width: 20, textAlign: 'center' },
  infoText: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 11, color: COLORS.textFaint, letterSpacing: 0.3, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  infoDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 34 },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#0D1117' },
  bookArrow: { fontSize: 18, fontWeight: '700', color: '#0D1117' },
});
