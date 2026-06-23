import { DMGTypeComponent } from "../DynamicMetaGrid/DMG"
import Editable from "../Editable/Editable"

export default function DynamicBlank({ component }: { component: DMGTypeComponent }) {
  return (
    <div className={'w-full h-full p-5 ' + component.className}>
      <Editable {...{ component }} />
    </div>)
}