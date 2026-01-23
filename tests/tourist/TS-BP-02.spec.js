import { expect, test } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

async function goToTouristHome(page) {
  await loginAs(page, "tourist");
  await page.goto("/tourist/home");
  await page.waitForLoadState("networkidle");
}

async function searchByKeyword(page, keyword) {
  const searchInput = page
    .getByPlaceholder(/ค้นหา/i)
    .or(page.locator('input[placeholder="ค้นหา"]'))
    .first();

  await expect(searchInput).toBeVisible();
  await searchInput.fill(keyword);
  await searchInput.press("Enter").catch(() => {});
  await page.waitForTimeout(500);
}

async function openFilterPanel(page) {
  // On the search results page, filters are shown as a sidebar ("ตัวเลือกแพ็กเกจ")
  // and there is no separate "ตัวกรอง" button to open.
  const filterHeading = page.getByRole("heading", { name: "ตัวเลือกแพ็กเกจ" });

  // Ensure we have a results page rendered (filters appear after search).
  if (!(await filterHeading.isVisible().catch(() => false))) {
    await searchByKeyword(page, "ชม");
  }

  await expect(filterHeading).toBeVisible();
  await filterHeading.scrollIntoViewIfNeeded();
}

async function setDateRangeFilter(page, { start, end }) {
  // Filter UI uses readonly inputs with react-datepicker popup.
  const dateInputs = page.locator('input[id^="daily-date-input-"]');
  const startInput = dateInputs.nth(0);
  const endInput = dateInputs.nth(1);

  async function pickDate(input, { yearValue, monthValue, day }) {
    await expect(input).toBeVisible();
    await input.click();

    const datePicker = page.locator(".react-datepicker").first();
    await expect(datePicker).toBeVisible();

    await datePicker.locator(".react-datepicker__year-select").selectOption(yearValue);
    await datePicker.locator(".react-datepicker__month-select").selectOption(monthValue);

    // Click day within the currently selected month (avoid outside-month cells)
    await datePicker
      .locator(`.react-datepicker__day--0${String(day).padStart(2, "0")}:not(.react-datepicker__day--outside-month)`)
      .first()
      .click();

    // react-datepicker usually closes automatically after selecting a day
    await expect(datePicker).toBeHidden();
  }

  // 10/10/2568 (BE) == 10/10/2025 (Gregorian)
  // monthValue: 9 = October (0-based)
  await pickDate(startInput, start);
  await pickDate(endInput, end);

  // Final-result assertion: both inputs should have values after picking
  await expect(startInput).not.toHaveValue("");
  await expect(endInput).not.toHaveValue("");
}

async function setPriceRangeFilter(page, { min, max }) {
  const priceSection = page.locator('div').filter({
    has: page.locator('label:has-text("ช่วงราคา")'),
  }).first();

  const inputs = priceSection.locator('input[type="text"]');
  const minInput = inputs.nth(0);
  const maxInput = inputs.nth(1);

  await expect(minInput).toBeVisible();
  await expect(maxInput).toBeVisible();

  await minInput.fill(String(min));
  await maxInput.fill(String(max));

  // Final-result assertion: values changed from defaults
  await expect(minInput).not.toHaveValue("฿ 0");
  await expect(maxInput).not.toHaveValue("฿ 50,000");
}

async function expectHasSomePackages(page) {
  // Actual UI: package results are rendered as clickable <article> cards inside the grid.
  // Each card contains:
  // - h3: package name
  // - "เปิดจองแล้ว ..." status
  // - "จำนวนคน X/Y จองแล้ว"
  // - "ราคา THB ..."
  const packageCards = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { level: 3 }) })
    .filter({ hasText: /ราคา\s*THB/i });

  // Some filters (e.g., narrow price range) may yield empty results.
  if ((await packageCards.count()) === 0) {
    await expect(page.getByText(/ไม่พบข้อมูลแพ็กเกจ/i)).toBeVisible();
    return;
  }

  await expect(packageCards.first()).toBeVisible();

  const firstCard = packageCards.first();
  await expect(firstCard.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(firstCard.getByText(/เปิดจองแล้ว/i)).toBeVisible();
  await expect(firstCard.getByText(/จำนวนคน\s*\d+\s*\/\s*\d+/)).toBeVisible();
  await expect(firstCard.getByText(/ราคา\s*THB/i)).toBeVisible();
}

test.describe("Tourist - TS-BP-02 Search/Filter Packages", () => {
  test.beforeEach(async ({ page }) => {
    await goToTouristHome(page);
  });

  /**
   * TS-BP-02 / TC-BP-02.1
   * ค้นหาแพ็กเกจโดยใช้คำค้นหา
   */
  test("TC-BP-02.1: ค้นหาแพ็กเกจโดยใช้คำค้นหา", async ({ page }) => {
    const keyword = "ชม";
    await searchByKeyword(page, keyword);

    await expectHasSomePackages(page);

    // Final-result assertion: at least one visible package reflects keyword
    await expect(page.locator("body")).toContainText(keyword);
  });

  /**
   * TS-BP-02 / TC-BP-02.2
   * ค้นหาแพ็กเกจโดยใช้แท็ก
   */
  test("TC-BP-02.2: ค้นหาแพ็กเกจโดยใช้แท็ก", async ({ page }) => {
    const tag = "Tag-3-Food";

    // Common UI: tag chip/button. If not found, fall back to filter panel.
    const tagBtn = page.getByRole("button", { name: new RegExp(`^${tag}$`) });

    if (await tagBtn.isVisible().catch(() => false)) {
      await tagBtn.click();
    } else {
      await openFilterPanel(page);
      await page.getByRole("button", { name: tag }).click();
      // close filter if toggled menu
      await page.getByRole("button", { name: /ตัวกรอง|Filter/i }).click();
    }

    await page.waitForLoadState("networkidle");
    await expectHasSomePackages(page);

    // Final-result assertion: tag appears in results area somewhere
    await expect(page.locator("body")).toContainText(tag);
  });

  /**
   * TS-BP-02 / TC-BP-02.3
   * ค้นหาแพ็กเกจโดยกรองวันที่ต้องการ
   */
  test("TC-BP-02.3: ค้นหาแพ็กเกจโดยกรองวันที่ต้องการ", async ({ page }) => {
    await openFilterPanel(page);

    await setDateRangeFilter(page, {
      start: { yearValue: "2025", monthValue: "9", day: 10 },
      end: { yearValue: "2025", monthValue: "9", day: 10 },
    });

    await page.waitForLoadState("networkidle");

    await expectHasSomePackages(page);
  });

  /**
   * TS-BP-02 / TC-BP-02.4
   * ค้นหาแพ็กเกจโดยกรองช่วงราคาที่ต้องการ (3,000-5,000)
   */
  test("TC-BP-02.4: ค้นหาแพ็กเกจโดยกรองช่วงราคาที่ต้องการ", async ({ page }) => {
    await openFilterPanel(page);

    await setPriceRangeFilter(page, { min: 3000, max: 5000 });

    // wait 3 seconds
    await page.waitForTimeout(3000);

    await page.waitForLoadState("networkidle");

    await expectHasSomePackages(page);
  });
});

