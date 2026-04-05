import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export interface MenuItem {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
}

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
}

export default function MenuModal({ visible, onClose, items }: MenuModalProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start();
      slideAnim.setValue(-12);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.menu,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Dark Mode Toggle Row */}
              <View style={[styles.menuItem, styles.menuItemBorder, { borderBottomColor: theme.border }]}>
                <View style={[styles.menuIconBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={styles.menuIcon}>{isDark ? '🌙' : '☀️'}</Text>
                </View>
                <View style={styles.menuTextBlock}>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>Dark Mode</Text>
                  <Text style={[styles.menuSublabel, { color: theme.textFaint }]}>
                    {isDark ? 'Switch to light' : 'Switch to dark'}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#CBD5E1', true: theme.accentDim }}
                  thumbColor={isDark ? theme.accent : '#FFFFFF'}
                  ios_backgroundColor="#CBD5E1"
                />
              </View>

              {/* Menu Items */}
              {items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.menuItem,
                    i < items.length - 1 && [styles.menuItemBorder, { borderBottomColor: theme.border }],
                    item.danger && { backgroundColor: theme.dangerDim },
                  ]}
                  onPress={() => { onClose(); item.onPress(); }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.menuIconBox,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    item.danger && { backgroundColor: theme.dangerDim, borderColor: theme.danger + '44' },
                  ]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuTextBlock}>
                    <Text style={[styles.menuLabel, { color: item.danger ? theme.danger : theme.text }]}>
                      {item.label}
                    </Text>
                    {item.sublabel && (
                      <Text style={[styles.menuSublabel, { color: theme.textFaint }]}>{item.sublabel}</Text>
                    )}
                  </View>
                  {!item.danger && <Text style={[styles.menuChevron, { color: theme.textFaint }]}>›</Text>}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 72 : 100,
    paddingRight: 16,
  },
  menu: {
    width: 256,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 16 },
  menuTextBlock: { flex: 1, gap: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  menuSublabel: { fontSize: 11 },
  menuChevron: { fontSize: 18, lineHeight: 22 },
});
