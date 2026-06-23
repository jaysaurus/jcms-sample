"use no memo";

import { Dialog } from "primereact/dialog";
import { dialogPt } from "@/libs/dialogPT";
import { FabButton } from "./FabButton";
import { mdiAlertOutline } from "@mdi/js";
import Icon from "@mdi/react";

export type ConfirmProps = {
  accept: () => void;
  reject: () => void;
  icon?: string;
  header: string;
  children: React.ReactNode;
  visible: boolean;
  onHide: () => void;
}

export default function Confirm({
  accept,
  reject,
  icon,
  header,
  children,
  visible,
  onHide,
}: ConfirmProps) {
  return (<Dialog
    pt={dialogPt}
    header={header}
    visible={visible}
    modal
    className="bg-initBackground shadow p-5"
    style={{
      width: '30vw',
      backgroundColor: `color-mix(in srgb, var(--overlayBackground) 80%, transparent)`,
      backdropFilter: 'blur(.4rem)',
      WebkitBackdropFilter: 'blur(.5rem)',
      boxShadow: `0 .1rem .5rem .1rem color-mix(in srgb, var(--overlayBackground) 10%, transparent)`,
    }}
    {...{ onHide }}
  >
    <div className="flex items-center justify-center-safe">
      <Icon
        path={icon || mdiAlertOutline}
        size={1}
        className="mr-5"
      />
      <div>
        {children}
      </div>
    </div>
    <div className="flex justify-end pt-5">
      <FabButton
        icon="pi pi-times"
        color="text-cardForeground! hover:bg-background"
        aria-label="cancel"
        onClick={reject}
      />

      <FabButton
        icon="pi pi-check"
        color="text-cardForeground! hover:bg-background"
        aria-label="confirm"
        onClick={accept}
      />
    </div>
  </Dialog>)
}