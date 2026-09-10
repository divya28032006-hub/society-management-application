import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { facilitiesApi } from '../../api/facilities';
import { Facility, Booking } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';

export const FacilitiesScreen = ({ navigation }: any) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'facilities' | 'myBookings'>('facilities');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [facData, bookData] = await Promise.all([
        facilitiesApi.getFacilities(),
        facilitiesApi.getBookings(),
      ]);
      setFacilities(facData);
      setBookings(bookData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch facility data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  if (loading) return <LoadingState message="Loading facilities & bookings..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'facilities' && styles.activeTab]}
          onPress={() => setActiveTab('facilities')}
        >
          <Text style={[styles.tabText, activeTab === 'facilities' && styles.activeTabText]}>
            Facilities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myBookings' && styles.activeTab]}
          onPress={() => setActiveTab('myBookings')}
        >
          <Text style={[styles.tabText, activeTab === 'myBookings' && styles.activeTabText]}>
            My Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'facilities' ? (
        facilities.length === 0 ? (
          <EmptyState title="No Facilities" message="No society facilities available for booking." />
        ) : (
          <FlatList
            data={facilities}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>Capacity: {item.capacity} people</Text>
                  <Text style={styles.meta}>Fee: ₹{item.bookingFee || 0}</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => navigation.navigate('BookFacility', { facility: item })}
                >
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
              </Card>
            )}
          />
        )
      ) : (
        bookings.length === 0 ? (
          <EmptyState title="No Bookings" message="You haven't booked any facilities yet." />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  <Text style={styles.title}>{item.facility?.name || 'Facility'}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.meta}>Date: {item.date}</Text>
                <Text style={styles.meta}>Slot: {item.startTime} - {item.endTime}</Text>
                <Text style={styles.meta}>Purpose: {item.purpose}</Text>
              </Card>
            )}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#2563EB', fontWeight: '700' },
  list: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  description: { fontSize: 14, color: '#334155', marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  meta: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  bookBtn: { backgroundColor: '#2563EB', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  bookBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
