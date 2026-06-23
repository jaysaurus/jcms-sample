import { ConfirmDialogPassThroughOptions } from "primereact/confirmdialog";
import { DialogPassThroughOptions } from "primereact/dialog";

export const dialogPt: DialogPassThroughOptions = {
  closeButtonIcon: { className: 'mr-1 mt-2' },
  mask: { className: 'bg-dialogBackgroundMask!' },
  header: { className: 'text-2xl mb-2 bg-transparent!' },
  content: { className: 'mt-5 text-xl bg-transparent!' }
}