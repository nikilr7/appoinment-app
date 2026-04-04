import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';

export default function ProviderDetailsScreen({ route, navigation }: any) {
  const { provider } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: provider.image }} style={styles.image} />
      <Text style={styles.name}>{provider.name}</Text>
      <Text style={styles.service}>{provider.service}</Text>
      <Text style={styles.category}>Category: {provider.category}</Text>
      <View style={styles.button}>
        <Button title="Book Appointment" onPress={() => navigation.navigate('Booking', { provider })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 50, marginBottom: 20, marginTop: 20 },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  service: { fontSize: 16, color: '#555', marginBottom: 4 },
  category: { fontSize: 14, color: '#888', marginBottom: 20 },
  button: { width: '100%' },
});
