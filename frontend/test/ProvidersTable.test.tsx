import { render, screen, waitFor } from '@testing-library/react';
import ProvidersTable from '../src/components/ProvidersTable';

const mockList = [
  { provider: 'openai', status: 'ok', last_checked: '2024-01-01T00:00:00Z', last_error: null },
];

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(mockList) })
) as jest.Mock;

test('renders providers from /api/providers', async () => {
  render(<ProvidersTable />);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/providers'));
  await waitFor(() => expect(screen.getByText('openai')).toBeInTheDocument());
});

test('retest updates status to Healthy', async () => {
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(mockList) })
  );
  render(<ProvidersTable />);
  await waitFor(() => screen.getByText('openai'));
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
  );
  (fetch as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([{ ...mockList[0], status: 'ok' }]) })
  );
  screen.getByRole('button', { name: /test/i }).click();
  await waitFor(() => expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining('/providers/openai/test'), expect.anything()));
});
