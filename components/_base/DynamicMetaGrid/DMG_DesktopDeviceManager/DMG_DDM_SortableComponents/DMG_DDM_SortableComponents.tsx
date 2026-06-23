import { useDragDropMonitor } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { ComponentItem, SWAP_COOLDOWN_MS } from "../../DynamicMetaGrid";
import { UUID } from "crypto";
import { CollisionDetector, directionBiased } from "@dnd-kit/collision";
import { SNAP } from "@/hooks/metaHooks";
import DMG_Overlay from "../../DMG_Overlay/DMG_Overlay";
import DMG_ComponentManager from "../../DMG_ComponentManager";
import { Dispatch, useEffect, useState } from "react";
let _lastSwapMs = 0;

export type DMG_DDH_SortableComponentsProps = {
  component: ComponentItem;
  colIndex: number;
  globalIndex: number;
  componentCount?: number;
  dragMode: boolean;
  enableOverlay: boolean;
  setEnableOverlay: Dispatch<boolean>;
  componentDrag: boolean;
  setComponentDrag: Dispatch<boolean>;
  colDrag: boolean;
  heightChanged: ({ height, id }: { height: number, id: string }) => void;
  group?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function DMG_DDH_SortableComponents({
  component,
  colIndex,
  globalIndex,
  dragMode,
  enableOverlay,
  componentCount,
  setEnableOverlay,
  heightChanged,
  componentDrag,
  setComponentDrag,
  colDrag,
  group = "components",
  className,
  children,
}: DMG_DDH_SortableComponentsProps) {
  const swapCooldownCollision: CollisionDetector = (input) => {
    const sourceGroup = (input.dragOperation.source as any)?.sortable?.group;
    if (sourceGroup !== group) return null;
    if (Date.now() - _lastSwapMs < SWAP_COOLDOWN_MS) return null;
    return directionBiased(input);
  };

  const { ref, handleRef } = useSortable({
    id: component.id as unknown as UUID,
    index: globalIndex,
    group,
    collisionDetector: swapCooldownCollision,
    disabled: !dragMode || colDrag || !enableOverlay,
  });

  const isSmRow = group.startsWith('row_');

  useDragDropMonitor({
    onDragStart(event, manager) {
      if (!isSmRow) return;
      if (event.operation.source?.id === component.id) {
        (manager as any).dragOperation.modifiers = [{
          apply: ({ transform }: { transform: { x: number; y: number } }) => ({ x: transform.x, y: 0 }),
          destroy: () => { },
        }];
      }
    },
  });

  const [localHeight, setLocalHeight] = useState(component.height! * SNAP)

  useEffect(() => {
    setLocalHeight(component.height! * SNAP)
  }, [])

  useEffect(() => {
    heightChanged({ height: localHeight, id: component.id! })
  }, [localHeight])

  return (
    <>
      <li
        ref={colDrag ? null : ref}
        id={component.id}
        style={{ height: localHeight + "px" }}
        className={className}
      >
        {children || <></>}
        <DMG_Overlay
          {...{
            componentCount,
            colIndex,
            component,
            handleRef,
            enableOverlay,
            setEnableOverlay,
            localHeight,
            setLocalHeight,
            dragMode,
            componentDrag,
            setComponentDrag,
            colDrag,
          }}
        >
          <DMG_ComponentManager {...{ component, colIndex }} />
        </DMG_Overlay>
      </li>
    </>
  );
}
