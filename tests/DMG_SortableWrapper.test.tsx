import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import DMG_DesktopDeviceManager from '@/components/_base/DynamicMetaGrid/DMG_DesktopDeviceManager/DMG_DesktopDeviceManager'
import { DMGType, PageComponentType } from '@/components/_base/DynamicMetaGrid/DMG'
import type { MetaRef } from '@/components/_base/DynamicMetaGrid/DMG_DesktopDeviceManager/DMG_DesktopDeviceManager'
import { META_ID, COL_A, COL_B, COL_C, COMP_1, COMP_2, COMP_3 } from './fixtures'
import type { UUID } from 'crypto'
import type { PartitionOf12 } from '@/app/__types/TwelvePtColSpan'

// ─── Fixtures ────────────────────────────────────────────────────────────────

/**
 * Three columns — spans "3-5-4", one component each.
 * COL_A ordinal=0, COL_B ordinal=1, COL_C ordinal=2
 */
const baseMeta: DMGType = {
  _id: META_ID,
  twelvePtColSpan: '3-5-4' as PartitionOf12,
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

const mockUpdatePageMeta = vi.fn()

vi.mock('@/hooks/metaHooks', () => ({
  useUpdatePageMetaMutation: () => ({ mutate: mockUpdatePageMeta }),
}))

// Capture drag handlers.
let capturedOnDragMove: ((e: any) => void) | null = null
let capturedOnDragEnd: ((e: any, m: any) => void) | null = null

vi.mock('@dnd-kit/react', () => ({
  useDragDropMonitor: ({ onDragMove, onDragEnd }: any) => {
    capturedOnDragMove = onDragMove
    capturedOnDragEnd = onDragEnd
  },
}))

vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: () => ({ ref: vi.fn(), handleRef: vi.fn() }),
  isSortableOperation: vi.fn(),
}))

vi.mock('@dnd-kit/collision', () => ({
  directionBiased: vi.fn(),
}))

vi.mock('@/components/_base/DynamicMetaGrid/DynamicMetaGrid', () => ({
  SWAP_COOLDOWN_MS: 0,
}))

// DMG_DDH_SortableComponents must render a <li> with the component's id so
// that onDragEnd's DOM query (`col.querySelectorAll('ul > li')`) can find them.
vi.mock(
  '@/components/_base/DynamicMetaGrid/DMG_DesktopDeviceManager/DMG_DDH_SortableComponents/DMG_DDH_SortableComponents',
  () => ({ default: ({ component }: any) => <li id={component.id} /> }),
)

// DMG_DDH_ColumnDragger: expose visible + activeIndex as data attrs so tests can assert on them.
vi.mock(
  '@/components/_base/DynamicMetaGrid/DMG_DesktopDeviceManager/DMG_DDH_ColumnDragger',
  () => ({
    default: vi.fn(({ visible, activeIndex }: any) => (
      <div data-testid={`col-dragger-${activeIndex}`} data-visible={String(visible)} />
    )),
  }),
)

vi.mock(
  '@/components/_base/DynamicMetaGrid/DMG_DesktopDeviceManager/DMG_DDH_ColumnSplitter',
  () => ({ default: () => null }),
)

vi.mock('@/components/_base/ConditionalComponent', () => ({
  default: ({ condition, children }: any) => (condition ? <>{children}</> : null),
}))

vi.mock('@/components/_base/IconButton', () => ({ default: () => null }))
vi.mock('@mdi/react', () => ({ default: () => null }))

vi.mock('@/libs/tailwindConstants/ColSpanClassConstant', () => ({
  COL_SPAN_CLASS: { 3: 'col-span-3', 4: 'col-span-4', 5: 'col-span-5' },
}))

