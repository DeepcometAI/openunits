# Orbital Mechanics Concepts

This page explains the physics and terminology used throughout OpenUnits. No prior astrodynamics experience is required.

---

## The Two-Body Problem

OpenUnits models orbits using the **two-body problem**: a small body (satellite) orbiting a much larger central body (Earth, Sun, etc.) under gravity alone. The gravitational attraction between them is:

```
F = G · m₁ · m₂ / r²
```

where `G` is the gravitational constant, `m₁` and `m₂` are the masses, and `r` is their separation.

Under these assumptions the orbit is a **conic section** — an ellipse, circle, parabola, or hyperbola — that is fixed in inertial space.

> **Limitation**: Real orbits are perturbed by Earth's oblateness (J₂), atmospheric drag, solar radiation pressure, and third-body gravity. OpenUnits v0.1 uses the ideal two-body model. Perturbations are planned for a future release.

---

## Keplerian Elements

Instead of storing position and velocity (6 numbers that change every second), Keplerian elements describe the shape and orientation of the orbit — they are constant for an ideal two-body orbit.

### The 6 Classical Elements

| Symbol | Name | Description |
|--------|------|-------------|
| **a** (sma) | Semi-major axis | Half the longest diameter of the ellipse (m). Determines orbital energy and period. |
| **e** (ecc) | Eccentricity | Shape: 0 = circle, 0–1 = ellipse, 1 = parabola, >1 = hyperbola |
| **i** (inc) | Inclination | Tilt of orbital plane relative to Earth's equatorial plane (radians) |
| **Ω** (raan) | RAAN | Right Ascension of Ascending Node — rotates the orbital plane around Earth's axis (radians) |
| **ω** (aop) | Argument of Periapsis | Rotation of the ellipse within the orbital plane (radians) |
| **ν** (trueAnomaly) | True Anomaly | Current position of the satellite along the ellipse (radians) |

```
         Ascending
          Node ↑
            ╱
    ─────╱──────── Equatorial Plane
        ╱  ← i (inclination)
       ╱
   Orbital Plane
```

---

## Coordinate Frames

### ECI — Earth-Centred Inertial

The primary frame used by OpenUnits. Origin at Earth's centre, X-axis toward the vernal equinox, Z-axis toward the celestial north pole. Does **not** rotate with Earth.

All `StateVector` values (`x, y, z, vx, vy, vz`) are in ECI.

### Perifocal Frame

An intermediate frame aligned with the orbit's geometry (X toward periapsis, Y perpendicular in orbital plane). Used internally for the elements↔state conversion.

---

## Anomalies

Three related angles describe how far along its orbit a body has travelled:

| Anomaly | Symbol | Description |
|---------|--------|-------------|
| **True anomaly** | ν | Actual angle from periapsis. Non-uniform for elliptic orbits. |
| **Eccentric anomaly** | E | Auxiliary angle used for computation |
| **Mean anomaly** | M | Uniform with time: M = n·t where n = mean motion |

### Converting Between Them

```
Mean → Eccentric   : Kepler's equation  M = E − e·sin(E)  (solved iteratively)
Eccentric → True   : ν = 2·atan2(√(1+e)·sin(E/2), √(1−e)·cos(E/2))
True → Mean        : reverse of the above
```

OpenUnits exposes all these as `meanToEccentric`, `eccentricToTrue`, `trueToEccentric`, `trueToMean`.

---

## Orbital Period & Mean Motion

For an elliptic orbit, the period `T` and mean motion `n` are:

```
T = 2π √(a³/μ)
n = √(μ/a³) = 2π/T
```

where μ = G·M is the **gravitational parameter** of the central body.

| Orbit | Altitude | Period |
|-------|----------|--------|
| ISS (LEO) | 408 km | ~92 min |
| GPS (MEO) | 20 200 km | ~12 h |
| GEO | 35 786 km | 23 h 56 min |

---

## State Vectors

A **state vector** is an alternative to Keplerian elements — it gives the satellite's instantaneous position and velocity in Cartesian coordinates:

```
r = [x, y, z]    (metres)
v = [vx, vy, vz]  (metres/second)
```

Together these 6 numbers fully determine the orbit. OpenUnits provides `elementsToState` and `stateToElements` to convert between the two representations.

---

## Orbit Classification

| Eccentricity | Type | Description |
|--------------|------|-------------|
| e ≈ 0 | Circular | Constant altitude |
| 0 < e < 1 | Elliptic | Varying altitude, closed orbit |
| e = 1 | Parabolic | Escape trajectory, borderline case |
| e > 1 | Hyperbolic | Escape trajectory (flyby) |

---

## Vis-Viva Equation

Relates orbital speed to position and semi-major axis:

```
v² = μ · (2/r − 1/a)
```

For a circular orbit (r = a): `v = √(μ/r)`  
For escape (a → ∞): `v_esc = √(2μ/r) = √2 · v_circular`

---

## Delta-V (ΔV)

ΔV is the change in velocity needed to perform an orbital maneuver. It is the primary "currency" of mission design — directly proportional to propellant mass via the Tsiolkovsky rocket equation.

### Hohmann Transfer

The most fuel-efficient way to move between two coplanar circular orbits using two burns:

```
         ┌──── Burn 2 (at apoapsis of transfer ellipse)
         │
   ──────┼──── Target circular orbit (r₂)
         │
   ──────┼──── Transfer ellipse
         │
   ──────┼──── Initial circular orbit (r₁)
         │
         └──── Burn 1 (at periapsis)
```

```
ΔV₁ = v_transfer_periapsis − v_circular(r₁)
ΔV₂ = v_circular(r₂) − v_transfer_apoapsis
Total ΔV = |ΔV₁| + |ΔV₂|
```

### Inclination Change

Changing orbital plane requires a ΔV burn perpendicular to the velocity vector:

```
ΔV = 2 · v · sin(Δi / 2)
```

This is expensive — a 90° plane change at LEO costs ~10 km/s. Always combine with altitude changes when possible.

---

## Named Orbit Presets

OpenUnits includes presets for common Earth orbits:

| Name | Altitude | Inclination | Description |
|------|----------|-------------|-------------|
| LEO | ~400 km | 51.6° | Low Earth Orbit (ISS-like) |
| MEO | ~20 200 km | 55° | GPS constellation |
| GEO | 35 786 km | 0° | Geostationary orbit |
| SSO | ~600 km | ~97° | Sun-synchronous orbit |
| HEO | ~500–39 000 km | 63.4° | Highly Elliptic Orbit (Molniya-like) |
| TLI | Trans-lunar | — | Trans-Lunar Injection trajectory |

---

## Further Reading

- Vallado, D. A. *Fundamentals of Astrodynamics and Applications* (4th ed.)
- Bate, Mueller & White. *Fundamentals of Astrodynamics*
- [NASA Orbital Mechanics](https://www.nasa.gov/specials/artemis/)
