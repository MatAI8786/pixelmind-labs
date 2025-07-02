import { Handle, NodeProps, Position } from 'reactflow';

export default function TriggerNode({ data }: NodeProps<{ label: string }>) {
  return (
    <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-sm px-2 py-1 text-sm dark:text-white">
      <div className="font-bold text-center">{data.label || 'Trigger'}</div>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
