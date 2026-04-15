import { describe, it, expect } from 'vitest'
import {
  elementsToState,
  stateToElements,
  orbitalPeriod,
  circularVelocity,
  classifyOrbit,
  deg2rad,
  rad2deg,
  wrap2pi,
  meanToEccentric,
  eccentricToTrue,
  trueToMean,
  visViva,
  G,
} from '../src/index.js'
import { MU_EARTH, R_EARTH } from '../src/index.js'

const LEO: Parameters<typeof elementsToState>[0] = {
  sma: R_EARTH + 400_000,
  ecc: 0.0,
  inc: deg2rad(51.6),
  raan: deg2rad(0),
  aop: deg2rad(0),
  trueAnomaly: deg2rad(0),
  epoch: 0,
}

describe('constants', () => {
  it('G is close to 6.6743e-11', () => {
    expect(G).toBeCloseTo(6.6743e-11, 14)
  })
  it('MU_EARTH is defined and reasonable', () => {
    expect(MU_EARTH).toBeGreaterThan(3.9e14)
  })
})

describe('orbit classification', () => {
  it('classifies circular orbits', () => expect(classifyOrbit(0)).toBe('circular'))
  it('classifies elliptic orbits', () => expect(classifyOrbit(0.5)).toBe('elliptic'))
  it('classifies parabolic orbits', () => expect(classifyOrbit(1.0)).toBe('parabolic'))
  it('classifies hyperbolic orbits', () => expect(classifyOrbit(1.5)).toBe('hyperbolic'))
})

describe('orbital period', () => {
  it('LEO period ~92 minutes', () => {
    const T = orbitalPeriod(R_EARTH + 400_000)
    expect(T / 60).toBeCloseTo(92.3, 0)
  })
  it('GEO period ~24 hours', () => {
    const T = orbitalPeriod(42_164_000)
    expect(T / 3600).toBeCloseTo(23.93, 0)
  })
})

describe('circular velocity', () => {
  it('LEO velocity ~7.67 km/s', () => {
    expect(circularVelocity(R_EARTH + 400_000) / 1000).toBeCloseTo(7.67, 1)
  })
})

describe('vis-viva', () => {
  it('equals circularVelocity for circular orbit', () => {
    const r = R_EARTH + 400_000
    expect(visViva(r, r)).toBeCloseTo(circularVelocity(r), 4)
  })
})

describe('angle helpers', () => {
  it('deg2rad(180) = PI', () => expect(deg2rad(180)).toBeCloseTo(Math.PI))
  it('rad2deg(PI) = 180', () => expect(rad2deg(Math.PI)).toBeCloseTo(180))
  it('wrap2pi wraps negative angle', () => expect(wrap2pi(-Math.PI)).toBeCloseTo(Math.PI))
  it('wrap2pi is idempotent in [0,2PI)', () => expect(wrap2pi(1.5)).toBeCloseTo(1.5))
})

describe('anomaly conversions', () => {
  it('roundtrip: trueToMean → meanToEccentric → eccentricToTrue', () => {
    const nu0 = deg2rad(45)
    const ecc = 0.3
    const M = trueToMean(nu0, ecc)
    const E = meanToEccentric(M, ecc)
    const nu = eccentricToTrue(E, ecc)
    expect(nu).toBeCloseTo(nu0, 8)
  })
})

describe('elements ↔ state vector', () => {
  it('roundtrip: elements → state → elements', () => {
    const sv = elementsToState(LEO)
    const el = stateToElements(sv)
    expect(el.sma).toBeCloseTo(LEO.sma, -3)
    expect(el.ecc).toBeCloseTo(LEO.ecc, 4)
    expect(rad2deg(el.inc)).toBeCloseTo(rad2deg(LEO.inc), 4)
  })

  it('LEO state vector z≈0 for zero inclination', () => {
    const zeroInc = { ...LEO, inc: 0 }
    const sv = elementsToState(zeroInc)
    expect(Math.abs(sv.z)).toBeLessThan(1)    // within 1 m
    expect(Math.abs(sv.vz)).toBeLessThan(0.01) // within 1 cm/s
  })
})
