import { render, screen } from '@testing-library/react';
import NodeRow from '../src/components/NodeRow';

const item = {
  provider: 'openai',
  status: 'ok',
  last_error: null,
  last_checked: 'now',
};

test('renders provider row with LED and button', () => {
  render(
    <table>
      <tbody>
        <NodeRow item={item} onClick={() => {}} onRetest={() => {}} />
      </tbody>
    </table>,
  );
  const cells = screen.getAllByRole('cell');
  expect(cells[0]).toHaveTextContent('openai');
  expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /retest/i })).toBeInTheDocument();
  const row = screen.getByTestId('node-row');
  expect(row.querySelector('span')).toBeTruthy();
});
