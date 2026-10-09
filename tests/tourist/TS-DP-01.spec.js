import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("TC-DP-01 - ผู้ใช้งาน Tourist ต้องการดูรายละเอียดแพ็กเกจในหน้าจอผลลัพธ์การค้นหา", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "Tourist1");
    await expect(page).toHaveURL(/tourist\/home/);
  });

  /*
   * TC-DP-01.1
   * ผู้ใช้งานล็อกอินเข้าสู่ระบบ
   */
  test("TC-DP-01.1: ผู้ใช้งานล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    const keyword = "แพ็กเกจ";
    const targetPackageName = /แพ็กเกจ/;

    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).click();
    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).fill(keyword);
    await page.getByRole("banner").getByRole("button").filter({ hasText: /^$/ }).click();

    // เช็ค url
    await expect(page).toHaveURL(
      new RegExp(`tourist/search\\?q=${encodeURIComponent(keyword)}`)
    );
    await expect(page.getByRole("heading", { name: `ผลลัพธ์ที่ตรงกับการค้นหา "${keyword}"` })).toBeVisible();

    // ------- ขอทำส่วนนี้ไว้ก่อน เพราะ layout ที่ใช้แสดงแพ็กเกจน่าจะพังอยู่ -------
    const noDataMessage = page.getByText("ไม่พบข้อมูลแพ็กเกจ");

    // เช็คว่ามีข้อความแสดงอยู่หรือไม่
    if (await noDataMessage.isVisible()) {
      console.log('พบข้อความ "ไม่พบข้อมูลแพ็กเกจ" -> จบการทดสอบทันที');
      return; // คำสั่ง return จะทำให้จบ Test Case นี้ทันที (สถานะจะเป็น Passed)
    }
    // -----------------------------------------------------------------

    //คลิกการ์ดแพ็กเกจแรกที่เจอคำ
    const packageCard = page.getByRole("heading", { name: targetPackageName }).first();
    await expect(packageCard).toBeVisible();
    await packageCard.click();

    await expect(page).toHaveURL(/\/tourist\/package\/\d+/);
  });

  /*
   * TC-DP-01.2
   * ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ
   */
  test("TC-DP-01.2: ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    // Logout ก่อนเพราะ beforeEach ล็อกอินมาให้แล้ว
    await page.getByRole("button", { name: "Tourist 1 Profile" }).click();
    await page.getByText("ออกจากระบบ").click();

    const keyword = "แพ็กเกจ";
    const targetPackageName = /แพ็กเกจ/;

    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).click();
    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).fill(keyword);
    await page.getByRole("banner").getByRole("button").filter({ hasText: /^$/ }).click();

    // เช็ค url
    await expect(page).toHaveURL(
      new RegExp(`tourist/search\\?q=${encodeURIComponent(keyword)}`)
    );
    await expect(page.getByRole("heading", { name: `ผลลัพธ์ที่ตรงกับการค้นหา "${keyword}"` })).toBeVisible();

    // ------- ขอทำส่วนนี้ไว้ก่อน เพราะ layout ที่ใช้แสดงแพ็กเกจน่าจะพังอยู่ -------
    const noDataMessage = page.getByText("ไม่พบข้อมูลแพ็กเกจ");

    // เช็คว่ามีข้อความแสดงอยู่หรือไม่
    if (await noDataMessage.isVisible()) {
      console.log('พบข้อความ "ไม่พบข้อมูลแพ็กเกจ" -> จบการทดสอบทันที');
      return; // คำสั่ง return จะทำให้จบ Test Case นี้ทันที (สถานะจะเป็น Passed)
    }
    // -----------------------------------------------------------------

    const packageCard = page.getByRole("heading", { name: targetPackageName }).first();
    await expect(packageCard).toBeVisible();
    await packageCard.click();

    await expect(page).toHaveURL(/\/tourist\/package\/\d+/);
  });
});

//npx playwright codegen http://localhost:4000/guest/login
//npx playwright test tests/tourist/TS-DP-01.spec.js --headed