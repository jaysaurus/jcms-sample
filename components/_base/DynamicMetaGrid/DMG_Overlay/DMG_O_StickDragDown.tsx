import { useCallback, useEffect, useRef } from "react"
import { DMG_O_Stick } from "./DMG_O_Stick";
import { HEIGHT_SNAP, SNAP } from "@/hooks/metaHooks";

export type DMG_O_StickDragDownProps = {
  minHeight: number;
  elementHeight: number;
  setElementHeight: (n: number) => void;
}

export const dragButtonClass = [
  'absolute',
  '-bottom-1.5',
  'cursor-ns-resize!',
  'hidden!',
  'group-hover/overlay:inline-flex!',
].join(' ')

export default function DMG_O_StickDragDown(
  { elementHeight, setElementHeight, minHeight }: DMG_O_StickDragDownProps) {
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)

  const handleDragStart = useCallback((clientY: number) => {
    isDragging.current = true
    dragStartY.current = clientY
    dragStartHeight.current = elementHeight
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    document.body.style.cursor = 'ns-resize'
  }, [elementHeight])

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging.current) return
    const delta = clientY - dragStartY.current
    const snappedDelta = Math.round(delta / HEIGHT_SNAP) * HEIGHT_SNAP
    const newHeight = Math.max(minHeight, dragStartHeight.current + snappedDelta)
    setElementHeight(newHeight)
  }, [minHeight])

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    document.body.style.userSelect = ''
    document.body.style.webkitUserSelect = ''
    document.body.style.cursor = ''
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY)
    const onMouseUp = () => handleDragEnd()
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current) e.preventDefault()
      handleDragMove(e.touches[0].clientY)
    }
    const onTouchEnd = () => handleDragEnd()

    // prevent drag from breaking if the user's button leaves
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleDragMove, handleDragEnd])

  return (
    <DMG_O_Stick
      aria-label="drag component height up/down"
      className={dragButtonClass}
      onMouseDown={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        handleDragStart(e.clientY)
      }}
      onTouchStart={(e: React.TouchEvent) => {
        e.stopPropagation()
        handleDragStart(e.touches[0].clientY)
      }}
    />)
}
