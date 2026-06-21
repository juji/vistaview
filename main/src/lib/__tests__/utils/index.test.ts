import { describe, it, expect } from 'vitest'
import { clamp, limitPrecision } from '../../utils/index'

describe('clamp', () => {
  it('clamps value within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })

  it('handles edge values', () => {
    expect(clamp(0, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('handles equal min/max', () => {
    expect(clamp(5, 0, 0)).toBe(0)
    expect(clamp(-1, 0, 0)).toBe(0)
  })

  it('handles NaN gracefully', () => {
    expect(clamp(NaN, 0, 10)).toBeNaN()
  })
})

describe('limitPrecision', () => {
  it('rounds to default 2 decimal places', () => {
    expect(limitPrecision(3.14159)).toBe(3.14)
    expect(limitPrecision(1.006)).toBe(1.01)
  })

  it('uses custom precision', () => {
    expect(limitPrecision(3.14159, 3)).toBe(3.142)
    expect(limitPrecision(3.14159, 0)).toBe(3)
  })

  it('handles integers', () => {
    expect(limitPrecision(5)).toBe(5)
    expect(limitPrecision(5, 2)).toBe(5)
  })

  it('handles negative numbers', () => {
    expect(limitPrecision(-3.14159)).toBe(-3.14)
  })
})
