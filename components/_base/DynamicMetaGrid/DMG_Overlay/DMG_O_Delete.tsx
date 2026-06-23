import { mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { ComponentContainer, DMGTypeComponent } from "../DMG";
import { PageComponentType } from "@/app/__types/PageComponentType";
import { useGetCachedMetaByComponentId } from "@/hooks/metaHooks";
import { useDeleteComponentMutation } from "@/hooks/componentHooks";
import DMG_Confirm from "../DMG_Confirm";
import { useState } from "react";
import { UUID } from "crypto";
import { DMG_O_ChildProps } from "./DMG_Overlay";
import { useMediaQuery } from "usehooks-ts";
import { SMALL_DEVICE } from "../../MediaQuery";

export default function DMG_O_Delete({ component, colIndex }: DMG_O_ChildProps) {

  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()
  const deleteComponent = useDeleteComponentMutation()

  const isSmallDevice = useMediaQuery(SMALL_DEVICE)

  const rowOrCol = isSmallDevice ? ComponentContainer.Row : ComponentContainer.Column

  const handleDelete = (confirmed = false) => {
    if (component.type === PageComponentType.Default || confirmed) {
      const meta = getCachedMetaByComponentId(component.id!, rowOrCol)
      if (meta) {
        deleteComponent.mutate({
          _id: meta._id,
          [isSmallDevice ? 'rowId' : 'colId']:
            meta[rowOrCol].find(col => col.ordinal === colIndex)!.id,
          componentId: component.id!,
        })
      }
    } else {
      setConfirmDelete(component.id!)
    }
  }

  const [confirmDelete, setConfirmDelete] = useState<UUID | ''>('')

  return (
    <>
      <DMG_Confirm
        componentId={component.id}
        visible={confirmDelete}
        setVisible={setConfirmDelete}
        onConfirm={() => handleDelete(true)}
      />

      <button
        aria-label="delete component"
        className="text-gray-500 hover:text-black"
        onClick={() => handleDelete()}
      >
        <Icon
          path={mdiTrashCanOutline}
          size={0.75}
        />
      </button>
    </>
  )
}