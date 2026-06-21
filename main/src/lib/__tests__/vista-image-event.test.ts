import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VistaImageEvent } from '../vista-image-event'
import type { VistaView } from '../vista-view'

function makeView(overrides: Partial<any> = {}): VistaView {
  const state: any = {
    children: {
      images: [
        {
          pos: 0,
          isReady: true,
          state: {
            width: 800,
            height: 600,
            transform: { x: 0, y: 0, scale: 1 },
            translate: { x: 0, y: 0 },
          },
          setInitialCenter: vi.fn(),
          scaleMove: vi.fn(),
          setFinalTransform: vi.fn(() => ({ close: false, cancel: vi.fn() })),
          momentumThrow: vi.fn(() => vi.fn()),
          isThrowing: false,
          fullW: 800,
          minW: 400,
          setSizes: vi.fn(),
        },
      ],
    },
    zoomedIn: false,
    extensions: [],
    abortController: new AbortController(),
  }
  return {
    state,
    options: { keyboardListeners: true },
    prev: vi.fn(),
    next: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    close: vi.fn(),
    ...overrides,
  } as unknown as VistaView
}

describe('VistaImageEvent', () => {
  let container: HTMLElement
  let vvw: VistaView
  let iev: VistaImageEvent

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vvw = makeView()
    iev = new VistaImageEvent(vvw)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  describe('keyboard', () => {
    it('navigates left on ArrowLeft', () => {
      iev.start(container)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      expect(vvw.prev).toHaveBeenCalled()
      iev.stop()
    })

    it('navigates right on ArrowRight', () => {
      iev.start(container)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
      expect(vvw.next).toHaveBeenCalled()
      iev.stop()
    })

    it('zooms in on ArrowUp', () => {
      iev.start(container)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
      expect(vvw.zoomIn).toHaveBeenCalled()
      iev.stop()
    })

    it('zooms out on ArrowDown', () => {
      iev.start(container)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
      expect(vvw.zoomOut).toHaveBeenCalled()
      iev.stop()
    })

    it('closes on Escape', () => {
      iev.start(container)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(vvw.close).toHaveBeenCalled()
      iev.stop()
    })

    it('does not add keyboard listener when keyboardListeners is false', () => {
      vvw.options.keyboardListeners = false
      iev.start(container)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(vvw.close).not.toHaveBeenCalled()
      iev.stop()
    })
  })

  describe('scroll', () => {
    it('zooms in on scroll up', () => {
      iev.start(container)
      container.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -100, clientX: 200, clientY: 300 })
      )
      expect(vvw.zoomIn).toHaveBeenCalled()
      iev.stop()
    })

    it('zooms out on scroll down', () => {
      iev.start(container)
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))
      expect(vvw.zoomOut).toHaveBeenCalled()
      iev.stop()
    })
  })

  describe('resize', () => {
    it('calls setSizes on all images on resize', () => {
      iev.start(container)
      window.dispatchEvent(new Event('resize'))
      expect(vvw.state.children.images[0].setSizes).toHaveBeenCalled()
      iev.stop()
    })
  })

  describe('start/stop', () => {
    it('stop removes keyboard listener', () => {
      iev.start(container)
      iev.stop()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(vvw.close).not.toHaveBeenCalled()
    })
  })

  describe('pointer events', () => {
    function pointer(type: string, overrides: Partial<PointerEventInit> = {}) {
      return new PointerEvent(type, {
        pointerId: 1,
        clientX: 100,
        clientY: 200,
        button: 0,
        bubbles: true,
        ...overrides,
      })
    }

    it('sets initial center on pointer down when zoomed in', () => {
      vvw.state.zoomedIn = true
      iev.start(container)
      container.dispatchEvent(pointer('pointerdown'))
      const img = vvw.state.children.images[0]
      expect(img.setInitialCenter).toHaveBeenCalled()
      iev.stop()
    })

    it('detects pinch on two-finger down', () => {
      iev.start(container)
      container.dispatchEvent(pointer('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 }))
      container.dispatchEvent(pointer('pointerdown', { pointerId: 2, clientX: 30, clientY: 40 }))
      const img = vvw.state.children.images[0]
      expect(img.setInitialCenter).toHaveBeenCalled()
      iev.stop()
    })
  })

  describe('registerPointerListener', () => {
    it('registers and receives external pointer events', () => {
      const externalListener = vi.fn()
      iev.registerPointerListener(externalListener)
      iev.start(container)
      container.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 1,
          clientX: 100,
          clientY: 200,
          button: 0,
          bubbles: true,
        })
      )
      expect(externalListener).toHaveBeenCalled()
      const call = externalListener.mock.calls[0][0]
      expect(call.event).toBe('down')
      expect(call.state).toBe(vvw.state)
      iev.stop()
    })
  })
})
