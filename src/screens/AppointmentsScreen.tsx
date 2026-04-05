import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Animated, StatusBar, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { KEYS, Appointment, checkAndMoveExpired } from '../utils/appointmentUtils';
import { checkAndFireDueReminders } from '../utils/reminderUtils';

const ACCENT = '#6C63FF';
const GOLD   = '#F5C842';
const RED    = '#FF4757';

function isToday(appt: Appointment) {
  return new Date(appt.dayKey).toDateString() === new Date().toDateString();
}

function AppointmentCard({ item, index, onCancel }: { item: Appointment; index: number; onCancel: (id: string) => void }) {
  const { theme } = useTheme();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, tension: 200 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,     useNativeDriver: true, tension: 200 }).start();
  const handleCancelPress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(() => onCancel(item.id));
  };

  const today       = isToday(item);
  const statusColor = today ? GOLD : ACCENT;
  const statusBg    = today ? GOLD + '18' : ACCENT + '22';
  const statusLabel = today ? 'TODAY' : 'UPCOMING';
  const initials    = item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const dateLabel   = new Date(item.dayKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const reminderLabel = item.reminderMinutes != null
    ? (item.reminderMinutes === 60 ? '1 hr before' : `${item.reminderMinutes} min before`)
    : null;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View style={[styles.cardStripe, { backgroundColor: statusColor }]} />
        <View style={[styles.avatar, { backgroundColor: statusBg, borderColor: statusColor + '55' }]}>
          <Text style={[styles.avatarText, { color: statusColor }]}>{initials}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: statusBg }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={[styles.cardService, { color: theme.textMuted }]} numberOfLines={1}>{item.service}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.metaChip, { backgroundColor: theme.card }]}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.timeSlot}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: theme.card }]}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={[styles.metaText, { color: theme.textMuted }]}>{dateLabel}</Text>
            </View>
            {!item.notified && reminderLabel && (
              <View style={[styles.metaChip, { backgroundColor: theme.card }]}>
                <Text style={styles.metaIcon}>🔔</Text>
                <Text style={[styles.metaText, { color: theme.textMuted }]}>{reminderLabel}</Text>
              </View>
            )}
            {item.notified && (
              <View style={[styles.metaChip, { backgroundColor: theme.card }]}>
                <Text style={styles.metaIcon}>✅</Text>
                <Text style={[styles.metaText, { color: theme.textMuted }]}>Reminded</Text>
              </View>
            )}
          </View>
        </View>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: RED + '18', borderColor: RED + '33' }]}
            onPress={handleCancelPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.cancelIcon, { color: RED }]}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState() {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1,    duration: 1600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0.85, duration: 1600, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={styles.emptyWrapper}>
      <Animated.View style={[styles.emptyOrb, { backgroundColor: ACCENT + '22', transform: [{ scale: pulseAnim }] }]} />
      <Text style={styles.emptyEmoji}>🗓</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Appointments</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
        Your schedule is clear.{'\n'}Book an appointment to get started.
      </Text>
    </View>
  );
}

function HeaderStats({ total, todayCount }: { total: number; todayCount: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.statsRow}>
      <View style={[styles.statPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.statNum, { color: ACCENT }]}>{total}</Text>
        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Scheduled</Text>
      </View>
      <View style={[styles.statPill, { backgroundColor: GOLD + '18', borderColor: GOLD + '33' }]}>
        <Text style={[styles.statNum, { color: GOLD }]}>{todayCount}</Text>
        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Today</Text>
      </View>
    </View>
  );
}

export default function AppointmentsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAndCheck = useCallback(async () => {
    await checkAndFireDueReminders();
    const active = await checkAndMoveExpired();
    setAppointments(active);
  }, []);

  useFocusEffect(useCallback(() => {
    loadAndCheck();
    intervalRef.current = setInterval(loadAndCheck, 60000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadAndCheck]));

  const cancelAppointment = (id: string) => {
    Alert.alert('Cancel Appointment', 'This action cannot be undone.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel Appointment', style: 'destructive',
        onPress: async () => {
          const toCancel = appointments.find(a => a.id === id);
          if (toCancel?.notificationId) {
            const { cancelReminderNotification } = require('../utils/notificationUtils');
            await cancelReminderNotification(toCancel.id);
          }
          const updated = appointments.filter(item => item.id !== id);
          setAppointments(updated);
          await AsyncStorage.setItem(KEYS.ACTIVE, JSON.stringify(updated));
        },
      },
    ], { cancelable: true });
  };

  const todayCount = appointments.filter(isToday).length;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.headerEyebrow, { color: theme.textFaint }]}>DASHBOARD</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Appointments</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerAction, { backgroundColor: ACCENT + '22', borderColor: ACCENT + '44' }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={[styles.headerActionIcon, { color: ACCENT }]}>🕐</Text>
        </TouchableOpacity>
      </View>

      {appointments.length > 0 && <HeaderStats total={appointments.length} todayCount={todayCount} />}

      {appointments.length > 0 && (
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>SCHEDULED</Text>
          <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
        </View>
      )}

      <FlatList
        data={appointments}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <AppointmentCard item={item} index={index} onCancel={cancelAppointment} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <View style={[styles.bottomBar, { backgroundColor: theme.border, marginBottom: Platform.OS === 'ios' ? 34 : 16 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 },
  headerEyebrow: { fontSize: 10, letterSpacing: 3, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  headerAction: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerActionIcon: { fontSize: 20, lineHeight: 26 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 20 },
  statPill: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 26, fontWeight: '700', lineHeight: 30 },
  statLabel: { fontSize: 11, letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 14, gap: 10 },
  sectionLine: { flex: 1, height: StyleSheet.hairlineWidth },
  sectionLabel: { fontSize: 10, letterSpacing: 2.5, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, overflow: 'hidden', paddingRight: 16, minHeight: 88 },
  cardStripe: { width: 4, alignSelf: 'stretch', borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  avatar: { width: 46, height: 46, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 14, marginRight: 14 },
  avatarText: { fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  cardContent: { flex: 1, paddingVertical: 14, gap: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardName: { fontSize: 15, fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  cardService: { fontSize: 13, marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, gap: 4 },
  metaIcon: { fontSize: 10 },
  metaText: { fontSize: 11, letterSpacing: 0.3 },
  cancelBtn: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  cancelIcon: { fontSize: 12, fontWeight: '700' },
  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 60 },
  emptyOrb: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
  emptyEmoji: { fontSize: 52, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bottomBar: { height: 1, marginHorizontal: 24 },
});
