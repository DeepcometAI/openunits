# Getting Started

## Installation

### As a library

```bash
npm install openunits
# or
pnpm add openunits
# or
yarn add openunits
```

### As a global CLI

```bash
npm install -g openunits
```

### Requirements

- Node.js ≥ 18
- TypeScript ≥ 5 (for type-aware usage)
- Vue ≥ 3 (optional — only needed for the `openunits/vue` sub-package)

---

## Your First Calculation

### Get orbital parameters for a Low Earth Orbit

```ts
import { namedOrbitPreset, orbitalPeriod, circularVelocity, R_EARTH } from 'openunits'

const leo = namedOrbitPreset('LEO')

console.log('Semi-major axis (km):', leo.sma / 1000)
// → 6778.137

console.log('Orbital period (min):', orbitalPeriod(leo.sma) / 60)
// → ~92.6

console.log('Circular velocity (km/s):', circularVelocity(leo.sma) / 1000)
// → ~7.67
```

### Convert to a Cartesian state vector

```ts
import { namedOrbitPreset, elementsToState } from 'openunits'

const leo = namedOrbitPreset('LEO')
const sv = elementsToState(leo)

console.log(`Position: [${sv.x.toFixed(0)}, ${sv.y.toFixed(0)}, ${sv.z.toFixed(0)}] m`)
console.log(`Velocity: [${sv.vx.toFixed(2)}, ${sv.vy.toFixed(2)}, ${sv.vz.toFixed(2)}] m/s`)
```

### Propagate 1 hour forward

```ts
import { namedOrbitPreset, propagate, rad2deg } from 'openunits'

const leo = namedOrbitPreset('LEO')
const result = propagate(leo, 3600) // 3600 seconds = 1 hour

console.log('True anomaly after 1h (deg):', rad2deg(result.elements.trueAnomaly).toFixed(2))
console.log('New state vector:', result.state)
```

### Plan a Hohmann transfer (LEO → GEO)

```ts
import { hohmannTransfer, R_EARTH } from 'openunits'

const r1 = R_EARTH + 400_000   // LEO: 400 km altitude
const r2 = 42_164_000           // GEO radius

const transfer = hohmannTransfer(r1, r2)

console.log('ΔV₁ (m/s):          ', transfer.dv1.toFixed(1))   // ~2424 m/s
console.log('ΔV₂ (m/s):          ', transfer.dv2.toFixed(1))   // ~1468 m/s
console.log('Total ΔV (m/s):     ', transfer.totalDv.toFixed(1)) // ~3892 m/s
console.log('Transfer time (h):  ', (transfer.transferTime / 3600).toFixed(2)) // ~5.26 h
```

---

## CLI Quick Start

After building (`pnpm build`) or installing globally:

```bash
# Orbit summary in a table
node bin/openunits.js info --orbit LEO --format table

# Hohmann transfer
node bin/openunits.js hohmann --r1 400000 --r2 35786000 --altitude --format table

# Propagate GEO 24 hours
node bin/openunits.js propagate --orbit GEO --dt 86400
```

---

## Vue 3 Quick Start

```ts
// In a Vue SFC or setup()
import { useOrbit } from 'openunits/vue'

const {
  elements,
  stateVector,
  period,
  altitudeKm,
  propagateBy,
} = useOrbit({ sma: 6_778_137, ecc: 0.001, inc: 0.9 })

// Advance 1 orbit
propagateBy(period.value)
```

```tsx
// Render in a TSX component
import { OrbitCard, HohmannCard } from 'openunits/vue'

<OrbitCard :elements="elements" label="My LEO Orbit" />
<HohmannCard :r1="6778137" :r2="42164000" label="LEO → GEO" />
```

---

## Next Steps

- [Concepts](concepts.md) — understand orbital mechanics terminology
- [CLI Reference](cli.md) — explore all CLI commands
- [API Reference](api/orbit.md) — explore the full TypeScript API
- [Examples](examples.md) — more complete usage scenarios
