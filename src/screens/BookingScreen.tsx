import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { KEYS, slotToDate } from '../utils/appointmentUtils';
import { loadReminderSettings, getReminderTime } from '../utils/reminderUtils';
import { scheduleReminderNotification, requestNotificationPermission } from '../utils/notificationUtils';

const SPECIALTY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Dental:         { bg: '#1A2E4A', text: '#79B8FF', dot: '#58A6FF' },
  Cardiology:     { bg: '#3D1A1A', text: '#FF7B72', dot: '#F85149' },
  'Skin Care':    { bg: '#3D2E1A', text: '#FFA657', dot: '#F0883E' },
  'Bone & Joint': { bg: '#2E1A3D', text: '#D2A8FF', dot: '#BC8CFF' },
  Neurology:      { bg: '#1A3D2E', text: '#3DD68C', dot: '#3DD68C' },
  General:        { bg: '#2A2D35', text: '#8B949E', dot: '#6E7681' },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toDateString(),
      label: i === 0 ? 'Today' : DAY_NAMES[d.getDay()],
      date: String(d.getDate()),
      dateObj: d,
    };
  });
}

const DAYS = generateDays();

const SLOT_GROUPS = [
  { period: 'Morning',   icon: '◑', slots: ['9:00 AM', '10:00 AM', '11:00 AM'] },
  { period: 'Afternoon', icon: '◐', slots: ['2:00 PM',  '3:00 PM',  '4:00 PM']  },
];

