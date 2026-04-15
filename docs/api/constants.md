# API: Constants

All constants are in **SI units** unless otherwise stated.

```ts
import {
  G, MU_EARTH, R_EARTH, OMEGA_EARTH,
  MU_SUN, MU_MOON, C_LIGHT, AU_M,
  DEG2RAD, RAD2DEG,
} from 'openunits'
```

---

## Gravitational Constant

### `G`

```ts
const G: number  // 6.674_30e-11
```

Newtonian gravitational constant (m³ kg⁻¹ s⁻²).

---

## Earth Constants

### `MU_EARTH`

```ts
const MU_EARTH: number  // 3.986_004_418e14
```

Earth's gravitational parameter μ = G · M_Earth (m³ s⁻²). Use this instead of computing `G * M` separately — it is known to higher precision.

### `R_EARTH`

```ts
const R_EARTH: number  // 6_378_137.0
```

Earth equatorial radius (m). WGS-84 value.

### `OMEGA_EARTH`

```ts
const OMEGA_EARTH: number  // 7.292_115e-5
```

Earth's sidereal rotation rate (rad/s).

---

## Solar System Constants

### `MU_SUN`

```ts
const MU_SUN: number  // 1.327_124_400_41e20
```

Sun's gravitational parameter (m³ s⁻²).

### `MU_MOON`

```ts
const MU_MOON: number  // 4.902_800_066e12
```

Moon's gravitational parameter (m³ s⁻²).

### `C_LIGHT`

```ts
const C_LIGHT: number  // 299_792_458
```

Speed of light in vacuum (m/s).

### `AU_M`

```ts
const AU_M: number  // 1.495_978_707e11
```

One Astronomical Unit in metres.

---

## Angle Conversion Multipliers

### `DEG2RAD`

```ts
const DEG2RAD: number  // Math.PI / 180
```

Multiply degrees by this to get radians.

### `RAD2DEG`

```ts
const RAD2DEG: number  // 180 / Math.PI
```

Multiply radians by this to get degrees.

### Helper functions

```ts
import { deg2rad, rad2deg } from 'openunits'

deg2rad(180)    // → Math.PI
rad2deg(Math.PI) // → 180
```

---

## Reference Values (Combined)

| Constant | Value | Unit |
|----------|-------|------|
| G | 6.67430 × 10⁻¹¹ | m³ kg⁻¹ s⁻² |
| μ_Earth | 3.986 × 10¹⁴ | m³ s⁻² |
| R_Earth | 6 378 137 | m |
| ω_Earth | 7.292 × 10⁻⁵ | rad/s |
| μ_Sun | 1.327 × 10²⁰ | m³ s⁻² |
| μ_Moon | 4.903 × 10¹² | m³ s⁻² |
| c | 299 792 458 | m/s |
| AU | 1.496 × 10¹¹ | m |
