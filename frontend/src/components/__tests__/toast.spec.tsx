import { render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import toast, { Toaster } from 'react-hot-toast';

test('Toaster mounts & toast fires', async () => {
  render(<Toaster />);
  act(() => {
    toast('hi');
  });
  await waitFor(() => {
    const status = document.querySelector('[role="status"]');
    expect(status).toBeTruthy();
  });
});
