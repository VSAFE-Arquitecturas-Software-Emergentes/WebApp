import { ref, computed } from 'vue';
import { dependencies } from '../../../app/container';
import { ApiError, request } from '../../../shared/infrastructure/http-client';
import { places, type Place, type RouteAlternative } from '../domain/models';
import { historyStorage } from '../../history/infrastructure/local-history';
const origin = ref<Place>({ ...places[0] }),
  destination = ref<Place>({ ...places[1] }),
  routes = ref<RouteAlternative[]>([]),
  selectedId = ref(''),
  busy = ref(false),
  error = ref(''),
  notice = ref('');
const usecase = dependencies.planning;
const incidents = ref<{ id: string; category: string; location: Place }[]>([]);
let expiry: ReturnType<typeof setTimeout> | undefined;
function expireEstimates() {
  clearTimeout(expiry);
  const future = routes.value
    .map((r) => Date.parse(r.risk.validUntil))
    .filter((t) => t > Date.now());
  if (!future.length) return;
  expiry = setTimeout(
    () => {
      routes.value = routes.value.map((r) =>
        Date.parse(r.risk.validUntil) <= Date.now()
          ? {
              ...r,
              risk: { ...r.risk, level: 'UNKNOWN', score: null, cause: 'ASSESSMENT_EXPIRED' },
            }
          : r,
      );
      expireEstimates();
    },
    Math.max(10, Math.min(...future) - Date.now() + 10),
  );
}
export function usePlanning() {
  async function search() {
    busy.value = true;
    error.value = '';
    try {
      const response = await usecase.execute(origin.value, destination.value);
      routes.value = response.routes;
      expireEstimates();
      selectedId.value = routes.value[0]?.id || '';
      notice.value = response.notice || '';
      historyStorage.add(origin.value, destination.value);
      incidents.value = await request('/incidents');
    } catch (e) {
      error.value = e instanceof ApiError ? e.code : 'REQUEST_FAILED';
    } finally {
      busy.value = false;
    }
  }
  return {
    origin,
    destination,
    routes,
    selectedId,
    busy,
    error,
    notice,
    incidents,
    search,
    selected: computed(() => routes.value.find((r) => r.id === selectedId.value)),
  };
}
