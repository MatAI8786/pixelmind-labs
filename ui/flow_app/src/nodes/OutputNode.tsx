import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

export function OutputNode() {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 5, background: '#ffe6e6' }}>
      <strong>Output</strong>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
