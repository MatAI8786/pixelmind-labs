import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

export function AggregatorNode({ data }: any) {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 5, background: '#f0fff0' }}>
      <strong>Aggregator</strong>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
