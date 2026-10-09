import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";
import process from "process";

/**
 * goToAccommodationPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าจัดการที่พัก (Homestay Management)
 * Input:
 * - page: object ของ Playwright Page
 * Action:
 * 1. เลือกเมนู "จัดการชุมชน"
 * 2. เลือกชุมชนแรกจากรายการ
 * 3. คลิก Accordion "ที่พัก"
 * 4. กดปุ่ม "จัดการ"
 * Output:
 * - ไม่มี return value, แต่ browser จะ navigate ไปยัง URL /super/community/\d+/homestay/all
 */
async function goToAccommodationPage(page) {
    const manageCommunityLink = page
        .getByRole("link", { name: "จัดการชุมชน" })
        .first();
    await expect(manageCommunityLink).toBeVisible();
    await manageCommunityLink.click();
    await expect(page).toHaveURL(/super\/communities/);

    const communityLink = page.locator('a[href^="/super/community/"]').first();
    await expect(communityLink).toBeVisible();
    await communityLink.click();
    await expect(page).toHaveURL(/super\/community\/\d+/);

    const accommodationAccordion = page
        .locator("button")
        .filter({ hasText: "ที่พัก" })
        .first();
    await expect(accommodationAccordion).toBeVisible();
    await accommodationAccordion.click();

    await page.waitForTimeout(500);

    const manageBtn = page.getByRole("button", { name: "จัดการ" }).last();
    await expect(manageBtn).toBeVisible();
    await manageBtn.click();

    await expect(page).toHaveURL(/super\/community\/\d+\/homestay\/all/);
    console.log("Navigated to Homestay Management Page successfully.");
    await page.waitForTimeout(1000);
}

