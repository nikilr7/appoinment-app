import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';

// WARNING: Never change this value after release — changing it creates a new
// channel and loses all user-defined notification preferences (mute, sound, etc.)
const CHANNEL_ID = 'appointment_reminders' as const;

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

// Creates the channel only once — skips if it already exists to preserve
// any user-defined settings (importance, sound, vibration, etc.)
async function ensureChannel() {
  const existing = await notifee.getChannel(CHANNEL_ID);
  if (existing) return;
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Appointment Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function scheduleReminderNotification(
  appointmentId: string,
  providerName: string,
  timeSlot: string,
  triggerDate: Date,
): Promise<string> {
  await ensureChannel();
  const id = await notifee.createTriggerNotification(
    {
      id: `reminder_${appointmentId}`,
      title: '🔔 Appointment Reminder',
      body: `You have an appointment with ${providerName} at ${timeSlot}`,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher',
      },
      ios: { sound: 'default' },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime(),
    },
  );
  return id;
}

export async function cancelReminderNotification(appointmentId: string): Promise<void> {
  await notifee.cancelNotification(`reminder_${appointmentId}`);
}

export async function showImmediateReminder(
  providerName: string,
  timeSlot: string,
): Promise<void> {
  await ensureChannel();
  await notifee.displayNotification({
    title: '🔔 Appointment Reminder',
    body: `Your appointment with ${providerName} is at ${timeSlot}`,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
      smallIcon: 'ic_launcher',
    },
    ios: { sound: 'default' },
  });
}
