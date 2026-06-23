import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import DMG_SmallDeviceManager from '@/components/_base/DynamicMetaGrid/DMG_SmallDeviceManager/DMG_SmallDeviceManager'
import { DMGType, PageComponentType } from '@/components/_base/DynamicMetaGrid/DMG'
import type { MetaRefSM } from '@/components/_base/DynamicMetaGrid/DMG_SmallDeviceManager/DMG_SDM_RowManager/DMG_SDM_RowManager'
import { META_ID, ROW_A, ROW_B, COMP_1, COMP_2, COMP_3 } from './fixtures'

/**
 * Two rows:
 *  ROW_A  ordinal=0  sixPtColSpan="2-4"  components=[COMP_1(0), COMP_2(1)]
 *  ROW_B  ordinal=1  sixPtColSpan="6"    components=[COMP_3(0)]
 */
const baseMeta: DMGType = {
  _id: META_ID,
  twelvePtColSpan: '12' as any,
  columns: [],
  rowsSM: [
    {
      id: ROW_A,
      ordinal: 0,
      sixPtColSpan: '2-4' as any,
      components: [
        { id: COMP_1, ordinal: 0, type: PageComponentType.Card },
        { id: COMP_2, ordinal: 1, type: PageComponentType.Default },
      ],
    },
    {
      id: ROW_B,
      ordinal: 1,
      sixPtColSpan: '6' as any,
      components: [
        { id: COMP_3, ordinal: 0, type: PageComponentType.Card },
      ],
    },
  ],
}

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockReorderRow = vi.fn().mockResolvedValue({})
const mockReorderComponent = vi.fn()
const mockUpdatePageMeta = vi.fn()

vi.mock('@/hooks/metaHooks', () => ({
  useReorderFieldMetaMutation: () => ({ mutateAsync: mockReorderRow }),
  useUpdatePageMetaMutation: () => ({ mutate: mockUpdatePageMeta }),
}))

vi.mock('@/hooks/componentHooks', () => ({
  useReorderComponentMutation: () => ({ mutate: mockReorderComponent }),
}))

// Capture dnd-kit drag event handlers so tests can fire them directly.
let capturedOnDragMove: ((e: any) => void) | null = null
let capturedOnDragEnd: ((e: any, m: any) => void) | null = null

vi.mock('@dnd-kit/react', () => ({
  useDragDropMonitor: ({ onDragMove, onDragEnd }: any) => {
    capturedOnDragMove = onDragMove
    capturedOnDragEnd = onDragEnd
  },
}))

// Capture the onSorted callback to trigger within-row component reorder.
let capturedOnSorted: ((m: MetaRefSM) => void) | null = null

vi.mock(
  '@/components/_base/DynamicMetaGrid/DMG_SmallDeviceManager/DMG_SDM_RowManager/DMG_SDM_RowManager',
  () => ({
    default: vi.fn(({ onSorted }: any) => {
      capturedOnSorted = onSorted
      return null
    }),
  }),
)

