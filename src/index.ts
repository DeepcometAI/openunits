/**
 * openunits — TypeScript orbital mechanics engine
 *
 * Main library entry point. Re-exports the core engine.
 */

// Constants
export * from './core/constants.js'

// Types
export type {
  StateVector,
  KeplerianElements,
  OrbitType,
  NamedOrbit,
  PropagationResult,
  Maneuver,
  OutputFormat,
} from './core/types.js'

// Orbital mechanics (conversions, classification, etc.)
export {
  meanToEccentric,
  eccentricToTrue,
  trueToEccentric,
  trueToMean,
  elementsToState,
  stateToElements,
  classifyOrbit,
  orbitalPeriod,
  circularVelocity,
  visViva,
  wrap2pi,
  deg2rad,
  rad2deg,
} from './core/orbit.js'

// 2-Body Keplerian Propagator
export {
  propagate,
  propagateSeries,
  propagateToEpoch,
} from './core/propagator.js'

// Maneuver planning
export {
  hohmannTransfer,
  inclinationChange,
  escapeVelocity,
  escapeFromCircular,
  launchDeltaV,
  altitudeToRadius,
  namedOrbitPreset,
} from './core/maneuver.js'
