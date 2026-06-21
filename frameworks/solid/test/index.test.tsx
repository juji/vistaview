import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from 'solid-js/web'
import { isServer } from 'solid-js/web'
import { useVistaView } from '../src/use-vistaview'

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
  const dispose = render(() => {
    api = useVistaView(options as any)
    return <div />
  }, document.createElement('div'))
  return { api: api!, dispose }
}

describe('environment', () => {
  it('runs on client', () => {
    expect(typeof window).toBe('object')
    expect(isServer).toBe(false)
  })
})

describe('useVistaView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the full VistaInterface shape', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
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
    const { api } = createWrapper({ elements: '#gallery a' })
    api.open(1)
    expect(mockInstance.open).toHaveBeenCalledWith(1)
  })

  it('delegates close to the core instance', async () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    await api.close()
    expect(mockInstance.close).toHaveBeenCalled()
  })

  it('delegates reset to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    api.reset()
    expect(mockInstance.reset).toHaveBeenCalled()
  })

  it('delegates next to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    api.next()
    expect(mockInstance.next).toHaveBeenCalled()
  })

  it('delegates prev to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    api.prev()
    expect(mockInstance.prev).toHaveBeenCalled()
  })

  it('delegates zoomIn to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    api.zoomIn()
    expect(mockInstance.zoomIn).toHaveBeenCalled()
  })

  it('delegates zoomOut to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    api.zoomOut()
    expect(mockInstance.zoomOut).toHaveBeenCalled()
  })

  it('delegates getCurrentIndex to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    expect(api.getCurrentIndex()).toBe(-1)
    expect(mockInstance.getCurrentIndex).toHaveBeenCalled()
  })

  it('delegates view to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    api.view(2)
    expect(mockInstance.view).toHaveBeenCalledWith(2)
  })

  it('delegates destroy to the core instance', () => {
    const { api } = createWrapper({ elements: '#gallery a' })
    api.destroy()
    expect(mockInstance.destroy).toHaveBeenCalled()
  })

  it('calls destroy on cleanup', () => {
    const { dispose } = createWrapper({ elements: '#gallery a' })
    dispose()
    expect(mockInstance.destroy).toHaveBeenCalledTimes(1)
  })
})
