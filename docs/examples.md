# Examples

End-to-end code examples covering common use cases.

---

## 1. ISS Orbital Parameters

Compute and display parameters for an ISS-like orbit.

```ts
import {
  namedOrbitPreset, orbitalPeriod, circularVelocity,
  elementsToState, classifyOrbit, rad2deg, R_EARTH,
} from 'openunits'

const iss = namedOrbitPreset('LEO')

const period  = orbitalPeriod(iss.sma)
const vCirc   = circularVelocity(iss.sma)
const sv      = elementsToState(iss)
const type    = classifyOrbit(iss.ecc)

console.log('=== ISS-like Orbit ===')
console.log(`Altitude:         ${((iss.sma - R_EARTH) / 1000).toFixed(0)} km`)
console.log(`Period:           ${(period / 60).toFixed(1)} min`)
console.log(`Orbital velocity: ${(vCirc / 1000).toFixed(3)} km/s`)
console.log(`Orbit type:       ${type}`)
console.log(`Inclination:      ${rad2deg(iss.inc).toFixed(1)}°`)
console.log(`Position (km):    [${(sv.x/1000).toFixed(0)}, ${(sv.y/1000).toFixed(0)}, ${(sv.z/1000).toFixed(0)}]`)
```

**Output:**
```
=== ISS-like Orbit ===
Altitude:         400 km
Period:           92.6 min
Orbital velocity: 7.668 km/s
Orbit type:       elliptic
Inclination:      51.6°
Position (km):    [6778, 0, 0]
```

---

## 2. Full Orbit Ground Track

Generate position data for one complete orbit, suitable for plotting.

```ts
import { namedOrbitPreset, propagateSeries, orbitalPeriod } from 'openunits'

const leo = namedOrbitPreset('LEO')
const T   = orbitalPeriod(leo.sma)

// 360 points = 1 point per degree of true anomaly (approx)
const track = propagateSeries(leo, T, 360)

const groundTrack = track.map(result => ({
  t_min:  (result.epoch / 60).toFixed(2),
  x_km:   (result.state.x / 1000).toFixed(2),
  y_km:   (result.state.y / 1000).toFixed(2),
  z_km:   (result.state.z / 1000).toFixed(2),
  nu_deg: (result.elements.trueAnomaly * 180 / Math.PI).toFixed(2),
}))

// Output as CSV
console.log('t_min,x_km,y_km,z_km,nu_deg')
groundTrack.forEach(p =>
  console.log(`${p.t_min},${p.x_km},${p.y_km},${p.z_km},${p.nu_deg}`)
)
```

---

## 3. LEO → GEO Mission Plan

Compute the full ΔV budget for a transfer from LEO to geostationary orbit.

```ts
import {
  hohmannTransfer, launchDeltaV, escapeFromCircular,
  R_EARTH,
} from 'openunits'

const h_LEO = 400_000   // 400 km
const h_GEO = 35_786_000 // 35 786 km

const r1 = R_EARTH + h_LEO
const r2 = R_EARTH + h_GEO

// Phase 1: Launch to LEO
const dvLaunch = launchDeltaV(h_LEO)

// Phase 2: Hohmann LEO → GEO
const transfer = hohmannTransfer(r1, r2)

// Summary
const totalMission = dvLaunch + transfer.totalDv

console.log('=== LEO → GEO Mission ΔV Budget ===')
console.log(`Launch to LEO:       ${(dvLaunch / 1000).toFixed(2)} km/s`)
console.log(`Hohmann ΔV₁:         ${(transfer.dv1 / 1000).toFixed(3)} km/s`)
console.log(`Hohmann ΔV₂:         ${(transfer.dv2 / 1000).toFixed(3)} km/s`)
console.log(`Transfer time:       ${(transfer.transferTime / 3600).toFixed(2)} h`)
console.log(`─────────────────────────────────────`)
console.log(`Total mission ΔV:    ${(totalMission / 1000).toFixed(2)} km/s`)
```

**Output:**
```
=== LEO → GEO Mission ΔV Budget ===
Launch to LEO:       9.17 km/s
Hohmann ΔV₁:         2.424 km/s
Hohmann ΔV₂:         1.467 km/s
Transfer time:       5.26 h
─────────────────────────────────────
Total mission ΔV:    13.06 km/s
```

---

## 4. State Vector Roundtrip

Verify the elements ↔ state vector conversion precision.

```ts
import {
  namedOrbitPreset, elementsToState, stateToElements,
  rad2deg,
} from 'openunits'

const original = namedOrbitPreset('HEO')
const sv       = elementsToState(original)
const recovered = stateToElements(sv)

console.log('SMA error (m):  ', Math.abs(recovered.sma - original.sma).toExponential(2))
console.log('Ecc error:      ', Math.abs(recovered.ecc - original.ecc).toExponential(2))
console.log('Inc error (deg):', Math.abs(rad2deg(recovered.inc) - rad2deg(original.inc)).toExponential(2))
// All errors should be < 1e-8 (machine precision)
```

