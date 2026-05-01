import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  ActivityIndicator, StyleSheet, Pressable, FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import Svg, { Path, Circle } from 'react-native-svg'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types/activity'
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

type FilterOption = 'Semua' | 'Lari' | 'Bersepeda' | 'Jalan'
type MonthGroup = { month: string; data: SupabaseActivity[] }
type Nav = NativeStackNavigationProp<RootStackParamList>

const FILTER_TYPE_MAP: Record<FilterOption, string | null> = {
  Semua:     null,
  Lari:      'run',
  Bersepeda: 'ride',
  Jalan:     'walk',
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(2)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatPace(meters: number, seconds: number): string {
  if (meters === 0) return "--'--\""
  const paceSeconds = seconds / (meters / 1000)
  const min = Math.floor(paceSeconds / 60)
  const sec = Math.round(paceSeconds % 60)
  return `${min}'${String(sec).padStart(2, '0')}"`
}

const DAY_ID   = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const MONTH_FULL  = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function formatDate(isoString: string): { day: string; date: string } {
  const d = new Date(isoString)
  return {
    day:  DAY_ID[d.getDay()],
    date: `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`,
  }
}

function groupByMonth(activities: SupabaseActivity[]): MonthGroup[] {
  const map = new Map<string, SupabaseActivity[]>()
  for (const a of activities) {
    const d   = new Date(a.started_at)
    const key = `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(a)
  }
  return Array.from(map.entries()).map(([month, data]) => ({ month, data }))
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

  return polyline.map((p, i) => {
    const x = padding + ((p.lng - minLng) / rangeX) * w
    const y = padding + ((maxLat - p.lat) / rangeY) * h
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function toActivity(a: SupabaseActivity): Activity {
  return {
    id:              a.id,
    type:            (a.type as Activity['type']) ?? 'run',
    coordinates:     (a.gps_polyline ?? []).map(p => ({
      latitude:  p.lat,
      longitude: p.lng,
      altitude:  null,
      timestamp: new Date(a.started_at).getTime(),
    })),
    durationSeconds: a.duration_seconds,
    distanceMeters:  a.distance_meters,
    calories:        a.calories        ?? 0,
    elevationGain:   a.elevation_gain  ?? 0,
    startedAt:       a.started_at,
    synced:          true,
  }
}

// ─── Mini Route Map ───────────────────────────────────────────
const MAP_W = 72, MAP_H = 64, MAP_PAD = 6

function MiniRouteMap({ polyline }: { polyline: GpsPoint[] | null }) {
  if (!polyline || polyline.length < 2) {
    return <View style={s.miniMapEmpty} />
  }

  const d = normalizePath(polyline, MAP_W, MAP_H, MAP_PAD)

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
        <Path
          d={d}
          stroke={C.yellow}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={sx} cy={sy} r={3} fill={C.green} />
        <Circle cx={ex} cy={ey} r={3} fill={C.text} />
      </Svg>
    </View>
  )
}

// ─── Activity Card ────────────────────────────────────────────
function ActivityCard({
  item,
  onPress,
}: {
  item: SupabaseActivity
  onPress: () => void
}) {
  const { day, date } = formatDate(item.started_at)
  const dist          = formatDistance(item.distance_meters)
  const dur           = formatDuration(item.duration_seconds)
  const pace          = formatPace(item.distance_meters, item.duration_seconds)

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      {/* Left */}
      <View style={{ flex: 1 }}>
        <Text style={s.cardDate}>{day}, {date}</Text>

        <View style={s.cardStats}>
          {/* Distance */}
          <View style={s.cardStatGroup}>
            <Text style={s.cardDistNum}>{dist}</Text>
            <Text style={s.cardDistUnit}>km</Text>
          </View>

          {/* Duration */}
          <View style={s.cardStatGroup}>
            <Text style={s.cardStatVal}>{dur}</Text>
          </View>

          {/* Pace */}
          <View style={s.cardStatGroup}>
            <Text style={s.cardStatVal}>{pace}</Text>
            <Text style={s.cardPaceUnit}>/km</Text>
          </View>
        </View>
      </View>

      {/* Mini map */}
      <MiniRouteMap polyline={item.gps_polyline} />
    </TouchableOpacity>
  )
}

// ─── Screen ──────────────────────────────────────────────────
export default function RiwayatScreen() {
  const navigation              = useNavigation<Nav>()
  const { user }                = useAuth()
  const [filter, setFilter]     = useState<FilterOption>('Semua')
  const [modalVisible, setModal] = useState(false)

  const { data: activities = [], isLoading } = useQuery<SupabaseActivity[]>({
    queryKey: ['activities', user?.id],
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

  const filtered = filter === 'Semua'
    ? activities
    : activities.filter(a => a.type === FILTER_TYPE_MAP[filter])

  const groups = groupByMonth(filtered)

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Riwayat</Text>

        <TouchableOpacity style={s.filterBtn} onPress={() => setModal(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={s.filterBtnText}>{filter}</Text>
            <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.yellow} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="walk-outline" size={56} color="rgba(255,255,255,0.2)" style={{ marginBottom: 12 }} />
          <Text style={s.emptyTitle}>Belum ada aktivitas</Text>
          <Text style={s.emptySub}>Mulai lari pertamamu!</Text>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {groups.map(group => (
            <View key={group.month}>
              <Text style={s.monthLabel}>{group.month}</Text>
              {group.data.map(item => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('ActivitySummary', { activity: toActivity(item) })}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setModal(false)}>
          <Pressable style={s.modalCard} onPress={e => e.stopPropagation()}>
            {(['Semua', 'Lari', 'Bersepeda', 'Jalan'] as FilterOption[]).map(opt => (
              <TouchableOpacity
                key={opt}
                style={s.modalOption}
                onPress={() => { setFilter(opt); setModal(false) }}
              >
                <Text style={[s.modalOptionText, filter === opt && s.modalOptionActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: 24,
    paddingTop:        16,
    paddingBottom:     8,
  },
  title: {
    fontSize:   26,
    fontWeight: '800',
    color:      C.text,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical:    7,
    backgroundColor:   C.bg3,
    borderRadius:      20,
    borderWidth:        1,
    borderColor:       'rgba(255,255,255,0.08)',
  },
  filterBtnText: {
    fontSize: 13,
    color:    'rgba(255,255,255,0.7)',
  },

  // Month label
  monthLabel: {
    fontSize:          13,
    fontWeight:        '600',
    color:             'rgba(255,255,255,0.4)',
    paddingHorizontal: 24,
    paddingTop:        20,
    paddingBottom:     8,
  },

  // Card
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    marginHorizontal: 16,
    marginBottom:     8,
    backgroundColor: C.bg2,
    borderRadius:    16,
    borderWidth:      1,
    borderColor:     C.border,
    paddingHorizontal: 14,
    paddingVertical:  12,
  },
  cardDate: {
    fontSize:    11,
    color:       'rgba(255,255,255,0.4)',
    marginBottom: 6,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:           16,
  },
  cardStatGroup: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap:            3,
  },
  cardDistNum: {
    fontSize:   20,
    fontWeight: '800',
    color:      C.text,
  },
  cardDistUnit: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.5)',
  },
  cardStatVal: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.text,
  },
  cardPaceUnit: {
    fontSize: 11,
    color:    'rgba(255,255,255,0.4)',
  },

  // Mini map
  miniMap: {
    width:        72,
    height:       64,
    backgroundColor: C.bg,
    borderRadius: 10,
    overflow:     'hidden',
    marginLeft:   12,
  },
  miniMapEmpty: {
    width:        72,
    height:       64,
    backgroundColor: C.bg,
    borderRadius: 10,
    marginLeft:   12,
  },

  // States
  center: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },
  emptyIcon: {
    fontSize:     48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize:   16,
    fontWeight: '600',
    color:      'rgba(255,255,255,0.5)',
  },
  emptySub: {
    fontSize:  13,
    color:     'rgba(255,255,255,0.3)',
    marginTop:  4,
  },

  // Modal
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  modalCard: {
    backgroundColor: C.bg2,
    borderRadius:    16,
    paddingVertical: 8,
    width:           220,
    borderWidth:      1,
    borderColor:     C.border,
  },
  modalOption: {
    paddingHorizontal: 20,
    paddingVertical:   14,
  },
  modalOptionText: {
    fontSize: 15,
    color:    C.textDim,
  },
  modalOptionActive: {
    color:      C.yellow,
    fontWeight: '700',
  },
})
