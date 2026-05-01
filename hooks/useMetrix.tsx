import { useMemo } from 'react'
import type { Coordinate } from './useGps'

function haversine(a: Coordinate, b: Coordinate): number {
  const R = 6371000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.latitude - a.latitude)
  const dLon = rad(b.longitude - a.longitude)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(x))
}

function formatPace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '--:--'
  return `${Math.floor(secPerKm / 60)}:${String(Math.floor(secPerKm % 60)).padStart(2, '0')}`
}

export function useMetrics(coordinates: Coordinate[], seconds: number) {
  return useMemo(() => {
    let distanceM = 0
    let elevationGain = 0

    for (let i = 1; i < coordinates.length; i++) {
      distanceM += haversine(coordinates[i - 1], coordinates[i])
      const dAlt = (coordinates[i].altitude ?? 0) - (coordinates[i - 1].altitude ?? 0)
      if (dAlt > 0) elevationGain += dAlt
    }

    const distanceKm = (distanceM / 1000).toFixed(2)
    const paceFormatted = formatPace(distanceM > 0 ? seconds / (distanceM / 1000) : 0)
    const calories = Math.round(distanceM / 1000 * 60)

    return { distanceKm, distanceMeters: Math.round(distanceM), calories, elevationGain: Math.round(elevationGain), paceFormatted }
  }, [coordinates, seconds])
}
