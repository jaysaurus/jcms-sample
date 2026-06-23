import { useEffect, useState } from "react";
import { DMGType, DMGTypeColumn, DMGTypeComponent } from "./DMG";
import { cloneDeep } from "lodash";
import DMG_DesktopDeviceManager, { MetaRef } from "./DMG_DesktopDeviceManager/DMG_DesktopDeviceManager";
import { useReorderComponentMutation } from "@/hooks/componentHooks";
import { useReorderFieldMetaMutation, useUpdatePageMetaMutation } from "@/hooks/metaHooks";
import { isPartitionOf12, PartitionOf12 } from "@/app/__types/TwelvePtColSpan";
import MediaQuery from "../MediaQuery";
import { MediaSizes } from "@/libs/constants";
import DMG_ConditionalDragDropProvider from "./DMG_ConditionalDragDropProvider";
import DMG_SmallDeviceManager from "./DMG_SmallDeviceManager/DMG_SmallDeviceManager";
import DMG_BackgroundImg from "./DMG_BackgroundImg";

export const SWAP_COOLDOWN_MS = 200;

export type ComponentItem = DMGType["columns"][number]["components"][number];

export type DynamicMetaGridProps = {
  meta: DMGType;
  isAdmin: boolean;
  isVisitor: boolean;
}

