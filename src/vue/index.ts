/**
 * openunits/vue — Vue 3 composables and TSX components
 *
 * Install as a Vue plugin or import individually.
 *
 * @example
 * ```ts
 * import { useOrbit, OrbitCard, HohmannCard } from 'openunits/vue'
 * ```
 */

// Composables
export { useOrbit } from './composables/useOrbit.js'

// TSX Components
export { OrbitCard, HohmannCard } from './components/OrbitCard.js'

// Re-export core types for convenience
export type {
  KeplerianElements,
  StateVector,
  PropagationResult,
  OrbitType,
} from '../core/types.js'
