import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

export default function BookingScreen({ route, navigation }: any) {
  const { provider } = route.params;
  const [selectedSlot, setSelectedSlot] = useState('');

  const confirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Select a time slot', 'Please choose an available time slot.');
      return;
    }
    const existing = await AsyncStorage.getItem('appointments');
    const appointments = existing ? JSON.parse(existing) : [];
    appointments.push({
      id: Date.now().toString(),
      name: provider.name,
      service: provider.service,
      category: provider.category,
      timeSlot: selectedSlot,
    });
    await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
    Alert.alert('Success', 'Appointment booked successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('Appointments') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>
      <Text style={styles.provider}>{provider.name} — {provider.service}</Text>
      <Text style={styles.label}>Select a Time Slot:</Text>
      <View style={styles.slots}>
        {TIME_SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[styles.slot, selectedSlot === slot && styles.selectedSlot]}
            onPress={() => setSelectedSlot(slot)}
          >
            <Text style={[styles.slotText, selectedSlot === slot && styles.selectedSlotText]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Confirm Appointment" onPress={confirmBooking} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  provider: { fontSize: 16, color: '#555', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  slot: { padding: 10, borderWidth: 1, borderRadius: 8, borderColor: '#aaa', minWidth: 90, alignItems: 'center' },
  selectedSlot: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  slotText: { color: '#333' },
  selectedSlotText: { color: '#fff' },
});
