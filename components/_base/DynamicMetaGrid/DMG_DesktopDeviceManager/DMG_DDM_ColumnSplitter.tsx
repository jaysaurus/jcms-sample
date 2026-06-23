import { mdiScissorsCutting } from "@mdi/js";
import IconButton from "../../IconButton";
import { GRID_COL_CLASS } from "@/libs/tailwindConstants/GridColClassConstant";
import { COL_SPAN_CLASS } from "@/libs/tailwindConstants/ColSpanClassConstant";
import { useState } from "react";

import { UUID } from "crypto";
import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";
import { DMGTypeColumn, DMGTypeComponent, RAW_DMG_COLUMN_COMPONENT } from "../DMG";
import { useGetCachedMetaByColumnId, useUpdatePageMetaMutation } from "@/hooks/metaHooks";
import { PartitionOf12 } from "@/app/__types/TwelvePtColSpan";

export type DMG_DDH_ColumnSplitterProps = {
  colSpan: number;
  enableOverlay?: boolean;
  dragMode?: boolean;
  columnId: UUID;
  widthSetterHeight: number
}

const TwelvePtSplitters = ({ colSpan, widthSetterHeight, columnId }: DMG_DDH_ColumnSplitterProps) => {
  const [enableSplitter, setEnableSplitter] = useState(false)

  const { getCachedMetaByColumnId } = useGetCachedMetaByColumnId()
  const updatePageMeta = useUpdatePageMetaMutation()

  const splitColumns = (splitAt: number, columnId: UUID) => {
    const patch = cloneDeep(getCachedMetaByColumnId(columnId))
    const i = patch?.columns?.findIndex(({ id }: DMGTypeColumn) => id === columnId)

    if (typeof i === 'number' && i > -1 && patch?.twelvePtColSpan) {
      const column = cloneDeep(patch!.columns[i])
      column.components =
        column.components
          .map((component: DMGTypeComponent) => ({
            ...pick(component, ['height', 'ordinal']),
            ...RAW_DMG_COLUMN_COMPONENT
          }))
      delete column.id

      const colSpans = patch!.twelvePtColSpan.split('-').map(Number)
      const parentOrdinal = patch!.columns[i].ordinal
      column.ordinal = parentOrdinal + 1
      const colSpan = colSpans[parentOrdinal]

      colSpans[parentOrdinal] = colSpan - splitAt
      colSpans.splice(parentOrdinal, 0, splitAt)

      patch.twelvePtColSpan = colSpans.join('-') as PartitionOf12
      patch.columns.splice(i + 1, 0, column)
      patch.columns.forEach(it => {
        if (it.id !== column.id && it.ordinal >= column.ordinal) it.ordinal++
      })

      const _id = patch!._id
      delete patch!._id

      updatePageMeta.mutate({
        _id,
        patch
      })
    }
  }

  const splitterLineClass = [
    'hidden',
    'group-hover/scissor:block',
    'absolute',
    'h-full',
    'mt-4.5',
    'ml-0.5',
    'border-dashed',
    'border-overlayAccent',
    'border-l'
  ].join(' ')

  return Array.from({ length: colSpan }).map((_, i) => (
    i > 0
      ? <div
        key={i + columnId}
        className="relative -ml-1"
        style={{ height: enableSplitter ? (widthSetterHeight - 14) + 'px' : '0' }}
      >
        <div className="group/scissor">
          {enableSplitter
            ? <div className={splitterLineClass}>&nbsp;</div>
            : <></>
          }

          <IconButton
            buttonProps={{
              className: "rotate-90 text-overlayAccent",
              'aria-label': `split this ${COL_SPAN_CLASS[i]} at point ${i}`,
              onMouseEnter: () => { setEnableSplitter(true) },
              onMouseLeave: () => { setEnableSplitter(false) }
            }}
            iconProps={{ size: 0.75, className: "hover:text-black" }}
            icon={mdiScissorsCutting}

            onClick={() => { splitColumns(i, columnId) }}
          />
        </div>
      </div>
      : <div key={i + columnId}>&nbsp;</div>
  ))
}
// -translate-x-1/2
export default function DMG_DDH_ColumnSplitter({
  widthSetterHeight,
  dragMode,
  colSpan,
  enableOverlay,
  columnId
}: DMG_DDH_ColumnSplitterProps) {
  if (!enableOverlay || colSpan === 1) return <></>

  const dynamicVerticalSplitterWrapperClass = () => [
    'opacity-25',
    dragMode ? 'group-hover/column:opacity-100' : '',
    'transition-opacity',
    'duration-250',
    'w-full',
    'relative',
    'z-30',
  ].join(' ')

  const dynamicVerticalSplitterClass = (c: string) => [
    'absolute',
    'z-30',
    '-top-1',
    'grid',
    'w-full',
    GRID_COL_CLASS[c] ?? ''
  ].join(' ')

  return (
    <div className={dynamicVerticalSplitterWrapperClass()}>
      <div
        className={dynamicVerticalSplitterClass((colSpan) + '')}
      >
        <TwelvePtSplitters {...{ colSpan, widthSetterHeight, columnId }} />
      </div>
    </div>
  )
}
