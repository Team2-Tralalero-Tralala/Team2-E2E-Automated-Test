import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageCreateAccount
 * ใช้สำหรับนำทางจากหน้า Community List ไปยังหน้า Create Community
 * Steps:
 * 1. คลิกปุ่ม "เพิ่มชุมชน"
 * 2. ตรวจสอบว่า URL เป็น /super/community/create
 */
async function goToPageCreateAccount(page) {
  const addBtn = page.getByRole("button", { name: "เพิ่มชุมชน" });
  await expect(addBtn).toBeVisible();
  await addBtn.click();

  await expect(page).toHaveURL(/\/super\/community\/create$/);
}

/**
 * uploadCoverImage
 * อัปโหลดรูปหน้าปกชุมชน และยืนยันการครอป
 */
async function uploadCoverImage(page) {
  const coverImage = path.resolve(
    process.cwd(),
    "assets/photo/communityCover.jpeg"
  );
  await page.locator('input[type="file"]').nth(0).setInputFiles(coverImage);
  const useCropBtn = page.getByRole("button", { name: "ใช้รูปที่ครอป" });
  await expect(useCropBtn).toBeVisible();
  await useCropBtn.click();
  await expect(useCropBtn).toBeHidden();
}

/**
 * uploadLogoImage
 * อัปโหลดโลโก้ชุมชน และยืนยันการครอป
 */
async function uploadLogoImage(page) {
  const logoImage = path.resolve(
    process.cwd(),
    "assets/photo/logoCommunity.jpg"
  );
  await page.locator('input[type="file"]').nth(1).setInputFiles(logoImage);
  const useConfirmBtn = page.getByRole("button", { name: "ใช้รูปที่ครอป" });
  await expect(useConfirmBtn).toBeVisible();
  await useConfirmBtn.click();
  await expect(useConfirmBtn).toBeHidden();
}

