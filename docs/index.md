# OpenUnits Documentation

**OpenUnits** is a TypeScript orbital mechanics engine for scientific computing. It provides unit-safe APIs for orbital propagation, trajectory planning, and mission analysis — making space simulation accessible to developers, educators, and researchers.

---

## Contents

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Installation, first steps, quick examples |
| [Concepts](concepts.md) | Orbital mechanics background — elements, propagation, maneuvers |
| [CLI Reference](cli.md) | Full command-line interface documentation |
| [API: Constants](api/constants.md) | Physical and astronomical constants |
| [API: Types](api/types.md) | TypeScript interface and type reference |
| [API: Orbit](api/orbit.md) | Keplerian conversions, classification, period, velocity |
| [API: Propagator](api/propagator.md) | 2-body Keplerian propagation |
| [API: Maneuver](api/maneuver.md) | Delta-V planning, Hohmann transfers, presets |
| [Vue Integration](vue.md) | `useOrbit` composable and TSX component guide |
| [Examples](examples.md) | End-to-end code examples |

---

## Feature Overview

```
openunits
├── Core Engine (TypeScript library)
│   ├── Physical constants  (G, μ_Earth, R_Earth, μ_Sun, AU, …)
│   ├── Keplerian elements ↔ Cartesian state vectors
│   ├── Anomaly conversions (mean ↔ eccentric ↔ true)
│   ├── 2-body analytic propagation
│   ├── Hohmann transfers & inclination changes
│   ├── Orbit classification (circular/elliptic/parabolic/hyperbolic)
│   └── Named orbit presets (LEO, MEO, GEO, SSO, HEO, TLI)
│
├── CLI  (openunits <command> [options])
│   ├── info      — orbital parameters summary
│   ├── state     — elements → Cartesian state
│   ├── elements  — state → Keplerian elements
│   ├── propagate — advance orbit by Δt
│   ├── hohmann   — Hohmann transfer ΔV budget
│   ├── escape    — escape velocity
│   └── launch    — launch ΔV estimate
│
└── Vue 3 Integration  (import from 'openunits/vue')
    ├── useOrbit()  — reactive composable
    ├── <OrbitCard> — TSX parameter display component
    └── <HohmannCard> — TSX transfer ΔV component
```

---

## Quick Install

```bash
npm install openunits
# or
pnpm add openunits
```

For the CLI:

```bash
npm install -g openunits
openunits info --orbit LEO --format table
```

---

## License

GPL-3.0 © DeepcometAI
