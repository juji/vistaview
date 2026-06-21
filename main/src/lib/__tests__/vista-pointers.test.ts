import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VistaPointers } from '../vista-pointers'

function makePointerEvent(
  type: string,
  overrides: Partial<PointerEventInit> = {}
): PointerEvent {
  return new PointerEvent(type, {
    pointerId: 1,
    clientX: 100,
    clientY: 200,
    button: 0,
    bubbles: true,
    ...overrides,
  })
}

describe('VistaPointers', () => {
  let container: HTMLElement
  let listener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    listener = vi.fn()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('fires down event on pointerdown', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(makePointerEvent('pointerdown'))

    expect(listener).toHaveBeenCalledTimes(1)
    const args = listener.mock.calls[0][0]
    expect(args.event).toBe('down')
    expect(args.pointer.x).toBe(100)
    expect(args.pointer.y).toBe(200)
    expect(args.pointers).toHaveLength(1)
    expect(args.lastPointerLen).toBe(0)
    vp.removeListeners()
  })

  it('fires move event on pointermove', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(
      makePointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    )
    container.dispatchEvent(
      makePointerEvent('pointermove', {
        pointerId: 1,
        clientX: 150,
        clientY: 250,
        movementX: 10,
        movementY: 20,
      })
    )

    expect(listener).toHaveBeenCalledTimes(2)
    const moveArgs = listener.mock.calls[1][0]
    expect(moveArgs.event).toBe('move')
    expect(moveArgs.pointer.x).toBe(150)
    expect(moveArgs.pointer.y).toBe(250)
    expect(moveArgs.pointer.movementX).toBe(10)
    expect(moveArgs.pointer.movementY).toBe(20)
    vp.removeListeners()
  })

  it('fires up event on pointerup and removes pointer', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(makePointerEvent('pointerdown'))
    // pointerup listener is on document — needs bubbles: true
    container.dispatchEvent(makePointerEvent('pointerup', { bubbles: true }))

    expect(listener).toHaveBeenCalledTimes(2)
    const upArgs = listener.mock.calls[1][0]
    expect(upArgs.event).toBe('up')
    expect(upArgs.pointers).toHaveLength(0)
    expect(upArgs.lastPointerLen).toBe(1)
    vp.removeListeners()
  })

  it('fires cancel event on pointercancel and removes pointer', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(makePointerEvent('pointerdown'))
    container.dispatchEvent(makePointerEvent('pointercancel', { bubbles: true }))

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener.mock.calls[1][0].event).toBe('cancel')
    expect(listener.mock.calls[1][0].pointers).toHaveLength(0)
    vp.removeListeners()
  })

  it('ignores non-primary button clicks', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(makePointerEvent('pointerdown', { button: 2 }))

    expect(listener).not.toHaveBeenCalled()
    vp.removeListeners()
  })

  it('removes pointer on contextmenu', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(makePointerEvent('pointerdown', { pointerId: 1 }))
    listener.mockClear()

    window.dispatchEvent(new Event('contextmenu'))
    container.dispatchEvent(makePointerEvent('pointerup', { pointerId: 1, bubbles: true }))

    // pointer was removed by contextmenu, so pointerup won't find it → no call
    expect(listener).not.toHaveBeenCalled()
    vp.removeListeners()
  })

  it('getPointerDistance calculates Euclidean distance', () => {
    const vp = new VistaPointers({ elm: container })
    const p1 = { x: 0, y: 0, movementX: 0, movementY: 0, id: 1 }
    const p2 = { x: 3, y: 4, movementX: 0, movementY: 0, id: 2 }
    expect(vp.getPointerDistance(p1, p2)).toBe(5)
  })

  it('getCentroid returns center of two pointers', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(
      makePointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    )
    container.dispatchEvent(
      makePointerEvent('pointerdown', { pointerId: 2, clientX: 100, clientY: 200 })
    )

    const c = vp.getCentroid()
    expect(c).toEqual({ x: 50, y: 100 })
    vp.removeListeners()
  })

  it('getCentroid returns null when no pointers', () => {
    const vp = new VistaPointers({ elm: container })
    expect(vp.getCentroid()).toBeNull()
  })

  it('addEventListener adds a listener', () => {
    const vp = new VistaPointers({ elm: container })
    vp.addEventListener(listener)
    container.dispatchEvent(makePointerEvent('pointerdown'))
    expect(listener).toHaveBeenCalledTimes(1)
    vp.removeListeners()
  })

  it('removeEventListener removes a specific listener', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    vp.removeEventListener(listener)
    container.dispatchEvent(makePointerEvent('pointerdown'))
    expect(listener).not.toHaveBeenCalled()
    vp.removeListeners()
  })

  it('removeListeners cleans up all handlers', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    vp.removeListeners()
    container.dispatchEvent(makePointerEvent('pointerdown'))
    expect(listener).not.toHaveBeenCalled()
  })

  it('handles two-finger pinch distance tracking', () => {
    const vp = new VistaPointers({ elm: container, listeners: [listener] })
    container.dispatchEvent(
      makePointerEvent('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
    )
    container.dispatchEvent(
      makePointerEvent('pointerdown', { pointerId: 2, clientX: 30, clientY: 40 })
    )

    const distance = vp.getPointerDistance(
      { x: 0, y: 0, movementX: 0, movementY: 0, id: 1 },
      { x: 30, y: 40, movementX: 0, movementY: 0, id: 2 }
    )
    expect(distance).toBe(50)
    vp.removeListeners()
  })
})
