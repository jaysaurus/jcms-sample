import { PageComponentType } from "@/app/__types/PageComponentType";
import DMG_DefaultItem from "./DMG_DefaultItem/DMG_DefaultItem";
import { ComponentContainer, DMGTypeComponent } from "./DMG";
import DynamicCard from "../DynamicCard/DynamicCard";
import { useGetCachedMetaByComponentId } from "@/hooks/metaHooks";
import ConditionalComponent from "@/components/_base/ConditionalComponent";
import { useMediaQuery } from "usehooks-ts";
import { SMALL_DEVICE } from "@/components/_base/MediaQuery";
import DynamicBlank from "../DynamicBlank/DynamicBlank";
import { useAtomValue } from "jotai";
import { isAdminAtom } from "@/hooks/authoriseHooks";
import DynamicHeading from "../DynamicHeading/DynamicHeading";

export type DMG_ComponentManagerProps = {
  component: DMGTypeComponent;
  enableOverlay: boolean;
}

export default function DMG_ComponentManager(
  { component, enableOverlay }: DMG_ComponentManagerProps) {

  const isAdmin = useAtomValue(isAdminAtom)
  const isSmallDevice = useMediaQuery(SMALL_DEVICE)

  const rowOrCol = isSmallDevice ? ComponentContainer.Row : ComponentContainer.Column
  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()

  if (component.id) {
    const meta = getCachedMetaByComponentId(component.id, rowOrCol)

    const row = meta?.[ComponentContainer.Row]?.find(row => row.components.find(c => c.id === component.id))
    const col = meta?.[ComponentContainer.Column]?.find(col => col.components.find(c => c.id === component.id))

    if (meta) {
      const componentSwitch = (component: DMGTypeComponent, visited: Set<string> = new Set()) => {
        switch (component.type!) {
          case PageComponentType.Default:
            return <ConditionalComponent
              condition={!!(row || col)}
            >
              <DMG_DefaultItem
                metaId={meta?._id!}
                colId={col?.id}
                rowId={row?.id}
                componentId={component.id!}
                layoutMode={false}
              />
            </ConditionalComponent>

          case PageComponentType.Card:
            return <DynamicCard component={component} />

          case PageComponentType.Empty:
            return <DynamicBlank component={component} />

          case PageComponentType.Heading:
            return <DynamicHeading {...{ component, isAdmin }} />

          case PageComponentType.Reference:
            visited.add(component.id!)

            for (let col of meta.columns) {
              for (let comp of col.components) {
                if (comp.id === component.reference && !visited.has(comp.id!)) {
                  return componentSwitch({
                    ...comp,
                    reference: component.id,
                    height: component.height,
                    isReference: true
                  }, visited)
                }
              }
            }

            return <DMG_DefaultItem
              metaId={meta?._id!}
              colId={col?.id}
              rowId={row?.id}
              componentId={component.id!}
              layoutMode={false}
            />

          default:
            return <div>TODO</div>
        }
      }

      const outerWrapperClass = [
        isAdmin && !enableOverlay ? 'p-3' : 'p-5',
        'w-full',
        'h-full',
      ].join(' ')

      const componentWrapperClass = [
        'border-black',
        'border-dotted',
        'w-full',
        'h-full',
        'rounded',
        isAdmin && !enableOverlay ? 'hover:border-1' : ''
      ].join(' ')
      return <div className={outerWrapperClass}>
        <div className={componentWrapperClass}>

          {componentSwitch(component)}
        </div>
      </div>
    }
  }
  return <></>
}