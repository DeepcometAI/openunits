# CLI Reference

The OpenUnits CLI provides quick access to orbital calculations from the terminal.

## Running the CLI

```bash
# After global install
openunits <command> [options]

# Directly from the repo (after pnpm build)
node bin/openunits.js <command> [options]
```

## Output Formats

All commands default to **JSON** output for easy piping to other tools:

```bash
openunits info --orbit LEO | jq '.period_min'
```

Add `--format table` for human-readable output:

```bash
openunits info --orbit LEO --format table
```

---

## Commands

### `info` — Orbital Parameters Summary

Display a full summary of an orbit's parameters.

```bash
openunits info [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--orbit <name>` | Named preset: `LEO`, `MEO`, `GEO`, `SSO`, `HEO`, `TLI` |
| `--sma <m>` | Semi-major axis in metres |
| `--ecc <value>` | Eccentricity |
| `--inc <deg>` | Inclination in degrees |
| `--format <fmt>` | `json` (default) or `table` |

**Output fields:** `sma_m`, `sma_km`, `altitude_km`, `eccentricity`, `inc_deg`, `type`, `period_s`, `period_min`, `period_h`, `circularVelocity_ms`, `periapsis_m`, `apoapsis_m`

**Examples:**

```bash
openunits info --orbit LEO
openunits info --orbit GEO --format table
openunits info --sma 7000000 --ecc 0.01 --inc 28.5
```

**Sample JSON output:**
```json
{
  "sma_m": "6778137",
  "sma_km": "6778.137",
  "altitude_km": "400.000",
  "eccentricity": "0.00100000",
  "inc_deg": "51.5662",
  "type": "elliptic",
  "period_s": "5553.624",
  "period_min": "92.5604",
  "period_h": "1.5427",
  "circularVelocity_ms": "7668.5582",
  "periapsis_m": "6771359",
  "apoapsis_m": "6784915"
}
```

---

### `state` — Elements → State Vector

Convert Keplerian orbital elements to a Cartesian ECI state vector.

```bash
openunits state [options]
```

**Options:** same orbit definition options as `info`, plus `--format`

**Output fields:** `x_m`, `y_m`, `z_m`, `vx_ms`, `vy_ms`, `vz_ms`

**Examples:**

```bash
openunits state --orbit LEO
openunits state --sma 7000000 --ecc 0.001 --inc 28.5 --ta 90
```

**Sample output:**
```json
{
  "x_m": "6778137.000",
  "y_m": "0.000",
  "z_m": "0.000",
  "vx_ms": "0.000000",
  "vy_ms": "7668.558276",
  "vz_ms": "0.000000"
}
```

---

### `elements` — State Vector → Elements

Convert a Cartesian ECI state vector to Keplerian elements.

```bash
openunits elements --x <m> --y <m> --z <m> --vx <ms> --vy <ms> --vz <ms>
```

**Required options:**

| Option | Description |
|--------|-------------|
| `--x <m>` | Position x (m) |
| `--y <m>` | Position y (m) |
| `--z <m>` | Position z (m) |
| `--vx <ms>` | Velocity x (m/s) |
| `--vy <ms>` | Velocity y (m/s) |
| `--vz <ms>` | Velocity z (m/s) |
| `--format <fmt>` | `json` or `table` |

**Examples:**

```bash
openunits elements --x 6778137 --y 0 --z 0 --vx 0 --vy 7668.56 --vz 0
openunits elements --x 6558137 --y 0 --z 0 --vx 0 --vy 7784 --vz 0 --format table
```

**Output fields:** `sma_m`, `eccentricity`, `inc_deg`, `raan_deg`, `aop_deg`, `trueAnomaly_deg`, `type`, `period_s`

---

### `propagate` — Advance Orbit in Time

Propagate an orbit forward by a given number of seconds.

```bash
openunits propagate [options] --dt <seconds>
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dt <s>` | Time step in seconds (default: `3600`) |
| `--orbit <name>` | Named preset |
| `--sma/--ecc/--inc/--raan/--aop/--ta` | Manual element definition |
| `--format <fmt>` | `json` or `table` |

**Examples:**

```bash
# Propagate ISS-like LEO 90 minutes (approx 1 orbit)
openunits propagate --orbit LEO --dt 5554

# Propagate GEO 1 day
openunits propagate --orbit GEO --dt 86400 --format table

# Propagate custom orbit 6 hours
openunits propagate --sma 8000000 --ecc 0.1 --inc 45 --dt 21600
```

**Output fields:** `epoch_s`, `x_m`, `y_m`, `z_m`, `vx_ms`, `vy_ms`, `vz_ms`, `trueAnomaly_deg`

---

### `hohmann` — Hohmann Transfer ΔV

Compute delta-V budget for a Hohmann transfer between two circular orbits.

```bash
openunits hohmann --r1 <m> --r2 <m> [--altitude]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--r1 <m>` | Initial orbit radius (m), or altitude if `--altitude` set |
| `--r2 <m>` | Target orbit radius (m), or altitude if `--altitude` set |
| `--altitude` | Interpret r1/r2 as altitudes above Earth's surface |
| `--format <fmt>` | `json` or `table` |

**Examples:**

```bash
# Using radii from Earth's centre
openunits hohmann --r1 6778137 --r2 42164000

# Using altitudes (recommended for clarity)
openunits hohmann --r1 400000 --r2 35786000 --altitude --format table

# Lowering orbit (deorbit maneuver)
openunits hohmann --r1 800000 --r2 200000 --altitude
```

**Sample output (LEO → GEO, table):**
```
┌────────────────┬──────────────┐
│ r1_m           │ 6778137      │
│ r2_m           │ 42164000     │
│ dv1_ms         │ 2424.1906    │
│ dv2_ms         │ 1467.1654    │
│ totalDv_ms     │ 3891.3560    │
│ transferTime_s │ 18927.497    │
│ transferTime_h │ 5.2576       │
└────────────────┴──────────────┘
```

---

### `escape` — Escape Velocity

Compute escape velocity, circular velocity, and ΔV to escape from a given orbit.

```bash
openunits escape --r <m> [--altitude]
```

**Examples:**

```bash
openunits escape --r 6778137
openunits escape --r 400000 --altitude --format table
```

**Output fields:** `radius_m`, `escapeVelocity_ms`, `circularVelocity_ms`, `dv_to_escape_ms`

---

### `launch` — Launch ΔV Estimate

Estimate the total ΔV needed to launch to a given circular orbit altitude from Earth's surface. Includes a typical gravity+drag loss of ~1.5 km/s.

```bash
openunits launch --alt <m>
```

**Examples:**

```bash
openunits launch --alt 400000 --format table
openunits launch --alt 400000
```

**Output fields:** `targetAltitude_m`, `targetRadius_m`, `circularVelocity_ms`, `estimatedLaunchDv_ms`

> **Note:** The launch ΔV estimate uses a simplified model (orbital velocity + fixed 1.5 km/s gravity/drag loss). Real launch vehicles vary significantly based on trajectory, launch site, and vehicle performance.

---

## Pipe & Script Examples

```bash
# Extract GEO period in minutes with jq
openunits info --orbit GEO | jq '.period_min'

# Batch: print LEO to MEO ΔV
openunits hohmann --r1 400000 --r2 20200000 --altitude | jq '.totalDv_ms'

# Chain propagation into jq for just the position
openunits propagate --orbit LEO --dt 3600 | jq '{x: .x_m, y: .y_m, z: .z_m}'
```
