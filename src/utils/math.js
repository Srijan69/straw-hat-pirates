/**
 * Math utilities for 3D physics and smooth interpolations
 */

export const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

export const clamp = (val, min, max) => {
  return Math.max(min, Math.min(max, val));
};

export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
};

export const randomRange = (min, max) => {
  return min + Math.random() * (max - min);
};

export const smoothstep = (min, max, value) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
};
