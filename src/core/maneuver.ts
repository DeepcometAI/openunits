import { MU_EARTH, R_EARTH } from './constants.js'
import { circularVelocity, visViva } from './orbit.js'
import type { KeplerianElements, Maneuver } from './types.js'

/**
 * Compute the Hohmann transfer delta-V maneuvers between two circular orbits.
 *
 * @param r1 - Radius of initial circular orbit (m)
 * @param r2 - Radius of target circular orbit (m)
 * @param mu - Gravitational parameter (m^3/s^2), defaults to MU_EARTH
 * @returns Object with dv1 (m/s), dv2 (m/s), totalDv (m/s), and transfer time (s)
 */
export function hohmannTransfer(
  r1: number,
  r2: number,
  mu: number = MU_EARTH,
): { dv1: number; dv2: number; totalDv: number; transferTime: number; smaTransfer: number } {
  const smaTransfer = (r1 + r2) / 2

  const v1_circ = circularVelocity(r1, mu)
  const v2_circ = circularVelocity(r2, mu)
  const v1_transfer = visViva(r1, smaTransfer, mu)
  const v2_transfer = visViva(r2, smaTransfer, mu)

  const dv1 = v1_transfer - v1_circ
  const dv2 = v2_circ - v2_transfer
  const totalDv = Math.abs(dv1) + Math.abs(dv2)
  const transferTime = Math.PI * Math.sqrt(smaTransfer ** 3 / mu)

  return { dv1, dv2, totalDv, transferTime, smaTransfer }
}

/**
 * Compute delta-V for a simple in-plane inclination change at circular orbit.
 *
 * @param v - Orbital speed (m/s)
 * @param deltaInc - Inclination change (radians)
 */
export function inclinationChange(v: number, deltaInc: number): Maneuver {
  const total = 2 * v * Math.sin(deltaInc / 2)
  return { dvr: 0, dvt: 0, dvn: total, total }
}

/**
 * Compute escape velocity from a given radius.
 *
 * @param radius - Distance from central body centre (m)
 * @param mu - Gravitational parameter
 */
export function escapeVelocity(radius: number, mu: number = MU_EARTH): number {
  return Math.sqrt(2 * mu / radius)
}

/**
 * Compute the delta-V needed to reach escape velocity from a circular orbit.
 *
 * @param orbitRadius - Radius of circular parking orbit (m)
 * @param mu - Gravitational parameter
 */
export function escapeFromCircular(orbitRadius: number, mu: number = MU_EARTH): number {
  return escapeVelocity(orbitRadius, mu) - circularVelocity(orbitRadius, mu)
}

/**
 * Estimate launch delta-V to reach a target orbit altitude from Earth's surface.
 * Includes gravity loss estimate (~1.5 km/s) typical for vertical ascent.
 *
 * @param targetAltitude - Altitude above Earth surface (m)
 * @param mu - Gravitational parameter
 * @param rBody - Central body radius (m), defaults to R_EARTH
 */
export function launchDeltaV(
  targetAltitude: number,
  mu: number = MU_EARTH,
  rBody: number = R_EARTH,
): number {
  const r = rBody + targetAltitude
  const vOrbit = circularVelocity(r, mu)
  const gravityLoss = 1_500 // typical ~1.5 km/s gravity + drag losses
  return vOrbit + gravityLoss
}

/**
 * Convert altitude above Earth surface to orbital radius.
 */
export function altitudeToRadius(altitude: number, rBody: number = R_EARTH): number {
  return rBody + altitude
}

/**
 * Generate a named preset KeplerianElements object for common Earth orbits.
 *
 * @param name - Orbit name: 'LEO' | 'MEO' | 'GEO' | 'SSO' | 'HEO'
 */
export function namedOrbitPreset(name: string): KeplerianElements {
  const presets: Record<string, KeplerianElements> = {
    LEO: { sma: R_EARTH + 400_000, ecc: 0.001, inc: 0.9, raan: 0, aop: 0, trueAnomaly: 0 },
    MEO: { sma: R_EARTH + 20_200_000, ecc: 0.001, inc: 0.96, raan: 0, aop: 0, trueAnomaly: 0 },
    GEO: { sma: 42_164_000, ecc: 0, inc: 0, raan: 0, aop: 0, trueAnomaly: 0 },
    SSO: { sma: R_EARTH + 600_000, ecc: 0.001, inc: 1.7, raan: 0, aop: 0, trueAnomaly: 0 },
    HEO: { sma: (R_EARTH + 500_000 + R_EARTH + 39_000_000) / 2, ecc: 0.74, inc: 1.15, raan: 0, aop: 0, trueAnomaly: 0 },
    TLI: { sma: 323_000_000, ecc: 0.97, inc: 0.5, raan: 0, aop: 0, trueAnomaly: 0 },
  }
  const result = presets[name.toUpperCase()]
  if (!result) throw new Error(`Unknown named orbit: "${name}". Available: ${Object.keys(presets).join(', ')}`)
  return result
}
