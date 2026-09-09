import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { eventsApi } from '../../api/events';
import { EventItem } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const EventsScreen = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setError(null);
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      await eventsApi.rsvp(eventId, status);
      Alert.alert('RSVP Updated', `Your status is set to ${status.toUpperCase()}`);
      fetchEvents();
    } catch (err: any) {
      Alert.alert('RSVP Failed', err.message || 'Could not update RSVP.');
    }
  };

  if (loading) return <LoadingState message="Loading upcoming events..." />;
  if (error) return <ErrorState message={error} onRetry={fetchEvents} />;

  return (
    <View style={styles.container}>
      {events.length === 0 ? (
        <EmptyState title="No Upcoming Events" message="No society events scheduled at the moment." />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const userRsvp = item.attendees?.find(a => (a.user?._id || a.user) === user?._id)?.status;
            return (
              <Card>
                <View style={styles.row}>
                  <Text style={styles.dateBadge}>📅 {new Date(item.startDate).toLocaleDateString()}</Text>
                  {userRsvp && <StatusBadge status={userRsvp} />}
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.location}>📍 Location: {item.location}</Text>

                <View style={styles.rsvpSection}>
                  <Text style={styles.rsvpTitle}>RSVP Status:</Text>
                  <View style={styles.rsvpButtons}>
                    <TouchableOpacity
                      style={[styles.rsvpBtn, userRsvp === 'going' && styles.rsvpBtnActive]}
                      onPress={() => handleRSVP(item._id, 'going')}
                    >
                      <Text style={[styles.rsvpBtnText, userRsvp === 'going' && styles.rsvpBtnTextActive]}>Going</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rsvpBtn, userRsvp === 'maybe' && styles.rsvpBtnActive]}
                      onPress={() => handleRSVP(item._id, 'maybe')}
                    >
                      <Text style={[styles.rsvpBtnText, userRsvp === 'maybe' && styles.rsvpBtnTextActive]}>Maybe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rsvpBtn, userRsvp === 'not_going' && styles.rsvpBtnActive]}
                      onPress={() => handleRSVP(item._id, 'not_going')}
                    >
                      <Text style={[styles.rsvpBtnText, userRsvp === 'not_going' && styles.rsvpBtnTextActive]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  list: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateBadge: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  description: { fontSize: 14, color: '#334155', marginBottom: 8 },
  location: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 12 },
  rsvpSection: { borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 8 },
  rsvpTitle: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  rsvpButtons: { flexDirection: 'row', gap: 8 },
  rsvpBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#E2E8F0', flex: 1, alignItems: 'center' },
  rsvpBtnActive: { backgroundColor: '#2563EB' },
  rsvpBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  rsvpBtnTextActive: { color: '#FFFFFF' },
});
