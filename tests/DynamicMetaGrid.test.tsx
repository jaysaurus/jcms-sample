import { render, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DynamicMetaGrid from '@/components/_base/DynamicMetaGrid/DynamicMetaGrid'
import { DMGType, PageComponentType } from '@/components/_base/DynamicMetaGrid/DMG'
import type { MetaRef } from '@/components/_base/DynamicMetaGrid/DMG_DesktopDeviceManager/DMG_DesktopDeviceManager'
import { META_ID, COL_A, COL_B, COL_C, COMP_1, COMP_2, COMP_3 } from './fixtures'

/** Three columns with distinct spans (3-5-4) and one component each */
const baseMeta: DMGType = {
  _id: META_ID,
  twelvePtColSpan: '3-5-4' as any,
  columns: [
    {
      id: COL_A,
      ordinal: 0,
      hideOnMd: false,
      hideOnLgAndUp: false,
      components: [{ id: COMP_1, ordinal: 0, type: PageComponentType.Card }],
    },
    {
      id: COL_B,
      ordinal: 1,
      hideOnMd: false,
      hideOnLgAndUp: false,
      components: [{ id: COMP_2, ordinal: 0, type: PageComponentType.Default }],
    },
    {
      id: COL_C,
      ordinal: 2,
      hideOnMd: false,
      hideOnLgAndUp: false,
      components: [{ id: COMP_3, ordinal: 0, type: PageComponentType.Card }],
    },
  ],
  rowsSM: [],
}

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockReorderColumn = vi.fn().mockResolvedValue({})
const mockReorderComponent = vi.fn().mockResolvedValue({})

vi.mock('@/hooks/metaHooks', () => ({
  useReorderFieldMetaMutation: () => ({ mutateAsync: mockReorderColumn }),
}))

vi.mock('@/hooks/componentHooks', () => ({
  useReorderComponentMutation: () => ({ mutateAsync: mockReorderComponent }),
}))

// Capture the onSorted callback so tests can trigger drag-end events.
let capturedOnSorted: ((m: MetaRef) => void) | null = null
let lastSortableProps: Record<string, any> = {}

vi.mock('@/components/_base/DynamicMetaGrid/DMG_DesktopDeviceManager/DMG_DesktopDeviceManager', () => ({
  default: vi.fn((props: any) => {
    capturedOnSorted = props.onSorted
    lastSortableProps = props
    return null
  }),
}))

vi.mock('@/components/_base/DynamicMetaGrid/DMG_SmallDeviceManager/DMG_SmallDeviceManager', () => ({
  default: () => null,
}))

vi.mock('@/components/_base/DynamicMetaGrid/DMG_ConditionalDragDropProvider', () => ({
  default: ({ children }: any) => <>{children}</>,
}))

// Always render the desktop (gte) branch; skip the small-device (lt) branch.
vi.mock('@/components/_base/MediaQuery', () => ({
  default: ({ children, query }: any) => (query.gte ? <>{children}</> : null),
}))

vi.mock('@/components/_base/IconButton', () => ({ default: () => null }))

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function renderAndInit(meta: DMGType = baseMeta) {
  const result = render(<DynamicMetaGrid meta={meta} isAdmin={true} />)
  // Flush the meta useEffect (cloneDeep + setState)
  await act(async () => { })
  return result
}

async function triggerSort(metaRef: MetaRef) {
  await act(async () => {
    capturedOnSorted!(metaRef)
  })
  // Drain microtasks from mutateAsync().then(...)
  await act(async () => { })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DynamicMetaGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedOnSorted = null
    lastSortableProps = {}
  })

  it('renders the sortable wrapper after meta initializes', async () => {
    await renderAndInit()
    // The mock captured onSorted, which means DMG_DesktopDeviceManager was rendered.
    expect(capturedOnSorted).toBeDefined()
    expect(typeof capturedOnSorted).toBe('function')
  })

  it('passes the initial twelvePtColSpan down to the sortable wrapper', async () => {
    await renderAndInit()
    expect(lastSortableProps.twelvePtColSpan).toBe('3-5-4')
  })

  describe('column reorder', () => {
    it('recalculates spans correctly when a column moves forward (left → right)', async () => {
      // Col A (span 3, ordinal 0) moves to position 2.
      // Expected new span order: B(5) A(3) → wait, C moves left: B(5) C(4) A(3) → "5-4-3"
      await renderAndInit()

      await triggerSort({
        componentId: COL_A,
        refs: [
          [COMP_2],  // position 0 — col B's components (moved left)
          [COMP_3],  // position 1 — col C's components (moved left)
          [COMP_1],  // position 2 — col A's components (dropped here)
        ],
      })

      expect(lastSortableProps.twelvePtColSpan).toBe('5-4-3')
    })

    it('recalculates spans correctly when a column moves backward (right → left)', async () => {
      // Col C (span 4, ordinal 2) moves to position 0.
      // Expected: C(4) A(3) B(5) → "4-3-5"
      await renderAndInit()

      await triggerSort({
        componentId: COL_C,
        refs: [
          [COMP_3],  // position 0 — col C dropped here
          [COMP_1],  // position 1 — col A shifted right
          [COMP_2],  // position 2 — col B shifted right
        ],
      })

      expect(lastSortableProps.twelvePtColSpan).toBe('4-3-5')
    })

    it('calls reorderColumn mutation with the correct args', async () => {
      await renderAndInit()

      // Move col A (ordinal 0) to position 2
      await triggerSort({
        componentId: COL_A,
        refs: [[COMP_2], [COMP_3], [COMP_1]],
      })

      expect(mockReorderColumn).toHaveBeenCalledWith({
        _id: META_ID,
        colId: COL_A,
        ordinal: 2,
      })
    })
  })

  describe('component move', () => {
    it('reassigns components to the correct columns', async () => {
      // Move COMP_1 (from col A) into col B, after COMP_2.
      // DOM after drag: col A=[], col B=[COMP_2,COMP_1], col C=[COMP_3]
      await renderAndInit()

      await triggerSort({
        componentId: COMP_1,
        refs: [
          [],              // col A now empty
          [COMP_2, COMP_1],
          [COMP_3],
        ],
      })

      // COMP_1 ended up in column B (ordinal 1 → newIndex 1 in refs).
      expect(mockReorderComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: META_ID,
          colId: COL_B,
          componentId: COMP_1,
          ordinal: 1,
        }),
      )
    })

    it('collapses an emptied column and merges its span into the adjacent column', async () => {
      // Moving COMP_1 out of col A empties it.
      // Col A had span 3 (index 0) → merges rightward into col B (span 5) → "8-4"
      await renderAndInit()

      await triggerSort({
        componentId: COMP_1,
        refs: [[], [COMP_2, COMP_1], [COMP_3]],
      })

      expect(lastSortableProps.twelvePtColSpan).toBe('8-4')
    })

    it('merges the span of an emptied last column into the preceding column', async () => {
      // Move COMP_3 out of col C (last column, span 4) into col B.
      // col C is last → merges leftward into col B (span 5) → "3-9"
      await renderAndInit()

      await triggerSort({
        componentId: COMP_3,
        refs: [[COMP_1], [COMP_2, COMP_3], []],
      })

      expect(lastSortableProps.twelvePtColSpan).toBe('3-9')
    })

    it('calls reorderComponent mutation with the correct target column and ordinal', async () => {
      // Move COMP_2 to the front of col A
      await renderAndInit()

      await triggerSort({
        componentId: COMP_2,
        refs: [[COMP_2, COMP_1], [], [COMP_3]],
      })

      expect(mockReorderComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: META_ID,
          colId: COL_A,
          componentId: COMP_2,
          ordinal: 0,
        }),
      )
    })
  })
})
