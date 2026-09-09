import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    const s = status.toLowerCase();
    if (['resolved', 'approved', 'going', 'checked_in', 'pre_approved'].includes(s)) {
      return { bg: '#DCFCE7', text: '#166534' };
    }
    if (['in_progress', 'pending', 'maybe'].includes(s)) {
      return { bg: '#FEF9C3', text: '#854D0E' };
    }
    if (['rejected', 'cancelled', 'not_going', 'denied'].includes(s)) {
      return { bg: '#FEE2E2', text: '#991B1B' };
    }
    return { bg: '#F1F5F9', text: '#475569' };
  };

  const { bg, text } = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>
        {status.replace('_', ' ').toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
