import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  bg: '#0D1117',
  surface: '#161B22',
  card: '#1C2230',
  border: '#2D3548',
  accent: '#3DD68C',
  accentDim: '#1A3D2E',
  accentText: '#0D1117',
  text: '#E6EDF3',
  textMuted: '#8B949E',
  textFaint: '#484F58',
  danger: '#F85149',
  dangerDim: '#3D1A1A',
};

const SPECIALTY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Dental:           { bg: '#1A2E4A', text: '#79B8FF', dot: '#58A6FF' },
  Cardiology:       { bg: '#3D1A1A', text: '#FF7B72', dot: '#F85149' },
  'Skin Care':      { bg: '#3D2E1A', text: '#FFA657', dot: '#F0883E' },
  'Bone & Joint':   { bg: '#2E1A3D', text: '#D2A8FF', dot: '#BC8CFF' },
  Neurology:        { bg: '#1A3D2E', text: '#3DD68C', dot: '#3DD68C' },
  General:          { bg: '#2A2D35', text: '#8B949E', dot: '#6E7681' },
};

const DAYS = [
  { key: 'mon', label: 'Mon', date: '5' },
  { key: 'tue', label: 'Tue', date: '6' },
  { key: 'wed', label: 'Wed', date: '7' },
  { key: 'thu', label: 'Thu', date: '8' },
  { key: 'fri', label: 'Fri', date: '9' },
];

const SLOT_GROUPS = [
  {
    period: 'Morning',
    icon: '◑',
    slots: ['9:00 AM', '10:00 AM', '11:00 AM'],
  },
  {
    period: 'Afternoon',
    icon: '◐',
    slots: ['2:00 PM', '3:00 PM', '4:00 PM'],
  },
];

