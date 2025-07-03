import { render, screen } from '@testing-library/react';
import LLMNodePanel from './LLMNodePanel';

test('renders panel text', () => {
  render(<LLMNodePanel />);
  expect(screen.getByText(/LLM Node Panel/i)).toBeInTheDocument();
});
