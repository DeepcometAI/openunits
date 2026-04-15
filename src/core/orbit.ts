import { DEG2RAD, MU_EARTH, RAD2DEG } from './constants.js'
import type { KeplerianElements, OrbitType, StateVector } from './types.js'

// ─── Anomaly Conversions ─────────────────────────────────────────────────────

/**
 * Convert mean anomaly M to eccentric anomaly E using Newton-Raphson iteration.
 * @param M - Mean anomaly (radians)
 * @param ecc - Eccentricity
 * @param tol - Convergence tolerance (default 1e-10)
 */
export function meanToEccentric(M: number, ecc: number, tol = 1e-10): number {
  let E = ecc < 0.8 ? M : Math.PI
  for (let i = 0; i < 100; i++) {
    const dE = (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < tol) break
  }
  return E
}

/**
 * Convert eccentric anomaly E to true anomaly ν.
 */
export function eccentricToTrue(E: number, ecc: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + ecc) * Math.sin(E / 2),
    Math.sqrt(1 - ecc) * Math.cos(E / 2),
  )
}

/**
 * Convert true anomaly ν to eccentric anomaly E.
 */
export function trueToEccentric(nu: number, ecc: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 - ecc) * Math.sin(nu / 2),
    Math.sqrt(1 + ecc) * Math.cos(nu / 2),
  )
}

/**
 * Convert true anomaly ν to mean anomaly M.
 */
export function trueToMean(nu: number, ecc: number): number {
  const E = trueToEccentric(nu, ecc)
  return E - ecc * Math.sin(E)
}

// ─── Elements ↔ State Vector ─────────────────────────────────────────────────

/**
 * Convert Keplerian elements to a Cartesian state vector.
 * Assumes the central body is Earth (μ = MU_EARTH) unless mu is provided.
 *
 * @param elements - Keplerian elements (angles in radians)
 * @param mu - Gravitational parameter (m^3/s^2), defaults to MU_EARTH
 */
export function elementsToState(
  elements: KeplerianElements,
  mu: number = MU_EARTH,
): StateVector {
  const { sma, ecc, inc, raan, aop, trueAnomaly } = elements
  const nu = trueAnomaly

  // Semi-latus rectum
  const p = sma * (1 - ecc * ecc)

  // Distance
  const r = p / (1 + ecc * Math.cos(nu))

  // Position in perifocal frame
  const rx_pf = r * Math.cos(nu)
  const ry_pf = r * Math.sin(nu)

  // Velocity in perifocal frame
  const sqMuP = Math.sqrt(mu / p)
  const vx_pf = -sqMuP * Math.sin(nu)
  const vy_pf = sqMuP * (ecc + Math.cos(nu))

  // Rotation matrices: perifocal → ECI
  const cosO = Math.cos(raan), sinO = Math.sin(raan)
  const cosi = Math.cos(inc), sini = Math.sin(inc)
  const cosw = Math.cos(aop), sinw = Math.sin(aop)

  // Combined rotation matrix R = Rz(-Ω) · Rx(-i) · Rz(-ω)
  const Qxx = cosO * cosw - sinO * sinw * cosi
  const Qxy = -(cosO * sinw + sinO * cosw * cosi)
  const Qyx = sinO * cosw + cosO * sinw * cosi
  const Qyy = -(sinO * sinw - cosO * cosw * cosi)
  const Qzx = sinw * sini
  const Qzy = cosw * sini

  return {
    x: Qxx * rx_pf + Qxy * ry_pf,
    y: Qyx * rx_pf + Qyy * ry_pf,
    z: Qzx * rx_pf + Qzy * ry_pf,
    vx: Qxx * vx_pf + Qxy * vy_pf,
    vy: Qyx * vx_pf + Qyy * vy_pf,
    vz: Qzx * vx_pf + Qzy * vy_pf,
    epoch: elements.epoch,
  }
}