vi.mock('@/components/_base/ConditionalComponent', () => ({
  default: ({ condition, children }: any) => (condition ? <>{children}</> : null),
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultProps = {
  dragMode: true,
  setDragMode: vi.fn(),
  setMeta: vi.fn(),
  enableOverlay: false,
  setEnableOverlay: vi.fn(),
}

async function renderComponent(meta: DMGType = baseMeta) {
  const result = render(
    <DMG_SmallDeviceManager {...defaultProps} meta={meta} />,
  )
  await act(async () => { })
  return result
}

async function triggerSort(metaRef: MetaRefSM) {
  await act(async () => { capturedOnSorted!(metaRef) })
  await act(async () => { })
}

/**
 * Sets up the DOM list that the component's onDragEnd queries:
 *   ul#META_ID_SM > li#ROW_ID > ul > li#COMP_ID
 */
function buildDOMStructure(
  rowOrder: string[],
  compOrder: Record<string, string[]> = {},
) {
  const ul = document.createElement('ul')
  ul.id = `${META_ID}_SM`

  rowOrder.forEach(rowId => {
    const li = document.createElement('li')
    li.id = rowId

    const compUl = document.createElement('ul')
      ; (compOrder[rowId] ?? []).forEach(compId => {
        const compLi = document.createElement('li')
        compLi.id = compId
        compUl.appendChild(compLi)
      })
    li.appendChild(compUl)
    ul.appendChild(li)
  })

  document.body.appendChild(ul)
  return () => document.body.removeChild(ul)
}

async function fireDragEnd(srcId: string) {
  capturedOnDragMove!({ operation: { source: { id: srcId } } })
  await act(async () => { capturedOnDragEnd!({}, {}) })
  // Row reorder calls reorderRow.mutateAsync inside a setTimeout(250).
  await act(async () => { vi.advanceTimersByTime(250) })
  await act(async () => { })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DMG_SmallDeviceManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    capturedOnSorted = null
    capturedOnDragMove = null
    capturedOnDragEnd = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a ul with the correct SM id', async () => {
    const { container } = await renderComponent()
    expect(container.querySelector(`ul#${META_ID}_SM`)).not.toBeNull()
  })

  it('renders one DMG_SDM_RowManager per row and exposes onSorted', async () => {
    await renderComponent()
    expect(capturedOnSorted).toBeTypeOf('function')
  })

  describe('within-row component reorder (via onSorted)', () => {
    it('calls reorderComponents.mutate with the component\'s new ordinal', async () => {
      await renderComponent()

      // COMP_1 moves from ordinal 0 to ordinal 1 within ROW_A
      await triggerSort({ componentId: COMP_1, refs: [COMP_2, COMP_1] })

      expect(mockReorderComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: META_ID,
          rowId: ROW_A,
          componentId: COMP_1,
          ordinal: 1,
        }),
      )
    })

    it('calls reorderComponents.mutate with ordinal 0 when component moves to the front', async () => {
      await renderComponent()

      // COMP_2 moves from ordinal 1 to ordinal 0 within ROW_A
      await triggerSort({ componentId: COMP_2, refs: [COMP_2, COMP_1] })

      expect(mockReorderComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: META_ID,
          rowId: ROW_A,
          componentId: COMP_2,
          ordinal: 0,
        }),
      )
    })

    it('does not call reorderComponents.mutate when the component id is not found in refs', async () => {
      await renderComponent()

      // componentId not present in refs — newIndex will be -1
      await triggerSort({ componentId: COMP_1, refs: [COMP_2] })

      expect(mockReorderComponent).not.toHaveBeenCalled()
    })
  })

  describe('row reorder (via onDragEnd)', () => {
    it('updates row ordinals and calls setMeta when a row is dragged to a new position', async () => {
      const setMeta = vi.fn()
      render(<DMG_SmallDeviceManager {...defaultProps} setMeta={setMeta} meta={baseMeta} />)
      await act(async () => { })

      // ROW_A (ordinal 0) moves to ordinal 1; ROW_B shifts to ordinal 0
      const cleanup = buildDOMStructure([ROW_B, ROW_A])
      try {
        await fireDragEnd(ROW_A as string)

        expect(setMeta).toHaveBeenCalledOnce()
        const updatedMeta: DMGType = setMeta.mock.calls[0][0]
        const rowA = updatedMeta.rowsSM.find(r => r.id === ROW_A)!
        const rowB = updatedMeta.rowsSM.find(r => r.id === ROW_B)!
        expect(rowA.ordinal).toBe(1)
        expect(rowB.ordinal).toBe(0)
      } finally {
        cleanup()
      }
    })

    it('calls reorderRow.mutateAsync with the new ordinal', async () => {
      await renderComponent()

      const cleanup = buildDOMStructure([ROW_B, ROW_A])
      try {
        await fireDragEnd(ROW_A as string)

        expect(mockReorderRow).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: META_ID,
            rowId: ROW_A,
            ordinal: 1,
          }),
        )
      } finally {
        cleanup()
      }
    })

    it('does not call setMeta when a row is dropped at its original position', async () => {
      const setMeta = vi.fn()
      render(<DMG_SmallDeviceManager {...defaultProps} setMeta={setMeta} meta={baseMeta} />)
      await act(async () => { })

      // DOM order unchanged — ROW_A still at index 0
      const cleanup = buildDOMStructure([ROW_A, ROW_B])
      try {
        await fireDragEnd(ROW_A as string)
        expect(setMeta).not.toHaveBeenCalled()
      } finally {
        cleanup()
      }
    })
  })

  describe('component reorder via drag (onDragEnd with component id)', () => {
    it('recalculates sixPtColSpan to match the new component order and calls setMeta', async () => {
      // ROW_A: spans="2-4", drag COMP_1 to position 1 (swap with COMP_2) → new span "4-2"
      const setMeta = vi.fn()
      render(<DMG_SmallDeviceManager {...defaultProps} setMeta={setMeta} meta={baseMeta} />)
      await act(async () => { })

      const cleanup = buildDOMStructure(
        [ROW_A, ROW_B],
        { [ROW_A]: [COMP_2, COMP_1] },
      )
      try {
        await fireDragEnd(COMP_1 as string)

        expect(setMeta).toHaveBeenCalledOnce()
        const updatedMeta: DMGType = setMeta.mock.calls[0][0]
        const updatedRow = updatedMeta.rowsSM.find(r => r.id === ROW_A)!
        expect(updatedRow.sixPtColSpan).toBe('4-2')
      } finally {
        cleanup()
      }
    })

    it('calls updatePageMeta.mutate with the updated rowsSM', async () => {
      await renderComponent()

      const cleanup = buildDOMStructure(
        [ROW_A, ROW_B],
        { [ROW_A]: [COMP_2, COMP_1] },
      )
      try {
        await fireDragEnd(COMP_1 as string)

        expect(mockUpdatePageMeta).toHaveBeenCalledWith(
          expect.objectContaining({ _id: META_ID }),
        )
      } finally {
        cleanup()
      }
    })

    it('calls reorderComponent.mutate with the correct row, component, and ordinal', async () => {
      await renderComponent()

      const cleanup = buildDOMStructure(
        [ROW_A, ROW_B],
        { [ROW_A]: [COMP_2, COMP_1] },
      )
      try {
        await fireDragEnd(COMP_1 as string)

        expect(mockReorderComponent).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: META_ID,
            rowId: ROW_A,
            componentId: COMP_1,
            ordinal: 1,
          }),
        )
      } finally {
        cleanup()
      }
    })
  })
})