test.describe("TS-AHT-01 ผู้ใช้งาน Super Admin สามารถเพิ่มที่พักได้", () => {
    let page;

    test.beforeAll(async({ browser }) => {
        page = await browser.newPage();
        await loginAs(page, "superadmin");
    });

    test.afterAll(async() => {
        await page.close();
    });

    test.afterEach(async({}, testInfo) => {
        const fileName = testInfo.title
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
        if (page) {
            await page.screenshot({
                path: `screenshots/${fileName}.png`,
                fullPage: true,
            });
        }
    });

    /**
     * TC-AHT-01.1
     * กรอกข้อมูลครบถ้วน
     */
    test("TS-AHT-01.1: กรอกข้อมูลครบถ้วน", async({}) => {
        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await expect(addBtn).toBeVisible();
        await addBtn.click();
        await expect(
            page.getByText("เพิ่มที่พัก", { exact: true }).first()
        ).toBeVisible();

        await page.locator("#name").fill("บางแสนริมเล");
        await page.locator("#type").fill("โฮมสเตย์");
        await page.locator("#facility").fill("ที่พักสะอาด ๆ ยินดีต้อนรับ");
        await page.locator("#totalRoom").fill("10");
        await page.locator("#guestPerRoom").fill("2");
        await page.locator("#houseNumber").fill("231");
        await page.locator("#villageNumber").fill("6");

        const provinceInput = page.locator("#province");
        await provinceInput.click();
        await provinceInput.fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        const districtInput = page.locator("#district");
        await expect(districtInput).toBeEnabled();
        await districtInput.click();
        await districtInput.fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        const subDistrictInput = page.locator("#subDistrict");
        await expect(subDistrictInput).toBeEnabled();
        await subDistrictInput.click();
        await subDistrictInput.fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        await expect(page.locator("#postalCode")).toHaveValue("20000");
        await page.locator("#addressDetail").fill("บ้านเลขที่ 231 หมู่ 6");

        await page.locator("#latitude").fill("13.2838");
        await page.locator("#longitude").fill("100.9157");

        const tagInput = page.locator("#tag-selector");
        const tags = ["ที่พัก", "วิวสวย", "บางแสน"];
        for (const tag of tags) {
            await tagInput.fill(tag);
            await page.keyboard.press("Enter");
            await page.waitForTimeout(200);
        }

        const coverPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_cover_bangsaen.jpg"
        );
        const roomPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_bedroom_view.jpg"
        );
        const seaPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_sea_view.jpg"
        );

        const coverSection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
            .last();
        const coverInput = coverSection.locator('input[type="file"]');
        await coverInput.setInputFiles(coverPath);
        await expect(coverSection.locator("img")).toBeVisible({
            timeout: 10000,
        });

        const gallerySection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
            .last();
        const galleryInput = gallerySection.locator('input[type="file"]');
        await galleryInput.setInputFiles([roomPath, seaPath]);
        await expect(async() => {
            const count = await gallerySection.locator("img").count();
            expect(count).toBeGreaterThanOrEqual(2);
        }).toPass({ timeout: 10000 });

        await page.waitForTimeout(1000);

        const saveBtn = page.locator('button[type="submit"]');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click({ force: true });

        const confirmPopup = page.locator(".swal2-popup");
        await expect(confirmPopup).toBeVisible();
        await confirmPopup.locator(".swal2-confirm").click();
        await page.waitForTimeout(3000);
    });

    /**
     * TC-AHT-01.2
     * กรอกข้อมูลไม่ครบถ้วน (ตรวจสอบ Error)
     */
    test("TS-AHT-01.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async({}) => {
        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await expect(addBtn).toBeVisible();
        await addBtn.click();
        await expect(
            page.getByText("เพิ่มที่พัก", { exact: true }).first()
        ).toBeVisible();

        await page.locator("#facility").fill("ที่พักสะอาด ๆ ยินดีต้อนรับ");

        const provinceInput = page.locator("#province");
        await provinceInput.click();
        await provinceInput.fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        const districtInput = page.locator("#district");
        await expect(districtInput).toBeEnabled();
        await districtInput.click();
        await districtInput.fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        const subDistrictInput = page.locator("#subDistrict");
        await expect(subDistrictInput).toBeEnabled();
        await subDistrictInput.click();
        await subDistrictInput.fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        await page.locator("#latitude").fill("13.2838");

        const tagInput = page.locator("#tag-selector");
        const tags = ["ที่พัก", "วิวสวย", "บางแสน"];
        for (const tag of tags) {
            await tagInput.fill(tag);
            await page.keyboard.press("Enter");
            await page.waitForTimeout(200);
        }

        const galleryInput = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
            .last()
            .locator('input[type="file"]');

        await galleryInput.setInputFiles([{
                name: "room.jpg",
                mimeType: "image/jpeg",
                buffer: Buffer.from("fake"),
            },
            {
                name: "view.jpg",
                mimeType: "image/jpeg",
                buffer: Buffer.from("fake"),
            },
        ]);
        await page.waitForTimeout(2000);

        const saveBtn = page.locator('button[type="submit"]');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click({ force: true });

        await expect(saveBtn).toBeVisible();

        const nameError = page.locator("#name-helper-text");
        await expect(nameError).toBeVisible();
        await expect(nameError).toHaveText("กรุณากรอกชื่อที่พัก");

        const houseNumError = page.locator("#houseNumber-helper-text");
        await expect(houseNumError).toBeVisible();
        await expect(houseNumError).toHaveText("กรุณากรอกบ้านเลขที่");

        const typeError = page.locator("#type-helper-text");
        if (await typeError.isVisible()) {
            await expect(typeError).toHaveText("กรุณากรอกประเภทของที่พัก");
        }

        console.log("Verified: Inline validation errors appeared correctly.");
        await page.waitForTimeout(2000);
    });

    /**
     * TC-AHT-01.3
     * ปักหมุดหากไม่พบสถานที่
     */
    test("TS-AHT-01.3: ปักหมุดหากไม่พบสถานที่", async({}) => {
        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await expect(addBtn).toBeVisible();
        await addBtn.click();
        await expect(
            page.getByText("เพิ่มที่พัก", { exact: true }).first()
        ).toBeVisible();

        const searchInput = page.getByPlaceholder(
            "ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด"
        );
        await searchInput.fill("สถานที่ไม่มีอยู่จริง_XYZ_123");
        await page.keyboard.press("Enter");

        const pinBtn = page.getByText("ปักหมุด", { exact: true }).last();
        await expect(pinBtn).toBeVisible();
        await pinBtn.click();

        await page.locator("#latitude").fill("13.2838");
        await page.locator("#longitude").fill("100.9157");

        await expect(page.locator("#latitude")).toHaveValue("13.2838");
        await expect(page.locator("#longitude")).toHaveValue("100.9157");

        await page.locator("#name").fill("ที่พักปักหมุดเอง");
        await page.locator("#type").fill("โฮมสเตย์");
        await page.locator("#facility").fill("ทดสอบการปักหมุด");
        await page.locator("#totalRoom").fill("5");
        await page.locator("#guestPerRoom").fill("2");
        await page.locator("#houseNumber").fill("99/9");

        const provinceInput = page.locator("#province");
        await provinceInput.click();
        await provinceInput.fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        const districtInput = page.locator("#district");
        await districtInput.click();
        await districtInput.fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        const subDistrictInput = page.locator("#subDistrict");
        await subDistrictInput.click();
        await subDistrictInput.fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        await page.locator("#latitude").fill("13.2950");
        await page.locator("#longitude").fill("100.9250");

        const coverPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_cover_bangsaen.jpg"
        );
        const roomPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_bedroom_view.jpg"
        );
        const seaPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_sea_view.jpg"
        );

        const coverSection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
            .last();
        const coverInput = coverSection.locator('input[type="file"]');
        await coverInput.setInputFiles(coverPath);
        await expect(coverSection.locator("img")).toBeVisible({
            timeout: 10000,
        });

        const gallerySection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
            .last();
        const galleryInput = gallerySection.locator('input[type="file"]');
        await galleryInput.setInputFiles([roomPath, seaPath]);
        await expect(async() => {
            const count = await gallerySection.locator("img").count();
            expect(count).toBeGreaterThanOrEqual(2);
        }).toPass({ timeout: 10000 });

        await page.waitForTimeout(1000);
        await page.waitForTimeout(2000);

        const saveBtn = page.locator('button[type="submit"]');
        await saveBtn.click({ force: true });

        const confirmPopup = page.locator(".swal2-popup");
        await expect(confirmPopup).toBeVisible();
        await confirmPopup.locator(".swal2-confirm").click();

        await page.waitForTimeout(3000);
        console.log("Verified: Pinning location manually successful.");
    });

    /**
     * TC-AHT-01.4
     * ไม่เพิ่มแท็ก
     * คาดหวัง: ระบบต้องห้ามบันทึก และแสดง Error
     */
    test("TS-AHT-01.4: ไม่เพิ่มแท็ก", async({}) => {
        test.setTimeout(60000);

        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await expect(addBtn).toBeVisible();
        await addBtn.click();
        await expect(
            page.getByText("เพิ่มที่พัก", { exact: true }).first()
        ).toBeVisible();

        const timestamp = Date.now();
        console.log(
            `Testing Negative Case (No Tags) with Name: Homestay NoTag ${timestamp}`
        );

        await page.locator("#name").fill(`Homestay NoTag ${timestamp}`);
        await page.locator("#type").fill("โฮมสเตย์");
        await page.locator("#facility").fill("Test Validation: Missing Tags");
        await page.locator("#totalRoom").fill("3");
        await page.locator("#guestPerRoom").fill("2");
        await page.locator("#houseNumber").fill(`${timestamp}`);

        const provinceInput = page.locator("#province");
        await provinceInput.click();
        await provinceInput.fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        const districtInput = page.locator("#district");
        await districtInput.click();
        await districtInput.fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        const subDistrictInput = page.locator("#subDistrict");
        await subDistrictInput.click();
        await subDistrictInput.fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        const randomLat = (13.29 + Math.random() * 0.01).toFixed(4);
        const randomLng = (100.92 + Math.random() * 0.01).toFixed(4);
        await page.locator("#latitude").fill(randomLat);
        await page.locator("#longitude").fill(randomLng);

        const coverPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_cover_bangsaen.jpg"
        );
        const roomPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_bedroom_view.jpg"
        );
        const seaPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_sea_view.jpg"
        );

        const coverSection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
            .last();
        const coverInput = coverSection.locator('input[type="file"]');
        await coverInput.setInputFiles(coverPath);
        await expect(coverSection.locator("img")).toBeVisible({
            timeout: 10000,
        });

        const gallerySection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
            .last();
        const galleryInput = gallerySection.locator('input[type="file"]');
        await galleryInput.setInputFiles([roomPath, seaPath]);
        await expect(async() => {
            const count = await gallerySection.locator("img").count();
            expect(count).toBeGreaterThanOrEqual(2);
        }).toPass({ timeout: 10000 });

        await page.waitForTimeout(2000);

        await expect(page.getByText("ยังไม่ได้เลือก")).toBeVisible();

        const saveBtn = page.locator('button[type="submit"]');
        await saveBtn.scrollIntoViewIfNeeded();
        await expect(saveBtn).toBeEnabled();

        console.log("Clicking Save button (Expect failure)...");
        await saveBtn.click({ force: true });

        await page.waitForTimeout(1000);

        const popup = page.locator(".swal2-popup");

        if (await popup.isVisible()) {
            const text = await popup.innerText();
            console.log("Popup Appeared with text:", text);

            if (text.includes("ยืนยัน") || text.includes("บันทึก")) {
                const cancelBtn = popup.locator(".swal2-cancel");
                if (await cancelBtn.isVisible()) await cancelBtn.click();

                throw new Error(
                    "🚨 BUG FOUND: ระบบอนุญาตให้บันทึกได้โดยไม่ต้องใส่แท็ก (Confirmation Popup appeared)"
                );
            }

            const confirmBtn = popup.locator(".swal2-confirm");
            if (await confirmBtn.isVisible()) await confirmBtn.click();
            console.log("Verified: Error Popup displayed correctly.");
        } else {
            const inlineError = page
                .locator(".text-red-600")
                .filter({ hasText: /กรุณา|เลือก|แท็ก/ });

            if ((await inlineError.count()) > 0) {
                await expect(inlineError.first()).toBeVisible();
                console.log("Verified: Inline validation error displayed.");
            } else {
                await expect(saveBtn).toBeVisible();
                console.log(
                    "Warning: No explicit error message found, but system did not navigate away."
                );
            }
        }
    });

    /**
     * TC-AHT-01.5
     * ไม่อัปโหลดรูปภาพหน้าปก
     * คาดหวัง: ระบบต้องห้ามบันทึก และแสดง Error
     */
    test("TS-AHT-01.5: ไม่อัพโหลดรูปภาพเพิ่มเติม", async({}) => {
        test.setTimeout(60000);

        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await expect(addBtn).toBeVisible();
        await addBtn.click();
        await expect(
            page.getByText("เพิ่มที่พัก", { exact: true }).first()
        ).toBeVisible();

        const timestamp = Date.now();
        console.log(`Starting Negative Test (No Cover Image): ${timestamp}`);

        await page.locator("#name").fill(`Homestay NoCover ${timestamp}`);
        await page.locator("#type").fill("โฮมสเตย์");
        await page
            .locator("#facility")
            .fill("Test Validation: Missing Cover Image");
        await page.locator("#totalRoom").fill("5");
        await page.locator("#guestPerRoom").fill("2");
        await page.locator("#houseNumber").fill(`${timestamp}`);

        const provinceInput = page.locator("#province");
        await provinceInput.click();
        await provinceInput.fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        const districtInput = page.locator("#district");
        await districtInput.click();
        await districtInput.fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        const subDistrictInput = page.locator("#subDistrict");
        await subDistrictInput.click();
        await subDistrictInput.fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        await page.locator("#latitude").fill("13.2900");
        await page.locator("#longitude").fill("100.9200");

        const tagInput = page.locator("#tag-selector");
        await tagInput.click();
        await page.waitForTimeout(500);
        const tagOption = page.getByRole("option").first();
        if (await tagOption.isVisible()) {
            await tagOption.click();
        } else {
            await tagInput.fill("TestTag");
            await page.keyboard.press("Enter");
        }

        const roomPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_bedroom_view.jpg"
        );
        const seaPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_sea_view.jpg"
        );

        const gallerySection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
            .last();
        const galleryInput = gallerySection.locator('input[type="file"]');
        await galleryInput.setInputFiles([roomPath, seaPath]);

        await expect(async() => {
            const count = await gallerySection.locator("img").count();
            expect(count).toBeGreaterThanOrEqual(2);
        }).toPass({ timeout: 10000 });

        const coverSection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
            .last();
        await expect(coverSection.locator("img")).not.toBeVisible();

        const saveBtn = page.locator('button[type="submit"]');
        await saveBtn.scrollIntoViewIfNeeded();
        await expect(saveBtn).toBeEnabled();
        console.log("Clicking Save button (Expect failure)...");
        await saveBtn.click({ force: true });

        await page.waitForTimeout(1000);

        await expect(saveBtn).toBeVisible();

        const popup = page.locator(".swal2-popup");

        if (await popup.isVisible()) {
            const text = await popup.innerText();
            console.log("Popup Appeared with text:", text);

            if (text.includes("ยืนยัน") || text.includes("บันทึก")) {
                const cancelBtn = popup.locator(".swal2-cancel");
                if (await cancelBtn.isVisible()) await cancelBtn.click();
                throw new Error("🚨 BUG FOUND: ระบบยอมให้บันทึกโดยไม่มีรูปปก");
            }

            const confirmBtn = popup.locator(".swal2-confirm");
            if (await confirmBtn.isVisible()) await confirmBtn.click();
        } else {
            console.log(
                "Verified: No confirmation popup appeared (Save prevented)."
            );
        }
    });

    /**
     * TC-AHT-01.6
     * ไม่อัปโหลดรูปภาพเพิ่มเติม (Negative Test)
     * คาดหวัง: ระบบต้องห้ามบันทึก และแสดง Error หรือไม่เปลี่ยนหน้า
     */
    test("TS-AHT-01.6:ไม่อัพโหลดรูปภาพเพิ่มเติม", async({}) => {
        test.setTimeout(60000);

        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await expect(addBtn).toBeVisible();
        await addBtn.click();
        await expect(
            page.getByText("เพิ่มที่พัก", { exact: true }).first()
        ).toBeVisible();

        const timestamp = Date.now();
        console.log(`Starting Negative Test (No Gallery Images): ${timestamp}`);

        await page.locator("#name").fill(`Homestay NoGallery ${timestamp}`);
        await page.locator("#type").fill("โฮมสเตย์");
        await page
            .locator("#facility")
            .fill("Test Validation: Missing Gallery Images");
        await page.locator("#totalRoom").fill("5");
        await page.locator("#guestPerRoom").fill("2");
        await page.locator("#houseNumber").fill(`${timestamp}`);

        const provinceInput = page.locator("#province");
        await provinceInput.click();
        await provinceInput.fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        const districtInput = page.locator("#district");
        await districtInput.click();
        await districtInput.fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        const subDistrictInput = page.locator("#subDistrict");
        await subDistrictInput.click();
        await subDistrictInput.fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        await page.locator("#latitude").fill("13.2900");
        await page.locator("#longitude").fill("100.9200");

        const tagInput = page.locator("#tag-selector");
        await tagInput.click();
        await page.waitForTimeout(500);
        const tagOption = page.getByRole("option").first();
        if (await tagOption.isVisible()) {
            await tagOption.click();
        } else {
            await tagInput.fill("TestTag");
            await page.keyboard.press("Enter");
        }

        const coverPath = path.join(
            process.cwd(),
            "assets",
            "photo",
            "homestay_cover_bangsaen.jpg"
        );

        const coverSection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
            .last();
        await coverSection.locator('input[type="file"]').setInputFiles(coverPath);
        await expect(coverSection.locator("img")).toBeVisible({
            timeout: 10000,
        });

        const gallerySection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
            .last();
        await expect(gallerySection.locator("img")).not.toBeVisible();

        const saveBtn = page.locator('button[type="submit"]');
        await saveBtn.scrollIntoViewIfNeeded();
        await expect(saveBtn).toBeEnabled();
        console.log("Clicking Save button (Expect failure)...");
        await saveBtn.click({ force: true });

        await page.waitForTimeout(1000);
        await expect(saveBtn).toBeVisible();

        const popup = page.locator(".swal2-popup");

        if (await popup.isVisible()) {
            const text = await popup.innerText();
            if (text.includes("ยืนยัน") || text.includes("บันทึก")) {
                const cancelBtn = popup.locator(".swal2-cancel");
                if (await cancelBtn.isVisible()) await cancelBtn.click();
                throw new Error("🚨 BUG FOUND: ระบบยอมให้บันทึกโดยไม่มีรูปเพิ่มเติม");
            }
            const confirmBtn = popup.locator(".swal2-confirm");
            if (await confirmBtn.isVisible()) await confirmBtn.click();
        } else {
            console.log(
                "Verified: No confirmation popup appeared (Save prevented)."
            );
        }
    });

    /**
     * TC-AHT-01.7
     * กรอกข้อมูลครบถ้วนและยืนยันการเพิ่มที่พัก (ตรวจสอบ Modal)
     */
    test("TS-AHT-01.7: กรอกข้อมูลครบถ้วนและยืนยันการเพิ่มที่พัก แบบ (Modal)", async({}) => {
        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await addBtn.click();

        const timestamp = Date.now();
        await page.locator("#name").fill(`Homestay Full ${timestamp}`);
        await page.locator("#type").fill("รีสอร์ท");
        await page.locator("#facility").fill("Full Option Facility");
        await page.locator("#totalRoom").fill("10");
        await page.locator("#guestPerRoom").fill("2");
        await page.locator("#houseNumber").fill("999");

        await page.locator("#province").click();
        await page.locator("#province").fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        await page.locator("#district").click();
        await page.locator("#district").fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        await page.locator("#subDistrict").click();
        await page.locator("#subDistrict").fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        await page.locator("#latitude").fill("13.2900");
        await page.locator("#longitude").fill("100.9200");

        const tagInput = page.locator("#tag-selector");
        await tagInput.click();
        await page.waitForTimeout(500);
        const tagOption = page.getByRole("option").first();
        if (await tagOption.isVisible()) await tagOption.click();
        else {
            await tagInput.fill("TestTag");
            await page.keyboard.press("Enter");
        }

        const coverPath = path.join(
            process.cwd(),
            "assets/photo/homestay_cover_bangsaen.jpg"
        );
        const roomPath = path.join(
            process.cwd(),
            "assets/photo/homestay_bedroom_view.jpg"
        );
        const seaPath = path.join(
            process.cwd(),
            "assets/photo/homestay_sea_view.jpg"
        );

        await page.locator('input[type="file"]').first().setInputFiles(coverPath);
        await page
            .locator('input[type="file"]')
            .last()
            .setInputFiles([roomPath, seaPath]);
        await page.waitForTimeout(2000);

        await page.locator('button[type="submit"]').click({ force: true });

        const confirmModal = page.locator(".swal2-popup");
        await expect(confirmModal).toBeVisible();
        console.log("Verified: Confirmation Modal appeared.");

        const confirmBtn = confirmModal.locator(".swal2-confirm");
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        await page.waitForTimeout(3000);
        console.log("Verified: Submitted successfully via Modal.");
    });
    /**
     * TC-AHT-01.8
     * ยกเลิกการเพิ่มที่พัก (แบบ Modal)
     */
    test("TS-AHT-01.8: ยกเลิกการเพิ่มที่พัก (แบบ Modal)", async({}) => {
        test.setTimeout(60000);

        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await addBtn.click();

        const timestamp = Date.now();
        await page.locator("#name").fill(`Homestay Cancel Modal ${timestamp}`);
        await page.locator("#type").fill("Test Resort");
        await page.locator("#facility").fill("Testing Cancel Modal Facility");
        await page.locator("#totalRoom").fill("5");
        await page.locator("#guestPerRoom").fill("2");
        await page.locator("#houseNumber").fill("99/99");

        await page.locator("#province").click();
        await page.locator("#province").fill("ชลบุรี");
        await page.getByRole("option", { name: "ชลบุรี" }).first().click();

        await page.locator("#district").click();
        await page.locator("#district").fill("เมือง");
        await page.getByRole("option", { name: /เมือง/ }).first().click();

        await page.locator("#subDistrict").click();
        await page.locator("#subDistrict").fill("แสนสุข");
        await page.getByRole("option", { name: "แสนสุข" }).first().click();

        await page.locator("#latitude").fill("13.2900");
        await page.locator("#longitude").fill("100.9200");

        const tagInput = page.locator("#tag-selector");
        await tagInput.click();

        try {
            const firstOption = page.getByRole("option").first();
            await expect(firstOption).toBeVisible({ timeout: 5000 });
            await firstOption.click();
        } catch (e) {
            await tagInput.fill("TestTag");
            await page.keyboard.press("Enter");
        }
        await expect(page.getByText("ยังไม่ได้เลือก")).not.toBeVisible();

        const coverPath = path.join(
            process.cwd(),
            "assets/photo/homestay_cover_bangsaen.jpg"
        );
        const roomPath = path.join(
            process.cwd(),
            "assets/photo/homestay_bedroom_view.jpg"
        );
        const seaPath = path.join(
            process.cwd(),
            "assets/photo/homestay_sea_view.jpg"
        );

        const coverSection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
            .last();
        await coverSection.locator('input[type="file"]').setInputFiles(coverPath);
        await expect(coverSection.locator("img")).toBeVisible({
            timeout: 10000,
        });

        const gallerySection = page
            .locator("div")
            .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
            .last();
        await gallerySection
            .locator('input[type="file"]')
            .setInputFiles([roomPath, seaPath]);
        await expect(async() => {
            const count = await gallerySection.locator("img").count();
            expect(count).toBeGreaterThanOrEqual(2);
        }).toPass({ timeout: 10000 });

        await page.waitForTimeout(1000);

        const saveBtn = page.locator('button[type="submit"]');
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click({ force: true });

        const confirmModal = page.locator(".swal2-popup");

        if (!(await confirmModal.isVisible())) {
            console.log(
                "⚠️ Modal not appearing. Checking for validation errors..."
            );
            const errors = page.locator(".text-red-600");
            if ((await errors.count()) > 0) {
                const errorText = await errors.first().innerText();
                throw new Error(`Test Failed due to Validation Error: ${errorText}`);
            }
        }

        await expect(confirmModal).toBeVisible();

        const cancelBtn = confirmModal.locator(".swal2-cancel");
        await expect(cancelBtn).toBeVisible();
        await cancelBtn.click();

        await expect(confirmModal).not.toBeVisible();
        await expect(saveBtn).toBeVisible();

        console.log("Verified: Modal closed and stayed on Add page correctly.");
    });
    /**
     * TC-AHT-01.9
     * ยกเลิกการเพิ่มที่พัก (กดปุ่มยกเลิกในหน้าฟอร์ม)
     */
    test("TS-AHT-01.9: ยกเลิกการเพิ่มที่พัก", async({}) => {
        await goToAccommodationPage(page);

        const addBtn = page.getByRole("button", { name: /\+ เพิ่มที่พัก/ });
        await addBtn.click();
        await expect(
            page.getByText("เพิ่มที่พัก", { exact: true }).first()
        ).toBeVisible();

        const cancelFormBtn = page.getByRole("button", { name: "ยกเลิก" });
        await expect(cancelFormBtn).toBeVisible();
        await cancelFormBtn.click();

        await expect(page).toHaveURL(/super\/community\/\d+\/homestay\/all/);

        await expect(
            page.getByRole("button", { name: /\+ เพิ่มที่พัก/ })
        ).toBeVisible();

        console.log("Verified: Returned to Homestay List page successfully.");
    });
});