import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { complaintsApi } from '../../api/complaints';
import { Complaint } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const ComplaintsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setError(null);
      const data = await complaintsApi.getComplaints();
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'in_progress' | 'resolved' | 'rejected') => {
    try {
      await complaintsApi.updateStatus(id, { status: newStatus });
      Alert.alert('Status Updated', `Complaint status changed to ${newStatus}`);
      fetchComplaints();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update status.');
    }
  };

  if (loading) return <LoadingState message="Loading complaints..." />;
  if (error) return <ErrorState message={error} onRetry={fetchComplaints} />;

  const isAdmin = user?.role === 'admin';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateComplaint')}
      >
        <Text style={styles.createButtonText}>+ Raise New Complaint</Text>
      </TouchableOpacity>

      {complaints.length === 0 ? (
        <EmptyState
          title="No Complaints Logged"
          message="There are no active complaints or service requests."
          actionText="Raise Complaint"
          onAction={() => navigation.navigate('CreateComplaint')}
        />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchComplaints(); }} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <StatusBadge status={item.status} />
                <Text style={styles.category}>{item.category.toUpperCase()}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.footer}>
                <Text style={styles.meta}>By {item.createdBy?.name || 'Resident'} (Flat {item.createdBy?.flatNumber || 'N/A'})</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>

              {isAdmin && item.status !== 'resolved' && (
                <View style={styles.adminActions}>
                  <Text style={styles.adminLabel}>Admin Actions:</Text>
                  <View style={styles.actionRow}>
                    {item.status !== 'in_progress' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#EAB308' }]}
                        onPress={() => handleStatusUpdate(item._id, 'in_progress')}
                      >
                        <Text style={styles.actionBtnText}>In Progress</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#16A34A' }]}
                      onPress={() => handleStatusUpdate(item._id, 'resolved')}
                    >
                      <Text style={styles.actionBtnText}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  category: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  description: { fontSize: 14, color: '#334155', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 8 },
  meta: { fontSize: 12, color: '#64748B' },
  date: { fontSize: 12, color: '#94A3B8' },
  adminActions: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderColor: '#E2E8F0' },
  adminLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  actionBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
