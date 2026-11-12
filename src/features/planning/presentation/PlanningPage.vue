<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import Button from 'primevue/button';
import AppIcon from '../../../shared/presentation/AppIcon.vue';
import MapCanvas from '../../../shared/presentation/MapCanvas.vue';
import { places, type Place } from '../domain/models';
import { usePlanning } from './usePlanning';
import { useJourney } from '../../journeys/presentation/useJourney';
import JourneyPanel from '../../journeys/presentation/JourneyPanel.vue';
import { request, ApiError } from '../../../shared/infrastructure/http-client';
const { t } = useI18n();
const {
  origin,
  destination,
  routes,
  selectedId,
  busy,
  error,
  notice,
  incidents,
  search,
  selected,
} = usePlanning();
const { active, start, change, restore } = useJourney();
const starting = ref(false);
const locationBusy = ref(false);
onMounted(async () => {
  await restore();
  const state = window.history.state;
  if (state.origin && state.destination) {
    origin.value = state.origin;
    destination.value = state.destination;
    await search();
  }
  try {
    incidents.value = await request('/incidents');
  } catch {}
});
function swap() {
  const p = origin.value;
  origin.value = destination.value;
  destination.value = p;
}
function manualChanged(which: 'origin' | 'destination') {
  const place = which === 'origin' ? origin.value : destination.value;
  if (Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lng))) {
    place.label = `${Number(place.lat).toFixed(4)}, ${Number(place.lng).toFixed(4)}`;
    place.detail = t('reports.location');
  }
}
function locate() {
  locationBusy.value = true;
  if (!navigator.geolocation) {
    locationBusy.value = false;
    error.value = 'LOCATION_UNAVAILABLE';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (p) => {
      origin.value = {
        label: t('planning.locate'),
        detail: '',
        lat: p.coords.latitude,
        lng: p.coords.longitude,
      };
      locationBusy.value = false;
    },
    () => {
      locationBusy.value = false;
      error.value = 'LOCATION_UNAVAILABLE';
    },
    { timeout: 10000 },
  );
}
async function begin() {
  if (!selected.value) return;
  starting.value = true;
  try {
    if (active.value) await change(selected.value.id);
    else await start(selected.value.id);
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'REQUEST_FAILED';
  } finally {
    starting.value = false;
  }
}
function setDestination(p: { lat: number; lng: number }) {
  destination.value = {
    ...p,
    label: `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`,
    detail: t('reports.location'),
  };
}
</script>
<template>
  <div class="explore-layout">
    <section class="planning-panel">
      <div class="planning-intro">
        <div class="walking-label">
          <AppIcon name="walk" :size="16" />{{ t('walking') }}<span />Miraflores
        </div>
        <h1>{{ t('planning.title') }}</h1>
        <p>{{ t('planning.subtitle') }}</p>
      </div>
      <form class="planning-form" @submit.prevent="search">
        <div class="waypoint-fields">
          <div class="waypoint-line" />
          <div class="waypoint-field">
            <span class="waypoint-dot origin-dot" />
            <div>
              <label for="origin">{{ t('planning.origin') }}</label><Select
                inputId="origin"
                v-model="origin"
                :options="places"
                optionLabel="label"
                class="place-select"
                ><template #value="{ value }"
                  ><span>{{ value.label }}</span></template
                ><template #option="{ option }"
                  ><div>
                    {{ option.label }}<small class="option-detail">{{ option.detail }}</small>
                  </div></template
                ></Select
              >
            </div>
          </div>
          <div class="waypoint-field">
            <span class="waypoint-dot destination-dot" />
            <div>
              <label for="destination">{{ t('planning.destination') }}</label><Select
                inputId="destination"
                v-model="destination"
                :options="places"
                optionLabel="label"
                class="place-select"
              />
            </div>
          </div>
          <button
            class="swap-button icon-button"
            type="button"
            :aria-label="t('planning.swap')"
            @click="swap"
          >
            <AppIcon name="swap" :size="18" />
          </button>
        </div>
        <div class="point-actions">
          <button class="text-button" type="button" :disabled="locationBusy" @click="locate">
            <AppIcon name="locate" :size="15" />{{
              locationBusy ? t('loading') : t('planning.locate')
            }}
          </button>
          <details class="manual-points">
            <summary>{{ t('planning.manual') }}</summary>
            <div class="coordinate-fields">
              <label
                >A {{ t('planning.lat')
                }}<input
                  v-model.number="origin.lat"
                  @change="manualChanged('origin')"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  required /></label
              ><label
                >A {{ t('planning.lng')
                }}<input
                  v-model.number="origin.lng"
                  @change="manualChanged('origin')"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required /></label
              ><label
                >B {{ t('planning.lat')
                }}<input
                  v-model.number="destination.lat"
                  @change="manualChanged('destination')"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  required /></label
              ><label
                >B {{ t('planning.lng')
                }}<input
                  v-model.number="destination.lng"
                  @change="manualChanged('destination')"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required
              /></label>
            </div>
          </details>
        </div>
        <Button type="submit" class="search-button" :loading="busy"
          ><AppIcon name="map" :size="18" />{{ t('planning.search')
          }}<AppIcon name="arrow" :size="18"
        /></Button>
      </form>
      <div v-if="error" class="inline-error" role="alert">
        {{
          error === 'LOCATION_UNAVAILABLE'
            ? t('journey.denied')
            : t('errors.' + error, t('errors.REQUEST_FAILED'))
        }}
      </div>
      <JourneyPanel />
      <div v-if="routes.length" class="route-results">
        <div class="section-heading">
          <h2>{{ t('planning.options') }}</h2>
          <span class="count-badge">{{ routes.length }}</span>
        </div>
        <p v-if="notice" class="small muted">{{ t('planning.single') }}</p>
        <article
          v-for="(route, i) in routes"
          :key="route.id"
          class="route-card"
          :class="{ selected: route.id === selectedId }"
        >
          <button
            class="route-select"
            :aria-pressed="route.id === selectedId"
            @click="selectedId = route.id"
          >
            <div class="route-card-top">
              <span class="route-name"
                ><span class="route-stroke" :class="'route-stroke-' + i" />{{ t('planning.route') }}
                {{ i + 1 }}</span
              ><span class="selection-circle"
                ><AppIcon v-if="route.id === selectedId" name="check" :size="12"
              /></span>
            </div>
            <div class="route-metrics">
              <strong
                >{{ Math.ceil(route.duration / 60)
                }}<span>{{ t('planning.minutes') }}</span></strong
              ><span class="metric-divider" /><span
                >{{ (route.distance / 1000).toFixed(1) }} {{ t('planning.km') }}</span
              ><AppIcon name="walk" :size="17" />
            </div>
            <div class="risk-pill" :class="route.risk.level.toLowerCase()">
              <span />{{ t('risk.' + route.risk.level) }}
            </div>
            <div class="coverage-line">
              <span>{{ t('planning.coverage') }}</span><span
                >{{ Math.round(route.risk.coverage * 100) }}%</span
              >
            </div>
            <div class="coverage-track">
              <span :style="{ width: route.risk.coverage * 100 + '%' }" />
            </div>
          </button>
          <details v-if="route.id === selectedId" class="estimate-details">
            <summary>{{ t('planning.detail') }}</summary>
            <p>
              {{ route.risk.cause ? t('causes.' + route.risk.cause) : t('planning.disclaimer') }}
            </p>
            <small
              >{{ route.risk.sampleCount }} {{ t('planning.incidents') }} ·
              {{
                new Date(route.risk.validUntil).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}</small
            >
          </details>
        </article>
        <Button
          class="full-width"
          :label="active ? t('planning.change') : t('planning.start')"
          :loading="starting"
          @click="begin"
        />
        <p class="disclaimer"><AppIcon name="shield" :size="16" />{{ t('planning.disclaimer') }}</p>
      </div>
      <div v-else class="planning-empty">
        <span class="empty-illustration"
          ><AppIcon name="map" :size="36" /><span class="empty-route"
        /></span>
        <h2>{{ t('planning.empty') }}</h2>
        <p>{{ t('planning.emptyBody') }}</p>
      </div>
    </section>
    <section class="map-section">
      <MapCanvas
        :routes="routes.length ? routes : active?.route ? [active.route] : []"
        :selectedId="selectedId"
        :origin="origin"
        :destination="destination"
        :incidents="incidents"
        @point="setDestination"
      />
      <div v-if="routes.length" class="map-route-legend">
        <span v-for="(route, i) in routes" :key="route.id"
          ><i :class="'route-stroke-' + i" />{{ t('planning.route') }} {{ i + 1 }}</span
        >
      </div>
    </section>
  </div>
</template>
