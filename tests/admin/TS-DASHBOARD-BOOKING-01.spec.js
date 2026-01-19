import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToReportPage - ฟังก์ชันสำหรับไปยังหน้ารายงาน
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. คลิกเมนู "รายงาน"
 *   2. รอให้ URL เปลี่ยนไปยังหน้ารายงาน
 * Output:
 *   - browser จะแสดงหน้ารายงาน
 */
async function goToReportPage(page) {
    const reportSidebar = page.getByRole("link", { name: "รายงาน" });
    await expect(reportSidebar).toBeVisible();
    await reportSidebar.click();
    await expect(page).toHaveURL(/admin\/dashboard/);
}

async function selectFilterMode(page, container, modeName) {
    const dropdownTrigger = container.locator('button').filter({ hasText: /รายสัปดาห์|รายเดือน|รายปี/ }).last();
    await expect(dropdownTrigger).toBeVisible();
    await dropdownTrigger.click();
    const option = page.locator('div[role="tooltip"], div[role="menu"], .dropdown-content, body')
        .getByText(modeName, { exact: true }).last();
    await expect(option).toBeVisible();
    await option.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
}

async function getTotalBookingsFromHistory(page) {
    await page.getByRole('link', { name: 'จัดการการจอง' }).click();
    const historyLink = page.getByRole('link', { name: 'ประวัติการจอง' }).or(page.getByRole('button', { name: 'ประวัติการจอง' }));
    await expect(historyLink).toBeVisible();
    await historyLink.click();
    await expect(page).toHaveURL(/admin\/bookings-histories\/all/);
    await page.waitForLoadState('networkidle');

    // Filter by "จองสำเร็จ"
    const filterButton = page.locator('button').filter({ hasText: /สถานะ|Status/ }).last();
    if (await filterButton.isVisible()) {
        await filterButton.click();
        const successOption = page.getByRole('option', { name: 'จองสำเร็จ' })
            .or(page.getByRole('menuitem', { name: 'จองสำเร็จ' }))
            .or(page.getByText('จองสำเร็จ', { exact: true }));
        if (await successOption.isVisible()) await successOption.click();
    } else {
        const successTab = page.locator('div[role="tab"]').filter({ hasText: 'จองสำเร็จ' });
        if (await successTab.isVisible()) await successTab.click();
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);


    let count = 0;
    const totalTextPattern = /ทั้งหมด\s*(\d+)\s*รายการ/;
    const totalElement = page.getByText(totalTextPattern).first();
    if (await totalElement.isVisible()) {
        const text = await totalElement.innerText();
        const match = text.match(totalTextPattern);
        if (match) count = parseInt(match[1]);
    } else {
        count = await page.locator('tbody tr').count();
    }

    let revenue = 0;
    // Common headers: "ราคา", "ราคาที่ชำระ", "ยอดรวม", "Price", "Amount"
    const headers = page.locator('thead th');
    const headerCount = await headers.count();
    let priceColIndex = -1;

    for (let i = 0; i < headerCount; i++) {
        const headerText = await headers.nth(i).innerText();
        if (/ราคา|Price|Amount|ยอดเงิน/.test(headerText)) {
            priceColIndex = i;
            break;
        }
    }

    if (priceColIndex !== -1) {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            const cell = rows.nth(i).locator('td').nth(priceColIndex);
            const cellText = await cell.innerText();
            // Remove '฿', ',', whitespace
            const value = parseFloat(cellText.replace(/[฿,]/g, '').trim());
            if (!isNaN(value)) {
                revenue += value;
            }
        }
    } else {
        console.warn("Could not identify Price column. Revenue verification in test might fail.");
    }

    return { count, revenue };
}

