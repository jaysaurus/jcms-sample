import { mdiImagePlus } from "@mdi/js";
import IconButton from "../IconButton";
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import LocalDialog from "../LocalDialog";
import { FabButton } from "../FabButton";
import ConditionalComponent from "../ConditionalComponent";

export type DMG_BackgroundImgProps = {
  isAdmin: boolean;
  onSetBackgroundImage: (v: string) => void;
}

export default function DMG_BackgroundImg(
  { onSetBackgroundImage, isAdmin }: DMG_BackgroundImgProps) {
  const [showBGDialog, setShowBGDialog] = useState(false)
  const [value, setValue] = useState('')

  const handleConfirm = () => {
    setShowBGDialog(false)
    onSetBackgroundImage(value)
    setValue('')
  }
  return (<ConditionalComponent condition={isAdmin}>
    <div className="absolute right-1 -mt-6">
      <LocalDialog
        show={showBGDialog}
        setShow={setShowBGDialog}
      >
        <div>
          <label
            htmlFor="backgroundImgSrc"
            className="pr-5"
          >
            image src
          </label>

          <InputText
            id="backgroundImgSrc"
            value={value}
            className="p-2 w-60 border border-overlay"
            onChange={(e) => setValue(e.target.value)}
          />

          <div className="flex justify-end pt-5">
            <FabButton
              icon="pi pi-times"
              color="text-cardForeground! hover:bg-background"
              aria-label="cancel"
              onClick={() => setShowBGDialog(false)}
            />

            <FabButton
              icon="pi pi-check"
              color="text-cardForeground! hover:bg-background"
              aria-label="confirm"
              onClick={handleConfirm}
            />
          </div>
        </div>
      </LocalDialog>

      <IconButton
        icon={mdiImagePlus}
        onClick={() => setShowBGDialog(true)}
        buttonProps={{
          'aria-label': 'Add background images',
          className: 'bg-white',
        }}
        iconProps={{
          size: 0.75,
        }}
      />
    </div>
  </ConditionalComponent>)
}