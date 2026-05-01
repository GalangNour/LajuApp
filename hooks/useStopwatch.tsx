// hooks/useStopwatch.ts
import { useState, useRef, useCallback } from 'react'

export function useStopwatch() {
    const [seconds, setSeconds] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const start = useCallback(() => {
        if (isRunning) return
        setIsRunning(true)
        intervalRef.current = setInterval(() => {
            setSeconds((s) => s + 1)
        }, 1000)
    }, [isRunning])

    const pause = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsRunning(false)
    }, [])

    const reset = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsRunning(false)
        setSeconds(0)
    }, [])

    const formatted = [
        String(Math.floor(seconds / 3600)).padStart(2, '0'),
        String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'),
        String(seconds % 60).padStart(2, '0'),
    ].join(':')

    return { seconds, formatted, isRunning, start, pause, reset }
}