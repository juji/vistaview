import { describe, it, expect } from 'vitest'
import { close } from '../../defaults/close'

describe('defaults/close', () => {
  it('is deliberately empty — noop', () => {
    expect(close({} as any)).toBeUndefined()
    expect(close({ options: {} } as any)).toBeUndefined()
  })
})
