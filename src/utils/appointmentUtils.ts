import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  ACTIVE: 'ACTIVE_APPOINTMENTS',
  HISTORY: 'APPOINTMENT_HISTORY',
};

export interface Appointment {
  id: string;
  providerId: string;
  name: string;
  service: string;
  category: string;
  image: string;
  day: string;
  dayKey: string;
  timeSlot: string;
  bookedAt: string;
  expiredAt?: string;
  // Reminder fields
  reminderMinutes?: number;   // minutes before appointment
  reminderTime?: string;      // ISO string of when reminder fires
  notificationId?: string;    // notifee notification id
  notified?: boolean;         // true once reminder has fired
}

/** Parse "9:00 AM" / "3:00 PM" into a Date on the given dayKey (toDateString) */
export function slotToDate(dayKey: string, timeSlot: string): Date {
  const [timePart, meridiem] = timeSlot.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  const hours =
    meridiem === 'PM' && h !== 12 ? h + 12 :
    meridiem === 'AM' && h === 12 ? 0 : h;
  const d = new Date(dayKey);
  d.setHours(hours, m, 0, 0);
  return d;
}

export function isExpired(appt: Appointment): boolean {
  return slotToDate(appt.dayKey, appt.timeSlot) < new Date();
}

/** Move all expired active appointments to history. Returns updated active list. */
export async function checkAndMoveExpired(): Promise<Appointment[]> {
  const [activeRaw, historyRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.ACTIVE),
    AsyncStorage.getItem(KEYS.HISTORY),
  ]);

  const active: Appointment[] = activeRaw ? JSON.parse(activeRaw) : [];
  const history: Appointment[] = historyRaw ? JSON.parse(historyRaw) : [];

  const stillActive: Appointment[] = [];
  const nowExpired: Appointment[] = [];

  for (const appt of active) {
    if (isExpired(appt)) {
      nowExpired.push({ ...appt, expiredAt: new Date().toISOString() });
    } else {
      stillActive.push(appt);
    }
  }

  if (nowExpired.length > 0) {
    const updatedHistory = [...history, ...nowExpired];
    await Promise.all([
      AsyncStorage.setItem(KEYS.ACTIVE, JSON.stringify(stillActive)),
      AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedHistory)),
    ]);
  }

  return stillActive;
}
