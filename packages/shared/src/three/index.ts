// ============================================================
// 3D — barrel export
// Placeholder — geometries, materials, and animations
// will be added during Phase 1 Week 4 (3D implementation)
// ============================================================

/**
 * Shared Three.js geometry configurations.
 * These are platform-agnostic — they work with both
 * @react-three/fiber (web) and expo-three (react native).
 */

export const THREE_CONFIG = {
  /** Default camera position */
  camera: {
    position: [0, 0, 5] as [number, number, number],
    fov: 45,
  },
  /** Default lighting */
  lighting: {
    ambientIntensity: 0.6,
    directionalIntensity: 0.8,
    directionalPosition: [5, 5, 5] as [number, number, number],
  },
}

/**
 * Coin parameters for 3D Chinese coin model.
 * Coin dimensions in scene units.
 */
export const COIN_PARAMS = {
  outerRadius: 1.0,
  innerRadius: 0.15, // square hole
  thickness: 0.08,
  segments: 64,
}

/**
 * Hexagram ring parameters.
 * 6 pillars arranged in a circle.
 */
export const HEXAGRAM_RING_PARAMS = {
  radius: 2.5,
  pillarHeight: 2.0,
  pillarRadius: 0.15,
  gapSize: 0.08, // gap for yin lines
  rotationSpeed: 0.003,
}

/**
 * Taiji sphere parameters.
 */
export const TAIJI_PARAMS = {
  radius: 1.5,
  segments: 64,
  rotationSpeed: 0.005,
}
