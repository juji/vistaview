import { describe, it, expect } from 'vitest'
import { parseWistiaVideoId } from './main'

describe('parseWistiaVideoId', () => {
  it('extracts from home.wistia.com', () => {
    expect(parseWistiaVideoId('https://home.wistia.com/medias/abc123def')).toBe('abc123def')
  })
  it('extracts from fast.wistia.net', () => {
    expect(parseWistiaVideoId('https://fast.wistia.net/embed/iframe/abc123def')).toBe('abc123def')
  })
  it('extracts from account subdomain', () => {
    expect(parseWistiaVideoId('https://myaccount.wistia.com/medias/abc123def')).toBe('abc123def')
  })
  it('returns null for invalid URL', () => {
    expect(parseWistiaVideoId('https://example.com')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(parseWistiaVideoId('')).toBeNull()
  })
})
