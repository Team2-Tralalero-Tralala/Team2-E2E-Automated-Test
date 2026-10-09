import { expect, test } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

async function goToTouristHome(page) {
  await loginAs(page, "tourist");
  await page.goto("/tourist/home");
  await page.waitForLoadState("networkidle");
}

async function searchAndOpenAnyPackage(page) {
  const searchInput = page
    .getByPlaceholder(/ค้นหา/i)
    .or(page.locator('input[placeholder="ค้นหา"]'))
    .first();

  await expect(searchInput).toBeVisible();
  await searchInput.fill("ทะเล");
  await searchInput.press("Enter").catch(() => {});
  await page.waitForTimeout(500);

  const detailButton = page
    .getByRole("button", { name: /ดูรายละเอียด|รายละเอียด|Detail/i })
    .first();

  if (await detailButton.isVisible().catch(() => false)) {
    await detailButton.click();
  } else {
    const firstCard = page.getByRole("article").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
  }

  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/tourist\/package\/\d+/);
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

async function goToBookingSummary(page) {
  const bookBtn = page.getByRole("button", { name: "จองเลย" });
  await expect(bookBtn).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/tourist\/booking\/package\/\d+\/summary/),
    bookBtn.click(),
  ]);

  await expect(page).toHaveURL(/\/tourist\/booking\/package\/\d+\/summary/);
  await expect(page.getByRole("heading", { name: /การจอง/i })).toBeVisible();
}

async function goToPaymentStep(page) {
  // Stepper flow: click "ถัดไป" to reach payment UI.
  const nextBtn = page.getByRole("button", { name: /ถัดไป/i });
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();
  await page.waitForLoadState("networkidle");
}

test.describe("Tourist - TS-BP-04 Booking confirmation page display", () => {
  /**
   * TS-BP-04 / TC-BP-04
   * ตรวจสอบข้อมูลหน้ายืนยันการจอง (บัญชีธนาคาร + รายละเอียดการจอง + ยอดรวม)
   */
  test("TC-BP-04: ตรวจสอบข้อมูลหน้ายืนยันการจอง", async ({ page }) => {
    await goToTouristHome(page);
    await searchAndOpenAnyPackage(page);

    // Test data: คน 2 (ตามตาราง)
    await setPeopleCountExact(page, 2);
    await goToBookingSummary(page);
    await goToPaymentStep(page);

    // Final-result assertions: payment info exists and looks complete
    await expect(page.locator("body")).toContainText(/ชื่อบัญชี|เลขบัญชี|ธนาคาร/i);
    await expect(page.locator("body")).toContainText(/ราคารวม/i);

    // Final-result assertion: "ราคารวม" matches "ราคา/คน" × "จำนวนคน" (avoid hardcoding)
    const pricingCard = page.locator("div").filter({
      hasText: /ราคาแพ็กเกจต่อคน/,
    }).filter({
      hasText: /จำนวนคน/,
    }).filter({
      hasText: /ราคารวม/,
    }).first();

    const perPersonRow = pricingCard.locator("div").filter({
      hasText: /ราคาแพ็กเกจต่อคน/,
    }).first();
    const peopleRow = pricingCard.locator("div").filter({
      hasText: /จำนวนคน/,
    }).first();
    const totalRow = pricingCard.locator("div").filter({
      hasText: /ราคารวม/,
    }).last();

    const moneyRe = /(\d[\d,]*\.\d{2})/;
    const perPersonText = await perPersonRow.innerText();
    const totalText = await totalRow.innerText();
    const peopleText = await peopleRow.innerText();

    const perPersonMatch = perPersonText.match(moneyRe)?.[1];
    const totalMatch = totalText.match(moneyRe)?.[1];
    const peopleMatch = peopleText.match(/(\d+)\s*คน/)?.[1] ?? peopleText.match(/\b(\d+)\b/)?.[1];

    expect(perPersonMatch).toBeTruthy();
    expect(totalMatch).toBeTruthy();
    expect(peopleMatch).toBeTruthy();

    const perPerson = Number(perPersonMatch.replace(/,/g, ""));
    const total = Number(totalMatch.replace(/,/g, ""));
    const people = Number(peopleMatch);

    expect(total).toBeCloseTo(perPerson * people, 2);
  });
});

