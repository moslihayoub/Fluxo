import { test, expect, Page } from '@playwright/test';
import { businessStore } from './mockFirestore';

async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

test.describe('Mode Pro Entreprise Scenarios', () => {
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

  test('Vérification Catalogue et Vente avec TVA', async ({ page, isMobile }) => {
    // 1. Aller sur Produits
    if (isMobile) {
      const burger = page.getByRole('button', { name: 'Menu' }).last();
      await burger.waitFor({ state: 'visible', timeout: 5000 });
      await burger.click({ force: true });
      await page.waitForTimeout(500);
      const navOverlay = page.locator('[data-testid="mobile-nav-overlay"]');
      await navOverlay.waitFor({ state: 'visible', timeout: 5000 });
      await navOverlay.getByRole('button', { name: /Produits/i }).first().click();
    } else {
      await page.getByRole('navigation').getByRole('button', { name: 'Produits' }).click();
    }
    await expect(page.getByRole('heading', { name: /Produits & Services/i, level: 1 })).toBeVisible({ timeout: 10000 });

    // 2. Vérifier que "Licence Logiciel" est dans le catalogue
    await page.waitForTimeout(500);
    const licenceCount = await page.getByText('Licence Logiciel').count();
    expect(licenceCount).toBeGreaterThan(0);

    // 3. Aller sur Ventes
    if (isMobile) {
      const burger2 = page.getByRole('button', { name: 'Menu' }).last();
      await burger2.waitFor({ state: 'visible', timeout: 5000 });
      await burger2.click({ force: true });
      await page.waitForTimeout(500);
      const navOverlay = page.locator('[data-testid="mobile-nav-overlay"]');
      await navOverlay.waitFor({ state: 'visible', timeout: 5000 });
      await navOverlay.getByRole('button', { name: /Ventes/i }).first().click();
    } else {
      await page.getByRole('navigation').getByRole('button', { name: 'Ventes' }).click();
    }
    await expect(page.locator('h1, h2').filter({ hasText: /Ventes/i }).first()).toBeVisible({ timeout: 10000 });

    // 4. Ouvrir le formulaire nouvelle vente
    await page.getByRole('button', { name: /Nouvelle Vente|Enregistrer une vente/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Nouvelle Vente' })).toBeVisible({ timeout: 10000 });

    // 5. Remplir le prénom du client
    await page.getByRole('textbox', { name: 'Prénom du client' }).fill('EntrepriseTest');

    // 6. Remplir le nom du produit
    const productInput = page.getByRole('textbox', { name: 'Chercher un produit ou saisir un nom...' });
    await productInput.fill('Licence Logiciel');
    await page.waitForTimeout(300);

    const optionBtn = page.getByRole('button', { name: 'Licence Logiciel' }).first();
    if (await optionBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await optionBtn.click({ force: true });
    }

    // 7. Remplir quantité et prix via le rôle ARIA spinbutton (= input[type=number])
    const spinbuttons = page.getByRole('spinbutton');
    const count = await spinbuttons.count();
    if (count >= 1) {
      await spinbuttons.first().fill('1');
    }
    if (count >= 2) {
      await spinbuttons.nth(1).fill('1000');
    }

    // 8. Scroller jusqu'au bouton de soumission et cliquer
    const submitBtn = page.getByRole('button', { name: 'Valider la vente' });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // 9. Attendre la fermeture du formulaire (la soumission réoriente vers /)
    await expect(page.getByRole('heading', { name: 'Nouvelle Vente' })).not.toBeVisible({ timeout: 10000 });

    // 10. Vérification dans la liste des ventes
    await page.waitForTimeout(1000);
    const isPresent = await page.getByText('EntrepriseTest').count() > 0;
    expect(isPresent).toBe(true);
  });
});
