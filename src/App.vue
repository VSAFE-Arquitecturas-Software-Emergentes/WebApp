<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppIcon from './shared/presentation/AppIcon.vue';
import { ensureSession, demoMode } from './shared/infrastructure/http-client';
import { historyStorage } from './features/history/infrastructure/local-history';
const { t, locale } = useI18n();
const connectionError = ref(false);
const nav = [
  { to: '/explore', icon: 'map', key: 'explore' },
  { to: '/reports', icon: 'report', key: 'reports' },
  { to: '/history', icon: 'history', key: 'history' },
  { to: '/preferences', icon: 'settings', key: 'preferences' },
];
async function connect() {
  connectionError.value = false;
  try {
    await ensureSession();
  } catch {
    connectionError.value = true;
  }
}
onMounted(() => {
  historyStorage.list();
  void connect();
});
watch(
  locale,
  (value) => {
    localStorage.setItem('vsafe.locale', value);
    document.documentElement.lang = value === 'es_419' ? 'es' : 'en';
  },
  { immediate: true },
);
</script>
<template>
  <div class="app-shell">
    <a href="#main" class="skip-link">{{
      locale === 'es_419' ? 'Saltar al contenido' : 'Skip to content'
    }}</a>
    <header class="app-header">
      <RouterLink to="/explore" class="brand" aria-label="VSafe"
        ><span class="brand-mark"><AppIcon name="shield" :size="26" /></span>VSafe<span
          class="brand-tagline"
          >{{ t('brand') }}</span
        ></RouterLink
      >
      <div class="header-right">
        <span class="city-label"><AppIcon name="pin" :size="16" />{{ t('city') }}</span
        ><label class="language-select"
          ><span class="sr-only">{{ t('language') }}</span
          ><select v-model="locale">
            <option value="en_US">EN</option>
            <option value="es_419">ES</option>
          </select></label
        ><span class="profile-avatar" aria-hidden="true">V</span>
      </div>
    </header>
    <nav
      class="side-nav"
      :aria-label="locale === 'es_419' ? 'Navegación principal' : 'Main navigation'"
    >
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :aria-label="t('nav.' + item.key)"
        :title="t('nav.' + item.key)"
        ><AppIcon :name="item.icon" :size="23" /><span>{{ t('nav.' + item.key) }}</span></RouterLink
      ><span class="nav-bottom"><AppIcon name="shield" :size="23" /></span>
    </nav>
    <div class="workspace">
      <div v-if="demoMode" class="demo-banner">
        <AppIcon name="info" :size="15" />{{ t('demo') }}
      </div>
      <div v-if="connectionError" class="connection-banner" role="alert">
        {{ t('offline') }}<button @click="connect">{{ t('retry') }}</button>
      </div>
      <main id="main"><RouterView /></main>
    </div>
  </div>
</template>
