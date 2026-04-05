import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Animated, StatusBar, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { KEYS, Appointment, checkAndMoveExpired } from '../utils/appointmentUtils';

const PURPLE = '#6C63FF';
const GREY   = '#8B949E';

type Filter = 'All' | 'Today' | 'Completed';
const FILTERS: Filter[] = ['All', 'Today', 'Completed'];

function isToday(appt: Appointment) {
  return new Date(appt.dayKey).toDateString() === new Date().toDateString();
}

function HistoryCard({ item, index }: { item: Appointment; index: number }) {
  const { theme } = useTheme();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const initials  = item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const dateLabel = new Date(item.dayKey).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const expiredOn = item.expiredAt
    ? new Date(item.expiredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, opacity: 0.75 }]}>
        <View style={[styles.cardStripe, { backgroundColor: GREY }]} />
        <View style={[styles.avatar, { backgroundColor: GREY + '22', borderColor: GREY + '55' }]}>
          <Text style={[styles.avatarText, { color: GREY }]}>{initials}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: GREY + '22' }]}>
              <Text style={[styles.badgeText, { color: GREY }]}>COMPLETED</Text>
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
            {expiredOn && (
              <View style={[styles.metaChip, { backgroundColor: theme.card }]}>
                <Text style={styles.metaIcon}>✓</Text>
                <Text style={[styles.metaText, { color: theme.textMuted }]}>Done {expiredOn}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const { theme } = useTheme();
  return (
    <View style={styles.emptyWrapper}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No History</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
        {filter === 'Today'
          ? 'No appointments completed today.'
          : 'Completed appointments will appear here.'}
      </Text>
    </View>
  );
}

export default function HistoryScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [history, setHistory] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Filter>('All');

  const load = useCallback(async () => {
    await checkAndMoveExpired();
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    setHistory(raw ? JSON.parse(raw) : []);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = history.filter(appt => {
    if (filter === 'Today') return isToday(appt);
    return true; // 'All' and 'Completed' show everything (all history is completed)
  });

  // Sort newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: theme.text }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerEyebrow, { color: theme.textFaint }]}>RECORDS</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>History</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: PURPLE + '22', borderColor: PURPLE + '44' }]}>
          <Text style={[styles.countText, { color: PURPLE }]}>{history.length}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                active && { backgroundColor: PURPLE + '22', borderColor: PURPLE },
              ]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, { color: theme.textMuted }, active && { color: PURPLE, fontWeight: '700' }]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section divider */}
      {sorted.length > 0 && (
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            {sorted.length} RECORD{sorted.length !== 1 ? 'S' : ''}
          </Text>
          <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
        </View>
      )}

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState filter={filter} />}
        renderItem={({ item, index }) => <HistoryCard item={item} index={index} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <View style={[styles.bottomBar, { backgroundColor: theme.border, marginBottom: Platform.OS === 'ios' ? 34 : 16 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, gap: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  backIcon: { fontSize: 26, lineHeight: 30, marginTop: -2 },
  headerText: { flex: 1 },
  headerEyebrow: { fontSize: 10, letterSpacing: 3, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  countBadge: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  countText: { fontSize: 16, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 20 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '500' },
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
  emptyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bottomBar: { height: 1, marginHorizontal: 24 },
});
