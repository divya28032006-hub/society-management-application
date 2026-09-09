import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { announcementsApi } from '../../api/announcements';
import { Announcement } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const AnnouncementsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setError(null);
      const data = await announcementsApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  if (loading) return <LoadingState message="Loading announcements..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAnnouncements} />;

  const isAdmin = user?.role === 'admin';

  return (
    <View style={styles.container}>
      {isAdmin && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateAnnouncement')}
        >
          <Text style={styles.createButtonText}>+ Create Announcement</Text>
        </TouchableOpacity>
      )}

      {announcements.length === 0 ? (
        <EmptyState
          title="No Announcements"
          message="There are no announcements published yet."
          actionText={isAdmin ? "Post First Announcement" : undefined}
          onAction={isAdmin ? () => navigation.navigate('CreateAnnouncement') : undefined}
        />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <StatusBadge status={item.category || 'general'} />
                {item.pinned && <Text style={styles.pinnedText}>📌 Pinned</Text>}
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content}>{item.content}</Text>
              <View style={styles.footer}>
                <Text style={styles.author}>
                  By {item.author?.name || 'Management'}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
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
  createButton: {
    backgroundColor: '#2563EB',
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pinnedText: { fontSize: 12, color: '#D97706', fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  content: { fontSize: 14, color: '#334155', lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 8 },
  author: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  date: { fontSize: 12, color: '#94A3B8' },
});
