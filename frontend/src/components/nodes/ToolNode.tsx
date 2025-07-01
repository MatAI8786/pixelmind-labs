import { Handle, NodeProps, Position } from 'reactflow';

export interface ToolNodeData {
  title: string;
  tool: string;
}

export default function ToolNode({ data }: NodeProps<ToolNodeData>) {
  return (
    <div className="bg-white border rounded shadow-sm px-2 py-1 text-sm">
      <div className="font-bold text-center">{data.title || 'Tool'}</div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}
