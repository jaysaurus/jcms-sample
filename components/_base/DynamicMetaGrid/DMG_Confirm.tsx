import { ConfirmDialog } from "primereact/confirmdialog";
import { Dispatch, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import Confirm from "@/components/_base/Confirm";
import { UUID } from "crypto";

export type DMG_ConfirmProps = {
  componentId?: string;
  visible: UUID | '';
  setVisible: Dispatch<UUID | ''>;
  onConfirm: () => void;
}

export default function DMG_Confirm({
  componentId,
  visible,
  setVisible,
  onConfirm,
}: DMG_ConfirmProps) {
  const toast = useRef<Toast>(null)

  const accept = () => {
    onConfirm()
    setVisible('')
    if (toast.current) {
      toast
        .current
        .show({ severity: 'info', summary: 'Deleted', detail: 'Component deleted', life: 3000 });
    }
  }

  const reject = () => {
    setVisible('')
  }

  return (
    <>
      <Toast ref={toast} />
      <Confirm
        visible={visible === componentId}
        header="Confirm"
        accept={accept}
        reject={reject}
        onHide={() => setVisible('')}
      >
        <>
          <div>Are you sure you wish to proceed?</div>
          <div>This cannot be undone!</div>
        </>
      </Confirm>
    </>
  )
}