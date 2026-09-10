import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { visitorsApi } from '../../api/visitors';
import { useAuth } from '../../context/AuthContext';

export const AddVisitorScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const isSecurity = user?.role === 'security' || user?.role === 'admin';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [flatNumber, setFlatNumber] = useState(user?.flatNumber || '101');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !purpose || !flatNumber) {
      Alert.alert('Validation Error', 'Name, Phone, Purpose, and Flat Number are required.');
      return;
    }

    setSubmitting(true);
    try {
      await visitorsApi.createVisitor({
        name,
        phone,
        purpose,
        hostFlat: flatNumber,
        hostName: user?.name,
        vehicleNumber,
      });

      Alert.alert('Success', isSecurity ? 'Visitor checked in successfully!' : 'Guest pre-approved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add visitor record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>
        {isSecurity ? 'Log New Gate Visitor' : 'Pre-Approve Guest Entry'}
      </Text>

      <Text style={styles.label}>Visitor Full Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Alex Smith" />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" />

      <Text style={styles.label}>Visit Purpose *</Text>
      <TextInput style={styles.input} value={purpose} onChangeText={setPurpose} placeholder="Delivery, Guest, Service..." />

      <Text style={styles.label}>Destination Flat *</Text>
      <TextInput style={styles.input} value={flatNumber} onChangeText={setFlatNumber} placeholder="101" />

      <Text style={styles.label}>Vehicle Number (Optional)</Text>
      <TextInput style={styles.input} value={vehicleNumber} onChangeText={setVehicleNumber} placeholder="MH 02 AB 1234" />

      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Submitting...' : isSecurity ? 'Check In Visitor' : 'Pre-Approve Guest'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  heading: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 0.48 },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
