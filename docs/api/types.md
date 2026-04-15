# API: Types

All types are importable directly:

```ts
import type {
  StateVector, KeplerianElements, OrbitType,
  NamedOrbit, PropagationResult, Maneuver, OutputFormat,
} from 'openunits'
```

---

## `StateVector`

Cartesian state in ECI (Earth-Centered Inertial) frame.

```ts
interface StateVector {
  x: number    // Position x (m)
  y: number    // Position y (m)
  z: number    // Position z (m)
  vx: number   // Velocity x (m/s)
  vy: number   // Velocity y (m/s)
  vz: number   // Velocity z (m/s)
  epoch?: number // Optional epoch (s, user-defined reference)
}
```

**Example:**
```ts
const sv: StateVector = {
  x: 6_778_137, y: 0, z: 0,
  vx: 0, vy: 7_668.56, vz: 0,
  epoch: 0,
}
```

---

## `KeplerianElements`

Classical orbital elements. All angles in **radians**.

```ts
interface KeplerianElements {
  sma: number           // Semi-major axis (m)
  ecc: number           // Eccentricity (dimensionless)
  inc: number           // Inclination (radians)
  raan: number          // Right ascension of ascending node (radians)
  aop: number           // Argument of periapsis (radians)
  trueAnomaly: number   // True anomaly (radians)
  epoch?: number        // Optional epoch (seconds)
}
```

**Example:**
```ts
import { deg2rad } from 'openunits'

const leo: KeplerianElements = {
  sma: 6_778_137,       // 400 km altitude
  ecc: 0.001,
  inc: deg2rad(51.6),   // ISS inclination
  raan: 0,
  aop: 0,
  trueAnomaly: 0,
  epoch: 0,
}
```

> **Important:** All angles are in **radians** internally. Use `deg2rad()` to convert from degrees before constructing elements.

---

## `OrbitType`

Classification of the orbit by eccentricity.

```ts
type OrbitType = 'circular' | 'elliptic' | 'parabolic' | 'hyperbolic'
```

| Value | Condition | Description |
|-------|-----------|-------------|
| `'circular'` | e < 1×10⁻⁶ | Effectively circular |
| `'elliptic'` | 0 < e < 1 | Bound elliptic orbit |
| `'parabolic'` | e ≈ 1 | Escape trajectory (borderline) |
| `'hyperbolic'` | e > 1 | Unbound flyby trajectory |

---

## `NamedOrbit`

String union of supported named orbit presets.

```ts
type NamedOrbit = 'LEO' | 'MEO' | 'GEO' | 'SSO' | 'HEO' | 'TLI'
```

Used with `namedOrbitPreset()`.

---

## `PropagationResult`

The result returned by `propagate()` and `propagateSeries()`.

```ts
interface PropagationResult {
  epoch: number               // Epoch at this step (s)
  state: StateVector          // Cartesian ECI state at epoch
  elements: KeplerianElements // Keplerian elements at epoch
}
```

---

## `Maneuver`

Delta-V vector expressed in RTN (radial-tangential-normal) coordinates.

```ts
interface Maneuver {
  dvr: number    // Radial component (m/s)
  dvt: number    // Tangential/prograde component (m/s)
  dvn: number    // Normal/out-of-plane component (m/s)
  total: number  // Total ΔV magnitude (m/s)
}
```

---

## `OutputFormat`

Used by the CLI to determine output rendering.

```ts
type OutputFormat = 'json' | 'table'
```
