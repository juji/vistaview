import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useVistaView } from './use-vistaview'

const { mockVistaView, mockInstance } = vi.hoisted(() => {
  const mockInstance = {
    open: vi.fn(),
    close: vi.fn(() => Promise.resolve()),
    reset: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    getCurrentIndex: vi.fn(() => -1),
    view: vi.fn(),
    destroy: vi.fn(),
  }
  return {
    mockVistaView: vi.fn(() => mockInstance),
    mockInstance,
  }
})

vi.mock('vistaview', () => ({
  vistaView: mockVistaView,
}))

function createWrapper(options: Record<string, unknown> = {}) {
  let api: ReturnType<typeof useVistaView>
  const wrapper = mount(defineComponent({
    setup() {
      api = useVistaView(options as any)
      return () => null
    },
  }))
  return { wrapper, getApi: () => api! }
}

describe('useVistaView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the full VistaInterface shape', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    const api = getApi()
    expect(api).toHaveProperty('open')
    expect(api).toHaveProperty('close')
    expect(api).toHaveProperty('reset')
    expect(api).toHaveProperty('next')
    expect(api).toHaveProperty('prev')
    expect(api).toHaveProperty('zoomIn')
    expect(api).toHaveProperty('zoomOut')
    expect(api).toHaveProperty('getCurrentIndex')
    expect(api).toHaveProperty('view')
    expect(api).toHaveProperty('destroy')
  })

  it('passes options to vistaView on mount', () => {
    createWrapper({ elements: '#gallery a' })
    expect(mockVistaView).toHaveBeenCalledWith({ elements: '#gallery a' })
  })

  it('delegates open to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().open(2)
    expect(mockInstance.open).toHaveBeenCalledWith(2)
  })

  it('delegates close to the core instance', async () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    await getApi().close()
    expect(mockInstance.close).toHaveBeenCalled()
  })

  it('delegates reset to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().reset()
    expect(mockInstance.reset).toHaveBeenCalled()
  })

  it('delegates next to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().next()
    expect(mockInstance.next).toHaveBeenCalled()
  })

  it('delegates prev to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().prev()
    expect(mockInstance.prev).toHaveBeenCalled()
  })

  it('delegates zoomIn to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().zoomIn()
    expect(mockInstance.zoomIn).toHaveBeenCalled()
  })

  it('delegates zoomOut to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().zoomOut()
    expect(mockInstance.zoomOut).toHaveBeenCalled()
  })

  it('delegates getCurrentIndex to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    expect(getApi().getCurrentIndex()).toBe(-1)
    expect(mockInstance.getCurrentIndex).toHaveBeenCalled()
  })

  it('delegates view to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().view(3)
    expect(mockInstance.view).toHaveBeenCalledWith(3)
  })

  it('delegates destroy to the core instance', () => {
    const { getApi } = createWrapper({ elements: '#gallery a' })
    getApi().destroy()
    expect(mockInstance.destroy).toHaveBeenCalled()
  })

  it('calls destroy on unmount', () => {
    const { wrapper } = createWrapper({ elements: '#gallery a' })
    wrapper.unmount()
    expect(mockInstance.destroy).toHaveBeenCalledTimes(1)
  })
})
