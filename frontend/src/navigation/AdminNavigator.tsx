import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { AnnouncementsScreen } from '../screens/announcements/AnnouncementsScreen';
import { CreateAnnouncementScreen } from '../screens/announcements/CreateAnnouncementScreen';
import { ComplaintsScreen } from '../screens/complaints/ComplaintsScreen';
import { FacilitiesScreen } from '../screens/facilities/FacilitiesScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { VisitorsScreen } from '../screens/visitors/VisitorsScreen';
import { AddVisitorScreen } from '../screens/visitors/AddVisitorScreen';
import { EmergencyContactsScreen } from '../screens/emergency/EmergencyContactsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AnnouncementStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AnnouncementsList" component={AnnouncementsScreen} options={{ title: 'Notice Board' }} />
    <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} options={{ title: 'Create Notice' }} />
  </Stack.Navigator>
);

const VisitorStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="VisitorsList" component={VisitorsScreen} options={{ title: 'Visitor Logs' }} />
    <Stack.Screen name="AddVisitor" component={AddVisitorScreen} options={{ title: 'Log Visitor' }} />
  </Stack.Navigator>
);

export const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          const icons: Record<string, string> = {
            Notices: '📢',
            Complaints: '🔧',
            Facilities: '🎾',
            Events: '🎉',
            Visitors: '🚪',
            Profile: '👤',
          };
          return <Text style={{ fontSize: 18 }}>{icons[route.name] || '📱'}</Text>;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
      })}
    >
      <Tab.Screen name="Notices" component={AnnouncementStack} options={{ headerShown: false }} />
      <Tab.Screen name="Complaints" component={ComplaintsScreen} options={{ title: 'Manage Requests' }} />
      <Tab.Screen name="Facilities" component={FacilitiesScreen} options={{ title: 'Manage Amenities' }} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Visitors" component={VisitorStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
