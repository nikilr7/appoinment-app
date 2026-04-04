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
  red: '#FF4757',
  redDim: '#3D1A1E',
};

interface MenuItem {
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
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.menuItem,
                    i < items.length - 1 && styles.menuItemBorder,
                    item.danger && styles.menuItemDanger,
                  ]}
                  onPress={() => { onClose(); item.onPress(); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBox, item.danger && styles.menuIconBoxDanger]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuTextBlock}>
                    <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                      {item.label}
                    </Text>
                    {item.sublabel && (
                      <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                    )}
                  </View>
                  {!item.danger && <Text style={styles.menuChevron}>›</Text>}
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
    width: 240,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  menuItemDanger: {
    backgroundColor: COLORS.redDim,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconBoxDanger: {
    backgroundColor: COLORS.redDim,
    borderColor: COLORS.red + '44',
  },
  menuIcon: { fontSize: 16 },
  menuTextBlock: { flex: 1, gap: 1 },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuLabelDanger: {
    color: COLORS.red,
  },
  menuSublabel: {
    fontSize: 11,
    color: COLORS.textFaint,
  },
  menuChevron: {
    fontSize: 18,
    color: COLORS.textFaint,
    lineHeight: 22,
  },
});
