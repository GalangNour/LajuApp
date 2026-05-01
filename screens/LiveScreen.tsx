// screens/LiveTrackingScreen.tsx
import { useEffect, useRef, useState } from 'react'
import {
    View, Text, TouchableOpacity, StyleSheet,
    SafeAreaView, Alert, Dimensions
} from 'react-native'
import MapView, { Polyline, Marker } from 'react-native-maps'
import { useKeepAwake } from 'expo-keep-awake'
import { useGps } from '../hooks/useGps'
import { useMetrics } from '../hooks/useMetrix'
import { useStopwatch } from '../hooks/useStopwatch'
import { useLocationPermission } from '../hooks/useLocationPermission'
import { saveActivity } from '../lib/activityStorage'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'

type TrackingState = 'idle' | 'running' | 'paused'

export default function LiveTrackingScreen() {
    useKeepAwake() // layar tidak mati saat tracking

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Live'>>()
    const mapRef = useRef<MapView>(null)
    const [trackingState, setTrackingState] = useState<TrackingState>('idle')
    const [activityType, setActivityType] = useState<'run' | 'ride' | 'walk'>('run')

    const { status } = useLocationPermission()
    const { currentLocation, coordinates, startTracking, stopTracking } = useGps()
    const { seconds, formatted: duration, start, pause, reset } = useStopwatch()
    const metrics = useMetrics(coordinates, seconds)

    // Auto-follow lokasi user di peta
    useEffect(() => {
        if (!currentLocation) return
        mapRef.current?.animateToRegion({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 500)
    }, [currentLocation])

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
        Alert.alert(
            'Selesai?',
            'Aktivitas akan disimpan.',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Selesai',
                    onPress: async () => {
                        await stopTracking()
                        pause()

                        const activity = await saveActivity({
                            type: activityType,
                            coordinates,
                            durationSeconds: seconds,
                            distanceMeters: metrics.distanceMeters,
                            calories: metrics.calories,
                            elevationGain: metrics.elevationGain,
                            startedAt: new Date(
                                coordinates[0]?.timestamp ?? Date.now()
                            ).toISOString(),
                        })

                        reset()
                        // Navigasi ke summary screen, bawa data aktivitas
                        navigation.navigate('ActivitySummary', { activity })
                    },
                },
            ]
        )
    }

    const polylineCoords = coordinates.map((c) => ({
        latitude: c.latitude,
        longitude: c.longitude,
    }))

    return (
        <SafeAreaView style={styles.container}>
            {/* Peta */}
            <MapView
                ref={mapRef}
                style={styles.map}
                showsUserLocation
                followsUserLocation={false} // kita handle manual biar lebih smooth
                showsMyLocationButton={false}
            >
                {/* Garis rute */}
                {polylineCoords.length > 1 && (
                    <Polyline
                        coordinates={polylineCoords}
                        strokeColor="#1D9E75"
                        strokeWidth={4}
                    />
                )}

                {/* Titik mulai */}
                {polylineCoords.length > 0 && (
                    <Marker coordinate={polylineCoords[0]} title="Mulai" pinColor="green" />
                )}
            </MapView>

            {/* Panel metrik bawah */}
            <View style={styles.panel}>
                {/* Pilih tipe aktivitas — hanya saat belum mulai */}
                {trackingState === 'idle' && (
                    <View style={styles.typeRow}>
                        {(['run', 'ride', 'walk'] as const).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeBtn, activityType === type && styles.typeBtnActive]}
                                onPress={() => setActivityType(type)}
                            >
                                <Text style={[styles.typeText, activityType === type && styles.typeTextActive]}>
                                    {type === 'run' ? '🏃 Lari' : type === 'ride' ? '🚴 Bersepeda' : '🚶 Jalan'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Metrik utama */}
                <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                        <Text style={styles.metricValue}>{metrics.distanceKm}</Text>
                        <Text style={styles.metricLabel}>km</Text>
                    </View>
                    <View style={styles.metric}>
                        <Text style={styles.metricValue}>{duration}</Text>
                        <Text style={styles.metricLabel}>durasi</Text>
                    </View>
                    <View style={styles.metric}>
                        <Text style={styles.metricValue}>
                            {trackingState === 'idle' ? "--:--" : metrics.paceFormatted}
                        </Text>
                        <Text style={styles.metricLabel}>min/km</Text>
                    </View>
                </View>

                {/* Metrik sekunder */}
                <View style={styles.secondaryRow}>
                    <Text style={styles.secondary}>🔥 {metrics.calories} kkal</Text>
                    <Text style={styles.secondary}>⛰ {metrics.elevationGain} m</Text>
                </View>

                {/* Tombol kontrol */}
                <View style={styles.controls}>
                    {trackingState === 'idle' && (
                        <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
                            <Text style={styles.btnText}>Mulai</Text>
                        </TouchableOpacity>
                    )}

                    {trackingState === 'running' && (
                        <>
                            <TouchableOpacity style={styles.btnPause} onPress={handlePause}>
                                <Text style={styles.btnText}>Pause</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnStop} onPress={handleFinish}>
                                <Text style={styles.btnText}>Selesai</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {trackingState === 'paused' && (
                        <>
                            <TouchableOpacity style={styles.btnStart} onPress={handleResume}>
                                <Text style={styles.btnText}>Lanjut</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnStop} onPress={handleFinish}>
                                <Text style={styles.btnText}>Selesai</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}

const { height } = Dimensions.get('window')

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    map: { height: height * 0.55 },
    panel: {
        flex: 1, backgroundColor: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, marginTop: -20,
    },
    typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    typeBtn: {
        flex: 1, paddingVertical: 8, borderRadius: 8,
        borderWidth: 0.5, borderColor: '#ddd', alignItems: 'center'
    },
    typeBtnActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
    typeText: { fontSize: 13, color: '#666' },
    typeTextActive: { color: '#fff', fontWeight: '600' },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
    metric: { alignItems: 'center' },
    metricValue: { fontSize: 32, fontWeight: '700', color: '#111' },
    metricLabel: { fontSize: 12, color: '#888', marginTop: 2 },
    secondaryRow: {
        flexDirection: 'row', justifyContent: 'center', gap: 32,
        marginBottom: 20, paddingTop: 12,
        borderTopWidth: 0.5, borderTopColor: '#eee'
    },
    secondary: { fontSize: 14, color: '#555' },
    controls: { flexDirection: 'row', gap: 12 },
    btnStart: {
        flex: 1, backgroundColor: '#1D9E75',
        padding: 18, borderRadius: 14, alignItems: 'center'
    },
    btnPause: {
        flex: 1, backgroundColor: '#F5A623',
        padding: 18, borderRadius: 14, alignItems: 'center'
    },
    btnStop: {
        flex: 1, backgroundColor: '#E24B4A',
        padding: 18, borderRadius: 14, alignItems: 'center'
    },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})