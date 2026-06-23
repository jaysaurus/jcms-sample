import { PartitionOf12 } from "@/app/__types/TwelvePtColSpan";
import { mdiArrowLeftRight } from "@mdi/js";
import Icon from "@mdi/react";
import { UUID } from "crypto";
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConditionalComponent from "../../ConditionalComponent";

export type DMG_DDH_ColumnDragger = {
  activeIndex: number;
  widthSetterHeight: number;
  localContentWidth: number;
  visible: boolean;
  twelvePtColSpan?: PartitionOf12;
  setTwelvePtColSpan: Dispatch<PartitionOf12>;
}

export default function DMG_DDH_ColumnDragger({
  activeIndex,
  widthSetterHeight,
  visible,
  localContentWidth,
  twelvePtColSpan,
  setTwelvePtColSpan,
}: DMG_DDH_ColumnDragger) {

  const dragRightLeftWrapperClass = [
    'relative',
    'w-full',
    visible ? 'group-hover/column:block' : 'hidden',
    'transition-display',
  ].join(' ')

  const dragRightLeftClass = [
    'absolute',
    'z-40',
    '-right-1',
    'border-r',
    'border-dashed',
    'border-overlayHighlight'
  ].join(' ')

  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const stepsApplied = useRef(0)
  const spanAtDragStart = useRef(twelvePtColSpan)
  const [delayedVis, setDelayedVis] = useState(false)
  const colWidth = localContentWidth / 12

  const handleDragStart = useCallback((clientX: number) => {
    isDragging.current = true
    dragStartX.current = clientX
    stepsApplied.current = 0
    spanAtDragStart.current = twelvePtColSpan
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    document.body.style.cursor = 'ew-resize !important'
  }, [twelvePtColSpan])

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return

    const delta = clientX - dragStartX.current
    const rawSteps = Math.round(delta / colWidth)

    if (rawSteps === stepsApplied.current) return
    stepsApplied.current = rawSteps

    const spans = spanAtDragStart.current!.split('-').map(Number)
    const i = activeIndex
    const neighbour = i + 1

    if (neighbour >= spans.length) return

    const newLeft = spans[i] + rawSteps
    const newRight = spans[neighbour] - rawSteps
    // prevent either going below 1
    if (newLeft < 1 || newRight < 1) return

    spans[i] = newLeft
    spans[neighbour] = newRight
    setTwelvePtColSpan(spans.join('-') as PartitionOf12)
  }, [colWidth, activeIndex, setTwelvePtColSpan])

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    document.body.style.userSelect = ''
    document.body.style.webkitUserSelect = ''
    document.body.style.cursor = ''
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX)
    const onMouseUp = () => handleDragEnd()
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current) e.preventDefault()
      handleDragMove(e.touches[0].clientX)
    }
    const onTouchEnd = () => handleDragEnd()

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

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        setDelayedVis(true)
      }, 250)
    } else {
      setDelayedVis(false)
    }
  }, [visible])
  return (
    <div className={dragRightLeftWrapperClass}>
      <div
        className={dragRightLeftClass}
        style={{ height: (widthSetterHeight - 32) + 'px' }}
      >
        <ConditionalComponent condition={delayedVis}>
          <button
            className="rounded-full absolute -ml-3 bg-background p-1"
            style={{ top: 'calc(50% - 32px)' }}
            onMouseDown={(e: React.MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              handleDragStart(e.clientX)
            }}
            onTouchStart={(e: React.TouchEvent) => {
              e.stopPropagation()
              handleDragStart(e.touches[0].clientX)
            }}
          >
            <Icon
              className="text-sticks hover:text-overlay cursor-ew-resize"
              path={mdiArrowLeftRight}
              size={0.75}
            />
          </button>
        </ConditionalComponent>
      </div>
    </div>
  )
}