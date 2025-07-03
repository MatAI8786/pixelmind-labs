export const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function listWorkflows() {
  const res = await fetch(`${baseUrl}/api/workflows/list`);
  if (!res.ok) throw new Error('Failed to list workflows');
  return res.json();
}

export async function saveWorkflow(payload: { name: string; nodes: any[]; edges: any[] }) {
  const res = await fetch(`${baseUrl}/api/workflows/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Save failed');
  return res.json();
}
