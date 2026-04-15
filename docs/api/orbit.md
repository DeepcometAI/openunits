# API: Orbit

Core orbital mechanics functions — anomaly conversions, element/state transforms, classification, and velocity calculations.

```ts
import {
  meanToEccentric, eccentricToTrue, trueToEccentric, trueToMean,
  elementsToState, stateToElements,
  classifyOrbit, orbitalPeriod, circularVelocity, visViva,
  wrap2pi, deg2rad, rad2deg,
} from 'openunits'
```

---

## Anomaly Conversions

### `meanToEccentric(M, ecc, tol?)`

Solve Kepler's equation for eccentric anomaly using Newton-Raphson iteration.

```ts
function meanToEccentric(M: number, ecc: number, tol?: number): number
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `M` | `number` | Mean anomaly (radians) |
| `ecc` | `number` | Eccentricity |
| `tol` | `number` | Convergence tolerance (default `1e-10`) |

**Returns:** Eccentric anomaly E (radians)

```ts
const E = meanToEccentric(Math.PI / 4, 0.3)
```

---

### `eccentricToTrue(E, ecc)`

Convert eccentric anomaly to true anomaly.

```ts
function eccentricToTrue(E: number, ecc: number): number
```

**Returns:** True anomaly ν (radians)

---

### `trueToEccentric(nu, ecc)`

Convert true anomaly to eccentric anomaly.

```ts
function trueToEccentric(nu: number, ecc: number): number
```

**Returns:** Eccentric anomaly E (radians)

---

### `trueToMean(nu, ecc)`

Convert true anomaly to mean anomaly via Kepler's equation.

```ts
function trueToMean(nu: number, ecc: number): number
```

**Returns:** Mean anomaly M (radians)

**Roundtrip example:**
```ts
const nu0 = deg2rad(45)
const ecc  = 0.3
const M    = trueToMean(nu0, ecc)
const E    = meanToEccentric(M, ecc)
const nu1  = eccentricToTrue(E, ecc)
// nu1 ≈ nu0
```

---

## State Conversions

### `elementsToState(elements, mu?)`

Convert Keplerian elements to a Cartesian ECI state vector.

```ts
function elementsToState(
  elements: KeplerianElements,
  mu?: number   // default: MU_EARTH
): StateVector
```

The conversion goes through the perifocal frame and applies the 3-rotation matrix (Ω, i, ω) to arrive at ECI coordinates.

**Example:**
```ts
import { namedOrbitPreset, elementsToState } from 'openunits'

const leo = namedOrbitPreset('LEO')
const sv  = elementsToState(leo)

console.log(`r = ${(Math.sqrt(sv.x**2 + sv.y**2 + sv.z**2)/1000).toFixed(1)} km`)
// → 6778.1 km
```

---

### `stateToElements(state, mu?)`

Convert a Cartesian ECI state vector to Keplerian elements.

```ts
function stateToElements(
  state: StateVector,
  mu?: number   // default: MU_EARTH
): KeplerianElements
```

Uses the angular momentum vector, node vector, and eccentricity vector to recover all 6 classical elements.

**Example:**
```ts
import { stateToElements, rad2deg } from 'openunits'

const el = stateToElements({
  x: 6_778_137, y: 0, z: 0,
  vx: 0, vy: 7_668.56, vz: 0,
})

console.log('SMA (km):', el.sma / 1000)      // → 6778.1
console.log('Inc (deg):', rad2deg(el.inc))    // → 0
console.log('Ecc:', el.ecc.toFixed(6))        // → ~0
```

> **Tip:** `elementsToState` → `stateToElements` is a roundtrip. Floating-point differences will be at machine-epsilon level.

---

## Orbit Classification

### `classifyOrbit(ecc)`

Classify an orbit by eccentricity.

```ts
function classifyOrbit(ecc: number): OrbitType
// returns: 'circular' | 'elliptic' | 'parabolic' | 'hyperbolic'
```

| Condition | Returns |
|-----------|---------|
| `ecc < 1e-6` | `'circular'` |
| `0 < ecc < 1` | `'elliptic'` |
| `\|ecc − 1\| < 1e-6` | `'parabolic'` |
| `ecc > 1` | `'hyperbolic'` |

```ts
classifyOrbit(0)     // 'circular'
classifyOrbit(0.3)   // 'elliptic'
classifyOrbit(1.0)   // 'parabolic'
classifyOrbit(2.5)   // 'hyperbolic'
```

---

## Orbital Period

### `orbitalPeriod(sma, mu?)`

Compute the orbital period using Kepler's third law.

```ts
function orbitalPeriod(sma: number, mu?: number): number
// T = 2π √(a³/μ)
```

**Returns:** Period T (seconds)

```ts
import { orbitalPeriod, R_EARTH } from 'openunits'

orbitalPeriod(R_EARTH + 400_000) / 60   // → ~92.6 minutes (LEO)
orbitalPeriod(42_164_000) / 3600        // → ~23.93 hours (GEO)
```

---

## Velocities

### `circularVelocity(radius, mu?)`

Speed required to maintain a circular orbit at a given radius.

```ts
function circularVelocity(radius: number, mu?: number): number
// v = √(μ/r)
```

**Returns:** speed (m/s)

```ts
circularVelocity(R_EARTH + 400_000) / 1000  // → ~7.67 km/s
circularVelocity(42_164_000) / 1000         // → ~3.07 km/s
```

---

### `visViva(r, sma, mu?)`

Compute orbital speed at radius `r` on an orbit with semi-major axis `sma` (vis-viva equation).

```ts
function visViva(r: number, sma: number, mu?: number): number
// v = √(μ · (2/r − 1/a))
```

```ts
// Speed at periapsis of a transfer ellipse (LEO → GEO Hohmann)
const r_peri = R_EARTH + 400_000
const sma_transfer = (r_peri + 42_164_000) / 2
const v_peri = visViva(r_peri, sma_transfer)   // ~10.09 km/s
```

---

## Angle Utilities

### `wrap2pi(angle)`

Wrap an angle to the range [0, 2π).

```ts
function wrap2pi(angle: number): number
```

```ts
wrap2pi(-Math.PI)       // → Math.PI
wrap2pi(3 * Math.PI)    // → Math.PI
wrap2pi(1.5)            // → 1.5
```

### `deg2rad(degrees)`

```ts
const deg2rad = (d: number) => d * DEG2RAD
```

### `rad2deg(radians)`

```ts
const rad2deg = (r: number) => r * RAD2DEG
```