test.describe("Admin - Dashboard & Booking Report", () => {
    test.describe("Authorized Admin Tests", () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, "admin");
            await expect(page).toHaveURL(/admin\/community\/own/);
        });

        test("TC-REPORT-BOOKING-01.1: Admin can view Report page and verify total bookings & revenue matches History", async ({ page }) => {
            const stats = await getTotalBookingsFromHistory(page);
            console.log(`History Page -> Count: ${stats.count}, Revenue: ${stats.revenue}`);

            await goToReportPage(page);

            // Verify Count
            const summaryCard = page.locator('div').filter({ has: page.getByText('การจองสำเร็จ') }).last();
            await expect(summaryCard).toBeVisible();
            const summaryText = await summaryCard.innerText();
            const match = summaryText.match(/(\d+)\s*ครั้ง/);
            let displayedTotal = match ? parseInt(match[1]) : 0;
            if (!match) {
                const digits = summaryText.match(/(\d+)/g);
                if (digits) displayedTotal = parseInt(digits[0]);
            }
            console.log(`Dashboard -> Count: ${displayedTotal}`);
            expect(displayedTotal).toBe(stats.count);

            const revenueSection = page.locator('div').filter({ has: page.getByText(/^รายได้ทั้งหมด$/) }).last();
            await expect(revenueSection).toBeVisible();
            const revenueTextBlock = await revenueSection.innerText(); // Likely contains "รายได้ทั้งหมด\n5,997\nบาท"

            const revenueMatch = revenueTextBlock.match(/([0-9,]+)(\.\d{2})?/); // Matches 5,997 or 5,997.00
            let displayedRevenue = 0;
            if (revenueMatch) {
                displayedRevenue = parseFloat(revenueMatch[0].replace(/,/g, ''));
            }

            console.log(`Dashboard -> Revenue: ${displayedRevenue}`);

            expect(Math.abs(displayedRevenue - stats.revenue)).toBeLessThan(1.0);
        });

        test("TC-REPORT-BOOKING-01.2: Graph shows booking trends and revenue", async ({ page }) => {
            await goToReportPage(page);

            // Card 1: Stats
            const heading1 = page.getByRole('heading', { name: 'สถิติการจองแพ็กเกจ' });
            let headerWrapper1 = page.locator('div').filter({ has: heading1 }).last();
            const graphContainer1 = headerWrapper1.locator('xpath=../..');

            await expect(graphContainer1).toBeVisible();
            await expect(graphContainer1.locator('img, canvas').last()).toBeVisible();

            await selectFilterMode(page, graphContainer1, 'รายเดือน');
            await selectFilterMode(page, graphContainer1, 'รายปี');
            await selectFilterMode(page, graphContainer1, 'รายสัปดาห์');

            // Card 2: Revenue
            const heading2 = page.getByRole('heading', { name: 'รายได้จากการจองแพ็กเกจทั้งหมด' });
            let headerWrapper2 = page.locator('div').filter({ has: heading2 }).last();
            // Strategy: Try 1 level up. If valid, good. 
            const graphContainer2 = headerWrapper2.locator('xpath=..');

            await expect(graphContainer2).toBeVisible();
            await expect(graphContainer2.locator('img, canvas').last()).toBeVisible();

            // Test filters on Graph 2 (Revenue)
            await selectFilterMode(page, graphContainer2, 'รายเดือน');
            await selectFilterMode(page, graphContainer2, 'รายปี');
            await selectFilterMode(page, graphContainer2, 'รายสัปดาห์');
        });

        test("TC-REPORT-BOOKING-01.3: Top 20 Package list sequence and counts", async ({ page }) => {
            await goToReportPage(page);

            const topPackageSection = page.locator('div')
                .filter({ has: page.getByRole('heading', { name: '20 แพ็กเกจที่มีการจองสูงสุด' }) })
                .last();
            const container = topPackageSection.locator('xpath=..'); // Header -> Card

            await expect(container).toBeVisible();

            await selectFilterMode(page, container, 'รายเดือน');
            await selectFilterMode(page, container, 'รายปี');
            await selectFilterMode(page, container, 'รายสัปดาห์');

            const rows = container.locator('tbody tr');
            const rowCount = await rows.count();

            if (rowCount > 0) {
                await expect(container.getByRole('columnheader', { name: 'อันดับ' })).toBeVisible();
                await expect(container.getByRole('columnheader', { name: 'ชื่อแพ็กเกจ' })).toBeVisible();
                const firstRank = await rows.first().locator('td').first().innerText();
                expect(parseInt(firstRank.trim())).toBe(1);
            } else {
                const graphImg = container.locator('img, canvas').last();
                if (await graphImg.isVisible()) {
                    await expect(graphImg).toBeVisible();
                } else {
                    throw new Error("Top 20 Package section is empty.");
                }
            }
        });
    });

    test("TC-REPORT-BOOKING-01.4: Non-Admin user cannot access Report page (Redirect to login)", async ({ page }) => {
        await page.goto("http://localhost:4000/admin/dashboard");
        await expect(page).toHaveURL(/login/);
    });
});