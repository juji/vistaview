import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/react'
import { VistaView } from './vistaview'

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

function renderGallery(extraProps: Record<string, unknown> = {}) {
  return render(
    <VistaView id="test-gallery" {...extraProps}>
      <a href="photo1.jpg"><img src="thumb1.jpg" alt="Photo 1" /></a>
      <a href="photo2.jpg"><img src="thumb2.jpg" alt="Photo 2" /></a>
    </VistaView>
  )
}

describe('VistaView component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children inside a div with gallery id', () => {
    renderGallery()
    const gallery = document.getElementById('test-gallery')
    expect(gallery).toBeInTheDocument()
    expect(gallery?.querySelectorAll('a').length).toBe(2)
  })

  it('calls vistaView on mount with elements selector', () => {
    renderGallery()
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
    })
  })

  it('passes options to vistaView', () => {
    renderGallery({ options: { closeOnBackdrop: false } })
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
      closeOnBackdrop: false,
    })
  })

  it('uses custom selector', () => {
    render(
      <VistaView id="test-gallery" selector="> img">
        <img src="photo1.jpg" alt="Photo 1" />
      </VistaView>
    )
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > img',
    })
  })

  it('calls reset on mount and again when children change', () => {
    const { rerender } = renderGallery()
    // reset is called once on mount (children effect runs after mount)
    expect(mockInstance.reset).toHaveBeenCalledTimes(1)

    rerender(
      <VistaView id="test-gallery">
        <a href="photo3.jpg"><img src="thumb3.jpg" alt="Photo 3" /></a>
      </VistaView>
    )
    expect(mockInstance.reset).toHaveBeenCalledTimes(2)
  })

  it('calls destroy on unmount', () => {
    const { unmount } = renderGallery()
    unmount()
    expect(mockInstance.destroy).toHaveBeenCalledTimes(1)
  })

  it('exposes ref with vistaView and container', () => {
    const ref = { current: null }
    render(
      <VistaView id="test-gallery" ref={ref}>
        <a href="photo1.jpg"><img src="thumb1.jpg" alt="Photo 1" /></a>
      </VistaView>
    )
    expect(ref.current).not.toBeNull()
    expect(ref.current).toHaveProperty('vistaView')
    expect(ref.current).toHaveProperty('container')
  })
})
