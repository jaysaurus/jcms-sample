import { useState } from "react";
import Link from 'next/link'
import { L_EMB_I_EditUI } from "@/components/layout/L_EditableMenuBar/L_EMB_Item/L_EMB_I_EditUI";
import type { Menu } from "@/hooks/menuHooks"
import { useDeleteMenuMutation, useUpdateMenuMutation } from "@/hooks/menuHooks"

type MenuUI = Menu & {
  editable: boolean;
}

export function L_EMB_Item({ id, href, ariaLabel = '', icon = '', label, editable }: MenuUI) {
  const [editMode, setEditMode] = useState(false)

  const updateMutation = useUpdateMenuMutation()
  const deleteMenuMutation = useDeleteMenuMutation()

  return (
    <div className="flex mx-2 mt-2">
      <Link
        href={href}
        aria-label={ariaLabel}
      >
        {icon ? <i className={icon} /> : <></>}
        {label}
      </Link>

      <L_EMB_I_EditUI
        id={id}
        clause={editable}
        editing={editMode}
        href={href}
        label={label}
        onEdit={() => { setEditMode(!editMode) }}
        onSave={(m: Menu) => { updateMutation.mutate({ _id: id, patch: m }); setEditMode(false) }}
        onCancel={() => { setEditMode(false) }}
        onDelete={() => { deleteMenuMutation.mutate({ _id: id }); setEditMode(false) }}
      />
    </div>
  )
}