---

## 5. Anomaly Conversion Chain

Demonstrate the three anomaly types and their conversions.

```ts
import {
  trueToMean, meanToEccentric, eccentricToTrue,
  trueToEccentric, deg2rad, rad2deg,
} from 'openunits'

const ecc = 0.5
const nu0 = deg2rad(120)   // true anomaly = 120°

const E = trueToEccentric(nu0, ecc)
const M = trueToMean(nu0, ecc)

console.log(`True anomaly:      ${rad2deg(nu0).toFixed(4)}°`)
console.log(`Eccentric anomaly: ${rad2deg(E).toFixed(4)}°`)
console.log(`Mean anomaly:      ${rad2deg(M).toFixed(4)}°`)

// Reverse: M → E → ν
const E2  = meanToEccentric(M, ecc)
const nu1 = eccentricToTrue(E2, ecc)
console.log(`Recovered ν:       ${rad2deg(nu1).toFixed(4)}°`)
console.log(`Roundtrip error:   ${Math.abs(nu1 - nu0).toExponential(2)} rad`)
```

---

## 6. Inclination Change Cost

Show how expensive plane changes are at different orbits.

```ts
import { inclinationChange, circularVelocity, deg2rad, R_EARTH } from 'openunits'

const orbits = [
  { name: 'LEO 400 km', r: R_EARTH + 400_000 },
  { name: 'MEO 20200 km', r: R_EARTH + 20_200_000 },
  { name: 'GEO', r: 42_164_000 },
]

const deltaInc = deg2rad(28.5)  // Equatorial → ISS inclination

console.log('=== Inclination Change ΔV (28.5°) ===')
for (const orbit of orbits) {
  const v = circularVelocity(orbit.r)
  const dv = inclinationChange(v, deltaInc).total
  console.log(`${orbit.name.padEnd(16)}: ${(dv / 1000).toFixed(2)} km/s`)
}
```

**Output:**
```
=== Inclination Change ΔV (28.5°) ===
LEO 400 km      : 3.56 km/s
MEO 20200 km    : 1.45 km/s
GEO             : 0.65 km/s
```

> This demonstrates why plane changes are most efficient at high-altitude orbits where the satellite moves slower.

---

## 7. Escape from Earth Orbit

How much ΔV is needed to leave Earth's sphere of influence from various parking orbits?

```ts
import { escapeFromCircular, escapeVelocity, circularVelocity, R_EARTH } from 'openunits'

const altitudes = [200_000, 400_000, 1_000_000, 35_786_000]

console.log('=== Escape ΔV from Circular Orbit ===')
console.log('Alt (km)'.padEnd(12), 'v_circ (km/s)'.padEnd(16), 'v_esc (km/s)'.padEnd(14), 'ΔV (km/s)')

for (const alt of altitudes) {
  const r    = R_EARTH + alt
  const vC   = circularVelocity(r)
  const vEsc = escapeVelocity(r)
  const dv   = escapeFromCircular(r)
  console.log(
    `${(alt / 1000).toFixed(0)}`.padEnd(12),
    `${(vC / 1000).toFixed(3)}`.padEnd(16),
    `${(vEsc / 1000).toFixed(3)}`.padEnd(14),
    `${(dv / 1000).toFixed(3)}`
  )
}
```

---

## 8. CLI Pipeline to JSON File

Use the CLI to export propagation data to a file for processing.

```bash
# Propagate LEO every 10 minutes for 1 orbit (5554 s)
# Using a shell loop:
for t in 0 600 1200 1800 2400 3000 3600 4200 4800 5400; do
  node bin/openunits.js propagate --orbit LEO --dt $t
done | jq -s '.' > leo_track.json
```

Or use the `propagateSeries` TypeScript API and write to file directly:

```ts
import { writeFileSync } from 'fs'
import { namedOrbitPreset, propagateSeries, orbitalPeriod } from 'openunits'

const leo   = namedOrbitPreset('LEO')
const T     = orbitalPeriod(leo.sma)
const track = propagateSeries(leo, T, 100)

writeFileSync('leo_track.json', JSON.stringify(
  track.map(r => ({
    epoch: r.epoch,
    x: r.state.x, y: r.state.y, z: r.state.z,
    vx: r.state.vx, vy: r.state.vy, vz: r.state.vz,
  })),
  null, 2
))

console.log(`Wrote ${track.length} points to leo_track.json`)
```
