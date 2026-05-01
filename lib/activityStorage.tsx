import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Activity } from '../types/activity'

export type { Activity } from '../types/activity'

const KEY = 'activities'

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
