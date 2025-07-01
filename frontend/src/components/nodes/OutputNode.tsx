import { Handle, NodeProps, Position } from 'reactflow';

export interface OutputNodeData {
  title: string;
}

export default function OutputNode({ data }: NodeProps<OutputNodeData>) {
  return (
    <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-sm px-2 py-1 text-sm dark:text-white">
      <div className="font-bold text-center">{data.title || 'Output'}</div>
      <Handle type="target" position={Position.Left} id="in" />
    </div>
  );
}
