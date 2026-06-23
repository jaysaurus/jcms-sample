import { PartitionOf6 } from "@/app/__types/TwelvePtColSpan";
import ConditionalComponent from "@/components/_base/ConditionalComponent";
import { mdiArrowLeftRight } from "@mdi/js";
import Icon from "@mdi/react";
import { UUID } from "crypto";
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DMG_SSM_RM_ColumnDraggerProps = {
  activeIndex: number;
  widthSetterHeight: number;
  localContentWidth: number;
  visible: boolean;
  sixPtColSpan?: PartitionOf6;
  setSixPtColSpan: Dispatch<PartitionOf6>;
}

export default function DMG_SSM_RM_ColumnDragger({
  activeIndex,
  widthSetterHeight,
  visible,
  localContentWidth,
  sixPtColSpan,
  setSixPtColSpan,
}: DMG_SSM_RM_ColumnDraggerProps) {

  const dragRightLeftWrapperClass = [
    'relative',
    'w-full',
    'z-40',
    'hidden',
    visible ? 'group-hover/row:block' : '',
    'transition-display',
  ].join(' ')

  const dragRightLeftClass = [
    'absolute',
    'top-5',
    '-right-1',
    'border-r',
    'border-dashed',
    'border-overlayHighlight'
  ].join(' ')

  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const stepsApplied = useRef(0)
  const spanAtDragStart = useRef(sixPtColSpan)
  const [delayedVis, setDelayedVis] = useState(false)
  const colWidth = localContentWidth / 6

  const handleDragStart = useCallback((clientX: number) => {
    isDragging.current = true
    dragStartX.current = clientX
    stepsApplied.current = 0
    spanAtDragStart.current = sixPtColSpan
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    document.body.style.cursor = 'ew-resize !important'
  }, [sixPtColSpan])

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
    setSixPtColSpan(spans.join('-') as PartitionOf6)
  }, [colWidth, activeIndex, setSixPtColSpan])

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
    <ConditionalComponent condition={visible}>
      <span className={dragRightLeftWrapperClass}>
        <div
          className={dragRightLeftClass}
          style={{ height: (widthSetterHeight - 40) + 'px' }}
        >
          <ConditionalComponent condition={delayedVis}>
            <button
              className="absolute -ml-2 bg-background py-5"
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
      </span>
    </ConditionalComponent>)
}