import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { AnnouncementsScreen } from '../screens/announcements/AnnouncementsScreen';
import { ComplaintsScreen } from '../screens/complaints/ComplaintsScreen';
import { CreateComplaintScreen } from '../screens/complaints/CreateComplaintScreen';
import { FacilitiesScreen } from '../screens/facilities/FacilitiesScreen';
import { BookFacilityScreen } from '../screens/facilities/BookFacilityScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { VisitorsScreen } from '../screens/visitors/VisitorsScreen';
import { AddVisitorScreen } from '../screens/visitors/AddVisitorScreen';
import { EmergencyContactsScreen } from '../screens/emergency/EmergencyContactsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ComplaintStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ComplaintsList" component={ComplaintsScreen} options={{ title: 'Complaints & Requests' }} />
    <Stack.Screen name="CreateComplaint" component={CreateComplaintScreen} options={{ title: 'New Request' }} />
  </Stack.Navigator>
);

const FacilityStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="FacilitiesList" component={FacilitiesScreen} options={{ title: 'Amenities & Facilities' }} />
    <Stack.Screen name="BookFacility" component={BookFacilityScreen} options={{ title: 'Book Facility Slot' }} />
  </Stack.Navigator>
);

const VisitorStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="VisitorsList" component={VisitorsScreen} options={{ title: 'Visitor Management' }} />
    <Stack.Screen name="AddVisitor" component={AddVisitorScreen} options={{ title: 'Pre-approve Guest' }} />
  </Stack.Navigator>
);

export const ResidentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          const icons: Record<string, string> = {
            Announcements: '📢',
            Complaints: '🔧',
            Facilities: '🎾',
            Events: '🎉',
            Visitors: '🚪',
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
      <Tab.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Notices' }} />
      <Tab.Screen name="Complaints" component={ComplaintStack} options={{ headerShown: false }} />
      <Tab.Screen name="Facilities" component={FacilityStack} options={{ headerShown: false }} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Visitors" component={VisitorStack} options={{ headerShown: false }} />
      <Tab.Screen name="Emergency" component={EmergencyContactsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
