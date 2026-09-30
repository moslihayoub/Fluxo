import { test, expect, Page } from '@playwright/test';
import { businessStore } from './mockFirestore';

async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
}

test.describe('Module Stock & Matières Scenarios', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem('charges-encaissements-store', JSON.stringify({
        state: store,
        version: 0,
      }));
      window.sessionStorage.setItem('guest_toast_shown', 'true');
    }, businessStore);

    await page.goto('/');
    await waitForAppReady(page);
    await expect(page.locator('h1').filter({ hasText: /Tableau de Bord/i })).toBeVisible({ timeout: 20000 });
  });

  test('Navigation Stock, Ouverture Drawer et Ajout d\'un article', async ({ page, isMobile }) => {
    // 1. Navigation vers le Stock
    if (isMobile) {
      const burger = page.getByRole('button', { name: 'Menu' }).last();
      await burger.waitFor({ state: 'visible', timeout: 5000 });
      await burger.click({ force: true });
      await page.waitForTimeout(500);
      const navOverlay = page.locator('[data-testid="mobile-nav-overlay"]');
      await navOverlay.waitFor({ state: 'visible', timeout: 5000 });
      await navOverlay.getByRole('button', { name: /Stock/i }).first().click();
    } else {
      await page.getByRole('navigation').getByRole('button', { name: /Stock/i }).click();
    }

    // 2. Vérification du Header Stock
    await expect(page.getByRole('heading', { name: /Stock & Matières/i, level: 1 })).toBeVisible({ timeout: 10000 });

    // 3. Ouvrir le Drawer "Ajouter"
    const addBtn = page.getByRole('button', { name: /Ajouter/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // 4. Vérifier que le tiroir s'ouvre avec le titre standard
    await expect(page.getByRole('heading', { name: /Nouvel article en stock/i })).toBeVisible({ timeout: 5000 });

    // 5. Remplir le formulaire
    await page.fill('input[placeholder*="Bobine PLA"]', 'Bobine Filament Carbone 1kg');

    // Soumettre le formulaire
    const submitBtn = page.getByRole('button', { name: /Créer l'article/i });
    await submitBtn.click();

    // 6. Vérifier que l'article apparaît dans la table
    await expect(page.getByText('Bobine Filament Carbone 1kg')).toBeVisible({ timeout: 10000 });
  });
});
