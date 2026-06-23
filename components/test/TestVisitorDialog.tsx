import { mdiAccount, mdiCircle, mdiLanguagePython, mdiLeafCircle, mdiLeafCircleOutline, mdiReact } from "@mdi/js";
import { Dialog, DialogPassThroughOptions } from "primereact/dialog"
import { Dispatch, useState } from "react";
import IconList from "../_base/IconList";
import { Button } from "primereact/button";
import IconButton from "../_base/IconButton";
import Confirm from "../_base/Confirm";
import { api } from "@/axiosConfig";
import { useShowLocalToast } from "../_base/LocalToast";

export type TestVisitorDialogProps = {
  showDialog: boolean;
  setShowDialog: Dispatch<boolean>;
  outcome: (outcome: boolean) => void;
}

export default function TestVisitorDialog({ showDialog, setShowDialog, outcome }: TestVisitorDialogProps) {
  const dialogPt: DialogPassThroughOptions = {
    closeButtonIcon: { className: 'mr-1 mt-2' },
    mask: { className: 'bg-dialogBackgroundMask!' },
    header: { className: 'text-2xl mb-2' },
    content: { className: 'mt-5' }
  }

  const spec = [
    { label: 'Python Flask backend', icon: mdiLanguagePython, iconColor: 'primary' },
    { label: 'React with TypeScript nuxt front-end', icon: mdiReact, iconColor: 'primary' },
    { label: 'MongoDB backend', icon: mdiLeafCircle, iconColor: 'primary' },
  ]

  const [visitorDisclaimer, setVisitorDisclaimer] = useState(false)
  const showToast = useShowLocalToast()

  const accept = async () => {
    setVisitorDisclaimer(false)

    try {
      await api.post(`/auth/visit`)

      // showToast({
      //   severity: 'success',
      //   message: 'Welcome, visitor!',
      //   life: 3000
      // })
      outcome(true)
    } catch (e) {
      // showToast({
      //   severity: 'error',
      //   message: e as string
      // })
      outcome(false)
    } finally {
      console.log('TODO')
    }
  }

  const reject = () => {
    setShowDialog(false)
    setVisitorDisclaimer(false)
    outcome(false)
  }

  const fireDisclaimer = () => {
    setShowDialog(false)
    setVisitorDisclaimer(true)
  }

  return (
    <>
      <Confirm
        visible={visitorDisclaimer}
        header="Confirm"
        accept={accept}
        reject={reject}
        onHide={reject}
      >
        <>
          <div>You will be permitted <strong>limited</strong> access to modify <em>this</em> page's layout.</div>
          <div>Your session will last 5 minutes.</div>
          <div>Modifications will be wiped after 5 minutes.</div>
        </>
      </Confirm>

      <Dialog
        pt={dialogPt}
        header="Content Management System"
        visible={showDialog}
        modal
        draggable={false}
        className="bg-initBackground shadow p-5"
        style={{
          width: '30vw',
          backgroundColor: `color-mix(in srgb, var(--overlayBackground) 80%, transparent)`,
          backdropFilter: 'blur(.4rem)',
          WebkitBackdropFilter: 'blur(.5rem)',
          boxShadow: `0 .1rem .5rem .1rem color-mix(in srgb, var(--overlayBackground) 10%, transparent)`,
        }}
        onHide={reject}
      >
        <h1 className="font-bold">Site CMS</h1>

        <div>
          <div>
            The following is an insight into how I built this site.
          </div>
          <div>
            It uses:
          </div>

          <IconList items={spec} />

          <div className="flex flex-col items-end w-full">
            <div>
              <strong>To test out the CMS, click the button below</strong>
            </div>
            <IconButton
              buttonProps={{ className: 'mt-5!' }}
              icon={mdiAccount}
              label="Activate visitor session"
              onClick={fireDisclaimer}
            />
          </div>
        </div>
      </Dialog>
    </>
  )
}