import { describe, expect, it } from 'vitest'
import { isServer, renderToString } from 'solid-js/web'
import { useVistaView } from '../src/use-vistaview'
import { VistaView } from '../src/vistaview'

describe('environment', () => {
  it('runs on server', () => {
    expect(typeof window).toBe('undefined')
    expect(isServer).toBe(true)
  })
})

describe('useVistaView (SSR)', () => {
  it('returns the interface shape', () => {
    const api = useVistaView({ elements: '#gallery a' } as any)
    expect(api).toHaveProperty('open')
    expect(api).toHaveProperty('close')
    expect(api).toHaveProperty('reset')
    expect(api).toHaveProperty('destroy')
  })

  it('methods are no-ops on server (no onMount)', () => {
    const api = useVistaView({ elements: '#gallery a' } as any)
    // onMount never fires in SSR, so instance stays null
    expect(api.getCurrentIndex()).toBe(-1)
    expect(api.close()).resolves.toBeUndefined()
  })
})

describe('VistaView (SSR)', () => {
  it('renders a div with children', () => {
    const string = renderToString(() => (
      <VistaView id="test-gallery">
        <a href="p1.jpg"><img src="t1.jpg" alt="1" /></a>
      </VistaView>
    ))
    expect(string).toContain('test-gallery')
    expect(string).toContain('<a href="p1.jpg"')
  })

  it('does not initialize vistaView on server', () => {
    const string = renderToString(() => (
      <VistaView id="test-gallery">
        <a href="p1.jpg">link</a>
      </VistaView>
    ))
    // No vistaView call expected in SSR — onMount never fires
    expect(string).toContain('test-gallery')
  })
})
