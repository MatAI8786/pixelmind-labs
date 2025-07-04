import { test, expect } from "@playwright/test";

const drag = async (page, source, target) => {
  const box = await source.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const tbox = await target.boundingBox();
  await page.mouse.move(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
  await page.mouse.up();
};

test("smoke settings and builder flow", async ({ page }) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  await page.route("**/api/providers", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify([{ provider: "Google", status: "ok" }]),
    });
  });
  await page.route("**/api/providers/Google/test", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/settings");
  await expect(page.locator("tbody tr")).toContainText("Google");
  await page.getByRole("button", { name: "Test" }).click();
  await expect(page.locator("pre")).toContainText('"success": true');

  let saved: any = null;
  await page.route("**/api/workflows/save", async (route, request) => {
    saved = await request.postDataJSON();
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "5" }),
    });
  });
  await page.route("**/api/workflows/5", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify(saved),
    });
  });
  await page.route("**/api/workflows/list", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify([{ id: "5", name: "smoke-5" }]),
    });
  });

  await page.goto("/?wid=new");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    // override prompt for saving workflow
    window.prompt = () => "smoke-5";
    document.querySelectorAll("[draggable]").forEach((el: Element) => {
      el.addEventListener("dragstart", (e) => {
        const dt = (e as DragEvent).dataTransfer;
        if (dt)
          dt.setData(
            "application/reactflow",
            el.textContent!.trim().toLowerCase(),
          );
      });
    });
  });

  const llm = page.locator("aside >> text=LLM");
  const input = page.locator("aside >> text=Input");
  const output = page.locator("aside >> text=Output");
  const canvas = page.locator("main");

  await expect(llm).toBeVisible();
  await expect(input).toBeVisible();
  await expect(output).toBeVisible();

  await llm.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });
  await page.getByRole('button', { name: '×' }).click();
  await input.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
  await page.getByRole('button', { name: '×' }).click();
  await output.dragTo(canvas, { targetPosition: { x: 600, y: 200 } });
  await page.getByRole('button', { name: '×' }).click();

  const src1 = page.locator(".react-flow__node-llm .react-flow__handle.source");
  const tgt1 = page.locator(
    ".react-flow__node-input .react-flow__handle.target",
  );
  const src2 = page.locator(
    ".react-flow__node-input .react-flow__handle.source",
  );
  const tgt2 = page.locator(
    ".react-flow__node-output .react-flow__handle.target",
  );

  await drag(page, src1, tgt1);
  await drag(page, src2, tgt2);

  await page.getByRole("button", { name: "Save Workflow" }).click();
  await expect(page.getByText("Saved")).toBeVisible();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.getByRole('button', { name: 'Workflows' }).click();
  await page.getByRole('button', { name: 'smoke-5' }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(3);
});
