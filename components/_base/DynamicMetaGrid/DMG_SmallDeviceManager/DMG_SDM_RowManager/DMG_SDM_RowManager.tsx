import { Dispatch, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DMGType, DMGTypeRowSM } from "../../DMG"
import DMG_DDH_SortableComponents from "../../DMG_DesktopDeviceManager/DMG_DDM_SortableComponents/DMG_DDM_SortableComponents";
import { COL_SPAN_CLASS } from "@/libs/tailwindConstants/ColSpanClassConstant";
import { useSortable } from "@dnd-kit/react/sortable";
import { UUID } from "crypto";
import { CollisionDetector, directionBiased } from "@dnd-kit/collision";
import { SWAP_COOLDOWN_MS } from "../../DynamicMetaGrid";
import Icon from "@mdi/react";
import { mdiCardPlus, mdiCardPlusOutline, mdiDotsGrid, mdiEye, mdiEyeOff, mdiPlus, mdiPlusBox, mdiPlusCircle } from "@mdi/js";
import ConditionalComponent from "@/components/_base/ConditionalComponent";
import { useDragDropMonitor } from "@dnd-kit/react";
import debounce from "lodash/debounce";
import uniq from "lodash/uniq";
import DMG_SSM_RM_ColumnDragger from "./DMG_SDM_RM_ColumnDragger";
import { blankRowSMTemplate, useCreatePageMetaRowMutation, useGetCachedMetaByRowId, useUpdatePageMetaRowMutation } from "@/hooks/metaHooks";
import DMG_SDM_RM_ComponentSplitter from "./DMG_SDM_RM_ComponentSplitter";
import DMG_O_Adder from "../../DMG_Overlay/DMG_O_Adder";
import IconButton from "@/components/_base/IconButton";

let _lastRowSwapMs = 0;

export type MetaRefSM = {
  componentId: UUID;
  refs: Array<UUID>;
}

export type DMG_SDM_RowManagerProps = {
  isAdmin: boolean;
  isVisitor: boolean;
  dragMode: boolean;
  meta: DMGType;
  row: DMGTypeRowSM;
  index: number;
  enableOverlay: boolean;
  setEnableOverlay: Dispatch<boolean>;
  componentDrag: boolean;
  setComponentDrag: Dispatch<boolean>;
  rowDrag: boolean;
  setRowDrag: Dispatch<boolean>;
  onSorted: (metaRef: MetaRefSM) => void;
  isFinalRow: boolean;
}

