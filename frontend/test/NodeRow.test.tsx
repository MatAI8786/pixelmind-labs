import { render, screen } from '@testing-library/react';
import NodeRow from '../src/components/NodeRow';

const item = {
  provider: 'openai',
  has_key: true,
  health: 'ok',
  last_error: null,
  checked_at: 'now',
};

test('renders provider row with LED and button', () => {
  render(
    <table>
      <tbody>
        <NodeRow item={item} onClick={() => {}} />
      </tbody>
    </table>,
  );
  expect(screen.getByText('openai')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
  const row = screen.getByTestId('node-row');
  expect(row.querySelector('span')).toBeTruthy();
});
