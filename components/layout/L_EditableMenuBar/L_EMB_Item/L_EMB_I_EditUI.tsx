import { Button } from "primereact/button";
import { useState, type ChangeEvent, type Dispatch, type MouseEventHandler, type SetStateAction } from "react";
import { InputText } from "primereact/inputtext";
import type { Menu } from "@/hooks/menuHooks";
import { FabButton } from "@/components/_base/FabButton";

type L_EMB_ItemEditUIProps = {
  clause: boolean;
  editing: boolean;
  href: string;
  label?: string;
  id: number | string | undefined;
  onEdit: MouseEventHandler;
  onSave: (m: { href: string, label: string }) => void;
  onCancel: MouseEventHandler;
  onDelete: MouseEventHandler;
}

export function L_EMB_I_EditUI(
  {
    clause,
    editing = false,
    href,
    label = '',
    id,
    onEdit,
    onSave,
    onCancel,
    onDelete,
  }: L_EMB_ItemEditUIProps) {

  const [localHref, setLocalHref] = useState(href)
  const [localLabel, setLocalLabel] = useState(label)

  const actionChange = (e: ChangeEvent<HTMLInputElement>, setter: Dispatch<SetStateAction<string>>) => {
    setter(e.target.value)
  }

  const editUI =
    !editing
      ? <div className="absolute -mt-2 -ml-2">
        <FabButton
          rounded
          size="small"
          icon="pi pi-pencil"
          aria-label="edit this menu item"
          onClick={onEdit}
        />
      </div>
      : <div className="z-99 bg-white w-25 flex absolute -right-2.5 -mt-2.5">
        <div className="bg-white border-2 rounded-sm p-2">
          <div>
            <div className="flex justify-end">
              <Button
                icon="pi pi-times"
                size="small"
                aria-label="close"
                onClick={onCancel}
              />
            </div>
            <div className="flex justify-between">
              <label
                className="font-bold"
                htmlFor={`L_EMB_I_EU_href_${id}`}>Href</label>
            </div>
            <InputText
              id={`L_EMB_I_EU_href_${id}`}
              className="border rounded-sm p-1"
              value={localHref}
              onClick={(e) => { e.stopPropagation() }}
              onKeyDown={(e) => { e.stopPropagation() }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => actionChange(e as ChangeEvent<HTMLInputElement>, setLocalHref)}
            />
          </div>
          <div className="my-2">
            <label
              className="font-bold"
              htmlFor={`L_EMB_I_EU_label_${id}`}>Label</label>
            <InputText
              id={`L_EMB_I_EU_label_${id}`}
              className="border p-1 rounded-sm"
              value={localLabel}
              onClick={(e) => { e.stopPropagation() }}
              onKeyDown={(e) => { e.stopPropagation() }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => actionChange(e, setLocalLabel)}
            />
          </div>
          <div className="flex justify-between">
            <FabButton
              rounded
              size="small"
              icon="pi pi-trash"
              aria-label="delete this menu item"
              onClick={onDelete}
            />
            <div className="flex">
              <FabButton
                icon="pi pi-check"
                size="small"
                aria-label="save"
                onClick={() => onSave({ href: localHref, label: localLabel })}
              />
              &nbsp;
              <FabButton
                icon="pi pi-times"
                size="small"
                aria-label="close"
                onClick={onCancel}
              />
            </div>
          </div>
        </div>
      </div>

  return (clause
    ? <div className="mx-2">
      {editUI}
    </div>
    : <></>)
}