test.describe("SuperAdmin - Create Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-ACMNT-01.1
   * กรอกข้อมูลครบถ้วน (ข้อมูลชุมชน)
   */
  test("TC-ACMNT-01.1: Create community with complete community information", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("บ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("หัตถกรรม");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400012345");

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2566");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();

    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");
  });

  /**
   * TC-ACMNT-01.2
   * ไม่กรอกชื่อวิสาหกิจ
   */
  test("TC-ACMNT-01.2: Validate required community name", async ({ page }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("บ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("หัตถกรรม");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400012345");

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2566");
    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    const nameError = page.getByText("กรุณากรอกชื่อวิสาหกิจชุมชน");
    await expect(nameError).toBeVisible();
    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.3
   * ไม่กรอกเลขทะเบียน
   */
  test("TC-ACMNT-01.3: Validate required community registration number", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    
    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("บ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("หัตถกรรม");

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2566");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();

    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    const nameError = page.getByText("กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน");
    await expect(nameError).toBeVisible();
    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.4
   * อัพโหลดรูปภาพหน้าปกและโลโก้
   */
  test("TC-ACMNT-01.4: Upload community cover and logo images", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);
  });

  /**
   * TC-ACMNT-01.5
   * กรอกข้อมูลบัญชีธนาคารครบ
   */
  test("TC-ACMNT-01.5: Fill complete bank account information", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");
    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");
  });

  /**
   * TC-ACMNT-01.6
   * ไม่กรอกเลขบัญชี
   */
  test("TC-ACMNT-01.6: Validate required bank account number", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    const nameError = page.getByText("กรุณากรอกหมายเลขบัญชี");
    await expect(nameError).toBeVisible();
    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.7
   * กรอกเลขบัญชีเป็นตัวอักษร
   */
  test("TC-ACMNT-01.7: Validate bank account accepts numeric only", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("ssqowkq11029");

    const nameError = page.getByText("กรุณากรอกเลขบัญชีเป็นตัวเลข");
    await expect(nameError).toBeVisible();
    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.8
   * กรอกกิจกรรมหลัก
   */
  test("TC-ACMNT-01.8: Fill main activity information", async ({ page }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");
  });

  /**
   * TC-ACMNT-01.9
   * ไม่กรอกชื่อกิจกรรมหลัก
   */
  test("TC-ACMNT-01.9: Validate required main activity name", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("บ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("หัตถกรรม");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400012345");

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2566");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();

    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    const nameError = page.getByText("กรุณากรอกชื่อกิจกรรมหลัก");
    await expect(nameError).toBeVisible();
    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.10
   * อัพโหลดรูปภาพเพิ่มเติม
   */
  test("TC-ACMNT-01.10: Upload additional community images", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const imageSection = page
      .locator("text=อัพโหลดรูปภาพเพิ่มเติม")
      .locator("..");

    const imageInput = imageSection.locator('input[type="file"]');

    const images = [
      path.join(process.cwd(), "assets/photo/activity1.jpeg"),
      path.join(process.cwd(), "assets/photo/activity2.jpg"),
      path.join(process.cwd(), "assets/photo/activity3.jpg"),
    ];

    for (let i = 0; i < images.length; i++) {
      await imageInput.setInputFiles(images[i]);
      await expect(imageSection).toContainText(`${i + 1} / 5`);
    }
  });

  /**
   * TC-ACMNT-01.11
   * อัพโหลดวิดิโอเพิ่มเติม
   */
  test("TC-ACMNT-01.11: Upload additional community videos", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const videoSection = page
      .locator("text=อัพโหลดวิดีโอเพิ่มเติม")
      .locator("..");

    const videoInput = videoSection.locator('input[type="file"]');

    const videos = [
      path.join(process.cwd(), "assets/video/activity_Video1.mp4"),
      path.join(process.cwd(), "assets/video/activity_Video2.mp4"),
    ];
    for (let i = 0; i < videos.length; i++) {
      await videoInput.setInputFiles(videos[i]);
      await expect(videoSection).toContainText(`${i + 1} / 5`);
    }
  });

  /**
   * TC-ACMNT-01.12
   * กรอกข้อมูลครบถ้วน(ข้อมูลที่อยู่ชุมชน)
   */
  test("TC-ACMNT-01.12: Fill complete community address information", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("123");
    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("5");

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await expect(province).toBeEnabled();
    await province.click();
    await province.fill("กรุงเทพ");

    const provinceOption = page.getByRole("option", {
      name: "กรุงเทพมหานคร",
    });
    await expect(provinceOption).toBeVisible();
    await provinceOption.click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await expect(district).toBeEnabled();
    await district.click();
    await district.fill("บางกะปิ");

    const districtOption = page.getByRole("option", { name: "บางกะปิ" });
    await expect(districtOption).toBeVisible();
    await districtOption.click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await expect(subDistrict).toBeEnabled();
    await subDistrict.click();
    await subDistrict.fill("หัวหมาก");

    const subDistrictOption = page.getByRole("option", {
      name: "หัวหมาก",
    });
    await expect(subDistrictOption).toBeVisible();
    await subDistrictOption.click();

    const postcode = page.getByRole("textbox", {
      name: "รหัสไปรษณีย์ *",
    });
    await expect(postcode).toHaveValue("10240");

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ตั้งอยู่ใกล้วัดและโรงเรียนประจำหมู่บ้าน");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.736717");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("100.523186");
  });

  /**
   * TC-ACMNT-01.13
   * กรอกข้อมูลไม่ครบถ้วนหลายจุด
   */
  test("TC-ACMNT-01.13: Validate incomplete community address information", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();
    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await expect(province).toBeEnabled();
    await province.click();
    await province.fill("กรุงเทพ");

    const provinceOption = page.getByRole("option", {
      name: "กรุงเทพมหานคร",
    });
    await expect(provinceOption).toBeVisible();
    await provinceOption.click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await expect(district).toBeEnabled();
    await district.click();
    await district.fill("บางกะปิ");

    const districtOption = page.getByRole("option", { name: "บางกะปิ" });
    await expect(districtOption).toBeVisible();
    await districtOption.click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await expect(subDistrict).toBeEnabled();
    await subDistrict.click();
    await subDistrict.fill("หัวหมาก");

    const subDistrictOption = page.getByRole("option", {
      name: "หัวหมาก",
    });
    await expect(subDistrictOption).toBeVisible();
    await subDistrictOption.click();

    const postcode = page.getByRole("textbox", {
      name: "รหัสไปรษณีย์ *",
    });
    await expect(postcode).toHaveValue("10240");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.736717");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("100.523186");

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await expect(resultDialog).toContainText("ข้อมูลไม่ถูกต้อง");
    await expect(resultDialog).toContainText(
      "กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก"
    );

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.14
   * ปักหมุดวิสาหกิจ
   */
  test("TC-ACMNT-01.14: Pin community location by latitude and longitude", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("14.1224");
    await page.getByRole("spinbutton", { name: "ลองจิจูด *" }).fill("101.0712");
  });

  /**
   * TC-ACMNT-01.15
   * ปักหมุดวิสาหกิจ
   */
  test("TC-ACMNT-01.15: Pin community location by searching place", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    const searchInput = page.getByPlaceholder(
      "ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด"
    );

    await searchInput.click();
    await searchInput.fill("กระบี่");

    const firstOption = page.locator('li:has-text("อำเภอเมืองกระบี่")').first();

    await expect(firstOption).toBeVisible();
    await firstOption.click();

    const latInput = page.getByRole("spinbutton", { name: "ละติจูด *" });
    const lngInput = page.getByRole("spinbutton", { name: "ลองจิจูด *" });

    await expect(latInput).not.toHaveValue("");
    await expect(lngInput).not.toHaveValue("");

    const lat = Number(await latInput.inputValue());
    const lng = Number(await lngInput.inputValue());

    expect(lat).toBeGreaterThan(0);
    expect(lng).toBeGreaterThan(0);
  });

  /**
   * TC-ACMNT-01.16
   * กรอกข้อมูลวิสาหกิจ (ข้อมูลติดต่อและผู้ดูแล)
   */
  test("TC-ACMNT-01.16: Fill contact and caretaker information", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "โทรศัพท์วิสาหกิจชุมชน *" })
      .fill("0812345678");

    await page
      .getByRole("textbox", { name: "อีเมลวิสาหกิจชุมชน *" })
      .fill("community1@gmail.com");

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://community.test");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/community");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/community");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@community");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("สมชาย ใจดี");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0899999999");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("สมหญิง ใจงาม");

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill("0888888888");

    const caretaker = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretaker.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill("กมล");

    const caretakerOption = page.getByText("กมล เบอร์ลี่", { exact: true });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretaker).toHaveValue("กมล เบอร์ลี่");

    const memberDropdown = page.getByRole("combobox", { name: "สมาชิก" });
    await memberDropdown.click();

    const memberSearch = page.getByPlaceholder("ค้นหาสมาชิก");
    await memberSearch.fill("จินตนา");

    const jintanaOption = page.getByText("จินตนา จิรายุ", { exact: true });
    await expect(jintanaOption).toBeVisible();
    await jintanaOption.click();
  });

  /**
   * TC-ACMNT-01.17
   * กรอกข้อมูลไม่ครบถ้วน
   */
  test("TC-ACMNT-01.17: Validate incomplete community information", async ({ page }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("หัตถกรรม");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("123");
    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("5");

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await expect(province).toBeEnabled();
    await province.click();
    await province.fill("กรุงเทพ");

    const provinceOption = page.getByRole("option", {
      name: "กรุงเทพมหานคร",
    });
    await expect(provinceOption).toBeVisible();
    await provinceOption.click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await expect(district).toBeEnabled();
    await district.click();
    await district.fill("บางกะปิ");

    const districtOption = page.getByRole("option", { name: "บางกะปิ" });
    await expect(districtOption).toBeVisible();
    await districtOption.click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await expect(subDistrict).toBeEnabled();
    await subDistrict.click();
    await subDistrict.fill("หัวหมาก");

    const subDistrictOption = page.getByRole("option", {
      name: "หัวหมาก",
    });
    await expect(subDistrictOption).toBeVisible();
    await subDistrictOption.click();

    const postcode = page.getByRole("textbox", {
      name: "รหัสไปรษณีย์ *",
    });
    await expect(postcode).toHaveValue("10240");

    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("สมชาย ใจดี");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0899999999");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("สมหญิง ใจงาม");

    const caretaker = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretaker.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill("กมล");

    const caretakerOption = page.getByText("กมล เบอร์ลี่", { exact: true });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretaker).toHaveValue("กมล เบอร์ลี่");
    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await expect(resultDialog).toContainText("ข้อมูลไม่ถูกต้อง");
    await expect(resultDialog).toContainText(
      "กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก"
    );

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.18
   * กรอกข้อมูลครบถ้วน Dropdown (Modal)
   */
  test("TC-ACMNT-01.18: Create community with complete information", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("บ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("หัตถกรรม");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400012345");

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2566");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();

    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");

    const imageSection = page
      .locator("text=อัพโหลดรูปภาพเพิ่มเติม")
      .locator("..");

    const imageInput = imageSection.locator('input[type="file"]');

    const images = [
      path.join(process.cwd(), "assets/photo/activity1.jpeg"),
      path.join(process.cwd(), "assets/photo/activity2.jpg"),
      path.join(process.cwd(), "assets/photo/activity3.jpg"),
    ];

    for (let i = 0; i < images.length; i++) {
      await imageInput.setInputFiles(images[i]);
      await expect(imageSection).toContainText(`${i + 1} / 5`);
    }

    const videoSection = page
      .locator("text=อัพโหลดวิดีโอเพิ่มเติม")
      .locator("..");

    const videoInput = videoSection.locator('input[type="file"]');

    const videos = [
      path.join(process.cwd(), "assets/video/activity_Video1.mp4"),
      path.join(process.cwd(), "assets/video/activity_Video2.mp4"),
    ];
    for (let i = 0; i < videos.length; i++) {
      await videoInput.setInputFiles(videos[i]);
      await expect(videoSection).toContainText(`${i + 1} / 5`);
    }
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("123");
    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("5");

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await expect(province).toBeEnabled();
    await province.click();
    await province.fill("กรุงเทพ");

    const provinceOption = page.getByRole("option", {
      name: "กรุงเทพมหานคร",
    });
    await expect(provinceOption).toBeVisible();
    await provinceOption.click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await expect(district).toBeEnabled();
    await district.click();
    await district.fill("บางกะปิ");

    const districtOption = page.getByRole("option", { name: "บางกะปิ" });
    await expect(districtOption).toBeVisible();
    await districtOption.click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await expect(subDistrict).toBeEnabled();
    await subDistrict.click();
    await subDistrict.fill("หัวหมาก");

    const subDistrictOption = page.getByRole("option", {
      name: "หัวหมาก",
    });
    await expect(subDistrictOption).toBeVisible();
    await subDistrictOption.click();

    const postcode = page.getByRole("textbox", {
      name: "รหัสไปรษณีย์ *",
    });
    await expect(postcode).toHaveValue("10240");

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ตั้งอยู่ใกล้วัดและโรงเรียนประจำหมู่บ้าน");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.736717");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("100.523186");

    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "โทรศัพท์วิสาหกิจชุมชน *" })
      .fill("0812345678");

    await page
      .getByRole("textbox", { name: "อีเมลวิสาหกิจชุมชน *" })
      .fill("community1@gmail.com");

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://community.test");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/community");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/community");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@community");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("สมชาย ใจดี");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0899999999");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("สมหญิง ใจงาม");

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill("0888888888");

    const caretaker = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretaker.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill("กมล");

    const caretakerOption = page.getByText("กมล เบอร์ลี่", { exact: true });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretaker).toHaveValue("กมล เบอร์ลี่");

    const memberDropdown = page.getByRole("combobox", { name: "สมาชิก" });
    await memberDropdown.click();

    const memberSearch = page.getByPlaceholder("ค้นหาสมาชิก");
    await memberSearch.fill("จินตนา");

    const jintanaOption = page.getByText("จินตนา จิรายุ", { exact: true });
    await expect(jintanaOption).toBeVisible();
    await jintanaOption.click();
    await page.keyboard.press("Escape");

    await page.waitForSelector('[role="option"]', {
      state: "detached",
    });

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);

    await expect(
      page.getByRole("cell", { name: "วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่" })
    ).toBeVisible();
  });

  /**
   * TC-ACMNT-01.19
   * กรอกข้อมูลเมนูแบบเลื่อนลง (Dropdown)ไม่ครบถ้วน
   */
  test("TC-ACMNT-01.19: Validate incomplete dropdown selections", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2566");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();

    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");

    const imageSection = page
      .locator("text=อัพโหลดรูปภาพเพิ่มเติม")
      .locator("..");

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ตั้งอยู่ใกล้วัดและโรงเรียนประจำหมู่บ้าน");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.736717");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("100.523186");

    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://community.test");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/community");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/community");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@community");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("สมชาย ใจดี");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0899999999");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("สมหญิง ใจงาม");

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill("0888888888");

    const caretaker = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretaker.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill("กมล");

    const caretakerOption = page.getByText("กมล เบอร์ลี่", { exact: true });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretaker).toHaveValue("กมล เบอร์ลี่");

    const memberDropdown = page.getByRole("combobox", { name: "สมาชิก" });
    await memberDropdown.click();

    const memberSearch = page.getByPlaceholder("ค้นหาสมาชิก");
    await memberSearch.fill("จินตนา");

    const jintanaOption = page.getByText("จินตนา จิรายุ", { exact: true });
    await expect(jintanaOption).toBeVisible();
    await jintanaOption.click();
    await page.keyboard.press("Escape");

    await page.waitForSelector('[role="option"]', {
      state: "detached",
    });

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await expect(resultDialog).toContainText("ข้อมูลไม่ถูกต้อง");
    await expect(resultDialog).toContainText(
      "กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก"
    );

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.20
   * ยกเลิกการสร้างชุมชน (แบบ Modal)
   */
  test("TC-ACMNT-01.20: Cancel create community via confirmation modal", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2566");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();

    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("1234567890");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill("กลุ่มชาวบ้านรวมตัวกันทอผ้าไหมพื้นเมืองเพื่อสร้างรายได้ในชุมชน");

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ทอผ้าไหม");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผ้าไหมพื้นเมืองแบบดั้งเดิม");

    const imageSection = page
      .locator("text=อัพโหลดรูปภาพเพิ่มเติม")
      .locator("..");

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ตั้งอยู่ใกล้วัดและโรงเรียนประจำหมู่บ้าน");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.736717");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("100.523186");

    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://community.test");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/community");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/community");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@community");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("สมชาย ใจดี");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0899999999");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("สมหญิง ใจงาม");

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill("0888888888");

    const caretaker = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretaker.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill("กมล");

    const caretakerOption = page.getByText("กมล เบอร์ลี่", { exact: true });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretaker).toHaveValue("กมล เบอร์ลี่");

    const memberDropdown = page.getByRole("combobox", { name: "สมาชิก" });
    await memberDropdown.click();

    const memberSearch = page.getByPlaceholder("ค้นหาสมาชิก");
    await memberSearch.fill("จินตนา");

    const jintanaOption = page.getByText("จินตนา จิรายุ", { exact: true });
    await expect(jintanaOption).toBeVisible();
    await jintanaOption.click();
    await page.keyboard.press("Escape");

    await page.waitForSelector('[role="option"]', {
      state: "detached",
    });

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยกเลิก" }).click();

    await expect(page).toHaveURL(/\/super\/community\/create$/);
  });

  /**
   * TC-ACMNT-01.21
   *  ยกเลิกการสร้างชุมชน;
   */
  test("TC-ACMNT-01.21: Cancel create community and return to community list", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(page).toHaveURL(/super\/communities/);
  });
});