export default function BookingScreen({ route, navigation }: any) {
  const { provider } = route.params;
  const spec = SPECIALTY_COLORS[provider.category] ?? SPECIALTY_COLORS.General;

  const [selectedDay, setSelectedDay] = useState('mon');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const selectedDayLabel = DAYS.find(d => d.key === selectedDay);

  useEffect(() => {
    AsyncStorage.getItem('appointments').then(raw => {
      const all = raw ? JSON.parse(raw) : [];
      const dayLabel = DAYS.find(d => d.key === selectedDay)?.label ?? '';
      const taken = all
        .filter((a: any) => a.providerId === provider.id && a.day === dayLabel)
        .map((a: any) => a.timeSlot);
      setBookedSlots(taken);
    });
  }, [selectedDay, provider.id]);

  const handleDayChange = (key: string) => {
    setSelectedDay(key);
    setSelectedSlot('');
  };

  const confirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('No slot selected', 'Please choose an available time slot to continue.');
      return;
    }
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem('appointments');
      const appointments = raw ? JSON.parse(raw) : [];

      // Re-check availability before saving
      const alreadyBooked = appointments.some(
        (a: any) =>
          a.providerId === provider.id &&
          a.day === selectedDayLabel?.label &&
          a.timeSlot === selectedSlot
      );

      if (alreadyBooked) {
        setBookedSlots(prev => [...prev, selectedSlot]);
        setSelectedSlot('');
        Alert.alert(
          'Slot Unavailable',
          'This time slot is already booked. Please choose another slot.'
        );
        return;
      }

      appointments.push({
        id: Date.now().toString(),
        providerId: provider.id,
        name: provider.name,
        service: provider.service,
        category: provider.category,
        image: provider.image,
        day: selectedDayLabel?.label,
        timeSlot: selectedSlot,
        bookedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
      Alert.alert(
        'Booking Confirmed ✓',
        `Your appointment with ${provider.name} is set for ${selectedDayLabel?.label}, ${selectedSlot}.`,
        [{ text: 'View Appointments', onPress: () => navigation.navigate('Appointments') }]
      );
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />



      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Provider Summary Card */}
        <View style={styles.providerCard}>
          <View style={styles.providerRow}>
            <View style={[styles.providerAvatar, { backgroundColor: spec.bg }]}>
              <Text style={[styles.providerInitials, { color: spec.text }]}>
                {provider.name.split(' ').slice(-1)[0]?.[0] ?? 'D'}
              </Text>
            </View>
            <View style={styles.providerMeta}>
              <View style={[styles.badge, { backgroundColor: spec.bg }]}>
                <View style={[styles.badgeDot, { backgroundColor: spec.dot }]} />
                <Text style={[styles.badgeText, { color: spec.text }]}>{provider.category}</Text>
              </View>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerService}>{provider.service}</Text>
            </View>
          </View>
        </View>

        {/* Day Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Day</Text>
          <View style={styles.daysRow}>
            {DAYS.map(d => {
              const active = selectedDay === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayCard, active && styles.dayCardActive]}
                  onPress={() => handleDayChange(d.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{d.label}</Text>
                  <Text style={[styles.dayDate, active && styles.dayDateActive]}>{d.date}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slot Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          {SLOT_GROUPS.map(group => (
            <View key={group.period} style={styles.slotGroup}>
              <View style={styles.periodRow}>
                <Text style={styles.periodIcon}>{group.icon}</Text>
                <Text style={styles.periodLabel}>{group.period}</Text>
              </View>
              <View style={styles.slotsRow}>
                {group.slots.map(slot => {
                  const active = selectedSlot === slot;
                  const booked = bookedSlots.includes(slot);
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotBtn,
                        active && styles.slotBtnActive,
                        booked && styles.slotBtnBooked,
                      ]}
                      onPress={() => !booked && setSelectedSlot(slot)}
                      activeOpacity={booked ? 1 : 0.7}
                      disabled={booked}
                    >
                      <Text style={[
                        styles.slotText,
                        active && styles.slotTextActive,
                        booked && styles.slotTextBooked,
                      ]}>
                        {booked ? 'Booked' : slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Booking Summary */}
        {selectedSlot ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryCard}>
              {[
                { label: 'Provider',  value: provider.name },
                { label: 'Service',   value: provider.service },
                { label: 'Day',       value: selectedDayLabel?.label ?? '—' },
                { label: 'Time',      value: selectedSlot },
              ].map((row, i, arr) => (
                <View key={row.label}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{row.label}</Text>
                    <Text style={styles.summaryValue}>{row.value}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.summaryDivider} />}
                </View>
              ))}
            </View>
          </View>
        ) : null}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        {!selectedSlot && (
          <Text style={styles.footerHint}>Choose a day and time slot to continue</Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, (!selectedSlot || loading) && styles.confirmBtnDisabled]}
          onPress={confirmBooking}
          activeOpacity={0.85}
          disabled={!selectedSlot || loading}
        >
          <Text style={styles.confirmBtnText}>
            {loading ? 'Confirming…' : 'Confirm Appointment'}
          </Text>
          {!loading && <Text style={styles.confirmArrow}>→</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },



  scroll: { paddingBottom: 24 },

  // Provider Card
  providerCard: {
    margin: 16,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  providerAvatar: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  providerInitials: { fontSize: 20, fontWeight: '700' },
  providerMeta: { flex: 1, gap: 4 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  providerName: { fontSize: 16, fontWeight: '700', color: COLORS.text, letterSpacing: -0.2 },
  providerService: { fontSize: 13, color: COLORS.textMuted },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: COLORS.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },

  // Day Selector
  daysRow: { flexDirection: 'row', gap: 8 },
  dayCard: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, gap: 4,
  },
  dayCardActive: { backgroundColor: COLORS.accentDim, borderColor: COLORS.accent },
  dayLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textFaint, letterSpacing: 0.3 },
  dayLabelActive: { color: COLORS.accent },
  dayDate: { fontSize: 18, fontWeight: '700', color: COLORS.textMuted },
  dayDateActive: { color: COLORS.accent },

  // Slot Groups
  slotGroup: { marginBottom: 16 },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  periodIcon: { fontSize: 13, color: COLORS.textFaint },
  periodLabel: { fontSize: 13, color: COLORS.textFaint, fontWeight: '500', letterSpacing: 0.3 },
  slotsRow: { flexDirection: 'row', gap: 10 },
  slotBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
  },
  slotBtnActive: { backgroundColor: COLORS.accentDim, borderColor: COLORS.accent },
  slotBtnBooked: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    opacity: 0.45,
  },
  slotText: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  slotTextActive: { color: COLORS.accent, fontWeight: '700' },
  slotTextBooked: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textFaint,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  summaryLabel: { fontSize: 13, color: COLORS.textFaint },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  summaryDivider: { height: 1, backgroundColor: COLORS.border },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
    gap: 10,
  },
  footerHint: {
    fontSize: 12,
    color: COLORS.textFaint,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 16,
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.accentDim,
    opacity: 0.5,
  },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.accentText },
  confirmArrow: { fontSize: 18, fontWeight: '700', color: COLORS.accentText },
});
