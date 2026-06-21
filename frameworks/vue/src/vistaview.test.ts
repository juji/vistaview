import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VistaView from './vistaview.vue'

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
    const wrapper = mount(VistaView, {
      props: { id: 'test-gallery' },
      slots: {
        default: '<a href="p1.jpg"><img src="t1.jpg" alt="1" /></a>',
      },
      attrs: { class: 'gallery' },
    })
    const div = wrapper.find('#test-gallery')
    expect(div.exists()).toBe(true)
    expect(div.classes()).toContain('gallery')
    expect(div.findAll('a').length).toBe(1)
  })

  it('calls vistaView on mount with elements selector', () => {
    mount(VistaView, {
      props: { id: 'test-gallery' },
      slots: { default: '<a href="p1.jpg">link</a>' },
    })
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
    })
  })

  it('passes options to vistaView', () => {
    mount(VistaView, {
      props: {
        id: 'test-gallery',
        options: { transition: 'fade' },
      },
      slots: { default: '<a href="p1.jpg">link</a>' },
    })
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > a',
      transition: 'fade',
    })
  })

  it('uses custom selector', () => {
    mount(VistaView, {
      props: { id: 'test-gallery', selector: '> img' },
      slots: { default: '<img src="p1.jpg" />' },
    })
    expect(mockVistaView).toHaveBeenCalledWith({
      elements: '#test-gallery > img',
    })
  })

  it('calls destroy on unmount', () => {
    const wrapper = mount(VistaView, {
      props: { id: 'test-gallery' },
      slots: { default: '<a href="p1.jpg">link</a>' },
    })
    wrapper.unmount()
    expect(mockInstance.destroy).toHaveBeenCalledTimes(1)
  })

  it('exposes vistaView and container via component ref', () => {
    const wrapper = mount(VistaView, {
      props: { id: 'test-gallery' },
      slots: { default: '<a href="p1.jpg">link</a>' },
    })
    // @vue/test-utils exposes stub refs via component.vm.[exposed property]
    const exposed = (wrapper as any).vm
    expect(exposed.vistaView).toBeDefined()
    expect(typeof exposed.vistaView.open).toBe('function')
    expect(exposed.container).toBeDefined()
  })
})
