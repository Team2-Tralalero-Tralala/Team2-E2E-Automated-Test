import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import { goToPageEditPackage } from "../../flows/member/PageEditPackage.flow";

test.describe("Member - Edit Package Validation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
  });
  /**
   * TS-EDIT-03
   * ตรวจสอบการเปิดหน้าแก้ไขแพ็กเกจของสมาชิก
   */
  test("TS-EDIT-03: Validate required fields when clearing existing data", async ({
    page,
  }) => {
    await goToPageEditPackage(page, "เรียนรู้การจักสาน");

    await page.locator("#name").fill("");
    await page.locator("#name").blur();
    await expect(page.locator("#name-helper-text")).toHaveText(
      "กรุณากรอกชื่อแพ็กเกจ"
    );

    await page.locator("#description").fill("");
    await page.locator("#description").blur();
    await expect(page.locator("#description-helper-text")).toHaveText(
      "กรุณากรอกรายละเอียดแพ็กเกจ"
    );

    await page.locator("#houseNumber").fill("");
    await page.locator("#houseNumber").blur();
    await expect(page.locator("#houseNumber-helper-text")).toHaveText(
      "กรุณากรอกบ้านเลขที่"
    );

    await page.locator("#addressDetail").fill("");
    await page.locator("#addressDetail").blur();
    await expect(page.locator("#addressDetail-helper-text")).toHaveText(
      "กรุณาคำอธิบายที่อยู่"
    );

    await page.locator("#latitude").fill("0");
    await page.locator("#latitude").blur();
    await expect(page.getByText("กรุณากรอกละติจูด")).toBeVisible();

    await page.locator("#longitude").fill("0");
    await page.locator("#longitude").blur();
    await expect(page.getByText("กรุณากรอกลองจิจูด")).toBeVisible();

    await page.locator("#capacity").fill("");
    await page.locator("#capacity").blur();
    await expect(page.locator("#capacity-helper-text")).toHaveText(
      "กรุณากรอกจำนวนที่เปิดรับ"
    );

    await page.locator("#facility").fill("");
    await page.locator("#facility").blur();
    await expect(page.locator("#facility-helper-text")).toHaveText(
      "กรุณากรอกสิ่งอำนวยความสะดวก"
    );

    const startDateInputs = page.locator("#startDate input");
    await startDateInputs.fill("");
    await startDateInputs.nth(2).blur();
    await expect(
      page.getByText("กรุณากรอกวัน/เดือน/ปี (พ.ศ.) ที่เริ่ม")
    ).toBeVisible();

    const startTimeInputs = page
      .locator('[id^="time-input"] input')
      .first()
      .locator("xpath=ancestor::div//input");
    await startTimeInputs.nth(0).fill("");
    await startTimeInputs.nth(1).fill("");
    await startTimeInputs.nth(1).blur();
    await expect(page.getByText("กรุณาเลือกเวลาเริ่ม")).toBeVisible();

    const endDateInputs = page.locator("#endDate input");
    await endDateInputs.fill("");
    await endDateInputs.nth(2).blur();
    await expect(
      page.getByText("กรุณากรอกวัน/เดือน/ปี (พ.ศ.) ที่สิ้นสุด")
    ).toBeVisible();

    await expect(page.getByText("กรุณาเลือกเวลาสิ้นสุด")).toBeVisible();

    const openDateInputs = page.locator("#openDate input");
    await openDateInputs.fill("");
    await openDateInputs.nth(2).blur();
    await expect(
      page.getByText("กรุณากรอกวัน/เดือน/ปี (พ.ศ.) ที่เปิดจอง")
    ).toBeVisible();

    await expect(page.getByText("กรุณาเลือกเวลาเปิดจอง")).toBeVisible();

    const closeDateInputs = page.locator("#closeDate input");
    await closeDateInputs.fill("");
    await closeDateInputs.nth(2).blur();
    await expect(
      page.getByText("กรุณากรอกวัน/เดือน/ปี (พ.ศ.) ที่ปิดจอง")
    ).toBeVisible();

    await expect(page.getByText("กรุณาเลือกเวลาปิดจอง")).toBeVisible();

    await page.locator('[aria-label="ลบแท็ก"]').click();
    await expect(page.getByText("กรุณาเลือกแท็ก")).toBeVisible();

    await page.locator("#price").fill("");
    await page.locator("#price").blur();
    await expect(page.getByText("กรุณากรอกราคา")).toBeVisible();

    await page.locator('[aria-label="ลบรูป"]').click();
    await expect(page.getByText("กรุณาอัพโหลดภาพหน้าปก")).toBeVisible();
    await expect(page.getByText("กรุณาอัพโหลดรูปภาพเพิ่มเติม")).toBeVisible();
    await expect(page.getByText("กรุณาอัพโหลดวิดีโอเพิ่มเติม")).toBeVisible();
  });
});
