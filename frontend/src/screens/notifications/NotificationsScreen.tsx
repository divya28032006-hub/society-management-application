import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { notificationsApi } from '../../api/notifications';
import { NotificationItem } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Card } from '../../components/Card';

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const data = await notificationsApi.getNotifications();
      console.log('[NotificationsScreen] Fetched notifications count:', data?.length);
      setNotifications(data || []);
    } catch (err: any) {
      console.error('[NotificationsScreen] Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch {
      // Ignore error
    }
  };

  if (loading) return <LoadingState message="Loading notifications..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark All as Read</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <EmptyState title="No Notifications" message="You're all caught up! No unread notifications." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={!item.isRead ? styles.unreadCard : undefined}>
              <View style={styles.row}>
                <Text style={styles.type}>🔔 {item.type?.toUpperCase() || 'GENERAL'}</Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
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
  markAllBtn: { margin: 16, marginBottom: 0, alignSelf: 'flex-end' },
  markAllText: { fontSize: 13, color: '#2563EB', fontWeight: '700' },
  unreadCard: { borderLeftWidth: 4, borderColor: '#2563EB', backgroundColor: '#F0F9FF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  type: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' },
  title: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  message: { fontSize: 13, color: '#334155', marginBottom: 8 },
  date: { fontSize: 11, color: '#94A3B8' },
});
