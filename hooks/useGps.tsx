import { useState, useCallback } from 'react'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'

export const LOCATION_TASK = 'background-location-task'

export type Coordinate = {
  latitude: number
  longitude: number
  altitude: number | null
  timestamp: number
}

type LocationCallback = (coord: Coordinate) => void
let _onLocation: LocationCallback | null = null

// Harus dipanggil di module level — dipindah ke index.js
export function defineLocationTask() {
  if (TaskManager.isTaskDefined(LOCATION_TASK)) return

  TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: any) => {
    if (error || !data) return
    const [loc] = (data as { locations: Location.LocationObject[] }).locations
    _onLocation?.({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      altitude: loc.coords.altitude,
      timestamp: loc.timestamp,
    })
  })
}

export function useGps() {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  const push = useCallback((coord: Coordinate) => {
    setCurrentLocation(coord)
    setCoordinates(prev => [...prev, coord])
  }, [])

  const startTracking = useCallback(async () => {
    setCoordinates([])
    setError(null)

    try {
      const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
      if (already) await Location.stopLocationUpdatesAsync(LOCATION_TASK)

      _onLocation = push
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Laju sedang merekam',
          notificationBody: 'GPS aktif di background',
          notificationColor: '#1D9E75',
        },
      })
      setIsTracking(true)
    } catch (e: any) {
      setError(e?.message ?? 'Gagal memulai GPS')
    }
  }, [push])

  const stopTracking = useCallback(async () => {
    _onLocation = null
    try {
      const active = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
      if (active) await Location.stopLocationUpdatesAsync(LOCATION_TASK)
    } catch { /* sudah berhenti */ }
    setIsTracking(false)
  }, [])

  return { currentLocation, coordinates, error, isTracking, startTracking, stopTracking }
}
