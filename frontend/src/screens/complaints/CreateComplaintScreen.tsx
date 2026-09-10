import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { complaintsApi } from '../../api/complaints';
import { showCrossPlatformAlert } from '../../utils/alert';

export const CreateComplaintScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'plumbing' | 'electrical' | 'carpentry' | 'security' | 'cleanliness' | 'noise' | 'other'>('plumbing');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Validation Error', 'Title and Description are required.');
      return;
    }

    setSubmitting(true);
    try {
      await complaintsApi.create({ title, description, category, priority });
      showCrossPlatformAlert('Success', 'Complaint submitted successfully!', () => {
        navigation.goBack();
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Raise Service Request / Complaint</Text>

      <Text style={styles.label}>Complaint Subject *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Water leakage in Master Bathroom"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {(['plumbing', 'electrical', 'carpentry', 'security', 'cleanliness', 'noise', 'other'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Priority Level</Text>
      <View style={styles.chipRow}>
        {(['low', 'medium', 'high', 'urgent'] as const).map((prio) => (
          <TouchableOpacity
            key={prio}
            style={[styles.chip, priority === prio && styles.chipActivePriority]}
            onPress={() => setPriority(prio)}
          >
            <Text style={[styles.chipText, priority === prio && styles.chipTextActive]}>
              {prio.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Detailed Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the issue in detail..."
        multiline
        numberOfLines={5}
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit Request'}</Text>
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
  textArea: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB' },
  chipActivePriority: { backgroundColor: '#DC2626' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
