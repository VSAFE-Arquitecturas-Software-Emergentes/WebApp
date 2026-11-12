import { ref } from 'vue';
import { API_BASE_URL, ApiError } from '../../../shared/infrastructure/http-client';
import { dependencies } from '../../../app/container';
import { projectPosition, type Journey, type JourneyAlert } from '../domain/models';
const active = ref<Journey | null>(null),
  alerts = ref<JourneyAlert[]>([]),
  error = ref(''),
  locationEnabled = ref(false),
  suspended = ref(false);
const cases = dependencies.journeys;
let stream: EventSource | undefined;
let watchId: number | undefined;
let demoTimer: ReturnType<typeof setInterval> | undefined;
let key = crypto.randomUUID();
function stopTracking() {
  if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
  watchId = undefined;
  clearInterval(demoTimer);
  stream?.close();
  stream = undefined;
  locationEnabled.value = false;
}
async function progress(segmentIndex: number, fractionAlong: number) {
  const j = active.value;
  if (!j) return;
  try {
    await cases.gateway.progress(j.id, {
      routeVersion: j.version,
      segmentIndex,
      fractionAlong,
      observedAt: new Date().toISOString(),
    });
    suspended.value = false;
  } catch {
    suspended.value = true;
  }
}
function connect() {
  stream?.close();
  if (!active.value) return;
  stream = new EventSource(`${API_BASE_URL}/journeys/${active.value.id}/alerts/stream`, {
    withCredentials: true,
  });
  stream.addEventListener('alert', (event) => {
    const alert = JSON.parse((event as MessageEvent).data) as JourneyAlert;
    if (alert.routeVersion !== active.value?.version) return;
    if (!alerts.value.some((a) => a.id === alert.id)) alerts.value.unshift(alert);
    void cases.gateway.ack(active.value!.id, alert.id).catch(() => {});
  });
  stream.addEventListener('suspended', () => {
    suspended.value = true;
  });
  stream.onerror = () => {
    suspended.value = true;
  };
  stream.onopen = () => {
    suspended.value = false;
  };
}
export function useJourney() {
  async function enableLocation() {
    error.value = '';
    if (!active.value) return;
    if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    clearInterval(demoTimer);
    if (active.value.route?.demo) {
      locationEnabled.value = true;
      await progress(0, 0);
      demoTimer = setInterval(() => void progress(0, 0), 20_000);
      connect();
      return;
    }
    if (!navigator.geolocation) {
      error.value = 'LOCATION_UNAVAILABLE';
      return;
    }
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const j = active.value;
        if (!j?.route) return;
        const p = projectPosition(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          j.route.geometry.coordinates,
        );
        if (p.distance <= 200) {
          locationEnabled.value = true;
          void progress(p.segmentIndex, p.fractionAlong).then(() => {
            if (!stream) connect();
          });
        } else suspended.value = true;
      },
      () => {
        error.value = 'LOCATION_UNAVAILABLE';
        suspended.value = true;
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );
  }
  async function start(alternativeId: string) {
    error.value = '';
    try {
      active.value = await cases.start(alternativeId, key);
      key = crypto.randomUUID();
      sessionStorage.setItem('vsafe.journey', active.value.id);
      alerts.value = [];
      if (active.value.route?.demo) await enableLocation();
    } catch (e) {
      error.value = e instanceof ApiError ? e.code : 'REQUEST_FAILED';
      throw e;
    }
  }
  async function change(alternativeId: string) {
    if (!active.value) return;
    try {
      stopTracking();
      active.value = await cases.change(active.value, alternativeId);
      alerts.value = [];
      await enableLocation();
    } catch (e) {
      error.value = e instanceof ApiError ? e.code : 'REQUEST_FAILED';
      throw e;
    }
  }
  async function finish() {
    if (!active.value) return;
    await cases.close(active.value);
    stopTracking();
    active.value = null;
    alerts.value = [];
    sessionStorage.removeItem('vsafe.journey');
  }
  async function restore() {
    if (active.value) return;
    const id = sessionStorage.getItem('vsafe.journey');
    if (id)
      try {
        const j = await cases.gateway.get(id);
        if (j.status === 'ACTIVE' && Date.parse(j.expiresAt) > Date.now()) {
          active.value = j;
          if (j.route?.demo) await enableLocation();
        } else sessionStorage.removeItem('vsafe.journey');
      } catch (e) {
        if (e instanceof ApiError && [401, 404, 410].includes(e.status))
          sessionStorage.removeItem('vsafe.journey');
        else error.value = 'SERVICE_UNAVAILABLE';
      }
  }
  return {
    active,
    alerts,
    error,
    locationEnabled,
    suspended,
    start,
    change,
    finish,
    restore,
    enableLocation,
    stopTracking,
  };
}
