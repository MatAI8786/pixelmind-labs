import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

export function PersonaSelectorNode({ data }: any) {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 5, background: '#f9f9f9' }}>
      <strong>Persona</strong>
      <select defaultValue={data.selected} style={{ width: '100%' }}>
        {data.personalities.map((p: string) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