export default function DMG_SDM_RowManager({
  isAdmin,
  isVisitor,
  dragMode,
  meta,
  row,
  index,
  enableOverlay,
  setEnableOverlay,
  componentDrag,
  setComponentDrag,
  rowDrag,
  setRowDrag,
  onSorted,
  isFinalRow,
}: DMG_SDM_RowManagerProps) {
  const srcId = useRef<UUID | null>(null)

  const { getCachedMetaByRowId } = useGetCachedMetaByRowId()
  useDragDropMonitor({
    onDragMove(event) {
      if (!getCachedMetaByRowId(event.operation.source?.id as UUID)) {
        srcId.current = event.operation.source?.id as UUID
      }
    },

    onDragEnd(event, manager) {
      if (srcId.current) {
        const id = srcId.current

        srcId.current = null
        const arr: Array<UUID> = []

        document
          .querySelectorAll('ul[id="' + meta._id + '_SM"] > li[id="' + row.id + '"]')
          .forEach((col) => {
            if (col.querySelector(`ul > li[id="${id}"]`)) {
              col.querySelectorAll('ul > li').forEach((comp) => {
                arr.push(comp.id as UUID)
              })
            }
          })

        if (arr.length) {
          onSorted({
            componentId: id,
            refs: uniq(arr),
          })
        }
      }
    }
  })

  const componentCount = useRef(row.components.length)

  const [heightChangeObserver, setHeightChangeObserver] = useState<{ height: number; id: string; } | null>(null);

  const [sixPtColSpan, setSixPtColSpan] = useState(row.sixPtColSpan)
  const [widthSetterHeight, setWidthSetterHeight] = useState(0)
  const [localContentWidth, setLocalContentWidth] = useState(0)
  const rowSpans = sixPtColSpan?.split('-')?.map(Number);

  const updatePageMetaRow = useUpdatePageMetaRowMutation()

  const debounceMutate = useRef(
    debounce((_id: UUID, rowId: UUID, patch) => {
      updatePageMetaRow.mutate({ _id, rowId, patch })
    }, 1000)).current


  const swapCooldownCollision: CollisionDetector = (input) => {
    const sourceGroup = (input.dragOperation.source as any)?.sortable?.group;
    if (sourceGroup !== "rows") return null;
    if (Date.now() - _lastRowSwapMs < SWAP_COOLDOWN_MS) return null;
    return directionBiased(input);
  };

  useEffect(() => {
    setSixPtColSpan(row.sixPtColSpan)
  }, [])

  useLayoutEffect(() => {
    const el = document.getElementById(row.id as string)
    if (!el) return

    const observer = new ResizeObserver(() => {
      setLocalContentWidth(el?.getBoundingClientRect()?.width || 0)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = document.getElementById(row.id as string)
    if (!el) return

    const rect = el?.getBoundingClientRect()
    if (rect?.height) {
      setWidthSetterHeight(rect.height)
    }
  }, [heightChangeObserver])

  useEffect(() => {
    if (sixPtColSpan !== row.sixPtColSpan) {
      debounceMutate(meta._id!, row.id!, { sixPtColSpan })
    }
  }, [sixPtColSpan])

  const { ref, handleRef } = useSortable({
    id: row.id as unknown as UUID,
    index,
    group: "rows",
    collisionDetector: swapCooldownCollision,
    disabled: !dragMode || componentDrag || !enableOverlay,
  });

  const createPageMetaRow = useCreatePageMetaRowMutation()

  const createRow = (ordinal?: number) => {
    createPageMetaRow.mutate({
      _id: meta._id,
      patch: blankRowSMTemplate(ordinal !== undefined ? ordinal : row.ordinal)
    })
  }

  const rowGroup = row.id?.replace(/\-/g, '')
  return (
    <li
      ref={componentDrag ? null : ref}
      id={row.id}
      className={`relative w-full group-${rowGroup}`}
    >
      <div className="flex w-full">
        <div className="relative w-full">
          <ConditionalComponent condition={index === 0 || enableOverlay}>
            <div className="w-full -mt-2 flex justify-center transition-opacity absolute z-30">
              <ConditionalComponent condition={isAdmin && index === 0 && !componentDrag}>
                <div>
                  <IconButton
                    icon={enableOverlay ? mdiEyeOff : mdiEye}
                    iconProps={{ className: 'absolute left-2 -top-1 opacity-50 hover:opacity-75 hover:text-overlayAccent! text-overlayHighlight' }}
                    onClick={() => { setEnableOverlay(!enableOverlay) }}
                  />
                </div>
              </ConditionalComponent>

              <ConditionalComponent condition={enableOverlay}>
                <div className="absolute mt-2 w-[75%] z-29 border-t border-overlayHighlight border-dashed">&nbsp;</div>
                <div className="bg-background z-30 px-2">
                  <button
                    className="hover:opacity-75 opacity-25 w-full transition-opacity hover:text-overlayAccent! text-overlayHighlight!"
                    onClick={() => createRow(row.ordinal)}
                  >
                    <Icon path={mdiPlusCircle} size={0.75} />
                  </button>
                </div>
              </ConditionalComponent>
            </div>
          </ConditionalComponent>
        </div>

        <ConditionalComponent condition={enableOverlay}>
          <div className="relative">
            <button
              ref={handleRef}
              aria-label="reorder row"
              disabled={!dragMode || componentDrag}
              className="opacity-25 transition-opacity hover:opacity-80 absolute -top-2 right-2 z-31 cursor-grab"
              onPointerDown={() => setRowDrag(true)}
            >
              <Icon path={mdiDotsGrid} size={0.75} />
            </button>
          </div>
        </ConditionalComponent>
      </div>

      <ul className="group/row grid gap-2 grid-cols-6">
        {row.components
          .sort((a, b) => a.ordinal! - b.ordinal!)
          .map((component, j) => (
            <DMG_DDH_SortableComponents
              key={component.id}
              colIndex={index}
              globalIndex={j}
              group={`row_${row.id}`}
              componentCount={componentCount.current}
              className={`${COL_SPAN_CLASS[rowSpans[j]]} group/column`}
              heightChanged={(obj) => setHeightChangeObserver(obj)}
              {...{
                dragMode,
                component,
                enableOverlay,
                setEnableOverlay,
                componentDrag,
                setComponentDrag,
                colDrag: rowDrag,
              }}
            >
              <div className="flex justify-center w-full relative z-20 transition-opacity group-has-[.group\/overlay:hover]/column:opacity-25">
                <DMG_SDM_RM_ComponentSplitter
                  colSpan={rowSpans[j]}
                  {...{
                    row,
                    component,
                    dragMode,
                    widthSetterHeight,
                    enableOverlay,
                    localContentWidth
                  }}
                />
              </div>

              <ConditionalComponent condition={j < rowSpans.length - 1}>
                <DMG_SSM_RM_ColumnDragger
                  activeIndex={j}
                  visible={enableOverlay && dragMode && index < meta.columns.length - 1}
                  {...{
                    dragMode,
                    widthSetterHeight,
                    sixPtColSpan,
                    setSixPtColSpan,
                    localContentWidth,
                  }}
                />
              </ConditionalComponent>

              <ConditionalComponent condition={enableOverlay && isFinalRow}>
                <div className="absolute -bottom-4 flex justify-center w-full">
                  <div className="mt-2 w-[75%] z-29 absolute border-t border-overlayHighlight border-dashed">&nbsp;</div>
                  <div className="bg-background z-30 px-2">
                    <button
                      className="hover:opacity-75 opacity-25 w-full transition-opacity hover:text-overlayAccent! text-overlayHighlight!"
                      onClick={() => createRow(row.ordinal + 1)}
                    >
                      <Icon path={mdiPlusCircle} size={0.75} />
                    </button>
                  </div>
                </div>
              </ConditionalComponent>
            </DMG_DDH_SortableComponents>
          ))}
      </ul>
    </li>
  );
}
