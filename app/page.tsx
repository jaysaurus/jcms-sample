"use client";
// temporary
import { useCreatePageMetaMutation, usePageMetasQuery } from '@/hooks/metaHooks';
import DynamicMetaGrid from '@/components/_base/DynamicMetaGrid/DynamicMetaGrid';
import { useAtom, useAtomValue } from 'jotai';
import { isAdminAtom, isVisitorAtom } from '@/hooks/authoriseHooks';
import { Button } from 'primereact/button';

export default function Home() {
  const { data: page } = usePageMetasQuery({ slug: 'index' })
  const isAdmin = useAtomValue(isAdminAtom)

  const createMeta = useCreatePageMetaMutation()
  return (
    <div>
      {
        page?.length
          ? (page!
            .sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0))
            .map(meta => {
              return <DynamicMetaGrid
                key={meta._id}
                isVisitor={false}
                {...{ meta, isAdmin }}
              />
            }
            ))
          : <></>
      }
      {isAdmin
        ? <div className="w-full flex justify-end">
          <Button
            className="bg-primary text-white rounded p-2 right-5"
            onClick={() => createMeta.mutate({ ordinal: page?.length || 0, slug: 'index' })}
          >
            Add new row
          </Button>
        </div>
        : <></>
      }

    </div>
  )
}
