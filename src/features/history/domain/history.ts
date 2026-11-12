import type { Place } from '../../planning/domain/models';
export interface HistoryEntry {
  id: string;
  origin: Place;
  destination: Place;
  at: string;
}
export function currentHistory(items: HistoryEntry[], now = Date.now()) {
  return items.filter((i) => Date.parse(i.at) > now - 7 * 86400000).slice(0, 20);
}
