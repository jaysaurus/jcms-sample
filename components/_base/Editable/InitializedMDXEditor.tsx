'use client'
// InitializedMDXEditor.tsx
import type { ForwardedRef } from 'react'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles
} from '@mdxeditor/editor'
import IconButton from '../IconButton'
import { mdiDotsVertical } from '@mdi/js'
import IMDXE_CustomMenu from './IMDXE_CustomMenu'
import { DMGTypeComponent } from '../DynamicMetaGrid/DMG'
import { useUpdatePageMetaMutation } from '@/hooks/metaHooks'

export type InitializedMDXEditorProps = {
  onSetClass: (v: string) => void,
  component: DMGTypeComponent,
  editorRef: ForwardedRef<MDXEditorMethods> | null
} & MDXEditorProps

// Only import this to the next file
export default function InitializedMDXEditor({
  onSetClass,
  component,
  editorRef,
  ...props
}: InitializedMDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        // Example Plugin Usage
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: 'my-classname',
          toolbarContents: () => (
            <div
              className="flex rounded -mt-1 justify-between w-100"
              style={{
                backgroundColor: `color-mix(in srgb, var(--overlayBackground) 80%, transparent)`,
                backdropFilter: 'blur(.4rem)',
                WebkitBackdropFilter: 'blur(.5rem)',
                boxShadow: `0 .1rem .5rem .1rem color-mix(in srgb, var(--overlayBackground) 10%, transparent)`,
              }}
            >
              <div className="flex">
                <UndoRedo />
                <BoldItalicUnderlineToggles />
              </div>
              <IMDXE_CustomMenu
                {...{ onSetClass, component }} />
            </div>
          )
        })

      ]}
      {...props}
      ref={editorRef}
    />
  )
}
