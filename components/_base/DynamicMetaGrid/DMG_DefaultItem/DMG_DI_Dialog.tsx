"use no memo";

import { Dialog, DialogPassThroughOptions } from "primereact/dialog";
import { Dropdown, DropdownPassThroughOptions } from 'primereact/dropdown';
import { useState } from "react";
import { FabButton } from "../../FabButton";
import { PageComponentType } from "@/app/__types/PageComponentType";
import { UUID } from "crypto";

export type DMG_DI_DialogOnCreateProps = {
  metaId?: UUID;
  colId?: UUID;
  rowId?: UUID;
  type: PageComponentType;
}

export type DMG_DI_DialogProps = {
  onCreate: ({ metaId, colId, type }: DMG_DI_DialogOnCreateProps) => void,
  metaId?: UUID;
  colId?: UUID;
  rowId?: UUID;
  showEditModal: boolean;
  setShowEditModal: (val: boolean) => void;
}

export default function DMG_DI_Dialog({
  onCreate,
  metaId,
  colId,
  rowId,
  showEditModal,
  setShowEditModal,
}: DMG_DI_DialogProps) {
  const dialogPt: DialogPassThroughOptions = {
    closeButtonIcon: { className: 'mr-1 mt-2' },
    mask: { className: 'bg-dialogBackgroundMask!' },
    header: { className: 'text-2xl mb-2' },
    content: { className: 'mt-5' }
  }

  const ddPt: DropdownPassThroughOptions = {
    root: { className: 'px-1' },
    list: { className: 'bg-initBackground p-10' },
    item: { className: 'flex items-center w-full p-2' },
    checkIcon: { className: 'block text-primary' },
    itemLabel: { className: 'capitalize block px-2' },
  }

  const [chosenComponent, setChosenComponent] = useState<PageComponentType>()

  const hideDialog = (next?: () => void) => {
    if (!showEditModal) return; setShowEditModal(false);
    if (typeof next === 'function') next()
  }

  const componentListSansDefault = Object.values(PageComponentType).filter(it => it !== PageComponentType.Default)

  return (<Dialog
    pt={dialogPt}
    header="Add a new item"
    visible={showEditModal}
    modal
    draggable={false}
    className="bg-initBackground shadow p-5"
    style={{ width: '30vw' }}
    onHide={hideDialog}
  >
    <Dropdown
      value={chosenComponent}
      pt={ddPt}
      onChange={(e: { value: any; }) => setChosenComponent(e.value)}
      options={componentListSansDefault}
      optionLabel="column"
      placeholder="Choose a component type"
      className="w-full md:w-14rem"
      checkmark={true}
      highlightOnSelect={false}
    />
    <div className="flex justify-end pt-5">
      <FabButton
        icon="pi pi-times"
        color="bg-initBackground! text-cardForeground! hover:bg-primary"
        aria-label="cancel"
        onClick={() => { hideDialog() }}
      />

      <FabButton
        icon="pi pi-check"
        color="bg-initBackground! text-cardForeground! hover:bg-primary"
        disabled={!chosenComponent}
        aria-label="confirm"
        onClick={() => {
          hideDialog(() => {
            onCreate({ metaId, colId, rowId, type: chosenComponent as PageComponentType })
          })
        }}
      />
    </div>
  </Dialog>)
}