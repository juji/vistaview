import { describe, it, expect } from 'vitest'
import { VistaState } from '../vista-state'

describe('VistaState', () => {
  it('initializes with default values', () => {
    const state = new VistaState()
    expect(state.open).toBe(false)
    expect(state.settled).toBe(false)
    expect(state.closing).toBe(false)
    expect(state.zoomedIn).toBe(false)
    expect(state.children.htmls).toEqual([])
    expect(state.children.images).toEqual([])
    expect(state.currentIndex).toBe(-1)
    expect(state.elmLength).toBe(0)
    expect(state.abortController).toBeInstanceOf(AbortController)
    expect(state.isReducedMotion).toBe(false)
    expect(state.extensions).toBeInstanceOf(Set)
    expect(state.extensions.size).toBe(0)
  })

  it('mutates state properties', () => {
    const state = new VistaState()
    state.open = true
    state.settled = true
    state.zoomedIn = true
    state.currentIndex = 5
    state.elmLength = 10
    state.isReducedMotion = true

    expect(state.open).toBe(true)
    expect(state.settled).toBe(true)
    expect(state.zoomedIn).toBe(true)
    expect(state.currentIndex).toBe(5)
    expect(state.elmLength).toBe(10)
    expect(state.isReducedMotion).toBe(true)
  })

  it('assigns children', () => {
    const state = new VistaState()
    const htmls = [document.createElement('div')]
    const images = [] as any[]
    state.children = { htmls, images }
    expect(state.children.htmls).toHaveLength(1)
    expect(state.children.images).toHaveLength(0)
  })

  it('manages extensions set', () => {
    const state = new VistaState()
    const ext = { name: 'test' } as any
    state.extensions.add(ext)
    expect(state.extensions.has(ext)).toBe(true)
    expect(state.extensions.size).toBe(1)
    state.extensions.delete(ext)
    expect(state.extensions.size).toBe(0)
  })

  it('creates new AbortController on demand', () => {
    const state = new VistaState()
    const oldController = state.abortController
    state.abortController = new AbortController()
    expect(state.abortController).not.toBe(oldController)
    expect(state.abortController).toBeInstanceOf(AbortController)
  })
})
