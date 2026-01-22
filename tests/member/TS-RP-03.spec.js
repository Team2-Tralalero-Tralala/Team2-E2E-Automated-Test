import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Reports", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member1");
    await expect(page).toHaveURL(/\/member\/home/);
  });

  /**
   * TS-RP-03.1
   * กรองข้อมูลจำนวนการจองแพ็กเกจแบบ “รายสัปดาห์”
   * Steps:
   *  1) Login Member
   *  2) ไปที่หน้า “รายงาน”
   *  3) กดกรองรายสัปดาห์บนกราฟจำนวนการจองแพ็กเกจ
   */
  test("TS-RP-03.1: Week filter updates booking chart", async ({ page }) => {
    await loginAs(page, "member1");

    await page.getByRole("link", { name: /^รายงาน$/ }).click();
    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible();

    const calendarBtn = page
      .getByRole("button", { name: /เปิดปฏิทิน/i })
      .first();
    await calendarBtn.click();

    const calendarDialog = page.getByRole("dialog", {
      name: /ปฏิทิน/i,
    });
    await expect(calendarDialog).toBeVisible();
    const date11 = calendarDialog.getByRole("gridcell", {
      name: /วันอาทิตย์ที่ 11 มกราคม 2026/,
    });
    await date11.click();
    await calendarBtn.click();

    const filterBtn = page
      .getByRole("button", { name: /รายสัปดาห์|รายเดือน|รายปี/i })
      .first();
    await filterBtn.click();

    const menu = page.getByRole("menu").first();
    await expect(menu).toBeVisible();

    const weeklyOption = menu.getByRole("button", { name: /^รายสัปดาห์$/ });
    await weeklyOption.click();

    await expect(filterBtn).toHaveText(/รายสัปดาห์/);
  });

  /**
   * TS-RP-03.2
   * กรองข้อมูลจำนวนการจองแพ็กเกจแบบ “รายเดือน”
   * Steps:
   *  1) Login Member
   *  2) ไปที่หน้า “รายงาน”
   *  3) กดกรองรายเดือนบนกราฟจำนวนการจองแพ็กเกจ
   */
  test("TS-RP-03.2: Month filter updates booking chart", async ({ page }) => {
    await loginAs(page, "member1");

    await page.getByRole("link", { name: /^รายงาน$/ }).click();
    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible();

    const filterBtn = page
      .getByRole("button", { name: /รายสัปดาห์|รายเดือน|รายปี/i })
      .first();
    await filterBtn.click();

    const menu = page.getByRole("menu").first();
    await expect(menu).toBeVisible();

    const weeklyOption = menu.getByRole("button", { name: /^รายเดือน$/ });
    await weeklyOption.click();

    const calendarBtn = page
      .getByRole("button", { name: /เปิดปฏิทิน/i })
      .first();
    await calendarBtn.click();

    const calendarDialog = page.getByRole("dialog", {
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
   * TS-RP-03.3
   * กรองข้อมูลจำนวนการจองแพ็กเกจแบบ “รายปี”
   * Steps:
   *  1) Login Member
   *  2) ไปที่หน้า “รายงาน”
   *  3) กดกรองรายปีบนกราฟจำนวนการจองแพ็กเกจ
   */
  test("TS-RP-03.3: Year filter updates booking chart", async ({ page }) => {
    await loginAs(page, "member1");

    await page.getByRole("link", { name: /^รายงาน$/ }).click();
    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible();

    const filterBtn = page
      .getByRole("button", { name: /รายสัปดาห์|รายเดือน|รายปี/i })
      .first();
    await filterBtn.click();

    const menu = page.getByRole("menu").first();
    await expect(menu).toBeVisible();

    const weeklyOption = menu.getByRole("button", { name: /^รายปี$/ });
    await weeklyOption.click();

    const calendarBtn = page
      .getByRole("button", { name: /เปิดปฏิทิน/i })
      .first();
    await calendarBtn.click();

    const calendarDialog = page.getByRole("dialog", {
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
