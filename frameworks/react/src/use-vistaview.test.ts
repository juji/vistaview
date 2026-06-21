import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
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

describe('useVistaView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the full VistaInterface shape', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    expect(result.current).toHaveProperty('open')
    expect(result.current).toHaveProperty('close')
    expect(result.current).toHaveProperty('reset')
    expect(result.current).toHaveProperty('next')
    expect(result.current).toHaveProperty('prev')
    expect(result.current).toHaveProperty('zoomIn')
    expect(result.current).toHaveProperty('zoomOut')
    expect(result.current).toHaveProperty('getCurrentIndex')
    expect(result.current).toHaveProperty('view')
    expect(result.current).toHaveProperty('destroy')
  })

  it('passes options to vistaView', () => {
    const options = { elements: '#gallery a' }
    renderHook(() => useVistaView(options))
    expect(mockVistaView).toHaveBeenCalledWith(options)
  })

  it('delegates open to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.open(1) })
    expect(mockInstance.open).toHaveBeenCalledWith(1)
  })

  it('delegates close to the core instance', async () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    await act(async () => { await result.current.close() })
    expect(mockInstance.close).toHaveBeenCalled()
  })

  it('delegates reset to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.reset() })
    expect(mockInstance.reset).toHaveBeenCalled()
  })

  it('delegates next to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.next() })
    expect(mockInstance.next).toHaveBeenCalled()
  })

  it('delegates prev to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.prev() })
    expect(mockInstance.prev).toHaveBeenCalled()
  })

  it('delegates zoomIn to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.zoomIn() })
    expect(mockInstance.zoomIn).toHaveBeenCalled()
  })

  it('delegates zoomOut to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.zoomOut() })
    expect(mockInstance.zoomOut).toHaveBeenCalled()
  })

  it('delegates getCurrentIndex to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    expect(result.current.getCurrentIndex()).toBe(-1)
    expect(mockInstance.getCurrentIndex).toHaveBeenCalled()
  })

  it('delegates view to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.view(2) })
    expect(mockInstance.view).toHaveBeenCalledWith(2)
  })

  it('delegates destroy to the core instance', () => {
    const { result } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    act(() => { result.current.destroy() })
    expect(mockInstance.destroy).toHaveBeenCalled()
  })

  it('calls destroy on unmount', () => {
    const { unmount } = renderHook(() => useVistaView({ elements: '#gallery a' }))
    unmount()
    expect(mockInstance.destroy).toHaveBeenCalledTimes(1)
  })
})
