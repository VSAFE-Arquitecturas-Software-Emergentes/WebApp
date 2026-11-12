import { test, expect } from '@playwright/test';
import path from 'node:path';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vsafe.locale', 'es_419'));
});
test('manual coordinates update both place label and requested route', async ({ page }) => {
  await page.goto('/explore');
  await page.locator('.manual-points summary').click();
  await page.getByLabel('A Latitud', { exact: true }).fill('-12.1199');
  await page.getByLabel('A Latitud', { exact: true }).blur();
  await expect(page.locator('.place-select').first()).toContainText('-12.1199');
  const response = page.waitForResponse(
    (r) => r.url().endsWith('/api/v1/routes/search') && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Comparar rutas', exact: true }).click();
  const result = await (await response).json();
  expect(result.routes[0].geometry.coordinates[0][1]).toBe(-12.1199);
});

test('walking comparison, consent, history and journey lifecycle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/preferences');
  await page.getByRole('switch').check();
  await page.getByRole('link', { name: 'Explorar', exact: true }).click();
  await page.getByRole('button', { name: 'Comparar rutas', exact: true }).click();
  await expect(page.locator('.route-card')).toHaveCount(3);
  await expect(page.locator('.demo-banner')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.resolve('test-results/screenshots/web-desktop.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Iniciar este recorrido', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tu recorrido está activo' })).toBeVisible();
  await page.getByRole('button', { name: 'Finalizar recorrido', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tu recorrido está activo' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Historial', exact: true }).click();
  await expect(page.locator('.history-item')).toHaveCount(1);
  await page.getByRole('button', { name: 'Comparar otra vez' }).click();
  await expect(page.locator('.route-card')).toHaveCount(3);
  expect(errors).toEqual([]);
});

test('report review preserves input and shows blockchain evidence state', async ({ page }) => {
  await page.goto('/reports');
  await page.locator('#description').fill('Observación sintética desde la prueba de interfaz.');
  await page.getByRole('button', { name: 'Revisar reporte' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.locator('#description')).toHaveValue(
    'Observación sintética desde la prueba de interfaz.',
  );
  await page.getByRole('button', { name: 'Revisar reporte' }).click();
  await page.getByRole('button', { name: 'Enviar reporte', exact: true }).click();
  await expect(page.getByText('Reporte recibido', { exact: true })).toBeVisible();
  await expect(page.locator('.contribution')).toHaveCount(1);
  await page.getByRole('button', { name: 'Comprobar integridad del registro' }).click();
  await expect(page.locator('.audit-result')).toBeVisible();
});

test('mobile routes and all feature pages fit without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/explore', '/reports', '/history', '/preferences']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.goto('/explore');
  await page.getByRole('button', { name: 'Comparar rutas', exact: true }).click();
  await expect(page.locator('.route-card')).toHaveCount(3);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.resolve('test-results/screenshots/web-mobile.png'),
    fullPage: true,
  });
});
