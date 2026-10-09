import { expect, test } from "@playwright/test";
import fs from "fs";
import { loginAs } from "../../utils/roles.js";

const ASSET_JPG = "assets/photo/cat.jpg";
const ASSET_PDF = "assets/files/sample.pdf";
const ASSET_OVERSIZE_JPG = "assets/photo/oversize-image.jpg"; // ~45MB

async function goToTouristHome(page) {
  await loginAs(page, "tourist");
  await page.goto("/tourist/home");
  await page.waitForLoadState("networkidle");
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
  const nextBtn = page.getByRole("button", { name: /ถัดไป/i });
  await expect(nextBtn).toBeVisible();
  await nextBtn.click();
  await page.waitForLoadState("networkidle");
}

async function goToPaymentUploadSlipPage(page, peopleCount = 1) {
  // 1) Search & open any package
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

  // Capture package name for later assertions (best-effort)
  const packageName =
    (await page.getByRole("heading", { level: 1 }).first().textContent().catch(() => null)) ||
    "";

  // 2) Select people count (same flow as BP-03.1)
  await setPeopleCountExact(page, peopleCount);

  // 3) Go through booking flow until slip upload UI is visible
  await goToBookingSummary(page);
  await goToPaymentStep(page);

  await expect(page).toHaveURL(/\/tourist\/booking\/package\/\d+\/payment(\?.*)?$/);
  // Upload control uses a hidden input with id="payment-proof" (triggered by label/button)
  await expect(page.locator("#payment-proof")).toHaveCount(1);

  return { packageName: (packageName || "").trim() };
}

function createTempFile(testInfo, fileName, sizeBytes) {
  const filePath = testInfo.outputPath(fileName);
  fs.writeFileSync(filePath, Buffer.alloc(Math.floor(sizeBytes), 0));
  return filePath;
}

async function getSlipInput(page) {
  const input = page.locator("#payment-proof");
  // input is intentionally hidden, but Playwright can still set files on it.
  await expect(input).toHaveCount(1);
  return input;
}

async function clickConfirmBooking(page) {
  const confirmBtn = page
    .getByRole("button", { name: /ยืนยันการจอง/i })
    .first();
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();
}

async function clickCancelBooking(page) {
  const cancelBtn = page.getByRole("button", { name: /^ยกเลิก$/ }).first();
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();
}

async function confirmBookingAndExpectSuccess(page) {
  // click confirm on /payment, then land on /confirmed success page
  await expect(page).toHaveURL(/\/payment(\?.*)?$/);
  await clickConfirmBooking(page);

  // Modal confirm (if present)
  const dialog = page.getByRole("dialog").first();
  if (await dialog.isVisible().catch(() => false)) {
    await expect(dialog).toContainText(/ยืนยันการจอง|ยืนยัน/i);
    await dialog.getByRole("button", { name: /ยืนยัน/i }).click();
  }

  await expect(page).toHaveURL(/\/confirmed(\?.*)?$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "การจองสำเร็จ" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /ดูประวัติ/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /กลับสู่หน้าหลัก/i }),
  ).toBeVisible();
}

