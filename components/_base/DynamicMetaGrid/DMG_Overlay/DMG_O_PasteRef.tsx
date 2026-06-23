import { MediaSizes } from "@/libs/constants";
import ConditionalComponent from "../../ConditionalComponent";
import MediaQuery from "../../MediaQuery";
import { ComponentContainer, ComponentReferenceAtom, DMGTypeComponent } from "../DMG";
import { PageComponentType } from "@/app/__types/PageComponentType";
import IconButton from "../../IconButton";
import { mdiLinkBoxVariant, mdiLinkBoxVariantOutline } from "@mdi/js";
import { classNames } from "primereact/utils";
import { useAtomValue } from "jotai";
import { useShowLocalToast } from "../../LocalToast";
import { useUpdateComponentMutation } from "@/hooks/componentHooks";
import { useGetCachedMetaByComponentId } from "@/hooks/metaHooks";
import { UUID } from "crypto";

export default function DMG_O_PasteRef({ component }: { component: DMGTypeComponent }) {

  const componentRef = useAtomValue(ComponentReferenceAtom)

  const showToast = useShowLocalToast()

  const updateComponent = useUpdateComponentMutation()
  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()

  const pasteRef = () => {
    const meta = getCachedMetaByComponentId(component.id!, ComponentContainer.Row)
    if (meta) {
      const rowId = meta.rowsSM.find(r => r.components.find(c => c.id === component.id))?.id

      if (rowId) {
        updateComponent.mutateAsync({
          _id: meta._id,
          rowId: rowId,
          componentId: component.id,
          patch: {
            type: PageComponentType.Reference,
            reference: componentRef as UUID,
          }
        }).then(() => {
          showToast({
            severity: 'success',
            message: 'Reference linked',
          })
        })

        return
      }
    }
    showToast({
      severity: 'error',
      message: 'Something went wrong',
    })
  }

  return (
    <ConditionalComponent condition={component.type === PageComponentType.Default}>
      <MediaQuery query={{ lt: MediaSizes.MD }}>
        <IconButton
          icon={mdiLinkBoxVariant}
          buttonProps={{
            disabled: !componentRef,
            className: `mr-1.5 mb-0.5 ${componentRef ? 'text-gray-500 hover:text-black' : 'opacity-25'}`
          }}
          iconProps={{ size: 0.75 }}
          onClick={pasteRef}
        />
      </MediaQuery>
    </ConditionalComponent>
  )
}
