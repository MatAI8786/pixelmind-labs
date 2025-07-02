import { render } from '@testing-library/react';
import BuilderPage from '../src/pages/builder';
import { useWorkflowStore } from '../src/state/workflowStore';
import { act } from 'react-dom/test-utils';

test('builder renders and store updates', () => {
  render(<BuilderPage />);
  const { setNodes } = useWorkflowStore.getState();
  act(() => {
    setNodes([{ id: '1', type: 'trigger', position: { x: 0, y: 0 }, data: {} }]);
  });
  expect(useWorkflowStore.getState().nodes).toHaveLength(1);
});
