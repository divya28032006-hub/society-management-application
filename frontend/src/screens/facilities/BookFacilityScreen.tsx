import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { facilitiesApi } from '../../api/facilities';
import { Facility } from '../../types';

export const BookFacilityScreen = ({ route, navigation }: any) => {
  const facility: Facility = route.params?.facility;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBooking = async () => {
    if (!date || !startTime || !endTime || !purpose) {
      Alert.alert('Validation Error', 'Please fill in all booking details.');
      return;
    }

    setSubmitting(true);
    try {
      await facilitiesApi.createBooking({
        facilityId: facility._id,
        date,
        startTime,
        endTime,
        notes: purpose,
      });
      Alert.alert('Booking Request Sent', `Your booking request for ${facility.name} was submitted successfully!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Could not create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Book {facility?.name || 'Facility'}</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{facility?.name}</Text>
        <Text style={styles.infoText}>Booking Fee: ₹{facility?.bookingFee || 0}</Text>
        <Text style={styles.infoText}>Capacity: {facility?.capacity || 0} People</Text>
      </View>

      <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-09-15"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Start Time *</Text>
          <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="10:00" />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>End Time *</Text>
          <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="12:00" />
        </View>
      </View>

      <Text style={styles.label}>Event / Booking Purpose *</Text>
      <TextInput
        style={styles.input}
        value={purpose}
        onChangeText={setPurpose}
        placeholder="e.g. Birthday Celebration"
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleBooking}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Confirm Booking'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  heading: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  infoCard: { backgroundColor: '#E0F2FE', padding: 16, borderRadius: 8, marginBottom: 20 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#0369A1', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#0284C7' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 0.48 },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
