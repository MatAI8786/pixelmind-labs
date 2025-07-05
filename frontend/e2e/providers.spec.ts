import { test, expect } from '@playwright/test';

const drag = async (page, source, target) => {
  const box = await source.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const tbox = await target.boundingBox();
  await page.mouse.move(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
  await page.mouse.up();
};

test('LLM to Input workflow persists and provider test works', async ({ page }) => {
  let saved: any = null;
  await page.route('**/api/workflows/save', async (route, request) => {
    saved = await request.postDataJSON();
    await route.fulfill({ status: 200, body: JSON.stringify({ id: '1' }) });
  });
  await page.route('**/api/workflows/1', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify(saved) });
  });

  await page.goto('/');
  await page.evaluate(() => {
    window.prompt = () => 'e2e';
    document.querySelectorAll('[draggable]').forEach((el: Element) => {
      el.addEventListener('dragstart', (e) => {
        const dt = (e as DragEvent).dataTransfer;
        if (dt) dt.setData('application/reactflow', el.textContent!.trim().toLowerCase());
      });
    });
  });

  const llm = page.locator('aside >> text=LLM');
  const input = page.locator('aside >> text=Input');
  const canvas = page.locator('main');

  await llm.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });
  await input.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });

  const source = page.locator('.react-flow__node-llm .react-flow__handle.source');
  const target = page.locator('.react-flow__node-input .react-flow__handle.target');
  await drag(page, source, target);

  await page.getByRole('button', { name: 'Save Workflow' }).click();
  await expect(page.locator('.react-hot-toast')).toHaveCount(1);

  await page.reload();
  await page.waitForResponse(/\/api\/providers/);

  await expect(page.locator('.react-flow__edge-path')).toHaveCount(1);

  await page.goto('/settings');
  await page.waitForResponse(/\/api\/providers/);

  await page.route('**/api/providers/openai/test', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  });

  await page.getByRole('button', { name: 'Test' }).first().click();
  await page.waitForResponse(/\/api\/providers\/openai\/test/);
});
