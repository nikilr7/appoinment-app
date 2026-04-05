import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuModal from '../components/MenuModal';
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
  white: '#FFFFFF',
};

const SPECIALTY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Dental:       { bg: '#1A2E4A', text: '#79B8FF', dot: '#58A6FF' },
  Cardiology:   { bg: '#3D1A1A', text: '#FF7B72', dot: '#F85149' },
  'Skin Care':  { bg: '#3D2E1A', text: '#FFA657', dot: '#F0883E' },
  'Bone & Joint': { bg: '#2E1A3D', text: '#D2A8FF', dot: '#BC8CFF' },
  Neurology:    { bg: '#1A3D2E', text: '#3DD68C', dot: '#3DD68C' },
  General:      { bg: '#2A2D35', text: '#8B949E', dot: '#6E7681' },
};

const providers = [
  { id: '1', name: 'Dr. John Mitchell', service: 'Dentist', category: 'Dental',        image: 'https://i.pravatar.cc/100?img=1', rating: 4.9, reviews: 128, available: true,  experience: '12 yrs' },
  { id: '2', name: 'Dr. Sarah Smith',   service: 'Cardiologist', category: 'Cardiology', image: 'https://i.pravatar.cc/100?img=2', rating: 4.8, reviews: 203, available: true,  experience: '18 yrs' },
  { id: '3', name: 'Dr. Priya Nair',    service: 'Dermatologist', category: 'Skin Care', image: 'https://i.pravatar.cc/100?img=3', rating: 4.7, reviews: 94,  available: false, experience: '9 yrs'  },
  { id: '4', name: 'Dr. James Lee',     service: 'Orthopedic', category: 'Bone & Joint', image: 'https://i.pravatar.cc/100?img=4', rating: 4.6, reviews: 176, available: true,  experience: '15 yrs' },
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(providers.map(p => p.category)))];

function StarRating({ rating, theme }: { rating: number; theme: any }) {
  return (
    <View style={styles.starRow}>
      <Text style={styles.starIcon}>★</Text>
      <Text style={[styles.ratingText, { color: theme.text }]}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function ProviderCard({ item, onPress }: { item: typeof providers[0]; onPress: () => void }) {
  const { theme } = useTheme();
  const spec = SPECIALTY_COLORS[item.category] ?? SPECIALTY_COLORS.General;
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardInner}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: item.image }} style={styles.avatar} />
          <View style={[styles.availDot, { backgroundColor: item.available ? theme.accent : theme.textFaint, borderColor: theme.card }]} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.providerName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: spec.bg }]}>
              <View style={[styles.badgeDot, { backgroundColor: spec.dot }]} />
              <Text style={[styles.badgeText, { color: spec.text }]}>{item.category}</Text>
            </View>
          </View>
          <Text style={[styles.serviceLabel, { color: theme.textMuted }]}>{item.service}</Text>
          <View style={styles.cardMeta}>
            <StarRating rating={item.rating} theme={theme} />
            <Text style={[styles.metaDivider, { color: theme.textFaint }]}>·</Text>
            <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.reviews} reviews</Text>
            <Text style={[styles.metaDivider, { color: theme.textFaint }]}>·</Text>
            <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.experience}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.availText, { color: item.available ? theme.accent : theme.textFaint }]}>
              {item.available ? 'Available today' : 'Unavailable'}
            </Text>
            <View style={[styles.bookBtn, { backgroundColor: theme.accentDim, borderColor: theme.accent }]}>
              <Text style={[styles.bookBtnText, { color: theme.accent }]}>Book →</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProviderListScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedIn');
    navigation.navigate('Login');
  };

  const menuItems = [
    {
      icon: '🗓',
      label: 'Appointments',
      sublabel: 'View & manage bookings',
      onPress: () => navigation.navigate('Appointments'),
    },
    {
      icon: '🕐',
      label: 'History',
      sublabel: 'Past & completed appointments',
      onPress: () => navigation.navigate('History'),
    },
    {
      icon: '🔔',
      label: 'Reminder Settings',
      sublabel: 'Configure alert timing',
      onPress: () => navigation.navigate('ReminderSettings'),
    },
    {
      icon: 'ℹ️',
      label: 'About Us',
      sublabel: 'App info & developer',
      onPress: () => navigation.navigate('About'),
    },
    {
      icon: '🚪',
      label: 'Sign Out',
      onPress: handleLogout,
      danger: true,
    },
  ];

  const filtered = useMemo(() => {
    return providers.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.service.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />

      {/* Top Nav Bar */}
      <View style={[styles.navbar, { borderBottomColor: theme.border }]}>
        <View style={styles.navLeft}>
          <Text style={[styles.navEyebrow, { color: theme.textFaint }]}>Find your</Text>
          <Text style={[styles.navTitle, { color: theme.text }]}>Service Provider</Text>
        </View>
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuBtnIcon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.searchIcon, { color: theme.textFaint }]}>⌕</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search by name or specialty…"
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={[styles.clearIcon, { color: theme.textFaint }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Dropdown */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
      />

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {ALL_CATEGORIES.map(cat => {
          const active = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                active && { backgroundColor: theme.accentDim, borderColor: theme.accent },
              ]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterChipText,
                { color: theme.textMuted },
                active && { color: theme.accent },
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Result Count */}
      <View style={styles.resultRow}>
        <Text style={[styles.resultText, { color: theme.textFaint }]}>
          {filtered.length} provider{filtered.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Provider List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProviderCard
            item={item}
            onPress={() => navigation.navigate('Details', { provider: item })}
          />
        )}
        ListEmptyComponent={
          <View style={[styles.emptyState]}>
            <Text style={styles.emptyIcon}>⊘</Text>
            <Text style={[styles.emptyTitle, { color: theme.textMuted }]}>No providers found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textFaint }]}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Top Nav Bar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    marginBottom: 14,
  },
  navLeft: {
    flex: 1,
  },
  navEyebrow: {
    fontSize: 11,
    color: COLORS.textFaint,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnIcon: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 22,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    color: COLORS.textFaint,
    marginRight: 10,
    lineHeight: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textFaint,
    paddingLeft: 8,
  },

  // Filters
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 44,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.accent,
  },

  // Result count
  resultRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: COLORS.textFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  availDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.card,
  },

  // Card body
  cardBody: {
    flex: 1,
    gap: 5,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  providerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  serviceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
  },

  // Meta row
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
    gap: 2,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starIcon: {
    fontSize: 12,
    color: '#F0883E',
    lineHeight: 16,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  metaDivider: {
    fontSize: 12,
    color: COLORS.textFaint,
    marginHorizontal: 3,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Card footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  availText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookBtn: {
    backgroundColor: COLORS.accentDim,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 0.3,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 36,
    color: COLORS.textFaint,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textFaint,
  },
});
