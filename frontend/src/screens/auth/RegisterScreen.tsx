import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [wing, setWing] = useState('');
  const [societyId, setSocietyId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !societyId) {
      Alert.alert('Missing Information', 'Please fill in all required fields (Name, Email, Phone, Password, Society ID).');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        societyId,
        flatNumber,
        wing,
      });
    } catch (err: any) {
      Alert.alert('Registration Error', err.message || 'Could not register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register as a resident in your society</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />

          <Text style={styles.label}>Email Address *</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="john@example.com" autoCapitalize="none" keyboardType="email-address" />

          <Text style={styles.label}>Phone Number (10 digits) *</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" />

          <Text style={styles.label}>Password (min 8 chars) *</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

          <Text style={styles.label}>Society ID *</Text>
          <TextInput style={styles.input} value={societyId} onChangeText={setSocietyId} placeholder="MongoDB Object ID" autoCapitalize="none" />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Wing</Text>
              <TextInput style={styles.input} value={wing} onChangeText={setWing} placeholder="A" />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Flat No.</Text>
              <TextInput style={styles.input} value={flatNumber} onChangeText={setFlatNumber} placeholder="101" />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Log In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 12, color: '#0F172A' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 0.48 },
  button: { backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#64748B', fontSize: 14 },
  linkTextBold: { color: '#2563EB', fontWeight: '700' },
});
