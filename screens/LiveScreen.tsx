import { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import MapView, { Polyline, Marker } from 'react-native-maps'
import { useKeepAwake } from 'expo-keep-awake'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useGps } from '../hooks/useGps'
import { useMetrics } from '../hooks/useMetrix'
import { useStopwatch } from '../hooks/useStopwatch'
import { useLocationPermission } from '../hooks/useLocationPermission'
import { saveActivity } from '../lib/activityStorage'
import type { RootStackParamList } from '../App'
import s, { liveMapStyle } from '../styles/live'

type TrackingState = 'idle' | 'running' | 'paused'
type Nav = NativeStackNavigationProp<RootStackParamList, 'Live'>

export default function LiveScreen() {
  useKeepAwake()

  const navigation = useNavigation<Nav>()
  const mapRef     = useRef<MapView>(null)
  const [trackingState, setTrackingState] = useState<TrackingState>('idle')
  const [locked,        setLocked]        = useState(false)

  const { status }                                         = useLocationPermission()
  const { currentLocation, coordinates, startTracking, stopTracking } = useGps()
  const { seconds, formatted: duration, start, pause, reset }         = useStopwatch()
  const metrics = useMetrics(coordinates, seconds)

  useEffect(() => {
    if (!currentLocation) return
    mapRef.current?.animateToRegion({
      latitude:      currentLocation.latitude,
      longitude:     currentLocation.longitude,
      latitudeDelta:  0.005,
      longitudeDelta: 0.005,
    }, 500)
  }, [currentLocation])

  const handleRecenter = () => {
    if (!currentLocation) return
    mapRef.current?.animateToRegion({
      latitude:      currentLocation.latitude,
      longitude:     currentLocation.longitude,
      latitudeDelta:  0.005,
      longitudeDelta: 0.005,
    }, 400)
  }

  const handleStart = async () => {
    if (status !== 'granted') {
      Alert.alert('GPS belum diizinkan', 'Aktifkan izin lokasi di pengaturan.')
      return
    }
    await startTracking()
    start()
    setTrackingState('running')
  }

  const handlePause = async () => {
    await stopTracking()
    pause()
    setTrackingState('paused')
  }

  const handleResume = async () => {
    await startTracking()
    start()
    setTrackingState('running')
  }

  const handleFinish = () => {
    Alert.alert('Selesai?', 'Aktivitas akan disimpan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Selesai',
        onPress: async () => {
          await stopTracking()
          pause()
          const activity = await saveActivity({
            type:            'run',
            coordinates,
            durationSeconds:  seconds,
            distanceMeters:   metrics.distanceMeters,
            calories:         metrics.calories,
            elevationGain:    metrics.elevationGain,
            startedAt:        new Date(coordinates[0]?.timestamp ?? Date.now()).toISOString(),
          })
          reset()
          navigation.navigate('ActivitySummary', { activity })
        },
      },
    ])
  }

  const polylineCoords = coordinates.map(c => ({ latitude: c.latitude, longitude: c.longitude }))

  return (
    <View style={s.container}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        followsUserLocation={false}
        showsMyLocationButton={false}
        customMapStyle={liveMapStyle}
      >
        {polylineCoords.length > 1 && (
          <Polyline coordinates={polylineCoords} strokeColor="#eea400" strokeWidth={4} />
        )}
        {polylineCoords.length > 0 && (
          <Marker coordinate={polylineCoords[0]} pinColor="green" />
        )}
        {polylineCoords.length > 1 && (
          <Marker coordinate={polylineCoords[polylineCoords.length - 1]} pinColor="white" />
        )}
      </MapView>

      {/* UI layer on top of map */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">

        {/* Top overlay: GPS badge + close */}
        <SafeAreaView edges={['top']}>
          <View style={s.topBar}>
            <View style={s.gpsBadge}>
              <View style={s.gpsDot} />
              <Text style={s.gpsBadgeText}>GPS</Text>
            </View>
            <TouchableOpacity style={s.settingsBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Spacer + recenter button */}
        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end', paddingRight: 16, paddingBottom: 8 }} pointerEvents="box-none">
          {currentLocation && (
            <TouchableOpacity style={s.recenterBtn} onPress={handleRecenter}>
              <Ionicons name="locate" size={20} color="#1A1A2E" />
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom panel */}
        <View style={s.panel}>

          {/* Main distance */}
          <View style={s.distanceRow}>
            <Text style={s.distanceNum}>{metrics.distanceKm}</Text>
            <Text style={s.distanceUnit}>KM</Text>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statVal}>{duration}</Text>
              <Text style={s.statLbl}>DURASI</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statVal}>{trackingState === 'idle' ? '--:--' : metrics.paceFormatted}</Text>
              <Text style={s.statLbl}>PACE</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statVal}>{metrics.calories}</Text>
              <Text style={s.statLbl}>KALORI</Text>
            </View>
          </View>

          {/* Controls */}
          {trackingState === 'idle' ? (
            <TouchableOpacity style={s.btnStart} onPress={handleStart}>
              <Text style={s.btnStartText}>Mulai Lari</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.controls}>
              {/* Lock button */}
              <TouchableOpacity
                style={[s.btnSecondary, locked && s.btnLocked]}
                onPress={() => setLocked(v => !v)}
              >
                <Ionicons
                  name={locked ? 'lock-closed' : 'lock-open'}
                  size={22}
                  color={locked ? '#eea400' : '#fff'}
                />
              </TouchableOpacity>

              {/* Play / Pause */}
              <TouchableOpacity
                style={s.btnCenter}
                onPress={trackingState === 'running' ? handlePause : handleResume}
              >
                <Ionicons
                  name={trackingState === 'running' ? 'pause' : 'play'}
                  size={28}
                  color="#1A1A2E"
                />
              </TouchableOpacity>

              {/* Stop */}
              <TouchableOpacity
                style={[s.btnSecondary, locked && s.btnDisabled]}
                onPress={handleFinish}
                disabled={locked}
              >
                <Ionicons
                  name="stop"
                  size={22}
                  color={locked ? '#555' : '#fff'}
                />
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </View>
  )
}
