import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import type { KeplerianElements } from '../../core/types.js'
import { orbitalPeriod, circularVelocity, classifyOrbit, rad2deg } from '../../core/orbit.js'
import { R_EARTH } from '../../core/constants.js'

/**
 * OrbitCard — TSX component that displays a summary card of Keplerian orbital parameters.
 *
 * @example (inside a Vue SFC)
 * ```ts
 * import { OrbitCard } from 'openunits/vue'
 * <OrbitCard :elements="myElements" />
 * ```
 */
export const OrbitCard = defineComponent({
  name: 'OrbitCard',
  props: {
    elements: {
      type: Object as PropType<KeplerianElements>,
      required: true,
    },
    label: {
      type: String,
      default: 'Orbit',
    },
  },
  setup(props) {
    const period = computed(() => orbitalPeriod(props.elements.sma))
    const vCirc = computed(() => circularVelocity(props.elements.sma))
    const orbitType = computed(() => classifyOrbit(props.elements.ecc))
    const altKm = computed(() => ((props.elements.sma - R_EARTH) / 1000).toFixed(1))
    const incDeg = computed(() => rad2deg(props.elements.inc).toFixed(2))
    const periodMin = computed(() => (period.value / 60).toFixed(2))
    const vKms = computed(() => (vCirc.value / 1000).toFixed(3))

    const rows = computed(() => [
      { label: 'Type', value: orbitType.value },
      { label: 'SMA', value: `${(props.elements.sma / 1000).toFixed(1)} km` },
      { label: 'Altitude', value: `${altKm.value} km` },
      { label: 'Eccentricity', value: props.elements.ecc.toFixed(6) },
      { label: 'Inclination', value: `${incDeg.value}°` },
      { label: 'Period', value: `${periodMin.value} min` },
      { label: 'Circ. Velocity', value: `${vKms.value} km/s` },
    ])

    return () => (
      <div class="ou-orbit-card">
        <h3 class="ou-orbit-card__label">{props.label}</h3>
        <table class="ou-orbit-card__table">
          <tbody>
            {rows.value.map((row) => (
              <tr key={row.label}>
                <td class="ou-orbit-card__key">{row.label}</td>
                <td class="ou-orbit-card__val">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
})

/**
 * HohmannCard — TSX component showing delta-V budget for a Hohmann transfer.
 */
import { hohmannTransfer } from '../../core/maneuver.js'

export const HohmannCard = defineComponent({
  name: 'HohmannCard',
  props: {
    r1: { type: Number, required: true },
    r2: { type: Number, required: true },
    label: { type: String, default: 'Hohmann Transfer' },
  },
  setup(props) {
    const result = computed(() => hohmannTransfer(props.r1, props.r2))

    return () => (
      <div class="ou-orbit-card">
        <h3 class="ou-orbit-card__label">{props.label}</h3>
        <table class="ou-orbit-card__table">
          <tbody>
            <tr><td class="ou-orbit-card__key">ΔV₁</td><td class="ou-orbit-card__val">{result.value.dv1.toFixed(2)} m/s</td></tr>
            <tr><td class="ou-orbit-card__key">ΔV₂</td><td class="ou-orbit-card__val">{result.value.dv2.toFixed(2)} m/s</td></tr>
            <tr><td class="ou-orbit-card__key">Total ΔV</td><td class="ou-orbit-card__val">{result.value.totalDv.toFixed(2)} m/s</td></tr>
            <tr><td class="ou-orbit-card__key">Transfer Time</td><td class="ou-orbit-card__val">{(result.value.transferTime / 3600).toFixed(2)} h</td></tr>
          </tbody>
        </table>
      </div>
    )
  },
})
