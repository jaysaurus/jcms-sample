import { DragDropProvider } from "@dnd-kit/react"

export type DMG_ConditionalDragDropProviderProps = {
  children: React.ReactNode;
  condition: boolean;
}

export default function DMG_ConditionalDragDropProvider({
  children,
  condition,
}: DMG_ConditionalDragDropProviderProps) {
  if (condition) {
    return <DragDropProvider>
      {children}
    </DragDropProvider>
  } else {
    return <>{children}</>
  }
}
