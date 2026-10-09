import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("TC-DP-02 - ผู้ใช้งาน Tourist ต้องการดูรายละเอียดแพ็กเกจ ในหน้าจอรายละเอียดชุมชน", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "tourist");
    await expect(page).toHaveURL(/tourist\/home/);
  });

  /*
   * TC-DP-02.1
   * ผู้ใช้งานล็อกอินเข้าสู่ระบบ
   */
  test("TC-DP-02.1: ผู้ใช้งานล็อกอินเข้าสู่ระบบ", async ({ page }) => {
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

    await expect(page.getByRole('heading', { name: 'แพ็กเกจทั้งหมดของชุมชน' })).toBeVisible();

    const packageCard = page.getByRole('link').filter({ has: page.getByRole('heading') }) .first();
    await expect(packageCard).toBeVisible();
    await packageCard.click();

    await expect(page).toHaveURL(/\/tourist\/package\/\d+/);
  });

  /*
   * TC-DP-02.2
   * ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ
   */
  test("TC-DP-02.2: ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ", async ({ page }) => {
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

    await expect(page.getByRole('heading', { name: 'แพ็กเกจทั้งหมดของชุมชน' })).toBeVisible();

    const packageCard = page.getByRole('link').filter({ has: page.getByRole('heading') }) .first();
    await expect(packageCard).toBeVisible();
    await packageCard.click();

    await expect(page).toHaveURL(/\/tourist\/package\/\d+/);
  });
 
});

