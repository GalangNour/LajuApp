import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Coordinate } from '../hooks/useGps'

const KEY = 'activities'

export type Activity = {
  id: string
  type: 'run' | 'ride' | 'walk'
  coordinates: Coordinate[]
  durationSeconds: number
  distanceMeters: number
  calories: number
  elevationGain: number
  startedAt: string
  synced: boolean
}

export async function saveActivity(data: Omit<Activity, 'id' | 'synced'>): Promise<Activity> {
  const activity: Activity = { ...data, id: `activity_${Date.now()}`, synced: false }
  const list = await getActivities()
  list.unshift(activity)
  await AsyncStorage.setItem(KEY, JSON.stringify(list))
  return activity
}

export async function getActivities(): Promise<Activity[]> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}
