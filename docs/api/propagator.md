# API: Propagator

The propagator advances a Keplerian orbit forward in time using the analytic two-body solution — no numerical integration required.

```ts
import { propagate, propagateSeries, propagateToEpoch } from 'openunits'
```

---

## How It Works

The analytic propagation works by:

1. Converting the initial **true anomaly** → **mean anomaly** (M₀)
2. Advancing mean anomaly by mean motion × time: `M = M₀ + n·Δt`
3. Solving Kepler's equation (Newton-Raphson) to get **eccentric anomaly** E
4. Converting E back to **true anomaly**
5. Calling `elementsToState` to produce the new Cartesian state

This is exact for the ideal two-body problem. No errors accumulate with time steps.

---

## `propagate(elements, dt, mu?)`

Propagate an orbit forward by `dt` seconds.

```ts
function propagate(
  elements: KeplerianElements,
  dt: number,
  mu?: number   // default: MU_EARTH
): PropagationResult
```

| Parameter | Description |
|-----------|-------------|
| `elements` | Initial Keplerian elements (with optional `epoch`) |
| `dt` | Time step in seconds (can be negative to propagate backwards) |
| `mu` | Gravitational parameter; defaults to Earth |

**Returns:** [`PropagationResult`](types.md#propagationresult) — `{ epoch, state, elements }`

**Examples:**

```ts
import { namedOrbitPreset, propagate, rad2deg } from 'openunits'

const leo = namedOrbitPreset('LEO')

// Propagate 1 hour
const result = propagate(leo, 3600)
console.log('True anomaly (deg):', rad2deg(result.elements.trueAnomaly).toFixed(2))
console.log('State vector x (km):', (result.state.x / 1000).toFixed(1))

// Propagate backwards
const previous = propagate(leo, -1800)
```

```ts
// Propagate one full orbit
import { orbitalPeriod } from 'openunits'
const T = orbitalPeriod(leo.sma)
const oneOrbit = propagate(leo, T)
// wrap2pi(oneOrbit.elements.trueAnomaly) ≈ leo.trueAnomaly
```

```ts
// Use a non-Earth central body (Mars)
const MU_MARS = 4.282_84e13  // m³/s²
const marsOrbit = propagate(marsElements, 3600, MU_MARS)
```

---

## `propagateSeries(elements, duration, steps, mu?)`

Generate a time series of equally-spaced propagation results.

```ts
function propagateSeries(
  elements: KeplerianElements,
  duration: number,
  steps: number,
  mu?: number
): PropagationResult[]
```

| Parameter | Description |
|-----------|-------------|
| `duration` | Total time span (seconds) |
| `steps` | Number of intervals (returns `steps + 1` results) |
| `mu` | Gravitational parameter |

**Returns:** Array of `PropagationResult`, from epoch 0 to `duration`

**Examples:**

```ts
import { namedOrbitPreset, propagateSeries, orbitalPeriod } from 'openunits'

const leo = namedOrbitPreset('LEO')
const T   = orbitalPeriod(leo.sma)

// 1 full orbit, 100 steps
const track = propagateSeries(leo, T, 100)

// Extract ground track data
const positions = track.map(r => ({
  t: r.epoch,
  x: r.state.x,
  y: r.state.y,
  z: r.state.z,
}))
```

```ts
// 24-hour GEO track, 1-minute resolution
const geo = namedOrbitPreset('GEO')
const geoTrack = propagateSeries(geo, 86400, 1440)
```

---

## `propagateToEpoch(elements, targetEpoch, mu?)`

Propagate from `elements.epoch` to a specific target epoch.

```ts
function propagateToEpoch(
  elements: KeplerianElements,
  targetEpoch: number,
  mu?: number
): PropagationResult
```

| Parameter | Description |
|-----------|-------------|
| `elements` | Elements with `epoch` set to the reference time |
| `targetEpoch` | Desired epoch (same units as `elements.epoch`) |

**Example:**

```ts
// Set epoch = 0 (reference time)
const leo = { ...namedOrbitPreset('LEO'), epoch: 0 }

// Find state at t = 2 hours
const atT2h = propagateToEpoch(leo, 7200)
console.log('Epoch:', atT2h.epoch)  // 7200
```

---

## Performance Notes

- All propagation is **analytic** (no numerical integration) — extremely fast even for long durations.
- No error accumulates: propagating 1 year forward gives the same result as propagating 365 × 24 × 3600 separate 1-second steps would in an ideal model.
- `propagateSeries` calls `propagate` independently for each step — they are not chained.
- For high-fidelity propagation requiring perturbations (J2, drag, SRP), a numerical propagator is needed (planned for a future release).

---

## Working with Epochs

The `epoch` field is in seconds and is user-defined — OpenUnits does not enforce a particular time standard. Common conventions:

| Convention | Description |
|------------|-------------|
| **0-based** | Set initial `epoch: 0`, treat all results as seconds-since-start |
| **J2000** | Seconds since 2000-01-01 12:00:00 TT |
| **Unix ms** | Divide Unix timestamp by 1000 for seconds |

```ts
// J2000 epoch example
const j2000Unix = Date.UTC(2000, 0, 1, 12, 0, 0) / 1000  // 946728000 s
const elements = { ...namedOrbitPreset('LEO'), epoch: j2000Unix }

// Propagate to "now"
const nowEpoch = Date.now() / 1000
const current = propagateToEpoch(elements, nowEpoch)
```
