import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const providers = [
  { id: '1', name: 'Dr. John', service: 'Dentist', category: 'Dental', image: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', name: 'Dr. Smith', service: 'Cardiologist', category: 'Cardiology', image: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', name: 'Dr. Priya', service: 'Dermatologist', category: 'Skin Care', image: 'https://i.pravatar.cc/100?img=3' },
  { id: '4', name: 'Dr. Lee', service: 'Orthopedic', category: 'Bone & Joint', image: 'https://i.pravatar.cc/100?img=4' },
];

export default function ProviderListScreen({ navigation }: any) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedIn');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Providers</Text>
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Details', { provider: item })}
            style={styles.card}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.service}>{item.service}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, marginBottom: 10, borderRadius: 8, gap: 12 },
  image: { width: 60, height: 60, borderRadius: 30 },
  name: { fontSize: 16, fontWeight: '600' },
  service: { color: '#555' },
  category: { color: '#888', fontSize: 12 },
});
