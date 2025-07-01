import { Handle, NodeProps, Position } from 'reactflow';

export interface ToolNodeData {
  title: string;
  tool: string;
}

export default function ToolNode({ data }: NodeProps<ToolNodeData>) {
  return (
    <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-sm px-2 py-1 text-sm dark:text-white">
      <div className="font-bold text-center">{data.title || 'Tool'}</div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
