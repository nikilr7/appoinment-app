import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './src/context/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProviderListScreen from './src/screens/ProviderListScreen';
import ProviderDetailsScreen from './src/screens/ProviderDetailsScreen';
import BookingScreen from './src/screens/BookingScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import AboutScreen from './src/screens/AboutScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReminderSettingsScreen from './src/screens/ReminderSettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={ProviderListScreen} />
        <Stack.Screen name="Details" component={ProviderDetailsScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
    </ThemeProvider>
  );
}
