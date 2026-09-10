import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { announcementsApi } from '../../api/announcements';
import { showCrossPlatformAlert } from '../../utils/alert';

export const CreateAnnouncementScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'general' | 'maintenance' | 'emergency' | 'event' | 'admin'>('general');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('Validation Error', 'Title and Content are required.');
      return;
    }

    setSubmitting(true);
    try {
      await announcementsApi.create({ title, content, category, pinned });
      showCrossPlatformAlert('Success', 'Announcement published successfully!', () => {
        navigation.goBack();
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>New Notice / Announcement</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Annual Society General Meeting"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {(['general', 'maintenance', 'emergency', 'event', 'admin'] as const).map((cat) => (
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

      <Text style={styles.label}>Notice Details *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Type full announcement details here..."
        multiline
        numberOfLines={6}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Pin to Top</Text>
        <Switch value={pinned} onValueChange={setPinned} trackColor={{ false: '#CBD5E1', true: '#2563EB' }} />
      </View>

      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Publishing...' : 'Publish Announcement'}</Text>
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
  textArea: { height: 120, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  button: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
