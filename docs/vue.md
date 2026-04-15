# Vue Integration

OpenUnits ships a `openunits/vue` sub-package with a reactive composable and TSX components for use in Vue 3 apps.

```ts
import { useOrbit, OrbitCard, HohmannCard } from 'openunits/vue'
```

Vue is a **peer dependency** — install it in your project separately:

```bash
pnpm add vue openunits
```

---

## `useOrbit(initialElements?, mu?)` Composable

A reactive wrapper around the orbital engine. Call it inside a Vue `setup()` or `<script setup>` block.

```ts
function useOrbit(
  initialElements?: Partial<KeplerianElements>,
  mu?: number
): UseOrbitReturn
```

### Return Values

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `elements` | `Ref<KeplerianElements>` | Reactive current elements |
| `stateVector` | `ComputedRef<StateVector>` | ECI state, recomputed on element change |
| `history` | `Ref<PropagationResult[]>` | Log of all propagation steps |
| `period` | `ComputedRef<number>` | Orbital period (s) |
| `orbitType` | `ComputedRef<OrbitType>` | `'circular'` \| `'elliptic'` \| … |
| `circVelocity` | `ComputedRef<number>` | Circular velocity at SMA (m/s) |
| `altitudeKm` | `ComputedRef<number>` | Altitude above Earth surface (km) |
| `inclinationDeg` | `ComputedRef<number>` | Inclination in degrees |
| `raanDeg` | `ComputedRef<number>` | RAAN in degrees |
| `aopDeg` | `ComputedRef<number>` | AoP in degrees |
| `trueAnomalyDeg` | `ComputedRef<number>` | True anomaly in degrees |
| `propagateBy(dt)` | `(dt: number) => PropagationResult` | Advance state by dt seconds |
| `generateSeries(dur, steps)` | `(d, s) => PropagationResult[]` | Generate time series |
| `reset()` | `() => void` | Reset to initial elements |
| `updateElements(patch)` | `(patch) => void` | Partial-update elements |
| `fromStateVector(sv)` | `(sv: StateVector) => void` | Set elements from a state vector |

---

### Basic Usage

```vue
<script setup lang="ts">
import { useOrbit } from 'openunits/vue'
import { deg2rad } from 'openunits'

const {
  elements,
  stateVector,
  altitudeKm,
  period,
  orbitType,
  trueAnomalyDeg,
  propagateBy,
  reset,
} = useOrbit({
  sma: 6_778_137,
  ecc: 0.001,
  inc: deg2rad(51.6),
})
</script>

<template>
  <div>
    <p>Altitude: {{ altitudeKm.toFixed(1) }} km</p>
    <p>Period: {{ (period / 60).toFixed(1) }} min</p>
    <p>Type: {{ orbitType }}</p>
    <p>True Anomaly: {{ trueAnomalyDeg.toFixed(2) }}°</p>

    <button @click="propagateBy(60)">+1 min</button>
    <button @click="reset()">Reset</button>
  </div>
</template>
```

---

### Simulation Loop

```vue
<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useOrbit } from 'openunits/vue'
import { namedOrbitPreset } from 'openunits'

const { trueAnomalyDeg, altitudeKm, propagateBy } = useOrbit(namedOrbitPreset('LEO'))

const running = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function start() {
  running.value = true
  timer = setInterval(() => propagateBy(10), 100)  // 10s per 100ms = 100× speed
}

function stop() {
  running.value = false
  if (timer) clearInterval(timer)
}

onUnmounted(stop)
</script>
```

---

### Updating Elements

```ts
const { updateElements, elements } = useOrbit()

// Raise altitude
updateElements({ sma: elements.value.sma + 50_000 })

// Change inclination
updateElements({ inc: deg2rad(28.5) })

// Set from a state vector (e.g. from telemetry)
fromStateVector({ x: ..., y: ..., z: ..., vx: ..., vy: ..., vz: ... })
```

---

### Generating a Track for Visualization

```ts
const { generateSeries } = useOrbit(namedOrbitPreset('LEO'))
import { orbitalPeriod } from 'openunits'

// One full orbit, 360 points
const period = orbitalPeriod(6_778_137)
const track = generateSeries(period, 360)

const positions = track.map(r => [r.state.x, r.state.y, r.state.z])
// Use with Three.js, D3, Cesium, etc.
```

---

## TSX Components

### `<OrbitCard>`

Displays a summary card of key orbital parameters.

```tsx
import { OrbitCard } from 'openunits/vue'

<OrbitCard :elements="elements" label="My Orbit" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `elements` | `KeplerianElements` | required | Elements to display |
| `label` | `string` | `'Orbit'` | Card heading |

**Displays:** Type, SMA (km), Altitude (km), Eccentricity, Inclination (°), Period (min), Circular Velocity (km/s)

---

### `<HohmannCard>`

Displays the delta-V budget for a Hohmann transfer.

```tsx
import { HohmannCard } from 'openunits/vue'

<HohmannCard :r1="6778137" :r2="42164000" label="LEO → GEO" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `r1` | `number` | required | Initial orbit radius (m) |
| `r2` | `number` | required | Target orbit radius (m) |
| `label` | `string` | `'Hohmann Transfer'` | Card heading |

**Displays:** ΔV₁, ΔV₂, Total ΔV, Transfer Time

---

### Styling Components

Both components emit class names you can target with CSS:

```css
.ou-orbit-card { /* Card container */ }
.ou-orbit-card__label { /* H3 heading */ }
.ou-orbit-card__table { /* Data table */ }
.ou-orbit-card__key { /* Left column (parameter name) */ }
.ou-orbit-card__val { /* Right column (value) */ }
```

**Example override:**
```css
.ou-orbit-card {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  color: #c9d1d9;
}
.ou-orbit-card__label {
  color: #58a6ff;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.ou-orbit-card__key { color: #8b949e; }
.ou-orbit-card__val { color: #e6edf3; font-weight: 500; }
```

---

## Full Example: Mission Dashboard SFC

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useOrbit, OrbitCard, HohmannCard } from 'openunits/vue'
import { namedOrbitPreset, R_EARTH } from 'openunits'

const { elements, altitudeKm, period, propagateBy, reset } = useOrbit(
  namedOrbitPreset('LEO')
)

const geoRadius = 42_164_000
const currentRadius = computed(() => elements.value.sma)
</script>

<template>
  <div class="mission-panel">
    <OrbitCard :elements="elements" label="Current Orbit" />

    <div class="controls">
      <button @click="propagateBy(60)">+1 min</button>
      <button @click="propagateBy(period)">+1 orbit</button>
      <button @click="reset()">Reset</button>
    </div>

    <HohmannCard
      :r1="currentRadius"
      :r2="geoRadius"
      label="Transfer to GEO"
    />
  </div>
</template>
```
