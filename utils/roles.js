import { users } from "./test-users.js";
import { LoginPage } from "../pages/auth/LoginPage.js";
import { expect } from "@playwright/test";

/**
 * ฟังก์ชัน loginAs
 * ทำหน้าที่ล็อกอินโดยใช้ role ของผู้ใช้งาน
 * @param {Page} page - Playwright page object
 * @param {string} role - ชื่อ role ของผู้ใช้งาน (เช่น "superadmin", "member")
 */
export async function loginAs(page, role) {
  const user = users[role];

  if (!user) throw new Error(`Unknown role: ${role}`);
  if (!user.email || !user.password)
      throw new Error(`Missing credentials for role: ${role}`);

  const loginPage = new LoginPage(page);
  await loginPage.goto(user.loginPath);
  await loginPage.login(user.email, user.password);

  await expect(page).toHaveURL(new RegExp(user.redirectTo));
}
