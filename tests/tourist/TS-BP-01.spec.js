import { expect, test } from "@playwright/test";

async function goToGuestHome(page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

async function searchPackage(page, keyword) {
  const searchInput = page
    .getByPlaceholder(/ค้นหา/i)
    .or(page.locator('input[placeholder="ค้นหา"]'))
    .first();

  await expect(searchInput).toBeVisible();
  await searchInput.fill(keyword);

  // Some pages filter instantly, some on Enter.
  await searchInput.press("Enter").catch(() => {});
  await page.waitForTimeout(500);
}

async function openFirstPackageDetail(page) {
  const detailButton = page
    .getByRole("button", { name: /ดูรายละเอียด|รายละเอียด|Detail/i })
    .first();

  if (await detailButton.isVisible().catch(() => false)) {
    await detailButton.click();
  } else {
    // Fallback: click the first package card itself (home page uses <article> cards).
    const firstCard = page.getByRole("article").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
  }

  await page.waitForLoadState("networkidle");

  // Best practice: assert we actually navigated to a detail route
  await expect(page).toHaveURL(/package/i);
}

test.describe("Tourist - TS-BP-01 Guest Mode book package", () => {
  /**
   * TS-BP-01 / TC-BP-01
   * ตรวจสอบว่า Guest Mode ไม่สามารถกด “จอง” ได้
   */
  test('TC-BP-01: ตรวจสอบว่า Guest Mode ไม่สามารถกด “จอง” ได้', async ({
    page,
  }) => {
    await goToGuestHome(page);

    // Step 2: ค้นหาแพ็กเกจ (keyword = "ทะเล")
    await searchPackage(page, "ทะเล");

    // Step 3: เปิดหน้ารายละเอียด
    await openFirstPackageDetail(page);

    // Step 4: กด “จอง”
    const bookBtn = page
      .getByRole("button", { name: /^จอง$/ })
      .or(page.getByRole("button", { name: /จอง/ }))
      .first();

    // booking button might be below the fold on detail page
    await bookBtn.scrollIntoViewIfNeeded();
    await expect(bookBtn).toBeVisible();

    // Expected (per system behavior): guest is redirected to login page
    await Promise.all([
      page.waitForURL(/\/guest\/login/),
      bookBtn.click(),
    ]);

    // Final-result assertion: user sees login page UI
    await expect(page.getByRole("button", { name: /เข้าสู่ระบบ/i })).toBeVisible();

    // Final-result assertion: must NOT land on any confirm/payment flow
    await expect(page).not.toHaveURL(/confirm|payment|checkout|upload/i);
  });
});

