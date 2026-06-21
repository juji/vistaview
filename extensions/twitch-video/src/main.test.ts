import { describe, it, expect } from 'vitest'
import { parseTwitchUrl, getTwitchThumbnail } from './main'

describe('parseTwitchUrl', () => {
  it('parses video URL with channel', () => {
    const result = parseTwitchUrl('https://www.twitch.tv/ninja/video/123456789')
    expect(result).toEqual({ type: 'video', id: '123456789', channel: 'ninja' })
  })

  it('parses video URL without channel', () => {
    const result = parseTwitchUrl('https://www.twitch.tv/videos/123456789')
    expect(result).toEqual({ type: 'video', id: '123456789' })
  })

  it('parses channel URL', () => {
    const result = parseTwitchUrl('https://www.twitch.tv/ninja')
    expect(result).toEqual({ type: 'channel', id: 'ninja' })
  })

  it('returns null for invalid URL', () => {
    expect(parseTwitchUrl('https://example.com')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseTwitchUrl('')).toBeNull()
  })
})

describe('getTwitchThumbnail', () => {
  it('returns live thumbnail for channel', () => {
    expect(getTwitchThumbnail('https://www.twitch.tv/ninja')).toBe(
      'https://static-cdn.jtvnw.net/previews-ttv/live_user_ninja-320x180.jpg'
    )
  })

  it('returns VOD thumbnail for video with channel', () => {
    expect(getTwitchThumbnail('https://www.twitch.tv/ninja/video/123456789')).toBe(
      'https://static-cdn.jtvnw.net/cf_vods/ninja/123456789/thumb/thumb0-320x180.jpg'
    )
  })

  it('throws for invalid URL', () => {
    expect(() => getTwitchThumbnail('bad')).toThrow('Invalid Twitch URL')
  })
})
