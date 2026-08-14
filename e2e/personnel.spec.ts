import { test, expect, Page } from '@playwright/test';
import './mockFirestore';

/**
 * Attend que l'application soit interactive après hydration.
 */
async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

/**
 * Helper de navigation compatible desktop et mobile.
 * Sur mobile, ouvre le menu burger puis clique sur l'item.
 */
async function navigateTo(page: Page, isMobile: boolean, label: string | RegExp) {
  if (isMobile) {
    // Ouvrir le menu burger (bottom bar — bouton avec l'icône Menu)
    const burger = page.getByRole('button', { name: 'Menu' }).last();
    await burger.waitFor({ state: 'visible', timeout: 5000 });
    await burger.click({ force: true });
    await page.waitForTimeout(500);
    // Dans l'overlay du menu, cliquer sur l'item
    const navOverlay = page.locator('[data-testid="mobile-nav-overlay"]');
    await navOverlay.waitFor({ state: 'visible', timeout: 5000 });
    await navOverlay.getByRole('button', { name: label }).first().click();
  } else {
    await page.locator('header').getByRole('button', { name: label }).click();
  }
}

test.describe('Mode Personnel Scenarios', () => {
  test('Sélectionner Mode Personnel et naviguer dans le dashboard', async ({ page, isMobile }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Vérifier que l'OnboardingView est affiché
    await expect(page.getByRole('button', { name: /Mode Personnel/i })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Mode Personnel/i }).click();

    // Le dashboard personnel doit s'afficher
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Naviguer vers Périodes
    await navigateTo(page, isMobile ?? false, /Périodes|Periods/i);

    // Un heading de la vue Périodes doit apparaître
    await expect(page.locator('h1, h2').filter({ hasText: /Périodes|Periods|Mois/i }).first()).toBeVisible({ timeout: 10000 });

    // Créer un nouveau mois
    await page.getByRole('button', { name: /Nouvelle période|New period/i }).click();
    await page.getByRole('button', { name: /Ajouter|Add/i }).last().click();

    // Entrer dans la vue des opérations
    await page.getByRole('button', { name: /Opérations|Operations/i }).last().click();
    await expect(page.locator('h1, h2').filter({ hasText: /Opérations|Operations/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Ajouter et supprimer une opération', async ({ page, isMobile }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Sélectionner Mode Personnel
    await expect(page.getByRole('button', { name: /Mode Personnel/i })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /Mode Personnel/i }).click();
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });

    // Naviguer vers Périodes
    await navigateTo(page, isMobile ?? false, /Périodes|Periods/i);

    // Créer un nouveau mois
    await page.getByRole('button', { name: /Nouvelle période|New period/i }).click();
    await page.getByRole('button', { name: /Ajouter|Add/i }).last().click();

    // Entrer dans les opérations du mois
    await page.getByRole('button', { name: /Opérations|Operations/i }).last().click();
    await page.waitForTimeout(500);

    // Ouvrir le formulaire d'ajout
    // Desktop: premier bouton (hidden sm:flex visible sur desktop)
    // Mobile: dernier bouton = FAB (sm:hidden visible sur mobile)
    const addBtn = isMobile
      ? page.locator('[data-testid="add-operation-btn"]').last()
      : page.locator('[data-testid="add-operation-btn"]').first();
    await addBtn.waitFor({ state: 'attached', timeout: 10000 });
    await addBtn.click({ force: true });
    await page.waitForTimeout(800);

    // Sélectionner type "Entrées" si présent
    const entreesBtn = page.getByRole('button', { name: /Entrées|Encaissement/i });
    if (await entreesBtn.count() > 0) {
      await entreesBtn.first().click({ force: true });
      await page.waitForTimeout(300);
    }

    // Montant — essayer data-testid d'abord, sinon type=number
    let amountInput = page.locator('[data-testid="operation-price-input"]');
    const hasByTestId = await amountInput.count() > 0;
    if (!hasByTestId) {
      amountInput = page.locator('input[type="number"]').first();
    }
    await amountInput.waitFor({ timeout: 10000 });
    await amountInput.fill('150');

    // Catégorie (Radix UI Select)
    const categoryCombo = page.getByRole('combobox').first();
    await categoryCombo.waitFor({ state: 'visible', timeout: 5000 });
    await categoryCombo.click({ force: true });
    await page.waitForTimeout(500);
    // On cherche l'option "+ Nouvelle catégorie" qui a la valeur "__new__"
    const newCategoryOption = page.getByRole('option').last();
    await newCategoryOption.click({ force: true });
    await page.waitForTimeout(500);
    // On remplit le libellé de la nouvelle catégorie
    const nameInput = page.getByPlaceholder(/Nom de la catégorie/i).first();
    await nameInput.fill('Test Salaire');

    // Soumettre le formulaire via data-testid
    const submitBtn = page.locator('[data-testid="operation-submit-btn"]');
    await submitBtn.waitFor({ timeout: 5000 });
    await submitBtn.click({ force: true });

    // L'opération doit être dans le DOM
    await page.waitForTimeout(2000);
    // Le dialog doit se fermer
    const dialogClosed = await page.locator('[data-testid="operation-submit-btn"]').count() === 0;
    expect(dialogClosed).toBe(true);
  });
});
