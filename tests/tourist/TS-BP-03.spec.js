import { expect, test } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

async function goToTouristHome(page) {
  await loginAs(page, "tourist");
  await page.goto("/tourist/home");
  await page.waitForLoadState("networkidle");
}

async function searchPackage(page, keyword) {
  const searchInput = page
    .getByPlaceholder(/ค้นหา/i)
    .or(page.locator('input[placeholder="ค้นหา"]'))
    .first();
  await expect(searchInput).toBeVisible();
  await searchInput.fill(keyword);
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
    // Fallback: click the first package card itself
    const firstCard = page.getByRole("article").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
  }

  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/package/i);
}

async function getRemainingCapacity(page) {
  // Best-effort parsing from UI text (common words: คงเหลือ / ที่ว่าง)
  const capTextLocator = page
    .getByText(/(คงเหลือ|ที่ว่าง)\s*\d+/)
    .first();

  if (await capTextLocator.isVisible().catch(() => false)) {
    const text = (await capTextLocator.textContent()) || "";
    const m = text.match(/(\d+)/);
    return m ? Number(m[1]) : null;
  }

  return null;
}

async function getBookingPanel(page) {
  return page
    .locator("div")
    .filter({ has: page.getByRole("button", { name: "จองเลย" }) })
    .filter({ has: page.getByRole("button", { name: "-" }) })
    .filter({ has: page.getByRole("button", { name: "+" }) })
    .first();
}

async function setPeopleCountExact(page, count) {
  // On package detail page the quantity control is near the "จองเลย" button:
  // "-" button, readonly input (current count), "+" button.
  // IMPORTANT: there can be other textboxes on the page (e.g. header search),
  // so scope by requiring the same container to have both the booking button and +/-.
  const bookingPanel = await getBookingPanel(page);

  const minusBtn = bookingPanel.getByRole("button", { name: "-" });
  const plusBtn = bookingPanel.getByRole("button", { name: "+" });
  const qtyBox = bookingPanel.locator('input[type="text"][readonly]').first();

  await expect(minusBtn).toBeVisible();
  await expect(plusBtn).toBeVisible();
  await expect(qtyBox).toBeVisible();

  // Normalize to 1 first
  for (let i = 0; i < 50; i++) {
    const current = Number((await qtyBox.inputValue()).trim());
    if (Number.isFinite(current) && current <= 1) break;
    await minusBtn.click();
  }

  // Increase to target
  for (let i = 1; i < count; i++) await plusBtn.click();

  await expect(qtyBox).toHaveValue(String(count));
}

async function increasePeopleCountToAtLeast(page, minCount) {
  const bookingPanel = await getBookingPanel(page);
  const plusBtn = bookingPanel.getByRole("button", { name: "+" });
  const qtyBox = bookingPanel.locator('input[type="text"][readonly]').first();

  await expect(plusBtn).toBeVisible();
  await expect(qtyBox).toBeVisible();

  // Click "+" until reaching minCount or until value stops changing (UI may cap)
  let last = Number((await qtyBox.inputValue()).trim());
  for (let i = 0; i < 200; i++) {
    if (Number.isFinite(last) && last >= minCount) break;
    await plusBtn.click();
    const next = Number((await qtyBox.inputValue()).trim());
    if (next === last) break;
    last = next;
  }

  return Number((await qtyBox.inputValue()).trim());
}

async function clickBook(page) {
  const bookBtn = page
    .getByRole("button", { name: "จองเลย" })
    .or(page.getByRole("button", { name: /จอง/ }))
    .first();
  await expect(bookBtn).toBeVisible();
  await bookBtn.click();
}

test.describe("Tourist - TS-BP-03 Book Package (people count vs capacity)", () => {
  test.beforeEach(async ({ page }) => {
    await goToTouristHome(page);
    await searchPackage(page, "ทะเล");
    await openFirstPackageDetail(page);
  });

  /**
   * TS-BP-03 / TC-BP-03.1
   * จองโดยเลือกจำนวนคน <= ความจุคงเหลือ
   */
  test("TC-BP-03.1: จองโดยเลือกจำนวนคนน้อยกว่าหรือเท่ากับความจุคงเหลือ", async ({
    page,
  }) => {
    const remaining = (await getRemainingCapacity(page)) ?? 3;
    await setPeopleCountExact(page, remaining);

    // Successful flow should go to booking summary page
    await Promise.all([
      page.waitForURL(/\/tourist\/booking\/package\/\d+\/summary/),
      clickBook(page),
    ]);

    // Final-result assertion: navigates to booking summary page
    await expect(page).toHaveURL(/\/tourist\/booking\/package\/\d+\/summary/);

    // User-visible assertion: booking flow page is shown (stepper + actions)
    await expect(page.getByRole("heading", { name: /การจอง/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ถัดไป/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ยกเลิก/i })).toBeVisible();
  });

  /**
   * TS-BP-03 / TC-BP-03.2
   * จองโดยเลือกจำนวนคน > ความจุคงเหลือ
   */
  test("TC-BP-03.2: จองโดยเลือกจำนวนคนมากกว่าความจุคงเหลือ", async ({
    page,
  }) => {
    const remaining = (await getRemainingCapacity(page)) ?? 3;

    // Ensure selected people > remaining (UI may cap, so don't require an exact huge number)
    const selected = await increasePeopleCountToAtLeast(page, remaining + 100);
    await expect(selected).toBeGreaterThan(remaining);

    await clickBook(page);

    // Final-result assertion: shows error and does not proceed
    await expect(
      page.getByText(/จำนวนคนเกินที่ว่าง|เกินที่ว่าง|เต็ม|ไม่เพียงพอ/i),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/\/tourist\/booking\/package\/\d+\/summary/);
  });
});