/**
 * Convert a Cartesian state vector to Keplerian elements.
 *
 * @param state - State vector (m, m/s)
 * @param mu - Gravitational parameter (m^3/s^2), defaults to MU_EARTH
 */
export function stateToElements(
  state: StateVector,
  mu: number = MU_EARTH,
): KeplerianElements {
  const { x, y, z, vx, vy, vz } = state

  // Position & velocity magnitudes
  const r = Math.sqrt(x * x + y * y + z * z)
  const v = Math.sqrt(vx * vx + vy * vy + vz * vz)

  // Angular momentum vector h = r × v
  const hx = y * vz - z * vy
  const hy = z * vx - x * vz
  const hz = x * vy - y * vx
  const h = Math.sqrt(hx * hx + hy * hy + hz * hz)

  // Node vector n = k × h  (k = [0,0,1])
  const nx = -hy
  const ny = hx
  const n = Math.sqrt(nx * nx + ny * ny)

  // Eccentricity vector e = (v×h)/μ - r̂
  const vCrossHx = vy * hz - vz * hy
  const vCrossHy = vz * hx - vx * hz
  const vCrossHz = vx * hy - vy * hx
  const ex = vCrossHx / mu - x / r
  const ey = vCrossHy / mu - y / r
  const ez = vCrossHz / mu - z / r
  const ecc = Math.sqrt(ex * ex + ey * ey + ez * ez)

  // Specific mechanical energy
  const energy = v * v / 2 - mu / r

  // Semi-major axis
  const sma = -mu / (2 * energy)

  // Inclination
  const inc = Math.acos(hz / h)

  // RAAN
  let raan = Math.acos(nx / n)
  if (ny < 0) raan = 2 * Math.PI - raan

  // Argument of periapsis
  let aop = Math.acos((nx * ex + ny * ey) / (n * ecc))
  if (ez < 0) aop = 2 * Math.PI - aop

  // True anomaly
  const rdotv = x * vx + y * vy + z * vz
  let trueAnomaly = Math.acos((ex * x + ey * y + ez * z) / (ecc * r))
  if (rdotv < 0) trueAnomaly = 2 * Math.PI - trueAnomaly

  return { sma, ecc, inc, raan, aop, trueAnomaly, epoch: state.epoch }
}

// ─── Orbit Classification ────────────────────────────────────────────────────

/**
 * Classify orbit type from eccentricity.
 */
export function classifyOrbit(ecc: number): OrbitType {
  if (ecc < 1e-6) return 'circular'
  if (ecc < 1.0) return 'elliptic'
  if (Math.abs(ecc - 1.0) < 1e-6) return 'parabolic'
  return 'hyperbolic'
}

// ─── Orbital Period ──────────────────────────────────────────────────────────

/**
 * Compute the orbital period for an elliptic orbit (seconds).
 */
export function orbitalPeriod(sma: number, mu: number = MU_EARTH): number {
  return 2 * Math.PI * Math.sqrt(sma ** 3 / mu)
}

// ─── Velocity at Altitude ────────────────────────────────────────────────────

/**
 * Circular orbit velocity at a given radius from the central body centre.
 */
export function circularVelocity(radius: number, mu: number = MU_EARTH): number {
  return Math.sqrt(mu / radius)
}

/**
 * Vis-viva equation: speed at radius r on an orbit with semi-major axis sma.
 */
export function visViva(r: number, sma: number, mu: number = MU_EARTH): number {
  return Math.sqrt(mu * (2 / r - 1 / sma))
}

// ─── Angle helpers ───────────────────────────────────────────────────────────

/** Wrap an angle to [0, 2π) */
export function wrap2pi(angle: number): number {
  const TWO_PI = 2 * Math.PI
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI
}

/** Convert degrees to radians */
export const deg2rad = (d: number) => d * DEG2RAD

/** Convert radians to degrees */
export const rad2deg = (r: number) => r * RAD2DEG
