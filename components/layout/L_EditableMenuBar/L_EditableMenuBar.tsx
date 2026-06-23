import { useCreateMenuMutation, useMenusQuery, type Menu } from '@/hooks/menuHooks'

import { Menubar } from 'primereact/menubar'
import { isAdminAtom } from '@/hooks/authoriseHooks'
import { useEffect, useLayoutEffect } from 'react'
import { L_EMB_Item } from '@/components/layout/L_EditableMenuBar/L_EMB_Item/L_EMB_Item'
import { FabButton } from '@/components/_base/FabButton'
import { useAtom } from 'jotai'
import { dragAndDropModeAtom } from './L_EMB_ManagementComposable'
import { L_EMB_DragAndDrop } from './L_EMB_DragAndDrop/L_EMB_DragAndDrop'
import type { Ref } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import LoadingSpinner from '@/components/_base/LoadingSpinner'
import ConditionalComponent from '@/components/_base/ConditionalComponent'

export function L_EditableMenuBar({ ref }: { ref: Ref<HTMLDivElement> }) {
  const isMutating = useIsMutating();

  const { data: menus } = useMenusQuery()

  const [isAdmin] = useAtom(isAdminAtom)

  const formattedMenu =
    menus
      ?.sort((a, b) => a.ordinal - b.ordinal)
      ?.map((it, i) => ({
        ...it,
        template: (
          <L_EMB_Item
            id={it._id}
            ordinal={it.ordinal}
            href={it.href}
            editable={isAdmin && i > 0}
            icon={it.icon}
            label={it.label}
            ariaLabel={it.ariaLabel}
          />
        ),
      })) ?? []

  const createMenuItem = useCreateMenuMutation()

  const [dragAndDropMode, setDragAndDropMode] = useAtom(dragAndDropModeAtom)

  return (
    <>
      <LoadingSpinner
        loading={isMutating > 0}
        size={0.75}
        stagger={1000}
        label="saving"
        className="fixed text-primary z-90 right-3 bottom-3"
      />
      <div ref={ref} className="z-50 flex flex-col fixed py-2 bg-white border-b w-full">
        <div className="h-full flex align-start justify-between text-4xl mx-2 my-5">
          <ConditionalComponent condition={isAdmin}>
            <div className="text-sm">
              <form action="/api/auth/logout" method="post">
                <input
                  className="cursor-pointer text-primary hover:text-secondary"
                  type="submit"
                  value="Logout"
                />
              </form>
            </div>
          </ConditionalComponent>
        </div>
        <div className="flex">
          {!dragAndDropMode
            ? <Menubar className="w-full" model={formattedMenu} />
            : (menus
              ? <L_EMB_DragAndDrop menus={menus} />
              : <></>)}

          {isAdmin
            ? <div className="flex align-center mt-2">
              <div>
                <FabButton
                  icon="pi pi-arrow-right-arrow-left"
                  color={dragAndDropMode ? 'bg-primary hover:brightness-500 text-white' : undefined}
                  onClick={() => { setDragAndDropMode(!dragAndDropMode) }}
                />
              </div>
              <div className="mx-2">
                <FabButton
                  icon="pi pi-plus"
                  color={dragAndDropMode ? 'text-gray-400' : undefined}
                  disabled={dragAndDropMode}
                  onClick={() => { createMenuItem.mutate() }}
                />
              </div>
            </div>
            : <></>}
        </div>
      </div>
    </>
  )
}