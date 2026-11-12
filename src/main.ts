import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import App from './App.vue';
import { i18n } from './shared/presentation/i18n';
import './styles.css';
const theme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#effafa',
      100: '#d5f0ef',
      200: '#ace0de',
      300: '#76c8c5',
      400: '#3aa6a6',
      500: '#0a8387',
      600: '#087075',
      700: '#0c5b61',
      800: '#124a51',
      900: '#123b46',
      950: '#0b2730',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
      },
    },
  },
});
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/explore' },
    {
      path: '/explore',
      component: () => import('./features/planning/presentation/PlanningPage.vue'),
    },
    {
      path: '/reports',
      component: () => import('./features/reports/presentation/ReportsPage.vue'),
    },
    {
      path: '/history',
      component: () => import('./features/history/presentation/HistoryPage.vue'),
    },
    {
      path: '/preferences',
      component: () => import('./features/preferences/presentation/PreferencesPage.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/explore' },
  ],
});
createApp(App)
  .use(router)
  .use(i18n)
  .use(PrimeVue, { theme: { preset: theme, options: { darkModeSelector: false } }, ripple: false })
  .mount('#app');
