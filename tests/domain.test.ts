import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { currentHistory } from '../src/features/history/domain/history';
import { projectPosition } from '../src/features/journeys/domain/models';
test('history discards expired entries and caps at 20', () => {
  const now = Date.now();
  const items = Array.from({ length: 25 }, (_, i) => ({
    id: String(i),
    origin: {} as any,
    destination: {} as any,
    at: new Date(now - i * 86400000).toISOString(),
  }));
  assert.equal(currentHistory(items, now).length, 7);
  assert.equal(currentHistory(Array(30).fill(items[0]), now).length, 20);
});

test('GPS projection identifies remaining segment and distance', () => {
  const p = projectPosition({ lng: -77.035, lat: -12.12 }, [
    [-77.04, -12.12],
    [-77.03, -12.12],
  ]);
  assert.equal(p.segmentIndex, 0);
  assert.ok(Math.abs(p.fractionAlong - 0.5) < 1e-8);
  assert.ok(p.distance < 0.01);
});
test('domain and application do not import concrete adapters or Vue', () => {
  for (const feature of ['planning', 'journeys', 'reports'])
    for (const layer of ['domain', 'application']) {
      const dir = path.join('src', 'features', feature, layer);
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
        const text = readFileSync(path.join(dir, file), 'utf8');
        assert.doesNotMatch(text, /from ['"](?:vue['"]|.*\/infrastructure\/)/);
      }
    }
});
