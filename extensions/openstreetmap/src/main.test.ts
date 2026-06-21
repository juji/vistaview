import { describe, it, expect } from 'vitest'
import { parseOpenStreetMapLocation } from './main'

describe('parseOpenStreetMapLocation', () => {
  it('parses coordinate string', () => {
    const result = parseOpenStreetMapLocation('40.7128,-74.006,15')
    expect(result).toEqual({ lat: 40.7128, lng: -74.006, zoom: 15 })
  })

  it('parses osm:// format', () => {
    const result = parseOpenStreetMapLocation('osm://40.7128,-74.0060,15')
    expect(result).toEqual({ lat: 40.7128, lng: -74.006, zoom: 15 })
  })

  it('parses openstreetmap.org hash URL', () => {
    const result = parseOpenStreetMapLocation('https://www.openstreetmap.org/#map=15/40.7128/-74.006')
    expect(result).toEqual({ zoom: 15, lat: 40.7128, lng: -74.006 })
  })

  it('returns null for empty string', () => {
    expect(parseOpenStreetMapLocation('')).toBeNull()
  })
})
