/**
 * Core type definitions for the OpenUnits orbital mechanics engine.
 */

/** Cartesian state vector in 3D space (SI units: metres and m/s) */
export interface StateVector {
  /** Position x (m) */
  x: number
  /** Position y (m) */
  y: number
  /** Position z (m) */
  z: number
  /** Velocity vx (m/s) */
  vx: number
  /** Velocity vy (m/s) */
  vy: number
  /** Velocity vz (m/s) */
  vz: number
  /** Epoch (seconds past J2000 or Unix timestamp ms — user's choice) */
  epoch?: number
}

/** Classical Keplerian orbital elements */
export interface KeplerianElements {
  /** Semi-major axis (m) */
  sma: number
  /** Eccentricity (dimensionless, 0 ≤ e < 1 for elliptic) */
  ecc: number
  /** Inclination (radians) */
  inc: number
  /** Right ascension of ascending node / RAAN (radians) */
  raan: number
  /** Argument of periapsis (radians) */
  aop: number
  /** True anomaly (radians) */
  trueAnomaly: number
  /** Epoch (seconds past J2000) */
  epoch?: number
}

/** Orbit type classification */
export type OrbitType =
  | 'circular'
  | 'elliptic'
  | 'parabolic'
  | 'hyperbolic'

/** Common named Earth orbits */
export type NamedOrbit = 'LEO' | 'MEO' | 'GEO' | 'SSO' | 'HEO' | 'TLI'

/** Result of an orbital propagation step */
export interface PropagationResult {
  epoch: number
  state: StateVector
  elements: KeplerianElements
}

/** Delta-V maneuver */
export interface Maneuver {
  /** Delta-V in radial direction (m/s) */
  dvr: number
  /** Delta-V in tangential (prograde) direction (m/s) */
  dvt: number
  /** Delta-V in normal direction (m/s) */
  dvn: number
  /** Total delta-V magnitude (m/s) */
  total: number
}

/** Output format for CLI */
export type OutputFormat = 'json' | 'table'
