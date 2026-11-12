import type { RouteAlternative, Point } from '../../planning/domain/models';
export interface Journey {
  id: string;
  version: number;
  status: 'ACTIVE' | 'CLOSED';
  route: RouteAlternative | null;
  expiresAt: string;
}
export interface JourneyAlert {
  id: string;
  eventId: string;
  category: string;
  routeVersion: number;
  createdAt: string;
}
export function projectPosition(p: Point, coordinates: [number, number][]) {
  let best = { distance: Infinity, segmentIndex: 0, fractionAlong: 0 };
  for (let i = 0; i < coordinates.length - 1; i++) {
    const a = coordinates[i],
      b = coordinates[i + 1],
      scale = Math.cos((p.lat * Math.PI) / 180);
    const dx = (b[0] - a[0]) * scale,
      dy = b[1] - a[1],
      x = (p.lng - a[0]) * scale,
      y = p.lat - a[1];
    const f = Math.max(0, Math.min(1, (x * dx + y * dy) / (dx * dx + dy * dy || 1)));
    const d = Math.hypot(x - dx * f, y - dy * f) * 111000;
    if (d < best.distance) best = { distance: d, segmentIndex: i, fractionAlong: f };
  }
  return best;
}
