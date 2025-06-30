import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

export function LLMNode({ data }: any) {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 5, background: '#e8f0fe' }}>
      <strong>{data.provider}</strong>
      <div style={{ fontSize: 12 }}>{data.model}</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
