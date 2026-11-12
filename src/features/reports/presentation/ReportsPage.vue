<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import AppIcon from '../../../shared/presentation/AppIcon.vue';
import MapCanvas from '../../../shared/presentation/MapCanvas.vue';
import { dependencies } from '../../../app/container';
import { ApiError } from '../../../shared/infrastructure/http-client';
import type { Report, Audit } from '../domain/models';
const { t } = useI18n();
const cases = dependencies.reports;
const category = ref('THEFT'),
  description = ref(''),
  location = ref({ lat: -12.1211, lng: -77.0303 });
const localTime = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const observed = ref(localTime()),
  preview = ref(false),
  busy = ref(false),
  error = ref(''),
  received = ref(false),
  reports = ref<Report[]>([]),
  audits = ref<Record<string, Audit>>({}),
  checking = ref('');
let key = crypto.randomUUID();
const categories = computed(() =>
  ['THEFT', 'ASSAULT', 'HARASSMENT', 'OBSTRUCTION'].map((value) => ({
    value,
    label: t('reports.' + value),
  })),
);
const input = () => ({
  category: category.value,
  description: description.value,
  location: { ...location.value },
  observedAt: new Date(observed.value).toISOString(),
});
watch(
  [category, description, location, observed],
  () => {
    key = crypto.randomUUID();
    received.value = false;
  },
  { deep: true },
);
async function load() {
  try {
    reports.value = await cases.gateway.list();
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'REQUEST_FAILED';
  }
}
onMounted(load);
async function submit() {
  busy.value = true;
  error.value = '';
  try {
    await cases.submit(input(), key);
    key = crypto.randomUUID();
    preview.value = false;
    description.value = '';
    await load();
    received.value = true;
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'REQUEST_FAILED';
  } finally {
    busy.value = false;
  }
}
async function audit(id: string) {
  checking.value = id;
  try {
    audits.value[id] = await cases.gateway.audit(id);
  } catch (e) {
    error.value = e instanceof ApiError ? e.code : 'REQUEST_FAILED';
  } finally {
    checking.value = '';
  }
}
function statusText(status: string) {
  return status === 'PUBLISHED'
    ? t('reports.published')
    : status === 'DUPLICATE'
      ? t('reports.duplicate')
      : t('reports.expired');
}
function auditText(status: string) {
  return status === 'VERIFIED'
    ? t('reports.verified')
    : status === 'MISMATCH'
      ? t('reports.mismatch')
      : status === 'PENDING'
        ? t('reports.pending')
        : t('reports.unavailable');
}
</script>
<template>
  <div class="content-page">
    <header class="page-heading">
      <span class="feature-icon"><AppIcon name="report" :size="26" /></span>
      <div>
        <h1>{{ t('reports.title') }}</h1>
        <p>{{ t('reports.subtitle') }}</p>
      </div>
    </header>
    <div v-if="error" class="inline-error" role="alert">
      {{ t('errors.' + error, t('errors.REQUEST_FAILED')) }}
    </div>
    <div v-if="received" class="success-message" role="status">
      <AppIcon name="check" />
      <div>
        <strong>{{ t('reports.received') }}</strong>
        <p>{{ t('reports.receivedBody') }}</p>
      </div>
    </div>
    <div class="reports-layout">
      <form class="report-form surface" @submit.prevent="preview = true">
        <label for="category">{{ t('reports.category') }}</label><Select
          inputId="category"
          v-model="category"
          :options="categories"
          optionLabel="label"
          optionValue="value"
        /><label for="observed">{{ t('reports.time') }}</label
        ><input
          id="observed"
          v-model="observed"
          type="datetime-local"
          :max="localTime()"
          required
        /><label for="description">{{ t('reports.description') }}</label
        ><Textarea
          id="description"
          v-model="description"
          rows="4"
          maxlength="500"
          :placeholder="t('reports.optional')"
          aria-describedby="description-help"
        /><small id="description-help" class="muted"
          >{{ t('reports.optional') }} {{ description.length }}/500</small
        ><label>{{ t('reports.place') }}</label>
        <div class="coordinate-fields">
          <label
            >{{ t('planning.lat')
            }}<input
              v-model.number="location.lat"
              type="number"
              step="0.0001"
              min="-12.5"
              max="-11.5"
              required /></label
          ><label
            >{{ t('planning.lng')
            }}<input
              v-model.number="location.lng"
              type="number"
              step="0.0001"
              min="-77.4"
              max="-76.5"
              required
          /></label>
        </div>
        <small class="muted">{{ t('reports.limit') }}</small><Button
          type="submit"
          :label="t('reports.preview')"
        />
      </form>
      <div class="report-map">
        <MapCanvas :marker="location" @point="location = $event" />
        <div class="report-map-caption">
          <AppIcon name="pin" :size="16" />{{ t('reports.mapHint') }}
        </div>
      </div>
    </div>
    <section class="contributions">
      <div class="section-heading">
        <h2>{{ t('reports.list') }}</h2>
        <span class="count-badge">{{ reports.length }}</span>
      </div>
      <p v-if="!reports.length" class="empty-row">{{ t('reports.empty') }}</p>
      <article v-for="report in reports" :key="report.id" class="contribution surface">
        <div class="contribution-top">
          <span class="feature-icon small-icon"><AppIcon name="report" /></span>
          <div>
            <h3>{{ t('reports.' + report.category) }}</h3>
            <small class="muted">{{ new Date(report.observedAt).toLocaleString() }}</small>
          </div>
          <span class="status-pill">{{ statusText(report.status) }}</span>
        </div>
        <p v-if="report.description">{{ report.description }}</p>
        <p class="small muted">{{ t('reports.verification') }}</p>
        <div class="audit-row">
          <Button
            size="small"
            severity="secondary"
            outlined
            :label="t('reports.integrity')"
            :loading="checking === report.id"
            @click="audit(report.id)"
          />
          <div v-if="audits[report.id]" class="audit-result" role="status">
            <p
              v-for="version in audits[report.id].versions"
              :key="version.version"
              :class="{ verified: version.status === 'VERIFIED' }"
            >
              <AppIcon :name="version.status === 'VERIFIED' ? 'shield' : 'clock'" :size="16" />v{{
                version.version
              }}: {{ auditText(version.status) }}
            </p>
            <small>{{ t('reports.auditScope') }}</small>
          </div>
        </div>
      </article>
    </section>
    <Dialog
      v-model:visible="preview"
      modal
      :header="t('reports.confirm')"
      :style="{ width: '440px', maxWidth: '95vw' }"
      ><dl class="review-list">
        <dt>{{ t('reports.category') }}</dt>
        <dd>{{ t('reports.' + category) }}</dd>
        <dt>{{ t('reports.time') }}</dt>
        <dd>{{ new Date(observed).toLocaleString() }}</dd>
        <dt>{{ t('reports.location') }}</dt>
        <dd>{{ Number(location.lat).toFixed(4) }}, {{ Number(location.lng).toFixed(4) }}</dd>
      </dl>
      <p class="small muted">{{ t('reports.verification') }}</p>
      <p v-if="error" class="inline-error">
        {{ t('errors.' + error, t('errors.REQUEST_FAILED')) }}
      </p>
      <template #footer
        ><Button severity="secondary" :label="t('cancel')" @click="preview = false" /><Button
          :label="t('reports.send')"
          :loading="busy"
          @click="submit" /></template
    ></Dialog>
  </div>
</template>
