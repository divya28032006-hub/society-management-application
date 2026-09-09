import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { VisitorsScreen } from '../screens/visitors/VisitorsScreen';
import { AddVisitorScreen } from '../screens/visitors/AddVisitorScreen';
import { EmergencyContactsScreen } from '../screens/emergency/EmergencyContactsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const VisitorStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="VisitorsList" component={VisitorsScreen} options={{ title: 'Gate Security & Visitor Desk' }} />
    <Stack.Screen name="AddVisitor" component={AddVisitorScreen} options={{ title: 'Log Gate Entry' }} />
  </Stack.Navigator>
);

export const SecurityNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          const icons: Record<string, string> = {
            GateVisitors: '🚪',
            Emergency: '🚨',
            Notifications: '🔔',
            Profile: '👤',
          };
          return <Text style={{ fontSize: 18 }}>{icons[route.name] || '📱'}</Text>;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
      })}
    >
      <Tab.Screen name="GateVisitors" component={VisitorStack} options={{ headerShown: false }} />
      <Tab.Screen name="Emergency" component={EmergencyContactsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
