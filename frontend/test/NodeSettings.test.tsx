import { render, screen, waitFor } from '@testing-library/react';
import NodeSettings from '../src/components/NodeSettings';

const mockList = [
  { provider: 'openai', health: 'ok', checked_at: '2024-01-01T00:00:00Z', last_error: null },
];

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(mockList) })
) as jest.Mock;

test('renders providers from /api/keys/list', async () => {
  render(<NodeSettings />);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/keys/list'));
  await waitFor(() => expect(screen.getByText('openai')).toBeInTheDocument());
});

test('retest updates status to Healthy', async () => {
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(mockList) })
  );
  render(<NodeSettings />);
  await waitFor(() => screen.getByText('openai'));
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
  );
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([{ ...mockList[0], health: 'ok' }]) })
  );
  screen.getByRole('button', { name: /retest/i }).click();
  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining('/providers/openai/test'), expect.anything()));
});
