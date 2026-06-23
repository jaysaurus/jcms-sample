import { visitorExpiryAtom } from "@/hooks/authoriseHooks"
import { useAtomValue } from "jotai"
import { useEffect, useRef, useState } from "react"

export default function TestTimer({
  startTimer,
  onTimerUp,
}: {
  startTimer: boolean
  onTimerUp?: () => void
}) {
  const visitorExpiry = useAtomValue(visitorExpiryAtom)
  const [totalSeconds, setTotalSeconds] = useState(5 * 60)
  const [running, setRunning] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    setTotalSeconds((visitorExpiry.minutes * 60) + visitorExpiry.seconds)
  }, [visitorExpiry])

  useEffect(() => {
    if (!startTimer || running) return
    setRunning(true)

    const interval = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [startTimer])

  useEffect(() => {
    if (totalSeconds === 0 && !firedRef.current) {
      firedRef.current = true
      onTimerUp?.()
    }
  }, [totalSeconds, onTimerUp])

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="fixed right-2 top-1 z-90">
      {running
        ? <div className="z-90 text-primaryLink ">
          session timer {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
        : <></>}

    </div>
  )
}