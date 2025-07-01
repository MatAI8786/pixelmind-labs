import { Handle, NodeProps, Position } from 'reactflow';

export interface InputNodeData {
  title: string;
  value: string;
}

export default function InputNode({ data }: NodeProps<InputNodeData>) {
  return (
    <div className="bg-white border rounded shadow-sm px-2 py-1 text-sm">
      <div className="font-bold text-center">{data.title || 'Input'}</div>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
