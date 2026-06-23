import { mdiDotsGrid } from "@mdi/js";
import Icon from "@mdi/react";
import { Dispatch, RefObject, useEffect, useRef, useState } from "react";
import DMG_O_StickDragDown from "./DMG_O_StickDragDown";
import { SNAP, useGetCachedMetaByComponentId } from "@/hooks/metaHooks";
import { PageComponentType } from "@/app/__types/PageComponentType";
import { ComponentContainer, DMGTypeComponent } from "../DMG";
import { UpdateComponentMetaProps, useUpdateComponentMutation } from "@/hooks/componentHooks";
import { debounce } from "lodash";
import { UUID } from "crypto";
import DMG_O_Delete from "./DMG_O_Delete";
import DMG_O_Erase from "./DMG_O_Erase";
import DMG_O_Adder from "./DMG_O_Adder";
import { useMediaQuery, useResizeObserver } from "usehooks-ts";
import MediaQuery, { SMALL_DEVICE } from "../../MediaQuery";
import { MediaSizes } from "@/libs/constants";
import ConditionalComponent from "../../ConditionalComponent";
import DMG_O_CopyRef from "./DMG_O_CopyRef";
import DMG_O_PasteRef from "./DMG_O_PasteRef";

export type DMG_OverlayProps = {
  children: any;
  component: DMGTypeComponent;
  localHeight: number;
  setLocalHeight: Dispatch<number>;
  enableOverlay: boolean;
  dragMode: boolean;
  componentCount?: number;
  colIndex: number;
  setEnableOverlay: Dispatch<boolean>;
  handleRef: (element: Element | null) => void;
  componentDrag: boolean;
  setComponentDrag: Dispatch<boolean>;
  colDrag: boolean;
}

export type DMG_O_ChildProps = {
  component: DMGTypeComponent,
  colIndex: number
}

export default function DMG_Overlay({
  children,
  component,
  componentCount,
  enableOverlay,
  setEnableOverlay,
  localHeight,
  setLocalHeight,
  colIndex,
  handleRef,
  dragMode,
  componentDrag,
  setComponentDrag,
  colDrag,
}: DMG_OverlayProps) {
  const [] = useState(false)

  const overlayWrapperClass = [
    'absolute',
    enableOverlay ? '' : 'hidden',
  ].join(' ')

  const updateComponent = useUpdateComponentMutation()

  const debounceMutate = useRef(
    debounce((args: UpdateComponentMetaProps) => {
      updateComponent.mutate(args)
    }, 500)).current

  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()

  const ref = useRef<HTMLDivElement>(null)
  const { width: overlayWidth = 0 } = useResizeObserver({
    ref: ref as RefObject<HTMLElement>,
    box: 'border-box',
  })

  const isSmallDevice = useMediaQuery(SMALL_DEVICE)

  const rowOrCol = isSmallDevice ? ComponentContainer.Row : ComponentContainer.Column

  useEffect(() => {
    const meta = getCachedMetaByComponentId(component.id!, rowOrCol)
    const metaComp = meta?.[rowOrCol].find(col => col.ordinal === colIndex)?.components.find(it => it.id === component.id)
    if (meta && metaComp && metaComp.height !== localHeight / SNAP) {
      debounceMutate({
        _id: meta._id,
        [isSmallDevice ? 'rowId' : 'colId']:
          meta[rowOrCol]
            .find(col => col.ordinal === colIndex)!.id,
        componentId: metaComp.id as UUID,
        patch: {
          height: localHeight / SNAP
        }
      })
    }
  }, [localHeight])

  const overlayClass = [
    'group/overlay',
    'absolute',
    'flex',
    'left-0',
    'top-0',
    'mt-2.5',
    'ml-2.5',
    'pb-4',
    'bg-white',
    'opacity-50',
    'border',
    'border-dashed',
    'border-black,'
  ].join(' ')

  const dragClass = [
    'DragButton',
    'absolute',
    'right-7',
    'top-7',
    'm-1',
    'cursor-grab',
    'opacity-25',
    'hover:opacity-100',
    'z-50'
  ].join(' ')

  const componentDeleteEraseClass = [
    'absolute',
    'right-7',
    'm-0.5',
    'mr-1.5',
    'bottom-6.5',
    'z-50',
  ].join(' ')

  return (<div className="group/localComponent flex justify-center items-center w-full h-full relative">
    <div className="relative w-full h-full">
      {children}
    </div>
    <ConditionalComponent condition={enableOverlay && (!isSmallDevice || (componentCount || 0) > 1)}>
      <button
        ref={handleRef}
        aria-label="relocate component"
        disabled={!dragMode || colDrag}
        className={dragClass}
        onPointerDown={() => setComponentDrag(true)}
      >
        <Icon
          path={mdiDotsGrid}
          size={0.75}
        />
      </button>
    </ConditionalComponent>
    <div
      ref={ref}
      className={overlayWrapperClass}
      style={{ width: 'calc(100% - 32px)', height: 'calc(100% - 32px)' }}
    >
      <div
        className={overlayClass}
        style={{ width: 'calc(100% - 20px)', height: 'calc(100% - 20px)' }}
      >
        <div className="w-full h-full flex justify-center z-80">
          <DMG_O_StickDragDown
            minHeight={SNAP * 3}
            elementHeight={localHeight}
            setElementHeight={setLocalHeight}
          />
        </div>
      </div>

      <MediaQuery query={{ gte: MediaSizes.MD }}>
        <DMG_O_Adder {...{ component, colIndex }} />
      </MediaQuery>
    </div>
    <ConditionalComponent condition={enableOverlay}>
      <div
        className={componentDeleteEraseClass}>
        <div className="opacity-25 hover:opacity-75! flex">
          <DMG_O_CopyRef {...{ component }} />

          <DMG_O_PasteRef {...{ component }} />

          {
            component.type !== PageComponentType.Default
              ? <div className="-mb-1 mt-1">
                <DMG_O_Erase {...{ component, colIndex }} />&nbsp;
              </div>
              : <></>
          }

          {
            component.type == PageComponentType.Default
              ? <div className="-mr-0.5 -mb-1">
                <DMG_O_Delete {...{ component, colIndex }} />
              </div>
              : <div className="-mr-0.5 -mb-10 mt-1">
                <DMG_O_Delete {...{ component, colIndex }} />
              </div>
          }
        </div>
      </div>
    </ConditionalComponent>
  </div >)
}