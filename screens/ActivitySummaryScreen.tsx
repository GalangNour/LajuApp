import { useEffect, useRef, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import MapView, { Polyline, Marker } from 'react-native-maps'
import * as Sharing from 'expo-sharing'
import ViewShot from 'react-native-view-shot'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Activity } from '../types/activity'
import type { RootStackParamList } from '../App'
import { colors, fonts, fontSize } from '../styles/theme'
import s, { darkMapStyle } from '../styles/activitySummary'

type Nav  = NativeStackNavigationProp<RootStackParamList, 'ActivitySummary'>
type Route = RouteProp<RootStackParamList, 'ActivitySummary'>

// ─── Helpers ───────────────────────────────────────────────
function formatDuration(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function formatPace(km: number, s: number) {
  if (km === 0) return '--:--'
  const min = Math.floor(s / 60 / km)
  const sec = Math.round((s / 60 / km - min) * 60)
  return `${min}'${String(sec).padStart(2,'0')}"`
}

function calcSplits(coords: Activity['coordinates']) {
  if (coords.length < 2) return []
  const R = 6371000
  const raw: { km: number; paceSeconds: number }[] = []
  let accumulated = 0, splitStartTime = coords[0].timestamp, kmCount = 1

  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1], b = coords[i]
    const φ1 = (a.latitude * Math.PI) / 180, φ2 = (b.latitude * Math.PI) / 180
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180
    const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
    accumulated += R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    if (accumulated >= 1000) {
      raw.push({ km: kmCount++, paceSeconds: (b.timestamp - splitStartTime) / 1000 })
      accumulated -= 1000
      splitStartTime = b.timestamp
    }
  }

  const best = Math.min(...raw.map(r => r.paceSeconds))
  return raw.map(r => ({
    km: r.km,
    pace: `${Math.floor(r.paceSeconds / 60)}'${String(Math.round(r.paceSeconds % 60)).padStart(2,'0')}"`,
    best: r.paceSeconds === best,
  }))
}

