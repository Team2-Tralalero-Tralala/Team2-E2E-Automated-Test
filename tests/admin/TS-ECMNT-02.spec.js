import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageEditCommunity
 * ใช้สำหรับนำทางจากหน้า Community List ไปยังหน้า Edit Community
 * Steps:
 * 1. คลิกปุ่ม "แก้ไข"
 * 2. ตรวจสอบว่า URL เป็น /admin/community/own/edit
 */
async function goToPageEditCommunity(page) {
  const addBtn = page.getByRole("button", { name: "แก้ไข" });
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  await expect(page).toHaveURL(/\/admin\/community\/own\/edit/);
}

test.describe("Admin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-ECMNT-02.1
   * กรอกข้อมูลครบถ้วน (ข้อมูลที่อยู่วิสาหกิจชุมชน)
   */
  test("TS-ECMNT-02.1: Fill complete community address information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("128/7");

    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("5");

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.fill("เชียงใหม่");
    await province.press("Tab");

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.fill("แม่ริม");
    await district.press("Tab");

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await subDistrict.fill("ริมใต้");
    await subDistrict.press("Tab");

    await expect(
      page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" })
    ).toHaveValue("23170");

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ตั้งอยู่ใกล้ศูนย์พัฒนาเกษตรอินทรีย์และแหล่งท่องเที่ยวชุมชน");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("18.918703");

    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("98.981716");
  });

  /**
   * TS-ECMNT-02.2
   * กรอกข้อมูลไม่ครบถ้วน (ข้อมูลที่อยู่วิสาหกิจชุมชน)
   */
  test("TS-ECMNT-02.2: Validate required fields in community address", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();
    const houseNumber = page.getByRole("textbox", { name: "บ้านเลขที่ *" });
    await houseNumber.fill("");
    await houseNumber.press("Tab");

    await expect(page.locator("#houseNumber-helper-text")).toHaveText(
      "กรุณากรอกบ้านเลขที่"
    );
    await expect(houseNumber).toHaveClass(/border-red-600/);

    const addressDetail = page.locator("#detail");
    await addressDetail.fill("");
    await addressDetail.press("Tab");

    await expect(page.getByText("กรุณากรอกคำอธิบายที่อยู่")).toBeVisible();

    const latitude = page.getByRole("spinbutton", { name: "ละติจูด *" });
    await latitude.fill("");
    await latitude.press("Tab");

    await expect(page.getByText("กรุณากรอกละติจูด")).toBeVisible();

    const longitude = page.getByRole("spinbutton", { name: "ลองจิจูด *" });
    await longitude.fill("");
    await longitude.press("Tab");

    await expect(page.getByText("กรุณากรอกลองจิจูด")).toBeVisible();
  });

  /**
   * TS-ECMNT-02.3
   * ปักหมุดวิสาหกิจจากการค้นหาสถานที่ใกล้เคียง
   */
  test("TS-ECMNT-02.3: Pin community location by searching place", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();
    const searchInput = page.getByPlaceholder(
      "ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด"
    );

    await searchInput.click();
    await searchInput.fill("อำเภอแม่ริม");

    const firstOption = page.locator('li:has-text("อำเภอแม่ริม")').first();

    await expect(firstOption).toBeVisible();
    await firstOption.click();

    const latInput = page.getByRole("spinbutton", { name: "ละติจูด *" });
    const lngInput = page.getByRole("spinbutton", { name: "ลองจิจูด *" });

    await expect(latInput).not.toHaveValue("");
    await expect(lngInput).not.toHaveValue("");

    const lat = Number(await latInput.inputValue());
    const lng = Number(await lngInput.inputValue());

    expect(lat).toBeGreaterThan(18);
    expect(lat).toBeLessThan(19);

    expect(lng).toBeGreaterThan(98);
    expect(lng).toBeLessThan(99);
  });
});
