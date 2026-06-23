import { DMGTypeComponent } from "../DynamicMetaGrid/DMG"
import Editable from "../Editable/Editable"

export default function DynamicCard({ component }: { component: DMGTypeComponent }) {
  return (
    <div
      className={'bg-cardBackground rounded shadow w-full h-full p-5 ' + component.className}
      style={{
        backgroundColor: `color-mix(in srgb, var(--overlayBackground) 80%, transparent)`,
        backdropFilter: 'blur(1rem)',
        WebkitBackdropFilter: 'blur(.5rem)',
        boxShadow: `0 .1rem .5rem .1rem color-mix(in srgb, var(--overlayBackground) 10%, transparent)`,
      }}
    >
      <Editable {...{ component }} />
    </div>)
}