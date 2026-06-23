import { isPartitionOf6, PartitionOf6 } from "@/app/__types/TwelvePtColSpan";
import { useDragDropMonitor } from "@dnd-kit/react";
import { cloneDeep, first } from "lodash";
import { Dispatch, useEffect, useRef, useState } from "react";
import { DMGType } from "../DMG";
import DMG_SDM_RowManager, { MetaRefSM } from "./DMG_SDM_RowManager/DMG_SDM_RowManager";
import { useReorderFieldMetaMutation, useUpdatePageMetaMutation } from "@/hooks/metaHooks";
import { useReorderComponentMutation } from "@/hooks/componentHooks";
import { UUID } from "crypto";

export type DMG_SmallDeviceManagerProps = {
  isAdmin: boolean;
  isVisitor: boolean;
  dragMode: boolean;
  setDragMode: Dispatch<boolean>;
  meta: DMGType;
  setMeta: Dispatch<DMGType>;
  enableOverlay: boolean;
  setEnableOverlay: Dispatch<boolean>;
}

export default function DMG_SmallDeviceManager({
  isAdmin,
  isVisitor,
  dragMode,
  setDragMode,
  meta,
  setMeta,
  enableOverlay,
  setEnableOverlay,
}: DMG_SmallDeviceManagerProps) {
  const sortableWrapper = useRef<HTMLUListElement>(null);
  const srcId = useRef<UUID | null>(null);

  const [localMetaRefs, setLocalMetaRefs] = useState<MetaRefSM | null>(null)
  const [rowDrag, setRowDrag] = useState(false);
  const [componentDrag, setComponentDrag] = useState(false);

  const reorderRow = useReorderFieldMetaMutation();
  const reorderComponent = useReorderComponentMutation();
  const updatePageMeta = useUpdatePageMetaMutation();

  useEffect(() => {
    const reset = () => {
      setRowDrag(false);
      setComponentDrag(false);
    };
    window.addEventListener('pointerup', reset);
    window.addEventListener('pointercancel', reset);
    return () => {
      window.removeEventListener('pointerup', reset);
      window.removeEventListener('pointercancel', reset);
    };
  }, [])

  const reorderComponents = useReorderComponentMutation()

  useEffect(() => {
    if (localMetaRefs === null) return;

    const { refs: newMetaRefs, componentId } = localMetaRefs
    const rowsSM = meta.rowsSM.find(it => it.components.find(c => c.id === componentId))

    if (rowsSM) {
      const newIndex = newMetaRefs.findIndex(cId => cId === componentId)

      if (newIndex > -1) {
        reorderComponents.mutate({
          _id: meta._id,
          rowId: rowsSM.id,
          componentId,
          ordinal: newIndex,
        })
      }
    }
  }, [localMetaRefs])

  useDragDropMonitor({
    onDragMove(event) {
      srcId.current = event.operation.source?.id as UUID;
    },

    onDragEnd(_event, _manager) {
      if (!srcId.current) return;
      const id = srcId.current;
      srcId.current = null;

      const rowElements = document.querySelectorAll(`ul[id="${meta._id}_SM"] > li`);
      const isRow = meta.rowsSM.some(r => r.id === (id as unknown as string));

      if (isRow) {
        const newRowOrder: string[] = [];
        rowElements.forEach((el) => newRowOrder.push(el.id));

        const newOrdinal = newRowOrder.indexOf(id as unknown as string);
        const row = meta.rowsSM.find(r => r.id === (id as unknown as string));
        if (!row || row.ordinal === newOrdinal) return;

        const oldOrdinal = row.ordinal;
        const newMeta = cloneDeep(meta);
        newMeta.rowsSM.forEach(r => {
          if (r.id === (id as unknown as string)) {
            r.ordinal = newOrdinal;
          } else if (r.ordinal >= newOrdinal && r.ordinal < oldOrdinal) {
            ++r.ordinal;
          } else if (r.ordinal > oldOrdinal && r.ordinal <= newOrdinal) {
            --r.ordinal;
          }
        });
        setMeta(newMeta);

        setTimeout(() => { // finish animating drag/drop
          setDragMode(false)
          reorderRow.mutateAsync(
            { _id: meta._id!, rowId: id as unknown as UUID, ordinal: newOrdinal })
            .then(() => {
              setDragMode(true)
            })
        }, 250)
      } else {
        let sourceRowId: string | null = null;
        let newCompOrder: string[] = [];

        rowElements.forEach((rowEl) => {
          const compEls = rowEl.querySelectorAll(':scope > ul > li');
          compEls.forEach((compEl) => {
            if (compEl.id === (id as unknown as string)) {
              sourceRowId = rowEl.id;
              compEls.forEach((el) => newCompOrder.push(el.id));
            }
          });
        });

        if (!sourceRowId || !newCompOrder.length) return;

        const sourceRow = meta.rowsSM.find(r => r.id === sourceRowId);
        if (!sourceRow) return;

        const oldSpans = sourceRow.sixPtColSpan.split('-').map(Number);
        const sortedComponents = [...sourceRow.components].sort((a, b) => a.ordinal! - b.ordinal!);
        const oldIds = sortedComponents.map(c => c.id as string);

        const newSpans = newCompOrder.map(newId => oldSpans[oldIds.indexOf(newId)]);
        const newSixPtColSpan = newSpans.join('-');

        if (!isPartitionOf6(newSixPtColSpan)) return;

        const newMeta = cloneDeep(meta);
        const row = newMeta.rowsSM.find(r => r.id === sourceRowId)!;
        const compMap = new Map(row.components.map(c => [c.id as string, c]));
        row.components = newCompOrder.map((compId, j) => ({
          ...compMap.get(compId)!,
          ordinal: j,
        }));
        row.sixPtColSpan = newSixPtColSpan as PartitionOf6;
        setMeta(newMeta);

        updatePageMeta.mutate({ _id: meta._id!, patch: { rowsSM: newMeta.rowsSM } });

        const newOrdinal = newCompOrder.indexOf(id as unknown as string);
        reorderComponent.mutate({
          _id: meta._id,
          rowId: sourceRowId as unknown as UUID,
          componentId: id as unknown as UUID,
          ordinal: newOrdinal,
        });
      }
    }
  })

  useEffect(() => {
    if (isVisitor) setEnableOverlay(true)
  }, [isVisitor])

  return (
    <ul
      className="group/row relative w-full h-full pt-5 pb-10"
      ref={sortableWrapper}
      id={meta._id + '_SM'}
      style={meta.backgroundImgSrc ? { backgroundImage: `url(${meta.backgroundImgSrc})` } : {}}
    >
      {meta.rowsSM
        .sort((a, b) => a.ordinal - b.ordinal)
        .map((row, index) => (
          <DMG_SDM_RowManager
            key={row.id}
            onSorted={(m) => setLocalMetaRefs(m)}
            isFinalRow={index === (meta.rowsSM.length - 1)}
            {...{
              isAdmin,
              isVisitor,
              row,
              meta,
              index,
              dragMode,
              enableOverlay,
              setEnableOverlay,
              rowDrag,
              setRowDrag,
              componentDrag,
              setComponentDrag,
            }}
          />
        ))}
    </ul>
  );
}
