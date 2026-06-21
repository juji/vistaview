import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Throttle } from '../throttle'

describe('Throttle', () => {
  let throttle: Throttle

  beforeEach(() => {
    throttle = new Throttle()
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('invokes function on first call', () => {
    const fn = vi.fn()
    throttle.fio(fn, 'test')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('throttles subsequent calls within wait window', () => {
    const fn = vi.fn()
    throttle.fio(fn, 'test')
    throttle.fio(fn, 'test')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses separate throttle slots by id', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    throttle.fio(fn1, 'id1')
    throttle.fio(fn2, 'id2')
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('respects custom wait window', () => {
    const fn = vi.fn()

    throttle.fio(fn, 'test', 50)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(30)
    throttle.fio(fn, 'test', 50)
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(30)
    throttle.fio(fn, 'test', 50)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('uses default wait of 50ms', () => {
    const fn = vi.fn()

    throttle.fio(fn, 'test')
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(30)
    throttle.fio(fn, 'test')
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(30)
    throttle.fio(fn, 'test')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
