import { InputEventHandler, KeyboardEventHandler, useState } from "react"
import { DMGTypeComponent } from "../DynamicMetaGrid/DMG"
import Editable from "../Editable/Editable"

export default function DynamicHeading({ component, isAdmin }: { component: DMGTypeComponent, isAdmin: boolean }) {

  const [h1, setH1] = useState('')
  const [h2, setH2] = useState('')

  const handleH1KeyUpdate = (evt: { target?: HTMLHeadingElement }) => {
    setH1(evt.target?.innerHTML || '')
  }

  const handleH2KeyUpdate = (evt: { target?: HTMLHeadingElement }) => {
    setH2(evt.target?.innerHTML || '')
  }

  return (
    <div className={'h-full p-5 font-bold ' + component.className}>
      <h1
        contentEditable={isAdmin ? 'true' : 'false'}
        onKeyUp={handleH1KeyUpdate as unknown as KeyboardEventHandler<HTMLHeadingElement>}
      />
      <h2
        contentEditable={isAdmin ? 'true' : 'false'}
        onKeyUp={handleH1KeyUpdate as unknown as KeyboardEventHandler<HTMLHeadingElement>}
      />
    </div>)
}