# API: Maneuver

Functions for delta-V calculations, transfer planning, and orbit preset management.

```ts
import {
  hohmannTransfer,
  inclinationChange,
  escapeVelocity,
  escapeFromCircular,
  launchDeltaV,
  altitudeToRadius,
  namedOrbitPreset,
} from 'openunits'
```

---

## Hohmann Transfer

### `hohmannTransfer(r1, r2, mu?)`

Compute the two-burn delta-V budget for a Hohmann transfer between two coplanar circular orbits.

```ts
function hohmannTransfer(
  r1: number,
  r2: number,
  mu?: number
): {
  dv1: number          // Burn 1 ΔV (m/s) — at periapsis of transfer ellipse
  dv2: number          // Burn 2 ΔV (m/s) — at apoapsis of transfer ellipse
  totalDv: number      // |dv1| + |dv2| (m/s)
  transferTime: number // Half-period of transfer ellipse (s)
  smaTransfer: number  // Semi-major axis of transfer ellipse (m)
}
```

| Parameter | Description |
|-----------|-------------|
| `r1` | Initial orbit radius from central body centre (m) |
| `r2` | Target orbit radius from central body centre (m) |
| `mu` | Gravitational parameter (default: `MU_EARTH`) |

**Notes:**
- Works for both raising (`r2 > r1`) and lowering (`r2 < r1`) orbits
- `dv1` is negative for orbit lowering (retrograde burn)
- Only valid for circular, coplanar orbits

**Examples:**

```ts
import { hohmannTransfer, R_EARTH } from 'openunits'

// LEO (400 km) → GEO (35 786 km)
const h = hohmannTransfer(
  R_EARTH + 400_000,
  R_EARTH + 35_786_000,
)
console.log('Total ΔV (km/s):', (h.totalDv / 1000).toFixed(2))  // → ~3.89
console.log('Transfer time (h):', (h.transferTime / 3600).toFixed(2)) // → ~5.26
```

```ts
// ISS → Higher station (800 km)
const reboost = hohmannTransfer(
  R_EARTH + 408_000,
  R_EARTH + 800_000,
)
console.log('ΔV₁ (m/s):', reboost.dv1.toFixed(1))  // ~193 m/s
console.log('ΔV₂ (m/s):', reboost.dv2.toFixed(1))  // ~185 m/s
```

---

## Inclination Change

### `inclinationChange(v, deltaInc)`

Compute delta-V for a pure in-plane inclination change at a circular orbit.

```ts
function inclinationChange(v: number, deltaInc: number): Maneuver
```

| Parameter | Description |
|-----------|-------------|
| `v` | Orbital speed at maneuver point (m/s) |
| `deltaInc` | Inclination change (radians) |

**Returns:** [`Maneuver`](types.md#maneuver) with `dvn = 2·v·sin(Δi/2)`

**Example:**

```ts
import { inclinationChange, circularVelocity, deg2rad, R_EARTH } from 'openunits'

const v = circularVelocity(R_EARTH + 400_000)        // ~7668 m/s
const maneuver = inclinationChange(v, deg2rad(5))     // 5° plane change

console.log('ΔV (m/s):', maneuver.total.toFixed(1))  // ~669 m/s
```

> ⚠️ **Warning:** Large inclination changes are very expensive. A 28.5° → 0° change at LEO costs ~3.6 km/s. Always combine with altitude changes when possible.

---

## Escape Velocity

### `escapeVelocity(radius, mu?)`

Compute the escape velocity at a given radius from the central body.

```ts
function escapeVelocity(radius: number, mu?: number): number
// v_esc = √(2μ/r)
```

**Returns:** Escape speed (m/s)

```ts
import { escapeVelocity, R_EARTH } from 'openunits'

escapeVelocity(R_EARTH) / 1000               // → ~11.19 km/s (Earth surface)
escapeVelocity(R_EARTH + 400_000) / 1000     // → ~10.85 km/s (LEO altitude)
```

> **Note:** `v_esc = √2 · v_circular` always holds: escape velocity is always √2 times the circular velocity at the same radius.

---

### `escapeFromCircular(orbitRadius, mu?)`

Compute the delta-V needed to escape from an existing circular orbit.

```ts
function escapeFromCircular(orbitRadius: number, mu?: number): number
// ΔV = v_esc − v_circular
```

```ts
import { escapeFromCircular, R_EARTH } from 'openunits'

escapeFromCircular(R_EARTH + 400_000).toFixed(0)  // → ~3196 m/s
```

---

## Launch Delta-V

### `launchDeltaV(targetAltitude, mu?, rBody?)`

Estimate total delta-V needed to launch to a circular orbit from the planet's surface. Includes a typical gravity + drag loss estimate of ~1.5 km/s.

```ts
function launchDeltaV(
  targetAltitude: number,
  mu?: number,
  rBody?: number
): number
```

| Parameter | Description |
|-----------|-------------|
| `targetAltitude` | Target altitude above the surface (m) |
| `mu` | Gravitational parameter (default: `MU_EARTH`) |
| `rBody` | Planet radius (default: `R_EARTH`) |

**Returns:** Estimated launch ΔV (m/s)

```ts
import { launchDeltaV } from 'openunits'

(launchDeltaV(400_000) / 1000).toFixed(2)  // → ~9.17 km/s
```

> **Note:** This is a simplified estimate. Real vehicles also benefit from Earth's rotation (~0.37–0.46 km/s eastward velocity at launch sites).

---

## Orbit Utilities

### `altitudeToRadius(altitude, rBody?)`

Convert altitude above a body's surface to radius from its centre.

```ts
function altitudeToRadius(altitude: number, rBody?: number): number
// r = R_body + altitude
```

```ts
import { altitudeToRadius, R_EARTH } from 'openunits'

altitudeToRadius(400_000)           // → 6_778_137 m
altitudeToRadius(400_000) === R_EARTH + 400_000  // true
```

---

### `namedOrbitPreset(name)`

Get `KeplerianElements` for a common Earth orbit.

```ts
function namedOrbitPreset(name: string): KeplerianElements
```

Supported names (case-insensitive): `LEO`, `MEO`, `GEO`, `SSO`, `HEO`, `TLI`

| Preset | SMA | Ecc | Inc |
|--------|-----|-----|-----|
| LEO | R⊕ + 400 km | 0.001 | 51.6° |
| MEO | R⊕ + 20 200 km | 0.001 | 55° |
| GEO | 42 164 km | 0 | 0° |
| SSO | R⊕ + 600 km | 0.001 | ~97° |
| HEO | ~500–39 000 km | 0.74 | 63.4° |
| TLI | 323 000 km | 0.97 | 28.6° |

```ts
const leo = namedOrbitPreset('LEO')
const geo = namedOrbitPreset('geo')  // case-insensitive
namedOrbitPreset('XXXX')             // throws Error
```
