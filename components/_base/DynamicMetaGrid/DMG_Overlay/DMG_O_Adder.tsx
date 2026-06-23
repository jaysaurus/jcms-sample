import { mdiPlusCircle } from "@mdi/js";
import IconButton from "../../IconButton";
import { useState } from "react";
import DMG_DI_Dialog from "../DMG_DefaultItem/DMG_DI_Dialog";
import { DMG_O_ChildProps } from "./DMG_Overlay";
import { useGetCachedMetaByComponentId } from "@/hooks/metaHooks";
import { useCreateComponentMutation } from "@/hooks/componentHooks";
import { ComponentContainer, DMGTypeComponent, PageComponentType } from "../DMG";
import { SMALL_DEVICE } from "../../MediaQuery";
import { useMediaQuery } from "usehooks-ts";

export default function DMG_O_Adder({ component, colIndex }: DMG_O_ChildProps) {
  const adderWrapperClass = [
    'absolute',
    'w-full',
    'flex',
    'justify-center',
    '-bottom-7.5',
    'z-40',
  ].join(' ')

  const adderLineClass = [
    'mt-2.5',
    'absolute',
    'border-t',
    'border-dashed',
    'border-overlayHighlight',
    'w-full',
  ].join(' ')

  const [showEditModal, setShowEditModal] = useState(false)

  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()
  const createComponent = useCreateComponentMutation()

  const isSmallDevice = useMediaQuery(SMALL_DEVICE)

  const rowOrCol = isSmallDevice ? ComponentContainer.Row : ComponentContainer.Column

  const createUpdateComponent = ({ type }: DMGTypeComponent) => {

    const meta = getCachedMetaByComponentId(component.id!, rowOrCol)
    if (meta) {
      createComponent.mutate({
        _id: meta._id,
        [isSmallDevice ? 'rowId' : 'colId']:
          meta[rowOrCol].find(col => col.ordinal === colIndex)!.id,
        componentId: component.id!,
        patch: {
          type,
          ordinal: component.ordinal! + 1,
          title: '',
          content: '',
          className: '',
          items: null,
          height: 6,
        }
      })
    }
  }

  return (<>
    <DMG_DI_Dialog
      onCreate={createUpdateComponent}
      {...{ showEditModal, setShowEditModal }}
    />
    <div className={adderWrapperClass}>
      <div className={adderLineClass}>&nbsp;</div>
      <div className="block z-41 p-1 -mt-1 rounded-full bg-background">
        <IconButton
          icon={mdiPlusCircle}
          buttonProps={{
            className:
              [
                'bg-background',
                'py-0',
                'opacity-25',
                'hover:opacity-75',
                'transition-opacity',
                'hover:text-overlayAccent!',
                'text-overlayHighlight!',
              ].join(' ')
          }}
          iconProps={{ size: 0.75 }}
          onClick={() => setShowEditModal(true)}
        />
      </div>
    </div>
  </>)
}