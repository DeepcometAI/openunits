import { Command } from 'commander'
import Table from 'cli-table3'
import {
  namedOrbitPreset,
  elementsToState,
  stateToElements,
  orbitalPeriod,
  circularVelocity,
  classifyOrbit,
  hohmannTransfer,
  escapeVelocity,
  launchDeltaV,
  deg2rad,
  rad2deg,
  R_EARTH,
  propagate,
} from '../index.js'
import type { KeplerianElements, OutputFormat } from '../core/types.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function output(data: unknown, format: OutputFormat): void {
  if (format === 'json') {
    console.log(JSON.stringify(data, null, 2))
    return
  }
  // Table format
  const table = new Table({ style: { head: ['cyan'] } })
  if (typeof data === 'object' && data !== null) {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      table.push({ [k]: String(v) })
    }
  }
  console.log(table.toString())
}

function parseElements(opts: {
  sma?: string; ecc?: string; inc?: string
  raan?: string; aop?: string; ta?: string
  orbit?: string
}): KeplerianElements {
  if (opts.orbit) return namedOrbitPreset(opts.orbit)
  return {
    sma: opts.sma ? parseFloat(opts.sma) : R_EARTH + 400_000,
    ecc: opts.ecc ? parseFloat(opts.ecc) : 0,
    inc: opts.inc ? deg2rad(parseFloat(opts.inc)) : 0,
    raan: opts.raan ? deg2rad(parseFloat(opts.raan)) : 0,
    aop: opts.aop ? deg2rad(parseFloat(opts.aop)) : 0,
    trueAnomaly: opts.ta ? deg2rad(parseFloat(opts.ta)) : 0,
    epoch: 0,
  }
}

// ─── CLI Definition ──────────────────────────────────────────────────────────

const program = new Command()

program
  .name('openunits')
  .description('Orbital mechanics engine CLI — 2-body Keplerian propagation')
  .version('0.1.0')

// ── elements → state ─────────────────────────────────────────────────────────
program
  .command('state')
  .description('Convert Keplerian elements to a Cartesian state vector')
  .option('--orbit <name>', 'Named orbit preset (LEO, MEO, GEO, SSO, HEO, TLI)')
  .option('--sma <m>', 'Semi-major axis (m)')
  .option('--ecc <value>', 'Eccentricity')
  .option('--inc <deg>', 'Inclination (degrees)')
  .option('--raan <deg>', 'RAAN (degrees)')
  .option('--aop <deg>', 'Argument of periapsis (degrees)')
  .option('--ta <deg>', 'True anomaly (degrees)')
  .option('--format <fmt>', 'Output format: json | table', 'json')
  .action((opts) => {
    const elements = parseElements(opts)
    const sv = elementsToState(elements)
    output({
      x_m: sv.x.toFixed(3),
      y_m: sv.y.toFixed(3),
      z_m: sv.z.toFixed(3),
      vx_ms: sv.vx.toFixed(6),
      vy_ms: sv.vy.toFixed(6),
      vz_ms: sv.vz.toFixed(6),
    }, opts.format as OutputFormat)
  })

// ── state → elements ─────────────────────────────────────────────────────────
program
  .command('elements')
  .description('Convert a Cartesian state vector to Keplerian elements')
  .requiredOption('--x <m>', 'Position x (m)')
  .requiredOption('--y <m>', 'Position y (m)')
  .requiredOption('--z <m>', 'Position z (m)')
  .requiredOption('--vx <ms>', 'Velocity x (m/s)')
  .requiredOption('--vy <ms>', 'Velocity y (m/s)')
  .requiredOption('--vz <ms>', 'Velocity z (m/s)')
  .option('--format <fmt>', 'Output format: json | table', 'json')
  .action((opts) => {
    const el = stateToElements({
      x: parseFloat(opts.x), y: parseFloat(opts.y), z: parseFloat(opts.z),
      vx: parseFloat(opts.vx), vy: parseFloat(opts.vy), vz: parseFloat(opts.vz),
    })
    output({
      sma_m: el.sma.toFixed(3),
      eccentricity: el.ecc.toFixed(8),
      inc_deg: rad2deg(el.inc).toFixed(6),
      raan_deg: rad2deg(el.raan).toFixed(6),
      aop_deg: rad2deg(el.aop).toFixed(6),
      trueAnomaly_deg: rad2deg(el.trueAnomaly).toFixed(6),
      type: classifyOrbit(el.ecc),
      period_s: orbitalPeriod(el.sma).toFixed(3),
    }, opts.format as OutputFormat)
  })

