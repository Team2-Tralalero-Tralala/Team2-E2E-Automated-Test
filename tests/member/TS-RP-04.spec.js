import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Reports", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member1");
    await expect(page).toHaveURL(/\/member\/home/);
  });

  /**
   * TS-RP-04.1
   * กรองข้อมูลรายได้แบบ “รายสัปดาห์”
   * Steps:
   *  1) Login Member
   *  2) ไปที่หน้า “รายงาน”
   *  3) กดกรองรายสัปดาห์บนกราฟรายได้จากการจองแพ็กเกจ
   */
  test("TS-RP-04.1: Week filter updates revenue chart", async ({ page }) => {
    await loginAs(page, "member1");

    await page.getByRole("link", { name: /^รายงาน$/ }).click();
    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible();

    // ✅ scope ไปที่กราฟล่าง: "รายได้จากการจองแพ็กเกจ"
    const revenueHeading = page.getByRole("heading", {
      name: /รายได้จากการจองแพ็กเกจ/i,
    });
    await revenueHeading.scrollIntoViewIfNeeded();
    const revenueSection = revenueHeading.locator("xpath=ancestor::*[2]");

    const calendarBtn = revenueSection
      .getByRole("button", { name: /เปิดปฏิทิน/i })
      .first();
    await calendarBtn.scrollIntoViewIfNeeded();
    await expect(calendarBtn).toBeVisible();
    await calendarBtn.click();

    const calendarDialog = revenueSection.getByRole("dialog", {
      name: /ปฏิทิน/i,
    });
    await expect(calendarDialog).toBeVisible();
    const date11 = calendarDialog.getByRole("gridcell", {
      name: /วันอาทิตย์ที่ 11 มกราคม 2026/,
    });
    await date11.click();
    await calendarBtn.click();

    const filterBtn = revenueSection
      .getByRole("button", { name: /รายสัปดาห์|รายเดือน|รายปี/i })
      .first();
    await filterBtn.click();

    const menu = revenueSection.getByRole("menu").first();
    await expect(menu).toBeVisible();

    const weeklyOption = menu.getByRole("button", { name: /^รายสัปดาห์$/ });
    await weeklyOption.click();

    await expect(filterBtn).toHaveText(/รายสัปดาห์/);
  });

  /**
   * TS-RP-04.2
   * กรองข้อมูลรายได้การจองแพ็กเกจแบบ “รายเดือน”
   * Steps:
   *  1) Login Member
   *  2) ไปที่หน้า “รายงาน”
   *  3) กดกรองรายเดือนบนกราฟรายได้จากการจองแพ็กเกจ
   */
  test("TS-RP-04.2: Month filter updates revenue chart", async ({ page }) => {
    await loginAs(page, "member1");

    await page.getByRole("link", { name: /^รายงาน$/ }).click();
    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible();

    // ✅ scope ไปที่กราฟล่าง: "รายได้จากการจองแพ็กเกจ"
    const revenueHeading = page.getByRole("heading", {
      name: /รายได้จากการจองแพ็กเกจ/i,
    });
    await revenueHeading.scrollIntoViewIfNeeded();
    const revenueSection = revenueHeading.locator("xpath=ancestor::*[2]");

    const filterBtn = revenueSection
      .getByRole("button", { name: /รายสัปดาห์|รายเดือน|รายปี/i })
      .first();
    await filterBtn.click();

    const menu = revenueSection.getByRole("menu").first();
    await expect(menu).toBeVisible();

    const weeklyOption = menu.getByRole("button", { name: /^รายเดือน$/ });
    await weeklyOption.click();

    const calendarBtn = revenueSection
      .getByRole("button", { name: /เปิดปฏิทิน/i })
      .first();
    await calendarBtn.click();

    const calendarDialog = revenueSection.getByRole("dialog", {
      name: /ปฏิทิน/i,
    });
    await expect(calendarDialog).toBeVisible();

    const monthList = calendarDialog.getByRole("listbox");
    const febOption = monthList.getByRole("option", {
      name: /กุมภาพันธ์ 2026/i,
    });
    await febOption.click();

    await calendarBtn.click();

    await expect(filterBtn).toHaveText(/รายเดือน/);
  });
  /**
   * TS-RP-04.3
   * กรองข้อมูลรายได้การจองแพ็กเกจแบบ “รายปี”
   * Steps:
   *  1) Login Member
   *  2) ไปที่หน้า “รายงาน”
   *  3) กดกรองรายปีบนกราฟรายได้จากการจองแพ็กเกจ
   */
  test("TS-RP-04.3: Year filter updates revenue chart", async ({ page }) => {
    await loginAs(page, "member1");

    await page.getByRole("link", { name: /^รายงาน$/ }).click();
    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible();

    // ✅ scope ไปที่กราฟล่าง: "รายได้จากการจองแพ็กเกจ"
    const revenueHeading = page.getByRole("heading", {
      name: /รายได้จากการจองแพ็กเกจ/i,
    });
    await revenueHeading.scrollIntoViewIfNeeded();
    const revenueSection = revenueHeading.locator("xpath=ancestor::*[2]");

    const filterBtn = revenueSection
      .getByRole("button", { name: /รายสัปดาห์|รายเดือน|รายปี/i })
      .first();
    await filterBtn.click();

    const menu = revenueSection.getByRole("menu").first();
    await expect(menu).toBeVisible();

    const weeklyOption = menu.getByRole("button", { name: /^รายปี$/ });
    await weeklyOption.click();

    const calendarBtn = revenueSection
      .getByRole("button", { name: /เปิดปฏิทิน/i })
      .first();
    await calendarBtn.click();

    const calendarDialog = revenueSection.getByRole("dialog", {
      name: /ปฏิทิน/i,
    });
    await expect(calendarDialog).toBeVisible();

    const yearBtn = calendarDialog.getByRole("button", {
      name: /เลือกปี พ\.ศ\. 2567/,
    });
    await yearBtn.click();

    await calendarBtn.click();
    await expect(filterBtn).toHaveText(/รายปี/);
  });
});
