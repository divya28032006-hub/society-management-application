import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <StatusBadge status={user?.role || 'resident'} />
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user?.phone}</Text>
          </View>
          {user?.flatNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Flat & Wing</Text>
              <Text style={styles.value}>Wing {user.wing || '-'}, Flat {user.flatNumber}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Account Status</Text>
            <Text style={[styles.value, { color: user?.isActive ? '#16A34A' : '#DC2626' }]}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  header: { alignItems: 'center', marginVertical: 20 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  infoCard: { paddingVertical: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  label: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  value: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  logoutButton: { backgroundColor: '#FEE2E2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
});