// ── propagate ─────────────────────────────────────────────────────────────────
program
  .command('propagate')
  .description('Propagate an orbit forward by a given time')
  .option('--orbit <name>', 'Named orbit preset')
  .option('--sma <m>', 'Semi-major axis (m)')
  .option('--ecc <value>', 'Eccentricity')
  .option('--inc <deg>', 'Inclination (degrees)')
  .option('--raan <deg>', 'RAAN (degrees)')
  .option('--aop <deg>', 'Argument of periapsis (degrees)')
  .option('--ta <deg>', 'True anomaly (degrees)')
  .option('--dt <s>', 'Time step (seconds)', '3600')
  .option('--format <fmt>', 'Output format: json | table', 'json')
  .action((opts) => {
    const elements = parseElements(opts)
    const dt = parseFloat(opts.dt)
    const result = propagate(elements, dt)
    output({
      epoch_s: result.epoch.toFixed(3),
      x_m: result.state.x.toFixed(3),
      y_m: result.state.y.toFixed(3),
      z_m: result.state.z.toFixed(3),
      vx_ms: result.state.vx.toFixed(6),
      vy_ms: result.state.vy.toFixed(6),
      vz_ms: result.state.vz.toFixed(6),
      trueAnomaly_deg: rad2deg(result.elements.trueAnomaly).toFixed(6),
    }, opts.format as OutputFormat)
  })

// ── hohmann ───────────────────────────────────────────────────────────────────
program
  .command('hohmann')
  .description('Compute Hohmann transfer delta-V between two circular orbits')
  .requiredOption('--r1 <m>', 'Initial orbit radius (m) or altitude if --altitude flag')
  .requiredOption('--r2 <m>', 'Target orbit radius (m) or altitude if --altitude flag')
  .option('--altitude', 'Treat r1/r2 as altitudes above Earth surface (adds R_EARTH)')
  .option('--format <fmt>', 'Output format: json | table', 'json')
  .action((opts) => {
    let r1 = parseFloat(opts.r1)
    let r2 = parseFloat(opts.r2)
    if (opts.altitude) { r1 += R_EARTH; r2 += R_EARTH }
    const result = hohmannTransfer(r1, r2)
    output({
      r1_m: r1.toFixed(0),
      r2_m: r2.toFixed(0),
      dv1_ms: result.dv1.toFixed(4),
      dv2_ms: result.dv2.toFixed(4),
      totalDv_ms: result.totalDv.toFixed(4),
      transferTime_s: result.transferTime.toFixed(3),
      transferTime_h: (result.transferTime / 3600).toFixed(4),
    }, opts.format as OutputFormat)
  })

// ── escape ────────────────────────────────────────────────────────────────────
program
  .command('escape')
  .description('Compute escape velocity from a given radius or altitude')
  .requiredOption('--r <m>', 'Radius or altitude (m)')
  .option('--altitude', 'Treat r as altitude above Earth surface')
  .option('--format <fmt>', 'Output format: json | table', 'json')
  .action((opts) => {
    let r = parseFloat(opts.r)
    if (opts.altitude) r += R_EARTH
    output({
      radius_m: r.toFixed(0),
      escapeVelocity_ms: escapeVelocity(r).toFixed(4),
      circularVelocity_ms: circularVelocity(r).toFixed(4),
      dv_to_escape_ms: (escapeVelocity(r) - circularVelocity(r)).toFixed(4),
    }, opts.format as OutputFormat)
  })

// ── launch ────────────────────────────────────────────────────────────────────
program
  .command('launch')
  .description('Estimate delta-V needed to launch to a target orbit altitude')
  .requiredOption('--alt <m>', 'Target altitude above Earth surface (m)')
  .option('--format <fmt>', 'Output format: json | table', 'json')
  .action((opts) => {
    const alt = parseFloat(opts.alt)
    output({
      targetAltitude_m: alt.toFixed(0),
      targetRadius_m: (R_EARTH + alt).toFixed(0),
      circularVelocity_ms: circularVelocity(R_EARTH + alt).toFixed(4),
      estimatedLaunchDv_ms: launchDeltaV(alt).toFixed(4),
    }, opts.format as OutputFormat)
  })

// ── info ───────────────────────────────────────────────────────────────────────
program
  .command('info')
  .description('Show orbital parameters for a named or custom orbit')
  .option('--orbit <name>', 'Named orbit preset (LEO, MEO, GEO, SSO, HEO, TLI)')
  .option('--sma <m>', 'Semi-major axis (m)')
  .option('--ecc <value>', 'Eccentricity')
  .option('--inc <deg>', 'Inclination (degrees)')
  .option('--format <fmt>', 'Output format: json | table', 'json')
  .action((opts) => {
    const el = parseElements(opts)
    const period = orbitalPeriod(el.sma)
    const vCirc = circularVelocity(el.sma)
    const r = el.sma * (1 - el.ecc)
    output({
      sma_m: el.sma.toFixed(0),
      sma_km: (el.sma / 1000).toFixed(3),
      altitude_km: ((el.sma - R_EARTH) / 1000).toFixed(3),
      eccentricity: el.ecc.toFixed(8),
      inc_deg: rad2deg(el.inc).toFixed(4),
      type: classifyOrbit(el.ecc),
      period_s: period.toFixed(3),
      period_min: (period / 60).toFixed(4),
      period_h: (period / 3600).toFixed(4),
      circularVelocity_ms: vCirc.toFixed(4),
      periapsis_m: r.toFixed(0),
      apoapsis_m: (el.sma * (1 + el.ecc)).toFixed(0),
    }, opts.format as OutputFormat)
  })

export { program }
