"use client";
// temporary
import { useCreatePageMetaMutation, usePageMetasQuery } from '@/hooks/metaHooks';
import DynamicMetaGrid from '@/components/_base/DynamicMetaGrid/DynamicMetaGrid';
import { useAtom, useAtomValue } from 'jotai';
import { authCheckedAtom, isAdminAtom, isVisitorAtom, useAuthorise } from '@/hooks/authoriseHooks';
import { Button } from 'primereact/button';
import { useEffect, useRef, useState } from 'react';
import DMG_Confirm from '@/components/_base/DynamicMetaGrid/DMG_Confirm';
import { Toast } from 'primereact/toast';
import Confirm from '@/components/_base/Confirm';
import TestVisitorDialog from '@/components/test/TestVisitorDialog';
import TestTimer from '@/components/test/TestTimer';
import { createPortal } from 'react-dom';
import ConditionalComponent from '@/components/_base/ConditionalComponent';

export default function Home() {
  useAuthorise()

  const { data: page } = usePageMetasQuery({ slug: 'test' })

  const isAdmin = useAtomValue(isAdminAtom)
  const [isVisitor, setIsVisitor] = useAtom(isVisitorAtom)
  const authChecked = useAtomValue(authCheckedAtom)

  const createMeta = useCreatePageMetaMutation()

  const [showVisitorMessage, setShowVisitorMessage] = useState(false)

  const [startTimer, setStartTimer] = useState(false)

  const handleVisitorOutcome = (outcome: boolean) => {
    if (outcome) {
      setIsVisitor(true)
    }
  }

  const reloadPage = () => {
    // cope with any minor difference between the server/local timer
    setTimeout(() => { window.location.reload() }, 1000)
  }
  useEffect(() => {
    setShowVisitorMessage(true)
  }, [])

  useEffect(() => {
    if (isVisitor) {
      setStartTimer(true)
    }
  }, [isVisitor])
  return (
    <>
      <ConditionalComponent condition={authChecked && startTimer}>
        <TestTimer
          onTimerUp={reloadPage}
          {...{ startTimer }}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={authChecked && !isVisitor && !isAdmin}>
        <TestVisitorDialog
          showDialog={showVisitorMessage}
          setShowDialog={setShowVisitorMessage}
          outcome={handleVisitorOutcome}
        />
      </ConditionalComponent>

      <div className="mt-5">

        {
          page?.length
            ? (page!
              .sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0))
              .map(meta => {
                return <DynamicMetaGrid
                  key={meta._id}
                  {...{ meta, isAdmin, isVisitor }}
                />
              }
              ))
            : <></>
        }
        {
          isAdmin
            ? <div className="mt-10 w-full flex justify-end">
              <Button
                className="bg-primary text-white rounded p-2 right-5"
                disabled={(page?.length || 0) > 2}
                onClick={() => createMeta.mutate({ ordinal: page?.length || 0, slug: 'test' })}
              >
                Add new row
              </Button>
            </div>
            : <></>
        }

      </div>
    </>

  )
}
