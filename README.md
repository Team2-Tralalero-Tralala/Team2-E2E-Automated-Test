# Team2-E2E-Automated-Test

🧪 Playwright – End-to-End Testing
This project uses Playwright for End-to-End (E2E) testing to ensure the system works correctly across real browser environments, including Chromium

# Playwright Installation
  - npm install
  - npx playwright install

# Common Playwright Commands
  Run all tests
  - npx playwright test

  Run tests in UI mode
  - npx playwright test --ui

  Run a specific test file
  - npx playwright test tests/login.spec.ts

  Re-run only failed tests
  - npx playwright test --last-failed

  View HTML test report
  - npx playwright show-report
  
  Run a specific test file with visible browser
  - npx playwright test tests/login.spec.ts --headed
  
  Run all tests with visible browser
  - npx playwright test --headed

  Run tests slowly to observe actions clearly
  - npx playwright test tests/login.spec.ts --headed --slow-mo=500

# Test File Naming (Scenario ID)
Test files are named using the Scenario ID, making the test scope immediately clear from the file name.
  
  - Format : <scenario-id>.spec.ts
  - Examples : TS-Login-01.spec.ts

# Test Case Structure Within a Scenario File
Inside each scenario file, multiple test cases are defined to cover different paths or conditions of the same scenario.
Each test case includes a unique sub-ID for clear identification.

  - Example : 
  test.describe("TS-Login-01: User Login Scenario", () => {
  
  test("TS-Login-01.1: User login successfully", async ({ page }) => {
    // test steps
  });

  test("TS-Login-01.2: Login with invalid password", async ({ page }) => {
    // test steps
  });
});

# Playwright Config
// @ts-check
const { defineConfig, devices } = require("@playwright/test");
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from "dotenv";
// import path from 'path';
dotenv.config({ path: ".env" });

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4000";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',
    baseURL: baseURL,
    headless: true,
    slowMo: 1000000,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "on",
    viewport: { width: 1280, height: 720 },
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    /*
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

# Test Case Structure Within a Scenario File
