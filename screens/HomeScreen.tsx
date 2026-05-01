import { useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import Svg, { Path, Circle } from 'react-native-svg'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { RootStackParamList } from '../App'
import { colors } from '../styles/theme'

// ─── Colors ─────────────────────────────────────────────────
const C = {
  bg:        colors.surface,
  bg2:       colors.surface2,
  bg3:       colors.surface3,
  yellow:    colors.secondary,
  green:     colors.successAlt,
  text:      colors.onSurface,
  textDim:   colors.onSurfaceDim,
  border:    colors.surfaceBorder,
}

const WEEKLY_TARGET_KM = 30

// ─── Types ───────────────────────────────────────────────────
type GpsPoint = { lat: number; lng: number }

type SupabaseActivity = {
  id: string
  type: string
  distance_meters: number
  duration_seconds: number
  calories: number | null
  elevation_gain: number | null
  gps_polyline: GpsPoint[] | null
  started_at: string
}

type Profile = { full_name: string | null }

type Nav = NativeStackNavigationProp<RootStackParamList>

// ─── Helpers ─────────────────────────────────────────────────
function getWeeklyDistanceKm(activities: SupabaseActivity[]): number {
  const now = new Date()
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  return (
    activities
      .filter(a => new Date(a.started_at) >= monday)
      .reduce((sum, a) => sum + a.distance_meters, 0) / 1000
  )
}

function calcStreak(activities: SupabaseActivity[]): number {
  if (!activities.length) return 0
  const daySet = new Set(
    activities.map(a => {
      const d = new Date(a.started_at)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    })
  )
  const cur = new Date()
  const todayKey = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`
  if (!daySet.has(todayKey)) cur.setDate(cur.getDate() - 1)
  let streak = 0
  while (true) {
    const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`
    if (!daySet.has(key)) break
    streak++
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

function formatTotalDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatAvgPace(totalKm: number, totalSeconds: number): string {
  if (totalKm === 0) return "--'--\""
  const pace = totalSeconds / totalKm
  const min  = Math.floor(pace / 60)
  const sec  = Math.round(pace % 60)
  return `${min}'${String(sec).padStart(2, '0')}"`
}

const DAY_ID   = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const MONTH_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function formatFullDate(iso: string): string {
  const d = new Date(iso)
  return `${DAY_ID[d.getDay()]}, ${d.getDate()} ${MONTH_ID[d.getMonth()]} ${d.getFullYear()}`
}

function normalizePath(
  polyline: GpsPoint[],
  width: number,
  height: number,
  padding: number,
): string {
  if (polyline.length < 2) return ''
  const lats   = polyline.map(p => p.lat)
  const lngs   = polyline.map(p => p.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const rangeY = maxLat - minLat || 0.0001
  const rangeX = maxLng - minLng || 0.0001
  const w = width  - padding * 2
  const h = height - padding * 2
  return polyline
    .map((p, i) => {
      const x = padding + ((p.lng - minLng) / rangeX) * w
      const y = padding + ((maxLat - p.lat) / rangeY) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// ─── Mini Route Map ───────────────────────────────────────────
const MAP_W = 88, MAP_H = 72, MAP_PAD = 8

function LastActivityMap({ polyline }: { polyline: GpsPoint[] | null }) {
  if (!polyline || polyline.length < 2) {
    return <View style={s.miniMapEmpty} />
  }

  const d      = normalizePath(polyline, MAP_W, MAP_H, MAP_PAD)
  const lats   = polyline.map(p => p.lat)
  const lngs   = polyline.map(p => p.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const rangeY = maxLat - minLat || 0.0001
  const rangeX = maxLng - minLng || 0.0001
  const w = MAP_W - MAP_PAD * 2, h = MAP_H - MAP_PAD * 2

  const first = polyline[0]
  const last  = polyline[polyline.length - 1]
  const sx = MAP_PAD + ((first.lng - minLng) / rangeX) * w
  const sy = MAP_PAD + ((maxLat - first.lat) / rangeY) * h
  const ex = MAP_PAD + ((last.lng  - minLng) / rangeX) * w
  const ey = MAP_PAD + ((maxLat - last.lat)  / rangeY) * h

  return (
    <View style={s.miniMap}>
      <Svg width={MAP_W} height={MAP_H}>
        <Path d={d} stroke={C.yellow} strokeWidth={2} fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={sx} cy={sy} r={3} fill={C.green} />
        <Circle cx={ex} cy={ey} r={3} fill={C.text} />
      </Svg>
    </View>
  )
}

// ─── Skeleton ────────────────────────────────────────────────
function SkeletonHome() {
  const anim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.6, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 80 }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Animated.View style={[s.skeletonBlock, { width: 120, height: 14, opacity: anim }]} />
          <Animated.View style={[s.skeletonBlock, { width: 190, height: 26, opacity: anim }]} />
          <Animated.View style={[s.skeletonBlock, { width: 150, height: 26, opacity: anim }]} />
        </View>
        <Animated.View style={[s.skeletonBlock, { width: 40, height: 40, borderRadius: 20, opacity: anim }]} />
      </View>
      {/* Cards row */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
        <Animated.View style={[s.skeletonBlock, { flex: 1, height: 130, borderRadius: 16, opacity: anim }]} />
        <Animated.View style={[s.skeletonBlock, { width: 90, height: 130, borderRadius: 16, opacity: anim }]} />
      </View>
      <Animated.View style={[s.skeletonBlock, { height: 100, marginTop: 10, borderRadius: 16, opacity: anim }]} />
      <Animated.View style={[s.skeletonBlock, { height: 140, marginTop: 10, borderRadius: 16, opacity: anim }]} />
      <Animated.View style={[s.skeletonBlock, { height: 58, marginTop: 20, borderRadius: 16, opacity: anim }]} />
    </ScrollView>
  )
}

// ─── Screen ──────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const { user }   = useAuth()

  const { data: activities = [], isLoading: loadingActs } = useQuery<SupabaseActivity[]>({
    queryKey: ['home-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user?.id,
  })

  const { data: profile, isLoading: loadingProfile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      return data ?? null
    },
    enabled: !!user?.id,
  })

  if (loadingActs || loadingProfile) return <SkeletonHome />

  // ── Derived stats ──
  const firstName     = profile?.full_name?.split(' ')[0]
                     ?? user?.email?.split('@')[0]
                     ?? 'Kamu'
  const weeklyDist    = getWeeklyDistanceKm(activities)
  const streak        = calcStreak(activities)
  const lastActivity  = activities[0] ?? null
  const totalDistKm   = activities.reduce((sum, a) => sum + a.distance_meters, 0) / 1000
  const totalDurSec   = activities.reduce((sum, a) => sum + a.duration_seconds, 0)
  const totalCalories = activities.reduce((sum, a) => sum + (a.calories ?? 0), 0)
  const avgPace       = formatAvgPace(totalDistKm, totalDurSec)
  const progressPct   = Math.min((weeklyDist / WEEKLY_TARGET_KM) * 100, 100)

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>Hai, {firstName}! 👋</Text>
            <Text style={s.headline}>Hari ini kamu</Text>
            <Text style={s.headline}>
              {'siap '}<Text style={{ color: C.yellow }}>LAJU?</Text>
            </Text>
          </View>
          <TouchableOpacity style={s.bellBtn}>
            <Ionicons name="notifications-outline" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* ── Weekly + Streak ── */}
        <View style={s.cardRow}>
          {/* Weekly card */}
          <View style={[s.card, { flex: 1 }]}>
            <Text style={s.cardLabel}>Total Minggu Ini</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={s.bigNum}>{weeklyDist.toFixed(1)}</Text>
              <Text style={s.bigUnit}>km</Text>
            </View>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={s.progressTarget}>Target {WEEKLY_TARGET_KM} km</Text>
          </View>

          {/* Streak card */}
          <View style={[s.card, { width: 90 }]}>
            <Text style={s.cardLabel}>Streak</Text>
            <Text style={s.streakNum}>{streak}</Text>
            <Text style={s.streakUnit}>hari</Text>
            <Ionicons name="flame" size={22} color={C.yellow} style={{ marginTop: 4 }} />
          </View>
        </View>

        {/* ── Last activity ── */}
        <View style={[s.card, s.lastCard]}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardLabel}>Terakhir Lari</Text>
            {lastActivity ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={s.bigNum}>
                    {(lastActivity.distance_meters / 1000).toFixed(2)}
                  </Text>
                  <Text style={s.bigUnit}>km</Text>
                </View>
                <Text style={s.lastDate}>{formatFullDate(lastActivity.started_at)}</Text>
              </>
            ) : (
              <Text style={s.noActivity}>Belum ada aktivitas</Text>
            )}
          </View>
          <LastActivityMap polyline={lastActivity?.gps_polyline ?? null} />
        </View>

        {/* ── All-time stats grid ── */}
        <View style={s.grid}>
          <View style={s.gridRow}>
            <View style={[s.gridCell, s.bRight, s.bBottom]}>
              <Text style={s.gridLabel}>Jarak</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                <Text style={s.gridVal}>{totalDistKm.toFixed(1)}</Text>
                <Text style={s.gridUnit}>km</Text>
              </View>
            </View>
            <View style={[s.gridCell, s.bBottom]}>
              <Text style={s.gridLabel}>Waktu</Text>
              <Text style={s.gridVal}>{formatTotalDuration(totalDurSec)}</Text>
            </View>
          </View>
          <View style={s.gridRow}>
            <View style={[s.gridCell, s.bRight]}>
              <Text style={s.gridLabel}>Pace</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                <Text style={s.gridVal}>{avgPace}</Text>
                <Text style={s.gridUnit}>/km</Text>
              </View>
            </View>
            <View style={s.gridCell}>
              <Text style={s.gridLabel}>Kalori</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
                <Text style={s.gridVal}>{totalCalories.toLocaleString('id-ID')}</Text>
                <Text style={s.gridUnit}>kcal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── CTA ── */}
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => navigation.navigate('Live')}
          activeOpacity={0.85}
        >
          <Text style={s.ctaBtnText}>Mulai Lari</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const DIVIDER = C.border

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 80 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    paddingTop:    16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize:    14,
    fontWeight:  '500',
    color:       'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  headline: {
    fontSize:   26,
    fontWeight: '800',
    color:      C.text,
    lineHeight: 32,
  },
  bellBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: C.bg2,
    borderWidth:      1,
    borderColor:     'rgba(255,255,255,0.08)',
    justifyContent:  'center',
    alignItems:      'center',
    alignSelf:       'flex-start',
    marginTop:        4,
  },

  // Cards
  cardRow: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     24,
  },
  card: {
    backgroundColor: C.bg2,
    borderRadius:    16,
    padding:         16,
    borderWidth:      1,
    borderColor:     C.border,
  },
  lastCard: {
    flexDirection: 'row',
    alignItems:    'center',
    marginTop:     10,
  },
  cardLabel: {
    fontSize:    11,
    fontWeight:  '500',
    color:       'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  bigNum: {
    fontSize:   28,
    fontWeight: '800',
    color:      C.text,
  },
  bigUnit: {
    fontSize: 14,
    color:    'rgba(255,255,255,0.5)',
  },

  // Progress bar
  progressTrack: {
    height:          4,
    borderRadius:    2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop:       10,
    overflow:        'hidden',
  },
  progressFill: {
    height:          4,
    borderRadius:    2,
    backgroundColor: C.yellow,
  },
  progressTarget: {
    fontSize:  11,
    color:     'rgba(255,255,255,0.3)',
    marginTop:  6,
  },

  // Streak
  streakNum: {
    fontSize:   36,
    fontWeight: '900',
    color:      C.text,
    lineHeight: 40,
  },
  streakUnit: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.4)',
  },

  // Last activity
  lastDate: {
    fontSize:  12,
    color:     'rgba(255,255,255,0.35)',
    marginTop:  6,
  },
  noActivity: {
    fontSize:  14,
    color:     'rgba(255,255,255,0.3)',
    marginTop:  8,
  },

  // Mini map
  miniMap: {
    width:           MAP_W,
    height:          MAP_H,
    backgroundColor: C.bg,
    borderRadius:    10,
    overflow:        'hidden',
    marginLeft:      12,
  },
  miniMapEmpty: {
    width:           MAP_W,
    height:          MAP_H,
    backgroundColor: C.bg,
    borderRadius:    10,
    marginLeft:      12,
  },

  // Stats grid
  grid: {
    backgroundColor: C.bg2,
    borderRadius:    16,
    borderWidth:      1,
    borderColor:     C.border,
    overflow:        'hidden',
    marginTop:       10,
  },
  gridRow: { flexDirection: 'row' },
  gridCell: { flex: 1, padding: 16 },
  gridLabel: {
    fontSize:    11,
    fontWeight:  '500',
    color:       'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  gridVal:  { fontSize: 22, fontWeight: '800', color: C.text },
  gridUnit: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  bRight:   { borderRightWidth:  1, borderRightColor:  DIVIDER },
  bBottom:  { borderBottomWidth: 1, borderBottomColor: DIVIDER },

  // CTA
  ctaBtn: {
    height:          58,
    backgroundColor: C.yellow,
    borderRadius:    16,
    justifyContent:  'center',
    alignItems:      'center',
    marginTop:       20,
    marginBottom:    32,
    shadowColor:     C.yellow,
    shadowOpacity:   0.35,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 8 },
    elevation:       10,
  },
  ctaBtnText: {
    fontSize:   17,
    fontWeight: '800',
    color:      C.bg,
  },

  // Skeleton
  skeletonBlock: {
    backgroundColor: C.bg3,
    borderRadius:    10,
  },
})