export default function BookingScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const { provider } = route.params;
  const spec = SPECIALTY_COLORS[provider.category] ?? SPECIALTY_COLORS.General;

  const [selectedDay, setSelectedDay] = useState(DAYS[0].key);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reminderLabel, setReminderLabel] = useState('30 mins before');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setCurrentTime(new Date()), 60000);
    loadReminderSettings().then(s => {
      if (!s.enabled) { setReminderLabel('Reminders off'); return; }
      setReminderLabel(s.minutesBefore === 60 ? '1 hr before' : `${s.minutesBefore} mins before`);
    });
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const selectedDayObj = DAYS.find(d => d.key === selectedDay);
  const selectedDayLabel = selectedDayObj;

  const isToday = selectedDayObj?.dateObj.toDateString() === new Date().toDateString();

  useEffect(() => {
    AsyncStorage.getItem(KEYS.ACTIVE).then(raw => {
      const all = raw ? JSON.parse(raw) : [];
      const taken = all
        .filter((a: any) => a.providerId === provider.id && a.dayKey === selectedDay)
        .map((a: any) => a.timeSlot);
      setBookedSlots(taken);
    });
  }, [selectedDay, provider.id]);

  const confirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('No slot selected', 'Please choose an available time slot to continue.');
      return;
    }
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(KEYS.ACTIVE);
      const appointments = raw ? JSON.parse(raw) : [];

      const alreadyBooked = appointments.some(
        (a: any) =>
          a.providerId === provider.id &&
          a.dayKey === selectedDay &&
          a.timeSlot === selectedSlot
      );

      if (alreadyBooked) {
        setBookedSlots(prev => [...prev, selectedSlot]);
        setSelectedSlot('');
        Alert.alert('Slot Unavailable', 'This time slot is already booked. Please choose another slot.');
        return;
      }

      const apptId = Date.now().toString();
      const reminderSettings = await loadReminderSettings();
      const newAppt: any = {
        id: apptId,
        providerId: provider.id,
        name: provider.name,
        service: provider.service,
        category: provider.category,
        image: provider.image,
        day: selectedDayLabel?.label,
        dayKey: selectedDay,
        timeSlot: selectedSlot,
        bookedAt: new Date().toISOString(),
        reminderMinutes: reminderSettings.minutesBefore,
        notified: false,
      };

      // Schedule push notification if reminders are enabled
      if (reminderSettings.enabled) {
        const reminderDate = getReminderTime(newAppt, reminderSettings.minutesBefore);
        newAppt.reminderTime = reminderDate.toISOString();
        if (reminderDate > new Date()) {
          await requestNotificationPermission();
          const notifId = await scheduleReminderNotification(
            apptId, provider.name, selectedSlot, reminderDate,
          );
          newAppt.notificationId = notifId;
        }
      }

      appointments.push(newAppt);
      await AsyncStorage.setItem(KEYS.ACTIVE, JSON.stringify(appointments));

      const reminderNote = reminderSettings.enabled
        ? `\nReminder set for ${reminderSettings.minutesBefore === 60 ? '1 hour' : `${reminderSettings.minutesBefore} minutes`} before.`
        : '';
      Alert.alert(
        'Booking Confirmed ✓',
        `Your appointment with ${provider.name} is set for ${selectedDayLabel?.label}, ${selectedSlot}.${reminderNote}`,
        [{ text: 'View Appointments', onPress: () => navigation.navigate('Appointments') }]
      );
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Provider Summary Card */}
        <View style={[styles.providerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
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
              <Text style={[styles.providerName, { color: theme.text }]}>{provider.name}</Text>
              <Text style={[styles.providerService, { color: theme.textMuted }]}>{provider.service}</Text>
            </View>
          </View>
        </View>

        {/* Day Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Select Day</Text>
          <View style={styles.daysRow}>
            {DAYS.map(d => {
              const active = selectedDay === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[
                    styles.dayCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    active && { backgroundColor: theme.accentDim, borderColor: theme.accent },
                  ]}
                  onPress={() => { setSelectedDay(d.key); setSelectedSlot(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayLabel, { color: theme.textFaint }, active && { color: theme.accent }]}>
                    {d.label}
                  </Text>
                  <Text style={[styles.dayDate, { color: theme.textMuted }, active && { color: theme.accent }]}>
                    {d.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slot Groups */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Select Time</Text>
          {SLOT_GROUPS.map(group => (
            <View key={group.period} style={styles.slotGroup}>
              <View style={styles.periodRow}>
                <Text style={[styles.periodIcon, { color: theme.textFaint }]}>{group.icon}</Text>
                <Text style={[styles.periodLabel, { color: theme.textFaint }]}>{group.period}</Text>
              </View>
              <View style={styles.slotsRow}>
                {group.slots.map(slot => {
                  const active = selectedSlot === slot;
                  const booked = bookedSlots.includes(slot);
                  const isPast = !booked && isToday && (() => {
                    const [timePart, meridiem] = slot.split(' ');
                    const [h, m] = timePart.split(':').map(Number);
                    const hours = meridiem === 'PM' && h !== 12 ? h + 12 : meridiem === 'AM' && h === 12 ? 0 : h;
                    const slotDT = new Date(); slotDT.setHours(hours, m, 0, 0);
                    return slotDT < currentTime;
                  })();
                  const disabled = booked || isPast;
                  const slotLabel = booked ? 'Booked' : isPast ? 'Past' : slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotBtn,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                        active && !disabled && { backgroundColor: theme.accentDim, borderColor: theme.accent },
                        disabled && { opacity: 0.4 },
                      ]}
                      onPress={() => { if (!disabled) setSelectedSlot(slot); }}
                      activeOpacity={disabled ? 1 : 0.7}
                      disabled={disabled}
                    >
                      <Text style={[
                        styles.slotText,
                        { color: theme.textMuted },
                        active && !disabled && { color: theme.accent, fontWeight: '700' },
                        disabled && { color: theme.textFaint, fontSize: 11, textTransform: 'uppercase' },
                      ]}>
                        {slotLabel}
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
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Booking Summary</Text>
            <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {[
                { label: 'Provider', value: provider.name },
                { label: 'Service',  value: provider.service },
                { label: 'Day',      value: `${selectedDayLabel?.label ?? '—'}, ${selectedDayObj?.date ?? ''}` },
                { label: 'Time',     value: selectedSlot },
                { label: '🔔 Reminder', value: reminderLabel },
              ].map((row, i, arr) => (
                <View key={row.label}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textFaint }]}>{row.label}</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{row.value}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />}
                </View>
              ))}
            </View>
          </View>
        ) : null}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        {!selectedSlot && (
          <Text style={[styles.footerHint, { color: theme.textFaint }]}>
            Choose a day and time slot to continue
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: theme.accent },
            (!selectedSlot || loading) && { backgroundColor: theme.accentDim, opacity: 0.5 },
          ]}
          onPress={confirmBooking}
          activeOpacity={0.85}
          disabled={!selectedSlot || loading}
        >
          <Text style={[styles.confirmBtnText, { color: theme.accentText }]}>
            {loading ? 'Confirming…' : 'Confirm Appointment'}
          </Text>
          {!loading && <Text style={[styles.confirmArrow, { color: theme.accentText }]}>→</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 24 },
  providerCard: { margin: 16, borderRadius: 18, borderWidth: 1, padding: 16 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  providerAvatar: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  providerInitials: { fontSize: 20, fontWeight: '700' },
  providerMeta: { flex: 1, gap: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  providerName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  providerService: { fontSize: 13 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  daysRow: { flexDirection: 'row', gap: 8 },
  dayCard: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderRadius: 14, gap: 4 },
  dayLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  dayDate: { fontSize: 18, fontWeight: '700' },
  slotGroup: { marginBottom: 16 },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  periodIcon: { fontSize: 13 },
  periodLabel: { fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  slotsRow: { flexDirection: 'row', gap: 10 },
  slotBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderRadius: 12 },
  slotText: { fontSize: 13, fontWeight: '500' },
  summaryCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  summaryDivider: { height: 1 },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18, borderTopWidth: 1, gap: 10 },
  footerHint: { fontSize: 12, textAlign: 'center', letterSpacing: 0.2 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16 },
  confirmBtnText: { fontSize: 16, fontWeight: '700' },
  confirmArrow: { fontSize: 18, fontWeight: '700' },
});
