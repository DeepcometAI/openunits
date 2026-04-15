import { describe, it, expect } from 'vitest'
import {
  hohmannTransfer,
  escapeVelocity,
  launchDeltaV,
  namedOrbitPreset,
  altitudeToRadius,
} from '../src/index.js'
import { R_EARTH, MU_EARTH } from '../src/index.js'
import { circularVelocity } from '../src/index.js'

describe('hohmannTransfer', () => {
  it('LEO → GEO: total ΔV ~3.9 km/s', () => {
    const r1 = R_EARTH + 400_000
    const r2 = 42_164_000
    const { totalDv } = hohmannTransfer(r1, r2)
    expect(totalDv / 1000).toBeCloseTo(3.9, 0)
  })

  it('same orbit→ zero ΔV', () => {
    const r = R_EARTH + 500_000
    const { totalDv } = hohmannTransfer(r, r)
    expect(totalDv).toBeCloseTo(0, 4)
  })

  it('dv1 > 0 for raising orbit', () => {
    const { dv1 } = hohmannTransfer(R_EARTH + 400_000, R_EARTH + 800_000)
    expect(dv1).toBeGreaterThan(0)
  })
})

describe('escapeVelocity', () => {
  it('Earth surface escape ~11.2 km/s', () => {
    expect(escapeVelocity(R_EARTH) / 1000).toBeCloseTo(11.2, 0)
  })

  it('escape > circular at same radius', () => {
    const r = R_EARTH + 400_000
    expect(escapeVelocity(r)).toBeGreaterThan(circularVelocity(r))
  })

  it('escape ≈ √2 × circular', () => {
    const r = R_EARTH + 400_000
    expect(escapeVelocity(r) / circularVelocity(r)).toBeCloseTo(Math.sqrt(2), 4)
  })
})

describe('namedOrbitPreset', () => {
  it('returns LEO preset', () => {
    const el = namedOrbitPreset('LEO')
    expect(el.sma).toBeGreaterThan(R_EARTH)
    expect(el.sma).toBeLessThan(R_EARTH + 2_000_000)
  })

  it('returns GEO preset near 42164 km', () => {
    const el = namedOrbitPreset('GEO')
    expect(el.sma / 1000).toBeCloseTo(42_164, 0)
  })

  it('throws for unknown orbit name', () => {
    expect(() => namedOrbitPreset('XXXX')).toThrow()
  })

  it('is case-insensitive', () => {
    expect(() => namedOrbitPreset('leo')).not.toThrow()
  })
})

describe('altitudeToRadius', () => {
  it('adds R_EARTH by default', () => {
    expect(altitudeToRadius(0)).toBeCloseTo(R_EARTH)
    expect(altitudeToRadius(400_000)).toBeCloseTo(R_EARTH + 400_000)
  })
})
