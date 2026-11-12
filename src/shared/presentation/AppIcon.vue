<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 });
const paths: Record<string, string[]> = {
  shield: ['M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6l-8-3Z', 'm8 12 3 3 5-6'],
  map: ['m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z', 'M9 3v15M15 6v15'],
  report: ['M4 5h16v13H8l-4 3V5Z', 'M12 8v4m0 3h.01'],
  history: ['M3 11a9 9 0 1 1 2 7', 'M3 4v7h7', 'M12 7v5l3 2'],
  settings: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    'm9 3-1 3-3 1-2 3 2 3 1 3 3 2 3-1 3-1 3-3-1-3-1-3-3-2-3 1Z',
  ],
  arrow: ['M5 12h14m-5-5 5 5-5 5'],
  swap: ['M7 3v16m-4-4 4 4 4-4', 'M17 21V5m-4 4 4-4 4 4'],
  pin: ['M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  locate: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    'M12 2v3m0 14v3M2 12h3m14 0h3',
    'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z',
  ],
  walk: [
    'M14 3h.01',
    'm10 8 4-3 3 4 4 1',
    'm14 5-2 8-5 7',
    'm12 13 5 3 1 5',
    'M14 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
  ],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11v6m0-10h.01'],
  check: ['m5 12 4 4 10-10'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3 2'],
  layers: ['m12 3 10 6-10 6L2 9l10-6Z', 'm2 13 10 6 10-6m-20 4 10 6 10-6'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  close: ['m6 6 12 12M6 18 18 6'],
  chevron: ['m9 5 7 7-7 7'],
  trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7'],
  bell: ['M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3Z', 'M10 21h4'],
  link: [
    'm10 13 4-4',
    'M8 15l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0',
    'm16 9 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  ],
};
</script>
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(p, i) in paths[name] || paths.info" :key="i" :d="p" />
  </svg>
</template>
