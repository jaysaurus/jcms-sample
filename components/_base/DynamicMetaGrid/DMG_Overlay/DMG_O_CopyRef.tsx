import { MediaSizes } from "@/libs/constants";
import ConditionalComponent from "../../ConditionalComponent";
import MediaQuery from "../../MediaQuery";
import { ComponentReferenceAtom, DMGTypeComponent } from "../DMG";
import { PageComponentType } from "@/app/__types/PageComponentType";
import IconButton from "../../IconButton";
import { mdiCheckboxDefault, mdiCheckboxOutline, mdiLinkBox, mdiLinkBoxVariantOutline } from "@mdi/js";
import { classNames } from "primereact/utils";
import { useAtom, useSetAtom } from "jotai";
import { UUID } from "crypto";
import { useShowLocalToast } from "../../LocalToast";
import { useMemo } from "react";


export default function DMG_O_CopyRef({ component }: { component: DMGTypeComponent }) {
  const [componentRef, setComponentRef] = useAtom(ComponentReferenceAtom)

  const showToast = useShowLocalToast()

  const copyRef = () => {
    setComponentRef(component.id as UUID)

    showToast({
      severity: 'success',
      message: 'Reference copied',
      life: 3000
    })
  }

  const buttonClass = useMemo(() => [
    'mt-1',
    'mr-1.5',
    component.id !== componentRef ? 'text-gray-500 hover:text-black' : '',
    component.id === componentRef ? 'text-success' : '',
  ].join(' ')
    , [componentRef, component])

  const buttonLink = useMemo(() =>
    component.id === componentRef
      ? mdiCheckboxOutline
      : mdiLinkBoxVariantOutline
    , [componentRef, component])

  return (
    <ConditionalComponent condition={component.type !== PageComponentType.Default}>
      <MediaQuery query={{ gte: MediaSizes.MD }}>
        <IconButton
          icon={buttonLink}
          buttonProps={{ className: buttonClass }}
          iconProps={{ size: 0.75 }}
          onClick={copyRef}
        />
      </MediaQuery>
    </ConditionalComponent>
  )
}