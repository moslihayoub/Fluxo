import { test, expect, Page } from '@playwright/test';
import { freelanceStore } from './mockFirestore';

async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

test.describe('Mode Pro Indépendant Scenarios', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((store) => {
      window.localStorage.setItem('charges-encaissements-store', JSON.stringify({
        state: store,
        version: 0,
      }));
      window.sessionStorage.setItem('guest_toast_shown', 'true');
    }, freelanceStore);

    await page.goto('/');
    await waitForAppReady(page);
    await expect(page.locator('h1').filter({ hasText: /Tableau de Bord/i })).toBeVisible({ timeout: 20000 });
  });

  test('Création de vente avec client et produit existant (Flux Indépendant)', async ({ page, isMobile }) => {
    // 1. Aller sur Ventes
    if (isMobile) {
      const burger = page.getByRole('button', { name: 'Menu' }).last();
      await burger.waitFor({ state: 'visible', timeout: 5000 });
      await burger.click({ force: true });
      await page.waitForTimeout(500);
      const navOverlay = page.locator('[data-testid="mobile-nav-overlay"]');
      await navOverlay.waitFor({ state: 'visible', timeout: 5000 });
      await navOverlay.getByRole('button', { name: /Ventes/i }).first().click();
    } else {
      await page.getByRole('navigation').getByRole('button', { name: 'Ventes' }).click();
    }
    await expect(page.locator('h1, h2').filter({ hasText: /Ventes/i }).first()).toBeVisible({ timeout: 10000 });

    // 2. Ouvrir le formulaire nouvelle vente
    await page.getByRole('button', { name: /Enregistrer une vente|Nouvelle Vente/i }).first().click();

    // 3. Attendre l'ouverture du formulaire "Nouvelle Vente"
    await expect(page.getByRole('heading', { name: 'Nouvelle Vente' })).toBeVisible({ timeout: 10000 });

    // 4. Remplir le prénom du client
    await page.getByRole('textbox', { name: 'Prénom du client' }).fill('TestIndep');

    // 5. Remplir le nom du produit
    const productInput = page.getByRole('textbox', { name: 'Chercher un produit ou saisir un nom...' });
    await productInput.fill('Prestation Dev');
    await page.waitForTimeout(300);

    const optionBtn = page.getByRole('button', { name: 'Prestation Dev' }).first();
    if (await optionBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await optionBtn.click({ force: true });
    }

    // 6. Remplir quantité (spinbutton = input[type=number])
    const spinbuttons = page.getByRole('spinbutton');
    const count = await spinbuttons.count();
    if (count >= 1) {
      await spinbuttons.first().fill('1');
    }

    // 7. Remplir prix de vente (2e spinbutton)
    if (count >= 2) {
      await spinbuttons.nth(1).fill('500');
    }

    // 8. Scroller jusqu'au bouton de soumission et cliquer
    const submitBtn = page.getByRole('button', { name: 'Valider la vente' });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // 9. Attendre la fermeture du formulaire
    await expect(page.getByRole('heading', { name: 'Nouvelle Vente' })).not.toBeVisible({ timeout: 10000 });

    // 10. Vérification dans la liste des ventes
    // Attendre que l'enregistrement apparaisse (l'élément peut être dans le DOM mais pas visible sur mobile)
    await page.waitForTimeout(1000);
    const isPresent = await page.getByText('TestIndep').count() > 0;
    expect(isPresent).toBe(true);
  });
});