// ─── Screen ─────────────────────────────────────────────────
export default function ActivitySummaryScreen() {
  const navigation = useNavigation<Nav>()
  const { activity } = useRoute<Route>().params
  const { user } = useAuth()

  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const viewShotRef           = useRef<ViewShot>(null)

  const fadeAnim    = useRef(new Animated.Value(0)).current
  const slideAnim   = useRef(new Animated.Value(24)).current
  const counterAnim = useRef(new Animated.Value(0)).current
  const distanceKm  = activity.distanceMeters / 1000

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 1,           duration: 400,  useNativeDriver: true }),
      Animated.timing(slideAnim,   { toValue: 0,           duration: 400,  useNativeDriver: true }),
      Animated.timing(counterAnim, { toValue: distanceKm,  duration: 1200, useNativeDriver: false }),
    ]).start()
  }, [])

  const handleSave = async () => {
    if (saved) return
    setSaving(true)
    try {
      const { error } = await supabase.from('activities').insert({
        user_id:          user?.id,
        type:             activity.type,
        distance_meters:  activity.distanceMeters,
        duration_seconds: activity.durationSeconds,
        calories:         activity.calories,
        elevation_gain:   activity.elevationGain,
        started_at:       activity.startedAt,
        gps_polyline:     activity.coordinates.map(c => ({
          lat: c.latitude, lng: c.longitude, alt: c.altitude, ts: c.timestamp,
        })),
      })
      if (error) throw error
      setSaved(true)
      Alert.alert('Tersimpan! 🎉', 'Aktivitas berhasil disimpan.', [
        { text: 'Lihat Riwayat', onPress: () => navigation.navigate('MainTabs') },
      ])
    } catch (e: any) {
      Alert.alert('Gagal menyimpan', e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.()
      if (!uri) return
      await Sharing.shareAsync(uri, { mimeType: 'image/png' })
    } catch {
      Alert.alert('Gagal berbagi')
    }
  }

  const pace    = formatPace(distanceKm, activity.durationSeconds)
  const duration = formatDuration(activity.durationSeconds)
  const splits  = calcSplits(activity.coordinates)
  const polyline = activity.coordinates.map(c => ({ latitude: c.latitude, longitude: c.longitude }))
  const avgLat  = polyline.reduce((s, c) => s + c.latitude,  0) / (polyline.length || 1)
  const avgLng  = polyline.reduce((s, c) => s + c.longitude, 0) / (polyline.length || 1)

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.onSurface} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Ringkasan Lari</Text>
            <TouchableOpacity style={s.iconBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Hero */}
            <View style={s.hero}>
              <Text style={s.heroTitle}>Lari selesai! 🔥</Text>
              <Text style={s.heroSub}>Kamu hebat hari ini.</Text>
            </View>

            {/* Peta */}
            {polyline.length > 1 ? (
              <View style={s.mapWrap}>
                <MapView
                  style={s.map}
                  initialRegion={{ latitude: avgLat, longitude: avgLng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  customMapStyle={darkMapStyle}
                >
                  <Polyline coordinates={polyline} strokeColor={colors.secondary} strokeWidth={4} />
                  <Marker coordinate={polyline[0]} pinColor="green" />
                  <Marker coordinate={polyline[polyline.length - 1]} pinColor="gold" />
                </MapView>
                <View style={s.mapBadge}>
                  <View style={s.gpsDot} />
                  <Text style={s.mapBadgeText}>GPS Akurat</Text>
                </View>
              </View>
            ) : (
              <View style={[s.mapWrap, s.mapPlaceholder]}>
                <Text style={{ color: colors.onSurfaceDim }}>Tidak ada data GPS</Text>
              </View>
            )}

            {/* Jarak utama */}
            <View style={s.mainStat}>
              <Animated.Text style={s.mainNumber}>
                {counterAnim.interpolate({
                  inputRange: [0, distanceKm || 1],
                  outputRange: ['0.00', distanceKm.toFixed(2)],
                })}
              </Animated.Text>
              <View style={s.mainUnitWrap}>
                <Text style={s.mainUnit}>KM</Text>
                <View style={s.progressBadge}>
                  <Text style={s.progressBadgeText}>🏅 10K Progress</Text>
                </View>
              </View>
            </View>

            {/* Stats grid */}
            <View style={s.statsGrid}>
              {[
                { val: duration,               lbl: 'Durasi' },
                { val: pace,                   lbl: 'Pace Avg' },
                { val: `${activity.calories}`, lbl: 'Kalori' },
              ].map((item, i) => (
                <View key={i} style={[s.statCell, i < 2 && s.statCellBorder]}>
                  <Text style={s.statVal}>{item.val}</Text>
                  <Text style={s.statLbl}>{item.lbl}</Text>
                </View>
              ))}
            </View>

            {/* Secondary stats */}
            <View style={s.secondaryRow}>
              {[
                { iconName: 'trending-up-outline' as const, val: `${activity.elevationGain}m`, lbl: 'Elevasi' },
                { iconName: 'heart-outline'        as const, val: '164 bpm',                   lbl: 'HR Avg' },
              ].map((item, i) => (
                <View key={i} style={s.secCard}>
                  <View style={s.secIcon}>
                    <Ionicons name={item.iconName} size={22} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={s.secVal}>{item.val}</Text>
                    <Text style={s.secLbl}>{item.lbl}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Insight */}
            <View style={s.insightCard}>
              <View style={s.insightIcon}>
                <Ionicons name="flash-outline" size={22} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.insightLabel}>INSIGHT</Text>
                <Text style={s.insightText}>
                  Pace kamu{' '}
                  <Text style={{ color: colors.secondary, fontFamily: fonts.bold }}>{pace}</Text>
                  {' '}— terus pertahankan!
                </Text>
              </View>
            </View>

            {/* Splits */}
            {splits.length > 0 && (
              <View style={s.splitsSection}>
                <Text style={s.sectionTitle}>Split per KM</Text>
                {splits.map((split, i) => (
                  <View key={i} style={s.splitRow}>
                    <Text style={s.splitKm}>KM {split.km}</Text>
                    <View style={s.splitBarWrap}>
                      <View style={[s.splitBar, { width: `${(1 - i / splits.length) * 80 + 20}%` }, split.best && s.splitBarBest]} />
                    </View>
                    <Text style={s.splitPace}>{split.pace}</Text>
                    {split.best && (
                      <View style={s.bestTag}><Text style={s.bestTagText}>BEST</Text></View>
                    )}
                  </View>
                ))}
              </View>
            )}

          </Animated.View>
        </ViewShot>

        {/* Buttons — di luar ViewShot */}
        <View style={s.btnGroup}>
          <TouchableOpacity style={[s.btnPrimary, saved && s.btnSaved]} onPress={handleSave} disabled={saving || saved}>
            {saving
              ? <ActivityIndicator color={colors.surface} />
              : <Text style={s.btnPrimaryText}>{saved ? '✓ Tersimpan' : 'Simpan Aktivitas'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecondary} onPress={handleShare}>
            <Text style={s.btnSecondaryText}>Bagikan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnDiscard}
            onPress={() => Alert.alert('Buang aktivitas?', 'Aktivitas tidak akan disimpan.', [
              { text: 'Batal', style: 'cancel' },
              { text: 'Buang', style: 'destructive', onPress: () => navigation.navigate('Home') },
            ])}
          >
            <Text style={s.btnDiscardText}>Buang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

