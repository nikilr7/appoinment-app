import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, KEYS, slotToDate } from './appointmentUtils';
import { showImmediateReminder } from './notificationUtils';

const REMINDER_SETTINGS_KEY = 'REMINDER_SETTINGS';

export const MAX_ADDITIONAL_EMAILS = 3;

export interface ReminderSettings {
  enabled: boolean;
  minutesBefore: number;       // 10 | 30 | 60
  emailsEnabled: boolean;      // send email reminders
  additionalEmails: string[];  // up to MAX_ADDITIONAL_EMAILS extra recipients
}

export const REMINDER_OPTIONS = [
  { label: '10 minutes before', value: 10 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before',     value: 60 },
];

export const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  minutesBefore: 30,
  emailsEnabled: false,
  additionalEmails: [],
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const raw = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  // Deduplicate and lowercase before saving
  const unique = [...new Set(settings.additionalEmails.map(e => e.trim().toLowerCase()))];
  await AsyncStorage.setItem(
    REMINDER_SETTINGS_KEY,
    JSON.stringify({ ...settings, additionalEmails: unique }),
  );
}

/** Returns the reminder trigger Date for a given appointment and minutesBefore. */
export function getReminderTime(appt: Appointment, minutesBefore: number): Date {
  const apptTime = slotToDate(appt.dayKey, appt.timeSlot);
  return new Date(apptTime.getTime() - minutesBefore * 60 * 1000);
}

/**
 * Builds the full recipient list for email reminders.
 * Deduplicates and filters valid emails only.
 */
export function buildEmailRecipients(
  userEmail: string | null,
  additionalEmails: string[],
): string[] {
  const all = [userEmail, ...additionalEmails]
    .filter((e): e is string => !!e && isValidEmail(e))
    .map(e => e.trim().toLowerCase());
  return [...new Set(all)];
}

/**
 * Simulates sending an email reminder (logs to console).
 * Replace the console.log body with a real API call (fetch/axios to your backend).
 *
 * Expected backend payload:
 * POST /api/reminders/email
 * {
 *   "emails": ["user@example.com", "family@example.com"],
 *   "providerName": "Dr. John Mitchell",
 *   "timeSlot": "10:00 AM",
 *   "date": "Mon, Jun 9"
 * }
 */
async function sendEmailReminders(
  recipients: string[],
  appt: Appointment,
): Promise<void> {
  if (recipients.length === 0) return;

  const dateLabel = new Date(appt.dayKey).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  // ── Swap this block with your real API call ──────────────────────────────
  console.log('[EmailReminder] Sending to:', recipients);
  console.log('[EmailReminder] Payload:', {
    emails: recipients,
    providerName: appt.name,
    timeSlot: appt.timeSlot,
    date: dateLabel,
    subject: 'Appointment Reminder',
    body: `Hello,\n\nThis is a reminder for your upcoming appointment.\n\nProvider: ${appt.name}\nService: ${appt.service}\nDate: ${dateLabel}\nTime: ${appt.timeSlot}\n\nPlease be available.\n\nThank you,\nMediBook`,
  });
  // ────────────────────────────────────────────────────────────────────────
}

/**
 * In-app polling check: fires push notification + email for any appointment
 * whose reminder window has arrived and hasn't been notified yet.
 * Call this every 60s while the app is active.
 */
export async function checkAndFireDueReminders(): Promise<void> {
  const settings = await loadReminderSettings();
  if (!settings.enabled) return;

  const raw = await AsyncStorage.getItem(KEYS.ACTIVE);
  const appointments: Appointment[] = raw ? JSON.parse(raw) : [];

  const now = new Date();
  const updated: Appointment[] = [];
  let changed = false;

  for (const appt of appointments) {
    if (appt.notified) {
      updated.push(appt);
      continue;
    }

    const reminderTime = getReminderTime(appt, appt.reminderMinutes ?? settings.minutesBefore);
    const apptTime = slotToDate(appt.dayKey, appt.timeSlot);

    if (now >= reminderTime && now < apptTime) {
      // 1. Push notification
      await showImmediateReminder(appt.name, appt.timeSlot);

      // 2. Email reminders (if enabled)
      if (settings.emailsEnabled && settings.additionalEmails.length > 0) {
        const recipients = buildEmailRecipients(null, settings.additionalEmails);
        await sendEmailReminders(recipients, appt);
      }

      updated.push({ ...appt, notified: true });
      changed = true;
    } else {
      updated.push(appt);
    }
  }

  if (changed) {
    await AsyncStorage.setItem(KEYS.ACTIVE, JSON.stringify(updated));
  }
}
