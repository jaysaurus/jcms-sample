import { Menu, useReorderMenuMutation } from "@/hooks/menuHooks";
import { DragDropProvider, useDragDropMonitor } from "@dnd-kit/react";
import { useSortable } from '@dnd-kit/react/sortable';
import { mdiDotsGrid } from "@mdi/js";
import Icon from "@mdi/react";
import { UUID } from "crypto";
import cloneDeep from "lodash/cloneDeep";
import { useState } from "react";

function Sortable({ menu, index, disabled }: { menu: Menu, index: number, disabled?: boolean }) {
  const { ref } = useSortable({ id: (menu._id as unknown as UUID), index: index, disabled });

  return (
    <li ref={ref} className="item mx-2">
      <div className={`flex align-middle border-accent border p-2 bg-white ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab'}`}>
        <div className="text-sm">{menu.label}</div>
        <Icon
          className="ml-2 mt-1 text-gray-400"
          path={mdiDotsGrid}
          size={0.5}
        />
      </div>
    </li>
  );
}

export function L_EMB_DragAndDrop({ menus, saving }: { menus: Menu[], saving?: boolean }) {
  const [localMenus, setLocalMenus] = useState(
    cloneDeep(
      menus.filter(
        it => it.ordinal > 0 && it._id !== undefined)));

  const reorderMutation = useReorderMenuMutation();

  const isBusy = reorderMutation.isPending || saving;

  return (
    <DragDropProvider
      onDragEnd={async (event) => {
        if (isBusy) return;

        if (event.operation?.target?.id) {
          const { source } = event.operation;
          const { initialIndex, index } = source as unknown as { initialIndex: number, index: number };

          if (initialIndex !== index) {
            setLocalMenus((prev) => {
              const newMenus = [...prev];
              const [moved] = newMenus.splice(initialIndex, 1);
              newMenus.splice(index, 0, moved);
              return newMenus;
            });

            const movedMenu = localMenus[initialIndex];
            if (movedMenu._id) {
              reorderMutation.mutate({
                _id: movedMenu._id,
                ordinal: index + 1,
              });
            }
          }
        }
      }}
    >
      <ul className="w-full flex align-middle">
        {localMenus.map((it: Menu, index) => (
          <Sortable key={it._id} menu={it} index={index} disabled={isBusy} />
        ))}
      </ul>
    </DragDropProvider>
  );
}