export default function DynamicMetaGrid({ meta, isAdmin, isVisitor }: DynamicMetaGridProps) {
  const [localMeta, setLocalMeta] = useState<DMGType | null>(null)
  const [enableOverlay, setEnableOverlay] = useState(false)
  const [dragMode, setDragMode] = useState(true)
  const [localMetaRefs, setLocalMetaRefs] = useState<MetaRef | null>(null)
  const [twelvePtColSpan, setTwelvePtColSpan] = useState<PartitionOf12 | undefined>(localMeta?.twelvePtColSpan)

  const updatePageMeta = useUpdatePageMetaMutation()

  const updateBackgroundImage = (value: string, type: 'backgroundImgSrc' | 'backgroundImgSrcSM') => {
    updatePageMeta
      .mutate({
        _id: meta._id,
        patch: { [type]: value }
      })
  }

  useEffect(() => {
    if (meta) {
      setDragMode(false)
      setLocalMeta(cloneDeep(meta));
      setTwelvePtColSpan(meta.twelvePtColSpan!)
      setTimeout(() => {
        setDragMode(true)
      }, 250)
    }
  }, [meta]);

  const reorderComponent = useReorderComponentMutation()
  const reorderColumn = useReorderFieldMetaMutation()

  useEffect(() => { // COLUMN MOVE
    if (localMetaRefs === null) return;

    const { refs: newMetaRefs, componentId } = localMetaRefs
    const column = meta.columns.find(it => it.id === componentId)

    const oldOrdinal = column?.ordinal
    const colRefs = column?.components?.map(it => it.id)
    const newColOrdinal = newMetaRefs.findIndex(ids => ids.find(id => colRefs?.includes(id)))

    if (!!column && oldOrdinal !== undefined && newColOrdinal > -1) {
      setLocalMeta((prev) => { // localDragUpdate
        if (prev) {
          const newMeta = cloneDeep(prev);
          const spans = newMeta.twelvePtColSpan!.split('-').map(Number)
          const newSpans: number[] = []

          newMeta.columns.forEach(col => {
            if (col.id === column.id) {
              newSpans[newColOrdinal!] = spans[oldOrdinal]
              col.ordinal = newColOrdinal!
            } else if (col.ordinal >= newColOrdinal! && col.ordinal < oldOrdinal) {
              newSpans[col.ordinal + 1] = spans[col.ordinal]
              ++col.ordinal
            } else if (col.ordinal > oldOrdinal && col.ordinal <= newColOrdinal!) {
              newSpans[col.ordinal - 1] = spans[col.ordinal]
              --col.ordinal
            } else {
              newSpans[col.ordinal] = spans[col.ordinal]
            }
          })
          const spanResult = newSpans.join('-') as PartitionOf12
          if (isPartitionOf12(spanResult)) {
            newMeta.twelvePtColSpan = spanResult
            setTwelvePtColSpan(spanResult)
            return newMeta
          }
        }
        return prev
      })

      reorderColumn.mutateAsync({
        _id: meta._id!,
        colId: componentId,
        ordinal: newColOrdinal,
      }).then(() => {
        setDragMode(true)
      })
    }
  }, [localMetaRefs])

  useEffect(() => { // COMPONENT MOVE
    if (localMetaRefs === null) return;
    setDragMode(false)

    const { refs: newMetaRefs, componentId } = localMetaRefs
    const column = meta.columns.find(it => it.id === componentId)

    if (!column) {
      setLocalMeta((prev) => { // localDragUpdate
        if (prev) {
          const findComponent = (id: string) => {
            for (const col of prev.columns) {
              for (const comp of col.components) {
                if (comp.id === id) return comp;
              }
            }
            return null;
          }

          const newMeta = cloneDeep(prev);
          newMeta.columns.sort((a, b) => a.ordinal - b.ordinal).forEach((col, i) => {
            col.components = (newMetaRefs[i] ?? [])
              .map((id: string, j: number) => {
                const c = findComponent(id);
                return c ? { ...c, ordinal: j } : null;
              })
              .filter(Boolean) as DMGTypeComponent[];
          });

          const emptyColumnIndex = newMeta.columns.findIndex(it => !it.components.length)

          if (emptyColumnIndex > -1) {
            const result = newMeta.twelvePtColSpan!.split('-').map(Number)
            if (emptyColumnIndex < newMeta.columns.length - 1) {
              result[emptyColumnIndex + 1] += result[emptyColumnIndex]
            } else {
              result[emptyColumnIndex - 1] += result[emptyColumnIndex]
            }
            result.splice(emptyColumnIndex, 1)
            const spanResult = result.join('-') as PartitionOf12

            if (isPartitionOf12(spanResult)) {
              setTwelvePtColSpan(spanResult)
              newMeta.twelvePtColSpan = spanResult
              newMeta.columns.splice(emptyColumnIndex, 1)
              return newMeta
            }
          }
          return newMeta;
        }
        return prev
      })


      if (!column) {
        const newIndex = newMetaRefs.findIndex(col => col.findIndex(comp => comp === componentId) > -1)

        if (newIndex > -1) {
          reorderComponent.mutateAsync({
            _id: meta._id,
            colId: meta.columns.find(col => col.ordinal === newIndex)!.id,
            componentId: componentId,
            ordinal: newMetaRefs[newIndex].findIndex(comp => comp === componentId),
          }).then(() => {
            setDragMode(true)
          })
        }
      }
    }
  }, [localMetaRefs])
  if (!localMeta) return <></>;

  const colSpans = twelvePtColSpan!.split("-").map(Number);

  const sortedLocalColumns = [...localMeta.columns].sort((a, b) => a.ordinal - b.ordinal);
  const colOffsets = sortedLocalColumns.map((_: DMGTypeColumn, i: number) =>
    sortedLocalColumns
      .slice(0, i)
      .reduce((sum: number, c: DMGTypeColumn) => sum + c.components.length, 0)
  );
  return (
    <div>
      <MediaQuery query={{ gte: MediaSizes.MD }}>
        <DMG_ConditionalDragDropProvider condition={dragMode && enableOverlay}>
          <DMG_DesktopDeviceManager
            onSorted={(m) => setLocalMetaRefs(m)}
            meta={localMeta}
            setMeta={setLocalMeta}
            {...{
              isAdmin,
              isVisitor,
              dragMode,
              colSpans,
              colOffsets,
              enableOverlay,
              setEnableOverlay,
              twelvePtColSpan,
              setTwelvePtColSpan,
            }}
          />
        </DMG_ConditionalDragDropProvider>

        <DMG_BackgroundImg
          onSetBackgroundImage={(v) => updateBackgroundImage(v, 'backgroundImgSrc')}
          {...{ isAdmin }}
        />
      </MediaQuery>
      <MediaQuery query={{ lt: MediaSizes.MD }}>
        <DMG_ConditionalDragDropProvider condition={dragMode && enableOverlay}>
          <DMG_SmallDeviceManager
            meta={localMeta}
            setMeta={setLocalMeta}
            {...{
              isAdmin,
              isVisitor,
              dragMode,
              setDragMode,
              enableOverlay,
              setEnableOverlay,
            }}
          />
        </DMG_ConditionalDragDropProvider>

        <DMG_BackgroundImg
          onSetBackgroundImage={(v) => updateBackgroundImage(v, 'backgroundImgSrcSM')}
          {...{ isAdmin }}
        />
      </MediaQuery>
    </div>
  );
}
