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
   * TS-ECMNT-01.1
   * กรอกข้อมูลครบถ้วน (ข้อมูลชุมชน)
   */
  test("TS-ECMNT-01.1: Edit community with complete community information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนแปรรูปข้าวอินทรีย์บ้านหนองโพ");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("กลุ่มข้าวอินทรีย์หนองโพ");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("เกษตรแปรรูป");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("SMCE-9023-7");

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2565");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page
      .getByRole("option", {
        name: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
      })
      .click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนแปรรูปข้าวอินทรีย์บ้านหนองโพ");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("0949283212");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill(
        "กลุ่มเกษตรกรรวมตัวกันผลิตและแปรรูปข้าวอินทรีย์ เพื่อเพิ่มมูลค่าและสร้างรายได้อย่างยั่งยืน"
      );

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("แปรรูปข้าวอินทรีย์");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill(
        "ผลิตและจำหน่ายข้าวสารอินทรีย์ ข้าวกล้อง และผลิตภัณฑ์แปรรูปจากข้าว"
      );
  });

  /**
   * TS-ECMNT-01.2
   * ไม่กรอกชื่อวิสาหกิจชุมชน
   */
  test("TS-ECMNT-01.2: Validate required community name", async ({ page }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const communityNameInput = page.getByRole("textbox", {
      name: /ชื่อวิสาหกิจชุมชน/,
    });

    await expect(communityNameInput).toBeVisible();
    await communityNameInput.fill("");
    await communityNameInput.blur();
    const validationMessage = page.getByText("กรุณากรอกชื่อวิสาหกิจชุมชน");
    await expect(validationMessage).toBeVisible();
  });

  /**
   * TS-ECMNT-01.3
   * ไม่กรอกเลขทะเบียน
   */
  test("TS-ECMNT-01.3: Validate required community registration number", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByLabel("เลขทะเบียนวิสาหกิจชุมชน *").clear();
    await expect(
      page.getByText("กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน")
    ).toBeVisible();
  });

  /**
   * TS-ECMNT-01.4
   * กรอกเลขทะเบียนเป็นตัวอักษร
   */
  test("TS-ECMNT-01.4: Validate community registration number accepts characters", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const communityNumberInput = page.getByRole("textbox", {
      name: /เลขทะเบียนวิสาหกิจชุมชน/,
    });

    await expect(communityNumberInput).toBeVisible();
    await communityNumberInput.fill("SMCE-9023-7");
  });

  /**
   * TS-ECMNT-01.5
   * กรอกชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น
   */
  test("TS-ECMNT-01.5: Validate local name input", async ({ page }) => {
    await goToPageEditCommunity(page);
    const localNameInput = page.locator("#alias");
    await localNameInput.fill("", { force: true });
    await localNameInput.fill("ชชทน", { force: true });
    await localNameInput.blur({ force: true });
  });

  /**
   * TS-ECMNT-01.6
   * กรอกเลขทะเบียนเป็นตัวอักษร
   */

  test("TS-ECMNT-01.6: Upload logo image", async ({ page }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const profileImage = path.resolve(
      process.cwd(),
      "assets/photo/logoCommunity.jpg"
    );

    const avatarBtn = page.locator('button[id^="avatar-"]');
    await expect(avatarBtn).toBeVisible();
    await avatarBtn.click();

    const changeImageBtn = page.getByRole("button", { name: "เปลี่ยนรูป" });
    await expect(changeImageBtn).toBeVisible();
    await changeImageBtn.click();

    const fileInput = page.locator('button[id^="avatar-"] input[type="file"]');
    await fileInput.setInputFiles(profileImage);

    const cropDialog = page.getByRole("dialog");
    await expect(cropDialog).toBeVisible();

    const useOriginalBtn = cropDialog.getByRole("button", {
      name: "ใช้รูปเดิม",
    });
    await expect(useOriginalBtn).toBeVisible();
    await useOriginalBtn.click();
    await expect(cropDialog).toBeHidden();
  });

  /**
   * TS-ECMNT-01.7
   * กรอกบัญชีข้อมูลธนาคารครบ
   */
  test("TS-ECMNT-01.7: Edit complete bank account information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร");
    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนแปรรูปข้าวอินทรีย์บ้านหนองโพ");
    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("0949283212");
  });

  /**
   * TS-ECMNT-01.8
   * ไม่กรอกเลขบัญชี
   */
  test("TS-ECMNT-01.8: Validate required bank account number", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByLabel("หมายเลขบัญชี *").clear();
    await expect(page.getByText("กรุณากรอกหมายเลขบัญชี")).toBeVisible();
  });

  /**
   * TS-ECMNT-01.9
   * ไม่กรอกเลขบัญชี
   */
  test("TS-ECMNT-01.9: Validate bank account accepts numeric only", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("111-0-1กห11-ก");

    const nameError = page.getByText("กรุณากรอกเลขบัญชีเป็นตัวเลข");
    await expect(nameError).toBeVisible();
  });

  /**
   * TS-ECMNT-01.10
   * ไม่กรอกชื่อกิจกรรมหลัก
   */
  test("TS-ECMNT-01.10:  Validate required main activity name", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByLabel("ชื่อกิจกรรมหลัก *").clear();
    const nameError = page.getByText("กรุณากรอกชื่อกิจกรรมหลัก");
    await expect(nameError).toBeVisible();
  });
});