vi.mock('@/libs/tailwindConstants/RowSpanClassConstant', () => ({
  ROW_SPAN_CLASS: {},
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultProps = {
  dragMode: true,
  meta: baseMeta,
  setMeta: vi.fn(),
  onSorted: vi.fn(),
  colSpans: [3, 5, 4],
  colOffsets: [0, 1, 2],
  enableOverlay: false,
  setEnableOverlay: vi.fn(),
  twelvePtColSpan: '3-5-4' as PartitionOf12,
  setTwelvePtColSpan: vi.fn(),
}

async function renderWrapper(props: Partial<typeof defaultProps> = {}) {
  const merged = { ...defaultProps, ...props }
  const result = render(<DMG_DesktopDeviceManager {...merged} />)
  await act(async () => { })
  return result
}

// Simulate a complete drag cycle: move sets srcId, end triggers the DOM query.
async function fireDragEnd(srcId: string) {
  capturedOnDragMove!({ operation: { source: { id: srcId } } })
  await act(async () => { capturedOnDragEnd!({}, {}) })
  await act(async () => { })
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DMG_DesktopDeviceManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    capturedOnDragMove = null
    capturedOnDragEnd = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('structure', () => {
    it('renders a <ul> with id equal to meta._id', async () => {
      const { container } = await renderWrapper()
      expect(container.querySelector(`ul#${META_ID}`)).not.toBeNull()
    })

    it('renders one <li> per column', async () => {
      const { container } = await renderWrapper()
      const lis = container.querySelectorAll(`ul#${META_ID} > li`)
      expect(lis).toHaveLength(3)
    })

    it('renders columns in ascending ordinal order', async () => {
      // Supply columns out of ordinal order to verify the sort.
      const shuffledMeta: DMGType = {
        ...baseMeta,
        columns: [baseMeta.columns[2], baseMeta.columns[0], baseMeta.columns[1]],
      }
      const { container } = await renderWrapper({ meta: shuffledMeta })

      const liIds = Array.from(
        container.querySelectorAll(`ul#${META_ID} > li`),
      ).map(el => el.id)

      expect(liIds).toEqual([COL_A, COL_B, COL_C])
    })

    it('renders each column <li> with the column id', async () => {
      const { container } = await renderWrapper()
      expect(container.querySelector(`li#${COL_A}`)).not.toBeNull()
      expect(container.querySelector(`li#${COL_B}`)).not.toBeNull()
      expect(container.querySelector(`li#${COL_C}`)).not.toBeNull()
    })
  })

  describe('onDragEnd → onSorted', () => {
    it('calls onSorted with the dragged componentId and DOM-read refs', async () => {
      const onSorted = vi.fn()
      await renderWrapper({ onSorted })

      await fireDragEnd(COMP_1 as string)

      expect(onSorted).toHaveBeenCalledOnce()
      const call: MetaRef = onSorted.mock.calls[0][0]
      expect(call.componentId).toBe(COMP_1)
      // refs[0] is COL_A's components, refs[1] is COL_B's, refs[2] is COL_C's
      expect(call.refs[0]).toContain(COMP_1)
      expect(call.refs[1]).toContain(COMP_2)
      expect(call.refs[2]).toContain(COMP_3)
    })

    it('does not call onSorted when onDragMove was never fired', async () => {
      const onSorted = vi.fn()
      await renderWrapper({ onSorted })

      // Fire onDragEnd directly without a preceding onDragMove — srcId stays null.
      await act(async () => { capturedOnDragEnd!({}, {}) })
      await act(async () => { })

      expect(onSorted).not.toHaveBeenCalled()
    })

    it('deduplicates refs so each component id appears only once per column', async () => {
      const onSorted = vi.fn()
      await renderWrapper({ onSorted })

      await fireDragEnd(COMP_1 as string)

      const { refs } = onSorted.mock.calls[0][0] as MetaRef
      refs.forEach(colRefs => {
        const unique = [...new Set(colRefs)]
        expect(colRefs).toHaveLength(unique.length)
      })
    })
  })

  describe('twelvePtColSpan sync effect', () => {
    it('calls updatePageMeta.mutate after 1000ms debounce when span differs from meta', async () => {
      // Render with a twelvePtColSpan that differs from meta.twelvePtColSpan.
      await renderWrapper({ twelvePtColSpan: '6-3-3' as PartitionOf12 })

      expect(mockUpdatePageMeta).not.toHaveBeenCalled()

      await act(async () => { vi.advanceTimersByTime(1000) })

      expect(mockUpdatePageMeta).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: META_ID,
          patch: { twelvePtColSpan: '6-3-3' },
        }),
      )
    })

    it('does not call updatePageMeta.mutate when span matches meta', async () => {
      // Both twelvePtColSpan and meta.twelvePtColSpan are '3-5-4'.
      await renderWrapper({ twelvePtColSpan: '3-5-4' as PartitionOf12 })

      await act(async () => { vi.advanceTimersByTime(1000) })

      expect(mockUpdatePageMeta).not.toHaveBeenCalled()
    })
  })

  describe('DMG_DDH_ColumnDragger visibility', () => {
    it('is visible for non-last columns when enableOverlay is true', async () => {
      const { getByTestId } = await renderWrapper({ enableOverlay: true })

      expect(getByTestId('col-dragger-0').dataset.visible).toBe('true')
      expect(getByTestId('col-dragger-1').dataset.visible).toBe('true')
    })

    it('is not visible for the last column regardless of enableOverlay', async () => {
      const { getByTestId } = await renderWrapper({ enableOverlay: true })

      expect(getByTestId('col-dragger-2').dataset.visible).toBe('false')
    })

    it('is not visible for any column when enableOverlay is false', async () => {
      const { getByTestId } = await renderWrapper({ enableOverlay: false })

      expect(getByTestId('col-dragger-0').dataset.visible).toBe('false')
      expect(getByTestId('col-dragger-1').dataset.visible).toBe('false')
    })
  })
})
