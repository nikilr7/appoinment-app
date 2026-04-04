import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// ─── Token System ───────────────────────────────────────────────────────────
const COLORS = {
  bg:           '#0A0B0F',
  surface:      '#12141A',
  surfaceHigh:  '#1C1F2A',
  border:       '#252836',
  borderBright: '#333750',
  accent:       '#6C63FF',
  accentSoft:   '#6C63FF22',
  accentGlow:   '#6C63FF44',
  gold:         '#F5C842',
  goldSoft:     '#F5C84218',
  red:          '#FF4757',
  redSoft:      '#FF475718',
  textPrimary:  '#F0F2FF',
  textSecond:   '#8B8FA8',
  textMuted:    '#50546B',
  white:        '#FFFFFF',
};

const FONTS = Platform.select({
  ios: {
    display:  { fontFamily: 'Georgia', fontWeight: '700' as const },
    heading:  { fontFamily: 'Georgia', fontWeight: '600' as const },
    body:     { fontFamily: 'Helvetica Neue', fontWeight: '400' as const },
    label:    { fontFamily: 'Helvetica Neue', fontWeight: '600' as const },
    mono:     { fontFamily: 'Courier New', fontWeight: '500' as const },
  },
  android: {
    display:  { fontFamily: 'serif', fontWeight: '700' as const },
    heading:  { fontFamily: 'serif', fontWeight: '600' as const },
    body:     { fontFamily: 'sans-serif', fontWeight: '400' as const },
    label:    { fontFamily: 'sans-serif-medium', fontWeight: '600' as const },
    mono:     { fontFamily: 'monospace', fontWeight: '500' as const },
  },
  default: {
    display:  { fontFamily: 'serif', fontWeight: '700' as const },
    heading:  { fontFamily: 'serif', fontWeight: '600' as const },
    body:     { fontFamily: 'sans-serif', fontWeight: '400' as const },
    label:    { fontFamily: 'sans-serif-medium', fontWeight: '600' as const },
    mono:     { fontFamily: 'monospace', fontWeight: '500' as const },
  },
})!;

// ─── Types ───────────────────────────────────────────────────────────────────
interface Appointment {
  id: string;
  name: string;
  service: string;
  timeSlot: string;
  date?: string;
  status?: 'upcoming' | 'today' | 'completed';
}

// ─── Animated Card ───────────────────────────────────────────────────────────
function AppointmentCard({
  item,
  index,
  onCancel,
}: {
  item: Appointment;
  index: number;
  onCancel: (id: string) => void;
}) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, tension: 200 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200 }).start();
  };

  const handleCancelPress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onCancel(item.id));
  };

  const isToday = item.status === 'today';
  const statusColor = isToday ? COLORS.gold : COLORS.accent;
  const statusBg    = isToday ? COLORS.goldSoft : COLORS.accentSoft;
  const statusLabel = isToday ? 'TODAY' : 'UPCOMING';

  // Extract initials
  const initials = item.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Left accent stripe */}
        <View style={[styles.cardStripe, { backgroundColor: statusColor }]} />

        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: statusBg, borderColor: statusColor + '55' }]}>
          <Text style={[styles.avatarText, { color: statusColor }]}>{initials}</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: statusBg }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>

          <Text style={styles.cardService} numberOfLines={1}>{item.service}</Text>

          <View style={styles.cardMeta}>
            <View style={styles.metaChip}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaText}>{item.timeSlot}</Text>
            </View>
            {item.date && (
              <View style={styles.metaChip}>
                <Text style={styles.metaIcon}>📅</Text>
                <Text style={styles.metaText}>{item.date}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cancel button */}
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.cancelIcon}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
  const pulseAnim = useRef(new Animated.Value(0.85)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.emptyWrapper}>
      <Animated.View style={[styles.emptyOrb, { transform: [{ scale: pulseAnim }] }]} />
      <Text style={styles.emptyEmoji}>🗓</Text>
      <Text style={styles.emptyTitle}>No Appointments</Text>
      <Text style={styles.emptySubtitle}>
        Your schedule is clear.{'\n'}Book an appointment to get started.
      </Text>
    </View>
  );
}

// ─── Header Stats ─────────────────────────────────────────────────────────────
function HeaderStats({ count }: { count: number }) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statPill}>
        <Text style={styles.statNum}>{count}</Text>
        <Text style={styles.statLabel}>Scheduled</Text>
      </View>
      <View style={[styles.statPill, styles.statPillAccent]}>
        <Text style={[styles.statNum, { color: COLORS.gold }]}>
          {count > 0 ? '1' : '0'}
        </Text>
        <Text style={styles.statLabel}>Today</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointments = async () => {
    const data = await AsyncStorage.getItem('appointments');
    setAppointments(data ? JSON.parse(data) : []);
  };

  useFocusEffect(useCallback(() => { loadAppointments(); }, []));

  const cancelAppointment = (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'This action cannot be undone.',
      [
        {
          text: 'Keep it',
          style: 'cancel',
        },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: async () => {
            const updated = appointments.filter((item) => item.id !== id);
            setAppointments(updated);
            await AsyncStorage.setItem('appointments', JSON.stringify(updated));
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>DASHBOARD</Text>
          <Text style={styles.headerTitle}>My Appointments</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Text style={styles.headerActionIcon}>⊕</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {appointments.length > 0 && <HeaderStats count={appointments.length} />}

      {/* Section label */}
      {appointments.length > 0 && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionLabel}>SCHEDULED</Text>
          <View style={styles.sectionLine} />
        </View>
      )}

      {/* List */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <AppointmentCard
            item={item}
            index={index}
            onCancel={cancelAppointment}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* Bottom rule */}
      <View style={styles.bottomBar} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 20,
  },
  headerEyebrow: {
    ...FONTS.label,
    fontSize: 10,
    letterSpacing: 3,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  headerTitle: {
    ...FONTS.display,
    fontSize: 28,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionIcon: {
    fontSize: 22,
    color: COLORS.accent,
    lineHeight: 26,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  statPillAccent: {
    borderColor: COLORS.gold + '33',
    backgroundColor: COLORS.goldSoft,
  },
  statNum: {
    ...FONTS.display,
    fontSize: 26,
    color: COLORS.accent,
    lineHeight: 30,
  },
  statLabel: {
    ...FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  sectionLabel: {
    ...FONTS.label,
    fontSize: 10,
    letterSpacing: 2.5,
    color: COLORS.textMuted,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    paddingRight: 16,
    minHeight: 88,
  },
  cardStripe: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    marginRight: 14,
  },
  avatarText: {
    ...FONTS.label,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 14,
    gap: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardName: {
    ...FONTS.heading,
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    ...FONTS.label,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  cardService: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textSecond,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  metaIcon: {
    fontSize: 10,
  },
  metaText: {
    ...FONTS.mono,
    fontSize: 11,
    color: COLORS.textSecond,
    letterSpacing: 0.3,
  },

  // Cancel
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: COLORS.red + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cancelIcon: {
    fontSize: 12,
    color: COLORS.red,
    fontWeight: '700',
  },

  // Empty
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.accentSoft,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 20,
  },
  emptyTitle: {
    ...FONTS.display,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Bottom
  bottomBar: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 24,
    marginBottom: Platform.OS === 'ios' ? 34 : 16,
  },
});
