<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import AppIcon from '../../../shared/presentation/AppIcon.vue';
import { useJourney } from './useJourney';
const { t } = useI18n();
const { active, alerts, locationEnabled, suspended, error, finish, enableLocation } = useJourney();
const closing = ref(false);
async function end() {
  closing.value = true;
  try {
    await finish();
  } catch {
    error.value = 'SERVICE_UNAVAILABLE';
  } finally {
    closing.value = false;
  }
}
</script>
<template>
  <section v-if="active" class="journey-panel" aria-live="polite">
    <div class="section-heading">
      <h2><span class="live-dot" />{{ t('journey.title') }}</h2>
      <AppIcon name="walk" />
    </div>
    <p v-if="active.route?.demo" class="small muted">{{ t('planning.demoPosition') }}</p>
    <p v-else-if="!locationEnabled" class="small">{{ t('journey.location') }}</p>
    <Button
      v-if="!locationEnabled"
      :label="t('journey.allow')"
      size="small"
      @click="enableLocation"
    />
    <p v-if="suspended" class="inline-warning">{{ t('journey.suspended') }}</p>
    <h3 class="small">{{ t('journey.alerts') }}</h3>
    <div v-if="!alerts.length" class="small muted">{{ t('journey.noAlerts') }}</div>
    <div v-for="alert in alerts" :key="alert.id" class="journey-alert">
      <AppIcon name="bell" />
      <div>
        <strong>{{ t('reports.' + alert.category) }}</strong>
        <p>{{ t('journey.nearby') }}</p>
      </div>
    </div>
    <p v-if="error" class="inline-error">{{ t('errors.' + error, t('journey.denied')) }}</p>
    <Button
      :label="t('journey.finish')"
      severity="secondary"
      outlined
      size="small"
      :loading="closing"
      @click="end"
    />
  </section>
</template>
