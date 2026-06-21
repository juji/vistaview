import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/svelte'
import VistaViewHarness from './VistaViewHarness.svelte'

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

  it('renders children in a div with gallery id', () => {
    const { container } = render(VistaViewHarness, {
      props: { id: 'test-gallery' },
    })
    const div = container.querySelector('#test-gallery')
    expect(div).toBeTruthy()
    expect(div!.querySelectorAll('a').length).toBe(2)
  })

  it('calls vistaView on mount with elements selector', () => {
    render(VistaViewHarness, {
      props: { id: 'test-gallery' },
    })
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
    })
  })

  it('passes options to vistaView', () => {
    render(VistaViewHarness, {
      props: {
        id: 'test-gallery',
        options: { closeOnBackdrop: false },
      },
    })
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
      closeOnBackdrop: false,
    })
  })

  it('uses custom selector', () => {
    render(VistaViewHarness, {
      props: { id: 'test-gallery', selector: '> img' },
    })
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > img',
    })
  })

  it('calls destroy on unmount', () => {
    const { unmount } = render(VistaViewHarness, {
      props: { id: 'test-gallery' },
    })
    unmount()
    expect(mockInstance.destroy).toHaveBeenCalledTimes(1)
  })

  it('exposes vistaView and container via vistaRef', () => {
    let ref: any = null
    render(VistaViewHarness, {
      props: {
        id: 'test-gallery',
        vistaRef: (obj: any) => { ref = obj },
      },
    })
    expect(ref).not.toBeNull()
    expect(ref.vistaView).toBeDefined()
    expect(typeof ref.vistaView.open).toBe('function')
    expect(ref.container).toBeDefined()
    expect(ref.container!.querySelectorAll('a').length).toBe(2)
  })
})
