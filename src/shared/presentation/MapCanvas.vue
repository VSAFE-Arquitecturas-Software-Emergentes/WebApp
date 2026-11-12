<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AppIcon from './AppIcon.vue';
import { useI18n } from 'vue-i18n';
import type { Point, RouteAlternative } from '../../features/planning/domain/models';
const props = withDefaults(
  defineProps<{
    routes?: RouteAlternative[];
    selectedId?: string;
    origin?: Point;
    destination?: Point;
    incidents?: { id: string; location: Point; category: string }[];
    marker?: Point;
  }>(),
  { routes: () => [], incidents: () => [] },
);
const emit = defineEmits<{ point: [Point] }>();
const { t } = useI18n();
const element = ref<HTMLElement>();
let map: L.Map;
let group: L.LayerGroup;
const showIncidents = ref(true);
let observer: ResizeObserver;
const colors = ['#087e83', '#e89559', '#768fc0'];
function dot(p: Point, label: string, kind = 'point') {
  const html = document.createElement('span');
  html.className = `map-dot ${kind}`;
  html.textContent = label;
  return L.marker([p.lat, p.lng], {
    icon: L.divIcon({ html, className: 'map-marker', iconSize: [30, 30], iconAnchor: [15, 15] }),
  });
}
function render(fit = false) {
  if (!group) return;
  group.clearLayers();
  for (const [i, r] of [...props.routes]
    .sort((a, b) => Number(a.id === props.selectedId) - Number(b.id === props.selectedId))
    .entries()) {
    const selected = r.id === props.selectedId;
    L.polyline(
      r.geometry.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple),
      { color: '#fff', weight: selected ? 10 : 7, opacity: 0.95 },
    ).addTo(group);
    L.polyline(
      r.geometry.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple),
      {
        color: colors[props.routes.indexOf(r)] || colors[i % 3],
        weight: selected ? 6 : 4,
        opacity: selected ? 1 : 0.65,
        dashArray: selected ? undefined : '8 6',
      },
    ).addTo(group);
  }
  if (props.origin) dot(props.origin, 'A').addTo(group);
  if (props.destination) dot(props.destination, 'B', 'destination').addTo(group);
  if (props.marker) dot(props.marker, '+', 'destination').addTo(group);
  if (showIncidents.value)
    for (const i of props.incidents) {
      const marker = L.circleMarker([i.location.lat, i.location.lng], {
        radius: 7,
        color: '#fff',
        weight: 2,
        fillColor: '#b26848',
        fillOpacity: 0.9,
      });
      const text = document.createElement('span');
      text.textContent = t('reports.' + i.category);
      marker.bindTooltip(text).addTo(group);
    }
  if (fit && props.routes.length) {
    const points = props.routes.flatMap((r) =>
      r.geometry.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple),
    );
    map.fitBounds(L.latLngBounds(points), { padding: [65, 65], maxZoom: 16, animate: false });
  }
}
onMounted(() => {
  map = L.map(element.value!, { zoomControl: false, scrollWheelZoom: true }).setView(
    [-12.121, -77.034],
    15,
  );
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
  group = L.layerGroup().addTo(map);
  map.on('click', (e: L.LeafletMouseEvent) =>
    emit('point', { lat: e.latlng.lat, lng: e.latlng.lng }),
  );
  observer = new ResizeObserver(() => map.invalidateSize());
  observer.observe(element.value!);
  render(true);
});
watch(
  () => props.routes,
  () => render(true),
  { deep: true },
);
watch(
  () => [
    props.selectedId,
    props.origin,
    props.destination,
    props.incidents,
    props.marker,
    showIncidents.value,
  ],
  () => render(),
  { deep: true },
);
onBeforeUnmount(() => {
  observer?.disconnect();
  map?.remove();
});
</script>
<template>
  <div class="map-wrap">
    <div ref="element" class="map-canvas" role="region" :aria-label="t('planning.map')" />
    <div class="map-location">
      <span class="live-dot" />{{ t('city') }}<span class="map-location-divider" />{{
        t('walking')
      }}
    </div>
    <div class="map-tools">
      <button
        class="map-tool"
        :aria-label="t('planning.incidents')"
        :aria-pressed="showIncidents"
        @click="showIncidents = !showIncidents"
      >
        <AppIcon name="layers" />
      </button>
      <div class="zoom-tools">
        <button class="map-tool" aria-label="Zoom in" @click="map.zoomIn()">
          <AppIcon name="plus" /></button
        ><button class="map-tool" aria-label="Zoom out" @click="map.zoomOut()">
          <AppIcon name="minus" />
        </button>
      </div>
      <button class="map-tool" :aria-label="t('city')" @click="map.setView([-12.121, -77.034], 15)">
        <AppIcon name="locate" />
      </button>
    </div>
    <div class="map-footnote"><AppIcon name="info" :size="15" />{{ t('planning.pointHint') }}</div>
  </div>
</template>