test.describe("Tourist - TS-BP-05 Upload slip & confirm booking", () => {
  /**
   * TS-BP-05 / TC-BP-05.1
   * แนบสลิปขนาด <= 10MB
   */
  test("TC-BP-05.1: แนบสลิปขนาด <= 10 MB", async ({ page }, testInfo) => {
    await goToTouristHome(page);
    await goToPaymentUploadSlipPage(page, 1);

    const slip98mb = createTempFile(
      testInfo,
      "slip-9_8mb.jpg",
      Math.floor(9.8 * 1024 * 1024),
    );
    const slipInput = await getSlipInput(page);
    await slipInput.setInputFiles(slip98mb);

    // Expected: confirm booking successfully and land on /confirmed
    await confirmBookingAndExpectSuccess(page);
  });

  /**
   * TS-BP-05 / TC-BP-05.2
   * แนบสลิปขนาด > 10MB
   */
  test("TC-BP-05.2: แนบสลิปขนาด > 10 MB", async ({ page }) => {
    await goToTouristHome(page);
    await goToPaymentUploadSlipPage(page, 1);

    const slipInput = await getSlipInput(page);
    await slipInput.setInputFiles(ASSET_OVERSIZE_JPG);

    // Attempt to confirm booking
    await clickConfirmBooking(page);
    await expect(
      page.getByText(/ไฟล์มีขนาดใหญ่เกิน 10MB|ไฟล์ใหญ่เกินกำหนด|เกิน 10MB/i),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/payment(\?.*)?$/);
  });

  /**
   * TS-BP-05 / TC-BP-05.3
   * แนบสลิปเป็นไฟล์ .jpg หรือ .png หรือ .pdf
   */
  test("TC-BP-05.3: แนบสลิปเป็นไฟล์ที่รองรับ (.jpg/.png/.pdf)", async ({
    page,
  }) => {
    await goToTouristHome(page);
    await goToPaymentUploadSlipPage(page, 1);

    const slipInput = await getSlipInput(page);

    await slipInput.setInputFiles(ASSET_JPG);
    await expect(page.getByText(/รองรับเฉพาะ|รูปแบบไฟล์ไม่ถูกต้อง/i)).not.toBeVisible();
    await expect(page.getByText(/ไฟล์ที่เลือก/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ยืนยันการจอง/i })).toBeVisible();

    // (Optional) Supported PDF check (separate run) — keep it simple here
  });

  /**
   * TS-BP-05 / TC-BP-05.4
   * แนบสลิปที่ไม่เป็นไฟล์ .jpg/.png/.pdf
   */
  test("TC-BP-05.4: แนบสลิปไฟล์ที่ไม่รองรับ", async ({ page }, testInfo) => {
    await goToTouristHome(page);
    await goToPaymentUploadSlipPage(page, 1);

    const invalidExe = testInfo.outputPath("slip.exe");
    fs.writeFileSync(invalidExe, "not-an-image");

    const slipInput = await getSlipInput(page);
    await slipInput.setInputFiles(invalidExe);

    await clickConfirmBooking(page);

    await expect(
      page.getByText(/รองรับเฉพาะไฟล์|รูปแบบไฟล์ไม่ถูกต้อง|\.jpg|\.png|\.pdf/i),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/payment(\?.*)?$/);
  });

  /**
   * TS-BP-05 / TC-BP-05.5
   * ไม่แนบสลิป
   */
  test("TC-BP-05.5: ไม่แนบสลิป", async ({ page }) => {
    await goToTouristHome(page);
    await goToPaymentUploadSlipPage(page, 1);
    await clickConfirmBooking(page);
    await expect(page.getByText(/กรุณาแนบหลักฐานการชำระเงิน/i)).toBeVisible();
    await expect(page).toHaveURL(/\/payment(\?.*)?$/);
  });

  /**
   * TS-BP-05 / TC-BP-05.6
   * แนบสลิปถูกต้องและกดปุ่ม “ยืนยันการจอง”
   */
  test('TC-BP-05.6: แนบสลิปถูกต้องและกดปุ่ม “ยืนยันการจอง”', async ({
    page,
  }) => {
    await goToTouristHome(page);
    await goToPaymentUploadSlipPage(page, 3);

    const slipInput = await getSlipInput(page);
    await slipInput.setInputFiles(ASSET_JPG);
    await confirmBookingAndExpectSuccess(page);

    // Final-result assertion: user can navigate to booking history and see bookings
    await Promise.all([
      page.waitForURL(/\/tourist\/booking-histories/),
      page.getByRole("button", { name: /ดูประวัติ/i }).click(),
    ]);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /ประวัติการจอง/i })).toBeVisible();
    await expect(page.getByText(/จองเมื่อ/i).first()).toBeVisible();
  });

  /**
   * TS-BP-05 / TC-BP-05.7
   * แนบสลิปถูกต้องและกดปุ่ม “ยกเลิก”
   */
  test('TC-BP-05.7: แนบสลิปถูกต้องและกดปุ่ม “ยกเลิก”', async ({ page }) => {
    await goToTouristHome(page);
    await goToPaymentUploadSlipPage(page, 3);

    const slipInput = await getSlipInput(page);
    await slipInput.setInputFiles(ASSET_JPG);

    // Cancel happens on /payment, and should return to package detail page
    await expect(page).toHaveURL(/\/tourist\/booking\/package\/\d+\/payment(\?.*)?$/);
    await clickCancelBooking(page);

    const dialog = page.getByRole("dialog").first();
    if (await dialog.isVisible().catch(() => false)) {
      await expect(dialog).toContainText(/ยกเลิกการจอง|ยกเลิก/i);
      await Promise.all([
        page.waitForURL(/\/tourist\/package\/\d+(\?.*)?$/),
        dialog.getByRole("button", { name: /ยืนยัน/i }).click(),
      ]);
    }

    // Final-result assertion: returns to package detail page
    await expect(page).toHaveURL(/\/tourist\/package\/\d+(\?.*)?$/);
    await expect(
      page.getByRole("button", { name: /จอง/i }).first(),
    ).toBeVisible();
  });
});

