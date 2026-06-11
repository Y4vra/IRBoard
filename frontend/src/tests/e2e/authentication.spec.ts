import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL ?? (() => { throw new Error('INITIAL_ADMIN_EMAIL is not set') })();
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD ?? (() => { throw new Error('INITIAL_ADMIN_PASSWORD is not set') })();

export async function login(page:Page, email: string, password: string) {
  await page.goto('/login');

  await expect(page.getByText('Welcome to IR-Board!')).toBeVisible();
  await expect(page.getByText('Enter your email below to login to the site')).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(/\/(home)?$/);
}
export async function logout(page:Page){
  await page.locator('.fixed.top-4.left-4').hover();
  const logoutButton = page.getByTestId('logout_button');
  await expect(logoutButton).toBeVisible();

  await logoutButton.click();

  await page.waitForURL(/\/login$/);
}

test.describe('Authentication flow', () => {
  test('user logs in successfully and arrives at the homepage', async ({ page }) => {
    await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);
    
    await expect(page.getByTestId("home_header")).toBeVisible();
    await expect(page.getByText('Explore the projects you have access to.')).toBeVisible();
  });

  test('login page redirects to home if already authenticated', async ({ page }) => {
    await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

    await page.goto('/login');
    await page.waitForURL(/\/(home)?$/);
    await expect(page.getByTestId("home_header")).toBeVisible();
  });

  test('logout removes session', async ({ page }) => {
    await login(page,ADMIN_EMAIL,ADMIN_PASSWORD);

    await logout(page);

    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    await expect(page.getByTestId('home_header')).not.toBeVisible();
  });

  test('shows error alert on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@irboard.com');
    await page.getByLabel('Password').fill('wrongpassword');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Invalid credentials');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Welcome to IR-Board!')).toBeVisible();
  });
});