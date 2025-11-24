export function polarToCartesian(
  distance: number,
  angleDegrees: number
): { x: number; y: number } {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: distance * Math.cos(angleRadians),
    y: distance * Math.sin(angleRadians)
  };
}

export function cartesianToPolar(
  x: number,
  y: number
): { distance: number; angle: number } {
  const distance = Math.sqrt(x * x + y * y);
  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  return { distance, angle };
}

export function rotatePoint(
  x: number,
  y: number,
  angleDegrees: number
): { x: number; y: number } {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
}

export function translatePoint(
  point: { x: number; y: number },
  offset: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y
  };
}

export function normalizeAngle(angleDegrees: number): number {
  let normalized = angleDegrees % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized < -180) normalized += 360;
  return normalized;
}

export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function worldToGrid(
  worldX: number,
  worldY: number,
  cellSize: number,
  gridSize: number
): { gx: number; gy: number } {
  const centerOffset = Math.floor(gridSize / 2);
  return {
    gx: Math.floor(worldX / cellSize) + centerOffset,
    gy: Math.floor(worldY / cellSize) + centerOffset
  };
}

export function gridToWorld(
  gx: number,
  gy: number,
  cellSize: number,
  gridSize: number
): { x: number; y: number } {
  const centerOffset = Math.floor(gridSize / 2);
  return {
    x: (gx - centerOffset) * cellSize,
    y: (gy - centerOffset) * cellSize
  };
}
