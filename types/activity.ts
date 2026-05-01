export type ActivityType = 'run' | 'ride' | 'walk'

export type Coordinate = {
  latitude: number
  longitude: number
  altitude: number | null
  timestamp: number
}

export type Activity = {
  id: string
  type: ActivityType
  coordinates: Coordinate[]
  durationSeconds: number
  distanceMeters: number
  calories: number
  elevationGain: number
  startedAt: string
  synced: boolean
}
