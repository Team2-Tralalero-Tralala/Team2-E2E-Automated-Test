import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("TC-GAS-03 - ผู้ใช้งาน Tourist ดูรายละเอียดที่พักในหน้าจอรายละเอียดชุมชน", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "tourist");
    await expect(page).toHaveURL(/tourist\/home/);
  });

  /*
   * TC-GAS-03.1
   * ผู้ใช้งานล็อกอินเข้าสู่ระบบ
   */
  test("TC-GAS-03.1: ผู้ใช้งานล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    const keyword = "วิสาหกิจชุมชน";

    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).click();
    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).fill(keyword);
    await page.getByRole("banner").getByRole("button").filter({ hasText: /^$/ }).click();

    // เช็ค url
    await expect(page).toHaveURL(new RegExp(`tourist/search\\?q=${encodeURIComponent(keyword)}`));
    await expect(page.getByRole("heading", { name: `ผลลัพธ์ที่ตรงกับการค้นหา "${keyword}"` })).toBeVisible();

    const communityLogo = page.getByRole('img', { name: /วิสาหกิจชุมชน/ }).first();
    await expect(communityLogo).toBeVisible();
    await communityLogo.click();

    await expect(page).toHaveURL(/\/tourist\/community\/\d+\/detail/);  

    await expect(page.getByRole('heading', { name: 'ที่พักของชุมชน' })).toBeVisible();

    // ใช้ CSS Selector หา <a> ที่มี href มีคำว่า "/homestay/"
    const homestayCard = page.locator('a[href*="/homestay/"]').first();

    await expect(homestayCard).toBeVisible();
    await homestayCard.click();

    await expect(page).toHaveURL(/\/tourist\/community\/\d+\/detail\/homestay\/\d+/);
  });

  /*
   * TC-GAS-03.2
   * ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ
   */
  test("TC-GAS-03.2: ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    // Logout ก่อนเพราะ beforeEach ล็อกอินมาให้แล้ว
    await page.getByRole("button", { name: "ณเดชน์ กล้าหาญ Profile" }).click();
    await page.getByText("ออกจากระบบ").click();

    const keyword = "วิสาหกิจชุมชน";

    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).click();
    await page.getByRole("textbox", { name: "ค้นหาแพ็กเกจกิจกรรม:" }).fill(keyword);
    await page.getByRole("banner").getByRole("button").filter({ hasText: /^$/ }).click();

    // เช็ค url
    await expect(page).toHaveURL(new RegExp(`tourist/search\\?q=${encodeURIComponent(keyword)}`));
    await expect(page.getByRole("heading", { name: `ผลลัพธ์ที่ตรงกับการค้นหา "${keyword}"` })).toBeVisible();

    const communityLogo = page.getByRole('img', { name: /วิสาหกิจชุมชน/ }).first();
    await expect(communityLogo).toBeVisible();
    await communityLogo.click();

    await expect(page).toHaveURL(/\/tourist\/community\/\d+\/detail/);  

    await expect(page.getByRole('heading', { name: 'ที่พักของชุมชน' })).toBeVisible();

    // ใช้ CSS Selector หา <a> ที่มี href มีคำว่า "/homestay/"
    const homestayCard = page.locator('a[href*="/homestay/"]').first();

    await expect(homestayCard).toBeVisible();
    await homestayCard.click();

    await expect(page).toHaveURL(/\/tourist\/community\/\d+\/detail\/homestay\/\d+/);
  });

});


