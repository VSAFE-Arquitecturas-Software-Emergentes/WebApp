import { ref } from 'vue';
import { currentHistory, type HistoryEntry } from '../domain/history';
import type { Place } from '../../planning/domain/models';
const consent = ref(localStorage.getItem('vsafe.history.consent') === 'true');
export const historyStorage = {
  consent,
  list(): HistoryEntry[] {
    if (!consent.value) {
      localStorage.removeItem('vsafe.history');
      return [];
    }
    try {
      const data = JSON.parse(localStorage.getItem('vsafe.history') || '[]');
      const current = currentHistory(Array.isArray(data) ? data : []);
      localStorage.setItem('vsafe.history', JSON.stringify(current));
      return current;
    } catch {
      return [];
    }
  },
  add(origin: Place, destination: Place) {
    if (!consent.value) return;
    const items = this.list();
    items.unshift({
      id: crypto.randomUUID(),
      origin: { ...origin },
      destination: { ...destination },
      at: new Date().toISOString(),
    });
    try {
      localStorage.setItem('vsafe.history', JSON.stringify(currentHistory(items)));
    } catch {}
  },
  clear() {
    localStorage.removeItem('vsafe.history');
  },
  setConsent(value: boolean) {
    consent.value = value;
    localStorage.setItem('vsafe.history.consent', String(value));
    if (!value) this.clear();
  },
};
