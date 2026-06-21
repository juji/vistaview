import { describe, it, expect } from 'vitest'
import { DefaultOptions } from '../../defaults/options'

describe('DefaultOptions', () => {
  it('has animationDurationBase of 333', () => {
    expect(DefaultOptions.animationDurationBase).toBe(333)
  })

  it('has maxZoomLevel of 2', () => {
    expect(DefaultOptions.maxZoomLevel).toBe(2)
  })

  it('has preloads of 1', () => {
    expect(DefaultOptions.preloads).toBe(1)
  })

  it('has keyboardListeners enabled', () => {
    expect(DefaultOptions.keyboardListeners).toBe(true)
  })

  it('has rapidLimit of 222', () => {
    expect(DefaultOptions.rapidLimit).toBe(222)
  })

  it('has default controls with indexDisplay top-left', () => {
    expect(DefaultOptions.controls?.topLeft).toContain('indexDisplay')
  })

  it('has default controls with zoomIn, zoomOut, close top-right', () => {
    expect(DefaultOptions.controls?.topRight).toEqual(['zoomIn', 'zoomOut', 'close'])
  })

  it('has default controls with description bottom-left', () => {
    expect(DefaultOptions.controls?.bottomLeft).toContain('description')
  })
})
