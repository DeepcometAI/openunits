import { MU_EARTH } from './constants.js'
import { elementsToState, meanToEccentric, eccentricToTrue, trueToMean } from './orbit.js'
import type { KeplerianElements, PropagationResult } from './types.js'

/**
 * Propagate a Keplerian orbit forward by `dt` seconds.
 * Uses the analytic 2-body solution (mean motion propagation).
 *
 * @param elements - Initial Keplerian elements at epoch
 * @param dt - Time step (seconds)
 * @param mu - Gravitational parameter (m^3/s^2)
 */
export function propagate(
  elements: KeplerianElements,
  dt: number,
  mu: number = MU_EARTH,
): PropagationResult {
  const { sma, ecc } = elements

  // Mean motion (rad/s)
  const n = Math.sqrt(mu / sma ** 3)

  // Initial mean anomaly from true anomaly
  const M0 = trueToMean(elements.trueAnomaly, ecc)

  // Propagated mean anomaly
  const M = M0 + n * dt

  // Eccentric anomaly
  const E = meanToEccentric(M, ecc)

  // True anomaly at new epoch
  const trueAnomaly = eccentricToTrue(E, ecc)

  const newElements: KeplerianElements = {
    ...elements,
    trueAnomaly,
    epoch: (elements.epoch ?? 0) + dt,
  }

  const state = elementsToState(newElements, mu)

  return {
    epoch: newElements.epoch ?? dt,
    state,
    elements: newElements,
  }
}

/**
 * Generate a time series of propagation results.
 *
 * @param elements - Initial Keplerian elements
 * @param duration - Total duration (seconds)
 * @param steps - Number of time steps
 * @param mu - Gravitational parameter
 */
export function propagateSeries(
  elements: KeplerianElements,
  duration: number,
  steps: number,
  mu: number = MU_EARTH,
): PropagationResult[] {
  const dt = duration / steps
  const results: PropagationResult[] = []
  for (let i = 0; i <= steps; i++) {
    results.push(propagate(elements, i * dt, mu))
  }
  return results
}

/**
 * Find the state at a specific epoch by propagating from initial elements.
 * Assumes elements.epoch is the reference time.
 *
 * @param elements - Initial Keplerian elements with epoch set
 * @param targetEpoch - Target epoch (same units as elements.epoch)
 * @param mu - Gravitational parameter
 */
export function propagateToEpoch(
  elements: KeplerianElements,
  targetEpoch: number,
  mu: number = MU_EARTH,
): PropagationResult {
  const dt = targetEpoch - (elements.epoch ?? 0)
  return propagate(elements, dt, mu)
}
