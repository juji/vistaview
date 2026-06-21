import { describe, it, expect, vi } from 'vitest'
import { logger } from './main'

describe('logger extension', () => {
  it('returns extension with name "logger"', () => {
    const ext = logger()
    expect(ext.name).toBe('logger')
  })

  it('calls console.debug on onInitializeImage', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    logger().onInitializeImage?.({} as any)
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
  })

  it('calls console.debug on onContentChange', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    logger().onContentChange?.({} as any, {} as any)
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
  })

  it('calls console.debug on onImageView', async () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    await logger().onImageView?.({} as any, {} as any)
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
  })

  it('calls console.debug on onOpen', async () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    await logger().onOpen?.({} as any)
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
  })

  it('calls console.debug on onClose', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    logger().onClose?.({} as any)
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
  })
})
