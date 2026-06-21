import { describe, it, expect } from 'vitest'
import { parseMapboxLocation, getMapboxStaticImage } from './main'

describe('parseMapboxLocation', () => {
  it('parses coordinate string', () => {
    const result = parseMapboxLocation('-74.0060,40.7128,15')
    expect(result).toEqual({ lng: -74.006, lat: 40.7128, zoom: 15 })
  })

  it('parses mapbox.com @ URL', () => {
    const result = parseMapboxLocation('https://www.mapbox.com/@-74.006,40.7128,15z')
    expect(result).toEqual({ lng: -74.006, lat: 40.7128, zoom: 15 })
  })

  it('returns null for invalid string', () => {
    expect(parseMapboxLocation('')).toBeNull()
  })
})

describe('getMapboxStaticImage', () => {
  it('builds static map URL', () => {
    const url = getMapboxStaticImage(
      { lng: -74.006, lat: 40.7128, zoom: 15 },
      { accessToken: 'pk.test123' }
    )
    expect(url).toContain('api.mapbox.com')
    expect(url).toContain('pk.test123')
    expect(url).toContain('-74.006,40.7128')
  })

  it('uses config defaults when location omits zoom', () => {
    const url = getMapboxStaticImage(
      { lng: 0, lat: 0 },
      { accessToken: 'tok', zoom: 12 }
    )
    expect(url).toContain('12,0,0')
  })
})
