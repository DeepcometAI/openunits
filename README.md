# openunits

**OpenUnits** is a TypeScript orbital mechanics engine for scientific computing. It offers unit-safe APIs for orbital propagation, trajectory planning, and mission analysis — making space simulation accessible to developers, educators, and researchers.

## Features

- 🪐 **2-Body Keplerian Propagation** — analytic mean-motion propagation
- 🔄 **Elements ↔ State Vector** — full transforms between Keplerian elements and Cartesian ECI
- 🚀 **Maneuver Planning** — Hohmann transfers, inclination changes, escape velocity, launch ΔV
- 🌍 **Named Orbit Presets** — LEO, MEO, GEO, SSO, HEO, TLI
- 🖥️ **CLI** — command-line interface with JSON (default) and table output
- 🧩 **Vue 3 Integration** — reactive composable `useOrbit` and TSX components
- 📦 **Dual-format** — ESM + CJS, full TypeScript types

---

## Installation

```bash
npm install openunits
# or
pnpm add openunits
```

For the CLI globally:

```bash
npm install -g openunits
```

---

## CLI Usage

JSON output is the default. Add `--format table` for human-readable output.

### Show orbit info

```bash
openunits info --orbit LEO
openunits info --orbit GEO --format table
openunits info --sma 7000000 --ecc 0.01 --inc 28.5
```

### Convert elements → state vector

```bash
openunits state --orbit LEO
openunits state --sma 7000000 --ecc 0.001 --inc 28.5 --format table
```

### Convert state vector → elements

```bash
openunits elements --x 6558137 --y 0 --z 0 --vx 0 --vy 7784 --vz 0
```

### Propagate an orbit

```bash
openunits propagate --orbit LEO --dt 3600
openunits propagate --orbit GEO --dt 86400 --format table
```

### Hohmann transfer ΔV

```bash
# Using radii
openunits hohmann --r1 6778137 --r2 42164000

# Using altitudes (--altitude adds R_Earth automatically)
openunits hohmann --r1 400000 --r2 35786000 --altitude --format table
```

### Escape velocity

```bash
openunits escape --r 6778137
openunits escape --r 400000 --altitude --format table
```

### Launch ΔV estimate

```bash
openunits launch --alt 400000 --format table
```

---

## Library Usage

```ts
import {
  namedOrbitPreset,
  elementsToState,
  propagate,
  propagateSeries,
  hohmannTransfer,
  orbitalPeriod,
  deg2rad,
  MU_EARTH,
  R_EARTH,
} from 'openunits'

// Get a named preset
const leo = namedOrbitPreset('LEO')

// Convert to state vector
const sv = elementsToState(leo)

// Propagate 1 hour forward
const result = propagate(leo, 3600)
console.log(result.state)

// Hohmann transfer LEO → GEO
const maneuver = hohmannTransfer(R_EARTH + 400_000, 42_164_000)
console.log(`Total ΔV: ${maneuver.totalDv.toFixed(0)} m/s`)
```

---

## Vue 3 Integration

```ts
import { useOrbit, OrbitCard, HohmannCard } from 'openunits/vue'
```

### `useOrbit` composable

```ts
const {
  elements,      // Ref<KeplerianElements>
  stateVector,   // ComputedRef<StateVector>
  period,        // ComputedRef<number> — seconds
  altitudeKm,   // ComputedRef<number>
  orbitType,     // ComputedRef<OrbitType>
  propagateBy,   // (dt: number) => PropagationResult
  generateSeries,// (duration, steps) => PropagationResult[]
  reset,
  updateElements,
} = useOrbit({ sma: 6_778_137, ecc: 0, inc: 0.9 })
```

### TSX Components

```tsx
// Display orbit parameters
<OrbitCard :elements="elements" label="My Orbit" />

// Display Hohmann transfer budget
<HohmannCard :r1="6778137" :r2="42164000" label="LEO → GEO" />
```

---

## API Reference

### Constants

| Symbol | Value | Description |
|--------|-------|-------------|
| `G` | 6.674×10⁻¹¹ | Gravitational constant (m³ kg⁻¹ s⁻²) |
| `MU_EARTH` | 3.986×10¹⁴ | Earth gravitational parameter (m³/s²) |
| `R_EARTH` | 6 378 137 | Earth equatorial radius (m) |
| `MU_SUN` | 1.327×10²⁰ | Sun gravitational parameter (m³/s²) |
| `AU_M` | 1.496×10¹¹ | Astronomical unit (m) |

### Core Functions

| Function | Description |
|----------|-------------|
| `elementsToState(el, μ?)` | Keplerian elements → ECI state vector |
| `stateToElements(sv, μ?)` | ECI state vector → Keplerian elements |
| `propagate(el, dt, μ?)` | Propagate orbit by dt seconds |
| `propagateSeries(el, dur, n, μ?)` | Generate time series of n+1 states |
| `propagateToEpoch(el, epoch, μ?)` | Propagate to a specific epoch |
| `orbitalPeriod(sma, μ?)` | Compute orbital period (s) |
| `circularVelocity(r, μ?)` | Circular orbit speed at radius r |
| `visViva(r, sma, μ?)` | Speed from vis-viva equation |
| `classifyOrbit(ecc)` | Returns 'circular' \| 'elliptic' \| 'parabolic' \| 'hyperbolic' |
| `hohmannTransfer(r1, r2, μ?)` | Compute Hohmann transfer ΔV |
| `escapeVelocity(r, μ?)` | Escape velocity at radius r |
| `namedOrbitPreset(name)` | Get KeplerianElements for a named orbit |

---

## License

GPL-3.0 © DeepcometAI
