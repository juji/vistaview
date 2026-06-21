import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { transition } from '../../defaults/transition'

describe('defaults/transition', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns cleanup + transitionEnded for adjacent forward slide', () => {
    const signal = new AbortController().signal
    const vvw = {
      imageContainer: container,
      options: { animationDurationBase: 333 },
      state: { isReducedMotion: false, elmLength: 3 },
    } as any

    const result = transition(
      {
        htmlElements: { from: [], to: [document.createElement('div')] },
        images: { from: [], to: [] },
        index: { from: 0, to: 1 },
        via: { next: true, prev: false },
      },
      signal,
      vvw
    )

    expect(result).toBeTruthy()
    expect(result!.cleanup).toEqual(expect.any(Function))
    expect(result!.transitionEnded).toBeInstanceOf(Promise)
  })

  it('returns cleanup + transitionEnded for adjacent backward slide', () => {
    const signal = new AbortController().signal
    const vvw = {
      imageContainer: container,
      options: { animationDurationBase: 333 },
      state: { isReducedMotion: false, elmLength: 3 },
    } as any

    const result = transition(
      {
        htmlElements: { from: [], to: [document.createElement('div')] },
        images: { from: [], to: [] },
        index: { from: 1, to: 0 },
        via: { next: false, prev: true },
      },
      signal,
      vvw
    )

    expect(result).toBeTruthy()
  })

  it('handles wrap-around from last to first', () => {
    const signal = new AbortController().signal
    const vvw = {
      imageContainer: container,
      options: { animationDurationBase: 333 },
      state: { isReducedMotion: false, elmLength: 3 },
    } as any

    const result = transition(
      {
        htmlElements: { from: [], to: [document.createElement('div')] },
        images: { from: [], to: [] },
        index: { from: 2, to: 0 },
        via: { next: true, prev: false },
      },
      signal,
      vvw
    )

    expect(result).toBeTruthy()
  })

  it('returns undefined for non-adjacent index jump', () => {
    const signal = new AbortController().signal
    const vvw = {
      imageContainer: container,
      options: { animationDurationBase: 333 },
      state: { isReducedMotion: false, elmLength: 5 },
    } as any

    const result = transition(
      {
        htmlElements: { from: [], to: [document.createElement('div')] },
        images: { from: [], to: [] },
        index: { from: 0, to: 3 },
        via: { next: false, prev: false },
      },
      signal,
      vvw
    )

    expect(result).toBeUndefined()
  })

  it('returns undefined when aborted', () => {
    const controller = new AbortController()
    controller.abort()
    const vvw = {
      imageContainer: container,
      options: { animationDurationBase: 333 },
      state: { isReducedMotion: false, elmLength: 3 },
    } as any

    const result = transition(
      {
        htmlElements: { from: [], to: [document.createElement('div')] },
        images: { from: [], to: [] },
        index: { from: 0, to: 1 },
        via: { next: true, prev: false },
      },
      controller.signal,
      vvw
    )

    expect(result).toBeUndefined()
  })

  it('returns undefined when reduced motion', () => {
    const signal = new AbortController().signal
    const vvw = {
      imageContainer: container,
      options: { animationDurationBase: 333 },
      state: { isReducedMotion: true, elmLength: 3 },
    } as any

    const result = transition(
      {
        htmlElements: { from: [], to: [document.createElement('div')] },
        images: { from: [], to: [] },
        index: { from: 0, to: 1 },
        via: { next: true, prev: false },
      },
      signal,
      vvw
    )

    expect(result).toBeUndefined()
  })

  it('cleanup resets transition and transform styles', () => {
    const signal = new AbortController().signal
    const vvw = {
      imageContainer: container,
      options: { animationDurationBase: 333 },
      state: { isReducedMotion: false, elmLength: 3 },
    } as any

    container.style.transition = 'transform 333ms ease'
    container.style.transform = 'translateX(-100vw)'

    const result = transition(
      {
        htmlElements: { from: [], to: [document.createElement('div')] },
        images: { from: [], to: [] },
        index: { from: 0, to: 1 },
        via: { next: true, prev: false },
      },
      signal,
      vvw
    )

    result!.cleanup()

    expect(container.style.transition).toBe('')
    expect(container.style.transform).toBe('')
  })
})
