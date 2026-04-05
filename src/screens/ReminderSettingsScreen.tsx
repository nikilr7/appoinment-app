import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Switch,
  StatusBar, ScrollView, Alert, TextInput, Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import {
  loadReminderSettings, saveReminderSettings,
  REMINDER_OPTIONS, ReminderSettings, DEFAULT_SETTINGS,
  isValidEmail, MAX_ADDITIONAL_EMAILS,
} from '../utils/reminderUtils';
import {
  requestNotificationPermission,
  scheduleReminderNotification,
  cancelReminderNotification,
} from '../utils/notificationUtils';
import { getReminderTime } from '../utils/reminderUtils';
import { KEYS, Appointment } from '../utils/appointmentUtils';

const ACCENT = '#6C63FF';
const RED    = '#FF4757';
const GREEN  = '#3DD68C';

export default function ReminderSettingsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [settings, setSettings]         = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [emailInput, setEmailInput]     = useState('');
  const [emailError, setEmailError]     = useState('');
  const [saving, setSaving]             = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => { loadReminderSettings().then(setSettings); }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddEmail = () => {
    const raw = emailInput.trim().toLowerCase();
    if (!raw) return;

    if (!isValidEmail(raw)) {
      setEmailError('Invalid email format.');
      return;
    }
    if (settings.additionalEmails.includes(raw)) {
      setEmailError('This email is already added.');
      return;
    }
    if (settings.additionalEmails.length >= MAX_ADDITIONAL_EMAILS) {
      setEmailError(`Maximum ${MAX_ADDITIONAL_EMAILS} additional emails allowed.`);
      return;
    }

    setSettings(prev => ({ ...prev, additionalEmails: [...prev.additionalEmails, raw] }));
    setEmailInput('');
    setEmailError('');
    Keyboard.dismiss();
  };

  const handleRemoveEmail = (email: string) => {
    setSettings(prev => ({
      ...prev,
      additionalEmails: prev.additionalEmails.filter(e => e !== email),
    }));
  };

  const handleEmailInputChange = (val: string) => {
    setEmailInput(val);
    if (emailError) setEmailError('');
  };

  /** Re-schedule all active appointments with the new reminder timing. */
  const rescheduleAll = async (newSettings: ReminderSettings) => {
    const raw = await AsyncStorage.getItem(KEYS.ACTIVE);
    const appointments: Appointment[] = raw ? JSON.parse(raw) : [];
    const updated: Appointment[] = [];

    for (const appt of appointments) {
      await cancelReminderNotification(appt.id);

      if (!newSettings.enabled || appt.notified) {
        updated.push({ ...appt, reminderMinutes: newSettings.minutesBefore, notificationId: undefined });
        continue;
      }

      const reminderDate = getReminderTime(appt, newSettings.minutesBefore);
      if (reminderDate > new Date()) {
        const notifId = await scheduleReminderNotification(
          appt.id, appt.name, appt.timeSlot, reminderDate,
        );
        updated.push({
          ...appt,
          reminderMinutes: newSettings.minutesBefore,
          reminderTime: reminderDate.toISOString(),
          notificationId: notifId,
          notified: false,
        });
      } else {
        updated.push({ ...appt, reminderMinutes: newSettings.minutesBefore, notificationId: undefined });
      }
    }

    await AsyncStorage.setItem(KEYS.ACTIVE, JSON.stringify(updated));
  };

  const handleSave = async () => {
    // Validate any unsaved text in the input field
    if (emailInput.trim()) {
      setEmailError('Press + to add the email before saving.');
      return;
    }

    setSaving(true);
    try {
      if (settings.enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive appointment reminders.',
          );
          setSaving(false);
          return;
        }
      }
      await saveReminderSettings(settings);
      await rescheduleAll(settings);
      Alert.alert('Saved ✓', 'Reminder settings updated for all upcoming appointments.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedOption  = REMINDER_OPTIONS.find(o => o.value === settings.minutesBefore);
  const canAddMore      = settings.additionalEmails.length < MAX_ADDITIONAL_EMAILS;
  const emailsCount     = settings.additionalEmails.length;

  // ── Render ────────────────────────────────────────────────────────────────

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
          <Text style={[styles.headerEyebrow, { color: theme.textFaint }]}>PREFERENCES</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Reminders</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Push Notification Toggle ── */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { backgroundColor: ACCENT + '22', borderColor: ACCENT + '44' }]}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Push Notifications</Text>
              <Text style={[styles.cardSub, { color: theme.textMuted }]}>
                {settings.enabled ? 'Appointment alerts enabled' : 'Notifications are off'}
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={val => setSettings(prev => ({ ...prev, enabled: val }))}
              trackColor={{ false: theme.border, true: ACCENT + '88' }}
              thumbColor={settings.enabled ? ACCENT : theme.textFaint}
              ios_backgroundColor={theme.border}
            />
          </View>
        </View>

        {/* ── Timing Options ── */}
        {settings.enabled && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>REMIND ME</Text>
            <View style={[styles.optionsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {REMINDER_OPTIONS.map((opt, i) => {
                const active = settings.minutesBefore === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionRow,
                      i < REMINDER_OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                    ]}
                    onPress={() => setSettings(prev => ({ ...prev, minutesBefore: opt.value }))}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioOuter, { borderColor: active ? ACCENT : theme.border }]}>
                      {active && <View style={[styles.radioInner, { backgroundColor: ACCENT }]} />}
                    </View>
                    <Text style={[styles.optionLabel, { color: active ? theme.text : theme.textMuted }, active && { fontWeight: '600' }]}>
                      {opt.label}
                    </Text>
                    {active && (
                      <View style={[styles.activeBadge, { backgroundColor: ACCENT + '22' }]}>
                        <Text style={[styles.activeBadgeText, { color: ACCENT }]}>
                          {opt.value === 30 ? 'DEFAULT' : 'SELECTED'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Email Reminders Toggle ── */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { backgroundColor: GREEN + '22', borderColor: GREEN + '44' }]}>
              <Text style={styles.iconText}>📧</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Email Reminders</Text>
              <Text style={[styles.cardSub, { color: theme.textMuted }]}>
                {settings.emailsEnabled
                  ? `Send to ${emailsCount} additional recipient${emailsCount !== 1 ? 's' : ''}`
                  : 'Send reminder emails to extra recipients'}
              </Text>
            </View>
            <Switch
              value={settings.emailsEnabled}
              onValueChange={val => setSettings(prev => ({ ...prev, emailsEnabled: val }))}
              trackColor={{ false: theme.border, true: GREEN + '88' }}
              thumbColor={settings.emailsEnabled ? GREEN : theme.textFaint}
              ios_backgroundColor={theme.border}
            />
          </View>
        </View>

        {/* ── Additional Emails Section ── */}
        {settings.emailsEnabled && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>ADDITIONAL EMAILS</Text>
              <Text style={[styles.emailCount, { color: emailsCount >= MAX_ADDITIONAL_EMAILS ? RED : theme.textFaint }]}>
                {emailsCount}/{MAX_ADDITIONAL_EMAILS}
              </Text>
            </View>

            {/* Input Row */}
            <View style={[
              styles.inputRow,
              { backgroundColor: theme.surface, borderColor: emailError ? RED : theme.border },
            ]}>
              <Text style={[styles.inputIcon, { color: theme.textFaint }]}>@</Text>
              <TextInput
                ref={inputRef}
                style={[styles.emailInput, { color: theme.text }]}
                placeholder="Enter email address"
                placeholderTextColor={theme.textFaint}
                value={emailInput}
                onChangeText={handleEmailInputChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleAddEmail}
                editable={canAddMore}
              />
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  { backgroundColor: canAddMore ? ACCENT : theme.border },
                ]}
                onPress={handleAddEmail}
                disabled={!canAddMore}
                activeOpacity={0.8}
              >
                <Text style={[styles.addBtnText, { color: canAddMore ? '#fff' : theme.textFaint }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Validation Error */}
            {!!emailError && (
              <Text style={[styles.errorText, { color: RED }]}>⚠ {emailError}</Text>
            )}

            {/* Capacity hint */}
            {!canAddMore && !emailError && (
              <Text style={[styles.hintText, { color: theme.textFaint }]}>
                Maximum {MAX_ADDITIONAL_EMAILS} additional emails reached.
              </Text>
            )}

            {/* Saved Email Chips */}
            {settings.additionalEmails.length > 0 && (
              <View style={[styles.emailListCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {settings.additionalEmails.map((email, i) => (
                  <View
                    key={email}
                    style={[
                      styles.emailChipRow,
                      i < settings.additionalEmails.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                    ]}
                  >
                    <View style={[styles.emailDot, { backgroundColor: GREEN }]} />
                    <Text style={[styles.emailChipText, { color: theme.text }]} numberOfLines={1}>
                      {email}
                    </Text>
                    <TouchableOpacity
                      style={[styles.removeBtn, { backgroundColor: RED + '18', borderColor: RED + '33' }]}
                      onPress={() => handleRemoveEmail(email)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.removeBtnText, { color: RED }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Empty state */}
            {settings.additionalEmails.length === 0 && (
              <View style={[styles.emptyEmailBox, { borderColor: theme.border }]}>
                <Text style={[styles.emptyEmailText, { color: theme.textFaint }]}>
                  No additional recipients added yet.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Info Card ── */}
        <View style={[styles.infoCard, { backgroundColor: theme.accentDim, borderColor: theme.accent + '44' }]}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            {settings.enabled
              ? `Push notification ${selectedOption?.label ?? ''}.${settings.emailsEnabled && emailsCount > 0 ? ` Email sent to ${emailsCount} recipient${emailsCount !== 1 ? 's' : ''}.` : ''} Saving reschedules all bookings.`
              : 'Enable push notifications or email reminders to stay on top of your appointments.'}
          </Text>
        </View>
      </ScrollView>

      {/* ── Save Button ── */}
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: ACCENT }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Settings'}</Text>
          {!saving && <Text style={styles.saveBtnArrow}>→</Text>}
        </TouchableOpacity>
      </View>
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
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },

  // Cards
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20 },
  cardText: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 12 },

  // Section
  section: { gap: 10 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  emailCount: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Timing options
  optionsCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { flex: 1, fontSize: 15 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  // Email input
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52, gap: 10 },
  inputIcon: { fontSize: 16, fontWeight: '700' },
  emailInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  addBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 22, lineHeight: 26, fontWeight: '300' },
  errorText: { fontSize: 12, paddingLeft: 4 },
  hintText: { fontSize: 12, paddingLeft: 4 },

  // Email list
  emailListCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  emailChipRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  emailDot: { width: 7, height: 7, borderRadius: 4 },
  emailChipText: { flex: 1, fontSize: 14 },
  removeBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 11, fontWeight: '700' },
  emptyEmailBox: { borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', paddingVertical: 20, alignItems: 'center' },
  emptyEmailText: { fontSize: 13 },

  // Info
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: { fontSize: 18, marginTop: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },

  // Footer
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, borderTopWidth: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  saveBtnArrow: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
