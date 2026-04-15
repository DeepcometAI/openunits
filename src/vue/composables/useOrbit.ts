import { ref, computed, type Ref } from 'vue'
import type { KeplerianElements, PropagationResult, StateVector } from '../../core/types.js'
import { elementsToState, stateToElements, orbitalPeriod, circularVelocity, classifyOrbit, rad2deg } from '../../core/orbit.js'
import { propagate, propagateSeries } from '../../core/propagator.js'
import { MU_EARTH } from '../../core/constants.js'

/**
 * Vue composable for working with a Keplerian orbit.
 * Provides reactive state, propagation, and derived orbital parameters.
 *
 * @example
 * ```ts
 * const { elements, stateVector, period, propagateBy } = useOrbit(initialElements)
 * ```
 */
export function useOrbit(
  initialElements?: Partial<KeplerianElements>,
  mu: number = MU_EARTH,
) {
  const defaultElements: KeplerianElements = {
    sma: 6_778_137,
    ecc: 0,
    inc: 0,
    raan: 0,
    aop: 0,
    trueAnomaly: 0,
    epoch: 0,
    ...initialElements,
  }

  const elements: Ref<KeplerianElements> = ref({ ...defaultElements })
  const history: Ref<PropagationResult[]> = ref([])

  const stateVector = computed<StateVector>(() =>
    elementsToState(elements.value, mu),
  )

  const period = computed<number>(() =>
    orbitalPeriod(elements.value.sma, mu),
  )

  const orbitType = computed(() =>
    classifyOrbit(elements.value.ecc),
  )

  const circVelocity = computed<number>(() =>
    circularVelocity(elements.value.sma, mu),
  )

  const inclinationDeg = computed(() => rad2deg(elements.value.inc))
  const raanDeg = computed(() => rad2deg(elements.value.raan))
  const aopDeg = computed(() => rad2deg(elements.value.aop))
  const trueAnomalyDeg = computed(() => rad2deg(elements.value.trueAnomaly))
  const altitudeKm = computed(() => (elements.value.sma - 6_378_137) / 1000)

  /**
   * Propagate the orbit forward by dt seconds.
   */
  function propagateBy(dt: number): PropagationResult {
    const result = propagate(elements.value, dt, mu)
    elements.value = result.elements
    history.value.push(result)
    return result
  }

  /**
   * Generate a time series over the given duration.
   */
  function generateSeries(duration: number, steps: number): PropagationResult[] {
    return propagateSeries(elements.value, duration, steps, mu)
  }

  /**
   * Reset elements to initial values.
   */
  function reset() {
    elements.value = { ...defaultElements }
    history.value = []
  }

  /**
   * Update orbital elements with partial override.
   */
  function updateElements(patch: Partial<KeplerianElements>) {
    elements.value = { ...elements.value, ...patch }
  }

  /**
   * Compute Keplerian elements from a given state vector.
   */
  function fromStateVector(sv: StateVector) {
    elements.value = stateToElements(sv, mu)
  }

  return {
    elements,
    stateVector,
    history,
    period,
    orbitType,
    circVelocity,
    inclinationDeg,
    raanDeg,
    aopDeg,
    trueAnomalyDeg,
    altitudeKm,
    propagateBy,
    generateSeries,
    reset,
    updateElements,
    fromStateVector,
  }
}
