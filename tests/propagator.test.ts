import { describe, it, expect } from 'vitest'
import { propagate, propagateSeries } from '../src/index.js'
import { namedOrbitPreset, orbitalPeriod, wrap2pi } from '../src/index.js'
import { R_EARTH } from '../src/index.js'

const LEO = namedOrbitPreset('LEO')

describe('propagate', () => {
  it('propagating by zero returns same true anomaly', () => {
    const result = propagate(LEO, 0)
    expect(result.elements.trueAnomaly).toBeCloseTo(LEO.trueAnomaly, 6)
  })

  it('propagating one full period returns to same true anomaly', () => {
    const T = orbitalPeriod(LEO.sma)
    const result = propagate(LEO, T)
    expect(wrap2pi(result.elements.trueAnomaly)).toBeCloseTo(wrap2pi(LEO.trueAnomaly), 3)
  })

  it('epoch advances correctly', () => {
    const dt = 1000
    const result = propagate(LEO, dt)
    expect(result.epoch).toBeCloseTo(dt, 3)
  })

  it('state vector has 6 components', () => {
    const result = propagate(LEO, 3600)
    const { x, y, z, vx, vy, vz } = result.state
    for (const v of [x, y, z, vx, vy, vz]) {
      expect(typeof v).toBe('number')
      expect(isNaN(v)).toBe(false)
    }
  })

  it('magnitude of position vector ≈ sma for circular orbit', () => {
    const circular = { ...LEO, ecc: 0, trueAnomaly: 0 }
    const result = propagate(circular, 3600)
    const r = Math.sqrt(result.state.x ** 2 + result.state.y ** 2 + result.state.z ** 2)
    expect(r).toBeCloseTo(circular.sma, -3)
  })
})

describe('propagateSeries', () => {
  it('returns steps+1 results', () => {
    const series = propagateSeries(LEO, 3600, 10)
    expect(series.length).toBe(11)
  })

  it('first epoch is 0', () => {
    const series = propagateSeries(LEO, 3600, 10)
    expect(series[0].epoch).toBe(0)
  })

  it('last epoch equals duration', () => {
    const series = propagateSeries(LEO, 3600, 10)
    expect(series[series.length - 1].epoch).toBeCloseTo(3600, 2)
  })
})
