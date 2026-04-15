/**
 * Physical and astronomical constants used throughout the OpenUnits engine.
 * All values are in SI units unless otherwise stated.
 */

/** Gravitational constant (m^3 kg^-1 s^-2) */
export const G = 6.674_30e-11

/** Earth gravitational parameter μ = G * M_earth (m^3 s^-2) */
export const MU_EARTH = 3.986_004_418e14

/** Earth equatorial radius (m) */
export const R_EARTH = 6_378_137.0

/** Earth sidereal rotation rate (rad/s) */
export const OMEGA_EARTH = 7.292_115e-5

/** Sun gravitational parameter μ_sun (m^3 s^-2) */
export const MU_SUN = 1.327_124_400_41e20

/** Moon gravitational parameter μ_moon (m^3 s^-2) */
export const MU_MOON = 4.902_800_066e12

/** speed of light (m/s) */
export const C_LIGHT = 299_792_458

/** Astronomical Unit in metres */
export const AU_M = 1.495_978_707e11

/** Degrees to radians multiplier */
export const DEG2RAD = Math.PI / 180

/** Radians to degrees multiplier */
export const RAD2DEG = 180 / Math.PI
