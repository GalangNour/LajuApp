import { useState, useEffect, useRef } from 'react'
import * as Location from 'expo-location'
import { Linking, AppState, AppStateStatus } from 'react-native'

// loading        → sedang cek
// denied         → belum pernah izinkan (bisa diminta)
// foreground_only→ foreground OK, background belum
// blocked        → permanen ditolak, harus buka Settings
// granted        → foreground + background OK ✅
export type PermissionStatus = 'loading' | 'denied' | 'foreground_only' | 'blocked' | 'granted'

export function useLocationPermission() {
  const [status, setStatus] = useState<PermissionStatus>('loading')
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    check()

    // Re-check setiap kali user kembali ke app (misal habis dari Settings)
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') check()
      appState.current = next
    })

    return () => sub.remove()
  }, [])

  const check = async () => {
    const fg = await Location.getForegroundPermissionsAsync()
    if (fg.status !== 'granted') {
      setStatus(fg.canAskAgain ? 'denied' : 'blocked')
      return
    }
    const bg = await Location.getBackgroundPermissionsAsync()
    if (bg.status !== 'granted') {
      setStatus(bg.canAskAgain ? 'foreground_only' : 'blocked')
      return
    }
    setStatus('granted')
  }

  const request = async () => {
    const fg = await Location.requestForegroundPermissionsAsync()
    if (fg.status !== 'granted') {
      setStatus(fg.canAskAgain ? 'denied' : 'blocked')
      return
    }
    const bg = await Location.requestBackgroundPermissionsAsync()
    if (bg.status !== 'granted') {
      setStatus(bg.canAskAgain ? 'foreground_only' : 'blocked')
      return
    }
    setStatus('granted')
  }

  const openSettings = () => Linking.openSettings()

  return { status, request, openSettings }
}
