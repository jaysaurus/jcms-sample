import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

global.ResizeObserver = class {
  observe    = vi.fn()
  unobserve  = vi.fn()
  disconnect = vi.fn()
}
