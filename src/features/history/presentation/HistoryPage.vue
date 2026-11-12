<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import AppIcon from '../../../shared/presentation/AppIcon.vue';
import { historyStorage } from '../infrastructure/local-history';
import type { HistoryEntry } from '../domain/history';
const { t } = useI18n();
const router = useRouter();
const items = ref(historyStorage.list());
function clear() {
  historyStorage.clear();
  items.value = [];
}
function reuse(item: HistoryEntry) {
  void router.push({
    path: '/explore',
    state: { origin: { ...item.origin }, destination: { ...item.destination } },
  });
}
</script>
<template>
  <div class="content-page narrow-page">
    <header class="page-heading">
      <span class="feature-icon"><AppIcon name="history" :size="26" /></span>
      <div>
        <h1>{{ t('history.title') }}</h1>
        <p>{{ t('history.subtitle') }}</p>
      </div>
    </header>
    <div class="info-strip"><AppIcon name="info" />{{ t('history.notice') }}</div>
    <div v-if="!items.length" class="large-empty">
      <AppIcon name="history" :size="46" />
      <h2>{{ t('history.empty') }}</h2>
      <p>{{ t('history.enable') }}</p>
      <RouterLink to="/preferences">{{ t('nav.preferences') }}</RouterLink>
    </div>
    <div v-else>
      <div class="section-heading">
        <span class="small muted">{{ items.length }} / 20</span
        ><Button
          :label="t('history.clear')"
          severity="secondary"
          outlined
          size="small"
          @click="clear"
        />
      </div>
      <article v-for="item in items" :key="item.id" class="history-item surface">
        <AppIcon name="walk" :size="24" />
        <div>
          <h2>{{ item.origin.label }} <span class="muted">→</span> {{ item.destination.label }}</h2>
          <small class="muted">{{ new Date(item.at).toLocaleString() }}</small>
        </div>
        <Button
          :label="t('history.reuse')"
          severity="secondary"
          size="small"
          @click="reuse(item)"
        />
      </article>
    </div>
  </div>
</template>
