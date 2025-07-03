import { render, screen } from '@testing-library/react';
import LLMNodePanel from './LLMNodePanel';

test('renders test button', () => {
  render(<LLMNodePanel />);
  expect(screen.getByRole('button', { name: /test node/i })).toBeInTheDocument();
});
