import { describe, it, expect } from 'vitest'
import { isNotZeroCss } from '../../utils/is-not-zero-css'

describe('isNotZeroCss', () => {
  it('returns false for zero pixel values', () => {
    expect(isNotZeroCss('0px')).toBe(false)
    expect(isNotZeroCss('0%')).toBe(false)
    expect(isNotZeroCss('0rem')).toBe(false)
    expect(isNotZeroCss('0em')).toBe(false)
  })

  it('returns false for zero viewport units', () => {
    expect(isNotZeroCss('0vw')).toBe(false)
    expect(isNotZeroCss('0vh')).toBe(false)
    expect(isNotZeroCss('0vmin')).toBe(false)
    expect(isNotZeroCss('0vmax')).toBe(false)
  })

  it('returns false for zero absolute units', () => {
    expect(isNotZeroCss('0cm')).toBe(false)
    expect(isNotZeroCss('0mm')).toBe(false)
    expect(isNotZeroCss('0in')).toBe(false)
    expect(isNotZeroCss('0pt')).toBe(false)
    expect(isNotZeroCss('0pc')).toBe(false)
  })

  it('returns false for zero with no unit', () => {
    expect(isNotZeroCss('0')).toBe(false)
  })

  it('returns value string for non-zero values', () => {
    expect(isNotZeroCss('8px')).toBe('8px')
    expect(isNotZeroCss('50%')).toBe('50%')
    expect(isNotZeroCss('1rem')).toBe('1rem')
    expect(isNotZeroCss('0.5px')).toBe('0.5px')
  })

  it('returns undefined for undefined', () => {
    expect(isNotZeroCss(undefined)).toBeUndefined()
  })

  it('returns empty string for empty string', () => {
    expect(isNotZeroCss('')).toBe('')
  })

  it('handles zero with extra whitespace', () => {
    expect(isNotZeroCss(' 0px ')).toBe(false)
  })

  it('handles negative values', () => {
    expect(isNotZeroCss('-5px')).toBe('-5px')
  })
})
