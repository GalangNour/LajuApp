import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> }

export default function HomeScreen({ navigation }: Props) {
  const { session } = useAuth()
  const user = session?.user ?? null

  const handleSignOut = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  const displayName = user?.user_metadata?.full_name ?? 'Pengguna'
  const initial = (user?.user_metadata?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>{initial}</Text></View>
        <Text style={s.greeting}>Halo,</Text>
        <Text style={s.name}>{displayName}</Text>
        <Text style={s.email}>{user?.email}</Text>
      </View>

      <View style={s.card}>
        <View style={s.row}><View style={s.dot} /><Text style={s.cardTitle}>Login berhasil!</Text></View>
        <Text style={s.cardSub}>Koneksi ke Supabase aktif dan sesi tersimpan.</Text>
      </View>

      <View style={s.infoCard}>
        <InfoRow label="User ID"     value={(user?.id?.slice(0, 20) ?? '') + '...'} />
        <InfoRow label="Provider"    value={user?.app_metadata?.provider ?? 'email'} />
        <InfoRow label="Terverifikasi" value={user?.email_confirmed_at ? '✅ Ya' : '❌ Belum'} />
      </View>

      <TouchableOpacity style={s.startBtn} onPress={() => navigation.navigate('Live')}>
        <Text style={s.startBtnText}>▶ Mulai Aktivitas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.testBtn} onPress={() => navigation.navigate('PermissionTest')}>
        <Text style={s.testBtnText}>🔍 Test Lokasi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.signOut} onPress={handleSignOut}>
        <Text style={s.signOutText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container:  { flex: 1, backgroundColor: '#F7F8FA', padding: 24, paddingTop: 60 },

  header:     { alignItems: 'center', marginBottom: 32 },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1D9E75', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  greeting:   { fontSize: 14, color: '#888' },
  name:       { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginTop: 2 },
  email:      { fontSize: 13, color: '#999', marginTop: 4 },

  card:       { backgroundColor: '#E8F8F2', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#1D9E75' },
  row:        { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1D9E75', marginRight: 8 },
  cardTitle:  { fontSize: 15, fontWeight: '600', color: '#1D9E75' },
  cardSub:    { fontSize: 13, color: '#555' },

  infoCard:   { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 32, elevation: 2 },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  infoLabel:  { fontSize: 13, color: '#888' },
  infoValue:  { fontSize: 13, color: '#1A1A2E', fontWeight: '500', maxWidth: '55%', textAlign: 'right' },

  startBtn:    { backgroundColor: '#1D9E75', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 12 },
  startBtnText:{ color: '#fff', fontWeight: '700', fontSize: 15 },
  testBtn:     { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1D9E75', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 12 },
  testBtnText: { color: '#1D9E75', fontWeight: '600', fontSize: 15 },
  signOut:     { borderWidth: 1.5, borderColor: '#E24B4A', borderRadius: 10, padding: 15, alignItems: 'center' },
  signOutText: { color: '#E24B4A', fontWeight: '600', fontSize: 15 },
})
