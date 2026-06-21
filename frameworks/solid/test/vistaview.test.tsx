import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from 'solid-js/web'
import { VistaView } from '../src/vistaview'

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

describe('VistaView component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children inside a div with gallery id', () => {
    const dispose = render(() => (
      <VistaView id="test-gallery">
        <a href="p1.jpg"><img src="t1.jpg" alt="1" /></a>
        <a href="p2.jpg"><img src="t2.jpg" alt="2" /></a>
      </VistaView>
    ), document.body)
    const gallery = document.getElementById('test-gallery')
    expect(gallery).not.toBeNull()
    expect(gallery!.querySelectorAll('a').length).toBe(2)
    dispose()
  })

  it('calls vistaView on mount with elements selector', () => {
    const dispose = render(() => (
      <VistaView id="test-gallery">
        <a href="p1.jpg">link</a>
      </VistaView>
    ), document.body)
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
    })
    dispose()
  })

  it('passes options to vistaView', () => {
    const dispose = render(() => (
      <VistaView id="test-gallery" options={{ closeOnBackdrop: false }}>
        <a href="p1.jpg">link</a>
      </VistaView>
    ), document.body)
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
      closeOnBackdrop: false,
    })
    dispose()
  })

  it('uses custom selector', () => {
    const dispose = render(() => (
      <VistaView id="test-gallery" selector="> img">
        <img src="p1.jpg" />
      </VistaView>
    ), document.body)
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > img',
    })
    dispose()
  })

  it('calls destroy on cleanup', () => {
    const dispose = render(() => (
      <VistaView id="test-gallery">
        <a href="p1.jpg">link</a>
      </VistaView>
    ), document.body)
    dispose()
    expect(mockInstance.destroy).toHaveBeenCalledTimes(1)
  })

  it('calls componentRef callback with api and container', () => {
    const ref = vi.fn()
    const dispose = render(() => (
      <VistaView id="test-gallery" componentRef={ref}>
        <a href="p1.jpg">link</a>
      </VistaView>
    ), document.body)
    expect(ref).toHaveBeenCalledWith(
      expect.objectContaining({
        vistaView: expect.any(Object),
        container: expect.any(HTMLElement),
      })
    )
    dispose()
    expect(ref).toHaveBeenCalledWith(null)
  })
})
