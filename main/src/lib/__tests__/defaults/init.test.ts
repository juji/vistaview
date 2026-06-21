import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { init } from '../../defaults/init'
import type { VistaExternalPointerListenerArgs, VistaPointerListener } from '../../types'

describe('defaults/init', () => {
  let container: HTMLElement
  let registeredListener: VistaPointerListener
  let closeFn: ReturnType<typeof vi.fn>
  let prevFn: ReturnType<typeof vi.fn>
  let nextFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    closeFn = vi.fn()
    prevFn = vi.fn()
    nextFn = vi.fn()

    const vvw = {
      imageContainer: container,
      state: { elmLength: 3 },
      registerPointerListener: vi.fn((l: VistaPointerListener) => {
        registeredListener = l
      }),
      close: closeFn,
      prev: prevFn,
      next: nextFn,
    } as any

    init(vvw)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  function makeArgs(overrides: Partial<VistaExternalPointerListenerArgs>): VistaExternalPointerListenerArgs {
    return {
      event: 'down',
      pointer: { x: 0, y: 0, movementX: 0, movementY: 0, id: 1 },
      pointers: [],
      lastPointerLen: 0,
      state: { elmLength: 3 } as any,
      hasInternalExecution: false,
      abortController: new AbortController(),
      ...overrides,
    }
  }

  it('registers a pointer listener via vistaView', () => {
    expect(registeredListener).toBeDefined()
  })

  it('ignores events with hasInternalExecution', () => {
    registeredListener(makeArgs({ event: 'down', hasInternalExecution: true }))
    // no error thrown
  })

  it('ignores events with multiple pointers', () => {
    registeredListener(makeArgs({ event: 'down', pointers: [{ x: 0, y: 0, movementX: 0, movementY: 0, id: 1 }, { x: 100, y: 100, movementX: 0, movementY: 0, id: 2 }] }))
    // no error thrown
  })

  it('records start position on down', () => {
    registeredListener(makeArgs({
      event: 'down',
      pointer: { x: 200, y: 300, movementX: 0, movementY: 0, id: 1 },
    }))
    // Now move
    registeredListener(makeArgs({
      event: 'move',
      pointer: { x: 250, y: 300, movementX: 50, movementY: 0, id: 1 },
      pointers: [],
    }))
    // Horizontal delta 50 → translates by 50vw / window.innerWidth * 100
    const percentX = (50 / window.innerWidth) * 100
    expect(container.style.transform).toBe(`translateX(${percentX}vw)`)
  })

  it('triggers close on vertical swipe past threshold', () => {
    registeredListener(makeArgs({
      event: 'down',
      pointer: { x: 100, y: 100, movementX: 0, movementY: 0, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'move',
      pointer: { x: 100, y: 300, movementX: 0, movementY: 200, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'up',
      pointer: { x: 100, y: 300, movementX: 0, movementY: 200, id: 1 },
    }))
    expect(closeFn).toHaveBeenCalled()
  })

  it('triggers prev on horizontal swipe right past threshold', () => {
    registeredListener(makeArgs({
      event: 'down',
      pointer: { x: 100, y: 100, movementX: 0, movementY: 0, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'move',
      pointer: { x: 300, y: 100, movementX: 200, movementY: 0, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'up',
      pointer: { x: 300, y: 100, movementX: 200, movementY: 0, id: 1 },
    }))
    expect(prevFn).toHaveBeenCalled()
  })

  it('triggers next on horizontal swipe left past threshold', () => {
    registeredListener(makeArgs({
      event: 'down',
      pointer: { x: 300, y: 100, movementX: 0, movementY: 0, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'move',
      pointer: { x: 100, y: 100, movementX: -200, movementY: 0, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'up',
      pointer: { x: 100, y: 100, movementX: -200, movementY: 0, id: 1 },
    }))
    expect(nextFn).toHaveBeenCalled()
  })

  it('resets position on small horizontal move', () => {
    registeredListener(makeArgs({
      event: 'down',
      pointer: { x: 200, y: 100, movementX: 0, movementY: 0, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'move',
      pointer: { x: 210, y: 100, movementX: 10, movementY: 0, id: 1 },
    }))
    registeredListener(makeArgs({
      event: 'up',
      pointer: { x: 210, y: 100, movementX: 10, movementY: 0, id: 1 },
    }))
    // transitionend handler will reset styles
    container.dispatchEvent(new Event('transitionend'))
    expect(container.style.transition).toBe('')
    expect(container.style.transform).toBe('')
  })

  it('aborts abortController on down', () => {
    const controller = new AbortController()
    const abortSpy = vi.spyOn(controller, 'abort')

    registeredListener(makeArgs({
      event: 'down',
      pointer: { x: 100, y: 100, movementX: 0, movementY: 0, id: 1 },
      abortController: controller,
    }))

    expect(abortSpy).toHaveBeenCalled()
  })
})
