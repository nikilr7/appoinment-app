import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';

const CHANNEL_ID = 'appointment_reminders';

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

async function ensureChannel() {
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
