import { mdiEraser } from "@mdi/js";
import Icon from "@mdi/react";
import { ComponentContainer } from "../DMG";
import { PageComponentType } from "@/app/__types/PageComponentType";
import { useGetCachedMetaByComponentId } from "@/hooks/metaHooks";
import { useUpdateComponentMutation } from "@/hooks/componentHooks";
import DMG_Confirm from "../DMG_Confirm";
import { useState } from "react";
import { UUID } from "crypto";
import { DMG_O_ChildProps } from "./DMG_Overlay";
import { SMALL_DEVICE } from "../../MediaQuery";
import { useMediaQuery } from "usehooks-ts";
import { useShowLocalToast } from "../../LocalToast";

export default function DMG_O_Erase({ component, colIndex }: DMG_O_ChildProps) {
  const showToast = useShowLocalToast()

  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()
  const updateComponent = useUpdateComponentMutation()

  const isSmallDevice = useMediaQuery(SMALL_DEVICE)

  const rowOrCol = isSmallDevice ? ComponentContainer.Row : ComponentContainer.Column

  const handleErase = (confirmed = false) => {
    if (confirmed) {
      const meta = getCachedMetaByComponentId(component.id!, rowOrCol)
      if (meta) {
        updateComponent.mutateAsync({
          _id: meta._id,
          [isSmallDevice ? 'rowId' : 'colId']:
            meta[rowOrCol].find(col => col.ordinal === colIndex)!.id,
          componentId: component.id!,
          patch: {
            type: PageComponentType.Default,
            title: '',
            content: '',
            className: '',
            items: null,
          }
        }).catch(() => {
          showToast({
            severity: 'error',
            id: component.id + '_visitor',
            message: 'Sorry, this operation is not supported for visitors',
            life: 3000
          })
        })
      }
    } else {
      setConfirmErase(component.id!)
    }
  }

  const [confirmErase, setConfirmErase] = useState<UUID | ''>('')

  return (
    <>
      <DMG_Confirm
        componentId={component.id}
        visible={confirmErase}
        setVisible={setConfirmErase}
        onConfirm={() => handleErase(true)}
      />

      <button
        aria-label="clear component"
        className="text-gray-500 hover:text-black"
        onClick={() => handleErase()}
      >
        <Icon
          path={mdiEraser}
          size={0.75}
        />
      </button>
    </>
  )
}