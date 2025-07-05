import { test, expect } from "@playwright/test";

test("Save workflow pops success toast", async ({ page }) => {
  await page.route("**/api/workflows/save", async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ id: "toast" }) });
  });
  await page.route("**/api/workflows/list", (route) =>
    route.fulfill({ status: 200, body: "[]" }),
  );

  await page.goto("http://localhost:3000");
  await page.evaluate(() => {
    window.prompt = () => "toast-e2e";
  });

  await page.getByRole("button", { name: "Save Workflow" }).click();
  await expect(page.locator(".react-hot-toast")).toContainText("Saved", {
    timeout: 10000,
  });
});
