import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native'
import { useLocationPermission, type PermissionStatus } from '../hooks/useLocationPermission'

const INFO: Record<PermissionStatus, { icon: string; label: string; desc: string }> = {
  loading:         { icon: '⏳', label: 'Memeriksa izin...', desc: '' },
  denied:          { icon: '📍', label: 'Izin lokasi diperlukan', desc: 'Aplikasi perlu akses lokasi untuk merekam rute jogging.' },
  foreground_only: { icon: '⚠️', label: 'Background belum diizinkan', desc: 'Izinkan lokasi "Selalu" agar rute tetap terekam saat layar mati.' },
  blocked:         { icon: '🚫', label: 'Izin ditolak permanen', desc: 'Buka Pengaturan dan aktifkan izin lokasi secara manual.' },
  granted:         { icon: '✅', label: 'GPS siap digunakan', desc: 'Foreground + background sudah aktif.' },
}

export default function PermissionTestScreen() {
  const { status, request, openSettings } = useLocationPermission()
  const prevStatus = useRef<PermissionStatus>('loading')
  const info = INFO[status]

  // Muncul alert otomatis kalau permission tiba-tiba dicabut
  useEffect(() => {
    const wasGranted = prevStatus.current === 'granted'
    const nowRevoked = status === 'denied' || status === 'foreground_only' || status === 'blocked'

    if (wasGranted && nowRevoked) {
      Alert.alert(
        'Izin Lokasi Dimatikan',
        'GPS tidak aktif. Rute jogging tidak bisa direkam.',
        [
          { text: 'Nanti', style: 'cancel' },
          {
            text: status === 'blocked' ? 'Buka Pengaturan' : 'Izinkan Lagi',
            onPress: status === 'blocked' ? openSettings : request,
          },
        ]
      )
    }

    prevStatus.current = status
  }, [status])

  const needsAction = status !== 'loading' && status !== 'granted'

  return (
    <View style={s.container}>
      <Text style={s.icon}>{info.icon}</Text>
      <Text style={s.label}>{info.label}</Text>
      {info.desc ? <Text style={s.desc}>{info.desc}</Text> : null}

      {(status === 'denied' || status === 'foreground_only') && (
        <TouchableOpacity style={s.btn} onPress={request}>
          <Text style={s.btnText}>
            {status === 'denied' ? 'Izinkan Lokasi' : 'Izinkan Background'}
          </Text>
        </TouchableOpacity>
      )}

      {status === 'blocked' && (
        <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={openSettings}>
          <Text style={[s.btnText, s.btnTextOutline]}>Buka Pengaturan</Text>
        </TouchableOpacity>
      )}

      <View style={s.checklist}>
        <CheckRow label="Foreground (saat app terbuka)" ok={status === 'granted' || status === 'foreground_only'} />
        <CheckRow label="Background (layar mati / app diminimize)" ok={status === 'granted'} />
      </View>
    </View>
  )
}

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.check, ok ? s.checkOk : s.checkNo]}>{ok ? '✓' : '✗'}</Text>
      <Text style={s.checkLabel}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  icon:         { fontSize: 56, marginBottom: 16 },
  label:        { fontSize: 18, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 8 },
  desc:         { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  btn:          { backgroundColor: '#1D9E75', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 },
  btnOutline:   { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1D9E75' },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnTextOutline: { color: '#1D9E75' },
  checklist:    { marginTop: 32, width: '100%', gap: 10 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check:        { fontSize: 16, fontWeight: '700', width: 20 },
  checkOk:      { color: '#1D9E75' },
  checkNo:      { color: '#E24B4A' },
  checkLabel:   { fontSize: 14, color: '#444', flexShrink: 1 },
})
