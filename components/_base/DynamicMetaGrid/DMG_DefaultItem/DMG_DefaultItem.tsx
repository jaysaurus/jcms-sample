import { mdiPlusCircle } from "@mdi/js";
import { PageComponentType } from "@/app/__types/PageComponentType";
import Icon from "@mdi/react";
import DMG_DI_Dialog, { DMG_DI_DialogOnCreateProps } from "./DMG_DI_Dialog";
import { useUpdateComponentMutation } from "@/hooks/componentHooks";
import { useState } from "react";
import { UUID } from "crypto";
import { useAtom } from "jotai";
import { isAdminAtom } from "@/hooks/authoriseHooks";

export type DMG_DefaultItemProps = {
  metaId: UUID;
  colId?: UUID;
  rowId?: UUID;
  componentId: UUID;
  layoutMode: boolean;
}

export default function DMG_DefaultItem({
  metaId,
  colId,
  rowId,
  componentId,
  layoutMode,
}: DMG_DefaultItemProps) {
  const [isAdmin] = useAtom(isAdminAtom)
  const defaultItemClass = [
    layoutMode || !isAdmin ? '' : 'hover:border',
    'border-overlayHighlight',
    'w-full',
    'h-full',
  ].join(' ')

  const [showEditModal, setShowEditModal] = useState(false)

  const updateComponent = useUpdateComponentMutation()

  const createUpdateComponent =
    ({ metaId, colId, rowId, type }: DMG_DI_DialogOnCreateProps) => {
      updateComponent.mutate({
        _id: metaId,
        colId,
        rowId,
        componentId,
        patch: { type: type as unknown as PageComponentType | undefined },
      })
    }
  return (
    <>
      <div className={defaultItemClass}>
        {
          isAdmin
            ? <div className="bg-overlayBackground w-full h-full flex items-center justify-center opacity-50">
              <button
                className="w-15 h-15"
                aria-label="add new column"
                onClick={() => { setShowEditModal(!showEditModal) }}
              >
                <Icon className="block hover:text-overlayAccent text-overlayHighlight" path={mdiPlusCircle} />
              </button>
            </div>
            : <></>
        }

      </div>

      <DMG_DI_Dialog
        onCreate={createUpdateComponent}
        {...{ metaId, colId, rowId, showEditModal, setShowEditModal }} />
    </>
  )
}