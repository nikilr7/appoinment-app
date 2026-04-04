import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProviderListScreen from './src/screens/ProviderListScreen';
import ProviderDetailsScreen from './src/screens/ProviderDetailsScreen';
import BookingScreen from './src/screens/BookingScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={ProviderListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={ProviderDetailsScreen} options={{ title: 'Provider Details' }} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment' }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'My Appointments' }} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
