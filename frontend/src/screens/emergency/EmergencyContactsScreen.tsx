import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { emergencyApi } from '../../api/emergency';
import { EmergencyContact } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';

export const EmergencyContactsScreen = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setError(null);
      const data = await emergencyApi.getContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch emergency contacts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchContacts(); }, []));

  if (loading) return <LoadingState message="Loading emergency contacts..." />;
  if (error) return <ErrorState message={error} onRetry={fetchContacts} />;

  return (
    <View style={styles.container}>
      {contacts.length === 0 ? (
        <EmptyState title="No Emergency Contacts" message="No emergency contacts configured yet." />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchContacts(); }} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.emergencyCard}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.role}>{item.designation}</Text>
                </View>
                {item.priority >= 5 && <Text style={styles.badge247}>URGENT</Text>}
              </View>
              <Text style={styles.phone}>📞 Phone: {item.phone}</Text>
              {item.address && <Text style={styles.phone}>Address: {item.address}</Text>}
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
  emergencyCard: { borderColor: '#FECACA', borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: '#991B1B' },
  role: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  badge247: { backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  phone: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginTop: 4 },
});
