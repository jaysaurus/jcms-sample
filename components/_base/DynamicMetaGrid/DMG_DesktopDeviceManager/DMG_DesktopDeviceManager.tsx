import { useDragDropMonitor } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import DMG_DDH_SortableComponents from "./DMG_DDM_SortableComponents/DMG_DDM_SortableComponents";
import { DMGType } from "../DMG";
import { UUID } from "crypto";
import { Dispatch, useEffect, useLayoutEffect, useRef, useState } from "react";
import { debounce, uniq, uniqBy } from "lodash";
import Icon from "@mdi/react";
import { mdiDotsGrid, mdiEye, mdiEyeOff } from "@mdi/js";
import DMG_DDH_ColumnDragger from "./DMG_DDM_ColumnDragger";
import { COL_SPAN_CLASS } from "@/libs/tailwindConstants/ColSpanClassConstant";
import DMG_DDH_ColumnSplitter from "./DMG_DDM_ColumnSplitter";
import { SITE_MAX_WIDTH, useUpdatePageMetaMutation } from "@/hooks/metaHooks";
import { SWAP_COOLDOWN_MS } from "../DynamicMetaGrid";
import { CollisionDetector, directionBiased } from "@dnd-kit/collision";
import { PartitionOf12 } from "@/app/__types/TwelvePtColSpan";
import ConditionalComponent from "../../ConditionalComponent";
import IconButton from "../../IconButton";

export type MetaRef = {
  componentId: UUID;
  refs: Array<Array<UUID>>;
}

export type DMG_DesktopDeviceManager = {
  isAdmin: boolean;
  isVisitor: boolean;
  dragMode: boolean;
  meta: DMGType;
  setMeta: (v: DMGType) => void;
  onSorted: (metaRef: MetaRef) => void;
  colSpans: number[];
  colOffsets: number[];
  enableOverlay: boolean;
  setEnableOverlay: Dispatch<boolean>;
  twelvePtColSpan?: PartitionOf12;
  setTwelvePtColSpan: Dispatch<PartitionOf12>;
}

let _lastSwapMs = 0;

