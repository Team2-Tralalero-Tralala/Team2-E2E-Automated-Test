/**
 * TS-SB-01
 * Scenario: Search package with filters (Search Bar)
 * Scope:
 *  - Tourist login
 *  - Search package by keyword
 *  - Filter by one-day activity
 *  - Filter by date range
 *  - Filter by price range
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Tourist - Search Package with Filters", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "tourist");
    await expect(page).toHaveURL(/\/tourist/);
  });

  /**
   * TS-SP-01.1
   * ค้นหาแพ็กเกจที่แถบการค้นหา โดยเลือกกิจกรรมวันเดียว เลือกวันที่ และช่วงราคา
   */
  test("TS-SP-01.1: search package with one-day activity, date and price range", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");
    const oneDayBtn = page.getByRole("button", { name: "กิจกรรมวันเดียว" });

    await expect(searchInput).toBeVisible();
    await searchInput.fill("ภูเขา");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/tourist\/search\?q=/);

    await expect(oneDayBtn).toBeVisible();
    await oneDayBtn.click();

    const startDateInput = page.getByPlaceholder("เลือกวันที่").first();
    const endDateInput = page.getByPlaceholder("เลือกวันที่").nth(1);

    await startDateInput.click();
    await page.getByRole("gridcell", { name: "10" }).click();

    await endDateInput.click();
    await page.getByRole("gridcell", { name: "10" }).click();

    const minPriceInput = page.locator('input[type="text"]').nth(0);
    const maxPriceInput = page.locator('input[type="text"]').nth(1);

    await minPriceInput.fill("3000");
    await maxPriceInput.fill("5000");

    const packageCard = page.getByRole("article").first();

    await expect(packageCard.getByText("ภูเขา")).toBeVisible();
    await expect(packageCard.getByText("10/10/2568")).toBeVisible();
    await expect(packageCard.getByText("5000")).toBeVisible();
  });

  /**
   * TS-SP-01.2
   * ค้นหาแพ็กเกจที่แถบการค้นหา โดยเลือกกิจกรรมวันเดียว และเลือกวันที่ (ไม่กรอกราคา)
  */
  test("TS-SP-01.2: search package with one-day activity and date only", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");
    const oneDayBtn = page.getByRole("button", { name: "กิจกรรมวันเดียว" });

    await expect(searchInput).toBeVisible();
    await searchInput.fill("ภูเขา");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/tourist\/search\?q=/);

    await expect(oneDayBtn).toBeVisible();
    await oneDayBtn.click();

    const startDateInput = page.getByPlaceholder("เลือกวันที่").first();
    const endDateInput = page.getByPlaceholder("เลือกวันที่").nth(1);

    await startDateInput.click();
    await page.getByRole("gridcell", { name: "10" }).click();

    await endDateInput.click();
    await page.getByRole("gridcell", { name: "10" }).click();

    const packageCard = page.getByRole("article").first();

    await expect(packageCard.getByText("ภูเขา")).toBeVisible();
    await expect(packageCard.getByText("10/10/2568")).toBeVisible();
  });

  /**
   * TS-SP-01.3
   * ค้นหาแพ็กเกจที่แถบการค้นหา โดยเลือกกิจกรรมวันเดียว และช่วงราคา (ไม่เลือกวันที่)
   */
  test("TS-SP-01.3: search package with one-day activity and price range only", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");
    const oneDayBtn = page.getByRole("button", { name: "กิจกรรมวันเดียว" });

    await expect(searchInput).toBeVisible();
    await searchInput.fill("ภูเขา");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/tourist\/search\?q=/);

    await expect(oneDayBtn).toBeVisible();
    await oneDayBtn.click();

    const minPriceInput = page.locator('input[type="text"]').nth(0);
    const maxPriceInput = page.locator('input[type="text"]').nth(1);

    await minPriceInput.fill("3000");
    await maxPriceInput.fill("5000");

    const packageCard = page.getByRole("article").first();

    await expect(packageCard.getByText("ภูเขา")).toBeVisible();
    await expect(packageCard.getByText("3,500")).toBeVisible();
  });

  /**
   * TS-SP-01.4
   * ค้นหาแพ็กเกจที่แถบการค้นหา โดยเลือกกิจกรรมหลายวัน เลือกวันที่ (สิ้นสุดวันที่ 12) และช่วงราคา
   */
  test("TS-SP-01.4: search package with multi-day activity, date range and price range", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");
    const multiDayBtn = page.getByRole("button", { name: "กิจกรรมหลายวัน" });

    await expect(searchInput).toBeVisible();
    await searchInput.fill("ภูเขา");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/tourist\/search\?q=/);

    await expect(multiDayBtn).toBeVisible();
    await multiDayBtn.click();

    const startDateInput = page.getByPlaceholder("เลือกวันที่").first();
    const endDateInput = page.getByPlaceholder("เลือกวันที่").nth(1);

    await startDateInput.click();
    await page.getByRole("gridcell", { name: "10" }).click();

    await endDateInput.click();
    await page.getByRole("gridcell", { name: "12" }).click();

    const minPriceInput = page.locator('input[type="text"]').nth(0);
    const maxPriceInput = page.locator('input[type="text"]').nth(1);

    await minPriceInput.fill("3000");
    await maxPriceInput.fill("5000");

    const packageCard = page.getByRole("article").first();

    await expect(packageCard.getByText("ภูเขา")).toBeVisible();
    await expect(packageCard.getByText("10/10/2568")).toBeVisible();
    await expect(packageCard.getByText("12/10/2568")).toBeVisible();
    await expect(packageCard.getByText("3,500")).toBeVisible();
  });


  /**
   * TS-SP-01.5
   * ค้นหาแพ็กเกจที่แถบการค้นหา โดยเลือกกิจกรรมหลายวัน และเลือกวันที่ (สิ้นสุดวันที่ 12) ไม่กรอกราคา
  */
  test("TS-SP-01.5: search package with multi-day activity and date range only", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");
    const multiDayBtn = page.getByRole("button", { name: "กิจกรรมหลายวัน" });

    await expect(searchInput).toBeVisible();
    await searchInput.fill("ภูเขา");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/tourist\/search\?q=/);

    await expect(multiDayBtn).toBeVisible();
    await multiDayBtn.click();

    const startDateInput = page.getByPlaceholder("เลือกวันที่").first();
    const endDateInput = page.getByPlaceholder("เลือกวันที่").nth(1);

    await startDateInput.click();
    await page.getByRole("gridcell", { name: "10" }).click();

    await endDateInput.click();
    await page.getByRole("gridcell", { name: "12" }).click();

    const packageCard = page.getByRole("article").first();

    await expect(packageCard.getByText("ภูเขา")).toBeVisible();
    await expect(packageCard.getByText("10/10/2568")).toBeVisible();
    await expect(packageCard.getByText("12/10/2568")).toBeVisible();
  });

  /**
   * TS-SB-01.6
   * ค้นหาแพ็กเกจที่แถบการค้นหา โดยเลือกกิจกรรมหลายวัน ไม่เลือกวันที่ และไม่กรอกราคา
   */
  test("TS-SP-01.6: search package with multi-day activity only", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");
    const multiDayBtn = page.getByRole("button", { name: "กิจกรรมหลายวัน" });

    await expect(searchInput).toBeVisible();
    await searchInput.fill("ภูเขา");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/tourist\/search\?q=/);

    await expect(multiDayBtn).toBeVisible();
    await multiDayBtn.click();

    const packageCard = page.getByRole("article").first();

    await expect(packageCard.getByText("ภูเขา")).toBeVisible();
  });
  
  /**
   * TS-SP-01.7
   * ค้นหาแพ็กเกจที่ไม่มีอยู่ (โตมาชิกูรู) และต้องแสดงข้อความ ไม่พบข้อมูลแพ็กเกจ
   */
  test("TS-SP-01.7: search package with no result", async ({ page }) => {
    const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");

    await expect(searchInput).toBeVisible();
    await searchInput.fill("โตมาชิกูรู");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/tourist\/search\?q=/);

    await expect(page.getByText("ไม่พบข้อมูลแพ็กเกจ")).toBeVisible();
  });

});
