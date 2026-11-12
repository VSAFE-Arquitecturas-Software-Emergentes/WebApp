<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import AppIcon from '../../../shared/presentation/AppIcon.vue';
import { historyStorage } from '../../history/infrastructure/local-history';
import { useJourney } from '../../journeys/presentation/useJourney';
const { t } = useI18n();
const { consent } = historyStorage;
const { active, finish, stopTracking } = useJourney();
const notice = ref('');
async function stop() {
  stopTracking();
  try {
    if (active.value) await finish();
    notice.value = t('preferences.stopped');
  } catch {
    notice.value = t('errors.SERVICE_UNAVAILABLE');
  }
}
function clear() {
  historyStorage.clear();
  notice.value = t('history.clear');
}
</script>
<template>
  <div class="content-page narrow-page">
    <header class="page-heading">
      <span class="feature-icon"><AppIcon name="settings" :size="26" /></span>
      <div>
        <h1>{{ t('preferences.title') }}</h1>
        <p>{{ t('preferences.subtitle') }}</p>
      </div>
    </header>
    <div v-if="notice" role="status" class="info-strip">{{ notice }}</div>
    <section class="preference-section surface">
      <div class="preference-row">
        <div>
          <label for="history-consent">{{ t('preferences.history') }}</label>
          <p>{{ t('preferences.historyBody') }}</p>
        </div>
        <ToggleSwitch
          inputId="history-consent"
          :modelValue="consent"
          @update:modelValue="historyStorage.setConsent"
        />
      </div>
      <Button :label="t('preferences.clear')" severity="secondary" outlined @click="clear" />
    </section>
    <section class="preference-section surface">
      <h2>{{ t('preferences.location') }}</h2>
      <p>{{ t('preferences.locationBody') }}</p>
      <Button :label="t('preferences.location')" severity="secondary" outlined @click="stop" />
    </section>
    <section class="privacy-note">
      <AppIcon name="shield" :size="28" />
      <div>
        <h2>{{ t('preferences.privacy') }}</h2>
        <p>{{ t('preferences.privacyBody') }}</p>
      </div>
    </section>
  </div>
</template>
