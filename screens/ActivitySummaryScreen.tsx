import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../App'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActivitySummary'>
  route: RouteProp<RootStackParamList, 'ActivitySummary'>
}

const TYPE_LABEL = { run: '🏃 Lari', ride: '🚴 Bersepeda', walk: '🚶 Jalan' }

export default function ActivitySummaryScreen({ navigation, route }: Props) {
  const { activity } = route.params

  const duration = [
    String(Math.floor(activity.durationSeconds / 3600)).padStart(2, '0'),
    String(Math.floor((activity.durationSeconds % 3600) / 60)).padStart(2, '0'),
    String(activity.durationSeconds % 60).padStart(2, '0'),
  ].join(':')

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Aktivitas Selesai!</Text>
      <Text style={s.type}>{TYPE_LABEL[activity.type]}</Text>

      <View style={s.grid}>
        <StatCard label="Jarak" value={`${(activity.distanceMeters / 1000).toFixed(2)}`} unit="km" />
        <StatCard label="Durasi" value={duration} unit="" />
        <StatCard label="Kalori" value={`${activity.calories}`} unit="kkal" />
        <StatCard label="Elevasi" value={`${activity.elevationGain}`} unit="m" />
      </View>

      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Home')}>
        <Text style={s.btnText}>Kembali ke Beranda</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={s.card}>
      <Text style={s.cardValue}>{value}</Text>
      {unit ? <Text style={s.cardUnit}>{unit}</Text> : null}
      <Text style={s.cardLabel}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container:  { flexGrow: 1, padding: 24, paddingTop: 48, backgroundColor: '#fff', alignItems: 'center' },
  title:      { fontSize: 26, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  type:       { fontSize: 16, color: '#888', marginBottom: 32 },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 40 },
  card:       { width: 140, backgroundColor: '#F7F8FA', borderRadius: 14, padding: 16, alignItems: 'center' },
  cardValue:  { fontSize: 28, fontWeight: '700', color: '#1A1A2E' },
  cardUnit:   { fontSize: 13, color: '#1D9E75', fontWeight: '600' },
  cardLabel:  { fontSize: 12, color: '#888', marginTop: 4 },
  btn:        { backgroundColor: '#1D9E75', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
})
