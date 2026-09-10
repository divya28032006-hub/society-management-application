import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { visitorsApi } from '../../api/visitors';
import { Visitor } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const VisitorsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitors = async () => {
    try {
      setError(null);
      const data = await visitorsApi.getVisitors();
      setVisitors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visitors.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchVisitors(); }, []));

  const handleCheckIn = async (id: string) => {
    try {
      await visitorsApi.checkIn(id);
      Alert.alert('Checked In', 'Visitor checked in successfully!');
      fetchVisitors();
    } catch (err: any) {
      Alert.alert('Check In Failed', err.message || 'Error checking in visitor.');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await visitorsApi.checkOut(id);
      Alert.alert('Checked Out', 'Visitor checked out successfully!');
      fetchVisitors();
    } catch (err: any) {
      Alert.alert('Check Out Failed', err.message || 'Error checking out visitor.');
    }
  };

  if (loading) return <LoadingState message="Loading visitor logs..." />;
  if (error) return <ErrorState message={error} onRetry={fetchVisitors} />;

  const isSecurity = user?.role === 'security' || user?.role === 'admin';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('AddVisitor')}
      >
        <Text style={styles.createButtonText}>
          {isSecurity ? '+ Log Visitor Entry' : '+ Pre-approve Guest'}
        </Text>
      </TouchableOpacity>

      {visitors.length === 0 ? (
        <EmptyState
          title="No Visitor Records"
          message="No active or past visitors recorded."
          actionText={isSecurity ? "Log Entry" : "Pre-approve Guest"}
          onAction={() => navigation.navigate('AddVisitor')}
        />
      ) : (
        <FlatList
          data={visitors}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVisitors(); }} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <Text style={styles.title}>{item.name}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.meta}>Phone: {item.phone}</Text>
              <Text style={styles.meta}>Purpose: {item.purpose}</Text>
              <Text style={styles.meta}>Host flat: {item.hostFlat}</Text>
              {item.vehicleNumber && <Text style={styles.meta}>Vehicle: {item.vehicleNumber}</Text>}

              {isSecurity && item.status === 'pre_approved' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#16A34A', marginTop: 8 }]}
                  onPress={() => handleCheckIn(item._id)}
                >
                  <Text style={styles.actionBtnText}>Check In Visitor</Text>
                </TouchableOpacity>
              )}

              {isSecurity && item.status === 'checked_in' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#DC2626', marginTop: 8 }]}
                  onPress={() => handleCheckOut(item._id)}
                >
                  <Text style={styles.actionBtnText}>Check Out Visitor</Text>
                </TouchableOpacity>
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  list: { padding: 16 },
  createButton: { backgroundColor: '#2563EB', margin: 16, marginBottom: 0, padding: 12, borderRadius: 8, alignItems: 'center' },
  createButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  meta: { fontSize: 13, color: '#475569', marginBottom: 2 },
  actionBtn: { paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
