import { mdiPlusCircle, mdiScissorsCutting } from "@mdi/js";
import { GRID_COL_CLASS } from "@/libs/tailwindConstants/GridColClassConstant";
import { COL_SPAN_CLASS } from "@/libs/tailwindConstants/ColSpanClassConstant";
import { useState } from "react";

import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";
import { PageComponentType } from "@/app/__types/PageComponentType";
import { useGetCachedMetaByColumnId, useGetCachedMetaByComponentId, useGetCachedMetaByRowId, useUpdatePageMetaMutation, useUpdatePageMetaRowMutation } from "@/hooks/metaHooks";
import { PartitionOf6 } from "@/app/__types/TwelvePtColSpan";
import IconButton from "@/components/_base/IconButton";
import { ComponentContainer, DMGTypeComponent, DMGTypeRowSM, RAW_DMG_COLUMN_COMPONENT } from "../../DMG";

export type DMG_SDM_RM_ComponentSplitterProps = {
  colSpan: number;
  enableOverlay?: boolean;
  dragMode?: boolean;
  row: DMGTypeRowSM;
  component: DMGTypeComponent;
  widthSetterHeight: number
}

const SixPtSplitters = ({ colSpan, widthSetterHeight, row, component }: DMG_SDM_RM_ComponentSplitterProps) => {
  const [enableSplitter, setEnableSplitter] = useState(false)

  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()
  const updatePageMetaRow = useUpdatePageMetaRowMutation()

  const splitColumns = (splitAt: number) => {
    const meta = getCachedMetaByComponentId(component.id!, ComponentContainer.Row)
    const patch = cloneDeep(row)
    const index = patch.components.findIndex(it => it.id === component.id)
    if (index > -1 && meta?._id) {
      patch.components.splice(index, 0, {
        id: uuidv4() as UUID,
        ...pick(patch.components[index], ['height', 'ordinal']),
        ...RAW_DMG_COLUMN_COMPONENT,
      })

      const ordinal = patch.components[index].ordinal

      if (ordinal !== undefined) {
        const sixPtColSpan = patch.sixPtColSpan.split('-').map(Number)
        sixPtColSpan[ordinal] = colSpan - splitAt
        sixPtColSpan.splice(ordinal, 0, splitAt)
        patch.sixPtColSpan = sixPtColSpan.join('-') as PartitionOf6
      }

      patch.components.forEach(it => {
        if (it.ordinal !== undefined && it.id !== component.id && it.ordinal >= component.ordinal!) {
          it.ordinal++
        }
      })

      updatePageMetaRow.mutate({
        _id: meta._id,
        rowId: row.id,
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
        key={i + component.id!}
        className="relative -ml-1"
        style={{ height: enableSplitter ? (widthSetterHeight - 82) + 'px' : '0' }}
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

            onClick={() => { splitColumns(i) }}
          />
        </div>
      </div>
      : <div key={i + component.id!}>&nbsp;</div>
  ))
}
// -translate-x-1/2
export default function DMG_SDM_RM_ComponentSplitter({
  widthSetterHeight,
  dragMode,
  colSpan,
  enableOverlay,
  row,
  component,
}: DMG_SDM_RM_ComponentSplitterProps) {
  if (!enableOverlay || colSpan === 1) return <></>

  const dynamicVerticalSplitterWrapperClass = () => [
    'opacity-25',
    dragMode ? 'group-hover/column:opacity-75' : '',
    'transition-opacity',
    'duration-250',
    'w-full',
    'relative',
    'z-30',
  ].join(' ')

  const dynamicVerticalSplitterClass = (c: string) => [
    'absolute',
    'z-30',
    'top-8',
    'grid',
    'w-full',
    GRID_COL_CLASS[c] ?? ''
  ].join(' ')

  return (
    <div className={dynamicVerticalSplitterWrapperClass()}>
      <div
        className={dynamicVerticalSplitterClass((colSpan) + '')}
      >
        <SixPtSplitters {...{ colSpan, widthSetterHeight, row, component }} />
      </div>
    </div>
  )
}
