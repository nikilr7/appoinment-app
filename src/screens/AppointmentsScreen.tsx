import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);

  const loadAppointments = async () => {
    const data = await AsyncStorage.getItem('appointments');
    setAppointments(data ? JSON.parse(data) : []);
  };

  useFocusEffect(useCallback(() => { loadAppointments(); }, []));

  const cancelAppointment = (id: string) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes', onPress: async () => {
          const updated = appointments.filter((item) => item.id !== id);
          setAppointments(updated);
          await AsyncStorage.setItem('appointments', JSON.stringify(updated));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      {appointments.length === 0 && <Text style={styles.empty}>No appointments yet.</Text>}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.service}>{item.service}</Text>
              <Text style={styles.slot}>🕐 {item.timeSlot}</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelAppointment(item.id)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  service: { color: '#555' },
  slot: { color: '#007AFF', marginTop: 4 },
  cancelBtn: { backgroundColor: '#FF3B30', padding: 8, borderRadius: 6 },
  cancelText: { color: '#fff', fontWeight: '600' },
});
