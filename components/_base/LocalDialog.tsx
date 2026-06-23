import { dialogPt } from "@/libs/dialogPT";
import { Dialog } from "primereact/dialog";
import { Dispatch } from "react";

export type LocalDialogProps = {
  show: boolean;
  setShow: Dispatch<boolean>;
  children: React.ReactNode;
  header?: string;
}

export default function LocalDialog({
  show,
  setShow,
  children,
  header,
}: LocalDialogProps) {
  return (<Dialog
    pt={dialogPt}
    header={header}
    modal
    visible={show}
    className="bg-initBackground shadow p-5"
    onHide={() => setShow(false)}
    style={{
      backgroundColor: `color-mix(in srgb, var(--overlayBackground) 70%, transparent)`,
      backdropFilter: 'blur(.4rem)',
      WebkitBackdropFilter: 'blur(.5rem)',
      boxShadow: `0 .1rem .5rem .1rem color-mix(in srgb, var(--overlayBackground) 10%, transparent)`,
    }}
  >
    {children}
  </Dialog>)
}