export default function DMG_DesktopDeviceManager({
  isAdmin,
  isVisitor,
  dragMode,
  onSorted,
  meta,
  colSpans,
  colOffsets,
  enableOverlay,
  setEnableOverlay,
  twelvePtColSpan,
  setTwelvePtColSpan,
}: DMG_DesktopDeviceManager) {
  const srcId = useRef<UUID | null>(null)

  useDragDropMonitor({
    onDragMove(event) {
      srcId.current = event.operation.source?.id as UUID
    },

    onDragEnd(event, manager) {
      if (srcId.current) {
        const id = srcId.current
        srcId.current = null

        const arr: Array<Array<UUID>> = []

        document.querySelectorAll('ul[id="' + meta._id + '"] > li')
          .forEach((col, i) => {
            arr.push([])
            col.querySelectorAll('ul > li').forEach((comp, j) => {
              arr[i].push(comp.id as UUID)
            })
          })

        onSorted({
          componentId: id,
          refs: uniqBy(arr.map((it: UUID[]) => uniq(it)), (it) => it.toString())
        })
      }
    }
  })

  const sortableWrapper = useRef<HTMLUListElement>(null)

  const [widthSetterHeight, setWidthSetterHeight] = useState(0)

  const [heightChangeObserver, setHeightChangeObserver] = useState<{ height: number; id: string; } | null>(null)

  const [localContentWidth, setLocalContentWidth] = useState(0)

  const [colDrag, setColDrag] = useState(false)

  const [componentDrag, setComponentDrag] = useState(false)

  useEffect(() => {
    const resetColDrag = () => setColDrag(false)
    const resetComponentDrag = () => setComponentDrag(false)
    window.addEventListener('pointerup', resetColDrag)
    window.addEventListener('pointercancel', resetColDrag)
    window.addEventListener('pointerup', resetComponentDrag)
    window.addEventListener('pointercancel', resetComponentDrag)
    return () => {
      window.removeEventListener('pointerup', resetColDrag)
      window.removeEventListener('pointercancel', resetColDrag)
      window.removeEventListener('pointerup', resetComponentDrag)
      window.removeEventListener('pointercancel', resetComponentDrag)
    }
  }, [])

  useLayoutEffect(() => {
    if (!sortableWrapper.current) return
    const observer = new ResizeObserver(() => {
      setLocalContentWidth((sortableWrapper.current?.getBoundingClientRect()?.width || 0))
    })
    observer.observe(sortableWrapper.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const rect = sortableWrapper.current?.getBoundingClientRect()
    if (rect?.height) {
      setWidthSetterHeight(rect.height)
    }
  }, [heightChangeObserver])

  const updatePageMeta = useUpdatePageMetaMutation()

  const debounceMutate = useRef(
    debounce((_id: UUID, patch) => {
      updatePageMeta.mutate({ _id, patch })
    }, 1000)).current

  const getColumnClass = (colSpanIndex: number) => [
    COL_SPAN_CLASS[colSpanIndex],
    'group/column'
  ].join(' ')

  useEffect(() => {
    if (twelvePtColSpan !== meta.twelvePtColSpan) {
      debounceMutate(meta._id!, { twelvePtColSpan })
    }
  }, [twelvePtColSpan])

  useEffect(() => {
    if (isVisitor) {
      setEnableOverlay(true)
    }
  }, [isVisitor])

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        ...(meta.backgroundImgSrc ? { backgroundImage: `url(${meta.backgroundImgSrc})` } : {}),
      }}>
      <ul
        className="pt-5 pb-10 group/meta relative grid gap-2 w-full h-full grid-cols-12"
        ref={sortableWrapper}
        id={meta._id}
        style={{ maxWidth: SITE_MAX_WIDTH + 'px' }}
      >
        {meta.columns
          .sort((a, b) => a.ordinal - b.ordinal)
          .map((column, index) => {
            const swapCooldownCollision: CollisionDetector = (input) => {
              if ((input.dragOperation.source as any)?.sortable?.group === "components") return null;
              if (Date.now() - _lastSwapMs < SWAP_COOLDOWN_MS) return null;
              return directionBiased(input);
            };

            const { ref, handleRef } = useSortable({
              id: column.id as unknown as UUID,
              index,
              group: "columns",
              collisionDetector: swapCooldownCollision,
              disabled: !dragMode || componentDrag || !enableOverlay,
            });

            return <li
              ref={componentDrag ? null : ref}
              key={column.id}
              id={column.id}
              className={getColumnClass(colSpans[index])}
            >
              <div className="flex justify-center w-full relative z-40 transition-opacity group-has-[.group\/overlay:hover]/column:opacity-25">
                <ConditionalComponent condition={isAdmin && index === 0 && !componentDrag}>
                  <IconButton
                    icon={enableOverlay ? mdiEyeOff : mdiEye}
                    iconProps={{ className: 'absolute left-2 z-50 -top-3 opacity-50 hover:opacity-75 hover:text-overlayAccent! text-overlayHighlight' }}
                    onClick={() => { setEnableOverlay(!enableOverlay) }}
                  />
                </ConditionalComponent>
                <ConditionalComponent condition={!isVisitor}>
                  <DMG_DDH_ColumnSplitter
                    colSpan={colSpans[index]}
                    columnId={column.id!}
                    {...{
                      dragMode,
                      widthSetterHeight,
                      enableOverlay,
                      localContentWidth
                    }}
                  />
                </ConditionalComponent>
              </div>

              <ConditionalComponent condition={enableOverlay}>
                <div className=" w-full relative mr-3 z-45">
                  <button
                    ref={handleRef}
                    aria-label="relocate component"
                    disabled={!dragMode || componentDrag}
                    className="-mt-1 opacity-25 transition-opacity group-hover/column:opacity-80 group-has-[.group\/overlay:hover]/column:opacity-25 absolute right-0.5 z-30 cursor-grab"
                    onPointerDown={() => setColDrag(true)}
                  >
                    <Icon
                      path={mdiDotsGrid}
                      size={0.75}
                    />
                  </button>
                </div>
              </ConditionalComponent>

              <DMG_DDH_ColumnDragger
                activeIndex={index}
                visible={enableOverlay && index < meta.columns.length - 1}
                {...{
                  dragMode,
                  widthSetterHeight,
                  twelvePtColSpan,
                  setTwelvePtColSpan,
                  localContentWidth,
                }}
              />

              <ul>
                {column.components
                  ?.sort((a, b) => a.ordinal! - b.ordinal!)
                  ?.map((component, j) => (
                    <DMG_DDH_SortableComponents
                      key={component.id}
                      colIndex={index}
                      globalIndex={colOffsets[index] + j}
                      heightChanged={(obj) => setHeightChangeObserver(obj)}
                      {...{
                        dragMode,
                        component,
                        enableOverlay,
                        setEnableOverlay,
                        componentDrag,
                        setComponentDrag,
                        colDrag
                      }}
                    />
                  )) || <></>}
              </ul>
            </li>
          })}
      </ul>
    </div>
  )
}
