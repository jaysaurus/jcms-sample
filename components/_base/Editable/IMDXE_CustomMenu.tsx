import { mdiDotsVertical, mdiFormatFont } from "@mdi/js";
import { useEffect, useRef, useState } from "react";
import IconButton from "../IconButton";
import { Menu } from "primereact/menu";
import { classNames } from "primereact/utils";
import LocalDialog from "../LocalDialog";
import { InputText } from "primereact/inputtext";
import { FabButton } from "../FabButton";
import { DMGTypeComponent } from "../DynamicMetaGrid/DMG";


export type IMDXE_CustomMenuProps = {
  onSetClass: (v: string) => void;
  component: DMGTypeComponent;
}

export default function IMDXE_CustomMenu({ component, onSetClass }: IMDXE_CustomMenuProps) {
  const menuRight = useRef(null);
  const items = [
    {
      items: [
        {
          label: 'set className',
          icon: 'pi pi-refresh',
          template: () => {
            return <IconButton
              buttonProps={{ className: 'px-5' }}
              icon={mdiFormatFont}
              label="Set class name"
              aria-label="Set class name"
              onClick={() => setShowClassDialog(true)}
            />
          }
        },
      ]
    }
  ];

  const [value, setValue] = useState('')

  const [showClassDialog, setShowClassDialog] = useState(false)

  const handleConfirm = () => {
    setShowClassDialog(false)
    onSetClass(value)
    setValue('')
  }

  useEffect(() => {
    setValue(component?.className || '')
  }, [component?.className])
  return (
    <div>
      <LocalDialog
        header="Set component class"
        show={showClassDialog}
        setShow={setShowClassDialog}
      >
        <div>
          <label
            htmlFor="backgroundImgSrc"
            className="pr-5"
          >
            Class name
          </label>

          <InputText
            id="backgroundImgSrc"
            value={value}
            className="p-2 w-60 border border-overlay"
            onChange={(e) => setValue(e.target.value)}
          />

          <div className="flex justify-end pt-5">
            <FabButton
              rounded
              icon="pi pi-times"
              color="text-cardForeground! hover:bg-background"
              aria-label="cancel"
              onClick={() => setShowClassDialog(false)}
            />

            <FabButton
              rounded
              icon="pi pi-check"
              color="text-cardForeground! hover:bg-background"
              aria-label="confirm"
              onClick={handleConfirm}
            />
          </div>
        </div>
      </LocalDialog>
      <IconButton
        buttonProps={{ className: '-ml-1 pt-5.5 -mt-5' }}
        icon={mdiDotsVertical}
        aria-label="component menu"
        onClick={(event) => menuRight.current.toggle(event)}
      />
      <Menu model={items} popup ref={menuRight} id="popup_menu_right" popupAlignment="right" />
    </div>)
}