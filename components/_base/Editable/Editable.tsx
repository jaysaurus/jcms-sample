import { useAtomValue } from "jotai";
import { ForwardRefEditor } from "./ForwardRefEditor";
import '@mdxeditor/editor/style.css'
import { isAdminAtom } from "@/hooks/authoriseHooks";
import { useEffect, useRef, useState } from "react";
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { UpdateComponentMetaProps, useUpdateComponentMutation } from "@/hooks/componentHooks";
import debounce from "lodash/debounce";
import { UUID } from "crypto";
import { ComponentContainer, DMGTypeColumn, DMGTypeComponent, DMGTypeRowSM } from "../DynamicMetaGrid/DMG";
import { useGetCachedMetaByComponentId } from "@/hooks/metaHooks";
import ReactMarkdown from 'react-markdown';

export default function Editable({ component }: { component: DMGTypeComponent }) {

  const isAdmin = useAtomValue(isAdminAtom)
  let markdown = ''

  const markdownToHtml = (markdown: string) =>
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync(markdown)
      .toString()


  useEffect(() => {
    markdown = component.content || ''
  }, [component?.content])

  const updateComponent = useUpdateComponentMutation()
  const { getCachedMetaByComponentId } = useGetCachedMetaByComponentId()
  const debounceMutate = useRef(
    debounce((patch) => {
      let meta = getCachedMetaByComponentId(component.id!)
      if (meta) {
        const col = meta.columns.find((col: DMGTypeColumn) => col.components.find(comp => comp.id === component.id))
        updateComponent.mutate({ _id: meta._id, colId: col!.id, componentId: component.id!, patch })
      } else {
        meta = getCachedMetaByComponentId(component.id!, ComponentContainer.Row)
        if (meta) {
          const row = meta.rowsSM.find((row: DMGTypeRowSM) => row.components.find(comp => comp.id === component.id))
          updateComponent.mutate({ _id: meta._id, rowId: row!.id, componentId: component.id!, patch })
        }
      }
    }, 1000)).current

  const handleUpdate = (content: string) => {
    debounceMutate({ content })
  }

  const handleClassUpdate = (className: string) => {
    debounceMutate({ className })
  }

  const [showEditor, setShowEditor] = useState(false)

  return (<div
    className="w-full h-full"
    onMouseEnter={() => setShowEditor(true)}
    onMouseLeave={() => setShowEditor(false)}
  >
    {
      isAdmin && showEditor
        ? <ForwardRefEditor
          className="-mt-12 -ml-3"
          component={component}
          markdown={component.content || ''}
          onChange={handleUpdate}
          onSetClass={handleClassUpdate}
        />
        : <ReactMarkdown>{component.content || ''}</ReactMarkdown>
    }
  </div>)
}